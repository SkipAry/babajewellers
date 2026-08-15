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

  /**
   * Lower purities as a fraction of the 24K rate.
   *
   * NOT karat/24. The trade does not price that way — 22K and 18K carry more
   * margin than their metal content implies, and the gap widens as purity
   * falls. Measured against the rates Baba Jewellers actually quotes:
   * strict 18/24 came out ₹496/g short even after matching 24K exactly.
   */
  goldPurityFactor22k: number;
  goldPurityFactor18k: number;

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
 * ── CALIBRATION — last checked 15 August 2026 ──────────────────
 *
 * GoldAPI returns the INTERNATIONAL spot price converted to INR. It does not
 * know about anything that happens once metal lands in India, so the raw
 * figure sits well below what any Indian jeweller quotes. The markups below
 * close that gap.
 *
 * Calibrated against Aarti Traders (aartitraders.in), the Pune bullion dealer
 * Baba Jewellers actually prices from, cross-checked against the rates the
 * shop quoted at the counter on 15 Aug 2026.
 *
 *   Aarti board, 15 Aug     gold $4,377/oz · silver $64.74/oz · USDINR 95.415
 *   -> raw spot gold        ₹13,427/g
 *   -> their GOLD COSTING   ₹15,459/g   = spot +15.13%
 *   -> our 15%              ₹15,441/g   — 18/g apart, 0.12%
 *
 *   Shop's counter rates    24K ₹15,365 · 22K ₹14,225 · 18K ₹12,020 · silver ₹240
 *
 * Gold's 15% is almost entirely the import duty, raised from 6% on 13 May
 * 2026. Silver does NOT carry the same premium the retail press quotes —
 * measured against the shop's ₹240 it is +20.85%, not the +27.5% an earlier
 * pass took from a news site.
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

  // 22K and 18K measured from the shop's own quoted rates (see note above).
  goldPurityFactor22k: 0.9258,
  goldPurityFactor18k: 0.7823,

  silverMarkupPercentage: 20.85,
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

/* ── Public shape written to public/rates.json ──────────────── */

export type PublishedRates = {
  /* 14K and 9K were dropped in Aug 2026: Baba Jewellers does not deal in
     them, and publishing a purity nobody quoted meant publishing a guess. */
  gold: { "24k": number; "22k": number; "18k": number };
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
