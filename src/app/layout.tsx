import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { faqs, site, stores } from "@/data/site";
import "./globals.css";

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
    "Baba Jewellers offers 100% BIS Hallmarked gold and silver jewellery in Shikrapur, Pune since 2008 — bridal sets, necklaces, bangles, jhumkas and more with transparent pricing and 15-day returns.",
  keywords: [
    "Jewellers in Shikrapur",
    "Gold jewellery Shikrapur",
    "Jewellery shop Pune Nagar Road",
    "BIS Hallmarked gold Pune",
    "Bridal jewellery Shikrapur",
    "Silver jewellery Shikrapur",
    "Gold shop near Talegaon Dhamdhere",
  ],
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

/* Structured data: JewelryStore (one per location) + FAQ */
const storeSchemas = stores.map((store, i) => ({
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "@id": `${site.url}/#store-${i + 1}`,
  name: site.name,
  image: `${site.url}/models/hero-model.webp`,
  logo: `${site.url}/icon-512.png`,
  telephone: site.phoneE164,
  url: site.url,
  foundingDate: "2008-06-09",
  founder: { "@type": "Person", name: site.founder },
  slogan: site.tagline,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${store.line1}, ${store.line2}`,
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
  sameAs: [site.instagram],
}));

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${googleSansFlex.variable}`}>
      <body>
        {children}
        {storeSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </body>
    </html>
  );
}
