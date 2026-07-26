import { promises, type PromiseIcon } from "@/data/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/* Fine gold line icons drawn for each promise */
function PromiseGlyph({ icon }: { icon: PromiseIcon }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const glyphs: Record<PromiseIcon, React.ReactNode> = {
    hallmark: (
      <>
        <path {...common} d="M24 5 8 14v11c0 9 6.5 15.5 16 18 9.5-2.5 16-9 16-18V14L24 5Z" />
        <path {...common} d="M17 24l5 5 9-11" />
      </>
    ),
    returns: (
      <>
        <path {...common} d="M10 20a15 15 0 1 1-2 10" />
        <path {...common} d="M8 18v8h8" />
      </>
    ),
    pricing: (
      <>
        <path {...common} d="M12 8h24M12 15h24M16 15c10 0 12 5 12 8s-3 8-10 8l12 9" />
      </>
    ),
    payment: (
      <>
        <rect {...common} x="6" y="12" width="36" height="24" rx="3" />
        <path {...common} d="M6 20h36M12 29h8" />
      </>
    ),
    trust: (
      <>
        <path {...common} d="M24 42S7 31 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 13-17 24-17 24Z" />
        <path {...common} d="M24 14v10M19 19h10" />
      </>
    ),
    heart: (
      <>
        <circle {...common} cx="24" cy="20" r="12" />
        <path {...common} d="M18 19l4 4 8-8M14 40l4-8M34 40l-4-8" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 text-gold" aria-hidden="true">
      {glyphs[icon]}
    </svg>
  );
}

export default function Promises() {
  return (
    <section id="promises" className="jaali bg-maroon py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <SectionHeading
          onDark
          label="Baba Jewellers Promises"
          title="Our Commitment, Stamped in Gold"
          intro="Purity, transparency, quality and customer satisfaction — the six promises every ornament carries."
        />

        <ul className="mt-12 grid gap-px overflow-hidden border border-gold/25 bg-gold/25 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((promise, i) => (
            <Reveal as="li" key={promise.title} delay={Math.min(i * 0.05, 0.25)} className="bg-maroon">
              <div className="flex h-full flex-col gap-4 p-7 transition-colors hover:bg-maroon-soft/60 md:p-8">
                <PromiseGlyph icon={promise.icon} />
                <h3 className="font-display text-xl font-bold text-gold-light">
                  {promise.title}
                </h3>
                <p className="text-sm leading-relaxed text-ivory/70">{promise.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
