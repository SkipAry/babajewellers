"use client";

import { useEffect, useRef, useState } from "react";
import { reels, site } from "@/data/site";
import { trackEvent } from "@/lib/analytics";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Three vertical reels. Videos autoplay muted while on screen, pause
 * when scrolled away, and each card has a sound toggle. Under
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
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // show poster; user can press play via controls

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          video.play().catch(() => undefined);
          trackEvent("reel_play", { reel: index + 1 });
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [index]);

  return (
    <figure className="group relative overflow-hidden rounded-sm">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        controls={false}
        preload="none"
        aria-label={`Baba Jewellers reel: ${label}`}
        className="aspect-[9/16] w-full object-cover"
      />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-deep/85 to-transparent p-4">
        <span className="font-display text-base font-bold text-gold-light">
          {label}
        </span>
      </figcaption>
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute reel" : "Mute reel"}
        aria-pressed={!muted}
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-maroon-deep/70 text-gold-light backdrop-blur transition-colors hover:bg-maroon"
      >
        {muted ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.6 3 3.2 3.2-1.4 1.4L15.2 13.4 12 16.6l-1.4-1.4 3.2-3.2-3.2-3.2L12 7.4l3.2 3.2 3.2-3.2 1.4 1.4L16.6 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
          </svg>
        )}
      </button>
    </figure>
  );
}

export default function Reels() {
  return (
    <section className="jaali bg-maroon-deep py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <SectionHeading
          onDark
          label="From Our Store"
          title="Jewellery in Motion"
          intro="A closer look at our pieces, straight from the store floor."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
          {reels.map((reel, i) => (
            <Reveal key={reel.id} delay={i * 0.08}>
              <ReelCard src={reel.src} poster={reel.poster} label={reel.label} index={i} />
            </Reveal>
          ))}
        </div>

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
