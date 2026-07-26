"use client";

import { mapsLinkFor, stores, telLink, whatsappLink } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

/** Sticky mobile quick actions: Call, WhatsApp, Directions. */
export default function MobileActions() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-gold/30 bg-maroon-deep pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-8px_rgba(59,1,8,0.6)] md:hidden"
    >
      <a
        href={telLink}
        onClick={() => trackEvent("cta_call", { placement: "sticky_bar" })}
        className="flex min-h-[48px] items-center justify-center gap-1.5 py-3 text-xs font-semibold text-gold-light sm:gap-2 sm:text-sm"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" />
        </svg>
        Call Now
      </a>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("cta_whatsapp", { placement: "sticky_bar" })}
        className="flex min-h-[48px] items-center justify-center gap-1.5 border-x border-gold/30 bg-gold py-3 text-xs font-semibold text-maroon-deep sm:gap-2 sm:text-sm"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.1c-.2.7-1.3 1.3-1.8 1.3-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.1.1.3 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.3 1.1 2.3 1.4 2.6 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l1.9.9c.2.1.4.2.5.3 0 .1 0 .8-.3 1.4z" />
        </svg>
        WhatsApp
      </a>
      <a
        href={mapsLinkFor(stores[0])}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("cta_directions", { placement: "sticky_bar" })}
        className="flex min-h-[48px] items-center justify-center gap-1.5 py-3 text-xs font-semibold text-gold-light sm:gap-2 sm:text-sm"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
        </svg>
        Directions
      </a>
    </nav>
  );
}
