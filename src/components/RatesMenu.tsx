"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ratesCopy } from "@/data/rates-config";
import {
  formatUpdated,
  inr,
  marketClosed,
  RATE_ROWS,
  rateFor,
  useRates,
} from "@/lib/useRates";
import { trackEvent } from "@/lib/analytics";

/**
 * "Metal Rates" header control — the day's rates without scrolling.
 *
 * Deliberately NOT hover-triggered. A hover menu is unusable on touch, and
 * this must work identically on a phone, which is where most customers check
 * a rate. Click/tap on every breakpoint, one code path.
 */

type Props = { onOpen?: () => void; variant: "desktop" | "mobile" };

export default function RatesMenu({ onOpen, variant }: Props) {
  const [open, setOpen] = useState(false);
  const state = useRates();
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => btnRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    // Closing on scroll: the panel is anchored to a fixed header, so it would
    // otherwise hang over the page while the customer reads something else.
    const onScroll = () => close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, close]);

  const data = state.phase === "ready" ? state.data : null;
  const updated = data ? formatUpdated(data.quotedAt ?? data.updatedAt) : null;
  const closed = data ? marketClosed(data) : false;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) {
            onOpen?.();
            trackEvent("rates_open", { placement: `header_${variant}` });
          }
        }}
        className={
          variant === "desktop"
            ? "flex items-center gap-1.5 py-1 text-sm font-medium text-ivory/85 transition-colors hover:text-gold-light"
            : "flex h-11 items-center gap-1.5 rounded-sm border border-gold/40 px-2.5 text-xs font-semibold text-gold-light"
        }
      >
        <RatesIcon />
        <span>Rates</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 10 6"
          className={`h-1.5 w-2.5 fill-current transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M0 0h10L5 6z" />
        </svg>
      </button>

      {/* Positioning differs by variant on purpose.
          The desktop panel hangs off the button. The mobile one is pinned to
          the viewport instead: right-aligning to the button pushed the panel
          34px off the left edge at 320px, because the button sits near the
          left of a narrow bar. Anchoring to the viewport cannot overflow. */}
      <div
        id={panelId}
        hidden={!open}
        className={`z-50 rounded-lg border border-gold/30 bg-ivory p-5 shadow-[0_18px_50px_rgba(20,2,6,0.45)] ${
          variant === "desktop"
            ? "absolute right-0 top-full mt-3 w-[19rem]"
            : "fixed inset-x-4 top-[4.5rem] ml-auto max-w-xs md:top-[5.5rem]"
        }`}
      >
        <p className="m-0 text-center font-display text-lg font-bold text-maroon-deep">
          {ratesCopy.heading}
        </p>
        <div
          aria-hidden="true"
          className="mx-auto my-3 h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        {state.phase === "unavailable" ? (
          <p className="m-0 py-3 text-center text-sm text-ink/70">
            {ratesCopy.unavailable}
          </p>
        ) : (
          <>
            <dl
              aria-busy={state.phase === "loading"}
              className="m-0 divide-y divide-maroon/10"
            >
              {[...RATE_ROWS, { key: "999", label: "Silver 999" } as const].map(
                (row) => {
                  const value = data ? rateFor(data, row.key) : null;
                  return (
                    <div
                      key={row.key}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <dt className="text-sm text-ink/85">{row.label}</dt>
                      <dd className="m-0 font-display text-base font-bold tabular-nums text-maroon-deep">
                        {value == null ? (
                          <span
                            aria-hidden="true"
                            className="inline-block h-[1em] w-16 animate-pulse rounded bg-maroon/10 align-middle"
                          />
                        ) : (
                          <>
                            {inr(value)}
                            <span className="ml-1 text-xs font-normal text-ink/70">
                              /g
                            </span>
                          </>
                        )}
                      </dd>
                    </div>
                  );
                }
              )}
            </dl>

            <p className="m-0 mt-3 text-center text-[11.5px] leading-relaxed text-ink/70">
              {state.phase === "loading" ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-[1em] w-44 animate-pulse rounded bg-maroon/10 align-middle"
                />
              ) : updated ? (
                <>Rate as of {updated}</>
              ) : null}
            </p>

            {closed ? (
              <p className="m-0 mt-2 text-center text-[11.5px] leading-relaxed text-ink/70">
                Markets closed — last traded rate.
              </p>
            ) : null}

            {/* The full section carries the disclaimer and the "ask in store"
                line. Link to it rather than repeating a shortened version that
                could read as the complete terms. */}
            <a
              href="/#rates"
              onClick={() => close()}
              className="mt-3 block rounded-sm bg-maroon px-4 py-2.5 text-center text-sm font-semibold text-gold-light transition-colors hover:bg-maroon-deep"
            >
              See full rates &amp; terms
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function RatesIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="11" width="7" height="5" rx="1" />
      <rect x="10.5" y="11" width="7" height="5" rx="1" />
      <rect x="6.5" y="5" width="7" height="5" rx="1" />
    </svg>
  );
}
