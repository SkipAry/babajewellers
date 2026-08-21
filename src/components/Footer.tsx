import Image from "next/image";
import { mapsLinkFor, site, stores, telLink } from "@/data/site";

const navLinks = [
  { href: "/#home", label: "Home" },
  { href: "/#promises", label: "Our Promises" },
  { href: "/#about", label: "About" },
  { href: "/#collections", label: "Collections" },
  { href: "/#stores", label: "Visit Us" },
  { href: "/#contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-maroon-deep pb-24 pt-16 text-ivory md:pb-16">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo-128.webp"
                alt="Baba Jewellers BJ monogram"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
              <div className="leading-tight">
                <p className="font-display text-xl font-bold text-gold-light">
                  Baba Jewellers
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-ivory/70">
                  Since 2008
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/70">
              {site.tagline} — and every ornament tells a story. Pure gold and
              silver jewellery, honest pricing and service that treats you
              like family.
            </p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block py-1 text-sm text-gold-light/80 transition-colors hover:text-gold-light"
            >
              Instagram — @babajewellersofficial
            </a>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light/80">
              Navigation
            </h3>
            {/* inline-block py-1 lifts each link from 18px to 26px tall.
                WCAG 2.5.8 (AA) wants 24×24 minimum for a pointer target. */}
            <ul className="mt-4 space-y-1.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block py-1 text-sm text-ivory/75 transition-colors hover:text-gold-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Stores */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light/80">
              Our Stores
            </h3>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {stores.map((store) => (
                <address key={store.id} className="text-sm not-italic leading-relaxed text-ivory/75">
                  <p className="font-semibold text-ivory">{store.line1}</p>
                  <p>
                    {store.line2},<br />
                    {store.city}
                  </p>
                  <a
                    href={mapsLinkFor(store)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block py-1 text-gold-light/80 underline underline-offset-4 hover:text-gold-light"
                  >
                    View on Google Maps
                  </a>
                </address>
              ))}
            </div>
            <p className="mt-6 text-sm text-ivory/75">
              <a href={telLink} className="inline-block py-1 font-semibold text-ivory hover:text-gold-light">
                {site.phoneDisplay}
              </a>
              <span aria-hidden="true" className="mx-2 text-gold/50">◆</span>
              {site.businessHours}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-gold/20 pt-7 text-xs text-ivory/50 sm:flex-row sm:items-center">
          <p>© {year} {site.name}. All rights reserved.</p>
          <ul className="flex gap-6">
            <li>
              <a href="/privacy/" className="hover:text-gold-light">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms/" className="hover:text-gold-light">
                Terms
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
