import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import Header from "@/components/Header";
import MobileActions from "@/components/MobileActions";
import {
  inr,
  savingsPlans,
  savingsScheme,
  site,
  stores,
} from "@/data/site";

/**
 * BABA JEWELLERS ELITE PLAN — the gold savings scheme.
 *
 * The homepage carries the interactive calculator behind the #yojana anchor.
 * Its plan table is pre-rendered, so the figures are already crawlable — but
 * every word around them is Marathi, there is not one English term on the
 * page for what this is, and it has no URL of its own. Nobody searching
 * "gold savings scheme pune" can reach it.
 *
 * This page is the searchable counterpart: the same rows on their own URL,
 * explained in English, with the scheme's Marathi name kept alongside
 * because that is what it is actually called in store. It also carries the
 * total value per plan, which the homepage table does not show.
 *
 * FIGURES ARE TRANSCRIBED, NOT DERIVED. The bonus is not a percentage — see
 * the note above savingsPlans in site.ts — so every row is read straight
 * from that array. The only arithmetic here is deposit = amount x months
 * and total = deposit + bonus, which is exactly what the calculator does.
 */

const enquiryHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
  savingsScheme.enquiryMessage
)}`;

/** Devanagari-first stack, matching the calculator on the homepage. */
const MR = '"Nirmala UI","Noto Sans Devanagari","Mangal",system-ui,sans-serif';

export const metadata: Metadata = {
  title: "Gold Savings Scheme in Shikrapur — Elite Plan | Baba Jewellers",
  description:
    "Baba Jewellers Elite Plan gold savings scheme in Shikrapur, Pune. Save monthly from ₹5,000, get an additional benefit on maturity, and buy gold jewellery.",
  alternates: { canonical: `${site.url}/elite-plan/` },
  openGraph: {
    type: "website",
    url: `${site.url}/elite-plan/`,
    siteName: site.name,
    title: "Gold Savings Scheme in Shikrapur — Baba Jewellers Elite Plan",
    description:
      "Save monthly, receive an additional benefit on maturity, and buy gold jewellery at Baba Jewellers, Shikrapur.",
    locale: "en_IN",
  },
};

export default function ElitePlanPage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <section className="bg-maroon-deep py-16 md:py-24">
          <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
            <p
              className="text-center text-xs font-semibold uppercase tracking-caps text-gold"
              style={{ fontFamily: MR }}
            >
              {savingsScheme.name}
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl text-center font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-ivory">
              Gold Savings Scheme in Shikrapur
            </h1>
            <p
              className="mx-auto mt-3 text-center text-lg font-semibold text-gold-light"
              style={{ fontFamily: MR }}
            >
              {savingsScheme.heading}
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-ivory/80">
              Save a fixed amount each month for a chosen term. At the end of
              it you receive an additional benefit on top of everything you
              have saved, and the full value goes towards gold jewellery at
              either of our Shikrapur showrooms.
            </p>
          </div>
        </section>

        <section className="bg-ivory-warm py-16 md:py-20">
          <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-3xl font-bold text-maroon-deep">
              Every plan, in full
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-ink/75">
              These are the scheme&apos;s own figures, exactly as they appear
              on our counter poster. The additional benefit is a stated amount
              for each plan, not a percentage.
            </p>

            <div className="mx-auto mt-10 max-w-4xl overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse bg-ivory text-left shadow-[0_16px_44px_rgba(83,2,12,0.10)]">
                <caption className="sr-only">
                  Baba Jewellers Elite Plan — monthly amount, term, total
                  saved, additional benefit and total value for each plan
                </caption>
                <thead>
                  <tr className="border-b border-maroon/15 bg-maroon-deep text-ivory">
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Monthly
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Term
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Total saved
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Additional benefit
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Total value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {savingsPlans.map((plan) => {
                    const deposit = plan.amount * plan.months;
                    return (
                      <tr
                        key={`${plan.amount}-${plan.months}`}
                        className="border-b border-maroon/10 last:border-0"
                      >
                        <td className="px-4 py-3.5 text-[15px] font-medium text-ink/85">
                          {inr(plan.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-[15px] text-ink/75">
                          {plan.months} months
                        </td>
                        <td className="px-4 py-3.5 text-[15px] tabular-nums text-ink/75">
                          {inr(deposit)}
                        </td>
                        <td className="px-4 py-3.5 text-[15px] font-semibold tabular-nums text-maroon">
                          {inr(plan.bonus)}
                        </td>
                        <td className="px-4 py-3.5 font-display text-lg font-bold tabular-nums text-maroon-deep">
                          {inr(deposit + plan.bonus)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-center text-[13px] leading-relaxed text-ink/70">
              This scheme applies to gold jewellery purchases only. Terms and
              conditions apply.
            </p>
            <p
              className="mx-auto mt-2 max-w-2xl text-center text-[13px] leading-relaxed text-ink/70"
              style={{ fontFamily: MR }}
            >
              {savingsScheme.disclaimer}
            </p>

            <p className="mt-8 text-center">
              <Link
                href="/#yojana"
                className="text-sm font-semibold text-maroon underline underline-offset-4 transition-colors hover:text-maroon-soft"
              >
                Try the calculator on our homepage
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </section>

        <section className="bg-ivory py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold text-maroon-deep">
              How it works
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Choose a monthly amount and a term from the table above. You
                pay that amount each month for the length of the term, and we
                record every instalment against your name.
              </p>
              <p>
                When the term finishes, the additional benefit for your plan is
                added to everything you have saved. The combined value goes
                towards gold jewellery from our collection — bridal sets,
                necklaces, bangles, earrings or anything else in store.
              </p>
              <p>
                Longer terms and larger monthly amounts carry a larger
                additional benefit, which is why every combination is listed
                separately rather than worked out from a rate.
              </p>
            </div>

            <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
              Who it suits
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Families planning a wedding, and anyone who would rather set
                aside a manageable amount each month than find a large sum at
                once. Buying gradually also means your purchase is spread
                across the year&apos;s rates instead of resting on a single
                day&apos;s price. If it is a wedding you are saving for,{" "}
                <Link
                  href="/bridal-jewellery/"
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  our bridal jewellery page
                </Link>{" "}
                covers how a full set comes together.
              </p>
              <p>
                Every ornament you finally choose is 100% BIS Hallmarked, with
                the day&apos;s rate, making charges and GST shown openly, the
                same as any other purchase with us.
              </p>
            </div>

            <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
              Joining the scheme
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Come to either showroom and our team will enrol you and explain
                the terms in full. Bring your preferred monthly amount and term
                in mind, and ask us anything about how the instalments and the
                final purchase work.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-maroon-deep py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold text-ivory">
              Ask us about the Elite Plan
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
              Two showrooms in Shikrapur, open {site.businessHours}. We will
              walk you through the plans and the terms, with no obligation.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={enquiryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-sm bg-gold px-8 py-4 text-base font-semibold text-maroon-deep transition-colors hover:bg-gold-light"
              >
                Enquire on WhatsApp
              </a>
              <a
                href={`tel:${stores[0].callE164}`}
                className="inline-flex items-center justify-center rounded-sm border border-gold/50 px-8 py-4 text-base font-semibold text-gold-light transition-colors hover:border-gold hover:bg-gold/10"
              >
                Call {stores[0].callDisplay}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileActions />
      <HashScroll />
    </>
  );
}
