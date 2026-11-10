import type { Metadata } from "next";
import Link from "next/link";
import LocationRatePage, {
  locationMetaCtrTest,
} from "@/components/LocationRatePage";
import RateTrend from "@/components/RateTrend";
import { OfferBanner, WhatsAppRateButton } from "@/components/RatePageExtras";
import { readRateHistory } from "@/lib/rateHistory";
import { site, stores } from "@/data/site";

/**
 * WAGHOLI — 20 km, and the hardest of the five.
 *
 * Wagholi sits close to Pune, so unlike the other towns the reader has
 * real alternatives within a few minutes — including the big chains. The
 * page therefore opens by SAYING SO rather than pretending otherwise, and
 * argues the one thing a chain cannot match: an owner-run shop quoting
 * making charges openly.
 *
 * Writing it any other way would have been both dishonest and useless.
 * Someone in Wagholi knows perfectly well that Pune is nearby; a page
 * that ignores it loses their trust in the first line.
 */

/* CTR test, phase 2 — promoted 9 Nov 2026.
   Wagholi was the strongest control: 209 impressions and 0 clicks in the
   week of 1-7 Nov, the same 0% pattern Shikrapur had before phase 1.
   Talegaon Dhamdhere, Ranjangaon and Sanaswadi stay on locationMeta so
   there is still something to compare against. */
const meta = locationMetaCtrTest("Wagholi", "gold-rate-wagholi");

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: `${site.url}/gold-rate-wagholi/` },
  openGraph: {
    type: "website",
    url: `${site.url}/gold-rate-wagholi/`,
    siteName: site.name,
    title: meta.title,
    description: meta.description,
    locale: "en_IN",
    images: [
      {
        url: "/models/hero-model.webp",
        width: 1200,
        height: 1800,
        alt: "Traditional gold jewellery from Baba Jewellers",
      },
    ],
  },
  /* Was inheriting the generic homepage card. */
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
};

export default function Page() {
  const history = readRateHistory(7);

  return (
    <LocationRatePage
      town="Wagholi"
      townMr="वाघोली"
      heading="Gold Rate Today for Wagholi"
      headingMr="आजचा सोन्याचा आणि चांदीचा भाव — वाघोली. दररोज सकाळी अद्ययावत."
      intro={
        <>
          Baba Jewellers is in <strong>Shikrapur</strong>, about 20 km out
          along the Pune–Nagar road. We have no Wagholi branch, and you have
          plenty of jewellers closer — so the rate below comes with an honest
          case for why people still make the drive.
        </>
      }
      ctaHeading="Twenty kilometres out of Pune"
      ctaBody="Straight down the Nagar road, open 8:30 am to 9:00 pm every day. Call first and we will have the day's rate and a breakup ready."
    >
      <h2 className="font-display text-3xl font-bold text-maroon-deep">
        Pune is closer. Why come to Shikrapur?
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          A fair question, and it deserves a straight answer rather than a
          sales line. If you want a showroom five minutes away, Pune has
          dozens and we are not going to pretend otherwise.
        </p>
        <p>
          What a 20 km drive buys you is a shop where the owner is behind the
          counter. The day&apos;s rate, the making charges and the GST are
          quoted as three separate numbers before you decide — not totalled
          into one figure at the end. On a wedding set that difference is
          usually worth considerably more than the fuel.
        </p>
        <p>
          The large chains are excellent at many things. Transparent making
          charges on a heavy piece is rarely one of them.
        </p>
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
        Check before you travel
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          This page is rebuilt every morning, so the figures above are the
          figures at the counter today. Rates move with the international
          price, the rupee and import duty — the bullion market shuts at
          weekends, which is why two days sometimes read the same.
        </p>
        <p>
          Before driving out, call{" "}
          <a
            href={`tel:${stores[0].callE164}`}
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            {stores[0].callDisplay}
          </a>{" "}
          and ask what a piece you have in mind would actually cost, fully
          broken down. If it does not beat what you have been quoted in Pune,
          we will tell you so and you will have saved yourself the trip.
        </p>
        <p>
          Our{" "}
          <Link
            href="/gold-rate-shikrapur/"
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            Shikrapur rate page
          </Link>{" "}
          explains how 24K, 22K and 18K differ and what each suits. Open{" "}
          {site.businessHours}.
        </p>
      </div>

      <OfferBanner />

      {history.length >= 2 ? <RateTrend history={history} town="Wagholi" /> : null}

      <WhatsAppRateButton town="Wagholi" />
    </LocationRatePage>
  );
}
