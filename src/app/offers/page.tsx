import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileActions from "@/components/MobileActions";
import { mapsLinkFor, offers, site, stores } from "@/data/site";

/**
 * RUNNING OFFERS — the page that carries the offers as TEXT.
 *
 * The homepage shows the same offers as banner strips, but the banners are
 * images with the wording baked into the artwork. A crawler reads none of
 * it, so the homepage cannot match a query like "gold making charges offer
 * shikrapur" no matter how prominent the banner looks to a person.
 *
 * This page exists to be that match: title, h1 and body all say the same
 * thing the artwork does, in English and in Marathi. Shikrapur and Shirur
 * customers search in Devanagari as often as in English — the same reason
 * /gold-rate-shikrapur/ carries a Marathi line.
 *
 * Offers are already filtered by `validTill` at build time in site.ts, so
 * an expired offer disappears from here on the next deploy. If every offer
 * expires the page stays up and says so rather than 404ing: a dead link
 * from Instagram or a WhatsApp forward is worse than an honest empty page,
 * and the URL keeps whatever ranking it has earned for the next campaign.
 */

const ordinalDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const PAGE_URL = `${site.url}/offers/`;

/* Built from the live offers so the description always names what is
   actually running, rather than a sentence that rots after a campaign. */
const offerSummary = offers.map((o) => o.headline).join(". ");

export const metadata: Metadata = {
  title: "Gold & Silver Jewellery Offers in Shikrapur, Pune | Baba Jewellers",
  description:
    (offerSummary ? `${offerSummary}. ` : "") +
    "Current gold and silver jewellery offers at Baba Jewellers, Shikrapur — " +
    "Pune–Nagar Road and Talegaon Dhamdhere Road. BIS Hallmarked, transparent " +
    "pricing. सोन्या-चांदीच्या दागिन्यांवर ऑफर — शिक्रापूर, पुणे.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: site.name,
    title: "Running Offers on Gold & Silver Jewellery — Shikrapur, Pune",
    description:
      offerSummary ||
      "Current gold and silver jewellery offers at Baba Jewellers, Shikrapur.",
    locale: "en_IN",
    images: offers.length ? [{ url: offers[0].image }] : undefined,
  },
};

export default function OffersPage() {
  /**
   * SCHEMA. Each running offer is emitted as an `Offer` attached to both
   * branches via `offeredBy`, pointing at the JewelryStore @ids the layout
   * already publishes — so the offers hang off the business entity Google
   * knows rather than floating free.
   *
   * No `price` or `priceCurrency`: these are discounts on making charges,
   * not the price of a purchasable item, and the final figure depends on
   * the day's metal rate and the weight of the piece. Inventing a number
   * to make the markup look richer is exactly the misrepresentation that
   * gets structured data ignored — the same call /gold-rate-shikrapur/
   * makes when it refuses to mark daily rates up as Offers.
   */
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Gold & Silver Jewellery Offers in Shikrapur, Pune",
        description:
          "Current offers on gold and silver jewellery at Baba Jewellers, Shikrapur, Pune.",
        inLanguage: "en-IN",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: "Offers", item: PAGE_URL },
        ],
      },
      ...offers.map((offer) => ({
        "@type": "Offer",
        "@id": `${PAGE_URL}#offer-${offer.id}`,
        name: offer.headline,
        description: `${offer.headline}. ${offer.headlineMr}`,
        url: PAGE_URL,
        image: `${site.url}${offer.image}`,
        category: "Jewellery making charges discount",
        availability: "https://schema.org/InStock",
        ...(offer.validTill ? { validThrough: offer.validTill } : {}),
        offeredBy: stores.map((store) => ({
          "@id": `${site.url}/#store-${store.id}`,
        })),
        areaServed: { "@type": "City", name: "Shikrapur" },
      })),
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
              Running Offers
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl text-center font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-maroon-deep">
              Gold &amp; Silver Jewellery Offers in Shikrapur, Pune
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-ink/75">
              What is running right now at both our Shikrapur showrooms — on
              Pune–Nagar Road and on Talegaon Dhamdhere Road. Every ornament is
              100% BIS Hallmarked, and we show the day&apos;s rate, the making
              charges and the GST openly before you buy.
            </p>
            <p
              lang="mr"
              className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-ink/70"
            >
              सोन्या-चांदीच्या दागिन्यांवरील सध्याच्या ऑफर — शिक्रापूर, पुणे.
            </p>
          </div>
        </section>

        <section className="bg-ivory py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            {offers.length === 0 ? (
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold text-maroon-deep">
                  No offer is running at the moment
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink/80">
                  Our next offer will appear here as soon as it starts. In the
                  meantime you are always welcome to ask in store for the
                  day&apos;s rate and a full price breakup.
                </p>
              </div>
            ) : (
              <ul className="m-0 list-none space-y-16 p-0">
                {offers.map((offer) => (
                  <li key={offer.id}>
                    <article>
                      <h2 className="font-display text-3xl font-bold leading-tight text-maroon-deep">
                        {offer.headline}
                      </h2>
                      <p
                        lang="mr"
                        className="mt-3 font-display text-xl font-bold text-maroon"
                      >
                        {offer.headlineMr}
                      </p>
                      {offer.validTill ? (
                        <p className="mt-3 text-sm font-semibold uppercase tracking-caps text-maroon-soft">
                          Valid till {ordinalDate(offer.validTill)}
                        </p>
                      ) : null}

                      {/* Same two creatives the homepage strip uses: the 2:1
                          re-layout below 640px, the 3:1 banner above it. */}
                      <picture>
                        <source
                          media="(max-width: 639px)"
                          srcSet={offer.imageMobile}
                          width={1200}
                          height={600}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={offer.image}
                          alt={offer.alt}
                          width={1602}
                          height={534}
                          loading="lazy"
                          decoding="async"
                          className="mt-6 aspect-[2/1] w-full rounded-sm object-cover sm:aspect-[3/1]"
                        />
                      </picture>

                      <p className="mt-6 text-base leading-relaxed text-ink/80">
                        Applies to {offer.headline.toLowerCase()} at both Baba
                        Jewellers showrooms in Shikrapur. Making charges are the
                        cost of the craftsmanship, charged on top of the
                        day&apos;s metal rate — so this is a direct saving on
                        the price you pay. Ask in store for a full breakup
                        before you buy, or see{" "}
                        <Link
                          href="/gold-rate-shikrapur/"
                          className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                        >
                          today&apos;s gold rate in Shikrapur
                        </Link>
                        .
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            )}

            <h2 className="mt-16 font-display text-3xl font-bold text-maroon-deep">
              How to claim an offer
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Simply visit either showroom and mention the offer — there is
                no coupon or code. Both branches are open{" "}
                {site.businessHours}, and the offer runs at both.
              </p>
              <p>
                Offers apply to making charges only. The metal rate and GST are
                charged as normal and are shown to you separately, as they
                always are. Offers cannot be combined with each other, and run
                until the date shown above or until we announce otherwise.
              </p>
              <p>
                Planning a wedding purchase? Making charges matter most on the
                heavier pieces — our{" "}
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
              Where to find us in Shikrapur
            </h2>
            <ul className="mt-6 list-none space-y-6 p-0">
              {stores.map((store) => (
                <li
                  key={store.id}
                  className="rounded-2xl border border-maroon/12 bg-ivory-warm p-6"
                >
                  <p className="m-0 font-display text-xl font-bold text-maroon-deep">
                    {store.line1}
                  </p>
                  <p className="m-0 mt-1 text-base text-ink/75">
                    {store.line2}, {store.city}
                  </p>
                  <p className="m-0 mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base">
                    <a
                      href={`tel:${store.callE164}`}
                      className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                    >
                      {store.callDisplay}
                    </a>
                    <a
                      href={mapsLinkFor(store)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                    >
                      Get directions
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-maroon-deep py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold text-ivory">
              Come and see the pieces in person
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
              Two showrooms in Shikrapur, open {site.businessHours}. Ask for the
              day&apos;s rate and a full price breakup — no obligation.
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
