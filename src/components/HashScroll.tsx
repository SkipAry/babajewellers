"use client";

import { useEffect } from "react";

/**
 * Re-applies the URL fragment after the page has come up.
 *
 * A link like /#stores from another route arrives as a full page load with a
 * fragment, but the visitor lands at the top: the scroll position is reset
 * while the page is still coming up, and the browser never retries the
 * fragment. Sharing a /#stores link has always behaved this way; it became
 * visible once the header appeared on pages other than the homepage, because
 * every cross-route nav click now arrives with a fragment.
 *
 * Three attempts, because there is no single moment that is right for every
 * visitor: straight away, after the current task, and again on `load` once
 * the images have their final height. scrollIntoView does nothing when the
 * element is already in place, so the later attempts cost nothing.
 *
 * Deliberately no requestAnimationFrame — a tab that is not compositing
 * never runs those callbacks and the jump would silently never happen.
 *
 * The visitor always wins: the first scroll, touch or key press hands
 * control back and nothing moves them again.
 *
 * "instant" rather than the CSS default: smooth would animate through the
 * whole page on arrival, which is slow and disorientating. The jump honours
 * scroll-padding-top, so the fixed header does not cover what it lands on.
 */
export default function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    let owned = true;
    const release = () => {
      owned = false;
    };

    const jump = () => {
      if (!owned) return;
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    };

    window.addEventListener("wheel", release, { passive: true, once: true });
    window.addEventListener("touchstart", release, { passive: true, once: true });
    window.addEventListener("keydown", release, { once: true });

    jump();
    const soon = window.setTimeout(jump, 0);
    window.addEventListener("load", jump);

    return () => {
      window.clearTimeout(soon);
      window.removeEventListener("load", jump);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
    };
  }, []);

  return null;
}
