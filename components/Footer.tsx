import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/50 bg-white/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-cocoa md:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-cream">
            ◗
          </span>
          <span className="font-serif text-base font-semibold">Room Recreator</span>
        </div>
        <p className="text-center text-cocoa/80">
          Turn a dream room into a real-life plan.
        </p>
        <div className="flex items-center gap-5">
          <Link href="/recreate" className="transition hover:text-ink">
            Recreate
          </Link>
          <Link href="/admin" className="transition hover:text-ink">
            Admin
          </Link>
          <span className="text-cocoa/50">V1 · prototype</span>
        </div>
      </div>
    </footer>
  );
}
