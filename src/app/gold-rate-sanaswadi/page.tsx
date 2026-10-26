import type { Metadata } from "next";
import Link from "next/link";
import LocationRatePage, { locationMeta } from "@/components/LocationRatePage";
import { savingsScheme, site, stores } from "@/data/site";

/**
 * SANASWADI — 5 km.
 *
 * Both this and Ranjangaon are MIDC areas, so the obvious angle —
 * "factory workers buy gold" — would have produced two near-identical
 * pages and recreated exactly the duplication these pages exist to avoid.
 *
 * Split by DISTANCE rather than by demographic:
 *   Sanaswadi, 5 km   → close enough to drop in on a day off. The piece
 *                       is the monthly savings scheme, because a salaried
 *                       buyer nearby can pay in person each month.
 *   Ranjangaon, 14 km → a planned trip. That page is about buying for an
 *                       occasion, not about saving monthly.
 */

const meta = locationMeta("Sanaswadi", "gold-rate-sanaswadi");

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: `${site.url}/gold-rate-sanaswadi/` },
  openGraph: {
    type: "website",
    url: `${site.url}/gold-rate-sanaswadi/`,
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
      town="Sanaswadi"
      heading="Gold Rate Today for Sanaswadi"
      headingMr="आजचा सोन्याचा आणि चांदीचा भाव — सणसवाडी. दररोज सकाळी अद्ययावत."
      intro={
        <>
          Baba Jewellers is in <strong>Shikrapur</strong>, about 5 km from
          Sanaswadi on the Pune–Nagar road. We have no Sanaswadi branch — but
          at five kilometres, most of our Sanaswadi customers treat us as
          their local jeweller.
        </>
      }
      ctaHeading="Five kilometres from Sanaswadi"
      ctaBody="Drop in on a day off, see the day's rate, and ask what a monthly plan would look like for you. Nothing to sign on the spot."
    >
      <h2 className="font-display text-3xl font-bold text-maroon-deep">
        Buying gold on a monthly salary
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          Gold bought in one go means finding a large sum on a day the rate
          happens to suit. For anyone on a monthly income — and Sanaswadi is
          full of people on one — that is the hard part, not the choosing.
        </p>
        <p>
          Our Elite Plan — <span lang="mr">{savingsScheme.heading}</span> —
          exists for that. You pay a fixed amount each month, we add a benefit
          at maturity, and the total goes toward gold jewellery when you are
          ready. Being five kilometres away makes
          it practical: you can pay in person, see what the rate has done, and
          watch the plan build rather than wonder about it.
        </p>
        <p>
          The{" "}
          <Link
            href="/elite-plan/"
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            full scheme page
          </Link>{" "}
          sets out every amount and duration with the exact benefit, so you
          can work out the maturity value before you commit to anything.
        </p>
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
        Why the rate here is the same as anywhere
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          Gold trades internationally, so the metal rate in Sanaswadi is the
          metal rate in Shikrapur, in Pune, and in Mumbai. Anyone quoting you a
          notably cheaper rate is not getting cheaper gold — they are making
          the difference up somewhere else, usually in making charges or in
          purity.
        </p>
        <p>
          That is why every piece here is 100% BIS Hallmarked and why we quote
          the rate, the making charges and the GST as three separate figures.
          Open {site.businessHours}; call{" "}
          <a
            href={`tel:${stores[0].callE164}`}
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            {stores[0].callDisplay}
          </a>{" "}
          with any question before you travel.
        </p>
      </div>
    </LocationRatePage>
  );
}
