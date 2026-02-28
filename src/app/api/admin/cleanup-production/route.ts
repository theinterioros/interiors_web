import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { runCleanupProduction } from "@/lib/cleanupProduction";

/**
 * POST /api/admin/cleanup-production
 *
 * Runs production DB cleanup (keep only Mira Kapoor, Aarav Sharma, and all admins).
 * Admin-only: requires an authenticated admin session (cookie).
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCleanupProduction();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Cleanup failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Cleanup failed" },
      { status: 500 }
    );
  }
}
