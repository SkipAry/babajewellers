"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { collectionFilters, pieces, type Piece } from "@/data/site";
import { trackEvent } from "@/lib/analytics";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

type Filter = (typeof collectionFilters)[number];

export default function Collections() {
  const [filter, setFilter] = useState<Filter>("All");
  const [openPiece, setOpenPiece] = useState<Piece | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const visible =
    filter === "All" ? pieces : pieces.filter((p) => p.category === filter);

  const openModal = useCallback((piece: Piece, trigger: HTMLElement) => {
    lastTrigger.current = trigger;
    setOpenPiece(piece);
    trackEvent("piece_open", { piece: piece.id });
  }, []);

  const closeModal = useCallback(() => {
    setOpenPiece(null);
    lastTrigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!openPiece) return;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab" && dialog) {
        const focusables = dialog.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openPiece, closeModal]);

  return (
    // bg-ivory, not ivory-warm: the rates section above is warm, and two warm
    // sections in a row erased the boundary — 192px of identical cream with no
    // cue that one section had ended and another begun.
    <section id="collections" className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="The Collection"
          title="Crafted for Every Occasion"
          intro="A glimpse of our gold jewellery — photographed in store. Visit us to explore the full collection of gold and silver ornaments."
        />

        {/* Filters */}
        <div
          role="group"
          aria-label="Filter the collection by category"
          className="no-scrollbar mt-10 flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center"
        >
          {collectionFilters.map((cat) => {
            const selected = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setFilter(cat);
                  trackEvent("collection_filter", { category: cat });
                }}
                className={`min-h-11 whitespace-nowrap rounded-sm px-5 py-2.5 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-maroon text-gold-light"
                    : "border border-maroon/25 text-maroon hover:border-maroon/60"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery */}
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {visible.map((piece, i) => (
            <Reveal
              as="li"
              key={piece.id}
              delay={Math.min(i * 0.04, 0.25)}
              className={piece.tall ? "row-span-2" : ""}
            >
              <button
                type="button"
                onClick={(e) => openModal(piece, e.currentTarget)}
                aria-label={`View ${piece.title}`}
                className="group relative block h-full min-h-56 w-full overflow-hidden rounded-sm"
              >
                <Image
                  src={piece.image}
                  alt={piece.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-[filter] duration-300 ease-out group-hover:brightness-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-transparent to-transparent opacity-90" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light/90">
                    {piece.category}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-bold text-ivory">
                    {piece.title}
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 text-center">
          <p className="text-sm text-ink/70">
            Looking for something specific? Message us — we will help you find it.
          </p>
          <p className="m-0 mt-4">
            <Link
              href="/bridal-jewellery/"
              className="text-[13.5px] font-semibold text-maroon underline underline-offset-4 transition-colors hover:text-maroon-soft"
            >
              Planning a wedding? See our bridal jewellery
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
          <p className="m-0 mt-2">
            <Link
              href="/necklaces/"
              className="text-[13.5px] font-semibold text-maroon underline underline-offset-4 transition-colors hover:text-maroon-soft"
            >
              Browse gold necklaces
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
        </Reveal>
      </div>

      {/* Lightbox */}
      {openPiece ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-maroon-deep/95 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={openPiece.title}
            className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto bg-ivory"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[6/7] w-full">
              <Image
                src={openPiece.image}
                alt={openPiece.alt}
                fill
                sizes="(min-width: 768px) 42rem, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon/80">
                  {openPiece.category}
                </p>
                <p className="font-display text-2xl font-bold text-maroon-deep">
                  {openPiece.title}
                </p>
              </div>
              <a
                href="#contact"
                onClick={closeModal}
                className="rounded-sm bg-maroon px-5 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-maroon-deep"
              >
                Enquire About This Piece
              </a>
            </div>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-maroon-deep/80 text-xl leading-none text-gold-light hover:bg-maroon"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
