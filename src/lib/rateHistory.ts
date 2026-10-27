import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Seven-day rate history, read at build time.
 *
 * The data already exists — `data/rates-state.json` has been accumulating
 * one entry per day since 13 Aug 2026 (74 at the time of writing) as a
 * by-product of the daily rates job. Nothing new needs collecting and
 * nothing is ever backfilled or invented: if the file is missing,
 * malformed or short, this returns fewer rows or none, and the caller
 * renders nothing.
 *
 * ⚠ The stored array is NEWEST FIRST. `history[0]` is today and the last
 * element is the oldest. `slice(-7)` therefore returns August, not this
 * week — a mistake that renders a plausible-looking table of stale
 * numbers rather than failing loudly. Take from the FRONT.
 *
 * `data/` is not under `public/`, so this file is never served to the
 * browser; it is read during the build exactly like rates.json is on the
 * town pages.
 */

export type RateHistoryEntry = {
  /** ISO date, YYYY-MM-DD, in IST. */
  date: string;
  "24k": number;
  "22k": number;
  "18k": number;
  silver999: number;
};

type RatesState = { history?: unknown };

function isEntry(v: unknown): v is RateHistoryEntry {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
    typeof e["24k"] === "number" &&
    e["24k"] > 0 &&
    typeof e["22k"] === "number" &&
    e["22k"] > 0
  );
}

/**
 * Most recent `days` entries, returned OLDEST FIRST so a table reads left
 * to right in time order. Returns [] on any problem — a rate table is
 * worth omitting rather than guessing.
 */
export function readRateHistory(days = 7): RateHistoryEntry[] {
  try {
    const raw = readFileSync(
      join(process.cwd(), "data", "rates-state.json"),
      "utf8"
    );
    const parsed = JSON.parse(raw) as RatesState;
    if (!Array.isArray(parsed.history)) return [];

    const valid = parsed.history.filter(isEntry);
    if (valid.length === 0) return [];

    /* Sort rather than trust the stored order. The file happens to be
       newest-first today, but that is an implementation detail of the
       rates script; if it ever changes, an unsorted slice would quietly
       publish the wrong week. */
    const sorted = [...valid].sort((a, b) => (a.date < b.date ? 1 : -1));
    return sorted.slice(0, days).reverse();
  } catch {
    return [];
  }
}

/** Direction of travel across the window, for a one-line summary. */
export function trendSummary(history: RateHistoryEntry[]) {
  if (history.length < 2) return null;
  const first = history[0]["22k"];
  const last = history[history.length - 1]["22k"];
  const diff = last - first;
  return {
    diff,
    pct: (diff / first) * 100,
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
    from: history[0].date,
    to: history[history.length - 1].date,
    days: history.length,
  } as const;
}
