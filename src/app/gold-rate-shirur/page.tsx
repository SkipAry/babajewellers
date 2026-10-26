import type { Metadata } from "next";
import Link from "next/link";
import LocationRatePage, { locationMeta } from "@/components/LocationRatePage";
import { site, stores } from "@/data/site";

/**
 * SHIRUR — 35 km east along the Pune–Nagar road.
 *
 * Angle: Shirur is the larger town, so the question a reader has is not
 * "where is the nearest jeweller" but "why would I drive past the ones
 * here". The body answers that directly — the metal rate is identical
 * everywhere, so the real variable is making charges and hallmarking.
 */

const meta = locationMeta("Shirur", "gold-rate-shirur");

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: `${site.url}/gold-rate-shirur/` },
  openGraph: {
    type: "website",
    url: `${site.url}/gold-rate-shirur/`,
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
};

export default function Page() {
  return (
    <LocationRatePage
      town="Shirur"
      heading="Gold Rate Today for Shirur"
      headingMr="आजचा सोन्याचा आणि चांदीचा भाव — शिरूर तालुका. दररोज सकाळी अद्ययावत."
      intro={
        <>
          Baba Jewellers is in <strong>Shikrapur</strong>, about 35 km from
          Shirur along the Pune–Nagar road. We do not have a Shirur branch.
          The rate below is the rate you will be quoted at either of our
          showrooms.
        </>
      }
      ctaHeading="Worth the drive from Shirur"
      ctaBody="100% BIS Hallmarked gold, the day's rate shown openly, and making charges quoted before you buy — not after."
    >
      <h2 className="font-display text-3xl font-bold text-maroon-deep">
        Is the gold rate different in Shirur?
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          No. Gold is traded internationally and the rate follows the global
          spot price, the rupee against the dollar, and import duty. It does
          not change between Shirur and Shikrapur, or between Shikrapur and
          Pune.
        </p>
        <p>
          What does differ from shop to shop is the{" "}
          <strong>making charges</strong> and whether the gold is genuinely
          hallmarked. Those are where the real difference in what you pay
          comes from — not the metal rate. It is worth asking any jeweller for
          the rate, the making charges and the GST as three separate numbers
          before you commit.
        </p>
        <p>
          We set those out in full on our{" "}
          <Link
            href="/gold-rate-shikrapur/"
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            Shikrapur gold rate page
          </Link>
          , along with what separates 24K, 22K and 18K.
        </p>
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
        Coming from Shirur
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          It is about 35 km down the Pune–Nagar road, roughly three-quarters of
          an hour. Our original showroom — {stores[0].line1} — sits on that
          road at Shikrapur, so it is directly on your route if you are heading
          toward Pune. It has been open since 9 June 2008.
        </p>
        <p>
          Our second showroom at Baba Complex is on the Shikrapur–Talegaon
          Dhamdhere road, which suits you better if you are approaching from
          that side.
        </p>
        <p>
          Both are open {site.businessHours}. Call ahead on{" "}
          <a
            href={`tel:${stores[0].callE164}`}
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            {stores[0].callDisplay}
          </a>{" "}
          and we will keep pieces ready so the trip is worth making.
        </p>
      </div>
    </LocationRatePage>
  );
}
