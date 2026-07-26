import Reveal from "./Reveal";

export default function SectionHeading({
  label,
  title,
  intro,
  align = "center",
  onDark = false,
}: {
  label: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  onDark?: boolean;
}) {
  return (
    <Reveal className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p
        className={`stamp-label text-[11px] font-semibold uppercase tracking-caps ${
          onDark ? "text-gold" : "text-maroon"
        }`}
      >
        {label}
      </p>
      <h2
        className={`mt-4 font-display text-[clamp(2rem,5.5vw,3.4rem)] font-bold leading-[1.15] ${
          onDark ? "gold-foil" : "text-maroon-deep"
        }`}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={`mt-5 text-base leading-relaxed md:text-lg ${
            onDark ? "text-ivory/75" : "text-ink/70"
          }`}
        >
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}
