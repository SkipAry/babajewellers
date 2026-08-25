import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Baba Jewellers",
  description:
    "How Baba Jewellers handles the information you share through this website — enquiry form data, privacy-first analytics, and how to have yours removed.",
  alternates: { canonical: `${site.url}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-maroon">
        ← Back to home
      </Link>
      <h1 className="mt-6 font-display text-4xl font-bold text-maroon-deep">
        Privacy Policy
      </h1>
      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink/80">
        <p>
          Baba Jewellers collects the information you submit through the
          enquiry form on this website — your name, contact details and
          enquiry — to respond to you and assist with your purchase. Form
          submissions are processed and may be stored on our behalf by
          Formspree, our form service provider.
        </p>
        <p>
          We do not sell or rent your personal information, or share it with
          third parties for their own marketing. We share it with service
          providers such as Formspree only as needed to operate the enquiry
          service, and retain it only as long as needed to handle your enquiry,
          subject to legal and service-provider retention requirements.
        </p>
        <p>
          If you would like your information removed from our records, call us
          on {site.phoneDisplay} and we will act on your request.
        </p>
        <section aria-labelledby="analytics-heading" className="space-y-3">
          <h2
            id="analytics-heading"
            className="font-display text-2xl font-bold text-maroon-deep"
          >
            Privacy-first website analytics
          </h2>
          <p>
            We use Cloudflare Web Analytics to understand aggregate visits,
            page views, referral sources, general country information and page
            performance. Cloudflare states that this service does not use
            analytics cookies, collect visitors&apos; personal data or track
            individual visitors across websites.
          </p>
          <p>
            The analytics beacon does not receive your name, phone number,
            enquiry message or other form details. Learn more in the{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-maroon underline underline-offset-4"
            >
              Cloudflare Privacy Policy
            </a>
            .
          </p>
        </section>
        <p>
          Cloudflare may set necessary security cookies to protect this website
          from automated abuse. These cookies are required for the site’s
          security and are separate from Cloudflare Web Analytics.
        </p>
      </div>
    </main>
  );
}
