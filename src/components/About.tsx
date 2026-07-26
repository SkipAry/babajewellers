import Image from "next/image";
import { milestones, site } from "@/data/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Photo */}
          <Reveal className="relative order-2 mx-auto w-full max-w-md lg:order-1">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[7rem]">
              <Image
                src="/models/model-smiling.webp"
                alt="Smiling model wearing layered gold necklaces, bangles and jhumkas from Baba Jewellers"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover object-top"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-t-[7.75rem] border border-gold/50"
            />
            <figcaption className="absolute -bottom-5 left-1/2 w-max -translate-x-1/2 border border-gold/40 bg-maroon-deep px-6 py-3 text-center">
              <span className="block font-display text-base font-bold text-gold-light">
                Serving Shikrapur since {site.establishedYear}
              </span>
            </figcaption>
          </Reveal>

          {/* Story */}
          <div className="order-1 lg:order-2">
            <SectionHeading
              align="left"
              label="About Us"
              title="Welcome to Baba Jewellers"
            />
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80 md:text-lg">
                <p>
                  Established on <strong className="font-semibold text-maroon">9 June 2008</strong>{" "}
                  by <strong className="font-semibold text-maroon">{site.founder}</strong>,
                  Baba Jewellers began with a simple vision — pure, beautifully
                  crafted jewellery, transparent pricing and exceptional
                  customer service.
                </p>
                <p>
                  From our first store at Karanje Complex on the Pune–Nagar
                  Road, we have grown into a trusted destination for gold and
                  silver jewellery for weddings, festivals, daily wear and
                  every special occasion — while every customer who walks in is
                  still welcomed like family.
                </p>
              </div>
            </Reveal>

            {/* Milestones */}
            <ol className="mt-10 space-y-6 border-l border-gold/40 pl-6">
              {milestones.map((m, i) => (
                <Reveal as="li" key={m.year} delay={i * 0.08} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.85rem] top-1.5 h-2.5 w-2.5 rotate-45 border border-gold bg-ivory"
                  />
                  <p className="font-display text-base font-bold uppercase tracking-caps text-maroon">
                    {m.year} — {m.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{m.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
