import { sql } from "@/lib/db";

export type TrustedStudio = {
  id: string;
  name: string;
  mark: string;
  logoBg: string;
  sortOrder: number;
};

export async function getTrustedStudios(): Promise<TrustedStudio[]> {
  try {
    const rows = await sql<{ id: string; name: string; mark: string; logo_bg: string; sort_order: number }>`
      select id, name, mark, logo_bg, sort_order
      from trusted_studios
      order by sort_order asc, created_at asc
    `;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      mark: r.mark,
      logoBg: r.logo_bg,
      sortOrder: r.sort_order,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("trusted_studios")) return [];
    throw err;
  }
}
