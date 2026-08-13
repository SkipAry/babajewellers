"use client";

import { useState } from "react";
import {
  findPlan,
  inr,
  monthsFor,
  savingsAmounts,
  savingsPlans,
  savingsScheme,
  site,
} from "@/data/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * BENEFIT CALCULATOR — बाबा सुवर्ण एलीट योजना.
 *
 * Native <select> for both inputs: keyboard and screen-reader behaviour,
 * plus the OS picker on mobile, all for free. No combobox library.
 *
 * No Calculate button — the result is derived from state on every render,
 * so it is always in step with the inputs and there is nothing to keep in
 * sync. No useEffect either: changing the amount resets the duration in
 * the same handler, which is one render instead of two.
 *
 * NOTE ON DEVANAGARI: the brand fonts (Cormorant, Google Sans Flex) are
 * Latin-only subsets, so Marathi falls back to the system Devanagari face
 * — Nirmala UI on Windows, Noto on Android/ChromeOS. It renders correctly
 * everywhere but is not brand-matched. Add @fontsource/noto-sans-devanagari
 * if that matters.
 */

const enquiryHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
  savingsScheme.enquiryMessage
)}`;

/** Devanagari-first stack, so Marathi never lands on a Latin fallback. */
const MR = '"Nirmala UI","Noto Sans Devanagari","Mangal",system-ui,sans-serif';

export default function BenefitCalculator() {
  const [amount, setAmount] = useState(savingsPlans[0].amount);
  const [months, setMonths] = useState(savingsPlans[0].months);

  const durations = monthsFor(amount);

  // Changing the amount can orphan the duration (₹10,000 has only 24
  // months), so snap to the first valid one in the same update.
  const onAmountChange = (next: number) => {
    setAmount(next);
    const valid = monthsFor(next);
    if (!valid.includes(months)) setMonths(valid[0]);
  };

  const plan = findPlan(amount, months) ?? savingsPlans[0];
  const totalDeposit = plan.amount * plan.months;
  const finalValue = totalDeposit + plan.bonus;

  const results = [
    { label: "एकूण जमा रक्कम", value: inr(totalDeposit), strong: false },
    { label: "अतिरिक्त लाभ (बोनस)", value: inr(plan.bonus), strong: false },
    { label: "एकूण मूल्य", value: inr(finalValue), strong: true },
  ];

  const selectClass =
    "w-full appearance-none rounded-xl border border-maroon/20 bg-white px-4 py-3.5 text-lg font-semibold text-maroon-deep shadow-sm transition-colors hover:border-maroon/40 focus-visible:border-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

  return (
    <section
      id="yojana"
      className="bg-maroon-deep py-16 md:py-24"
      style={{ fontFamily: MR }}
    >
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label={savingsScheme.name}
          title={savingsScheme.heading}
          intro={savingsScheme.intro}
          onDark
        />

        <Reveal className="mx-auto mt-12 max-w-4xl">
          <div className="rounded-2xl bg-ivory p-6 shadow-[0_20px_50px_rgba(20,2,6,0.45)] sm:p-9">
            {/* ── Inputs ─────────────────────────────────────── */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="yojana-amount"
                  className="mb-2 block text-sm font-semibold text-maroon"
                >
                  दर महिन्याला जमा रक्कम
                </label>
                <div className="relative">
                  <select
                    id="yojana-amount"
                    value={amount}
                    onChange={(e) => onAmountChange(Number(e.target.value))}
                    className={selectClass}
                  >
                    {savingsAmounts.map((a) => (
                      <option key={a} value={a}>
                        {inr(a)}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>

              <div>
                <label
                  htmlFor="yojana-months"
                  className="mb-2 block text-sm font-semibold text-maroon"
                >
                  योजनेचा कालावधी
                </label>
                <div className="relative">
                  <select
                    id="yojana-months"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className={selectClass}
                  >
                    {durations.map((m) => (
                      <option key={m} value={m}>
                        {m} महिने
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>
            </div>

            {/* ── Results ────────────────────────────────────
                aria-live so a screen reader hears the new figures when
                the selects change, rather than silently updating. */}
            <div
              aria-live="polite"
              className="mt-7 grid gap-4 sm:grid-cols-3"
            >
              {results.map((r) => (
                <div
                  key={r.label}
                  className={`rounded-xl px-5 py-5 text-center ${
                    r.strong
                      ? "bg-maroon text-ivory shadow-md"
                      : "border border-maroon/15 bg-white"
                  }`}
                >
                  <p
                    className={`m-0 text-[13px] font-semibold leading-snug ${
                      r.strong ? "text-gold-light" : "text-ink/65"
                    }`}
                  >
                    {r.label}
                  </p>
                  <p
                    className={`m-0 mt-2 text-[clamp(1.5rem,4.5vw,2rem)] font-bold leading-none tabular-nums ${
                      r.strong ? "text-ivory" : "text-maroon-deep"
                    }`}
                  >
                    {r.value}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Enquiry ────────────────────────────────────── */}
            <a
              href={enquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-maroon px-7 text-base font-semibold text-ivory transition-colors hover:bg-maroon-soft sm:w-auto sm:min-w-[280px]"
            >
              <WhatsAppMark />
              योजनेबद्दल चौकशी करा
            </a>

            {/* ── Full plan table ────────────────────────────
                Wrapper scrolls, page does not. */}
            <div className="mt-9 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <caption className="sr-only">
                  {savingsScheme.name} — सर्व योजना
                </caption>
                <thead>
                  <tr className="border-b-2 border-maroon/20">
                    {["मासिक रक्कम", "कालावधी", "एकूण जमा", "अतिरिक्त लाभ"].map(
                      (h) => (
                        <th
                          key={h}
                          scope="col"
                          className="whitespace-nowrap px-3 py-3 text-[13px] font-semibold text-maroon"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {savingsPlans.map((p) => {
                    const active = p.amount === amount && p.months === months;
                    return (
                      <tr
                        key={`${p.amount}-${p.months}`}
                        aria-current={active ? "true" : undefined}
                        className={`border-b border-maroon/10 ${
                          active ? "bg-gold/15" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums text-maroon-deep">
                          {inr(p.amount)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums text-ink/75">
                          {p.months} महिने
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums text-ink/75">
                          {inr(p.amount * p.months)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums text-maroon">
                          {inr(p.bonus)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="m-0 mt-6 text-center text-[13px] leading-relaxed text-ink/70">
              {savingsScheme.disclaimer}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Native selects hide their arrow once appearance-none is set. */
function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.3-1.95 1.35-.5.05-1.13.07-1.82-.11-.42-.11-.96-.29-1.65-.58-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.02 0-1.44.76-2.14 1.03-2.44.27-.29.58-.36.78-.36l.56.01c.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.14-.3.3-.13.59.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.3 2.35 1.45.29.14.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.65-.14.27.09 1.69.8 1.98.94.29.15.48.22.55.34.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}
