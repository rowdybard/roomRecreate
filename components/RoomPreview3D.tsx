"use client";

import { forwardRef, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import type { Group, Mesh } from "three";
import type { LayoutItem, PaletteColor } from "@/lib/types";
import { getStyleData } from "@/lib/styles-data";
import type { StyleName } from "@/lib/types";

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

const ROOM_W = 10; // world units
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

function GLBModel({ url }: { url: string }) {
  // useGLTF suspends; only rendered when we've confirmed the file exists.
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene.clone()} />;
}

function Piece({
  item,
  color,
  modelUrl,
  index,
  revealed,
}: {
  item: LayoutItem;
  color: string;
  modelUrl: string | null;
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
        <Suspense fallback={<PlaceholderBox w={w} h={h} d={d} color={color} />}>
          <GLBModel url={modelUrl} />
        </Suspense>
      ) : (
        <PlaceholderBox w={w} h={h} d={d} color={color} ref={meshRef} />
      )}
    </group>
  );
}

const PlaceholderBox = forwardRef<
  Mesh,
  { w: number; h: number; d: number; color: string }
>(function PlaceholderBox({ w, h, d, color }, ref) {
  return (
    <RoundedBox
      ref={ref as never}
      args={[w, h, d]}
      radius={Math.min(0.12, h / 3)}
      smoothness={4}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} />
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
      {layout.map((it, i) => (
        <Piece
          key={it.item + i}
          item={it}
          color={palette[(i % (palette.length - 1)) + 1]?.hex ?? sd.furnitureColor}
          modelUrl={modelUrls[i]}
          index={i}
          revealed={revealed}
        />
      ))}
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
