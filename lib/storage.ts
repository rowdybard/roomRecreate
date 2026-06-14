import type { RoomKit } from "./types";

/**
 * Local persistence layer. Defaults to localStorage so the app works with zero
 * configuration. Supabase hooks are sketched in comments for a future paid
 * product — they are intentionally NOT required to run.
 */

const KITS_KEY = "roomRecreatorKits";
const EMAILS_KEY = "roomRecreatorEmails";

type EmailLead = {
  email: string;
  kitId: string;
  createdAt: string;
};

function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function readKits(): Record<string, RoomKit> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KITS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeKits(kits: Record<string, RoomKit>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KITS_KEY, JSON.stringify(kits));
}

/** Save (or overwrite) a kit, keyed by id. */
export function saveKit(kit: RoomKit): void {
  // FUTURE (Supabase): if hasSupabase(), upsert into a `kits` table here, e.g.
  //   await supabase.from("kits").upsert(kit);
  // We still mirror to localStorage so the demo works offline.
  const kits = readKits();
  kits[kit.id] = kit;
  writeKits(kits);
}

/** Load a single kit by id. */
export function loadKit(id: string): RoomKit | null {
  // FUTURE (Supabase / database lookup): if hasSupabase(), fetch by id here.
  const kits = readKits();
  return kits[id] ?? null;
}

/** All saved kits, newest first. */
export function listKits(): RoomKit[] {
  return Object.values(readKits()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/** Remove all locally saved kits (used by /admin). */
export function clearKits(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KITS_KEY);
}

/** Persist an email lead and mark the kit unlocked. */
export function saveEmailLead(email: string, kitId: string): void {
  // FUTURE (Supabase): if hasSupabase(), insert into `email_leads` table here.
  void hasSupabase();
  if (typeof window === "undefined") return;
  let leads: EmailLead[] = [];
  try {
    leads = JSON.parse(localStorage.getItem(EMAILS_KEY) || "[]");
  } catch {
    leads = [];
  }
  leads.push({ email, kitId, createdAt: new Date().toISOString() });
  localStorage.setItem(EMAILS_KEY, JSON.stringify(leads));

  const kits = readKits();
  if (kits[kitId]) {
    kits[kitId] = { ...kits[kitId], emailUnlocked: true };
    writeKits(kits);
  }
}

export function listEmailLeads(): EmailLead[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(EMAILS_KEY) || "[]");
  } catch {
    return [];
  }
}
