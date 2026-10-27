"use client";

import { useId, useState } from "react";
import { inr } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

/**
 * Estimated price calculator: weight × karat rate + making % + 3% GST.
 *
 * The second thing a snippet cannot deliver. Someone checking a gold rate
 * is almost never curious about the rate itself — they want to know what
 * a piece will cost. A snippet can show ₹13,035/g; it cannot answer
 * "so what does a 24-gram necklace come to?"
 *
 * ── HONESTY CONSTRAINTS ───────────────────────────────────────────
 *
 * Rates and the default making percentage are passed in from live data —
 * nothing is hardcoded. The result is labelled an estimate everywhere it
 * appears, because the real figure depends on the piece: making charges
 * vary with design, and wastage is not modelled here at all. A calculator
 * that looks authoritative and then disagrees with the counter is worse
 * for trust than no calculator.
 *
 * No charting or form library — plain state and arithmetic, so this adds
 * nothing measurable to the bundle.
 */

const GST_PERCENT = 3;

type Karat = "24k" | "22k" | "18k";

export default function PriceCalculator({
  rates,
  defaultMakingPercent,
}: {
  rates: Record<Karat, number>;
  /** From the live making-charge offer; falls back when none is running. */
  defaultMakingPercent: number;
}) {
  const [weight, setWeight] = useState("10");
  const [karat, setKarat] = useState<Karat>("22k");
  const [making, setMaking] = useState(String(defaultMakingPercent));
  const weightId = useId();
  const makingId = useId();

  const w = Number.parseFloat(weight);
  const m = Number.parseFloat(making);
  const valid = Number.isFinite(w) && w > 0 && Number.isFinite(m) && m >= 0;

  const metal = valid ? rates[karat] * w : 0;
  const makingAmount = valid ? metal * (m / 100) : 0;
  const subtotal = metal + makingAmount;
  const gst = subtotal * (GST_PERCENT / 100);
  const total = subtotal + gst;

  return (
    <>
      <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
        What will a piece actually cost?
      </h2>
      <p className="mt-4 text-base leading-relaxed text-ink/80">
        The rate is per gram of metal. The price of an ornament is that,
        plus making charges for the craftsmanship, plus GST. Put in a weight
        to see roughly where it lands.
      </p>

      <div className="mt-6 rounded-sm border border-maroon/15 bg-ivory-warm p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor={weightId}
              className="block text-xs font-semibold uppercase tracking-caps text-maroon"
            >
              Weight (grams)
            </label>
            <input
              id={weightId}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={() => trackEvent("rates_open", { tool: "calculator" })}
              className="mt-2 min-h-11 w-full rounded-sm border border-maroon/25 bg-ivory px-3 py-2 text-base text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-caps text-maroon">
              Purity
            </span>
            <div role="group" aria-label="Purity" className="mt-2 flex gap-1">
              {(["24k", "22k", "18k"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={karat === k}
                  onClick={() => setKarat(k)}
                  className={`min-h-11 flex-1 rounded-sm px-2 text-sm font-semibold transition-colors ${
                    karat === k
                      ? "bg-maroon text-gold-light"
                      : "border border-maroon/25 text-maroon hover:border-maroon/60"
                  }`}
                >
                  {k.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor={makingId}
              className="block text-xs font-semibold uppercase tracking-caps text-maroon"
            >
              Making charges (%)
            </label>
            <input
              id={makingId}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={making}
              onChange={(e) => setMaking(e.target.value)}
              className="mt-2 min-h-11 w-full rounded-sm border border-maroon/25 bg-ivory px-3 py-2 text-base text-ink focus:border-maroon focus:outline-none"
            />
          </div>
        </div>

        {valid ? (
          <dl className="mt-6 space-y-2 border-t border-maroon/15 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/70">
                Metal — {w}g × {inr(rates[karat])}
              </dt>
              <dd className="font-medium text-ink">{inr(metal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">Making charges at {m}%</dt>
              <dd className="font-medium text-ink">{inr(makingAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">GST at {GST_PERCENT}%</dt>
              <dd className="font-medium text-ink">{inr(gst)}</dd>
            </div>
            <div className="flex justify-between border-t border-maroon/15 pt-3">
              <dt className="font-display text-lg font-bold text-maroon-deep">
                Estimated total
              </dt>
              <dd className="font-display text-lg font-bold text-maroon-deep">
                {inr(total)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-6 border-t border-maroon/15 pt-5 text-sm text-ink/60">
            Enter a weight to see an estimate.
          </p>
        )}

        <p className="mt-4 text-xs leading-relaxed text-ink/55">
          An estimate, not a quotation. Making charges vary by design and
          this does not account for wastage or hallmarking charges. Ask in
          store for the exact figure on the piece you want.
        </p>
      </div>
    </>
  );
}
