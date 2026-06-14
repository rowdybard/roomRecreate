"use client";

import {
  BUDGETS,
  MUST_HAVES,
  ROOM_SIZES,
  ROOM_TYPES,
  STYLE_NAMES,
  type GenerateInputs,
} from "@/lib/types";

export type FormState = GenerateInputs;

/** Seed demo presets that fill the form and generate a matching kit. */
export const DEMOS: Record<string, FormState> = {
  cozy: {
    vibe: "Cozy neutral bedroom with soft lighting, arched mirror, linen bedding, plants, and warm wood accents",
    roomType: "Bedroom",
    roomSize: "Small",
    style: "Cozy Neutral",
    budget: "$250–$750",
    mustHaves: ["Bed", "Rug", "Mirror", "Plants", "Floor Lamp"],
  },
  dark: {
    vibe: "Dark feminine home office with moody walls, gold accents, velvet chair, and a big mirror",
    roomType: "Office",
    roomSize: "Medium",
    style: "Dark Feminine",
    budget: "$750–$1,500",
    mustHaves: ["Desk", "Accent Chair", "Mirror", "Shelves", "Floor Lamp"],
  },
  pink: {
    vibe: "Pink modern dorm room that feels fresh and playful with storage, soft rug, and cute wall art",
    roomType: "Dorm Room",
    roomSize: "Small",
    style: "Pink Modern",
    budget: "Under $250",
    mustHaves: ["Bed", "Desk", "Storage", "Rug", "Gallery Wall"],
  },
};

export function InputPanel({
  form,
  setForm,
  onGenerate,
  onReset,
  onDemo,
  busy,
}: {
  form: FormState;
  setForm: (next: FormState) => void;
  onGenerate: () => void;
  onReset: () => void;
  onDemo: (key: keyof typeof DEMOS) => void;
  busy: boolean;
}) {
  function toggleMustHave(item: string) {
    const has = form.mustHaves.includes(item);
    setForm({
      ...form,
      mustHaves: has
        ? form.mustHaves.filter((m) => m !== item)
        : [...form.mustHaves, item],
    });
  }

  return (
    <div className="card sticky top-20">
      <h3 className="font-serif text-xl font-semibold text-ink">
        Your dream room
      </h3>

      {/* Demo chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="self-center text-xs font-medium text-cocoa/60">
          Try:
        </span>
        <button onClick={() => onDemo("cozy")} className="chip text-xs">
          Cozy Neutral Bedroom
        </button>
        <button onClick={() => onDemo("dark")} className="chip text-xs">
          Dark Feminine Office
        </button>
        <button onClick={() => onDemo("pink")} className="chip text-xs">
          Pink Modern Dorm
        </button>
      </div>

      <label className="mt-5 block">
        <span className="field-label">Pinterest vibe or pin title</span>
        <textarea
          value={form.vibe}
          onChange={(e) => setForm({ ...form, vibe: e.target.value })}
          rows={4}
          placeholder="Cozy neutral bedroom with soft lighting, arched mirror, linen bedding, plants, and warm wood accents"
          className="input resize-none"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="field-label">Room type</span>
          <select
            value={form.roomType}
            onChange={(e) =>
              setForm({ ...form, roomType: e.target.value as FormState["roomType"] })
            }
            className="input"
          >
            {ROOM_TYPES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Room size</span>
          <select
            value={form.roomSize}
            onChange={(e) =>
              setForm({ ...form, roomSize: e.target.value as FormState["roomSize"] })
            }
            className="input"
          >
            {ROOM_SIZES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Style</span>
          <select
            value={form.style}
            onChange={(e) =>
              setForm({ ...form, style: e.target.value as FormState["style"] })
            }
            className="input"
          >
            {STYLE_NAMES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Budget</span>
          <select
            value={form.budget}
            onChange={(e) =>
              setForm({ ...form, budget: e.target.value as FormState["budget"] })
            }
            className="input"
          >
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <span className="field-label">Must-have items</span>
        <div className="flex flex-wrap gap-2">
          {MUST_HAVES.map((item) => {
            const active = form.mustHaves.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleMustHave(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-ink text-cream shadow-soft"
                    : "bg-white/70 text-cocoa ring-1 ring-clay/40 hover:bg-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        <button
          onClick={onGenerate}
          disabled={busy}
          className="btn-primary btn-lg w-full"
        >
          {busy ? "Recreating…" : "✨ Recreate This Room"}
        </button>
        <button onClick={onReset} className="btn-soft w-full">
          Reset
        </button>
      </div>
    </div>
  );
}
