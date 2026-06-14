"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DEMOS, InputPanel, type FormState } from "@/components/InputPanel";
import { GenerationReveal } from "@/components/GenerationReveal";
import { RoomVisualizer2D } from "@/components/RoomVisualizer2D";
import { PaletteSwatches } from "@/components/PaletteSwatches";
import { ShoppingChecklist } from "@/components/ShoppingChecklist";
import { BudgetPlan } from "@/components/BudgetPlan";
import { DesignRules } from "@/components/DesignRules";
import { SearchTerms } from "@/components/SearchTerms";
import { DreamToRealSection } from "@/components/DreamToRealSection";
import { ShareCard } from "@/components/ShareCard";
import { EmailCapture } from "@/components/EmailCapture";
import { LockedFullKit } from "@/components/LockedFullKit";
import { useToast } from "@/components/Toast";
import { generateFallbackKit } from "@/lib/generateKit";
import { applyMoodSwap } from "@/lib/moodSwap";
import { saveKit } from "@/lib/storage";
import { copyToClipboard } from "@/lib/utils";
import type { MoodSwapType, RoomKit } from "@/lib/types";

// 3D preview is client-only (WebGL) — load it without SSR.
const RoomPreview3D = dynamic(
  () => import("@/components/RoomPreview3D").then((m) => m.RoomPreview3D),
  {
    ssr: false,
    loading: () => (
      <div className="grid aspect-[16/10] w-full place-items-center rounded-xl3 bg-white/60 text-sm text-cocoa/60">
        Loading 3D preview…
      </div>
    ),
  },
);

const DEFAULT_FORM: FormState = {
  vibe: "",
  roomType: "Bedroom",
  roomSize: "Medium",
  style: "Cozy Neutral",
  budget: "$250–$750",
  mustHaves: ["Bed", "Rug", "Plants"],
};

function RecreateInner() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [kit, setKit] = useState<RoomKit | null>(null);
  const [phase, setPhase] = useState<"idle" | "revealing" | "done">("idle");
  const [pendingKit, setPendingKit] = useState<RoomKit | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  // Call the API (OpenAI when configured, deterministic otherwise).
  const requestKit = useCallback(async (inputs: FormState): Promise<RoomKit> => {
    try {
      const res = await fetch("/api/generate-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as { kit?: RoomKit };
      if (data?.kit) return data.kit as RoomKit;
      throw new Error("no kit");
    } catch {
      // Network/route failure => generate locally so the demo never breaks.
      return generateFallbackKit(inputs);
    }
  }, []);

  const runGeneration = useCallback(
    async (inputs: FormState) => {
      setPhase("revealing");
      setKit(null);
      const generated = await requestKit(inputs);
      setPendingKit(generated);
    },
    [requestKit],
  );

  // When the reveal animation finishes, commit the kit + persist it.
  const handleRevealDone = useCallback(() => {
    if (pendingKit) {
      setKit(pendingKit);
      setUnlocked(Boolean(pendingKit.emailUnlocked));
      saveKit(pendingKit); // local persistence so /kit/[id] works immediately
      setPendingKit(null);
    }
    setPhase("done");
  }, [pendingKit]);

  function handleGenerate() {
    runGeneration(form);
  }

  function handleReset() {
    setForm(DEFAULT_FORM);
    setKit(null);
    setPhase("idle");
    showToast("Reset.");
  }

  function handleDemo(key: keyof typeof DEMOS) {
    const demo = DEMOS[key];
    setForm(demo);
    runGeneration(demo);
  }

  // Prefill + auto-generate from ?demo= or ?style= query (landing page CTAs).
  useEffect(() => {
    const demo = searchParams.get("demo");
    if (demo && demo in DEMOS) {
      const preset = DEMOS[demo as keyof typeof DEMOS];
      setForm(preset);
      runGeneration(preset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMoodSwap(type: MoodSwapType) {
    if (!kit) return;
    const next = applyMoodSwap(kit, type);
    setKit(next);
    saveKit(next);
    showToast(`Mood updated: ${type}.`);
  }

  async function copyShoppingList() {
    if (!kit) return;
    const ok = await copyToClipboard(kit.shoppingChecklist.join("\n"));
    showToast(ok ? "Shopping list copied." : "Couldn't copy.");
  }

  async function copySearchTerms() {
    if (!kit) return;
    const ok = await copyToClipboard(kit.searchTerms.join("\n"));
    showToast(ok ? "Search terms copied." : "Couldn't copy.");
  }

  function handlePrint() {
    // FUTURE: dedicated PDF export library (e.g. react-pdf) for branded output.
    window.print();
  }

  function handleUnlock() {
    if (!kit) return;
    const next = { ...kit, emailUnlocked: true };
    setKit(next);
    setUnlocked(true);
    saveKit(next);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            The Studio
          </h1>
          <p className="section-lead">Describe the vibe. We&apos;ll style the room.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* LEFT: inputs */}
          <div>
            <InputPanel
              form={form}
              setForm={setForm}
              onGenerate={handleGenerate}
              onReset={handleReset}
              onDemo={handleDemo}
              busy={phase === "revealing"}
            />
          </div>

          {/* RIGHT: visual output */}
          <div className="space-y-6">
            {phase === "revealing" && (
              <GenerationReveal onDone={handleRevealDone} />
            )}

            {phase === "idle" && !kit && (
              <div className="grid place-items-center rounded-xl3 bg-white/60 p-16 text-center ring-1 ring-white/60">
                <div>
                  <p className="font-serif text-2xl text-ink">
                    Your styled room will appear here ✦
                  </p>
                  <p className="mt-2 text-cocoa/70">
                    Pick a demo or describe your dream room, then hit{" "}
                    <span className="font-semibold">Recreate This Room</span>.
                  </p>
                </div>
              </div>
            )}

            {phase === "done" && kit && (
              <>
                {/* 2D + Mood swap */}
                <section className="card">
                  <RoomVisualizer2D
                    layout={kit.layout}
                    palette={kit.palette}
                    revealKey={kit.id + kit.palette[0]?.hex}
                  />
                  {/* WOW 2: Mood Swap */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-clay/20 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-cocoa/70">
                      Mood swap:
                    </span>
                    <button className="btn-mood" onClick={() => handleMoodSwap("cozier")}>
                      Make It Cozier
                    </button>
                    <button className="btn-mood" onClick={() => handleMoodSwap("darker")}>
                      Make It Darker
                    </button>
                    <button className="btn-mood" onClick={() => handleMoodSwap("cheaper")}>
                      Make It Cheaper
                    </button>
                    <button className="btn-mood" onClick={() => handleMoodSwap("luxury")}>
                      Make It More Luxury
                    </button>
                  </div>
                </section>

                {/* 3D preview */}
                <section className="card" id="preview">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold text-ink">
                      3D Preview
                    </h3>
                    <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-cocoa">
                      Slow orbit · placeholder pieces
                    </span>
                  </div>
                  <RoomPreview3D
                    layout={kit.layout}
                    palette={kit.palette}
                    style={form.style}
                    revealKey={kit.id + kit.palette[0]?.hex}
                  />
                  <p className="mt-3 text-center text-xs text-cocoa/60">
                    Drag to look around. Real 3D model packs drop in later — for
                    now we show clean placeholder pieces.
                  </p>
                </section>
              </>
            )}
          </div>
        </div>

        {/* FULL KIT SECTIONS */}
        {phase === "done" && kit && (
          <div className="mt-10 space-y-6">
            {/* Kit header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-ink">
                  {kit.title}
                </h2>
                <p className="mt-1 max-w-2xl text-cocoa/80">{kit.vibeSummary}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn-soft">
                  Print / Save PDF
                </button>
                <Link href={`/kit/${kit.id}`} className="btn-primary">
                  Open kit page →
                </Link>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="card">
                <h4 className="mb-3 font-serif text-lg font-semibold">Color palette</h4>
                <PaletteSwatches palette={kit.palette} />
              </section>

              <section className="card">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-serif text-lg font-semibold">Shopping checklist</h4>
                  <button onClick={copyShoppingList} className="btn-mini">
                    Copy Shopping List
                  </button>
                </div>
                <ShoppingChecklist items={kit.shoppingChecklist} />
              </section>

              <section className="card lg:col-span-2">
                <h4 className="mb-3 font-serif text-lg font-semibold">Budget plan</h4>
                <BudgetPlan plan={kit.budgetPlan} />
              </section>

              <section className="card">
                <h4 className="mb-3 font-serif text-lg font-semibold">Design rules</h4>
                <DesignRules rules={kit.designRules} />
              </section>

              <section className="card">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-serif text-lg font-semibold">Search terms</h4>
                  <button onClick={copySearchTerms} className="btn-mini">
                    Copy Search Terms
                  </button>
                </div>
                <SearchTerms terms={kit.searchTerms} />
                <h4 className="mb-2 mt-5 font-serif text-lg font-semibold">
                  Room setup steps
                </h4>
                <DesignRules rules={kit.roomSetupSteps} />
              </section>
            </div>

            {/* WOW 3 */}
            <DreamToRealSection kit={kit} />

            {/* Email gate */}
            <EmailCapture kitId={kit.id} unlocked={unlocked} onUnlock={handleUnlock} />

            {/* WOW 4 */}
            <section>
              <h2 className="mb-1 font-serif text-2xl font-semibold text-ink">
                Share your recreate kit
              </h2>
              <p className="mb-5 text-sm text-cocoa/70">
                A little card made for your group chat and your camera roll.
              </p>
              <ShareCard kit={kit} />
            </section>

            {/* WOW 5 */}
            <LockedFullKit />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function RecreatePage() {
  // useSearchParams requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<div className="p-10 text-center text-cocoa">Loading…</div>}>
      <RecreateInner />
    </Suspense>
  );
}
