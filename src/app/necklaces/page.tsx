import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import Header from "@/components/Header";
import MobileActions from "@/components/MobileActions";
import { pieces, site, stores } from "@/data/site";

/**
 * GOLD NECKLACES — the first of the category pages.
 *
 * The copy here is deliberately about necklaces themselves — the styles we
 * carry, how they are worn, how they are priced by weight — rather than
 * about weddings. /bridal-jewellery/ already covers the occasion, and two
 * pages saying the same thing in different words would compete with each
 * other rather than rank.
 *
 * The gallery is filtered from the same `pieces` array the homepage uses,
 * so a new necklace added there appears here with no change to this file.
 */

const necklaces = pieces.filter((piece) => piece.category === "Necklaces");

export const metadata: Metadata = {
  title: "Gold Necklaces in Shikrapur, Pune | Baba Jewellers",
  description:
    "BIS Hallmarked gold necklaces in Shikrapur, Pune — chokers, long temple necklaces, pendant chains and necklace sets. Transparent pricing, 15-day returns.",
  alternates: { canonical: `${site.url}/necklaces/` },
  openGraph: {
    type: "website",
    url: `${site.url}/necklaces/`,
    siteName: site.name,
    title: "Gold Necklaces in Shikrapur, Pune",
    description:
      "BIS Hallmarked gold necklaces at Baba Jewellers, Shikrapur — chokers, long temple necklaces, pendant chains and necklace sets.",
    locale: "en_IN",
  },
};

export default function NecklacesPage() {
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
              Gold Necklaces in Shikrapur
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-ivory/80">
              Chokers that sit high at the collar, long temple pieces that fall
              to the waist, and everyday chains with a single pendant. Every
              one is 100% BIS Hallmarked and priced openly by weight.
            </p>
          </div>
        </section>

        <section className="bg-ivory-warm py-16 md:py-20">
          <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-3xl font-bold text-maroon-deep">
              Necklaces in store
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-ink/75">
              A selection of what we carry. Stock changes through the year, so
              ask us if you have a particular style or length in mind.
            </p>

            <ul className="mx-auto mt-12 grid max-w-5xl list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4">
              {necklaces.map((piece) => (
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
                        <p className="m-0 font-display text-lg font-bold text-ivory">
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
              Choosing a length
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Length decides more about how a necklace looks than the design
                does. A choker sits close at the base of the neck and fills the
                space above a blouse or a high neckline, which is why it reads
                as formal and why it photographs so well at weddings.
              </p>
              <p>
                A long necklace falls well below the collar and is usually worn
                over the outfit rather than against the skin. Temple-style
                pieces in this length carry the most detail and the most
                weight, and they are often the centre of a bridal set.
              </p>
              <p>
                A pendant on a plain chain is the lightest of the three, and
                the one most people wear daily. It is also the easiest to add
                to later, since the chain and the pendant can be chosen
                separately.
              </p>
            </div>

            <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
              How a necklace is priced
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Gold jewellery is priced by weight. The rate per gram for the
                purity you choose is multiplied by the weight of the piece,
                then making charges for the craftsmanship and GST are added.
              </p>
              <p>
                Heavier, more detailed pieces cost more on both counts — more
                metal and more work — which is why an intricate temple necklace
                and a plain chain of the same weight are not the same price. We
                write all of it out before you buy, and you can{" "}
                <Link
                  href="/gold-rate-shikrapur/"
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  check today&apos;s gold rate
                </Link>{" "}
                before you come in.
              </p>
            </div>

            <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
              Purity and after-sales
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
              <p>
                Most necklaces are made in 22K, which holds a setting and
                survives daily wear while staying close to pure. Every gold
                piece we sell is 100% BIS Hallmarked, so the purity is
                certified rather than promised.
              </p>
              <p>
                We offer returns within 15 days as per our return policy, and a
                lifetime exchange facility if you later want to trade a piece
                towards something else.
              </p>
              <p>
                Buying a heavier necklace for a wedding? Our{" "}
                <Link
                  href="/elite-plan/"
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  Elite Plan savings scheme
                </Link>{" "}
                lets you set the amount aside monthly, and{" "}
                <Link
                  href="/bridal-jewellery/"
                  className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
                >
                  our bridal page
                </Link>{" "}
                covers how a full set comes together.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-maroon-deep py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold text-ivory">
              See them in person
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
              Two showrooms in Shikrapur, open {site.businessHours}. Try on a
              few lengths before you decide — there is no obligation.
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
