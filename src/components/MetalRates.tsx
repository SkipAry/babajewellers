"use client";

import Link from "next/link";
import { ratesCopy, STALE_AFTER_HOURS } from "@/data/rates-config";
import { formatUpdated, inr, marketClosed, RATE_ROWS, rateFor, useRates } from "@/lib/useRates";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * TODAY'S GOLD & SILVER RATES.
 *
 * Reads /rates.json, which a scheduled GitHub Action writes once a day.
 * This component never talks to GoldAPI — the key lives in a GitHub
 * secret and never reaches the browser.
 *
 * The row list is fixed, so the card reserves its full height while
 * loading and nothing below it shifts when the numbers land.
 */

export default function MetalRates() {
  const state = useRates();

  const data = state.phase === "ready" ? state.data : null;
  /* Show when the PRICE was struck, not when we fetched it. Over a weekend
     those differ by two days, and "updated today" on a Friday price is what
     made an unchanged rate look like a broken feed. */
  const updated = data ? formatUpdated(data.quotedAt ?? data.updatedAt) : null;
  const closed = data ? marketClosed(data) : false;

  const hoursOld = data
    ? (Date.now() - new Date(data.updatedAt).getTime()) / 36e5
    : 0;
  const delayed = Boolean(data) && hoursOld > STALE_AFTER_HOURS;

  return (
    <section id="rates" className="bg-ivory-warm py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label={ratesCopy.label}
          title={ratesCopy.heading}
          intro={ratesCopy.intro}
        />

        <Reveal className="mx-auto mt-12 max-w-2xl">
          <div className="rounded-2xl border border-maroon/12 bg-ivory p-6 shadow-[0_16px_44px_rgba(83,2,12,0.10)] sm:p-9">
            {state.phase === "unavailable" ? (
              <p className="m-0 py-8 text-center text-base text-ink/70">
                {ratesCopy.unavailable}
              </p>
            ) : (
              <>
                {/* aria-busy tells a screen reader the figures are still
                    arriving, instead of announcing skeleton dashes. */}
                <dl
                  aria-busy={state.phase === "loading"}
                  className="m-0 divide-y divide-maroon/10"
                >
                  {[...RATE_ROWS, { key: "999", label: "Silver 999" } as const].map((row) => {
                    const value = data ? rateFor(data, row.key) : null;
                    const stale =
                      data &&
                      (row.key === "999" ? data.silverStatus : data.goldStatus) ===
                        "stale";
                    return (
                      <div
                        key={row.key}
                        className="flex items-baseline justify-between gap-4 py-3.5"
                      >
                        <dt className="text-[15px] font-medium text-ink/85 sm:text-base">
                          {row.label}
                          {stale ? (
                            <span className="ml-2 align-middle text-[11px] uppercase tracking-wide text-ink/50">
                              last confirmed
                            </span>
                          ) : null}
                        </dt>
                        <dd className="m-0 font-display text-[clamp(1.25rem,3.5vw,1.6rem)] font-bold tabular-nums text-maroon-deep">
                          {value == null ? (
                            <span
                              aria-hidden="true"
                              className="inline-block h-[1em] w-20 animate-pulse rounded bg-maroon/10 align-middle"
                            />
                          ) : (
                            <>
                              {inr(value)}
                              <span className="ml-1 text-[13px] font-normal text-ink/70">
                                /g
                              </span>
                            </>
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                {/* elegant gold divider */}
                <div
                  aria-hidden="true"
                  className="my-6 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                />

                <p className="m-0 text-center text-[13px] text-ink/65">
                  {state.phase === "loading" ? (
                    <span className="inline-block h-[1em] w-56 animate-pulse rounded bg-maroon/10 align-middle" />
                  ) : updated ? (
                    <>Rate as of {updated}</>
                  ) : null}
                </p>

                {closed ? (
                  <p className="m-0 mt-2 text-center text-[12.5px] leading-relaxed text-ink/70">
                    {ratesCopy.marketClosed}
                  </p>
                ) : null}

                {delayed ? (
                  <p className="m-0 mt-3 text-center text-[13px] font-medium text-maroon">
                    {ratesCopy.delayed}
                  </p>
                ) : null}

                <p className="m-0 mt-5 text-center text-[12.5px] leading-relaxed text-ink/70">
                  {ratesCopy.disclaimer}
                </p>
              </>
            )}
          </div>

          <p className="m-0 mt-6 text-center">
            <Link
              href="/gold-rate-shikrapur/"
              className="text-[13.5px] font-semibold text-maroon underline underline-offset-4 transition-colors hover:text-maroon-soft"
            >
              {ratesCopy.breakdown}
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
