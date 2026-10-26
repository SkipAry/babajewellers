import type { Metadata } from "next";
import Link from "next/link";
import LocationRatePage, { locationMeta } from "@/components/LocationRatePage";
import { site, stores } from "@/data/site";

/**
 * RANJANGAON — 14 km.
 *
 * Deliberately NOT the savings-scheme page; Sanaswadi has that. At 14 km
 * this is a planned trip rather than a drop-in, so the content is about
 * the purchase people plan for: a wedding or festival set, where making
 * charges on weight decide the bill. See the note on the Sanaswadi page
 * for why the two MIDC towns are split this way.
 */

const meta = locationMeta("Ranjangaon", "gold-rate-ranjangaon");

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: `${site.url}/gold-rate-ranjangaon/` },
  openGraph: {
    type: "website",
    url: `${site.url}/gold-rate-ranjangaon/`,
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
      town="Ranjangaon"
      heading="Gold Rate Today for Ranjangaon"
      headingMr="आजचा सोन्याचा आणि चांदीचा भाव — रांजणगाव. दररोज सकाळी अद्ययावत."
      intro={
        <>
          Baba Jewellers is in <strong>Shikrapur</strong>, about 14 km from
          Ranjangaon on the Pune–Nagar road. We do not have a Ranjangaon
          branch. The rate below is what you will be quoted at either
          showroom.
        </>
      }
      ctaHeading="Fourteen kilometres, and worth planning"
      ctaBody="Call ahead, tell us roughly what you are looking for, and we will have pieces ready when you arrive rather than starting from scratch."
    >
      <h2 className="font-display text-3xl font-bold text-maroon-deep">
        Making one trip count
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          Fourteen kilometres is far enough that nobody makes the journey
          twice in a week. So it is worth knowing the rate before you set off,
          and worth telling us what you are coming for.
        </p>
        <p>
          Call ahead with the occasion, a rough budget and the kind of piece,
          and we will have a selection out when you arrive. That turns a
          browse into a decision — particularly for a wedding, where seeing
          six sets together tells you far more than seeing one.
        </p>
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold text-maroon-deep">
        On a heavy piece, weight decides the bill
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink/80">
        <p>
          The rate above is the metal, per gram. The ornament&apos;s price is
          that rate times its weight, plus making charges for the
          craftsmanship, plus GST.
        </p>
        <p>
          Making charges are where most of the variation between jewellers
          hides, and because they scale with weight, they matter most on
          exactly the purchases that matter most — a mangalsutra, a bridal
          set, a heavy chain. On a light pair of earrings the difference is
          small; on a wedding set it is not.
        </p>
        <p>
          Ask us for the three figures separately and we will give them to you
          before you commit. Our{" "}
          <Link
            href="/bridal-jewellery/"
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            bridal jewellery page
          </Link>{" "}
          covers what a full set usually contains, and the{" "}
          <Link
            href="/gold-rate-shikrapur/"
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            Shikrapur rate page
          </Link>{" "}
          explains the purities. Open {site.businessHours} —{" "}
          <a
            href={`tel:${stores[0].callE164}`}
            className="font-semibold text-maroon underline underline-offset-4 hover:text-maroon-soft"
          >
            {stores[0].callDisplay}
          </a>
          .
        </p>
      </div>
    </LocationRatePage>
  );
}
