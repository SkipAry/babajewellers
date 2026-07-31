import Image from "next/image";
import { whatsappLink } from "@/data/site";
import Reveal from "./Reveal";
import TrackedLink from "./TrackedLink";

/** Full-width closing statement + conversion band. */
export default function PromiseBand() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <Image
        src="/models/model-seated.webp"
        alt=""
        role="presentation"
        fill
        sizes="100vw"
        className="object-cover object-[50%_30%]"
      />
      <div className="absolute inset-0 bg-maroon-deep/90" aria-hidden="true" />
      <div className="jaali absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-site px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <p className="stamp-label justify-center text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Our Promise
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2rem,5.5vw,3.4rem)] font-bold leading-[1.2]">
            <span className="gold-foil">
              Every Ornament Carries Trust, Purity and Craftsmanship.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/75 md:text-lg">
            Since 2008, every customer has been welcomed like family — and
            every purchase backed by our promise of quality, integrity and
            complete satisfaction.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <TrackedLink
              href="#stores"
              event="cta_visit_store"
              placement="promise_band"
              className="inline-flex w-full items-center justify-center rounded-sm bg-gold px-8 py-4 text-base font-semibold text-maroon-deep transition-colors hover:bg-gold-light sm:w-auto"
            >
              Plan Your Visit
            </TrackedLink>
            <TrackedLink
              href={whatsappLink}
              event="cta_whatsapp"
              placement="promise_band"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-sm border border-gold/50 px-8 py-4 text-base font-semibold text-gold-light transition-colors hover:border-gold hover:bg-gold/10 sm:w-auto"
            >
              Chat on WhatsApp
            </TrackedLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
