import type { PaletteColor, StyleName } from "./types";

/**
 * Per-style design data used by the deterministic generator and the 3D preview.
 * `modelSlug` maps a style to its folder under /public/models/<modelSlug>/.
 *
 * FUTURE: Meshy-generated GLB asset packs drop into these folders. The 3D
 * preview tries to load them and shows a placeholder if a file is missing.
 */
export type FurnitureMaterial = {
  /** Color tint applied to meshes in this category. */
  tint: string;
  /** Surface roughness 0–1 (0 = glossy, 1 = matte). */
  roughness: number;
  /** Metallicness 0–1 (0 = dielectric, 1 = metal). */
  metalness: number;
  /** Texture key from TEXTURES map, or null for solid color. */
  texture: TextureKey | null;
  /** Texture repeat scale (higher = tighter pattern). */
  textureScale?: number;
};

export type TextureKey =
  | "wood_oak"
  | "wood_walnut"
  | "wood_painted"
  | "fabric_linen"
  | "fabric_velvet"
  | "fabric_boucle"
  | "metal_brushed"
  | "metal_gold"
  | "stone"
  | "rattan"
  | "ceramic"
  | "leather";

export type MaterialConfig = {
  bed: FurnitureMaterial;
  sofa: FurnitureMaterial;
  chair: FurnitureMaterial;
  desk: FurnitureMaterial;
  storage: FurnitureMaterial;
  shelf: FurnitureMaterial;
  nightstand: FurnitureMaterial;
  lamp: FurnitureMaterial;
  mirror: FurnitureMaterial;
  plant: FurnitureMaterial;
  rug: FurnitureMaterial;
  gallery: FurnitureMaterial;
  vanity: FurnitureMaterial;
  curtains: FurnitureMaterial;
};

export type StyleData = {
  modelSlug: string;
  palette: PaletteColor[];
  vibeWords: string[];
  rules: string[];
  // Base material color used by the 3D placeholder furniture.
  furnitureColor: string;
  floorColor: string;
  wallColor: string;
  /** Per-furniture material overrides applied to GLB models. */
  materials: MaterialConfig;
};

function mat(
  tint: string,
  roughness: number,
  metalness: number,
  texture: TextureKey | null = null,
  textureScale = 1,
): FurnitureMaterial {
  return { tint, roughness, metalness, texture, textureScale };
}

const WOOD = (tint: string, tex: TextureKey = "wood_oak"): FurnitureMaterial =>
  mat(tint, 0.7, 0.05, tex, 2);
const FABRIC = (tint: string, tex: TextureKey = "fabric_linen"): FurnitureMaterial =>
  mat(tint, 0.85, 0.0, tex, 3);
const METAL = (tint: string, tex: TextureKey = "metal_brushed"): FurnitureMaterial =>
  mat(tint, 0.35, 0.85, tex, 1);
const CERAMIC = (tint: string): FurnitureMaterial =>
  mat(tint, 0.3, 0.0, "ceramic", 1);
const STONE = (tint: string): FurnitureMaterial =>
  mat(tint, 0.8, 0.0, "stone", 2);
const RATTAN = (tint: string): FurnitureMaterial =>
  mat(tint, 0.9, 0.0, "rattan", 3);
const LEATHER = (tint: string): FurnitureMaterial =>
  mat(tint, 0.6, 0.05, "leather", 2);

function defaultMaterials(c: {
  wood: string; fabric: string; metal: string; accent: string;
  woodTex?: TextureKey; fabricTex?: TextureKey; metalTex?: TextureKey;
}): MaterialConfig {
  return {
    bed: FABRIC(c.fabric, c.fabricTex),
    sofa: FABRIC(c.fabric, c.fabricTex),
    chair: FABRIC(c.fabric, c.fabricTex),
    desk: WOOD(c.wood, c.woodTex),
    storage: WOOD(c.wood, c.woodTex),
    shelf: WOOD(c.wood, c.woodTex),
    nightstand: WOOD(c.wood, c.woodTex),
    lamp: METAL(c.metal, c.metalTex),
    mirror: METAL(c.metal, c.metalTex),
    plant: CERAMIC(c.accent),
    rug: FABRIC(c.accent, c.fabricTex),
    gallery: WOOD(c.wood, c.woodTex),
    vanity: WOOD(c.wood, c.woodTex),
    curtains: FABRIC(c.fabric, c.fabricTex),
  };
}

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
    materials: defaultMaterials({
      wood: "#B58B61", fabric: "#D8C3A5", metal: "#B0A090", accent: "#8A8F6A",
      woodTex: "wood_oak", fabricTex: "fabric_linen", metalTex: "metal_brushed",
    }),
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
    materials: {
      ...defaultMaterials({
        wood: "#3A2E2A", fabric: "#6E5560", metal: "#C9A24B", accent: "#B98A8A",
        woodTex: "wood_walnut", fabricTex: "fabric_velvet", metalTex: "metal_gold",
      }),
      bed: FABRIC("#6E5560", "fabric_velvet"),
      sofa: FABRIC("#6E5560", "fabric_velvet"),
      chair: LEATHER("#4A3A3A"),
    },
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
    materials: {
      ...defaultMaterials({
        wood: "#C7B2A3", fabric: "#E4CDB0", metal: "#C2A14E", accent: "#D8C2AC",
        woodTex: "wood_painted", fabricTex: "fabric_boucle", metalTex: "metal_gold",
      }),
      sofa: FABRIC("#E4CDB0", "fabric_boucle"),
      chair: FABRIC("#E4CDB0", "fabric_boucle"),
    },
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
    materials: {
      ...defaultMaterials({
        wood: "#8A8A86", fabric: "#CFC9C1", metal: "#8A8A86", accent: "#3A3A38",
        woodTex: "wood_painted", fabricTex: "fabric_linen", metalTex: "metal_brushed",
      }),
      bed: FABRIC("#CFC9C1", "fabric_linen"),
      sofa: FABRIC("#CFC9C1", "fabric_linen"),
      plant: CERAMIC("#8A8A86"),
    },
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
    materials: {
      ...defaultMaterials({
        wood: "#9C5A3C", fabric: "#C17A54", metal: "#C08A5E", accent: "#7E7B4F",
        woodTex: "wood_oak", fabricTex: "fabric_linen", metalTex: "metal_brushed",
      }),
      bed: RATTAN("#C08A5E"),
      sofa: RATTAN("#C17A54"),
      chair: RATTAN("#9C5A3C"),
      plant: CERAMIC("#7E7B4F"),
      rug: FABRIC("#C17A54", "fabric_linen"),
    },
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
    materials: {
      ...defaultMaterials({
        wood: "#7A5A52", fabric: "#F6DCE2", metal: "#7A5A52", accent: "#EEB5C0",
        woodTex: "wood_painted", fabricTex: "fabric_boucle", metalTex: "metal_brushed",
      }),
      bed: FABRIC("#F6DCE2", "fabric_boucle"),
      sofa: FABRIC("#F6DCE2", "fabric_boucle"),
      plant: CERAMIC("#EEB5C0"),
    },
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
    materials: {
      ...defaultMaterials({
        wood: "#C9A27E", fabric: "#EDE4D3", metal: "#9B9183", accent: "#7C8456",
        woodTex: "wood_oak", fabricTex: "fabric_linen", metalTex: "metal_brushed",
      }),
      bed: FABRIC("#EDE4D3", "fabric_linen"),
      sofa: FABRIC("#C9A27E", "fabric_linen"),
      plant: STONE("#9B9183"),
      rug: FABRIC("#7C8456", "fabric_linen"),
    },
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
    materials: {
      ...defaultMaterials({
        wood: "#2F5DAA", fabric: "#B5446E", metal: "#E8A33D", accent: "#2E7D78",
        woodTex: "wood_painted", fabricTex: "fabric_velvet", metalTex: "metal_gold",
      }),
      bed: FABRIC("#B5446E", "fabric_velvet"),
      sofa: FABRIC("#2E7D78", "fabric_velvet"),
      chair: FABRIC("#E8A33D", "fabric_velvet"),
      rug: FABRIC("#2F5DAA", "fabric_velvet"),
      plant: CERAMIC("#E8A33D"),
    },
  },
};

export function getStyleData(style: StyleName): StyleData {
  return STYLE_DATA[style] ?? STYLE_DATA["Cozy Neutral"];
}
