// Core data shapes for Room Recreator.

export type PaletteColor = {
  name: string;
  hex: string;
};

export type LayoutItem = {
  item: string;
  x: number; // % from left of room
  y: number; // % from top of room
  w: number; // % width
  h: number; // % height
  z?: number; // optional height layer for 3D
  model?: string; // GLB filename, e.g. "bed.glb" (optional, resolved per style)
};

export type BudgetPlan = {
  buyFirst: string[];
  saveForLater: string[];
  cheapSwaps: string[];
};

export type RoomKit = {
  id: string;
  title: string;
  slug: string;
  roomType: string;
  roomSize: string;
  style: string;
  budget: string;
  sourceVibe: string;
  vibeSummary: string;
  palette: PaletteColor[];
  layout: LayoutItem[];
  shoppingChecklist: string[];
  budgetPlan: BudgetPlan;
  designRules: string[];
  searchTerms: string[];
  roomSetupSteps: string[];
  shareText: string;
  createdAt: string;
  emailUnlocked?: boolean;
};

export type GenerateInputs = {
  vibe: string;
  roomType: RoomType;
  roomSize: RoomSize;
  style: StyleName;
  budget: BudgetName;
  mustHaves: string[];
};

export type RoomType =
  | "Bedroom"
  | "Living Room"
  | "Office"
  | "Dorm Room"
  | "Vanity Corner"
  | "Studio Apartment";

export type RoomSize = "Small" | "Medium" | "Large";

export type StyleName =
  | "Cozy Neutral"
  | "Dark Feminine"
  | "Soft Glam"
  | "Minimal Modern"
  | "Boho Warm"
  | "Pink Modern"
  | "Earthy Organic"
  | "Colorful Maximalist";

export type BudgetName =
  | "Under $250"
  | "$250–$750"
  | "$750–$1,500"
  | "$1,500+";

export type MoodSwapType = "cozier" | "darker" | "cheaper" | "luxury";

// Subset of fields we accept back from the OpenAI generator. Layout is always
// computed locally, so it is intentionally NOT part of the AI response.
export type AiKitText = {
  title: string;
  vibeSummary: string;
  palette: PaletteColor[];
  shoppingChecklist: string[];
  budgetPlan: BudgetPlan;
  designRules: string[];
  searchTerms: string[];
  roomSetupSteps: string[];
  shareText: string;
};

export const ROOM_TYPES: RoomType[] = [
  "Bedroom",
  "Living Room",
  "Office",
  "Dorm Room",
  "Vanity Corner",
  "Studio Apartment",
];

export const ROOM_SIZES: RoomSize[] = ["Small", "Medium", "Large"];

export const STYLE_NAMES: StyleName[] = [
  "Cozy Neutral",
  "Dark Feminine",
  "Soft Glam",
  "Minimal Modern",
  "Boho Warm",
  "Pink Modern",
  "Earthy Organic",
  "Colorful Maximalist",
];

export const BUDGETS: BudgetName[] = [
  "Under $250",
  "$250–$750",
  "$750–$1,500",
  "$1,500+",
];

export const MUST_HAVES = [
  "Bed",
  "Desk",
  "Vanity",
  "Mirror",
  "Rug",
  "Plants",
  "Shelves",
  "Gallery Wall",
  "Floor Lamp",
  "Curtains",
  "Storage",
  "Accent Chair",
] as const;
