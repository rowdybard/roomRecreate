"use client";

import { useEffect, useState } from "react";
import type { LayoutItem, PaletteColor } from "@/lib/types";

type Props = {
  layout: LayoutItem[];
  palette: PaletteColor[];
  /** Re-trigger the one-by-one reveal when this changes (e.g. new kit id). */
  revealKey?: string | number;
};

/**
 * Beautiful top-down 2D room plan. Furniture blocks are positioned by x/y/w/h
 * percentages, colored from the kit palette, and animate in one-by-one.
 */
export function RoomVisualizer2D({ layout, palette, revealKey }: Props) {
  const [mode, setMode] = useState<"styled" | "empty">("styled");
  const [revealed, setRevealed] = useState(0);

  // Reveal furniture one piece at a time whenever the layout/key changes.
  useEffect(() => {
    if (mode === "empty") {
      setRevealed(0);
      return;
    }
    setRevealed(0);
    const timers = layout.map((_, i) =>
      setTimeout(() => setRevealed((n) => Math.max(n, i + 1)), 120 + i * 140),
    );
    return () => timers.forEach(clearTimeout);
  }, [layout, mode, revealKey]);

  const floor = palette[0]?.hex ?? "#EFE6D8";
  const wall = palette[1]?.hex ?? "#D8C3A5";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-ink">
          Your room plan
        </h3>
        <div className="flex rounded-full bg-white/70 p-1 ring-1 ring-clay/30">
          {(["empty", "styled"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                mode === m
                  ? "bg-ink text-cream shadow-soft"
                  : "text-cocoa hover:text-ink"
              }`}
            >
              {m === "empty" ? "Empty room" : "Styled room"}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-xl3 shadow-soft ring-1 ring-black/5"
        style={{
          aspectRatio: "4 / 3",
          background: `linear-gradient(160deg, ${wall} 0%, ${floor} 22%, ${floor} 100%)`,
        }}
      >
        {/* Floorboard hint lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #000 0 1px, transparent 1px 9%)",
          }}
        />
        {/* Inner room border */}
        <div className="pointer-events-none absolute inset-3 rounded-xl2 ring-2 ring-white/50" />

        {mode === "empty" && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-cocoa">
              Empty room — toggle to “Styled room” ✦
            </p>
          </div>
        )}

        {mode === "styled" &&
          layout.map((it, i) => {
            const color = palette[(i % (palette.length - 1)) + 1]?.hex ??
              palette[0]?.hex ??
              "#B58B61";
            const isRug = it.item.toLowerCase().includes("rug");
            const show = i < revealed;
            return (
              <div
                key={it.item + i}
                className="group absolute flex items-center justify-center rounded-2xl ring-1 ring-black/10 transition-all duration-500"
                style={{
                  left: `${it.x}%`,
                  top: `${it.y}%`,
                  width: `${it.w}%`,
                  height: `${it.h}%`,
                  backgroundColor: color,
                  opacity: show ? (isRug ? 0.78 : 0.95) : 0,
                  transform: show
                    ? "scale(1) translateY(0)"
                    : "scale(0.8) translateY(8px)",
                  boxShadow: isRug
                    ? "inset 0 0 0 2px rgba(255,255,255,0.35)"
                    : "0 8px 20px -8px rgba(60,40,20,0.4)",
                  zIndex: isRug ? 1 : 5 + i,
                }}
                title={it.item}
              >
                <span className="pointer-events-none select-none rounded-full bg-black/0 px-2 text-center text-[10px] font-semibold leading-tight text-ink/80 transition group-hover:bg-white/70 sm:text-xs">
                  {it.item}
                </span>
              </div>
            );
          })}
      </div>
      <p className="mt-3 text-center text-xs text-cocoa/60">
        A mini designer board — hover any piece to highlight it.
      </p>
    </div>
  );
}
