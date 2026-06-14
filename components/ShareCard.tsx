"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import type { RoomKit } from "@/lib/types";
import { blendHex, furnitureStyle } from "@/lib/furniture";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "./Toast";

/**
 * WOW FACTOR 4: Shareable Kit Card.
 * Beautiful preview + Copy Share Text + real PNG download (html-to-image).
 */
export function ShareCard({ kit }: { kit: RoomKit }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  async function handleCopyShare() {
    const ok = await copyToClipboard(buildShareText(kit));
    showToast(ok ? "Share text copied." : "Couldn't copy — try again.");
  }

  async function handleDownloadPng() {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${kit.slug}-recreate-kit.png`;
      link.href = dataUrl;
      link.click();
      showToast("PNG downloaded.");
    } catch {
      // FUTURE: server-side card rendering for guaranteed fidelity.
      showToast("PNG export coming soon.");
    }
  }

  const topItems = kit.shoppingChecklist.slice(0, 3);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* The card (this node is exported to PNG) */}
      <div
        ref={cardRef}
        className="overflow-hidden rounded-xl3 bg-gradient-to-br from-white to-sand p-6 shadow-soft ring-1 ring-white/70"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-serif text-sm font-semibold">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-cream">
              ◗
            </span>
            Room Recreator
          </span>
          <span className="rounded-full bg-ink/90 px-3 py-1 text-[11px] font-semibold text-cream">
            {kit.style}
          </span>
        </div>

        <h3 className="mt-4 font-serif text-2xl font-semibold leading-tight text-ink">
          {kit.title}
        </h3>

        {/* Palette */}
        <div className="mt-4 flex gap-2">
          {kit.palette.map((c) => (
            <div
              key={c.hex}
              className="h-9 flex-1 rounded-lg ring-1 ring-black/5"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1fr] gap-4">
          {/* Mini layout */}
          <div
            className="relative overflow-hidden rounded-xl ring-1 ring-black/5"
            style={{
              aspectRatio: "4 / 3",
              backgroundColor: kit.palette[0]?.hex ?? "#EFE6D8",
            }}
          >
            {kit.layout.map((it, i) => {
              const style = furnitureStyle(it.item);
              const isRug = style.flat || it.item.toLowerCase().includes("rug");
              const accent = kit.palette[2]?.hex ?? kit.palette[1]?.hex ?? "#B58B61";
              return (
                <div
                  key={i}
                  className="absolute flex items-center justify-center rounded ring-1 ring-black/10"
                  style={{
                    left: `${it.x}%`,
                    top: `${it.y}%`,
                    width: `${it.w}%`,
                    height: `${it.h}%`,
                    backgroundColor: blendHex(style.tone, accent, 0.18),
                    backgroundImage: isRug
                      ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 5px, rgba(0,0,0,0.05) 5px 10px)"
                      : undefined,
                    opacity: isRug ? 0.75 : 0.98,
                    zIndex: isRug ? 1 : 2,
                  }}
                >
                  {!isRug && (
                    <span className="select-none leading-none" style={{ fontSize: "clamp(8px, 1.6vw, 14px)" }} aria-hidden>
                      {style.icon}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Top 3 items */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-cocoa/70">
              Top 3 to buy
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {topItems.map((item, i) => (
                <li key={i} className="text-sm leading-snug text-ink">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-cream">
          Recreate this room →
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <h4 className="font-serif text-lg font-semibold text-ink">
          Spread the vibe
        </h4>
        <p className="mt-1 text-sm text-cocoa/70">
          Copy the text for Pinterest, TikTok, or your group chat — or save the
          card as an image.
        </p>
        <div className="mt-4 space-y-2.5">
          <button onClick={handleCopyShare} className="btn-primary w-full">
            Copy Share Text
          </button>
          <button onClick={handleDownloadPng} className="btn-soft w-full">
            Download PNG
          </button>
        </div>
        <div className="mt-5 rounded-2xl bg-sand/70 p-3 text-xs leading-relaxed text-cocoa">
          “{buildShareText(kit)}”
        </div>
      </div>
    </div>
  );
}

function buildShareText(kit: RoomKit): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || "";
  const link = url ? ` ${url}/kit/${kit.id}` : "";
  return `${kit.shareText}${link}`;
}
