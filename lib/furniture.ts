/**
 * Shared visual style for furniture pieces in the 2D room plan.
 *
 * Each piece gets a recognizable icon and a semantic base color (wood / fabric /
 * greenery / glass / textile) so the plan reads as a real room instead of a
 * stack of identical palette-colored blocks. The base color is later blended
 * lightly with the kit palette so it still feels on-theme.
 */

export type FurnitureStyle = {
  /** Emoji icon shown on the piece. */
  icon: string;
  /** Semantic base color for the block fill. */
  tone: string;
  /** True for floor coverings drawn flat under everything else. */
  flat?: boolean;
};

const DEFAULT_STYLE: FurnitureStyle = { icon: "▢", tone: "#C9B79C" };

const STYLES: Record<string, FurnitureStyle> = {
  Bed: { icon: "🛏️", tone: "#E7D6C4" },
  Sofa: { icon: "🛋️", tone: "#C9A98C" },
  "Accent Chair": { icon: "🪑", tone: "#B98E6A" },
  Desk: { icon: "🖥️", tone: "#9C7A57" },
  Vanity: { icon: "💄", tone: "#D8B7A0" },
  Mirror: { icon: "🪞", tone: "#BFD3D6" },
  Rug: { icon: "🟫", tone: "#C7A98B", flat: true },
  Plant: { icon: "🪴", tone: "#8FA678" },
  Plants: { icon: "🪴", tone: "#8FA678" },
  Shelves: { icon: "📚", tone: "#A07C58" },
  "Gallery Wall": { icon: "🖼️", tone: "#D9C3A4" },
  "Floor Lamp": { icon: "💡", tone: "#E9D7A8" },
  Lamp: { icon: "💡", tone: "#E9D7A8" },
  Curtains: { icon: "🪟", tone: "#D2C0AE" },
  Storage: { icon: "🗄️", tone: "#8E6F4E" },
  Nightstand: { icon: "🕯️", tone: "#B58B61" },
};

export function furnitureStyle(item: string): FurnitureStyle {
  return STYLES[item] ?? DEFAULT_STYLE;
}

/**
 * Blend two hex colors. amount=0 → a, amount=1 → b.
 * Used to nudge the semantic tone toward the kit's palette accent.
 */
export function blendHex(a: string, b: string, amount: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return a;
  const m = (x: number, y: number) => Math.round(x + (y - x) * amount);
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(m(pa[0], pb[0]))}${to2(m(pa[1], pb[1]))}${to2(m(pa[2], pb[2]))}`;
}

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
