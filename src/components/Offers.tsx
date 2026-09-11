"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { offers } from "@/data/site";

/**
 * OFFERS — the auto-advancing banner strip directly under the hero.
 *
 * Built on native scroll-snap rather than a carousel library: that gets
 * touch swiping, momentum, and keyboard scrolling from the browser for
 * free, and the auto-advance is then just a scrollTo on a timer.
 *
 * The banners are images with the offer text baked into them, so `alt`
 * carries the full offer in words — that is the only copy a screen reader
 * gets here, which is why it stays a complete sentence rather than a label.
 *
 * The dots are the only visible control; they double as the manual way out
 * of the rotation. Auto-advance stops on hover, on keyboard focus, when the
 * tab is hidden, and whenever prefers-reduced-motion is set.
 */

const INTERVAL_MS = 8000;

export default function Offers() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const many = offers.length > 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sync = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const goTo = useCallback(
    (i: number, smooth = true) => {
      const el = trackRef.current;
      if (!el) return;
      el.scrollTo({
        left: el.clientWidth * i,
        behavior: smooth && !reduceMotion ? "smooth" : "auto",
      });
    },
    [reduceMotion]
  );

  /* Dots follow the scroller, so a manual swipe updates them too. */
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const paused = interacting || tabHidden || reduceMotion;

  useEffect(() => {
    if (paused || !many) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || el.clientWidth === 0) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % offers.length;
      el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, many]);

  if (offers.length === 0) return null;

  return (
    <section
      id="offers"
      aria-label="Current offers"
      className="bg-ivory-warm py-10 md:py-14"
    >
      <div className="mx-auto max-w-site sm:px-6 lg:px-8">
        <h2 className="stamp-label px-4 text-center text-xs font-semibold uppercase tracking-caps text-maroon sm:px-0">
          Running Offers
        </h2>

        <div
          className="relative mt-6"
          aria-roledescription={many ? "carousel" : undefined}
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={() => setInteracting(false)}
        >
          {/* No `scroll-smooth` utility on the track: goTo() sets `behavior`
              explicitly so the reduced-motion path can jump instead of
              glide, and a CSS default would muddy which one wins. */}
          <ul
            ref={trackRef}
            onScroll={onScroll}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          >
            {offers.map((offer, i) => (
              <li
                key={offer.id}
                className="w-full shrink-0 snap-center"
                role="group"
                aria-roledescription={many ? "slide" : undefined}
                aria-label={many ? `${i + 1} of ${offers.length}` : undefined}
              >
                {/* Two creatives, not one cropped one: the 3:1 banner is
                    only ~125px tall on a 375px phone, so the shop had the
                    same offer re-laid-out at 2:1 for narrow screens. The
                    aspect ratio of the box matches the file in both cases,
                    so object-cover never actually crops anything.

                    <picture> rather than CSS: a phone downloads only the
                    2:1 file and a desktop only the 3:1 one. The breakpoint
                    is 639px to sit just under Tailwind's `sm`, so the
                    artwork swaps on exactly the same pixel as the layout.

                    Plain <img>, matching Hero: images.unoptimized means
                    next/image would add nothing but weight here. */}
                {/* The banner links to /offers/, where the same offer is
                    written out as text. A tap during a swipe does not fire
                    a click, so this does not fight the scroll gesture. */}
                <Link
                  href="/offers/"
                  aria-label={`${offer.headline} — see offer details`}
                  className="block"
                >
                  <picture>
                    <source
                      media="(max-width: 639px)"
                      srcSet={offer.imageMobile}
                      width={1200}
                      height={600}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={offer.image}
                      alt={offer.alt}
                      width={1602}
                      height={534}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="aspect-[2/1] w-full object-cover sm:aspect-[3/1] sm:rounded-sm"
                    />
                  </picture>
                </Link>
              </li>
            ))}
          </ul>

          {many ? (
            <div className="mt-5 flex items-center justify-center gap-1">
              {offers.map((offer, i) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show offer ${i + 1}: ${offer.headline}`}
                  aria-current={i === index}
                  className="flex h-11 w-8 items-center justify-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-maroon" : "w-1.5 bg-maroon/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
