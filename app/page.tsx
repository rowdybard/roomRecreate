import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { STYLE_DATA } from "@/lib/styles-data";
import { HeroRoom3D } from "@/components/HeroRoom3D";

export default function LandingPage() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-mauve/30 blur-3xl" />
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-oak/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 text-center md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-cocoa ring-1 ring-clay/40">
            ✦ For dreamers with full inspiration boards
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            Turn a dream room into a <em className="text-oak">real-life plan.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cocoa/80">
            Paste a room vibe, choose your style, and get a visual layout,
            palette, shopping checklist, and recreate kit.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/recreate" className="btn-primary btn-lg">
              Recreate a Room →
            </Link>
            <Link href="/recreate?demo=cozy" className="btn-soft btn-lg">
              Try Cozy Neutral Bedroom
            </Link>
          </div>

          {/* 3D room preview */}
          <div className="mx-auto mt-14 max-w-4xl">
            <HeroRoom3D />
          </div>
        </div>
      </section>

      {/* 1. From inspiration to plan */}
      <Section
        id="how"
        title="From inspiration to plan"
        lead="You already know the vibe you want. We turn it into the steps to get there."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Step n="01" title="Describe the vibe" body="Paste a room idea or pin title and pick your style, size, and budget." />
          <Step n="02" title="See it come together" body="Watch your room build itself into a visual layout and 3D preview." />
          <Step n="03" title="Make it real" body="Get a shopping checklist, palette, and budget swaps you can actually use." />
        </div>
      </Section>

      {/* 2. Visual room preview */}
      <Section
        id="preview"
        title="A visual room preview, instantly"
        lead="Not a spreadsheet — a mini designer board you can actually picture."
      >
        <div className="grid items-center gap-8 md:grid-cols-2">
          <HeroRoom3D />
          <ul className="space-y-3">
            {[
              "Top-down room plan with labeled furniture",
              "A slow-orbit 3D preview of the space",
              "Empty room vs. styled room toggle",
              "Palette pulled straight from your vibe",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-ink">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-oak/15 text-oak">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 3. Shopping checklist + budget swaps */}
      <Section
        title="Shopping checklist & budget swaps"
        lead="Know exactly what to buy first — and how to spend less getting there."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MiniCard title="Buy first" items={["Bedding set", "Area rug", "Floor lamp"]} />
          <MiniCard title="Save for later" items={["Arched mirror", "Shelves", "Accent chair"]} />
          <MiniCard
            title="Budget swaps"
            items={["Peel-and-stick art", "Thrifted wood", "Linen-look fabric"]}
          />
        </div>
      </Section>

      {/* 4. Unlock full recreate kit */}
      <Section
        title="Unlock the full recreate kit"
        lead="Printable, personalized, and ready to shop — whenever you want the full plan."
      >
        <div className="rounded-xl3 bg-ink p-8 text-cream md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "Printable PDF",
                "Full shopping list",
                "Budget swaps",
                "Step-by-step room setup",
                "Personalized for your room size",
                "Shareable kit link",
              ].map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm">
                  <span className="text-oak">✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href="/recreate"
              className="btn bg-cream px-7 py-3.5 text-base text-ink hover:bg-white"
            >
              Get Full Kit — $9
            </Link>
          </div>
        </div>
      </Section>

      {/* 5. Built for Pinterest-style inspiration */}
      <Section
        title="Built for the way you already find ideas"
        lead="Eight curated styles, each with its own palette and feel."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(STYLE_DATA).map(([name, data]) => (
            <div key={name} className="card text-center">
              <div className="flex justify-center gap-1.5">
                {data.palette.slice(0, 4).map((c) => (
                  <span
                    key={c.hex}
                    className="h-8 w-8 rounded-full ring-1 ring-black/5"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">{name}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/recreate" className="btn-primary btn-lg">
            Recreate a Room →
          </Link>
        </div>
      </Section>

      <Footer />
    </>
  );
}

function Section({
  id,
  title,
  lead,
  children,
}: {
  id?: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-14">
      <div className="mb-8 text-center">
        <h2 className="section-title">{title}</h2>
        <p className="section-lead mx-auto max-w-2xl">{lead}</p>
      </div>
      {children}
    </section>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card">
      <span className="font-serif text-2xl font-semibold text-oak">{n}</span>
      <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-cocoa/80">{body}</p>
    </div>
  );
}

function MiniCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa/70">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li
            key={i}
            className="rounded-xl bg-white/70 px-3 py-2 text-sm text-ink ring-1 ring-clay/20"
          >
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

