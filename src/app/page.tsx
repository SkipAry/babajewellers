import About from "@/components/About";
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
      <Header />
      <main id="main">
        <Hero />
        <Promises />
        <About />
        <Collections />
        <Reels />
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
