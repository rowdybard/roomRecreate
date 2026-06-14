"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Reading the vibe…",
  "Choosing the palette…",
  "Placing furniture…",
  "Building your recreate kit…",
];

/**
 * WOW FACTOR 1: Animated Room Reveal.
 * Cycles through staged messages for ~2.5s, then calls onDone().
 */
export function GenerationReveal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stepMs = 650;
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * stepMs),
    );
    const finish = setTimeout(onDone, STEPS.length * stepMs + 250);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onDone]);

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="grid place-items-center rounded-xl2 bg-white/70 p-10 text-center shadow-card ring-1 ring-white/60">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-clay/30 border-t-oak" />
        <div className="absolute inset-0 grid place-items-center text-xl">✦</div>
      </div>
      <p
        key={step}
        className="mt-6 animate-fade-up font-serif text-xl font-medium text-ink"
      >
        {STEPS[step]}
      </p>
      <div className="mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-clay/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-oak to-mauve transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-cocoa/60">Styling your room…</p>
    </div>
  );
}
