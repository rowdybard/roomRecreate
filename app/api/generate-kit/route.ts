import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/serverEnv";
import { assembleKit, generateFallbackKit, generateKitText } from "@/lib/generateKit";
import type { AiKitText, GenerateInputs, RoomKit } from "@/lib/types";
import {
  BUDGETS,
  ROOM_SIZES,
  ROOM_TYPES,
  STYLE_NAMES,
} from "@/lib/types";

/**
 * POST /api/generate-kit
 *
 * - If OPENAI_API_KEY is set, ask OpenAI for the kit TEXT only (JSON), then
 *   validate it and attach a locally-computed layout.
 * - If the key is missing OR OpenAI fails OR the JSON is malformed, fall back to
 *   fully deterministic local generation.
 * - The OpenAI key is server-only and never returned to the client.
 *
 * Layout is ALWAYS computed locally (generateLayout) — never by OpenAI.
 */

export const runtime = "nodejs";

function sanitizeInputs(body: unknown): GenerateInputs {
  const b = (body ?? {}) as Record<string, unknown>;
  const vibe = typeof b.vibe === "string" ? b.vibe.slice(0, 600) : "";
  const roomType = ROOM_TYPES.includes(b.roomType as never)
    ? (b.roomType as GenerateInputs["roomType"])
    : "Bedroom";
  const roomSize = ROOM_SIZES.includes(b.roomSize as never)
    ? (b.roomSize as GenerateInputs["roomSize"])
    : "Medium";
  const style = STYLE_NAMES.includes(b.style as never)
    ? (b.style as GenerateInputs["style"])
    : "Cozy Neutral";
  const budget = BUDGETS.includes(b.budget as never)
    ? (b.budget as GenerateInputs["budget"])
    : "$250–$750";
  const mustHaves = Array.isArray(b.mustHaves)
    ? (b.mustHaves.filter((m) => typeof m === "string") as string[]).slice(0, 12)
    : [];
  return {
    // Default to a cozy neutral bedroom vibe if empty (never crash).
    vibe:
      vibe.trim() ||
      "Cozy neutral bedroom with soft lighting, linen bedding, plants, and warm wood accents",
    roomType,
    roomSize,
    style,
    budget,
    mustHaves,
  };
}

/** Validate the AI JSON into a safe AiKitText, or return null if unusable. */
function validateAiText(raw: unknown): AiKitText | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const strArr = (v: unknown, max = 12): string[] =>
    Array.isArray(v)
      ? v.filter((x) => typeof x === "string").map((s) => (s as string).slice(0, 200)).slice(0, max)
      : [];

  const palette = Array.isArray(o.palette)
    ? (o.palette as unknown[])
        .map((p) => {
          const c = p as Record<string, unknown>;
          const name = typeof c.name === "string" ? c.name.slice(0, 40) : "";
          const hex = typeof c.hex === "string" ? c.hex.trim() : "";
          return /^#?[0-9a-fA-F]{6}$/.test(hex)
            ? { name: name || "Color", hex: hex.startsWith("#") ? hex : `#${hex}` }
            : null;
        })
        .filter(Boolean)
        .slice(0, 6)
    : [];

  const bp = (o.budgetPlan ?? {}) as Record<string, unknown>;

  const text: AiKitText = {
    title: typeof o.title === "string" ? o.title.slice(0, 100) : "",
    vibeSummary: typeof o.vibeSummary === "string" ? o.vibeSummary.slice(0, 400) : "",
    palette: palette as AiKitText["palette"],
    shoppingChecklist: strArr(o.shoppingChecklist),
    budgetPlan: {
      buyFirst: strArr(bp.buyFirst, 6),
      saveForLater: strArr(bp.saveForLater, 6),
      cheapSwaps: strArr(bp.cheapSwaps, 6),
    },
    designRules: strArr(o.designRules, 8),
    searchTerms: strArr(o.searchTerms, 8),
    roomSetupSteps: strArr(o.roomSetupSteps, 8),
    shareText: typeof o.shareText === "string" ? o.shareText.slice(0, 300) : "",
  };

  // Require the essentials, else treat as invalid.
  if (
    !text.title ||
    !text.vibeSummary ||
    text.palette.length < 3 ||
    text.shoppingChecklist.length < 3
  ) {
    return null;
  }
  return text;
}

function buildPrompt(inputs: GenerateInputs): string {
  return `You are generating a consumer-friendly room recreate kit.

The user wants to turn a Pinterest-style dream room into a real-life room plan.

Return only valid JSON matching this schema:
{
  "title": "",
  "vibeSummary": "",
  "palette": [{"name": "", "hex": ""}],
  "shoppingChecklist": [],
  "budgetPlan": {"buyFirst": [], "saveForLater": [], "cheapSwaps": []},
  "designRules": [],
  "searchTerms": [],
  "roomSetupSteps": [],
  "shareText": ""
}

Rules:
- Do not invent exact product links.
- Do not mention Pinterest unless the user did.
- Do not mention AI.
- Keep language simple, visual, and helpful.
- Make the plan feel realistic for the chosen budget.
- Use the selected room type, size, style, and must-have items.
- Use 4-5 palette colors with valid hex codes.
- Shopping checklist should use product categories, not brand names.
- Search terms should be useful for Amazon, Etsy, Google, Pinterest, or marketplace search.
- Keep the result aspirational but practical.

User inputs:
Vibe: ${inputs.vibe}
Room type: ${inputs.roomType}
Room size: ${inputs.roomSize}
Style: ${inputs.style}
Budget: ${inputs.budget}
Must-haves: ${inputs.mustHaves.join(", ") || "none specified"}`;
}

async function generateWithOpenAI(
  inputs: GenerateInputs,
  apiKey: string,
): Promise<AiKitText | null> {
  // FUTURE: swap to the structured-outputs / responses API for stricter JSON.
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You return only valid JSON. No prose, no markdown fences.",
        },
        { role: "user", content: buildPrompt(inputs) },
      ],
    }),
    // Guard against a hanging request.
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content: unknown = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;
  try {
    return validateAiText(JSON.parse(content));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let inputs: GenerateInputs;
  try {
    inputs = sanitizeInputs(await request.json());
  } catch {
    inputs = sanitizeInputs({});
  }

  const apiKey = await serverEnv("OPENAI_API_KEY", request);
  let kit: RoomKit;
  let source: "openai" | "local" = "local";

  if (apiKey) {
    try {
      const aiText = await generateWithOpenAI(inputs, apiKey);
      if (aiText) {
        // Merge: AI text fields override deterministic ones; missing ones backfill.
        const fallbackText = generateKitText(inputs);
        const merged: AiKitText = {
          ...fallbackText,
          ...aiText,
          palette: aiText.palette.length ? aiText.palette : fallbackText.palette,
          budgetPlan: {
            buyFirst: aiText.budgetPlan.buyFirst.length
              ? aiText.budgetPlan.buyFirst
              : fallbackText.budgetPlan.buyFirst,
            saveForLater: aiText.budgetPlan.saveForLater.length
              ? aiText.budgetPlan.saveForLater
              : fallbackText.budgetPlan.saveForLater,
            cheapSwaps: aiText.budgetPlan.cheapSwaps.length
              ? aiText.budgetPlan.cheapSwaps
              : fallbackText.budgetPlan.cheapSwaps,
          },
        };
        kit = assembleKit(inputs, merged);
        source = "openai";
      } else {
        kit = generateFallbackKit(inputs);
      }
    } catch {
      // Any OpenAI error => deterministic fallback. Never crash.
      kit = generateFallbackKit(inputs);
    }
  } else {
    kit = generateFallbackKit(inputs);
  }

  return NextResponse.json({ kit, source });
}
