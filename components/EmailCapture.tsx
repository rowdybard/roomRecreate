"use client";

import { useState } from "react";
import { saveEmailLead } from "@/lib/storage";
import { validateEmail } from "@/lib/utils";
import { useToast } from "./Toast";

/**
 * Email capture gate. Validates, stores the lead (localStorage by default, or
 * Supabase if configured via storage.ts), and marks the kit unlocked.
 */
export function EmailCapture({
  kitId,
  unlocked,
  onUnlock,
}: {
  kitId: string;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail(email)) {
      showToast("Please enter a valid email.");
      return;
    }
    saveEmailLead(email.trim(), kitId);
    onUnlock();
    showToast("Kit unlocked.");
  }

  if (unlocked) {
    return (
      <div className="card flex items-center gap-3 bg-oak/10 ring-oak/30">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-oak text-cream">
          ✓
        </span>
        <div>
          <p className="font-semibold text-ink">Your kit is unlocked</p>
          <p className="text-sm text-cocoa/70">
            Saved to this device. Export and share away.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h4 className="font-serif text-lg font-semibold text-ink">
        Send me my recreate kit
      </h4>
      <p className="mt-1 text-sm text-cocoa/70">
        Drop your email to unlock saving, exporting, and your shareable kit link.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-2.5 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="input flex-1"
          aria-label="Email address"
        />
        <button type="submit" className="btn-primary whitespace-nowrap">
          Unlock My Kit
        </button>
      </form>
      <p className="mt-2 text-[11px] text-cocoa/50">
        No spam. Stored locally for this V1 demo.
      </p>
    </div>
  );
}
