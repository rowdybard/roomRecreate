import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-cream/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream">
            ◗
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">
            Room Recreator
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-cocoa md:flex">
          <Link href="/#how" className="transition hover:text-ink">
            How it works
          </Link>
          <Link href="/#preview" className="transition hover:text-ink">
            Room preview
          </Link>
          <Link href="/recreate" className="transition hover:text-ink">
            Recreate
          </Link>
        </nav>
        <Link href="/recreate" className="btn-primary">
          Recreate a Room
        </Link>
      </div>
    </header>
  );
}
