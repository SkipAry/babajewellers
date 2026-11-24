import Reveal from "./Reveal";

export default function SectionHeading({
  label,
  title,
  intro,
  align = "center",
  onDark = false,
  /* "h1" when a page reuses this section as its main heading — a page
     whose top heading is an h2 has no h1 at all. Defaults to h2, which
     is right for every homepage section. */
  as: As = "h2",
}: {
  label: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  onDark?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <Reveal className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p
        className={`stamp-label text-xs font-semibold uppercase tracking-[0.18em] ${
          onDark ? "text-gold" : "text-maroon"
        }`}
      >
        {label}
      </p>
      <As
        className={`mt-4 font-display text-[clamp(2rem,5.5vw,3.4rem)] font-bold leading-[1.15] ${
          onDark ? "gold-foil" : "text-maroon-deep"
        }`}
      >
        {title}
      </As>
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
