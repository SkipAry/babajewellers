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

export const RATE_ROWS = [
  { key: "24k", label: "24K Gold" },
  { key: "22k", label: "22K Gold" },
  { key: "18k", label: "18K Gold" },
] as const;

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
