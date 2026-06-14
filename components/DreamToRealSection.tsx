"use client";

import type { RoomKit } from "@/lib/types";

/**
 * WOW FACTOR 3: From Dream Pin to Real Room.
 * Three columns bridging inspiration → plan → first purchases.
 */
export function DreamToRealSection({ kit }: { kit: RoomKit }) {
  return (
    <section className="card">
      <h3 className="text-center font-serif text-2xl font-semibold text-ink">
        From Dream Pin to Real Room
      </h3>
      <p className="mb-6 mt-1 text-center text-sm text-cocoa/70">
        The gap between inspiration and reality — closed in three steps.
      </p>
      <div className="grid items-stretch gap-4 md:grid-cols-3">
        <Column num="01" label="The vibe">
          <p className="text-sm leading-relaxed text-cocoa">{kit.vibeSummary}</p>
        </Column>
        <Column num="02" label="The room plan">
          <MiniLayout kit={kit} />
        </Column>
        <Column num="03" label="What to buy first">
          <ul className="space-y-1.5">
            {kit.budgetPlan.buyFirst.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-ink ring-1 ring-clay/20"
              >
                <span className="text-oak">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Column>
      </div>
    </section>
  );
}

function Column({
  num,
  label,
  children,
}: {
  num: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl2 bg-gradient-to-b from-white/80 to-white/40 p-5 ring-1 ring-white/60">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-serif text-lg font-semibold text-oak">{num}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-cocoa/70">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function MiniLayout({ kit }: { kit: RoomKit }) {
  const floor = kit.palette[0]?.hex ?? "#EFE6D8";
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl ring-1 ring-black/5"
      style={{ aspectRatio: "4 / 3", backgroundColor: floor }}
    >
      {kit.layout.map((it, i) => {
        const isRug = it.item.toLowerCase().includes("rug");
        return (
          <div
            key={i}
            className="absolute rounded-md ring-1 ring-black/10"
            style={{
              left: `${it.x}%`,
              top: `${it.y}%`,
              width: `${it.w}%`,
              height: `${it.h}%`,
              backgroundColor:
                kit.palette[(i % (kit.palette.length - 1)) + 1]?.hex ?? "#B58B61",
              opacity: isRug ? 0.7 : 0.95,
              zIndex: isRug ? 1 : 2,
            }}
          />
        );
      })}
    </div>
  );
}
