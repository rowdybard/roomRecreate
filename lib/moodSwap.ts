import type { MoodSwapType, RoomKit } from "./types";
import { shadeHex } from "./utils";

/**
 * Deterministic mood swaps. Each returns a NEW kit object (immutably) with an
 * updated palette, vibe summary, shopping checklist wording, budget swaps, and
 * share text. Visual styling in the UI keys off the updated palette.
 *
 * FUTURE: this could call OpenAI for richer re-styling, but V1 stays instant
 * and free.
 */

type Transform = {
  vibePrefix: string;
  shadeAmount: number; // applied to palette
  checklistWord: { from?: RegExp; add: string };
  swap: string;
  shareTag: string;
};

const TRANSFORMS: Record<MoodSwapType, Transform> = {
  cozier: {
    vibePrefix: "Even cozier now — ",
    shadeAmount: 0.06,
    checklistWord: { add: "Extra-soft " },
    swap: "Add a chunky knit throw and a warm-toned bulb for instant coziness.",
    shareTag: "Made it cozier ✦",
  },
  darker: {
    vibePrefix: "Moodier and darker — ",
    shadeAmount: -0.28,
    checklistWord: { add: "Deep-toned " },
    swap: "Swap light textiles for charcoal, espresso, or plum tones.",
    shareTag: "Made it darker ✦",
  },
  cheaper: {
    vibePrefix: "Same vibe, smaller budget — ",
    shadeAmount: 0.0,
    checklistWord: { add: "Budget " },
    swap: "Prioritize secondhand and dupe versions of the big pieces first.",
    shareTag: "Made it cheaper ✦",
  },
  luxury: {
    vibePrefix: "Turned up the luxury — ",
    shadeAmount: -0.08,
    checklistWord: { add: "Elevated " },
    swap: "Upgrade one hero piece to a premium material like real wood or wool.",
    shareTag: "Made it more luxury ✦",
  },
};

export function applyMoodSwap(kit: RoomKit, type: MoodSwapType): RoomKit {
  const t = TRANSFORMS[type];

  const palette = kit.palette.map((c) => ({
    name: c.name,
    hex: shadeHex(c.hex, t.shadeAmount),
  }));

  const vibeSummary = t.vibePrefix + lowerFirst(stripPrefix(kit.vibeSummary));

  const shoppingChecklist = kit.shoppingChecklist.map((item, i) =>
    i === 0 ? `${t.checklistWord.add}${lowerFirst(item)}` : item,
  );

  const cheapSwaps = dedupeKeepFirst([t.swap, ...kit.budgetPlan.cheapSwaps]).slice(0, 4);

  const baseShare = kit.shareText.replace(/\s*(Made it[^✦]*✦|Recreate this room ✦)\s*$/i, "").trim();
  const shareText = `${baseShare} ${t.shareTag}`.trim();

  return {
    ...kit,
    palette,
    vibeSummary,
    shoppingChecklist,
    budgetPlan: { ...kit.budgetPlan, cheapSwaps },
    shareText,
  };
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// Remove a previously applied vibe prefix so swaps don't stack endlessly.
function stripPrefix(s: string): string {
  for (const key of Object.keys(TRANSFORMS) as MoodSwapType[]) {
    const p = TRANSFORMS[key].vibePrefix;
    if (s.startsWith(p)) return s.slice(p.length);
  }
  return s;
}

function dedupeKeepFirst(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()))).filter(Boolean);
}
