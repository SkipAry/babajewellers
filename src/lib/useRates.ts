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
 */

export type RatesState =
  | { phase: "loading" }
  | { phase: "ready"; data: PublishedRates }
  | { phase: "unavailable" };

let inflight: Promise<PublishedRates> | null = null;

function load(): Promise<PublishedRates> {
  inflight ??= fetch("/rates.json", { cache: "no-store" })
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

export function rateFor(data: PublishedRates, key: string) {
  return key === "999"
    ? data.silver["999"]
    : data.gold[key as keyof PublishedRates["gold"]];
}
