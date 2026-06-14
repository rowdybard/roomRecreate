"use client";

import { useToast } from "./Toast";

const PERKS = [
  "Printable PDF",
  "Full shopping list",
  "Budget swaps",
  "Exact product categories",
  "Step-by-step room setup",
  "Personalize for your room size",
  "Save your kit",
  "Shareable kit link",
];

/**
 * WOW FACTOR 5: Locked Full Kit / paywall placeholder.
 * Opens NEXT_PUBLIC_STRIPE_FULL_KIT_URL if set, otherwise shows a toast.
 */
export function LockedFullKit() {
  const { showToast } = useToast();

  function handleGetFullKit() {
    const url = process.env.NEXT_PUBLIC_STRIPE_FULL_KIT_URL;
    // FUTURE (Stripe): replace the link with a Checkout Session if needed.
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      showToast("Checkout coming soon.");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-xl3 bg-ink p-8 text-cream shadow-glow md:p-12">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-oak/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-mauve/30 blur-3xl" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
          🔒 Full Recreate Kit
        </span>
        <h3 className="mt-4 font-serif text-3xl font-semibold">
          Unlock the Full Recreate Kit
        </h3>
        <p className="mt-2 max-w-lg text-cream/70">
          Everything you need to actually pull the room together — start to
          finish.
        </p>

        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2.5 text-sm">
              <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-oak text-[11px] text-cream">
                ✓
              </span>
              {perk}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={handleGetFullKit}
            className="btn bg-cream px-7 py-3.5 text-base text-ink hover:-translate-y-0.5 hover:bg-white"
          >
            Get Full Kit — $9
          </button>
          <span className="text-sm text-cream/60">
            One-time. No subscription. Yours to keep.
          </span>
        </div>
      </div>
    </section>
  );
}
