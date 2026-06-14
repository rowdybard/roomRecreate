"use client";

export function SearchTerms({ terms }: { terms: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {terms.map((term, i) => (
        <span
          key={i}
          className="rounded-full bg-sand px-3.5 py-1.5 text-sm font-medium text-cocoa ring-1 ring-clay/30"
        >
          {term}
        </span>
      ))}
    </div>
  );
}
