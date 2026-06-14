"use client";

import { useState } from "react";

/**
 * Interactive checklist. Checking items is local-only delight (not persisted) —
 * FUTURE: tie checked state to the saved kit and to affiliate product links.
 */
export function ShoppingChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => setChecked((p) => ({ ...p, [i]: !p[i] }))}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/60 px-3.5 py-2.5 text-left text-sm ring-1 ring-clay/25 transition hover:bg-white"
          >
            <span
              className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-md text-[11px] ring-1 transition ${
                checked[i]
                  ? "bg-oak text-cream ring-oak"
                  : "bg-white ring-clay/50"
              }`}
            >
              {checked[i] ? "✓" : ""}
            </span>
            <span
              className={`${
                checked[i] ? "text-cocoa/50 line-through" : "text-ink"
              }`}
            >
              {item}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
