"use client";

import { useEffect, useState } from "react";
import type { PublishedRates } from "@/data/rates-config";

/**
 * Shared rates loader.
 *
 * Two things now read /rates.json — the header dropdown and the on-page
 * section — and both mount on first paint. The in-flight promise is cached at
 * module scope so they share ONE request rather than racing each other, and so
 * re-opening the dropdown does not refetch.
 *
 * cache: "no-store" so a returning visitor sees the morning's update instead
 * of yesterday's copy held by the browser.
 *
 * THE CACHE BUST IS NOT BELT-AND-BRACES. It is the actual fix for a bug that
 * showed the shop a two-day-old price.
 *
 * `cache: "no-store"` only governs the BROWSER cache. The site is served by
 * DigitalOcean App Platform, whose built-in CDN runs on Cloudflare, and which
 * stamps every static file with:
 *
 *     cache-control: public, max-age=10, s-maxage=86400
 *
 * `s-maxage=86400` pins the file at the edge for 24 hours. The edge does not
 * care what the client asked for — same URL, same cached bytes. Measured 29
 * Aug 2026: the origin had that morning's file (last-modified 06:27 UTC)
 * while the edge was still serving the 27th, `cf-cache-status: HIT`, `age:
 * 6287`. The GitHub Action had been publishing on time the whole while.
 *
 * Appending the IST hour makes each hour a distinct URL, so the edge must go
 * to the origin at most an hour after a publish. It is deliberately the HOUR
 * and not a timestamp: a per-request buster would defeat caching entirely and
 * send every visitor to the origin, on a page whose visitors are on mid-tier
 * mobile data.
 *
 * This lives in code rather than in a dashboard setting on purpose — it is in
 * version control, it survives someone rebuilding the hosting, and it needs
 * nobody to remember it. Setting a correct `cache-control` in the DigitalOcean
 * app spec would be the tidier fix and this could then go; until that exists,
 * this is the one that actually holds.
 */

/** Current hour in IST, as YYYY-MM-DDTHH — stable within the hour. */
function istHourStamp(): string {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 13);
}

export type RatesState =
  | { phase: "loading" }
  | { phase: "ready"; data: PublishedRates }
  | { phase: "unavailable" };

let inflight: Promise<PublishedRates> | null = null;

function load(): Promise<PublishedRates> {
  inflight ??= fetch(`/rates.json?h=${istHourStamp()}`, { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data: PublishedRates) => {
      // A malformed or zeroed file must not render as "₹0/g".
      if (!(data?.gold?.["24k"] > 0) || !(data?.silver?.["999"] > 0)) {
        throw new Error("Incomplete rates payload");
      }
      return data;
    })
    .catch((err) => {
      inflight = null; // let a later mount retry rather than caching the failure
      throw err;
    });
  return inflight;
}

export function useRates(): RatesState {
  const [state, setState] = useState<RatesState>({ phase: "loading" });

  useEffect(() => {
    let live = true;
    load()
      .then((data) => live && setState({ phase: "ready", data }))
      .catch(() => live && setState({ phase: "unavailable" }));
    return () => {
      live = false;
    };
  }, []);

  return state;
}

/* ── shared formatting, so the two surfaces cannot drift ────── */

/* ── Display units ───────────────────────────────────────────────
   rates.json stays in RUPEES PER GRAM. That is the canonical unit the
   PNG benchmark compares against, the history table stores, and every
   validation check is written in — changing it would mean rewriting all
   of that to gain nothing.

   What changed (20 Nov 2026) is only how the numbers are SHOWN. The shop
   quotes gold per 10 grams and silver per kilogram, the way its printed
   rate card does, so the site now matches the card rather than the
   convention of the rate-aggregator sites. */

export const RATE_ROWS = [
  { key: "24k", label: "24 Carat" },
  { key: "22k", label: "22 Carat" },
  { key: "18k", label: "18 Carat" },
] as const;

/**
 * Silver, sold as finished items rather than as a metal rate.
 *
 * The rate card prices two products per kilogram instead of quoting
 * silver 999, so the site does the same. `premiumPerGram` is what each
 * item carries OVER the published silver rate, in ₹/g.
 *
 * ⚠ ASSUMPTION, from the card dated 20 Nov 2026: Payal was ₹1,52,000/kg
 * against a published silver rate of ₹152/g (premium 0), and Jodavi was
 * ₹1,57,000/kg (premium ₹5). That is ONE day's reading. If the gap
 * between the two is not always ₹5, these two numbers are what to change
 * — nothing else needs touching.
 */
export const SILVER_PRODUCTS = [
  { key: "payal", label: "Payal", sub: "Anklets", premiumPerGram: 0 },
  { key: "jodavi", label: "Jodavi", sub: "Toe Rings", premiumPerGram: 5 },
] as const;

/** Gold: ₹/g -> ₹ per 10 grams. */
export const per10g = (perGram: number) => perGram * 10;

/** Silver item: ₹/g + its premium -> ₹ per kilogram. */
export const perKg = (silverPerGram: number, premiumPerGram: number) =>
  (silverPerGram + premiumPerGram) * 1000;

export const inr = (n: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;

/** "Friday, 14 August 2026 at 6:08 pm" in India time. */
export function formatUpdated(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * True when the quote is materially older than the last refresh — i.e. the
 * market was shut when we fetched. 20h, so an ordinary overnight gap between
 * a late close and a 10:30 fetch does not trip it, but a weekend does.
 */
export function marketClosed(data: PublishedRates): boolean {
  if (!data.quotedAt) return false;
  const quoted = new Date(data.quotedAt).getTime();
  if (Number.isNaN(quoted)) return false;
  return (Date.now() - quoted) / 36e5 > 20;
}

export function rateFor(data: PublishedRates, key: string) {
  return key === "999"
    ? data.silver["999"]
    : data.gold[key as keyof PublishedRates["gold"]];
}

export type DisplayRow = {
  key: string;
  label: string;
  /** Second line, e.g. "Anklets". Null for the gold rows. */
  sub: string | null;
  /** Already converted to the unit below. */
  value: number;
  unit: "per 10 grams" | "per kilogram";
};

/**
 * The rows exactly as the shop's rate card lists them: three gold
 * purities per 10 grams, then the two silver items per kilogram.
 *
 * One function so the six places that render rates cannot drift apart —
 * which they previously could, since each built its own row list.
 */
export function displayRows(data: PublishedRates): DisplayRow[] {
  const gold = RATE_ROWS.map((r) => ({
    key: r.key,
    label: r.label,
    sub: null,
    value: per10g(data.gold[r.key as keyof PublishedRates["gold"]]),
    unit: "per 10 grams" as const,
  }));
  const silver = SILVER_PRODUCTS.map((p) => ({
    key: p.key,
    label: p.label,
    sub: p.sub,
    value: perKg(data.silver["999"], p.premiumPerGram),
    unit: "per kilogram" as const,
  }));
  return [...gold, ...silver];
}
