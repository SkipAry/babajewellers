import { faqs } from "@/data/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function FAQ() {
  return (
    <section id="faq" className="bg-ivory-warm py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <SectionHeading
            align="left"
            label="Good to Know"
            title="Questions Customers Ask"
            intro="Anything else on your mind? Call us or walk into either store — we are happy to help."
          />
          <div>
            {faqs.map((faq, i) => (
              <Reveal key={faq.question} delay={Math.min(i * 0.04, 0.2)}>
                <details className="group border-b border-maroon/15 py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold text-maroon-deep marker:content-none [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span
                      aria-hidden="true"
                      className="text-lg font-normal text-gold-dark transition-transform group-open:rotate-45"
                    >
                      ✦
                    </span>
                  </summary>
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-ink/70 md:text-base">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
