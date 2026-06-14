import type { PaletteColor, StyleName } from "./types";

/**
 * Per-style design data used by the deterministic generator and the 3D preview.
 * `modelSlug` maps a style to its folder under /public/models/<modelSlug>/.
 *
 * FUTURE: Meshy-generated GLB asset packs drop into these folders. The 3D
 * preview tries to load them and shows a placeholder if a file is missing.
 */
export type StyleData = {
  modelSlug: string;
  palette: PaletteColor[];
  vibeWords: string[];
  rules: string[];
  // Base material color used by the 3D placeholder furniture.
  furnitureColor: string;
  floorColor: string;
  wallColor: string;
};

export const STYLE_DATA: Record<StyleName, StyleData> = {
  "Cozy Neutral": {
    modelSlug: "cozy-neutral",
    palette: [
      { name: "Warm Cream", hex: "#F4EBDD" },
      { name: "Soft Beige", hex: "#D8C3A5" },
      { name: "Oak Wood", hex: "#B58B61" },
      { name: "Muted Olive", hex: "#8A8F6A" },
    ],
    vibeWords: ["soft", "warm", "layered", "natural", "calm"],
    rules: [
      "Keep the largest pieces neutral.",
      "Use warm lighting instead of bright white lighting.",
      "Repeat wood tones at least twice.",
      "Add one organic texture like linen, jute, or ceramic.",
    ],
    furnitureColor: "#C8AD88",
    floorColor: "#E7D8C2",
    wallColor: "#F4EBDD",
  },
  "Dark Feminine": {
    modelSlug: "dark-feminine",
    palette: [
      { name: "Espresso", hex: "#2B2422" },
      { name: "Smoked Mauve", hex: "#6E5560" },
      { name: "Dusty Rose", hex: "#B98A8A" },
      { name: "Warm Gold", hex: "#C9A24B" },
    ],
    vibeWords: ["moody", "rich", "sultry", "dramatic", "elegant"],
    rules: [
      "Anchor the room with one deep, dark base color.",
      "Layer soft lighting to keep it warm, not cold.",
      "Add a metallic accent like brushed gold or bronze.",
      "Use velvet or matte textures for depth.",
    ],
    furnitureColor: "#5A4750",
    floorColor: "#3A3230",
    wallColor: "#2B2422",
  },
  "Soft Glam": {
    modelSlug: "soft-glam",
    palette: [
      { name: "Pearl", hex: "#F3ECE6" },
      { name: "Champagne", hex: "#E4CDB0" },
      { name: "Soft Taupe", hex: "#C7B2A3" },
      { name: "Antique Gold", hex: "#C2A14E" },
    ],
    vibeWords: ["polished", "luminous", "luxe", "feminine", "refined"],
    rules: [
      "Mix soft neutrals with one metallic shine.",
      "Use a plush texture like boucle or velvet.",
      "Keep lines clean and let the materials glow.",
      "Add a statement mirror to bounce light.",
    ],
    furnitureColor: "#D8C2AC",
    floorColor: "#EAE0D6",
    wallColor: "#F3ECE6",
  },
  "Minimal Modern": {
    modelSlug: "minimal-modern",
    palette: [
      { name: "Off White", hex: "#F2F1ED" },
      { name: "Cool Greige", hex: "#CFC9C1" },
      { name: "Slate", hex: "#8A8A86" },
      { name: "Charcoal", hex: "#3A3A38" },
    ],
    vibeWords: ["clean", "calm", "uncluttered", "modern", "intentional"],
    rules: [
      "Less furniture, more open floor space.",
      "Stick to two or three colors total.",
      "Choose simple shapes with clean lines.",
      "Hide clutter with closed storage.",
    ],
    furnitureColor: "#C2BCB3",
    floorColor: "#E4E1DB",
    wallColor: "#F2F1ED",
  },
  "Boho Warm": {
    modelSlug: "boho-warm",
    palette: [
      { name: "Sand", hex: "#E8D5B7" },
      { name: "Terracotta", hex: "#C17A54" },
      { name: "Rust", hex: "#9C5A3C" },
      { name: "Olive", hex: "#7E7B4F" },
    ],
    vibeWords: ["earthy", "textured", "relaxed", "collected", "warm"],
    rules: [
      "Layer rugs and textiles for a collected feel.",
      "Mix natural materials like rattan, jute, and wood.",
      "Add plenty of plants at different heights.",
      "Keep colors warm and earthy.",
    ],
    furnitureColor: "#C08A5E",
    floorColor: "#E2CBA8",
    wallColor: "#EFE0C6",
  },
  "Pink Modern": {
    modelSlug: "pink-modern",
    palette: [
      { name: "Soft Pink", hex: "#F6DCE2" },
      { name: "Blush", hex: "#EEB5C0" },
      { name: "Warm White", hex: "#FBF4F0" },
      { name: "Cocoa", hex: "#7A5A52" },
    ],
    vibeWords: ["playful", "fresh", "sweet", "bright", "modern"],
    rules: [
      "Pair soft pink with a warm neutral so it feels modern.",
      "Use one grounding cocoa or wood tone.",
      "Keep shapes rounded and friendly.",
      "Add a single bold accent piece.",
    ],
    furnitureColor: "#EEC2CC",
    floorColor: "#F6E7E5",
    wallColor: "#FBF4F0",
  },
  "Earthy Organic": {
    modelSlug: "earthy-organic",
    palette: [
      { name: "Linen", hex: "#EDE4D3" },
      { name: "Clay", hex: "#C9A27E" },
      { name: "Moss", hex: "#7C8456" },
      { name: "Stone", hex: "#9B9183" },
    ],
    vibeWords: ["grounded", "natural", "tactile", "serene", "organic"],
    rules: [
      "Choose natural, undyed materials where possible.",
      "Add organic, irregular shapes.",
      "Bring in greenery and raw wood.",
      "Keep the palette soft and earthy.",
    ],
    furnitureColor: "#BFA585",
    floorColor: "#E2D6C1",
    wallColor: "#EDE4D3",
  },
  "Colorful Maximalist": {
    modelSlug: "colorful-maximalist",
    palette: [
      { name: "Marigold", hex: "#E8A33D" },
      { name: "Teal", hex: "#2E7D78" },
      { name: "Magenta", hex: "#B5446E" },
      { name: "Cobalt", hex: "#2F5DAA" },
      { name: "Cream", hex: "#F4EEDF" },
    ],
    vibeWords: ["bold", "joyful", "eclectic", "vibrant", "expressive"],
    rules: [
      "Pick a hero color, then build a bold supporting palette.",
      "Mix patterns but keep one shared color between them.",
      "Balance busy areas with a few calm zones.",
      "Repeat each color at least twice around the room.",
    ],
    furnitureColor: "#C76B86",
    floorColor: "#EFE6D2",
    wallColor: "#F4EEDF",
  },
};

export function getStyleData(style: StyleName): StyleData {
  return STYLE_DATA[style] ?? STYLE_DATA["Cozy Neutral"];
}
