import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileActions from "@/components/MobileActions";
import Schemes from "@/components/Schemes";
import TrackedLink from "@/components/TrackedLink";
import { schemes, site, stores } from "@/data/site";

/**
 * SAVINGS SCHEMES — the dedicated page.
 *
 * The same <Schemes /> component the homepage renders, so the six cards
 * cannot drift apart between here and there. What this page adds is a
 * reason to exist on its own: a Marathi-first title and description
 * aimed at "सोने बचत योजना शिक्रापूर", a query no competitor in the
 * 20 km belt currently answers, plus the ItemList markup.
 *
 * ⚠ The content IS duplicated with the homepage section. That is a
 * deliberate trade, not an oversight: this page carries the canonical
 * and is the one meant to rank, while the homepage section exists so a
 * visitor who never leaves the front page still sees the schemes. If
 * Search Console ever shows these two competing, the fix is to cut the
 * homepage section back to names-only and keep the detail here.
 */

const PAGE_URL = `${site.url}/schemes/`;

export const metadata: Metadata = {
  /* Marathi first: "सोने बचत योजना शिक्रापूर" is what a local saver
     types, and Marathi on this site converts at 8.4% against 1.2% for
     the English equivalent. 47 characters. */
  title: "सोने बचत योजना शिक्रापूर | Gold Savings Schemes",
  description:
    "बाबा ज्वेलर्स बचत योजना — समृद्धी, सुवर्ण बचत, भाग्यश्री, शुभलाभ, स्वर्णधारा आणि संपदा. " +
    "Six gold savings schemes in Shikrapur, Pune.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: site.name,
    title: "सोने बचत योजना — बाबा ज्वेलर्स, शिक्रापूर",
    description:
      "सहा बचत योजना. थोडे थोडे साठवा आणि आपल्या आवडीचे दागिने घ्या.",
    locale: "mr_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "सोने बचत योजना शिक्रापूर | Baba Jewellers",
    description:
      "समृद्धी, सुवर्ण बचत, भाग्यश्री, शुभलाभ, स्वर्णधारा आणि संपदा योजना.",
  },
};

export default function SchemesPage() {
  /* No `price` or `offers`: these schemes carry no published amount, and
     marking up a figure we do not have is the misrepresentation that
     gets structured data ignored. */
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Gold savings schemes — Baba Jewellers, Shikrapur",
    itemListElement: schemes.map((s) => ({
      "@type": "ListItem",
      position: s.no,
      name: `${s.name} (${s.nameEn})`,
      description: s.bodyEn,
    })),
  };

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />

      <main id="main" tabIndex={-1}>
        <Schemes variant="page" />

        <section className="bg-maroon-deep py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 lang="mr" className="font-display text-3xl font-bold text-ivory">
              दुकानात या, योजना समजून घ्या
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/75">
              Both showrooms are in Shikrapur and open {site.businessHours}.
              Ask at the counter which scheme suits what you are saving for.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <TrackedLink
                href={`tel:${site.phoneE164}`}
                event="cta_call"
                placement="schemes_page"
                className="inline-flex min-h-11 items-center justify-center rounded-sm bg-gold px-7 py-3 text-base font-semibold text-maroon-deep transition-colors hover:bg-gold-light"
              >
                {site.phoneDisplay}
              </TrackedLink>
              <Link
                href="/#stores"
                className="inline-flex min-h-11 items-center justify-center rounded-sm border border-gold/60 px-7 py-3 text-base font-semibold text-gold-light transition-colors hover:bg-gold/10"
              >
                {stores.length} showrooms in Shikrapur
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileActions />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
