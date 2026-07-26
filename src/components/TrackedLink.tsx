"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type TrackEventName = Parameters<typeof trackEvent>[0];

/** Anchor that fires an analytics event on click. */
export default function TrackedLink({
  href,
  event,
  placement,
  children,
  className,
  ...rest
}: {
  href: string;
  event: TrackEventName;
  placement: string;
  children: ReactNode;
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackEvent(event, { placement })}
      {...rest}
    >
      {children}
    </a>
  );
}
