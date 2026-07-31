import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Baba Jewellers",
  description:
    "How Baba Jewellers handles the information you share through this website.",
  alternates: { canonical: `${site.url}/privacy` },
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
        <p>
          This website may use basic analytics to understand how visitors use
          the site. Analytics data is aggregated and does not personally
          identify you.
        </p>
      </div>
    </main>
  );
}
