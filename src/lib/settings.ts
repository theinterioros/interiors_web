import { prisma } from "@/lib/prisma";

export async function getAdminSettings() {
  const existing = await prisma.adminSettings.findFirst({
    include: { socialLinks: true, marketingLinks: true, rates: true },
  });
  if (existing) return existing;

  return prisma.adminSettings.create({
    data: {},
    include: { socialLinks: true, marketingLinks: true, rates: true },
  });
}
