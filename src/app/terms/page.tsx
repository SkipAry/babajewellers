import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Use | Baba Jewellers",
  description: "Terms of use for the Baba Jewellers website.",
  alternates: { canonical: `${site.url}/terms/` },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-maroon">
        ← Back to home
      </Link>
      <h1 className="mt-6 font-display text-4xl font-bold text-maroon-deep">
        Terms of Use
      </h1>
      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink/80">
        <p>
          The content on this website — including photographs, videos, text
          and the Baba Jewellers logo — is the property of Baba Jewellers and
          may not be reproduced without written permission.
        </p>
        <p>
          Jewellery shown on this website is a representative selection from
          our collection. Availability, designs, weights and prices vary —
          please visit our stores or contact us for current details.
        </p>
        <p>
          Returns are accepted within 15 days as per our return policy, and
          our lifetime exchange facility is subject to in-store valuation.
          Our team will explain the exact terms that apply to your ornament
          before you buy.
        </p>
        <p>For any questions about these terms, call us on {site.phoneDisplay}.</p>
      </div>
    </main>
  );
}
