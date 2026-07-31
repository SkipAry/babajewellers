import Image from "next/image";
import {
  mapsLinkFor,
  site,
  stores,
  telLinkFor,
  whatsappLinkFor,
} from "@/data/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import TrackedLink from "./TrackedLink";

export default function Stores() {
  return (
    <section id="stores" className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Visit Us"
          title="Two Stores, One Promise"
          intro={`Both stores are open ${site.businessHours.toLowerCase()} — walk in any day, or call ahead and we will keep your favourites ready.`}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr]">
          {stores.map((store, i) => (
            <Reveal key={store.id} delay={i * 0.08}>
              <article className="flex h-full flex-col border border-maroon/15 bg-white p-7 md:p-8">
                <p className="stamp-label text-xs font-semibold uppercase tracking-[0.18em] text-maroon">
                  {store.label}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold text-maroon-deep">
                  {store.line1}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
                  {store.line2},<br />
                  {store.city}
                </p>
                <p className="mt-3 text-sm italic text-ink/70">{store.note}</p>
                <dl className="mt-6 grid gap-4 border-t border-maroon/15 pt-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/70">
                      Mobile Number (Calling)
                    </dt>
                    <dd className="mt-1">
                      <TrackedLink
                        href={telLinkFor(store)}
                        event="cta_call"
                        placement={`store_${store.id}_call`}
                        aria-label={`Call ${store.line1} at ${store.callDisplay}`}
                        className="inline-flex min-h-11 items-center font-semibold text-maroon underline decoration-maroon/35 underline-offset-4 transition-colors hover:text-maroon-deep"
                      >
                        {store.callDisplay}
                      </TrackedLink>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/70">
                      WhatsApp Number
                    </dt>
                    <dd className="mt-1">
                      <TrackedLink
                        href={whatsappLinkFor(store)}
                        event="cta_whatsapp"
                        placement={`store_${store.id}_whatsapp`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${store.line1} at ${store.whatsappDisplay} (opens in a new tab)`}
                        className="inline-flex min-h-11 items-center font-semibold text-maroon underline decoration-maroon/35 underline-offset-4 transition-colors hover:text-maroon-deep"
                      >
                        {store.whatsappDisplay}
                      </TrackedLink>
                    </dd>
                  </div>
                </dl>
                <div className="mt-5">
                  <TrackedLink
                    href={mapsLinkFor(store)}
                    event="cta_directions"
                    placement={`store_${store.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm bg-maroon px-5 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-maroon-deep"
                  >
                    Get Directions
                  </TrackedLink>
                </div>
              </article>
            </Reveal>
          ))}

          {/* Accent photo */}
          <Reveal delay={0.16} className="relative hidden min-h-[22rem] lg:block">
            <div className="absolute inset-0 overflow-hidden rounded-sm">
              <Image
                src="/models/model-leaning.webp"
                alt="Model wearing traditional gold jewellery from Baba Jewellers, leaning on a carved wooden chest"
                fill
                sizes="(min-width: 1024px) 30vw, 0vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/60 to-transparent" />
              <p className="absolute inset-x-0 bottom-0 p-5 font-display text-xl font-bold text-gold-light">
                Open {site.businessHours}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
