import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import Header from "@/components/Header";
import MobileActions from "@/components/MobileActions";
import { offerCatalog, pieces, site, stores } from "@/data/site";

/**
 * BRIDAL JEWELLERY — the highest commercial intent of the category pages.
 *
 * The homepage shows this collection behind the #collections anchor, in a
 * filterable gallery. That gallery is good, but it is one anchor on one URL
 * and it says nothing about weddings, so a search for "bridal jewellery
 * shikrapur" has nothing to land on.
 *
 * Everything here comes from data the owner already maintains: the pieces
 * array for the photographs and their alt text, and offerCatalog for what
 * the shop actually stocks. No product claim is written by hand — a wrong
 * one on a wedding purchase would be an expensive thing to get wrong.
 */

export const metadata: Metadata = {
  title: "Bridal Jewellery in Shikrapur, Pune | Baba Jewellers",
  description:
    "BIS Hallmarked bridal gold jewellery in Shikrapur, Pune — chokers, necklace sets, mangalsutra, bangles and jhumkas. Transparent pricing, 15-day returns.",
  alternates: { canonical: `${site.url}/bridal-jewellery/` },
  openGraph: {
    type: "website",
    url: `${site.url}/bridal-jewellery/`,
    siteName: site.name,
    title: "Bridal Jewellery in Shikrapur, Pune",
    description:
      "BIS Hallmarked bridal gold jewellery at Baba Jewellers, Shikrapur — chokers, necklace sets, mangalsutra, bangles and jhumkas.",
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

export default function BridalJewelleryPage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <section className="bg-maroon-deep py-16 md:py-24">
          <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-caps text-gold">
              Since 2008 · Shikrapur, Pune
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl text-center font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-ivory">
              Bridal Jewellery in Shikrapur
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-ivory/80">
              Gold for the wedding day, chosen without pressure. Every piece is
              100% BIS Hallmarked, priced openly, and shown to you with the
              day&apos;s rate, making charges and GST written out in full.
            </p>
            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm font-medium tracking-wide text-gold-light/90">
              <li>100% BIS Hallmarked</li>
              <li aria-hidden="true" className="text-gold/50">◆</li>
              <li>15-Day Returns</li>
              <li aria-hidden="true" className="text-gold/50">◆</li>
              <li>Lifetime Exchange</li>
            </ul>
          </div>
        </section>

        <section className="bg-ivory py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold text-maroon-deep">
              What a bridal set is made of
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                A bridal set is rarely one ornament. It is a group of pieces
                that have to sit together on the day — around the neck, at the
                ears, on the wrists and on the hands — and look like they were
                always meant to.
              </p>
              <p>
                These are the categories we keep, and the ones most families
                draw from when they put a set together:
              </p>
            </div>
            <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {offerCatalog.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-2.5 text-[15px] text-ink/80"
                >
                  <span aria-hidden="true" className="text-gold">◆</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-relaxed text-ink/80">
              Come in with an idea, or with nothing at all. Our team will lay
              out options against your budget and the outfit, and there is no
              obligation to decide the same day.
            </p>
          </div>
        </section>

        <section className="bg-ivory-warm py-16 md:py-20">
          <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-3xl font-bold text-maroon-deep">
              From our collection
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-ink/75">
              A selection of what is in store. Stock changes, so ask us if
              there is something particular you have in mind.
            </p>

            <ul className="mt-12 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4">
              {pieces.map((piece) => (
                <li key={piece.id} className="m-0">
                  <figure className="m-0">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                      <Image
                        src={piece.image}
                        alt={piece.alt}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-transparent to-transparent opacity-90"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 p-4 text-left">
                        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-gold-light/90">
                          {piece.category}
                        </p>
                        <p className="m-0 mt-0.5 font-display text-lg font-bold text-ivory">
                          {piece.title}
                        </p>
                      </figcaption>
                    </div>
                  </figure>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-center">
              <Link
                href="/#collections"
                className="text-[13.5px] font-semibold text-maroon underline underline-offset-4 transition-colors hover:text-maroon-soft"
              >
                Browse the full collection
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </section>

        <section className="bg-ivory py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold text-maroon-deep">
              Planning the purchase
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Bridal gold is usually the largest single purchase a family
                makes in a year, and it is rarely decided in one visit. Two
                things are worth knowing before you start.
              </p>
              <p>
                <strong className="font-semibold text-maroon-deep">
                  The rate moves daily.
                </strong>{" "}
                Gold is priced per gram against the international market, so
                the same set costs differently in different weeks. You can{" "}
                <Link
                  href="/gold-rate-shikrapur/"
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  check today&apos;s rate
                </Link>{" "}
                before you visit.
              </p>
              <p>
                <strong className="font-semibold text-maroon-deep">
                  You can buy it gradually.
                </strong>{" "}
                Our{" "}
                <Link
                  href="/elite-plan/"
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  Elite Plan savings scheme
                </Link>{" "}
                lets you set aside a fixed amount each month and receive an
                additional benefit at the end of the term, which then goes
                towards the jewellery. Families planning a wedding a year or
                two out often start there.
              </p>
            </div>

            <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
              Why hallmarking matters here
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                On a purchase this size, purity is not a detail. Every gold
                ornament we sell is 100% BIS Hallmarked, which means its purity
                is certified by the Bureau of Indian Standards rather than
                promised across a counter.
              </p>
              <p>
                That certification is also what protects the value of the set
                years later, when a family comes back to exchange or add to it.
                We offer a lifetime exchange facility and returns within 15
                days, as per our return policy.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-maroon-deep py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold text-ivory">
              Come and try the pieces on
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
              Two showrooms in Shikrapur, open {site.businessHours}. Bring the
              family — there is no hurry and no obligation.
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
      <HashScroll />
    </>
  );
}
