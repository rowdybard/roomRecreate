"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { generateFallbackKit } from "@/lib/generateKit";
import { clearKits, listKits, saveKit } from "@/lib/storage";
import {
  BUDGETS,
  ROOM_TYPES,
  STYLE_NAMES,
  type BudgetName,
  type RoomKit,
  type RoomType,
  type StyleName,
} from "@/lib/types";

/**
 * Internal admin page — intentionally simple (not consumer-polished).
 * Lists locally saved kits and lets you create one quickly.
 *
 * FUTURE: admin-only Meshy generation workflow could be triggered here to
 * build new GLB asset packs (never in the normal user flow).
 */
export default function AdminPage() {
  const [kits, setKits] = useState<RoomKit[]>([]);
  const [title, setTitle] = useState("");
  const [vibe, setVibe] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("Bedroom");
  const [style, setStyle] = useState<StyleName>("Cozy Neutral");
  const [budget, setBudget] = useState<BudgetName>("$250–$750");

  function refresh() {
    setKits(listKits());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleCreate() {
    const kit = generateFallbackKit({
      vibe: vibe || `${style} ${roomType}`,
      roomType,
      roomSize: "Medium",
      style,
      budget,
      mustHaves: [],
    });
    if (title.trim()) kit.title = title.trim();
    saveKit(kit);
    setTitle("");
    setVibe("");
    refresh();
  }

  function handleClear() {
    if (confirm("Clear all locally saved kits?")) {
      clearKits();
      refresh();
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin · Kit Manager</h1>
        <Link href="/" className="text-sm underline">
          ← Back to site
        </Link>
      </div>
      <p className="mt-1 text-sm text-cocoa/70">
        Internal tool. Kits are stored in localStorage (key:{" "}
        <code>roomRecreatorKits</code>).
      </p>

      {/* Create form */}
      <section className="mt-6 rounded-lg border border-clay/40 bg-white/70 p-4">
        <h2 className="mb-3 font-semibold">Generate Admin Kit</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Title (optional)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-clay/40 px-3 py-2"
              placeholder="Auto-generated if blank"
            />
          </label>
          <label className="text-sm">
            Source vibe
            <input
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="mt-1 w-full rounded border border-clay/40 px-3 py-2"
              placeholder="e.g. cozy neutral bedroom"
            />
          </label>
          <label className="text-sm">
            Room type
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
              className="mt-1 w-full rounded border border-clay/40 px-3 py-2"
            >
              {ROOM_TYPES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Style
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as StyleName)}
              className="mt-1 w-full rounded border border-clay/40 px-3 py-2"
            >
              {STYLE_NAMES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Budget
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value as BudgetName)}
              className="mt-1 w-full rounded border border-clay/40 px-3 py-2"
            >
              {BUDGETS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          onClick={handleCreate}
          className="mt-3 rounded bg-ink px-4 py-2 text-sm font-semibold text-cream"
        >
          Generate Admin Kit
        </button>
      </section>

      {/* Kit list */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Saved kits ({kits.length})</h2>
          <button
            onClick={handleClear}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            Clear local kits
          </button>
        </div>
        {kits.length === 0 ? (
          <p className="text-sm text-cocoa/60">No kits saved yet.</p>
        ) : (
          <ul className="divide-y divide-clay/30 rounded-lg border border-clay/40 bg-white/70">
            {kits.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{k.title}</p>
                  <p className="truncate text-xs text-cocoa/60">
                    {k.id} · {k.style} · {new Date(k.createdAt).toLocaleString()}
                    {k.emailUnlocked ? " · unlocked" : ""}
                  </p>
                </div>
                <Link
                  href={`/kit/${k.id}`}
                  className="shrink-0 rounded bg-sand px-3 py-1.5 text-sm font-medium"
                >
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
