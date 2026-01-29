import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DesignersPage() {
  const designers = await prisma.designerProfile.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Verified Designers</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Browse approved experts</h1>
          <p className="text-sm text-neutral-500">
            Only vetted designers are visible publicly. Each profile is reviewed by Interior OS.
          </p>
        </div>

        {designers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-sm text-neutral-500">
            No approved designers yet. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {designers.map((designer) => (
              <Link
                key={designer.id}
                href={`/designers/${designer.id}`}
                className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400"
              >
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-neutral-900">{designer.name}</p>
                  <p className="text-sm text-neutral-500">
                    {designer.city} • {designer.experienceYears}+ years
                  </p>
                  <p className="text-xs text-neutral-400">Verified by Interior OS</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
