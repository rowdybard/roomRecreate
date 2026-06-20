"use client";

import { forwardRef, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial, Object3D, Texture } from "three";
import { CanvasTexture, SRGBColorSpace, RepeatWrapping, Mesh as MeshValue } from "three";
import type { LayoutItem, PaletteColor, StyleName } from "@/lib/types";
import { getStyleData } from "@/lib/styles-data";
import type { FurnitureMaterial, MaterialConfig, TextureKey } from "@/lib/styles-data";

/**
 * 3D Preview section.
 *
 * Tries to load prebuilt GLB assets from /public/models/<style-slug>/<model>.
 * If a file is missing (the default in V1), it renders a clean placeholder box.
 *
 * IMPORTANT (cost constraint): we NEVER call Meshy live. GLB files are treated
 * as static asset packs.
 * FUTURE: drop Meshy-generated GLBs into /public/models/<style-slug>/ and they
 * will load automatically with no code changes.
 */

// ---- Procedural texture generation ----
// Generates canvas-based textures so we don't need external image files.
// Each texture is a seamless tileable pattern tinted at render time.

const textureCache: Partial<Record<TextureKey, Texture>> = {};

function makeWoodTexture(key: TextureKey): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const isWalnut = key === "wood_walnut";
  const isPainted = key === "wood_painted";

  // Base
  ctx.fillStyle = isWalnut ? "#3A2E2A" : isPainted ? "#C7B2A3" : "#B58B61";
  ctx.fillRect(0, 0, 256, 256);

  // Grain lines
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * 256 + Math.random() * 4;
    const alpha = 0.05 + Math.random() * 0.1;
    ctx.strokeStyle = isWalnut
      ? `rgba(20,15,12,${alpha})`
      : isPainted
        ? `rgba(180,165,150,${alpha})`
        : `rgba(100,70,40,${alpha})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 256; x += 16) {
      ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 2);
    }
    ctx.stroke();
  }

  // Knots
  if (!isPainted) {
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 4 + Math.random() * 8;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, isWalnut ? "rgba(15,10,8,0.6)" : "rgba(80,50,25,0.5)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeFabricTexture(key: TextureKey): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const isVelvet = key === "fabric_velvet";
  const isBoucle = key === "fabric_boucle";

  ctx.fillStyle = "#EDE4D3";
  ctx.fillRect(0, 0, 256, 256);

  if (isVelvet) {
    // Soft noise + subtle sheen
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const a = Math.random() * 0.08;
      ctx.fillStyle = `rgba(0,0,0,${a})`;
      ctx.fillRect(x, y, 1, 1);
    }
    // Sheen streaks
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * 256;
      ctx.strokeStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.04})`;
      ctx.lineWidth = 8 + Math.random() * 12;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }
  } else if (isBoucle) {
    // Loop pattern
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 2 + Math.random() * 4;
      ctx.strokeStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Linen weave
    const step = 4;
    for (let y = 0; y < 256; y += step) {
      for (let x = 0; x < 256; x += step) {
        const a = Math.random() * 0.06;
        ctx.fillStyle = (x / step + y / step) % 2 === 0
          ? `rgba(0,0,0,${a})`
          : `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, step, step);
      }
    }
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeMetalTexture(key: TextureKey): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const isGold = key === "metal_gold";
  ctx.fillStyle = isGold ? "#C2A14E" : "#B0B0B0";
  ctx.fillRect(0, 0, 256, 256);

  // Brushed lines
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * 256;
    const alpha = 0.03 + Math.random() * 0.06;
    ctx.strokeStyle = isGold
      ? `rgba(160,130,60,${alpha})`
      : `rgba(80,80,80,${alpha})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y + (Math.random() - 0.5) * 8);
    ctx.stroke();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeStoneTexture(): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#9B9183";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const a = Math.random() * 0.1;
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeRattanTexture(): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#C08A5E";
  ctx.fillRect(0, 0, 256, 256);
  // Cross-hatch weave
  const step = 8;
  for (let y = 0; y < 256; y += step) {
    ctx.strokeStyle = "rgba(80,50,30,0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  for (let x = 0; x < 256; x += step) {
    ctx.strokeStyle = "rgba(160,110,70,0.2)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeCeramicTexture(): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#E8E0D5";
  ctx.fillRect(0, 0, 128, 128);
  // Subtle mottling
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
    ctx.fillRect(x, y, 1, 1);
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeLeatherTexture(): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#4A3A3A";
  ctx.fillRect(0, 0, 256, 256);
  // Pebbled grain
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 5;
    ctx.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function getTexture(key: TextureKey): Texture | null {
  if (textureCache[key]) return textureCache[key]!;
  let tex: Texture;
  switch (key) {
    case "wood_oak":
    case "wood_walnut":
    case "wood_painted":
      tex = makeWoodTexture(key);
      break;
    case "fabric_linen":
    case "fabric_velvet":
    case "fabric_boucle":
      tex = makeFabricTexture(key);
      break;
    case "metal_brushed":
    case "metal_gold":
      tex = makeMetalTexture(key);
      break;
    case "stone":
      tex = makeStoneTexture();
      break;
    case "rattan":
      tex = makeRattanTexture();
      break;
    case "ceramic":
      tex = makeCeramicTexture();
      break;
    case "leather":
      tex = makeLeatherTexture();
      break;
    default:
      return null;
  }
  textureCache[key] = tex;
  return tex;
}

// Map layout item name to material category key.
function itemToCategory(item: string): keyof MaterialConfig {
  const lower = item.toLowerCase();
  if (/bed/.test(lower)) return "bed";
  if (/sofa|couch/.test(lower)) return "sofa";
  if (/chair|stool|seat/.test(lower)) return "chair";
  if (/desk/.test(lower)) return "desk";
  if (/nightstand|night stand/.test(lower)) return "nightstand";
  if (/shelf|bookcase|bookshelf/.test(lower)) return "shelf";
  if (/mirror/.test(lower)) return "mirror";
  if (/lamp|light/.test(lower)) return "lamp";
  if (/plant/.test(lower)) return "plant";
  if (/rug|carpet/.test(lower)) return "rug";
  if (/gallery|painting|art|frame/.test(lower)) return "gallery";
  if (/curtain|drape/.test(lower)) return "curtains";
  if (/vanity/.test(lower)) return "vanity";
  if (/closet|wardrobe|storage|dresser|chest/.test(lower)) return "storage";
  return "desk";
}

const ROOM_W = 10;
const ROOM_D = 7.5;
const WALL_H = 3;

// Map a layout item (percent space) to a 3D position/size on the floor.
function toWorld(it: LayoutItem) {
  const w = (it.w / 100) * ROOM_W;
  const d = (it.h / 100) * ROOM_D;
  const cx = (it.x + it.w / 2) / 100; // 0..1
  const cz = (it.y + it.h / 2) / 100;
  const x = (cx - 0.5) * ROOM_W;
  const z = (cz - 0.5) * ROOM_D;
  // Height heuristic by item type / z layer.
  const tall = /mirror|shelf|shelves|curtain|gallery|lamp|plant/i.test(it.item);
  const flat = /rug/i.test(it.item);
  const h = flat ? 0.06 : tall ? 1.6 : 0.7;
  return { x, z, w, d, h, flat };
}

function applyMaterial(
  object: Object3D,
  fm: FurnitureMaterial,
) {
  const tex = fm.texture ? getTexture(fm.texture) : null;
  object.traverse((child: Object3D) => {
    if (child instanceof MeshValue) {
      const mat = child.material as MeshStandardMaterial;
      if (mat) {
        mat.color.set(fm.tint);
        mat.roughness = fm.roughness;
        mat.metalness = fm.metalness;
        if (tex) {
          const t = tex.clone();
          t.needsUpdate = true;
          const scale = fm.textureScale ?? 1;
          t.repeat.set(scale, scale);
          mat.map = t;
          mat.needsUpdate = true;
        }
      }
    }
  });
}

function GLBModel({
  url,
  material,
}: {
  url: string;
  material: FurnitureMaterial;
}) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const s = gltf.scene.clone();
    applyMaterial(s, material);
    return s;
  }, [gltf, material]);
  return <primitive object={scene} />;
}

function Piece({
  item,
  color,
  modelUrl,
  material,
  index,
  revealed,
}: {
  item: LayoutItem;
  color: string;
  modelUrl: string | null;
  material: FurnitureMaterial;
  index: number;
  revealed: number;
}) {
  const ref = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const target = index < revealed ? 1 : 0;
  const { x, z, w, d, h, flat } = useMemo(() => toWorld(item), [item]);

  // Animate a gentle pop-in scale toward the target.
  useFrame(() => {
    if (!ref.current) return;
    const s = ref.current.scale.x;
    const next = s + (target - s) * 0.15;
    ref.current.scale.setScalar(next < 0.001 ? 0.001 : next);
  });

  return (
    <group ref={ref} position={[x, flat ? 0.03 : h / 2, z]} scale={0.001}>
      {modelUrl ? (
        <Suspense fallback={<PlaceholderBox w={w} h={h} d={d} color={color} material={material} />}>
          <GLBModel url={modelUrl} material={material} />
        </Suspense>
      ) : (
        <PlaceholderBox w={w} h={h} d={d} color={color} material={material} ref={meshRef} />
      )}
    </group>
  );
}

const PlaceholderBox = forwardRef<
  Mesh,
  { w: number; h: number; d: number; color: string; material: FurnitureMaterial }
>(function PlaceholderBox({ w, h, d, color, material }, ref) {
  const tex = material.texture ? getTexture(material.texture) : null;
  const texScale = material.textureScale ?? 1;
  return (
    <RoundedBox
      ref={ref as never}
      args={[w, h, d]}
      radius={Math.min(0.12, h / 3)}
      smoothness={4}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={material.roughness}
        metalness={material.metalness}
        map={tex ? (() => {
          const t = tex.clone();
          t.needsUpdate = true;
          t.repeat.set(texScale, texScale);
          return t;
        })() : undefined}
      />
    </RoundedBox>
  );
});

function RoomShell({ floor, wall }: { floor: string; wall: string }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color={floor} roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, WALL_H / 2, -ROOM_D / 2]} receiveShadow>
        <planeGeometry args={[ROOM_W, WALL_H]} />
        <meshStandardMaterial color={wall} roughness={1} />
      </mesh>
      {/* Left wall */}
      <mesh
        position={[-ROOM_W / 2, WALL_H / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_D, WALL_H]} />
        <meshStandardMaterial color={wall} roughness={1} />
      </mesh>
    </group>
  );
}

function Scene({
  layout,
  palette,
  style,
  modelUrls,
  revealed,
}: {
  layout: LayoutItem[];
  palette: PaletteColor[];
  style: StyleName;
  modelUrls: (string | null)[];
  revealed: number;
}) {
  const sd = getStyleData(style);
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Environment preset="apartment" />
      <RoomShell floor={sd.floorColor} wall={sd.wallColor} />
      {layout.map((it, i) => {
        const cat = itemToCategory(it.item);
        const fm = sd.materials[cat];
        return (
          <Piece
            key={it.item + i}
            item={it}
            color={palette[(i % (palette.length - 1)) + 1]?.hex ?? sd.furnitureColor}
            modelUrl={modelUrls[i]}
            material={fm}
            index={i}
            revealed={revealed}
          />
        );
      })}
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={0.6}
        maxPolarAngle={1.35}
        minDistance={9}
        maxDistance={18}
      />
    </>
  );
}

export function RoomPreview3D({
  layout,
  palette,
  style,
  revealKey,
}: {
  layout: LayoutItem[];
  palette: PaletteColor[];
  style: StyleName;
  revealKey?: string | number;
}) {
  const [modelUrls, setModelUrls] = useState<(string | null)[]>(
    layout.map(() => null),
  );
  const [revealed, setRevealed] = useState(0);
  const slug = getStyleData(style).modelSlug;

  // Probe each GLB with a HEAD request. Missing files (the V1 default) stay
  // null and render placeholder boxes — no errors, no Meshy calls.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      layout.map(async (it) => {
        if (!it.model) return null;
        const url = `/models/${slug}/${it.model}`;
        try {
          const res = await fetch(url, { method: "HEAD" });
          return res.ok ? url : null;
        } catch {
          return null;
        }
      }),
    ).then((urls) => {
      if (!cancelled) setModelUrls(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [layout, slug]);

  // Reveal pieces one-by-one.
  useEffect(() => {
    setRevealed(0);
    const timers = layout.map((_, i) =>
      setTimeout(() => setRevealed((n) => Math.max(n, i + 1)), 200 + i * 200),
    );
    return () => timers.forEach(clearTimeout);
  }, [layout, revealKey]);

  return (
    <div
      className="w-full overflow-hidden rounded-xl3 shadow-soft ring-1 ring-black/5"
      style={{ aspectRatio: "16 / 10" }}
    >
      <Canvas shadows camera={{ position: [8, 7, 11], fov: 42 }}>
        <color attach="background" args={["#efe7da"]} />
        <Suspense fallback={null}>
          <Scene
            layout={layout}
            palette={palette}
            style={style}
            modelUrls={modelUrls}
            revealed={revealed}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
