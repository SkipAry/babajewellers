import About from "@/components/About";
import BenefitCalculator from "@/components/BenefitCalculator";
import Collections from "@/components/Collections";
import Contact from "@/components/Contact";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MetalRates from "@/components/MetalRates";
import MobileActions from "@/components/MobileActions";
import PromiseBand from "@/components/PromiseBand";
import Promises from "@/components/Promises";
import Reels from "@/components/Reels";
import Stores from "@/components/Stores";
import { faqs } from "@/data/site";

/* Declared here rather than in the layout: this is the only page that renders
   the questions, and Google expects FAQPage markup to describe content the
   visitor can see. Built from the same `faqs` array the FAQ section reads, so
   the two cannot drift. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Promises />
        <About />
        <MetalRates />
        <Collections />
        <Reels />
        <BenefitCalculator />
        <Stores />
        <FAQ />
        <PromiseBand />
        <Contact />
      </main>
      <Footer />
      <MobileActions />
      <HashScroll />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
