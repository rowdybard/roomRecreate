"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PaletteSwatches } from "@/components/PaletteSwatches";
import { ShoppingChecklist } from "@/components/ShoppingChecklist";
import { BudgetPlan } from "@/components/BudgetPlan";
import { DesignRules } from "@/components/DesignRules";
import { SearchTerms } from "@/components/SearchTerms";
import { DreamToRealSection } from "@/components/DreamToRealSection";
import { ShareCard } from "@/components/ShareCard";
import { LockedFullKit } from "@/components/LockedFullKit";
import { RoomVisualizer2D } from "@/components/RoomVisualizer2D";
import { loadKit } from "@/lib/storage";
import type { RoomKit, StyleName } from "@/lib/types";

const RoomPreview3D = dynamic(
  () => import("@/components/RoomPreview3D").then((m) => m.RoomPreview3D),
  { ssr: false },
);

export default function KitPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [kit, setKit] = useState<RoomKit | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "missing">(
    "loading",
  );

  useEffect(() => {
    // FUTURE: fetch from a database (Supabase) by id before falling back to
    // localStorage, so shared links work across devices.
    const found = loadKit(id);
    if (found) {
      setKit(found);
      setStatus("found");
    } else {
      setStatus("missing");
    }
  }, [id]);

  if (status === "loading") {
    return (
      <>
        <Nav />
        <main className="grid min-h-[50vh] place-items-center text-cocoa">
          Loading kit…
        </main>
        <Footer />
      </>
    );
  }

  if (status === "missing" || !kit) {
    return (
      <>
        <Nav />
        <main className="mx-auto grid min-h-[55vh] max-w-xl place-items-center px-5 text-center">
          <div className="card">
            <span className="text-4xl">🪞</span>
            <h1 className="mt-3 font-serif text-2xl font-semibold text-ink">
              We couldn&apos;t find that kit
            </h1>
            <p className="mt-2 text-cocoa/70">
              This kit isn&apos;t saved on this device. Kits are stored locally
              in V1 — create a fresh one and it&apos;ll show up here.
            </p>
            <Link href="/recreate" className="btn-primary mt-5 inline-flex">
              Recreate a Room →
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-10">
        <div className="mb-6">
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-cocoa">
            {kit.style} · {kit.roomType} · {kit.roomSize}
          </span>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink">
            {kit.title}
          </h1>
          <p className="mt-2 max-w-2xl text-cocoa/80">{kit.vibeSummary}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card">
            <RoomVisualizer2D layout={kit.layout} palette={kit.palette} revealKey={kit.id} />
          </section>
          <section className="card">
            <h3 className="mb-4 font-serif text-lg font-semibold">3D Preview</h3>
            <RoomPreview3D
              layout={kit.layout}
              palette={kit.palette}
              style={kit.style as StyleName}
              revealKey={kit.id}
            />
          </section>

          <section className="card">
            <h4 className="mb-3 font-serif text-lg font-semibold">Color palette</h4>
            <PaletteSwatches palette={kit.palette} />
          </section>
          <section className="card">
            <h4 className="mb-3 font-serif text-lg font-semibold">Shopping checklist</h4>
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
            <h4 className="mb-3 font-serif text-lg font-semibold">Search terms</h4>
            <SearchTerms terms={kit.searchTerms} />
            <h4 className="mb-2 mt-5 font-serif text-lg font-semibold">Room setup steps</h4>
            <DesignRules rules={kit.roomSetupSteps} />
          </section>
        </div>

        <div className="mt-8 space-y-6">
          <DreamToRealSection kit={kit} />
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">
              Share this kit
            </h2>
            <ShareCard kit={kit} />
          </section>
          <LockedFullKit />
        </div>
      </main>
      <Footer />
    </>
  );
}
