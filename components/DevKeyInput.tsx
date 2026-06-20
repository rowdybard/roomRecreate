"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dev:openai-key";

/**
 * Developer API-key input.
 *
 * Lets the user paste an OpenAI key directly in the browser for testing.
 * The key is stored in localStorage and sent as an `x-openai-key` header
 * with every API request, overriding any server-side env / Cloudflare secret.
 */
export function DevKeyInput() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load on mount.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : "";
    if (stored) {
      setValue(stored);
      setSaved(true);
    }
  }, []);

  // Focus when opened.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSave() {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setSaved(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setSaved(false);
    }
    setOpen(false);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setValue("");
    setSaved(false);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          saved
            ? "bg-oak/20 text-oak ring-1 ring-oak/40"
            : "bg-white/70 text-cocoa ring-1 ring-clay/30 hover:bg-white"
        }`}
        title={saved ? "API key saved — click to edit" : "Paste an API key for testing"}
      >
        <span className="text-sm">⚙</span>
        {saved ? "Key set" : "API key"}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl2 bg-white p-4 shadow-glow ring-1 ring-clay/30">
          <p className="mb-2 text-sm font-semibold text-ink">Test API key</p>
          <p className="mb-3 text-xs text-cocoa/70">
            Paste your OpenAI key to override any server env or Cloudflare
            secret. Stored only in this browser.
          </p>

          <div className="relative">
            <input
              ref={inputRef}
              type={visible ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              placeholder="sk-..."
              className="input pr-10"
            />
            <button
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cocoa/60 hover:text-ink"
              type="button"
            >
              {visible ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button onClick={handleSave} className="btn-mini">
              Save
            </button>
            {saved && (
              <button onClick={handleClear} className="btn-mini">
                Clear
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-xs text-cocoa/60 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Read the developer key from localStorage for including in fetch headers.
 */
export function getDevKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}
