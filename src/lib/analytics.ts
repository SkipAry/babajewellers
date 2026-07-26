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
  | "form_submit_success"
  | "form_submit_error";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(
  event: AnalyticsEvent,
  data: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}
