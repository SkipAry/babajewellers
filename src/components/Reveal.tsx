"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Soft rise-and-fade reveal; static under prefers-reduced-motion. */
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "figure";
}) {
  const reduceMotion = useReducedMotion();
  const Comp = m[as];

  return (
    <LazyMotion features={domAnimation} strict>
      <Comp
        className={className}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.6, delay, ease: [0.22, 0.6, 0.3, 0.98] }}
      >
        {children}
      </Comp>
    </LazyMotion>
  );
}
