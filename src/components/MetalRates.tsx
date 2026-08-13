"use client";

import { useEffect, useState } from "react";
import {
  ratesCopy,
  STALE_AFTER_HOURS,
  type PublishedRates,
} from "@/data/rates-config";
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

const ROWS = [
  { key: "24k", label: "24K Gold", metal: "gold" },
  { key: "22k", label: "22K Gold", metal: "gold" },
  { key: "18k", label: "18K Gold", metal: "gold" },
  { key: "14k", label: "14K Gold", metal: "gold" },
  { key: "9k", label: "9K Gold", metal: "gold" },
  { key: "999", label: "Silver 999", metal: "silver" },
] as const;

const inr = (n: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;

/** "Thursday, 13 August 2026 at 10:30 AM" in India time. */
function formatUpdated(iso: string) {
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

type State =
  | { phase: "loading" }
  | { phase: "ready"; data: PublishedRates }
  | { phase: "unavailable" };

export default function MetalRates() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    let live = true;
    // cache: no-store so a returning visitor sees the morning's update
    // rather than yesterday's copy held by the browser.
    fetch("/rates.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: PublishedRates) => {
        if (!live) return;
        const ok = data?.gold?.["24k"] > 0 && data?.silver?.["999"] > 0;
        setState(ok ? { phase: "ready", data } : { phase: "unavailable" });
      })
      .catch(() => live && setState({ phase: "unavailable" }));
    return () => {
      live = false;
    };
  }, []);

  const data = state.phase === "ready" ? state.data : null;
  const updated = data ? formatUpdated(data.updatedAt) : null;

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
                  {ROWS.map((row) => {
                    const value = data
                      ? row.metal === "gold"
                        ? data.gold[row.key as keyof PublishedRates["gold"]]
                        : data.silver["999"]
                      : null;
                    const stale =
                      data &&
                      (row.metal === "gold"
                        ? data.goldStatus
                        : data.silverStatus) === "stale";
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
                              <span className="ml-1 text-[13px] font-normal text-ink/55">
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
                    <>Updated on {updated}</>
                  ) : null}
                </p>

                {delayed ? (
                  <p className="m-0 mt-3 text-center text-[13px] font-medium text-maroon">
                    {ratesCopy.delayed}
                  </p>
                ) : null}

                <p className="m-0 mt-5 text-center text-[12.5px] leading-relaxed text-ink/55">
                  {ratesCopy.disclaimer}
                </p>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
