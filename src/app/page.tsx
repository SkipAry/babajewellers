import About from "@/components/About";
import BenefitCalculator from "@/components/BenefitCalculator";
import Collections from "@/components/Collections";
import Contact from "@/components/Contact";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MobileActions from "@/components/MobileActions";
import PromiseBand from "@/components/PromiseBand";
import Promises from "@/components/Promises";
import Reels from "@/components/Reels";
import Stores from "@/components/Stores";

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
    </>
  );
}
