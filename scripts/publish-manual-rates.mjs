/**
 * Publish the shop's hand-set rates.
 *
 * Reads data/manual-rates.json (written in the units the rate card uses —
 * gold per 10 grams, silver items per kilogram) and writes
 * public/rates.json in the canonical per-gram shape the site reads.
 *
 *   npm run rates:manual
 *
 * The PNG benchmark and the GoldAPI fetch are no longer used: the owner
 * sets these figures. That means NOTHING refreshes them automatically —
 * if this is not run, the board holds the last published number. The
 * site's own staleness notice still fires after STALE_AFTER_HOURS, so a
 * forgotten day shows "rate update delayed" rather than passing an old
 * figure off as today's, but that is a safety net, not a substitute for
 * updating.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANUAL = resolve(ROOT, "data/manual-rates.json");
const PUBLIC = resolve(ROOT, "public/rates.json");
const STATE = resolve(ROOT, "data/rates-state.json");

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const istNow = () => new Date(Date.now() + IST_OFFSET_MS);
const istToday = () => istNow().toISOString().slice(0, 10);
const istISO = () => istNow().toISOString().replace("Z", "+05:30");

const positive = (n) => Number.isFinite(n) && n > 0;

function fail(msg) {
  console.error(`REFUSED: ${msg}`);
  console.error("public/rates.json left untouched.");
  process.exit(1);
}

const m = JSON.parse(readFileSync(MANUAL, "utf8"));

/* Validation. These numbers go straight onto a jeweller's website with no
   second source to cross-check them, so a typo here is a wrong price in
   front of customers. Better to refuse and leave yesterday's up. */
if (!m.date) fail("no date in manual-rates.json");
const today = istToday();
if (m.date !== today) {
  fail(`date is "${m.date}" but today (IST) is "${today}" — update the date when you update the rates`);
}
for (const k of ["24k", "22k", "18k"]) {
  const v = m.gold10g?.[k];
  if (!positive(v)) fail(`gold10g.${k} missing or not a positive number`);
  if (v < 20000 || v > 500000) fail(`gold10g.${k} = ${v} is outside the sane range for ₹/10g — check for a missing or extra digit`);
}
for (const k of ["payal", "jodavi"]) {
  const v = m.silverKg?.[k];
  if (!positive(v)) fail(`silverKg.${k} missing or not a positive number`);
  if (v < 20000 || v > 1000000) fail(`silverKg.${k} = ${v} is outside the sane range for ₹/kg — check for a missing or extra digit`);
}
const { "24k": g24, "22k": g22, "18k": g18 } = m.gold10g;
if (!(g24 > g22 && g22 > g18)) fail(`purities out of order: 24K ${g24}, 22K ${g22}, 18K ${g18}`);

const out = {
  gold: { "24k": g24 / 10, "22k": g22 / 10, "18k": g18 / 10 },
  /* silver["999"] carries Payal, the lower of the two, so anything that
     still reads a single silver figure gets the shop's base number. */
  silver: { "999": m.silverKg.payal / 1000 },
  silverItems: { payal: m.silverKg.payal / 1000, jodavi: m.silverKg.jodavi / 1000 },
  unit: "INR per gram",
  updatedAt: istISO(),
  quotedAt: istISO(),
  goldStatus: "fresh",
  silverStatus: "fresh",
  source: "manual",
};

writeFileSync(PUBLIC, JSON.stringify(out, null, 2) + "\n");

/* Keep the history going so the 7-day trend table still works. */
try {
  const state = JSON.parse(readFileSync(STATE, "utf8"));
  state.history = [
    { date: today, ...out.gold, silver999: out.silver["999"] },
    ...(state.history ?? []),
  ]
    .filter((h, i, a) => a.findIndex((x) => x.date === h.date) === i)
    .slice(0, 90);
  state.lastRunDate = today;
  writeFileSync(STATE, JSON.stringify(state, null, 2) + "\n");
} catch (err) {
  console.warn(`History not updated (${err.message}) — rates still published.`);
}

console.log(
  `Published ${today} from manual-rates.json:\n` +
    `  24K ₹${g24.toLocaleString("en-IN")}/10g   22K ₹${g22.toLocaleString("en-IN")}/10g   18K ₹${g18.toLocaleString("en-IN")}/10g\n` +
    `  Payal ₹${m.silverKg.payal.toLocaleString("en-IN")}/kg   Jodavi ₹${m.silverKg.jodavi.toLocaleString("en-IN")}/kg`
);
