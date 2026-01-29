import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { hashPassword } from "@/lib/password";

export async function ensureAdminSeed() {
  if (!env.adminSeedEmail || !env.adminSeedPassword) {
    return;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) return;

  const passwordHash = await hashPassword(env.adminSeedPassword);

  await prisma.user.create({
    data: {
      email: env.adminSeedEmail,
      passwordHash,
      role: "ADMIN",
      name: env.adminSeedName,
    },
  });
}
