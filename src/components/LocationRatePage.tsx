import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileActions from "@/components/MobileActions";
import type { PublishedRates } from "@/data/rates-config";
import { ratesCopy } from "@/data/rates-config";
import { inr, mapsLinkFor, site, stores } from "@/data/site";

/**
 * Shared shell for the per-town gold rate pages.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────
 *
 * Five towns were about to mean five copies of ~330 lines. Beyond the
 * obvious maintenance cost, that shape actively encourages the failure
 * mode these pages must avoid: when the whole page is copy-pasted, the
 * tempting edit is to swap the town name and move on, which is precisely
 * the doorway page Google penalises.
 *
 * Splitting it the other way makes the risk visible. Everything identical
 * between towns — the rate table, the schema, the CTA — lives here once.
 * Everything a page must justify on its own lives in `children`. If a new
 * town's `children` is thin, that is obvious at a glance rather than
 * buried in 300 lines of boilerplate.
 *
 * ── THE HONESTY RULE ──────────────────────────────────────────────
 *
 * Baba Jewellers has exactly two showrooms, both in Shikrapur. None of
 * these pages may imply a branch anywhere else. `intro` is required and
 * every caller states the real distance in it. A page that reads as
 * though the shop is in that town is a correctness bug.
 */

export type LocationRatePageProps = {
  /** Town as a reader would write it: "Shirur", "Ranjangaon". */
  town: string;
  /** H1. Usually `Gold Rate Today for ${town}`. */
  heading: string;
  /** Marathi line under the h1 — local search here happens in Marathi. */
  headingMr: string;
  /**
   * The honest paragraph directly under the heading. MUST state that the
   * showrooms are in Shikrapur and how far away that is. Required, not
   * optional, so it cannot be quietly dropped.
   */
  intro: ReactNode;
  /** Town-specific body. This is what earns the page its place. */
  children: ReactNode;
  /** Closing band heading, e.g. "Worth the drive from Shirur". */
  ctaHeading: string;
  ctaBody: string;
  /** Which showroom to push. Index into `stores`. */
  storeIndex?: 0 | 1;
};

export function readRates(): PublishedRates | null {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "rates.json"), "utf8");
    const data = JSON.parse(raw) as PublishedRates;
    if (!(data?.gold?.["24k"] > 0) || !(data?.silver?.["999"] > 0)) return null;
    return data;
  } catch {
    return null;
  }
}

export const IST_TODAY = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

/** Build-time title/description for a town page, price front-loaded. */
export function locationMeta(town: string, slug: string) {
  const r = readRates();
  const fresh = r?.goldStatus === "fresh";
  const title = fresh
    ? `Gold Rate Today ${town}: 22K ${inr(r!.gold["22k"])}, 24K ${inr(r!.gold["24k"])}/g | Baba Jewellers`
    : `Gold Rate Today in ${town} (${IST_TODAY}) — 24K, 22K, 18K | Baba Jewellers`;
  const description = fresh
    ? `24K ${inr(r!.gold["24k"])} · 22K ${inr(r!.gold["22k"])} · 18K ${inr(r!.gold["18k"])} · ` +
      `Silver ${inr(r!.silver["999"])} per gram — ${town}, ${IST_TODAY}. Updated daily. ` +
      `BIS Hallmarked. आजचा सोन्याचा भाव.`
    : `Gold rate today for ${town} — ${IST_TODAY}. Live 24K, 22K and 18K gold and silver ` +
      `rates per gram from Baba Jewellers, Shikrapur. Updated every morning.`;
  return { title, description, slug, fresh };
}

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

export default function LocationRatePage({
  town,
  heading,
  headingMr,
  intro,
  children,
  ctaHeading,
  ctaBody,
  storeIndex = 0,
}: LocationRatePageProps) {
  const data = readRates();
  const updated = data ? formatUpdated(data.quotedAt ?? data.updatedAt) : null;
  const store = stores[storeIndex];

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
              {heading}
            </h1>

            <p
              lang="mr"
              className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-ink/70"
            >
              {headingMr}
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-ink/80">
              {intro}
            </p>

            {data ? (
              <div className="mt-10 overflow-hidden rounded-sm border border-maroon/15 bg-ivory">
                <table className="w-full">
                  <caption className="sr-only">
                    Gold and silver rates per gram for {town}, {IST_TODAY}
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
          <div className="mx-auto max-w-3xl px-4 sm:px-6">{children}</div>
        </section>

        <section className="bg-maroon-deep py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold text-ivory">
              {ctaHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
              {ctaBody}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={`tel:${store.callE164}`}
                className="inline-flex items-center justify-center rounded-sm bg-gold px-8 py-4 text-base font-semibold text-maroon-deep transition-colors hover:bg-gold-light"
              >
                Call {store.callDisplay}
              </a>
              <a
                href={mapsLinkFor(store)}
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": `${site.url}/gold-rate-${town.toLowerCase().replace(/\s+/g, "-")}/#webpage`,
                url: `${site.url}/gold-rate-${town.toLowerCase().replace(/\s+/g, "-")}/`,
                name: heading,
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
                    name: `Gold Rate for ${town}`,
                    item: `${site.url}/gold-rate-${town.toLowerCase().replace(/\s+/g, "-")}/`,
                  },
                ],
              },
            ],
          }),
        }}
      />
    </>
  );
}
