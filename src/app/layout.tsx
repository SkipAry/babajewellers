import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import {
  areaServed,
  faqs,
  mapsLinkFor,
  offerCatalog,
  site,
  stores,
} from "@/data/site";
import "./globals.css";

const cloudflareWebAnalyticsToken = "3db45ae729dd4879a51c5f294d5a5d29";

/* Self-hosted variable fonts — reliable on every network.
   Cormorant (300–700) for display headings, Google Sans Flex for body. */
const cormorant = localFont({
  src: "../fonts/cormorant-latin.woff2",
  weight: "300 700",
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const googleSansFlex = localFont({
  src: "../fonts/google-sans-flex-latin.woff2",
  weight: "100 1000",
  variable: "--font-google-sans-flex",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Baba Jewellers | Gold & Silver Jewellery Store in Shikrapur, Pune",
  description:
    "BIS Hallmarked gold & silver jewellery in Shikrapur, Pune since 2008. Bridal sets, necklaces, bangles & jhumkas. Transparent pricing, 15-day returns.",
  /* No `keywords` here on purpose. Google stopped reading the meta keywords
     tag in 2009 and Bing treats stuffing it as a spam signal, so the list that
     used to sit here changed nothing. We rank for a term by having a page that
     genuinely answers it — see /gold-rate-shikrapur/ and /bridal-jewellery/. */
  alternates: { canonical: site.url },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: "Baba Jewellers | Where Trust Meets Tradition",
    description:
      "100% BIS Hallmarked gold and silver jewellery in Shikrapur, Pune — since 2008. Transparent pricing, 15-day returns, lifetime exchange.",
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
  twitter: {
    card: "summary_large_image",
    title: "Baba Jewellers | Where Trust Meets Tradition",
    description:
      "100% BIS Hallmarked gold and silver jewellery in Shikrapur, Pune — since 2008.",
    images: ["/models/hero-model.webp"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3B0108",
};

/* Structured data: Organization + JewelryStore (one per location) + FAQ */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  alternateName: "Baba Jewellers Shikrapur",
  url: site.url,
  logo: `${site.url}/icon-512.png`,
  image: `${site.url}/models/hero-model.webp`,
  description:
    "BIS Hallmarked gold and silver jewellery retailer in Shikrapur, Pune, serving the Shirur and Pune–Nagar Road belt since 2008.",
  foundingDate: "2008-06-09",
  founder: { "@type": "Person", name: site.founder },
  slogan: site.tagline,
  telephone: site.phoneE164,
  areaServed: areaServed.map((name) => ({ "@type": "City", name })),
  sameAs: [site.instagram],
};

const storeSchemas = stores.map((store) => ({
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "@id": `${site.url}/#store-${store.id}`,
  name: store.schemaName,
  parentOrganization: { "@id": `${site.url}/#organization` },
  description: `BIS Hallmarked gold and silver jewellery at ${store.line1}, ${store.line2}. Bridal sets, necklaces, bangles and jhumkas with transparent pricing and 15-day returns.`,
  image: `${site.url}/models/hero-model.webp`,
  logo: `${site.url}/icon-512.png`,
  telephone: store.callE164,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${store.line1}, ${store.line2}`.replace(/,\s*Shikrapur$/, ""),
    addressLocality: "Shikrapur",
    addressRegion: "Maharashtra",
    postalCode: "412208",
    addressCountry: "IN",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:30",
    closes: "21:00",
  },
  paymentAccepted: "Cash, UPI, Credit Card, Debit Card, EMI, Bank Transfer",
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  areaServed: areaServed.map((name) => ({ "@type": "City", name })),
  hasMap: mapsLinkFor(store),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Jewellery Collections",
    itemListElement: offerCatalog.map((name) => ({
      "@type": "OfferCatalog",
      name,
    })),
  },
  ...(store.foundingDate && { foundingDate: store.foundingDate }),
  ...(store.geo && {
    geo: {
      "@type": "GeoCoordinates",
      latitude: store.geo.lat,
      longitude: store.geo.lng,
    },
  }),
  sameAs: [site.instagram, ...(store.gbpUrl ? [store.gbpUrl] : [])],
}));

/* FAQPage lives on the homepage, not here. Google requires structured data
   to describe content the visitor can actually see, and the FAQ section only
   renders on `/` — emitting it from the layout claimed every route was an
   FAQ page. Organization and JewelryStore are different: they describe the
   business rather than the page, so they belong site-wide. */

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${googleSansFlex.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {storeSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({
            token: cloudflareWebAnalyticsToken,
          })}
        />
      </body>
    </html>
  );
}
