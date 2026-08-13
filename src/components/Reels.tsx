"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { reels, site } from "@/data/site";
import { trackEvent } from "@/lib/analytics";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Three vertical reels. Videos autoplay muted while on screen, pause
 * when scrolled away, and toggle playback on direct interaction. Under
 * prefers-reduced-motion videos wait for a tap instead of autoplaying.
 */
function ReelCard({
  src,
  poster,
  label,
  index,
}: {
  src: string;
  poster: string;
  label: string;
  index: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;

  const requestPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.paused) return;
    try {
      await video.play();
      trackEvent("reel_play", { reel: index + 1 });
    } catch {
      setPlaying(false);
    }
  }, [index]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) video.pause();

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (reduceMotion) {
          if (!entry.isIntersecting) video.pause();
          return;
        }
        if (
          entry.intersectionRatio >= 0.35 &&
          !userPausedRef.current
        ) {
          void requestPlay();
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.35] }
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reduceMotion, requestPlay]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      void requestPlay();
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  }, [requestPlay]);

  return (
    <figure className="group relative overflow-hidden rounded-sm">
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={`${playing ? "Pause" : "Play"} reel: ${label}`}
        className="block w-full cursor-pointer appearance-none bg-transparent p-0 text-left focus-visible:!outline-offset-[-4px]"
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          controls={false}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="aspect-[9/16] w-full object-cover"
        />
      </button>
      {/* The scrim runs to /95 and holds full strength through the first 45%
          of its height, because the caption sits over photography: measured
          against the brightest pixels behind the text the old /85 fade fell to
          2.96:1, even though its median was a comfortable 7:1. */}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-deep/95 from-45% to-transparent p-4">
        <span className="font-display text-base font-bold text-gold-light">
          {label}
        </span>
      </figcaption>
    </figure>
  );
}

export default function Reels() {
  // No bottom padding: the next section (BenefitCalculator) is the same
  // maroon and brings its own top padding, so keeping both stacked two
  // full paddings into one dead band with no visible seam.
  return (
    // py, not pt: with no bottom padding this section's gap to the one below
    // was 96px against 192px everywhere else on the page.
    <section className="jaali bg-maroon-deep py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <SectionHeading
          onDark
          label="From Our Store"
          title="Jewellery in Motion"
          intro="A closer look at our pieces, straight from the store floor."
        />

        <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-auto sm:grid sm:max-w-4xl sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0">
          {reels.map((reel, i) => (
            <Reveal
              as="li"
              key={reel.id}
              delay={i * 0.08}
              className="w-[78vw] max-w-72 shrink-0 snap-center sm:w-auto sm:max-w-none"
            >
              <ReelCard src={reel.src} poster={reel.poster} label={reel.label} index={i} />
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-10 text-center">
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("cta_instagram", { placement: "reels" })}
            className="inline-flex items-center gap-2 rounded-sm border border-gold/50 px-7 py-3.5 text-sm font-semibold text-gold-light transition-colors hover:border-gold hover:bg-gold/10"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2a3.8 3.8 0 0 1-.9 1.4 3.8 3.8 0 0 1-1.4.9c-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.9-10.4a1.45 1.45 0 1 1-2.9 0 1.45 1.45 0 0 1 2.9 0z" />
            </svg>
            Follow @babajewellersofficial
          </a>
        </Reveal>
      </div>
    </section>
  );
}
