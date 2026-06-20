import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/serverEnv";

/**
 * POST /api/restyle-room  (multipart/form-data)
 *
 * Fields:
 *  - room  : File  — a photo of the user's actual room (the base image)
 *  - board : File  — an inspiration board / product collage to match
 *  - size  : string (optional) — "1024x1024" | "1536x1024" | "1024x1536" | "auto"
 *
 * Uses OpenAI `gpt-image-1` image edits with BOTH images as references and
 * returns a photorealistic re-render of the SAME room with its furniture and
 * decor replaced to match the board.
 *
 * The OpenAI key is server-only. If it's missing, we return 503 so the client
 * can show a clear "configure a key" message instead of a broken result.
 */

export const runtime = "nodejs";
// Image generation can take a while; give the route room to breathe.
export const maxDuration = 120;

const ALLOWED_SIZES = new Set([
  "1024x1024",
  "1536x1024",
  "1024x1536",
  "auto",
]);

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB per image
const OK_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const PROMPT = `You are an expert interior designer and photo editor.

You are given two images:
1. The FIRST image is a real photo of a room.
2. The SECOND image is an interior-design inspiration board / product collage.

Re-render the FIRST image as a photorealistic photograph of the SAME room, but
restyled to match the SECOND image. Strict rules:
- Keep the room's architecture EXACTLY: walls, windows, doors, ceiling height,
  flooring layout, and the original camera angle, perspective, and proportions.
- REPLACE the furniture, rug, textiles, lighting, wall art, plants, and decor
  with pieces that match the colors, materials, patterns, and specific items
  shown in the inspiration board.
- Keep realistic lighting, shadows, scale, and depth so it looks like a genuine
  photograph of the redecorated room, not a collage.
- Do not add text, logos, watermarks, or borders.`;

export async function POST(request: Request) {
  const apiKey = await serverEnv("OPENAI_API_KEY", request);
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Room restyle needs an OpenAI API key. Set OPENAI_API_KEY to enable it.",
      },
      { status: 503 },
    );
  }

  let room: File | null = null;
  let board: File | null = null;
  let size = "auto";
  try {
    const form = await request.formData();
    room = form.get("room") as File | null;
    board = form.get("board") as File | null;
    const requested = String(form.get("size") ?? "auto");
    if (ALLOWED_SIZES.has(requested)) size = requested;
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const invalid = validate(room, "room") ?? validate(board, "board");
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  try {
    const out = new FormData();
    out.append("model", "gpt-image-1");
    out.append("prompt", PROMPT);
    // Order matters: the room is the base, the board is the style reference.
    out.append("image[]", room!, room!.name || "room.png");
    out.append("image[]", board!, board!.name || "board.png");
    if (size !== "auto") out.append("size", size);
    out.append("quality", "high");
    out.append("n", "1");

    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: out,
      signal: AbortSignal.timeout(115000),
    });

    if (!res.ok) {
      const detail = await safeError(res);
      return NextResponse.json(
        { error: detail || "Image service error. Please try again." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "No image was returned. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json(
      {
        error: aborted
          ? "The restyle timed out. Try a smaller image or again in a moment."
          : "Could not restyle the room. Please try again.",
      },
      { status: aborted ? 504 : 500 },
    );
  }
}

function validate(file: File | null, label: string): string | null {
  if (!file || typeof file === "string") return `Missing ${label} image.`;
  if (!OK_TYPES.has(file.type)) {
    return `The ${label} image must be a PNG, JPG, or WebP.`;
  }
  if (file.size > MAX_BYTES) {
    return `The ${label} image is too large (max 12 MB).`;
  }
  return null;
}

async function safeError(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { error?: { message?: string } };
    return data?.error?.message ?? null;
  } catch {
    return null;
  }
}
