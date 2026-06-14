import { generateLayout } from "./generateLayout";
import { getStyleData } from "./styles-data";
import type {
  AiKitText,
  GenerateInputs,
  RoomKit,
  RoomType,
} from "./types";
import { createSlug, hashString, makeId, seededRandom } from "./utils";

/**
 * Deterministic, offline kit generation. Used directly when no OpenAI key is
 * configured, and as the validated fallback when OpenAI is unavailable or
 * returns malformed JSON.
 */

const ROOM_KEYWORD: Record<RoomType, string> = {
  Bedroom: "bedroom",
  "Living Room": "living room",
  Office: "office",
  "Dorm Room": "dorm room",
  "Vanity Corner": "vanity corner",
  "Studio Apartment": "studio apartment",
};

// Product categories per room type — never brand names.
const ROOM_PRODUCTS: Record<RoomType, string[]> = {
  Bedroom: [
    "bedding set",
    "area rug",
    "nightstand",
    "table or floor lamp",
    "curtains",
    "wall mirror",
    "throw blanket",
  ],
  "Living Room": [
    "sofa or loveseat",
    "area rug",
    "accent chair",
    "coffee table",
    "floor lamp",
    "throw pillows",
    "media console",
  ],
  Office: [
    "desk",
    "task or accent chair",
    "shelving unit",
    "desk lamp",
    "wall art set",
    "storage baskets",
    "desk organizer",
  ],
  "Dorm Room": [
    "bedding set",
    "compact desk",
    "storage cubbies",
    "clip or floor lamp",
    "area rug",
    "wall decor",
    "over-door organizer",
  ],
  "Vanity Corner": [
    "vanity table",
    "lighted or arched mirror",
    "vanity stool",
    "soft task lamp",
    "tray and organizers",
    "small rug",
    "wall art",
  ],
  "Studio Apartment": [
    "bed or daybed",
    "compact sofa",
    "area rug",
    "multi-use storage",
    "floor lamp",
    "room divider",
    "wall shelves",
  ],
};

function budgetTier(budget: string): 0 | 1 | 2 | 3 {
  if (budget.includes("Under")) return 0;
  if (budget.includes("250")) return 1;
  if (budget.includes("750")) return 2;
  return 3;
}

function adjForBudget(checklist: string[], budget: string): string[] {
  const tier = budgetTier(budget);
  const prefix = ["Budget-friendly ", "Affordable ", "Mid-range ", "Elevated "][tier];
  return checklist.map((c, i) => (i === 0 ? `${prefix}${c}` : c));
}

function buildShareText(title: string): string {
  return `I made a ${title} with a room plan, palette, shopping checklist, and budget swaps. Recreate this room ✦`;
}

/** Compose the AI-shaped text fields deterministically. */
export function generateKitText(inputs: GenerateInputs): AiKitText {
  const style = getStyleData(inputs.style);
  const seed = hashString(
    `${inputs.vibe}|${inputs.roomType}|${inputs.roomSize}|${inputs.style}|${inputs.budget}|${inputs.mustHaves.join(",")}`,
  );
  const rand = seededRandom(seed);

  const roomWord = ROOM_KEYWORD[inputs.roomType];
  const [w1, w2, w3] = style.vibeWords;
  const title = `${inputs.style} ${inputs.roomType} Recreate Kit`;

  const vibeSummary = `A ${w1}, ${w2} ${roomWord} with ${w3} touches, ${
    inputs.roomSize.toLowerCase()
  }-room proportions, and a ${inputs.style.toLowerCase()} feel that's easy to actually pull together.`;

  const products = ROOM_PRODUCTS[inputs.roomType];
  // Bias the checklist toward the user's must-haves first.
  const mustProducts = inputs.mustHaves
    .map((m) => mustHaveToProduct(m))
    .filter(Boolean) as string[];
  const merged = dedupe([...mustProducts, ...products]).slice(0, 7);
  const shoppingChecklist = adjForBudget(merged, inputs.budget);

  const styleHex = style.palette[0].name.toLowerCase();
  const searchTerms = dedupe([
    `${inputs.style.toLowerCase()} ${roomWord}`,
    `${styleHex} ${roomWord} decor`,
    ...merged.slice(0, 3).map((p) => `${inputs.style.toLowerCase()} ${p}`),
  ]).slice(0, 5);

  const tier = budgetTier(inputs.budget);
  const buyFirst = merged.slice(0, 3).map(titleCaseFirst);
  const saveForLater = merged.slice(3, 6).map(titleCaseFirst);
  const cheapSwaps = pickCheapSwaps(rand, tier);

  const roomSetupSteps = buildSetupSteps(inputs.roomType, merged);

  return {
    title,
    vibeSummary,
    palette: style.palette,
    shoppingChecklist,
    budgetPlan: { buyFirst, saveForLater, cheapSwaps },
    designRules: style.rules,
    searchTerms,
    roomSetupSteps,
    shareText: buildShareText(title),
  };
}

/** Build a complete RoomKit from inputs + AI-shaped text (local or OpenAI). */
export function assembleKit(inputs: GenerateInputs, text: AiKitText): RoomKit {
  const layout = generateLayout(inputs.roomType, inputs.roomSize, inputs.mustHaves);
  const slug = createSlug(`${inputs.style}-${inputs.roomType}`);
  return {
    id: makeId(),
    title: text.title,
    slug,
    roomType: inputs.roomType,
    roomSize: inputs.roomSize,
    style: inputs.style,
    budget: inputs.budget,
    sourceVibe: inputs.vibe,
    vibeSummary: text.vibeSummary,
    palette: text.palette,
    layout,
    shoppingChecklist: text.shoppingChecklist,
    budgetPlan: text.budgetPlan,
    designRules: text.designRules,
    searchTerms: text.searchTerms,
    roomSetupSteps: text.roomSetupSteps,
    shareText: text.shareText,
    createdAt: new Date().toISOString(),
    emailUnlocked: false,
  };
}

/** Full deterministic kit (text + layout). */
export function generateFallbackKit(inputs: GenerateInputs): RoomKit {
  return assembleKit(inputs, generateKitText(inputs));
}

// Public alias matching the planned function name.
export const generateKit = generateFallbackKit;

// ---- helpers ----

function mustHaveToProduct(must: string): string | null {
  const map: Record<string, string> = {
    Bed: "bedding set",
    Desk: "desk",
    Vanity: "vanity table",
    Mirror: "wall or arched mirror",
    Rug: "area rug",
    Plants: "potted plants",
    Shelves: "shelving unit",
    "Gallery Wall": "framed art set",
    "Floor Lamp": "floor lamp",
    Curtains: "curtains",
    Storage: "storage unit",
    "Accent Chair": "accent chair",
  };
  return map[must] ?? null;
}

function buildSetupSteps(roomType: RoomType, items: string[]): string[] {
  const anchor = items[0] ?? "largest piece";
  return [
    `Place the ${anchor} first as the visual anchor.`,
    "Add the rug to define and soften the center of the room.",
    "Layer in warm lighting near the main seating or bed.",
    "Finish with plants, mirrors, and wall decor last.",
  ];
}

function pickCheapSwaps(rand: () => number, tier: number): string[] {
  const pool = [
    "Use peel-and-stick wall art instead of framed prints.",
    "Shop thrifted or marketplace wood furniture.",
    "Choose linen-look fabric instead of true linen.",
    "Swap a designer lamp for a warm-bulb budget version.",
    "Use a faux plant in place of a large statement plant.",
    "Layer two affordable rugs instead of one large premium rug.",
    "Repaint a thrifted frame instead of buying new.",
  ];
  // Higher budgets get fewer swaps; lower budgets get more.
  const count = tier <= 1 ? 3 : 2;
  const shuffled = [...pool].sort(() => rand() - 0.5);
  return shuffled.slice(0, count);
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()))).filter(Boolean);
}

function titleCaseFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
