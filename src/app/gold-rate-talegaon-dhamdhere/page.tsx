import type { Metadata } from "next";
import Link from "next/link";
import LocationRatePage, { locationMeta } from "@/components/LocationRatePage";
import { site, stores } from "@/data/site";

/**
 * TALEGAON DHAMDHERE — 4 km.
 *
 * The strongest of the town pages, and the only one where "worth the
 * drive" would be the wrong register. The Baba Complex showroom is on the
 * Shikrapur–Talegaon Dhamdhere road: this is not a trip, it is the
 * nearest proper jeweller. The page is written as local, not as an
 * invitation to travel, and points at store[1] rather than the flagship.
 */

const meta = locationMeta("Talegaon Dhamdhere", "gold-rate-talegaon-dhamdhere");

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: `${site.url}/gold-rate-talegaon-dhamdhere/` },
  openGraph: {
    type: "website",
    url: `${site.url}/gold-rate-talegaon-dhamdhere/`,
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
      town="Talegaon Dhamdhere"
      storeIndex={1}
      heading="Gold Rate Today for Talegaon Dhamdhere"
      headingMr="आजचा सोन्याचा आणि चांदीचा भाव — तळेगाव ढमढेरे. दररोज सकाळी अद्ययावत."
      intro={
        <>
          Our <strong>Baba Complex</strong> showroom is on the
          Shikrapur–Talegaon Dhamdhere road — about 4 km from you. Close
          enough to check the rate in person before you decide.
        </>
      }
      ctaHeading="Four kilometres away"
      ctaBody="Walk in, ask for the day's rate and a full price breakup, and leave without buying if it does not suit. No obligation, no pressure."
    >
      <h2 className="font-display text-3xl font-bold text-maroon-deep">
        Your nearest hallmarked jeweller
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          The road your town is named for runs to our door. {stores[1].line1}{" "}
          opened on 22 October 2023 as our second showroom, and it is the one
          most Talegaon Dhamdhere customers use — a few minutes rather than a
          journey.
        </p>
        <p>
          That matters more than it sounds for gold. A rate on a screen is
          only ever indicative; the figure that counts is the one quoted at
          the counter, against the piece in your hand, on the day. Being four
          kilometres away means you can check it yourself rather than take
          anyone&apos;s word for it.
        </p>
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
        Come and compare before a big purchase
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          For a wedding set or anything heavy, the making charges matter more
          than the rate — they are charged on weight, so they grow fastest
          exactly where the purchase is largest. Ask us, and ask anyone else
          you are considering, for three separate numbers: the day&apos;s
          rate, the making charges, and the GST.
        </p>
        <p>
          We will give you all three in writing before you commit. Our{" "}
          <Link
            href="/bridal-jewellery/"
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            bridal jewellery page
          </Link>{" "}
          sets out what a full set usually includes, and the{" "}
          <Link
            href="/gold-rate-shikrapur/"
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            Shikrapur rate page
          </Link>{" "}
          explains how 24K, 22K and 18K differ.
        </p>
        <p>
          Open {site.businessHours}. Call{" "}
          <a
            href={`tel:${stores[1].callE164}`}
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            {stores[1].callDisplay}
          </a>{" "}
          if you want something kept aside.
        </p>
      </div>
    </LocationRatePage>
  );
}
