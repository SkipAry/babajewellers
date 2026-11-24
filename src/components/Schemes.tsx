import Link from "next/link";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import TrackedLink from "./TrackedLink";
import { schemes, schemesCopy, site } from "@/data/site";

/**
 * SAVINGS SCHEMES (बचत योजना) — homepage section, directly above the
 * Elite Plan calculator.
 *
 * Marathi leads here and English follows, the reverse of the rest of the
 * page. Measured reason: the Marathi rate query on this site converts at
 * 8.4% against 1.2% for its English equivalent, and these six posters
 * already circulate in the shop and on WhatsApp in Marathi — someone
 * arriving here has usually seen the Marathi name first.
 *
 * ── Layout notes, since this is the densest grid on the page ──
 *
 * Every card holds a different amount of text, so the figures would sit
 * at six different heights on a row if each block simply stacked. Three
 * things stop that:
 *
 *   1. The card is a flex COLUMN, and the three-row term list is wrapped
 *      in a `flex-1` block. Any slack goes into that block, so the
 *      English gloss and the button land on the same baseline across a
 *      row whatever the Marathi above them does.
 *   2. The term values are `tabular-nums`, so १० / २२ / ६ line up in a
 *      column instead of jittering — Devanagari digits vary in width.
 *   3. Marathi body text gets `leading-[1.85]`. Devanagari sits taller
 *      than Latin (matras above, conjuncts below) and the site's default
 *      1.6 crowds it; the English gloss keeps the tighter 1.6 because it
 *      does not need the room.
 *
 * No monthly amounts anywhere, on purpose. The posters set the SHAPE of
 * each scheme — how many instalments, what the shop adds, when you can
 * buy — and leave the figure to the customer. Printing one would be
 * inventing a commitment nobody made.
 */
export default function Schemes({
  /* "section" — on the homepage: an h2, plus a link through to the full
     page. "page" — on /schemes/: an h1, and no self-link. */
  variant = "section",
}: {
  variant?: "section" | "page";
} = {}) {
  const isPage = variant === "page";
  const enquiry = (name: string) =>
    `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
      `नमस्कार बाबा ज्वेलर्स, मला ${name} बद्दल अधिक माहिती हवी आहे.`
    )}`;

  return (
    <section id="schemes" className="scroll-mt-24 bg-ivory-warm py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6">
        <SectionHeading
          label={schemesCopy.headingEn}
          title={schemesCopy.heading}
          intro={schemesCopy.intro}
          as={isPage ? "h1" : "h2"}
        />

        <Reveal>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-ink/55">
            {schemesCopy.introEn}
          </p>
        </Reveal>

        <ul className="m-0 mt-14 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((s) => (
            <li key={s.slug} className="flex">
              <Reveal className="flex w-full">
                <article className="flex w-full flex-col rounded-sm border border-maroon/12 bg-ivory p-6 shadow-[0_10px_30px_rgba(83,2,12,0.05)] transition-shadow hover:shadow-[0_14px_38px_rgba(83,2,12,0.10)] md:p-7">
                  {/* Number badge and name share a baseline rather than
                      centring on each other — the Marathi cap-height is
                      taller than the badge, so centring reads as drift. */}
                  <header className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-7 w-7 shrink-0 rotate-45 items-center justify-center rounded-[3px] bg-gold"
                    >
                      <span className="-rotate-45 text-[12px] font-bold leading-none text-maroon-deep">
                        {s.no}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <h3
                        lang="mr"
                        className="font-display text-[1.45rem] font-bold leading-[1.35] text-maroon-deep"
                      >
                        {s.name}
                      </h3>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-caps text-ink/45">
                        {s.nameEn}
                      </p>
                    </div>
                  </header>

                  <div
                    aria-hidden="true"
                    className="mt-5 h-px bg-gradient-to-r from-gold/70 via-gold/25 to-transparent"
                  />

                  {/* flex-1 so the slack collects here, not under the
                      button — this is what keeps a row's buttons level. */}
                  <div className="flex-1">
                    <dl className="m-0 mt-5 space-y-3.5" lang="mr">
                      {s.rows.map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-[auto_1fr] items-baseline gap-x-4"
                        >
                          <dt className="text-[13px] leading-[1.6] text-ink/55">
                            {row.label}
                          </dt>
                          <dd className="m-0 text-right text-[14.5px] font-semibold leading-[1.6] tabular-nums text-maroon-deep">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <p
                      lang="mr"
                      className="mt-6 text-[14px] leading-[1.85] text-ink/75"
                    >
                      {s.body}
                    </p>
                  </div>

                  <p className="mt-4 border-t border-maroon/10 pt-4 text-[12.5px] leading-[1.6] text-ink/50">
                    {s.bodyEn}
                  </p>

                  <TrackedLink
                    href={enquiry(s.name)}
                    event="cta_whatsapp"
                    placement="schemes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm border border-maroon/70 px-5 py-2.5 text-sm font-semibold text-maroon transition-colors hover:bg-maroon hover:text-gold-light"
                  >
                    <span lang="mr">या योजनेबद्दल विचारा</span>
                  </TrackedLink>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        {!isPage ? (
          <Reveal>
            <p className="m-0 mt-12 text-center">
              <Link
                href="/schemes/"
                className="text-sm font-semibold text-maroon underline underline-offset-4 transition-colors hover:text-maroon-soft"
              >
                <span lang="mr">सर्व योजना सविस्तर पाहा</span>
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </Reveal>
        ) : null}

        <Reveal>
          <p
            lang="mr"
            className={`mx-auto max-w-2xl text-center text-[13.5px] leading-[1.8] text-ink/55 ${
              isPage ? "mt-12" : "mt-8"
            }`}
          >
            {schemesCopy.disclaimer}
          </p>
          <p className="mx-auto mt-1.5 max-w-2xl text-center text-[12.5px] leading-relaxed text-ink/45">
            {schemesCopy.disclaimerEn}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
