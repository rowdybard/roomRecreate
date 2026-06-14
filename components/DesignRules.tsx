"use client";

export function DesignRules({ rules }: { rules: string[] }) {
  return (
    <ul className="space-y-2.5">
      {rules.map((rule, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-ink">
          <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-oak/15 text-[11px] font-bold text-oak">
            {i + 1}
          </span>
          <span>{rule}</span>
        </li>
      ))}
    </ul>
  );
}
