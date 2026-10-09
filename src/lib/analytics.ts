/**
 * Analytics event hooks. Events push to window.dataLayer when it
 * exists (add a GTM/GA4 snippet in layout.tsx to collect them) and
 * are safe no-ops otherwise.
 */

type AnalyticsEvent =
  | "cta_visit_store"
  | "cta_call"
  | "cta_whatsapp"
  | "cta_directions"
  | "cta_instagram"
  | "cta_explore_collections"
  | "collection_filter"
  | "piece_open"
  | "reel_play"
  | "rates_open"
  | "form_submit_success"
  | "form_submit_error";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Sends to both sinks, because they are not the same channel.
 *
 * `dataLayer.push({event, ...})` is the Tag Manager convention. gtag.js
 * also owns `dataLayer`, but it reads its own argument-shaped entries and
 * ignores a raw `{event}` object — so the pushes this file has always made
 * were invisible to GA4. From launch until Oct 2026 nothing consumed them
 * at all: the site ran Cloudflare's cookieless beacon, which never reads
 * dataLayer. Every call to this function was a no-op.
 *
 * The dataLayer push stays so a GTM container can be dropped in later
 * without touching the twelve call sites; the gtag call is what actually
 * reaches GA4 today. Both are safe when their script is absent.
 */
export function trackEvent(
  event: AnalyticsEvent,
  data: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });

  window.gtag?.("event", event, data);
}
