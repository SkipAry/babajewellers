"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { site, telLink, whatsappLink } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#promises", label: "Our Promises" },
  { href: "#about", label: "About" },
  { href: "#collections", label: "Collections" },
  { href: "#stores", label: "Visit Us" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = () => {
      if (!desktop.matches) return;
      const focusWasInMenu = menuRef.current?.contains(document.activeElement);
      setMenuOpen(false);
      if (focusWasInMenu) brandRef.current?.focus();
    };

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", closeAtDesktop);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", closeAtDesktop);
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeMenuAndRestore = useCallback(() => {
    setMenuOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);
  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "bg-maroon-deep/95 shadow-[0_1px_0_0_rgba(212,166,72,0.25)] backdrop-blur"
          : "bg-maroon-deep/80 shadow-[0_1px_0_0_rgba(212,166,72,0.12)] backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-site items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        <Link
          ref={brandRef}
          href="#home"
          className="flex items-center gap-3"
          aria-label="Baba Jewellers — back to top"
          onClick={closeMenu}
        >
          <Image
            src="/icon-512.png"
            alt="Baba Jewellers BJ monogram"
            width={44}
            height={44}
            priority
            className="h-10 w-10 rounded-full md:h-11 md:w-11"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-xl font-bold tracking-wide text-gold-light md:text-xl">
              Baba Jewellers
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-ivory/75 md:text-xs md:tracking-caps">
              Since 2008 · Shikrapur, Pune
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-1 text-sm font-medium text-ivory/85 transition-colors hover:text-gold-light"
            >
              {link.label}
            </a>
          ))}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("cta_whatsapp", { placement: "header" })}
            className="rounded-sm border border-gold/70 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold-light transition-colors hover:bg-gold hover:text-maroon-deep"
          >
            WhatsApp Us
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 top-0 h-0.5 w-6 bg-gold-light transition-transform ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-6 bg-gold-light transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-6 bg-gold-light transition-transform ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`lg:hidden ${
          menuOpen ? "block" : "hidden"
        } relative max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-gold/25 bg-maroon-deep md:max-h-[calc(100dvh-5rem)]`}
      >
        <nav aria-label="Mobile" className="flex flex-col px-4 py-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenuAndRestore}
              className="border-b border-gold/15 py-4 text-base font-medium text-ivory/90"
            >
              {link.label}
            </a>
          ))}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              closeMenuAndRestore();
              trackEvent("cta_whatsapp", { placement: "mobile_menu" });
            }}
            className="mt-4 rounded-sm bg-gold px-5 py-3.5 text-center text-base font-semibold text-maroon-deep"
          >
            WhatsApp Us
          </a>
          <a
            href={telLink}
            onClick={() => {
              closeMenuAndRestore();
              trackEvent("cta_call", { placement: "mobile_menu" });
            }}
            className="mt-3 rounded-sm border border-gold/40 px-5 py-3.5 text-center text-base font-semibold text-gold-light"
          >
            Call {site.phoneDisplay}
          </a>
        </nav>
      </div>
    </header>
  );
}
