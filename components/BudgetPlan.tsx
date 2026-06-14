"use client";

import type { BudgetPlan as BudgetPlanType } from "@/lib/types";

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa/70">
        {title}
      </h5>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="rounded-xl bg-white/60 px-3 py-2 text-sm text-ink ring-1 ring-clay/20"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BudgetPlan({ plan }: { plan: BudgetPlanType }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Column title="Buy first" items={plan.buyFirst} />
      <Column title="Save for later" items={plan.saveForLater} />
      <Column title="Budget swaps" items={plan.cheapSwaps} />
    </div>
  );
}
