"use client";

import type { PaletteColor } from "@/lib/types";

export function PaletteSwatches({ palette }: { palette: PaletteColor[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {palette.map((c) => (
        <div key={c.name + c.hex} className="group">
          <div
            className="aspect-square w-full rounded-2xl shadow-inner ring-1 ring-black/5 transition-transform duration-300 group-hover:-translate-y-1"
            style={{ backgroundColor: c.hex }}
            title={`${c.name} ${c.hex}`}
          />
          <p className="mt-2 text-xs font-semibold text-ink">{c.name}</p>
          <p className="text-[11px] uppercase tracking-wide text-cocoa/60">
            {c.hex}
          </p>
        </div>
      ))}
    </div>
  );
}
