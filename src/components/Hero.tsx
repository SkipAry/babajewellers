import { site } from "@/data/site";
import TrackedLink from "./TrackedLink";

/* The hero is the LCP element, and it is the one image on this site that
   does NOT go through next/image.

   The static export turns Next's optimizer off (images.unoptimized), so
   <Image> emits a bare src and no srcset — every phone was downloading the
   full 1200x1800 file. A per-image `loader` prop does not help: unoptimized
   short-circuits it, verified by building with one attached. A global custom
   loader would work, but it would also hang a redundant srcset on all eleven
   product images.

   So this one image is a plain <img> with a hand-written srcset. It keeps
   width/height for CLS and uses fetchPriority to replace the preload that
   `priority` used to emit. Please do not switch it back to <Image> without
   re-checking the above.

   Both instances share one `sizes` expression on purpose. They are never
   visible at the same time, but the hidden one is still fetched, so if the
   two resolved to different widths a phone would download two files. One
   shared expression means one download whichever is showing. */

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-maroon-deep">
      {/* Mobile: full-bleed portrait behind content. Desktop: right column image. */}
      <div className="absolute inset-0 lg:hidden">
        <img
          src="/models/hero-model-1200.webp"
          srcSet="/models/hero-model-600.webp 600w,
                  /models/hero-model-900.webp 900w,
                  /models/hero-model-1200.webp 1200w"
          sizes="(min-width: 1024px) 45vw, 100vw"
          width={1200}
          height={1800}
          alt=""
          role="presentation"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/70 to-maroon-deep/20"
          aria-hidden="true"
        />
      </div>

      <div className="jaali relative mx-auto grid min-h-[100svh] w-full max-w-site items-center gap-10 px-4 pb-24 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-14 lg:pb-20 lg:pt-32 lg:px-8">
        {/* Copy */}
        <div className="relative flex h-full flex-col justify-end lg:justify-center">
          <p className="stamp-label text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Est. 9 June 2008 · Shikrapur, Pune
          </p>

          <h1 className="mt-5 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.1rem)] font-bold leading-[1.1]">
            <span className="gold-foil">Where Trust Meets Tradition,</span>{" "}
            <span className="text-ivory">and Every Ornament Tells a Story.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-ivory/80 md:text-lg">
            Pure, beautifully crafted gold and silver jewellery for weddings,
            festivals and every special occasion — served with honest pricing
            and a warm welcome since 2008.
          </p>

          <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-medium tracking-wide text-gold-light/90">
            <li>100% BIS Hallmarked</li>
            <li aria-hidden="true" className="text-gold/50">◆</li>
            <li>15-Day Returns</li>
            <li aria-hidden="true" className="text-gold/50">◆</li>
            <li>Transparent Pricing</li>
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <TrackedLink
              href="#collections"
              event="cta_explore_collections"
              placement="hero"
              className="inline-flex items-center justify-center rounded-sm bg-gold px-8 py-4 text-base font-semibold text-maroon-deep transition-colors hover:bg-gold-light"
            >
              Explore Our Collection
            </TrackedLink>
            <TrackedLink
              href="#stores"
              event="cta_visit_store"
              placement="hero"
              className="inline-flex items-center justify-center rounded-sm border border-gold/50 px-8 py-4 text-base font-semibold text-gold-light transition-colors hover:border-gold hover:bg-gold/10"
            >
              Visit Our Stores
            </TrackedLink>
          </div>

          <p className="mt-8 text-xs uppercase tracking-caps text-ivory/50">
            {site.tagline}
          </p>
        </div>

        {/* Desktop portrait — top edge aligns with the headline */}
        <div className="relative hidden min-h-[34rem] lg:mt-[4.55rem] lg:block">
          <div className="absolute inset-0 overflow-hidden rounded-t-[10rem]">
            <img
              src="/models/hero-model-1200.webp"
              srcSet="/models/hero-model-600.webp 600w,
                      /models/hero-model-900.webp 900w,
                      /models/hero-model-1200.webp 1200w"
              sizes="(min-width: 1024px) 45vw, 100vw"
              width={1200}
              height={1800}
              alt="Model wearing a traditional gold choker, long necklace and jhumkas from Baba Jewellers with a red silk saree"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-maroon-deep/40 to-transparent"
              aria-hidden="true"
            />
          </div>
          {/* Gold arch outline */}
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-t-[11rem] border border-gold/40"
          />
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#promises"
        aria-label="Scroll to our promises"
        className="absolute bottom-4 left-1/2 hidden h-11 w-11 -translate-x-1/2 items-center justify-center md:flex"
      >
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-gold/50 p-1.5">
          <span className="scroll-cue block h-1.5 w-1.5 rounded-full bg-gold" />
        </span>
      </a>
    </section>
  );
}
