import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import { makingChargeOffer, offers, site } from "@/data/site";

/**
 * The two smaller click-reasons on the CTR-test rate pages: a WhatsApp
 * button for the daily rate, and a banner for whatever offer is running.
 *
 * Both read from live data and both disappear on their own — the banner
 * when no offer is live, which is the whole point of deriving it from
 * `offers` rather than hardcoding a Diwali strip someone has to remember
 * to delete in November.
 */

/** Prefilled WhatsApp enquiry for the day's rate. */
export function WhatsAppRateButton({ town }: { town: string }) {
  const message = `Namaskar Baba Jewellers, please send me today's gold rate. (Enquiry from ${town})`;
  const href = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="mt-8 rounded-sm border border-maroon/15 bg-ivory-warm p-5 text-center md:p-6">
      <p className="font-display text-xl font-bold text-maroon-deep">
        Get today&apos;s rate on WhatsApp
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/70">
        Message us and we will send the day&apos;s rate — useful if you are
        comparing before a purchase.
      </p>
      <TrackedLink
        href={href}
        event="cta_whatsapp"
        placement="rate_page"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-sm bg-maroon px-7 py-3 text-base font-semibold text-gold-light transition-colors hover:bg-maroon-deep"
      >
        Message us on WhatsApp
      </TrackedLink>
    </div>
  );
}

/**
 * Banner for the live offers. Renders nothing when none is running, so
 * 16 Nov removes it without an edit.
 *
 * Leads with the making-charge offer when there is one, because that is
 * the figure the title and description promised — a snippet that says
 * "6% making charges" and a page that does not mention it is a bounce.
 */
export function OfferBanner() {
  if (offers.length === 0) return null;

  const lead = makingChargeOffer ?? offers[0];
  const others = offers.filter((o) => o.id !== lead.id);

  return (
    <div className="mt-8 rounded-sm border-l-2 border-gold bg-maroon-deep p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-caps text-gold">
        Running now
      </p>
      <p className="mt-2 font-display text-xl font-bold text-ivory">
        {lead.headline}
      </p>
      <p lang="mr" className="mt-1 text-sm text-ivory/75">
        {lead.headlineMr}
      </p>

      {others.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-ivory/75">
          {others.map((o) => (
            <li key={o.id}>· {o.headline}</li>
          ))}
        </ul>
      ) : null}

      <Link
        href="/offers/"
        className="mt-4 inline-block text-sm font-semibold text-gold-light underline underline-offset-4 hover:text-gold"
      >
        See all offers and terms
        <span aria-hidden="true"> &rarr;</span>
      </Link>
    </div>
  );
}
