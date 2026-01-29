import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma";
import { getSessionUser } from "@/lib/session";

export async function requireApiUser() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, response: null };
}

export async function requireApiRole(allowedRoles: Role[]) {
  const { user, response } = await requireApiUser();
  if (!user) return { user: null, response };

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, response: null };
}
