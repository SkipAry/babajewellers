import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileActions from "@/components/MobileActions";
import type { PublishedRates } from "@/data/rates-config";
import { ratesCopy } from "@/data/rates-config";
import { inr, mapsLinkFor, site, stores } from "@/data/site";

/**
 * TODAY'S GOLD RATE FOR SHIRUR.
 *
 * ── WHY THIS PAGE IS NOT A COPY OF /gold-rate-shikrapur/ ──────────
 *
 * Location pages that clone a template and swap the town name are
 * doorway pages, and Google names them explicitly as a spam pattern.
 * Two defences are built in here:
 *
 *   1. The purity explainer ("24K, 22K or 18K — which is which?") and the
 *      "what you actually pay" breakdown live ONLY on the Shikrapur page.
 *      This page links to them. Duplicating that prose across two routes
 *      would be internal duplicate content and would make both weaker.
 *
 *   2. Everything written here is specific to a reader in Shirur — which
 *      showroom is on their side of the road, what the journey is, why the
 *      rate is identical wherever they check it. None of it would make
 *      sense on the Shikrapur page.
 *
 * ── AND THE HONEST PART ───────────────────────────────────────────
 *
 * Baba Jewellers has NO branch in Shirur. Both showrooms are in
 * Shikrapur. This page therefore says so, plainly, above the fold. It
 * targets "gold rate Shirur" because that is a real question a Shirur
 * reader asks and we can answer it truthfully — the metal rate is the
 * same in both towns. It must never imply a Shirur shop. If the wording
 * ever drifts toward suggesting one, that is a correctness bug, not a
 * copy preference.
 */

const IST_TODAY = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

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

const ratesForMeta = readRates();
const metaRatesFresh = ratesForMeta?.goldStatus === "fresh";

/* Same front-loaded-price pattern as the Shikrapur page, for the same
   reason: the figure is what earns the click, and it must clear the ~60
   characters Google renders before the brand does. */
const metaTitle = metaRatesFresh
  ? `Gold Rate Today Shirur: 22K ${inr(ratesForMeta!.gold["22k"])}, ` +
    `24K ${inr(ratesForMeta!.gold["24k"])}/g | Baba Jewellers`
  : `Gold Rate Today in Shirur, Pune (${IST_TODAY}) — 24K, 22K, 18K | Baba Jewellers`;

const metaDescription = metaRatesFresh
  ? `24K ${inr(ratesForMeta!.gold["24k"])} · 22K ${inr(ratesForMeta!.gold["22k"])} · ` +
    `18K ${inr(ratesForMeta!.gold["18k"])} · Silver ${inr(ratesForMeta!.silver["999"])} per gram ` +
    `— Shirur taluka, ${IST_TODAY}. Updated daily. BIS Hallmarked. आजचा सोन्याचा भाव.`
  : `Gold rate today for Shirur, Pune district — ${IST_TODAY}. Live 24K, 22K and 18K ` +
    `gold and silver rates per gram from Baba Jewellers, Shikrapur. Updated every morning.`;

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: `${site.url}/gold-rate-shirur/` },
  openGraph: {
    type: "website",
    url: `${site.url}/gold-rate-shirur/`,
    siteName: site.name,
    title: metaRatesFresh
      ? `Gold Rate Today Shirur — 22K ${inr(ratesForMeta!.gold["22k"])}/g, 24K ${inr(ratesForMeta!.gold["24k"])}/g`
      : `Gold Rate Today in Shirur, Pune — ${IST_TODAY}`,
    description:
      `Today's 24K, 22K and 18K gold rate and silver rate per gram for Shirur taluka, ` +
      `from Baba Jewellers on the Pune–Nagar road at Shikrapur.`,
    locale: "en_IN",
    images: [
      {
        url: "/models/hero-model.webp",
        width: 1200,
        height: 1800,
        alt: "Traditional gold jewellery from Baba Jewellers",
      },
    ],
  },
};

const RATE_ROWS = [
  { key: "24k", label: "24K Gold", note: "Coins and bars" },
  { key: "22k", label: "22K Gold", note: "Most jewellery" },
  { key: "18k", label: "18K Gold", note: "Stone-set designs" },
  { key: "999", label: "Silver 999", note: "Fine silver" },
] as const;

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

export default function GoldRateShirurPage() {
  const data = readRates();
  const updated = data ? formatUpdated(data.quotedAt ?? data.updatedAt) : null;

  /* The Karanje Complex store sits on the Pune–Nagar road, which is the
     road Shirur traffic is already on. Named explicitly rather than
     listing both, because "which one do I go to" is the actual question
     a reader from out of town has. */
  const roadsideStore = stores[0];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}/gold-rate-shirur/#webpage`,
        url: `${site.url}/gold-rate-shirur/`,
        name: metaTitle,
        description: metaDescription,
        inLanguage: "en-IN",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#organization` },
        ...(data?.quotedAt || data?.updatedAt
          ? { dateModified: data.quotedAt ?? data.updatedAt }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Gold Rate for Shirur",
            item: `${site.url}/gold-rate-shirur/`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <section className="bg-ivory-warm py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="stamp-label text-center text-xs font-semibold uppercase tracking-caps text-maroon">
              {ratesCopy.label}
            </p>

            <h1 className="mx-auto mt-4 max-w-3xl text-center font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-maroon-deep">
              Gold Rate Today for Shirur
            </h1>

            <p
              lang="mr"
              className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-ink/70"
            >
              आजचा सोन्याचा आणि चांदीचा भाव — शिरूर तालुका. दररोज सकाळी अद्ययावत.
            </p>

            {/* Stated immediately, not buried. A reader searching "gold rate
                Shirur" deserves to know in the first breath that the shop is
                in Shikrapur rather than discovering it after a drive. */}
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-ink/80">
              Baba Jewellers is in <strong>Shikrapur</strong>, about 35 km
              from Shirur along the Pune–Nagar road. We do not have a Shirur
              branch. The rate below is the rate you will be quoted at either
              of our showrooms.
            </p>

            {data ? (
              <div className="mt-10 overflow-hidden rounded-sm border border-maroon/15 bg-ivory">
                <table className="w-full">
                  <caption className="sr-only">
                    Gold and silver rates per gram, {IST_TODAY}
                  </caption>
                  <tbody>
                    {RATE_ROWS.map((row) => (
                      <tr
                        key={row.key}
                        className="border-b border-maroon/10 last:border-0"
                      >
                        <th
                          scope="row"
                          className="px-5 py-5 text-left font-display text-lg font-bold text-maroon-deep"
                        >
                          {row.label}
                          <span className="mt-0.5 block text-xs font-normal uppercase tracking-caps text-ink/50">
                            {row.note}
                          </span>
                        </th>
                        <td className="px-5 py-5 text-right font-display text-xl font-bold text-maroon-deep">
                          {inr(
                            row.key === "999"
                              ? data.silver["999"]
                              : data.gold[row.key as "24k" | "22k" | "18k"]
                          )}
                          <span className="text-sm font-normal text-ink/60">/g</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="border-t border-maroon/10 px-5 py-4 text-center text-xs leading-relaxed text-ink/60">
                  {updated ? `Updated ${updated}. ` : ""}
                  {ratesCopy.disclaimer}
                </p>
              </div>
            ) : (
              <p className="mt-10 text-center text-base text-ink/70">
                {ratesCopy.unavailable}
              </p>
            )}
          </div>
        </section>

        <section className="bg-ivory py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold text-maroon-deep">
              Is the gold rate different in Shirur?
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                No. Gold is traded internationally and the rate follows the
                global spot price, the rupee against the dollar, and import
                duty. It does not change between Shirur and Shikrapur, or
                between Shikrapur and Pune.
              </p>
              <p>
                What does differ from shop to shop is the{" "}
                <strong>making charges</strong> and whether the gold is
                genuinely hallmarked. Those are where the real difference in
                what you pay comes from — not the metal rate. It is worth
                asking any jeweller for the rate, the making charges and the
                GST as three separate numbers before you commit.
              </p>
              <p>
                We set those out in full on our{" "}
                <Link
                  href="/gold-rate-shikrapur/"
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  Shikrapur gold rate page
                </Link>
                , along with what separates 24K, 22K and 18K.
              </p>
            </div>

            <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
              Coming from Shirur
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                It is about 35 km down the Pune–Nagar road, roughly
                three-quarters of an hour. Our original showroom —{" "}
                {roadsideStore.line1} — sits on that road at Shikrapur, so it
                is directly on your route if you are heading toward Pune. It
                has been open since 9 June 2008.
              </p>
              <p>
                Our second showroom at Baba Complex is on the
                Shikrapur–Talegaon Dhamdhere road, which suits you better if
                you are approaching from that side.
              </p>
              <p>
                Both are open {site.businessHours}. Call ahead on{" "}
                <a
                  href={`tel:${roadsideStore.callE164}`}
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  {roadsideStore.callDisplay}
                </a>{" "}
                and we will keep pieces ready so the trip is worth making.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-maroon-deep py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold text-ivory">
              Worth the drive from Shirur
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
              100% BIS Hallmarked gold, the day&apos;s rate shown openly, and
              making charges quoted before you buy — not after.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={`tel:${roadsideStore.callE164}`}
                className="inline-flex items-center justify-center rounded-sm bg-gold px-8 py-4 text-base font-semibold text-maroon-deep transition-colors hover:bg-gold-light"
              >
                Call {roadsideStore.callDisplay}
              </a>
              <a
                href={mapsLinkFor(roadsideStore)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-sm border border-gold/50 px-8 py-4 text-base font-semibold text-gold-light transition-colors hover:border-gold hover:bg-gold/10"
              >
                Get Directions
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileActions />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
