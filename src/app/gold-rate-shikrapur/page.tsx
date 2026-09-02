import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileActions from "@/components/MobileActions";
import type { PublishedRates } from "@/data/rates-config";
import { ratesCopy } from "@/data/rates-config";
import { inr, site, stores } from "@/data/site";

/**
 * TODAY'S GOLD RATE IN SHIKRAPUR.
 *
 * Unlike the homepage card, which fetches /rates.json in the browser, this
 * page reads the same file at BUILD time and renders the figures into the
 * static HTML. A crawler must see real numbers here — a client-side fetch
 * renders as loading skeletons to Googlebot, which is useless on the one
 * page whose purpose is ranking for the rate itself.
 *
 * Freshness is identical either way: the rates bot commits rates.json and
 * that push triggers the deploy, so the built page carries the same figures
 * the JSON does.
 */

/**
 * SEO: the title and description carry TODAY'S DATE, generated at build.
 *
 * This is not decoration. Searched "gold rate today Pune" on 1 Sep 2026, the
 * entire first page was national finance portals — 5paisa, Groww, Bajaj
 * Finserv, PolicyBazaar, Kotak Neo, Goodreturns, Kalyan. Every one of them
 * puts the date in the title ("...01 September 2026"). Two things follow:
 *
 *   1. The date is what matches the word "today" in the query. A title
 *      without it competes on the word "today" alone, which every page in
 *      the category also claims.
 *   2. It only stays true because the page is rebuilt daily by the rates
 *      job. A hardcoded date would rot into a lie within 24 hours, which is
 *      worse than no date — Google demotes stale "today" pages.
 *
 * We are NOT trying to outrank those portals; a single shop cannot, and
 * pretending otherwise would shape the whole site wrongly. The target is
 * "gold rate Shikrapur / Shirur / near me", where the incumbents are
 * auto-generated pincode pages with no shop behind them.
 */
const IST_TODAY = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export const metadata: Metadata = {
  title: `Gold Rate Today in Shikrapur, Pune (${IST_TODAY}) — 24K, 22K, 18K | Baba Jewellers`,
  description:
    `Gold rate today in Shikrapur, Pune — ${IST_TODAY}. Live 24K, 22K and 18K gold rate ` +
    `and silver rate per gram at Baba Jewellers, Pune–Nagar Road. Updated every morning. ` +
    `BIS Hallmarked, transparent pricing. आजचा सोन्याचा भाव शिक्रापूर.`,
  /* No `keywords` meta: dropped deliberately in 7d436b6 because search
     engines ignore it, and re-adding it here would have quietly undone
     that call. The target terms live in the title, h1, body and Marathi
     line instead, where they actually count:
       gold rate today shikrapur · gold rate shirur · 22k gold rate
       shikrapur · silver rate shikrapur · आजचा सोन्याचा भाव · jewellers
       near me shikrapur */
  alternates: { canonical: `${site.url}/gold-rate-shikrapur/` },
  openGraph: {
    type: "website",
    url: `${site.url}/gold-rate-shikrapur/`,
    siteName: site.name,
    title: `Gold Rate Today in Shikrapur, Pune — ${IST_TODAY}`,
    description:
      `Live 24K, 22K and 18K gold rate and silver rate per gram in Shikrapur, Pune. ` +
      `Updated every morning by Baba Jewellers.`,
    locale: "en_IN",
  },
};

const RATE_ROWS = [
  { key: "24k", label: "24K Gold", note: "Purest form — coins and bars" },
  { key: "22k", label: "22K Gold", note: "What most jewellery is made in" },
  { key: "18k", label: "18K Gold", note: "Stone-set and lighter designs" },
  { key: "999", label: "Silver 999", note: "Fine silver" },
] as const;

/**
 * Read the published rates at build time.
 *
 * Returns null rather than throwing if the file is missing or malformed:
 * a bad rates file must not break the deploy for every other page, and the
 * page below simply omits the figures instead of publishing a wrong one.
 */
function readRates(): PublishedRates | null {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "rates.json"), "utf8");
    const data = JSON.parse(raw) as PublishedRates;
    if (!(data?.gold?.["24k"] > 0) || !(data?.silver?.["999"] > 0)) return null;
    return data;
  } catch {
    return null;
  }
}

/** "Friday, 14 August 2026 at 6:08 pm" in India time. */
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

export default function GoldRatePage() {
  const data = readRates();
  /* Show when the price was struck, not when we fetched it — the same rule
     the homepage card follows, so the two surfaces never disagree. */
  const updated = data ? formatUpdated(data.quotedAt ?? data.updatedAt) : null;

  /**
   * SCHEMA. This page had none at all, which was the largest single gap:
   * a page whose entire value is being CURRENT was giving Google no
   * machine-readable signal that it changes.
   *
   * `dateModified` is the important field. It comes from the real quote
   * timestamp, not from Date.now(), so it cannot claim freshness the data
   * does not have — if the rates job fails, the date stops advancing and
   * says so honestly.
   *
   * Deliberately NOT using Product/Offer markup. The figures are the day's
   * metal rate, not the price of a purchasable item — making charges and
   * GST sit on top. Marking them as Offers would be richer-looking and
   * wrong, and Google penalises structured data that misrepresents price.
   */
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}/gold-rate-shikrapur/#webpage`,
        url: `${site.url}/gold-rate-shikrapur/`,
        name: `Gold Rate Today in Shikrapur, Pune — ${IST_TODAY}`,
        description:
          "Daily 24K, 22K and 18K gold rate and silver rate per gram in Shikrapur, Pune.",
        inLanguage: "en-IN",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#store` },
        ...(data?.quotedAt || data?.updatedAt
          ? { dateModified: data.quotedAt ?? data.updatedAt }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${site.url}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Gold Rate Today in Shikrapur",
            item: `${site.url}/gold-rate-shikrapur/`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <section className="bg-ivory-warm py-16 md:py-24">
          <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-caps text-maroon-soft">
              {ratesCopy.label}
            </p>
            {/* h1 carries the query as people type it: "gold rate today"
                + the town. The old wording ("Today's Gold Rate in
                Shikrapur") missed the exact phrase and the district, both
                of which the competing pages carry. */}
            <h1 className="mx-auto mt-4 max-w-3xl text-center font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-maroon-deep">
              Gold Rate Today in Shikrapur, Pune
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-ink/75">
              Live 24K, 22K and 18K gold rate and silver rate per gram at Baba
              Jewellers, Pune–Nagar Road, Shikrapur — updated every morning.
              Ask in store for the exact rate at the time of purchase.
            </p>
            {/* Marathi line. Shikrapur and Shirur customers search in
                Devanagari as often as in English, and the site had no
                Marathi anywhere — a whole class of local queries it could
                not match. */}
            <p
              lang="mr"
              className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-ink/70"
            >
              आजचा सोन्याचा आणि चांदीचा भाव — शिक्रापूर, पुणे. दररोज सकाळी अद्ययावत.
            </p>

            <div className="mx-auto mt-12 max-w-2xl">
              <div className="rounded-2xl border border-maroon/12 bg-ivory p-6 shadow-[0_16px_44px_rgba(83,2,12,0.10)] sm:p-9">
                {data ? (
                  <>
                    <dl className="m-0 divide-y divide-maroon/10">
                      {RATE_ROWS.map((row) => {
                        const value =
                          row.key === "999"
                            ? data.silver["999"]
                            : data.gold[row.key as "24k" | "22k" | "18k"];
                        return (
                          <div
                            key={row.key}
                            className="flex items-baseline justify-between gap-4 py-3.5"
                          >
                            <dt className="text-[15px] font-medium text-ink/85 sm:text-base">
                              {row.label}
                              <span className="mt-0.5 block text-[12.5px] font-normal text-ink/55">
                                {row.note}
                              </span>
                            </dt>
                            <dd className="m-0 font-display text-[clamp(1.25rem,3.5vw,1.6rem)] font-bold tabular-nums text-maroon-deep">
                              {inr(value)}
                              <span className="ml-1 text-[13px] font-normal text-ink/70">
                                /g
                              </span>
                            </dd>
                          </div>
                        );
                      })}
                    </dl>

                    <div
                      aria-hidden="true"
                      className="my-6 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                    />

                    {updated ? (
                      <p className="m-0 text-center text-[13px] text-ink/65">
                        Rate as of {updated}
                      </p>
                    ) : null}

                    <p className="m-0 mt-5 text-center text-[12.5px] leading-relaxed text-ink/70">
                      {ratesCopy.disclaimer}
                    </p>
                  </>
                ) : (
                  <p className="m-0 py-8 text-center text-base text-ink/70">
                    {ratesCopy.unavailable}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ivory py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold text-maroon-deep">
              24K, 22K or 18K — which is which?
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                24K is the purest form of gold. It is soft, which is why it is
                bought as coins and bars rather than worn as ornaments.
              </p>
              <p>
                22K is what most Indian jewellery is made in. Mixing a small
                amount of other metal gives the gold enough strength to hold a
                setting and survive daily wear, while staying close to pure.
              </p>
              <p>
                18K is harder still, which suits stone-set pieces and lighter,
                more detailed designs where the metal has to grip securely.
              </p>
              <p>
                Every gold ornament at Baba Jewellers is 100% BIS Hallmarked,
                so the purity you are quoted is certified rather than
                promised.
              </p>
            </div>

            <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
              What you actually pay
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                The rate above is the price of the metal itself, per gram. The
                final price of an ornament is that rate multiplied by its
                weight, plus making charges for the craftsmanship, plus GST.
              </p>
              <p>
                We show all three parts openly — the day&apos;s rate, the
                making charges and the GST — with no hidden costs. You are
                welcome to ask for a complete breakup before you buy.
              </p>
              <p>
                Weight matters most on the heavier pieces, which is why it is
                worth knowing the rate before a wedding purchase. Our{" "}
                <Link
                  href="/bridal-jewellery/"
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  bridal jewellery page
                </Link>{" "}
                sets out what a full set usually includes.
              </p>
            </div>

            <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
              Why the rate changes every day
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Gold is traded internationally, so the rate moves with the
                global spot price, the rupee&apos;s exchange rate against the
                dollar, and import duty. Bullion markets are shut at weekends
                and on holidays, which is why the rate sometimes reads the same
                two days running.
              </p>
              <p>
                We refresh this page every morning. For the exact rate at the
                moment you buy, call us or visit either showroom.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-maroon-deep py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold text-ivory">
              Come and see the pieces in person
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
              Two showrooms in Shikrapur, open {site.businessHours}. Ask for
              the day&apos;s rate and a full price breakup — no obligation.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={`tel:${stores[0].callE164}`}
                className="inline-flex items-center justify-center rounded-sm bg-gold px-8 py-4 text-base font-semibold text-maroon-deep transition-colors hover:bg-gold-light"
              >
                Call {stores[0].callDisplay}
              </a>
              <Link
                href="/#stores"
                className="inline-flex items-center justify-center rounded-sm border border-gold/50 px-8 py-4 text-base font-semibold text-gold-light transition-colors hover:border-gold hover:bg-gold/10"
              >
                Visit Our Stores
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileActions />
    </>
  );
}
