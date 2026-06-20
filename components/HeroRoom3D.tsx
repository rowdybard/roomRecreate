"use client";

import { useMemo } from "react";
import { RoomPreview3D } from "./RoomPreview3D";
import type { LayoutItem, PaletteColor } from "@/lib/types";
import type { StyleName } from "@/lib/types";

const DEMO_LAYOUT: LayoutItem[] = [
  { item: "Bed", x: 10, y: 8, w: 40, h: 30, model: "bed.glb" },
  { item: "Rug", x: 18, y: 44, w: 48, h: 30, model: "rug.glb" },
  { item: "Nightstand", x: 54, y: 10, w: 10, h: 12, model: "nightstand.glb" },
  { item: "Floor Lamp", x: 6, y: 44, w: 8, h: 8, model: "lamp.glb" },
  { item: "Mirror", x: 78, y: 50, w: 10, h: 26, model: "mirror.glb" },
  { item: "Plant", x: 5, y: 72, w: 10, h: 10, model: "plant.glb" },
  { item: "Gallery Wall", x: 68, y: 8, w: 14, h: 12, model: "gallery.glb" },
  { item: "Storage", x: 80, y: 72, w: 12, h: 14, model: "storage.glb" },
];

const DEMO_PALETTE: PaletteColor[] = [
  { name: "Warm Cream", hex: "#F4EBDD" },
  { name: "Soft Beige", hex: "#D8C3A5" },
  { name: "Oak Wood", hex: "#B58B61" },
  { name: "Muted Olive", hex: "#8A8F6A" },
];

export function HeroRoom3D({
  style = "Cozy Neutral",
  className = "",
}: {
  style?: StyleName;
  className?: string;
}) {
  const layout = useMemo(() => DEMO_LAYOUT, []);
  const palette = useMemo(() => DEMO_PALETTE, []);

  return (
    <div className={className}>
      <RoomPreview3D layout={layout} palette={palette} style={style} />
    </div>
  );
}
