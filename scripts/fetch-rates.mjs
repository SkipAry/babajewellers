#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────
 *  Fetch gold & silver rates from GoldAPI.io and publish them.
 *
 *  Runs in GitHub Actions, never in the browser. The API key comes from
 *  the GOLDAPI_KEY secret and is never written to any output file.
 *
 *  Writes two files:
 *    public/rates.json      public card data only — served to visitors
 *    data/rates-state.json  raw rates, quota counter, 90-day history
 *                           (committed, but NOT inside public/, so it is
 *                            never served)
 *
 *  Usage:
 *    node scripts/fetch-rates.mjs            fetch and publish
 *    node scripts/fetch-rates.mjs --selftest run the maths checks, no network
 * ─────────────────────────────────────────────────────────────
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_FILE = resolve(ROOT, "public/rates.json");
const STATE_FILE = resolve(ROOT, "data/rates-state.json");

const TROY_OUNCE_IN_GRAMS = 31.1034768;
const MONTHLY_LIMIT = 90; // free plan is 100; stop early with headroom
const ANOMALY_THRESHOLD = 0.2; // reject a >20% jump vs the last good rate
const TIMEOUT_MS = 15000;
const HISTORY_LIMIT = 90;

/* ── maths (mirrors src/data/rates-config.ts) ───────────────── */

function roundRate(value, increment) {
  if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid rate");
  if (!Number.isFinite(increment) || increment <= 0)
    throw new Error("Invalid rounding increment");
  return Math.round(value / increment) * increment;
}

function calculatePublishedRate(raw, markupPct, flat, includeGST, gstPct, increment) {
  let v = raw * (1 + markupPct / 100);
  v += flat;
  if (includeGST) v *= 1 + gstPct / 100;
  return roundRate(v, increment);
}

/* ── config: read the TS file without a TS toolchain ─────────
   The config is plain literals, so pulling the values out with a regex
   is enough and avoids adding ts-node or a build step to CI. */

function readConfig() {
  const src = readFileSync(resolve(ROOT, "src/data/rates-config.ts"), "utf8");
  const block = src.split("export const ratesConfig")[1] ?? "";
  const num = (key, fallback) => {
    const m = block.match(new RegExp(`${key}\\s*:\\s*(-?[\\d.]+)`));
    return m ? Number(m[1]) : fallback;
  };
  const bool = (key, fallback) => {
    const m = block.match(new RegExp(`${key}\\s*:\\s*(true|false)`));
    return m ? m[1] === "true" : fallback;
  };
  const str = (key, fallback) => {
    const m = block.match(new RegExp(`${key}\\s*:\\s*"([^"]*)"`));
    return m ? m[1] : fallback;
  };
  return {
    goldMarkupPercentage: num("goldMarkupPercentage", 0),
    gold24kFlatAdjustment: num("gold24kFlatAdjustment", 0),
    gold22kFlatAdjustment: num("gold22kFlatAdjustment", 0),
    gold18kFlatAdjustment: num("gold18kFlatAdjustment", 0),
    goldPurityFactor22k: num("goldPurityFactor22k", 22 / 24),
    goldPurityFactor18k: num("goldPurityFactor18k", 18 / 24),
    silverMarkupPercentage: num("silverMarkupPercentage", 0),
    silverFlatAdjustment: num("silverFlatAdjustment", 0),
    goldRoundingIncrement: num("goldRoundingIncrement", 1),
    silverRoundingIncrement: num("silverRoundingIncrement", 1),
    includeGST: bool("includeGST", false),
    gstPercentage: num("gstPercentage", 3),
    benchmarkEnabled: bool("benchmarkEnabled", false),
    benchmarkUrl: str("benchmarkUrl", ""),
    benchmarkUndercut24k: num("benchmarkUndercut24k", 0),
    benchmarkUndercutSilver: num("benchmarkUndercutSilver", 0),
    benchmarkMaxAgeDays: num("benchmarkMaxAgeDays", 4),
    benchmarkMaxDeviation: num("benchmarkMaxDeviation", 0.15),
  };
}

/* ── India time ─────────────────────────────────────────────── */

const IST_OFFSET = "+05:30";

/** "YYYY-MM-DD" in Asia/Kolkata — used as the daily idempotency key. */
function istDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

const istMonth = (d = new Date()) => istDate(d).slice(0, 7);

/** ISO timestamp carrying the +05:30 offset, not a UTC "Z". */
function istISO(d = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    })
      .formatToParts(d)
      .filter((x) => x.type !== "literal")
      .map((x) => [x.type, x.value])
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${IST_OFFSET}`;
}

/* ── state ──────────────────────────────────────────────────── */

const EMPTY_STATE = {
  raw: null,
  usage: { month: istMonth(), requestCount: 0, lastAttemptAt: null, lastSuccessAt: null },
  lastRunDate: null,
  configHash: null,
  history: [],
};

/* Fingerprint of every setting that changes the published number. Sorted so
   that reordering keys in the config file is not mistaken for a real change. */
function configHash(cfg) {
  const stable = Object.keys(cfg)
    .sort()
    .map((k) => `${k}=${cfg[k]}`)
    .join("|");
  return createHash("sha256").update(stable).digest("hex").slice(0, 12);
}

function readJSON(file, fallback) {
  try {
    return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/* ── fetching ───────────────────────────────────────────────── */

async function fetchMetal(symbol, key) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://www.goldapi.io/api/${symbol}/INR`, {
      headers: { "x-access-token": key },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || typeof json !== "object") throw new Error("Malformed JSON");
    return json;
  } finally {
    clearTimeout(timer);
  }
}

const positive = (n) => Number.isFinite(n) && n > 0;

/** Per-gram 24K equivalent, falling back to the troy-ounce price. */
function perGram(payload) {
  if (positive(payload?.price_gram_24k)) return payload.price_gram_24k;
  if (positive(payload?.price)) return payload.price / TROY_OUNCE_IN_GRAMS;
  return null;
}

/**
 * When the QUOTE was struck, from the API's own timestamp — not when we asked.
 *
 * Spot markets are shut at weekends and on holidays, so a Sunday fetch returns
 * Friday's close. Stamping such a rate "updated Sunday 7:02 am" tells a
 * customer the price is current when it is two days old, and makes an
 * unchanged rate look like a broken feed. GoldAPI returns unix seconds.
 */
function sourceTimestamp(payload) {
  const t = payload?.timestamp;
  if (!Number.isFinite(t) || t <= 0) return null;
  const ms = t > 1e11 ? t : t * 1000; // tolerate seconds or milliseconds
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  // Reject anything absurd (clock skew, a bad field) rather than trusting it.
  const skewHours = (Date.now() - ms) / 36e5;
  if (skewHours < -24 || skewHours > 24 * 14) return null;
  return istISO(d);
}

/** Reject a rate that moved more than 20% from the last good one. */
function anomalous(next, prev) {
  if (!positive(prev)) return false;
  return Math.abs(next - prev) / prev > ANOMALY_THRESHOLD;
}

/* ── benchmark: PNG Jewellers' published board ────────────────
   Their rates sit in the SERVER HTML (verified 15 Nov 2026 with a plain
   fetch, no JS), so this needs no browser. Two renderings of the same
   numbers appear on the page — a list ("24K Gold ₹13657") and a card
   grid ("24KT **₹13657/g**") — and we read the list form, falling back
   to the card form.

   ⚠ Everything this returns is UNTRUSTED. It is a third party's page and
   it can change shape, go blank, or carry a typo. We have already seen
   their rate widget render blanks and four contradictory numbers across
   their own site. Nothing here is published until validateBenchmark()
   has checked it against our own independently-fetched spot price. */

function parseBenchmark(html) {
  const text = String(html).replace(/<[^>]+>/g, " ").replace(/&nbsp;?/g, " ");
  const pick = (labels) => {
    for (const label of labels) {
      /* Tolerate markup turned into whitespace between the label and the
         figure, but allow NO digits in the gap — otherwise "24K" could
         skip past its own price and bind to a later one. */
      const m = text.match(new RegExp(label + "[^\\d₹]{0,40}₹\\s*([\\d,]+)", "i"));
      if (m) {
        const n = Number(m[1].replace(/,/g, ""));
        if (Number.isFinite(n) && n > 0) return n;
      }
    }
    return null;
  };
  const stamp = text.match(
    /Updated on\s+[A-Za-z]+,\s*([A-Za-z]+ \d{1,2}, \d{4})\s*at\s*([\d:]+\s*[AP]M)/i
  );
  return {
    gold24k: pick(["24KT", "24K"]),
    gold22k: pick(["22KT", "22K"]),
    gold18k: pick(["18KT", "18K"]),
    silver999: pick(["Silver"]),
    updatedOn: stamp ? `${stamp[1]} ${stamp[2]}` : null,
    updatedOnDate: stamp ? stamp[1] : null,
  };
}

/** Reject anything that is not obviously a sane board. Returns a reason
    string when the figures must NOT be used, or null when they are good. */
function validateBenchmark(b, spotDerived, cfg, todayIst) {
  if (!b) return "no response";
  for (const k of ["gold24k", "gold22k", "gold18k", "silver999"]) {
    if (!positive(b[k])) return `missing or unparsable ${k}`;
  }
  // Ordering and rough purity sanity — catches reading the wrong numbers.
  if (!(b.gold24k > b.gold22k && b.gold22k > b.gold18k)) return "purities out of order";
  const r22 = b.gold22k / b.gold24k;
  const r18 = b.gold18k / b.gold24k;
  if (r22 < 0.88 || r22 > 0.97) return `22K/24K ratio ${r22.toFixed(3)} implausible`;
  if (r18 < 0.72 || r18 > 0.85) return `18K/24K ratio ${r18.toFixed(3)} implausible`;
  if (b.silver999 > b.gold18k) return "silver above gold";

  // The real guard: their number must be close to OUR independently
  // fetched spot price. A decimal slip on their side cannot get through.
  const dev = Math.abs(b.gold24k - spotDerived.gold24k) / spotDerived.gold24k;
  if (dev > cfg.benchmarkMaxDeviation) {
    return `24K ₹${b.gold24k} is ${(dev * 100).toFixed(1)}% from our spot-derived ₹${spotDerived.gold24k}`;
  }

  // Staleness. Their stamp is their own; on a Sunday it legitimately
  // reads Saturday, and mirroring them means accepting that.
  if (!b.updatedOnDate) return "no 'Updated on' stamp";
  const theirs = new Date(`${b.updatedOnDate} 00:00:00Z`);
  if (Number.isNaN(theirs.getTime())) return `unparsable stamp "${b.updatedOnDate}"`;
  const ours = new Date(`${todayIst}T00:00:00Z`);
  const ageDays = Math.round((ours - theirs) / 86400000);
  if (ageDays < 0) return `stamp is in the future (${b.updatedOnDate})`;
  if (ageDays > cfg.benchmarkMaxAgeDays) return `stamp ${ageDays} days old (${b.updatedOnDate})`;
  return null;
}

async function fetchBenchmark(cfg) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(cfg.benchmarkUrl, {
      signal: ctrl.signal,
      headers: { "user-agent": "babajewellers-rates/1.0 (+https://babajewellers.co.in)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseBenchmark(await res.text());
  } finally {
    clearTimeout(timer);
  }
}

/* ── main ───────────────────────────────────────────────────── */

async function main() {
  const key = process.env.GOLDAPI_KEY;
  if (!key) {
    console.error("GOLDAPI_KEY is not set. Refusing to run.");
    process.exit(1);
  }

  const cfg = readConfig();
  const state = readJSON(STATE_FILE, EMPTY_STATE);
  const published = readJSON(PUBLIC_FILE, null);
  const today = istDate();
  const month = istMonth();

  // New calendar month in India resets the counter.
  if (state.usage.month !== month) {
    state.usage = { month, requestCount: 0, lastAttemptAt: null, lastSuccessAt: state.usage.lastSuccessAt ?? null };
  }

  /* Idempotency: one publish per India day, however often the job fires.
     Keyed on the date AND the config, because the published rate is a
     function of both. Keying on the date alone meant that changing a markup
     and re-running produced "already updated today" and silently kept
     publishing the old numbers — the job went green having done nothing. */
  const cfgHash = configHash(cfg);
  const cfgChanged = state.configHash !== cfgHash;
  if (state.lastRunDate === today && !cfgChanged && !process.argv.includes("--force")) {
    console.log(`Already updated for ${today} (IST) with this config. Nothing to do.`);
    return;
  }
  if (cfgChanged && state.lastRunDate === today) {
    console.log("Rate config changed since the last publish — re-fetching.");
  }

  if (state.usage.requestCount + 2 > MONTHLY_LIMIT) {
    console.error(
      `Monthly safety limit reached (${state.usage.requestCount}/${MONTHLY_LIMIT}). Skipping.`
    );
    process.exit(0);
  }

  state.usage.lastAttemptAt = istISO();
  state.usage.requestCount += 2; // counted whether or not they succeed

  // One call each, in parallel. Gold and silver succeed or fail apart.
  const [goldRes, silverRes] = await Promise.allSettled([
    fetchMetal("XAU", key),
    fetchMetal("XAG", key),
  ]);

  const prevRaw = state.raw ?? {};
  let raw = { ...prevRaw };
  let goldStatus = "error";
  let silverStatus = "error";

  if (goldRes.status === "fulfilled") {
    const g = goldRes.value;
    const g24 = perGram(g);
    if (!positive(g24)) {
      console.error("Gold: no usable per-gram price in response.");
    } else if (anomalous(g24, prevRaw.gold24k)) {
      console.error(
        `Gold: rejected, ${g24.toFixed(2)} differs >20% from ${prevRaw.gold24k}. Keeping previous.`
      );
    } else {
      /* Every purity is derived from 24K using the configured factors.
         GoldAPI's own price_gram_22k/18k fields are deliberately IGNORED:
         they are strict karat/24 of the 24K price, which is not how Indian
         jewellers quote. Trusting them put our 18K ₹440/g under the shop's
         own counter rate. One source of truth, and it is the config. */
      raw.gold24k = g24;
      raw.gold22k = g24 * cfg.goldPurityFactor22k;
      raw.gold18k = g24 * cfg.goldPurityFactor18k;
      raw.goldSourceUpdatedAt = sourceTimestamp(g) ?? istISO();
      goldStatus = "fresh";
    }
  } else {
    console.error("Gold request failed:", String(goldRes.reason?.message ?? goldRes.reason));
  }

  if (silverRes.status === "fulfilled") {
    const s = silverRes.value;
    const s999 = perGram(s);
    if (!positive(s999)) {
      console.error("Silver: no usable per-gram price in response.");
    } else if (anomalous(s999, prevRaw.silver999)) {
      console.error(
        `Silver: rejected, ${s999.toFixed(2)} differs >20% from ${prevRaw.silver999}. Keeping previous.`
      );
    } else {
      raw.silver999 = s999;
      raw.silverSourceUpdatedAt = sourceTimestamp(s) ?? istISO();
      silverStatus = "fresh";
    }
  } else {
    console.error("Silver request failed:", String(silverRes.reason?.message ?? silverRes.reason));
  }

  // A metal we could not refresh but still hold a previous value for is
  // "stale", not "error" — the number on screen is real, just older.
  if (goldStatus !== "fresh" && positive(raw.gold24k)) goldStatus = "stale";
  if (silverStatus !== "fresh" && positive(raw.silver999)) silverStatus = "stale";

  if (!positive(raw.gold24k) && !positive(raw.silver999)) {
    console.error("No usable rates and nothing stored previously. Leaving files untouched.");
    state.raw = raw;
    writeJSON(STATE_FILE, state);
    process.exit(1);
  }

  const g = (v, flat) =>
    calculatePublishedRate(
      v, cfg.goldMarkupPercentage, flat, cfg.includeGST, cfg.gstPercentage, cfg.goldRoundingIncrement
    );

  /* Spot-derived figures. These are published as-is when the benchmark is
     unavailable, and are ALSO the yardstick the benchmark is validated
     against, so they are always computed even when PNG answers. */
  const spotDerived = {
    gold24k: g(raw.gold24k, cfg.gold24kFlatAdjustment),
    gold22k: g(raw.gold22k, cfg.gold22kFlatAdjustment),
    gold18k: g(raw.gold18k, cfg.gold18kFlatAdjustment),
    silver999: calculatePublishedRate(
      raw.silver999, cfg.silverMarkupPercentage, cfg.silverFlatAdjustment,
      cfg.includeGST, cfg.gstPercentage, cfg.silverRoundingIncrement
    ),
  };

  /* ── Benchmark pass ──────────────────────────────────────────
     Sit a few rupees under PNG's board when we can read and trust it.
     Only the 24K and silver are taken from them: 22K and 18K come from
     OUR purity factors applied to the undercut 24K, which keeps the
     relationship between purities ours rather than inheriting whatever
     rounding they use. Measured 15 Nov 2026 that lands 22K about ₹13
     and 18K about ₹18 under their board — the same ₹10-20 band. */
  let rateSource = "goldapi.io";
  let benchmarkNote = null;
  let benchmark = null;

  if (cfg.benchmarkEnabled && positive(spotDerived.gold24k)) {
    try {
      benchmark = await fetchBenchmark(cfg);
      const reason = validateBenchmark(benchmark, spotDerived, cfg, today);
      if (reason) {
        benchmarkNote = `rejected: ${reason}`;
        console.warn(`Benchmark rejected (${reason}) — falling back to spot x markup.`);
      } else {
        const b24 = roundRate(benchmark.gold24k - cfg.benchmarkUndercut24k, cfg.goldRoundingIncrement);
        spotDerived.gold24k = b24;
        spotDerived.gold22k = roundRate(b24 * cfg.goldPurityFactor22k, cfg.goldRoundingIncrement);
        spotDerived.gold18k = roundRate(b24 * cfg.goldPurityFactor18k, cfg.goldRoundingIncrement);
        spotDerived.silver999 = roundRate(
          Math.max(1, benchmark.silver999 - cfg.benchmarkUndercutSilver),
          cfg.silverRoundingIncrement
        );
        rateSource = "benchmark:pngjewellers";
        /* Their stamp SHOULD be today. When it is not we have run before
           they published and are mirroring yesterday's board — which is
           how a ₹114 gap appeared on 17 Nov. Harmless at a weekend, a
           timing bug on a trading day, so say so loudly either way. */
        const stampIsToday = benchmark.updatedOnDate
          ? new Date(`${benchmark.updatedOnDate} 00:00:00Z`).toISOString().slice(0, 10) === today
          : false;
        benchmarkNote =
          `matched (their 24K ₹${benchmark.gold24k}, stamp ${benchmark.updatedOn})` +
          (stampIsToday ? "" : " — STAMP IS NOT TODAY, we may have run before they published");
        if (stampIsToday) {
          console.log(`Benchmark ok — ${benchmarkNote}`);
        } else {
          console.warn(`Benchmark STALE — ${benchmarkNote}`);
        }
      }
    } catch (err) {
      benchmarkNote = `unreachable: ${err.message}`;
      console.warn(`Benchmark fetch failed (${err.message}) — falling back to spot x markup.`);
    }
  }

  const out = {
    gold: {
      "24k": spotDerived.gold24k,
      "22k": spotDerived.gold22k,
      "18k": spotDerived.gold18k,
    },
    silver: {
      "999": spotDerived.silver999,
    },
    unit: "INR per gram",
    // Only advance the visible timestamp when something actually refreshed,
    // otherwise a run of failures would look like a successful update.
    // updatedAt = when WE last refreshed. It drives the "update delayed"
    // warning, so it must not move just because a market was shut.
    updatedAt:
      goldStatus === "fresh" || silverStatus === "fresh"
        ? istISO()
        : published?.updatedAt ?? istISO(),
    // quotedAt = when the MARKET struck this price. Over a weekend this stays
    // on Friday's close while updatedAt moves daily, which is exactly the
    // distinction a customer needs when two days show the same number.
    quotedAt:
      [raw.goldSourceUpdatedAt, raw.silverSourceUpdatedAt]
        .filter(Boolean)
        .sort()
        .pop() ?? null,
    goldStatus,
    silverStatus,
    /* Which source actually priced this board. Worth publishing: if it
       ever reads goldapi.io for days on end, the benchmark is broken and
       the rate has quietly drifted away from PNG again. */
    source: rateSource,
  };

  writeJSON(PUBLIC_FILE, out);

  state.raw = raw;
  /* Kept so a drift can be diagnosed later without re-fetching their site. */
  state.benchmark = benchmark
    ? { ...benchmark, note: benchmarkNote, usedAt: istISO() }
    : { note: benchmarkNote, usedAt: istISO() };
  state.lastRunDate = today;
  state.configHash = cfgHash;
  if (goldStatus === "fresh" || silverStatus === "fresh") {
    state.usage.lastSuccessAt = istISO();
  }
  state.history = [{ date: today, ...out.gold, silver999: out.silver["999"] }, ...(state.history ?? [])]
    .filter((h, i, a) => a.findIndex((x) => x.date === h.date) === i)
    .slice(0, HISTORY_LIMIT);
  writeJSON(STATE_FILE, state);

  console.log(
    `Published ${today} IST — 24K ₹${out.gold["24k"]}/g (${goldStatus}), ` +
      `silver ₹${out.silver["999"]}/g (${silverStatus}), source ${rateSource}. ` +
      `Requests this month: ${state.usage.requestCount}/${MONTHLY_LIMIT}.`
  );
}

/* ── benchmark self-checks ────────────────────────────────────
   The parser reads a third party's HTML and the validator is the only
   thing standing between a bad read and a wrong price on the shop's
   website. Both get exercised here against a real captured snippet and
   against the failures that actually worry me. */

function selftestBenchmark() {
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`FAIL: ${msg}`);
      process.exitCode = 1;
      throw new Error(msg);
    }
  };

  // Real text captured from their page, 15 Nov 2026.
  const REAL = `
    Today's Gold Rates
    - 24K Gold ₹13657
    - 22K Gold ₹12640
    - 18K Gold ₹10689
    - 14K Gold ₹8175
    - Platinum ₹6580
    - Silver ₹179
    Applicable for online purchase only
    Updated on Saturday, November 14, 2026 at 10:10 AM
  `;
  const b = parseBenchmark(REAL);
  assert(b.gold24k === 13657, `24K parsed as ${b.gold24k}`);
  assert(b.gold22k === 12640, `22K parsed as ${b.gold22k}`);
  assert(b.gold18k === 10689, `18K parsed as ${b.gold18k}`);
  assert(b.silver999 === 179, `silver parsed as ${b.silver999}`);
  assert(b.updatedOnDate === "November 14, 2026", `stamp parsed as ${b.updatedOnDate}`);

  // Must not mistake 14K or Platinum for a gold purity we publish.
  assert(b.gold24k !== 8175 && b.gold18k !== 8175, "14K leaked into a published purity");

  const cfg = {
    benchmarkMaxDeviation: 0.15,
    benchmarkMaxAgeDays: 4,
    goldPurityFactor22k: 0.9258,
    goldPurityFactor18k: 0.7823,
  };
  const spot = { gold24k: 13563, gold22k: 12557, gold18k: 10610, silver999: 176 };

  // Saturday's stamp read on Sunday must be ACCEPTED — PNG does not
  // publish at weekends and mirroring them means mirroring that.
  assert(validateBenchmark(b, spot, cfg, "2026-11-15") === null, "valid board was rejected");

  // ...but a fortnight-old stamp must not be.
  assert(validateBenchmark(b, spot, cfg, "2026-12-01") !== null, "stale stamp was accepted");

  // A decimal slip on their side must be caught by the spot cross-check.
  assert(
    validateBenchmark({ ...b, gold24k: 136570 }, spot, cfg, "2026-11-15") !== null,
    "10x price error was accepted"
  );
  assert(
    validateBenchmark({ ...b, gold24k: 1365 }, spot, cfg, "2026-11-15") !== null,
    "divide-by-10 error was accepted"
  );

  // Blank or reordered values — both seen on their own site — must fail.
  assert(validateBenchmark(parseBenchmark("24K Gold ₹ — 22K Gold ₹ —"), spot, cfg, "2026-11-15") !== null,
    "blank board was accepted");
  assert(validateBenchmark({ ...b, gold22k: 13999 }, spot, cfg, "2026-11-15") !== null,
    "out-of-order purities were accepted");
  assert(validateBenchmark({ ...b, updatedOnDate: null }, spot, cfg, "2026-11-15") !== null,
    "missing stamp was accepted");

  // And the undercut must land inside the ₹10-20 band the owner asked for.
  const undercut = 15;
  const b24 = roundRate(b.gold24k - undercut, 1);
  const g22 = roundRate(b24 * cfg.goldPurityFactor22k, 1);
  const g18 = roundRate(b24 * cfg.goldPurityFactor18k, 1);
  const within = (ours, theirs) => {
    const d = theirs - ours;
    return d >= 5 && d <= 25;
  };
  assert(within(b24, b.gold24k), `24K undercut ${b.gold24k - b24} outside band`);
  assert(within(g22, b.gold22k), `22K undercut ${b.gold22k - g22} outside band`);
  assert(within(g18, b.gold18k), `18K undercut ${b.gold18k - g18} outside band`);

  console.log(
    `benchmark self-check passed — would publish 24K ₹${b24} (PNG ₹${b.gold24k}, -${b.gold24k - b24}), ` +
      `22K ₹${g22} (-${b.gold22k - g22}), 18K ₹${g18} (-${b.gold18k - g18})`
  );
}

/* ── self-check: the smallest thing that fails if the maths break ── */

function selftest() {
  /* Purity ladder. NOT karat/24 — the trade prices lower purities above
     their metal content. These factors come from the shop's own counter
     rates; the strict ratios left 18K ~4% short. */
  const shop = { "24k": 15365, "22k": 14225, "18k": 12020 };
  assert.equal(Math.round(shop["24k"] * 0.9258), shop["22k"], "22K factor must reproduce the shop's 22K");
  assert.equal(Math.round(shop["24k"] * 0.7823), shop["18k"], "18K factor must reproduce the shop's 18K");
  // and the naive version must NOT, so nobody quietly reverts to it
  assert.notEqual(Math.round(shop["24k"] * 18 / 24), shop["18k"], "strict 18/24 is known wrong");

  // spot passthrough, no markup / GST
  assert.equal(calculatePublishedRate(1000, 0, 0, false, 3, 1), 1000);
  // percentage markup
  assert.equal(calculatePublishedRate(1000, 10, 0, false, 3, 1), 1100);
  // flat adjustment applies after markup
  assert.equal(calculatePublishedRate(1000, 10, 50, false, 3, 1), 1150);
  // GST applies last, before rounding
  assert.equal(calculatePublishedRate(1000, 0, 0, true, 3, 1), 1030);
  // rounding increment
  assert.equal(calculatePublishedRate(1007, 0, 0, false, 3, 10), 1010);

  // invalid inputs must throw, never silently publish 0 or NaN
  assert.throws(() => roundRate(0, 1));
  assert.throws(() => roundRate(NaN, 1));
  assert.throws(() => roundRate(100, 0));

  // troy-ounce fallback when the per-gram field is missing
  const oz = 7000;
  assert.ok(Math.abs(perGram({ price: oz }) - oz / TROY_OUNCE_IN_GRAMS) < 1e-9);
  // per-gram field preferred when present
  assert.equal(perGram({ price: oz, price_gram_24k: 225 }), 225);
  // unusable payloads
  assert.equal(perGram({}), null);
  assert.equal(perGram({ price: 0 }), null);
  assert.equal(perGram({ price: -5 }), null);

  // 20% anomaly guard
  assert.equal(anomalous(121, 100), true);
  assert.equal(anomalous(119, 100), false);
  assert.equal(anomalous(100, 0), false); // no baseline yet

  // India date/month formatting
  const d = new Date("2026-08-13T04:00:00Z"); // 09:30 IST same day
  assert.equal(istDate(d), "2026-08-13");
  assert.equal(istMonth(d), "2026-08");
  assert.match(istISO(d), /^2026-08-13T09:30:00\+05:30$/);
  // 20:00 UTC is already the next day in India
  assert.equal(istDate(new Date("2026-08-13T20:00:00Z")), "2026-08-14");

  /* The config fingerprint. This exists because a markup change on a day the
     job had already run was silently ignored: the job went green and kept
     publishing gold 13% under the market rate. */
  const base = { goldMarkupPercentage: 15, silverMarkupPercentage: 27.5, includeGST: false };
  assert.equal(configHash(base), configHash({ ...base }), "same settings must hash the same");
  assert.equal(
    configHash(base),
    configHash({ includeGST: false, silverMarkupPercentage: 27.5, goldMarkupPercentage: 15 }),
    "key order must not count as a change"
  );
  assert.notEqual(
    configHash(base),
    configHash({ ...base, goldMarkupPercentage: 15.5 }),
    "a changed markup must invalidate the day's publish"
  );
  assert.notEqual(
    configHash(base),
    configHash({ ...base, includeGST: true }),
    "toggling GST must invalidate the day's publish"
  );

  // A real published rate must actually carry the markup, not pass spot through.
  const spot = 13511.9042;
  assert.equal(calculatePublishedRate(spot, 15, 0, false, 3, 1), 15539);
  assert.equal(calculatePublishedRate(199.9744, 27.5, 0, false, 3, 1), 255);

  /* Quote timestamps. The weekend case is the reason this exists: a Sunday
     fetch returns Friday's close, and stamping it "Sunday" is a lie. */
  const nowSec = Math.floor(Date.now() / 1000);
  assert.ok(sourceTimestamp({ timestamp: nowSec }), "a current unix-seconds stamp is accepted");
  assert.ok(sourceTimestamp({ timestamp: nowSec * 1000 }), "milliseconds are tolerated too");
  assert.equal(sourceTimestamp({ timestamp: nowSec - 60 * 60 * 24 * 30 }), null, "a month-old stamp is rejected");
  assert.equal(sourceTimestamp({ timestamp: nowSec + 60 * 60 * 48 }), null, "a future stamp is rejected");
  assert.equal(sourceTimestamp({}), null, "a missing stamp falls back");
  assert.equal(sourceTimestamp({ timestamp: "x" }), null, "a non-numeric stamp falls back");
  // Friday close read on Sunday must survive: still inside the 14-day window.
  assert.ok(sourceTimestamp({ timestamp: nowSec - 60 * 60 * 48 }), "a 48h-old weekend quote is kept");

  console.log("self-check passed");
}

if (process.argv.includes("--selftest")) {
  selftest();
  selftestBenchmark();
} else {
  main().catch((err) => {
    console.error("Fatal:", String(err?.message ?? err));
    process.exit(1);
  });
}
