import type { LayoutItem, RoomSize, RoomType } from "./types";

/**
 * Deterministic 2D layout generation. This is intentionally NOT done by OpenAI.
 * Returns furniture blocks positioned with x/y/w/h percentages of the room.
 *
 * Goals: keep items in bounds, avoid severe overlaps, prioritize must-haves,
 * and look pretty — not perfect CAD.
 */

const MODEL_FILE: Record<string, string> = {
  Bed: "bed.glb",
  Desk: "desk.glb",
  Vanity: "vanity.glb",
  Mirror: "mirror.glb",
  Rug: "rug.glb",
  Plant: "plant.glb",
  Plants: "plant.glb",
  Shelves: "shelf.glb",
  "Gallery Wall": "gallery.glb",
  "Floor Lamp": "lamp.glb",
  Lamp: "lamp.glb",
  Curtains: "curtains.glb",
  Storage: "storage.glb",
  "Accent Chair": "chair.glb",
  Nightstand: "nightstand.glb",
  Sofa: "sofa.glb",
};

function modelFor(item: string): string {
  return MODEL_FILE[item] ?? "object.glb";
}

// Base placements per item, defined as % of room. Items are only included if
// requested or added as a sensible default for the room type.
type Placement = Omit<LayoutItem, "model">;

const PLACEMENTS: Record<string, Placement> = {
  Bed: { item: "Bed", x: 14, y: 10, w: 46, h: 30, z: 1 },
  Sofa: { item: "Sofa", x: 12, y: 12, w: 50, h: 22, z: 1 },
  Desk: { item: "Desk", x: 56, y: 12, w: 34, h: 16, z: 1 },
  Vanity: { item: "Vanity", x: 58, y: 14, w: 30, h: 15, z: 1 },
  Rug: { item: "Rug", x: 20, y: 46, w: 54, h: 30, z: 0 },
  Nightstand: { item: "Nightstand", x: 64, y: 12, w: 12, h: 12, z: 1 },
  Mirror: { item: "Mirror", x: 80, y: 50, w: 9, h: 24, z: 2 },
  Plants: { item: "Plant", x: 6, y: 70, w: 11, h: 11, z: 1 },
  Shelves: { item: "Shelves", x: 6, y: 6, w: 8, h: 34, z: 2 },
  "Gallery Wall": { item: "Gallery Wall", x: 30, y: 4, w: 30, h: 7, z: 2 },
  "Floor Lamp": { item: "Floor Lamp", x: 80, y: 12, w: 9, h: 9, z: 1 },
  Curtains: { item: "Curtains", x: 4, y: 4, w: 7, h: 28, z: 2 },
  Storage: { item: "Storage", x: 66, y: 70, w: 24, h: 14, z: 1 },
  "Accent Chair": { item: "Accent Chair", x: 8, y: 50, w: 16, h: 16, z: 1 },
};

// Sensible default items per room type when the user picks nothing.
const ROOM_DEFAULTS: Record<RoomType, string[]> = {
  Bedroom: ["Bed", "Rug", "Nightstand", "Floor Lamp", "Plants"],
  "Living Room": ["Sofa", "Rug", "Accent Chair", "Storage", "Floor Lamp"],
  Office: ["Desk", "Accent Chair", "Shelves", "Plants", "Floor Lamp"],
  "Dorm Room": ["Bed", "Desk", "Storage", "Floor Lamp", "Plants"],
  "Vanity Corner": ["Vanity", "Mirror", "Floor Lamp", "Accent Chair", "Plants"],
  "Studio Apartment": ["Bed", "Sofa", "Rug", "Storage", "Plants"],
};

// Required anchors that should always appear for a room type (even if the user
// did not check them), so the plan looks complete.
const REQUIRED_ANCHORS: Partial<Record<RoomType, string[]>> = {
  Bedroom: ["Bed"],
  Office: ["Desk"],
  "Vanity Corner": ["Vanity", "Mirror", "Floor Lamp"],
  "Dorm Room": ["Bed", "Desk", "Storage"],
  "Living Room": ["Rug", "Accent Chair", "Storage", "Floor Lamp"],
};

function sizeScale(size: RoomSize): number {
  // Smaller rooms => slightly larger furniture footprint (feels fuller).
  if (size === "Small") return 1.08;
  if (size === "Large") return 0.9;
  return 1;
}

export function generateLayout(
  roomType: RoomType,
  roomSize: RoomSize,
  mustHaves: string[],
): LayoutItem[] {
  const requested = new Set<string>(mustHaves);

  // Build the included set: required anchors + user must-haves, padded with
  // room defaults until we have a nicely filled room (max ~7 pieces).
  const included: string[] = [];
  const add = (name: string) => {
    if (!included.includes(name) && PLACEMENTS[name]) included.push(name);
  };

  (REQUIRED_ANCHORS[roomType] ?? []).forEach(add);
  mustHaves.forEach(add);

  if (included.length < 5) {
    for (const def of ROOM_DEFAULTS[roomType]) {
      if (included.length >= 6) break;
      add(def);
    }
  }

  const scale = sizeScale(roomSize);

  const layout: LayoutItem[] = included.map((name) => {
    const base = PLACEMENTS[name];
    const w = Math.min(base.w * scale, 60);
    const h = Math.min(base.h * scale, 42);
    // Keep within bounds with a small inner margin.
    const x = Math.max(3, Math.min(base.x, 97 - w));
    const y = Math.max(3, Math.min(base.y, 95 - h));
    return {
      item: base.item,
      x,
      y,
      w,
      h,
      z: base.z ?? 1,
      model: modelFor(base.item),
      // FUTURE: drag-and-drop editor would let users override x/y/w/h here.
    };
  });

  // Resolve overlaps so pieces never sit on top of each other, then snap to ints.
  resolveOverlaps(layout);

  // Mark requested-but-default items so callers could highlight them later.
  void requested;
  return layout.map((it) => ({
    ...it,
    x: Math.round(it.x),
    y: Math.round(it.y),
    w: Math.round(it.w),
    h: Math.round(it.h),
  }));
}

const MARGIN = 2; // % inner room margin
const GAP = 1.5; // min % gap between pieces

/**
 * Iterative separation pass. Flat floor coverings (rugs, z===0) are left in
 * place and ignored — everything is allowed to sit on a rug. All other pieces
 * are pushed apart along the axis of least penetration and clamped to the room.
 */
function resolveOverlaps(items: LayoutItem[]): void {
  const movable = items.filter((it) => (it.z ?? 1) !== 0);

  for (let pass = 0; pass < 24; pass++) {
    let moved = false;
    for (let i = 0; i < movable.length; i++) {
      for (let j = i + 1; j < movable.length; j++) {
        const a = movable[i];
        const b = movable[j];

        // Penetration depth on each axis (positive => overlapping).
        const px =
          Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + GAP;
        const py =
          Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + GAP;
        if (px <= 0 || py <= 0) continue;

        moved = true;
        // Push the smaller-area piece more so anchors (bed/sofa) stay put.
        const areaA = a.w * a.h;
        const areaB = b.w * b.h;
        const total = areaA + areaB;
        const shareA = areaB / total; // a moves proportional to b's size
        const shareB = areaA / total;

        if (px < py) {
          // Separate horizontally.
          const dir = a.x <= b.x ? -1 : 1;
          a.x += dir * px * shareA;
          b.x -= dir * px * shareB;
        } else {
          // Separate vertically.
          const dir = a.y <= b.y ? -1 : 1;
          a.y += dir * py * shareA;
          b.y -= dir * py * shareB;
        }
        clamp(a);
        clamp(b);
      }
    }
    if (!moved) break;
  }
}

function clamp(it: LayoutItem): void {
  it.x = Math.max(MARGIN, Math.min(it.x, 100 - MARGIN - it.w));
  it.y = Math.max(MARGIN, Math.min(it.y, 100 - MARGIN - it.h));
}
