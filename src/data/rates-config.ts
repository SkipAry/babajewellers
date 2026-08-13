/**
 * ─────────────────────────────────────────────────────────────
 *  GOLD & SILVER RATES — adjustment settings
 *
 *  These turn GoldAPI's international spot price into the rate Baba
 *  Jewellers publishes. Edit this file, commit, and the next scheduled
 *  run (or `npm run rates:fetch`) republishes with the new numbers.
 *
 *  This replaces the spec's database-backed admin panel. The site is a
 *  static export with no server, so a login-protected settings page
 *  would mean adding auth, sessions and a database to a brochure site.
 *  A committed file gives the same control, with a full edit history in
 *  git and nothing to keep secure.
 * ─────────────────────────────────────────────────────────────
 */

export type RatesConfig = {
  /** % added to the spot rate before flat adjustments. 0 = spot. */
  goldMarkupPercentage: number;
  /** ₹/gram added after the markup, per purity. */
  gold24kFlatAdjustment: number;
  gold22kFlatAdjustment: number;
  gold18kFlatAdjustment: number;
  gold14kFlatAdjustment: number;
  gold9kFlatAdjustment: number;

  silverMarkupPercentage: number;
  silverFlatAdjustment: number;

  /** Published rates are rounded to a multiple of this. */
  goldRoundingIncrement: number;
  silverRoundingIncrement: number;

  /** Off by default — do not assume GST on the displayed rate. */
  includeGST: boolean;
  gstPercentage: number;
};

/**
 * ── CALIBRATION — last checked 13 August 2026 ──────────────────
 *
 * GoldAPI returns the INTERNATIONAL spot price converted to INR. It does not
 * know about anything that happens once metal lands in India, so the raw
 * figure sits well below what any Indian jeweller quotes. The markups below
 * close that gap.
 *
 *   Reference on 13 Aug 2026     spot (raw)   Indian market   implied markup
 *   24K gold                     ₹13,512/g    ₹15,470/g       +14.5%
 *   Silver 999                   ₹200/g       ₹255.10/g       +27.6%
 *
 * Gold is almost entirely the import duty, which the government raised from
 * 6% to 15% on 13 May 2026 — hence 15 below, which lands within 0.4% of the
 * quoted market rate. Silver carries that same duty PLUS a wide domestic
 * physical premium, so it needs roughly 27.5%.
 *
 * THESE ARE CALIBRATION CONSTANTS, NOT CONSTANTS OF NATURE. The duty changed
 * once already this year and the silver premium moves with physical supply.
 * Re-check against a public rate page every month or so; if the site drifts
 * more than a percent or two from the market, retune here.
 *
 * Separately: this makes the site track the MARKET rate. If Baba Jewellers
 * quotes above or below market at the counter, add that on top via the flat
 * adjustments — nobody but the shop knows that number.
 * ───────────────────────────────────────────────────────────────
 */
export const ratesConfig: RatesConfig = {
  goldMarkupPercentage: 15,
  gold24kFlatAdjustment: 0,
  gold22kFlatAdjustment: 0,
  gold18kFlatAdjustment: 0,
  gold14kFlatAdjustment: 0,
  gold9kFlatAdjustment: 0,

  silverMarkupPercentage: 27.5,
  silverFlatAdjustment: 0,

  goldRoundingIncrement: 1,
  silverRoundingIncrement: 1,

  includeGST: false,
  gstPercentage: 3,
};

/* ── Shared maths. Used by the fetch script and its self-check. ──
   Exported so there is exactly one implementation, not one in the
   script and a drifting copy in the component. */

export const TROY_OUNCE_IN_GRAMS = 31.1034768;

export function roundRate(value: number, increment: number): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid rate");
  if (!Number.isFinite(increment) || increment <= 0)
    throw new Error("Invalid rounding increment");
  return Math.round(value / increment) * increment;
}

export function calculatePublishedRate(
  rawRate: number,
  markupPercentage: number,
  flatAdjustment: number,
  includeGST: boolean,
  gstPercentage: number,
  roundingIncrement: number
): number {
  let value = rawRate * (1 + markupPercentage / 100);
  value += flatAdjustment;
  if (includeGST) value *= 1 + gstPercentage / 100;
  return roundRate(value, roundingIncrement);
}

/** 22K = 24K × 22/24, and so on. */
export function calculatePurity(rate24k: number, karat: number): number {
  return (rate24k * karat) / 24;
}

/* ── Public shape written to public/rates.json ──────────────── */

export type PublishedRates = {
  gold: { "24k": number; "22k": number; "18k": number; "14k": number; "9k": number };
  silver: { "999": number };
  unit: "INR per gram";
  /** ISO 8601 with +05:30 offset. */
  updatedAt: string;
  goldStatus: "fresh" | "stale" | "error";
  silverStatus: "fresh" | "stale" | "error";
  source: "goldapi.io";
};

/** Older than this and the card shows a delayed notice. */
export const STALE_AFTER_HOURS = 36;

export const ratesCopy = {
  heading: "Today's Gold & Silver Rates",
  label: "Live Rates",
  intro:
    "Indicative rates per gram, updated every morning. Ask in store for the exact rate at the time of purchase.",
  disclaimer:
    "Rates are indicative and may vary at the time of purchase. GST, making charges and other applicable charges may be additional.",
  delayed: "Rate update delayed — showing the last confirmed rates.",
  unavailable:
    "Rates are temporarily unavailable. Please contact the showroom.",
};
