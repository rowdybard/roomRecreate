"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "./Toast";

/**
 * CORE FEATURE: Restyle your real room.
 *
 * Upload (1) a photo of your actual room and (2) an inspiration board, and the
 * AI re-renders your room with the furniture/decor swapped to match the board.
 * Calls /api/restyle-room (OpenAI gpt-image-1) and shows a before/after slider.
 */

type Upload = {
  file: File;
  url: string; // object URL for preview
};

type SizeKey = "1024x1024" | "1536x1024" | "1024x1536" | "auto";

const MAX_BYTES = 12 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function RoomRestyler() {
  const { showToast } = useToast();
  const [room, setRoom] = useState<Upload | null>(null);
  const [board, setBoard] = useState<Upload | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Revoke object URLs on change/unmount to avoid leaks.
  useEffect(() => {
    return () => {
      if (room) URL.revokeObjectURL(room.url);
    };
  }, [room]);
  useEffect(() => {
    return () => {
      if (board) URL.revokeObjectURL(board.url);
    };
  }, [board]);

  const pick = useCallback(
    (which: "room" | "board") => (file: File | null) => {
      if (!file) return;
      if (!OK_TYPES.includes(file.type)) {
        showToast("Use a PNG, JPG, or WebP image.");
        return;
      }
      if (file.size > MAX_BYTES) {
        showToast("Image is too large (max 12 MB).");
        return;
      }
      const url = URL.createObjectURL(file);
      const upload = { file, url };
      if (which === "room") setRoom(upload);
      else setBoard(upload);
      setResult(null);
    },
    [showToast],
  );

  async function handleRestyle() {
    if (!room || !board || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const size = await pickSize(room.url);
      const body = new FormData();
      body.append("room", room.file, room.file.name);
      body.append("board", board.file, board.file.name);
      body.append("size", size);

      const res = await fetch("/api/restyle-room", { method: "POST", body });
      const data = (await res.json()) as { image?: string; error?: string };
      if (!res.ok || !data.image) {
        showToast(data.error || "Could not restyle the room.");
        return;
      }
      setResult(data.image);
      showToast("Room restyled ✦");
    } catch {
      showToast("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "restyled-room.png";
    a.click();
  }

  return (
    <section className="card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-ink">
            Restyle your real room
          </h3>
          <p className="mt-1 max-w-xl text-sm text-cocoa/70">
            Upload a photo of your room and an inspiration board. We&apos;ll
            re-render your room with the furniture and decor swapped to match.
          </p>
        </div>
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-cocoa">
          AI · gpt-image-1
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Dropzone
          label="Your room photo"
          hint="A clear, well-lit photo of the room you want to restyle"
          upload={room}
          onPick={pick("room")}
          onClear={() => setRoom(null)}
        />
        <Dropzone
          label="Inspiration board"
          hint="A mood board or product collage of the look you want"
          upload={board}
          onPick={pick("board")}
          onClear={() => setBoard(null)}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={handleRestyle}
          disabled={!room || !board || busy}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Restyling your room…" : "Restyle My Room →"}
        </button>
        {result && (
          <button onClick={handleDownload} className="btn-soft">
            Download PNG
          </button>
        )}
        <span className="text-xs text-cocoa/60">
          Takes ~20–60s. Your images are sent only to generate this result.
        </span>
      </div>

      {busy && (
        <div className="mt-5 grid place-items-center rounded-xl2 bg-white/70 p-10 text-center ring-1 ring-white/60">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-clay/30 border-t-oak" />
            <div className="absolute inset-0 grid place-items-center text-lg">
              ✦
            </div>
          </div>
          <p className="mt-4 font-serif text-lg text-ink">
            Redecorating your room…
          </p>
          <p className="mt-1 text-xs text-cocoa/60">
            Matching furniture, textiles, and decor to your board.
          </p>
        </div>
      )}

      {result && room && !busy && (
        <div className="mt-6">
          <BeforeAfter before={room.url} after={result} />
          <p className="mt-2 text-center text-xs text-cocoa/60">
            Drag the handle to compare before and after.
          </p>
        </div>
      )}
    </section>
  );
}

function Dropzone({
  label,
  hint,
  upload,
  onPick,
  onClear,
}: {
  label: string;
  hint: string;
  upload: Upload | null;
  onPick: (file: File | null) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {upload && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-cocoa/60 hover:text-ink"
          >
            Remove
          </button>
        )}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onPick(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`group relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-xl2 border-2 border-dashed transition ${
          over
            ? "border-oak bg-oak/5"
            : "border-clay/40 bg-white/60 hover:border-oak/60"
        }`}
      >
        {upload ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={upload.url}
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="px-4 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-sand text-lg">
              ⬆
            </div>
            <p className="mt-2 text-sm font-medium text-ink">
              Click or drop an image
            </p>
            <p className="mt-0.5 text-xs text-cocoa/60">{hint}</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (dragging.current) setFromClientX(e.clientX);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [setFromClientX]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-xl2 ring-1 ring-black/10"
      onPointerDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
    >
      {/* After (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt="Restyled room"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* Before (same size as container, clipped to the left of the handle) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt="Your original room"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
        Before
      </span>
      <span className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-semibold text-cream">
        After
      </span>

      {/* Handle */}
      <div
        className="absolute inset-y-0 z-10 flex w-0.5 cursor-ew-resize items-center justify-center bg-white shadow"
        style={{ left: `calc(${pos}% - 1px)` }}
      >
        <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow-md ring-1 ring-black/10">
          ⇋
        </div>
      </div>
    </div>
  );
}

/** Pick the closest supported output size to the room's aspect ratio. */
async function pickSize(url: string): Promise<SizeKey> {
  try {
    const ratio = await new Promise<number>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
      img.onerror = reject;
      img.src = url;
    });
    if (ratio > 1.2) return "1536x1024"; // landscape
    if (ratio < 0.83) return "1024x1536"; // portrait
    return "1024x1024"; // square-ish
  } catch {
    return "auto";
  }
}
