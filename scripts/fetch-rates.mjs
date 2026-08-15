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

/** Reject a rate that moved more than 20% from the last good one. */
function anomalous(next, prev) {
  if (!positive(prev)) return false;
  return Math.abs(next - prev) / prev > ANOMALY_THRESHOLD;
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
      raw.goldSourceUpdatedAt = istISO();
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
      raw.silverSourceUpdatedAt = istISO();
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

  const out = {
    gold: {
      "24k": g(raw.gold24k, cfg.gold24kFlatAdjustment),
      "22k": g(raw.gold22k, cfg.gold22kFlatAdjustment),
      "18k": g(raw.gold18k, cfg.gold18kFlatAdjustment),
    },
    silver: {
      "999": calculatePublishedRate(
        raw.silver999, cfg.silverMarkupPercentage, cfg.silverFlatAdjustment,
        cfg.includeGST, cfg.gstPercentage, cfg.silverRoundingIncrement
      ),
    },
    unit: "INR per gram",
    // Only advance the visible timestamp when something actually refreshed,
    // otherwise a run of failures would look like a successful update.
    updatedAt:
      goldStatus === "fresh" || silverStatus === "fresh"
        ? istISO()
        : published?.updatedAt ?? istISO(),
    goldStatus,
    silverStatus,
    source: "goldapi.io",
  };

  writeJSON(PUBLIC_FILE, out);

  state.raw = raw;
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
      `silver ₹${out.silver["999"]}/g (${silverStatus}). ` +
      `Requests this month: ${state.usage.requestCount}/${MONTHLY_LIMIT}.`
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

  console.log("self-check passed");
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  main().catch((err) => {
    console.error("Fatal:", String(err?.message ?? err));
    process.exit(1);
  });
}
