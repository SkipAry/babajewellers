"use client";

import {
  formatUpdated,
  inr,
  marketClosed,
  RATE_ROWS,
  rateFor,
  useRates,
} from "@/lib/useRates";

/**
 * RATE TICKER — the day's metal rates scrolling between the hero and the
 * offers strip.
 *
 * Reads the same `useRates` hook the header menu and the Live Rates
 * section use, so all three surfaces are the same numbers from the same
 * fetch. They cannot drift: a second fetch, or a build-time copy, would
 * eventually show a customer two different prices on one page, which on a
 * jeweller's site is worse than showing none.
 *
 * HOW THE LOOP WORKS. The row is rendered twice inside a flex track and
 * the track is translated by exactly -50%. At the moment it completes,
 * copy two sits precisely where copy one began, so resetting to 0 is
 * invisible and the scroll never appears to jump. This is why the
 * duplicate exists — it is not a mistake, and removing it puts a visible
 * seam in the loop.
 *
 * The duplicate is aria-hidden and the live copy carries the real text,
 * so a screen reader announces the rates once rather than stuttering.
 *
 * NO PAUSE CONTROL, by the shop's decision — they want it running
 * continuously. WCAG 2.2.2 asks for a pause mechanism on anything moving
 * longer than five seconds, so the one concession is
 * prefers-reduced-motion: a visitor whose OS asks for less motion gets
 * the same rates as a centred static strip instead. That covers the
 * people the rule exists to protect, including anyone with vestibular
 * sensitivity, without putting a button on the design.
 */
export default function RateTicker() {
  const state = useRates();

  /* Render nothing at all while loading or on failure. A ticker is
     ambient furniture; an empty scrolling bar, or one reading "—", looks
     broken in a way a missing one does not. */
  if (state.phase !== "ready") return null;

  const { data } = state;
  const updated = formatUpdated(data.quotedAt ?? data.updatedAt);
  const closed = marketClosed(data);

  const items = [
    ...RATE_ROWS.map((row) => ({
      label: row.label,
      value: `${inr(rateFor(data, row.key))}/g`,
    })),
    { label: "Silver 999", value: `${inr(rateFor(data, "999"))}/g` },
  ];

  /* One sequence, repeated. Kept as a function so both copies are
     guaranteed identical — a hand-written second copy drifts the moment
     anyone edits the first. */
  const sequence = (hidden: boolean) => (
    <div
      className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
      aria-hidden={hidden || undefined}
    >
      {items.map((item) => (
        <span key={item.label} className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-[11px] font-semibold uppercase tracking-caps text-gold-light/70">
            {item.label}
          </span>
          <span className="font-display text-lg font-bold text-gold-light">
            {item.value}
          </span>
        </span>
      ))}
      <span aria-hidden="true" className="text-gold/40">
        ◆
      </span>
      <span className="whitespace-nowrap text-[11px] uppercase tracking-caps text-ivory/55">
        {closed
          ? "Market closed · last published rate"
          : updated
            ? `Updated ${updated}`
            : "Updated every morning"}
      </span>
      <span aria-hidden="true" className="text-gold/40">
        ◆
      </span>
      <span className="whitespace-nowrap text-[11px] uppercase tracking-caps text-ivory/55">
        Indicative · ask in store for the exact rate
      </span>
    </div>
  );

  return (
    <section
      aria-label="Today's gold and silver rates"
      className="rate-ticker border-y border-gold/20 bg-maroon-deep py-3"
    >
      <div className="rate-ticker-track flex w-max">
        {sequence(false)}
        {sequence(true)}
      </div>
    </section>
  );
}
