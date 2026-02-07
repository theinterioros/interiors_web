"use client";

import Link from "next/link";
import { ChevronDown, Shield, User, Palette } from "lucide-react";

const ICONS = { customer: User, firm: Palette, admin: Shield };

type Role = "customer" | "firm" | "admin";

type Persona = {
  role: Role;
  label: string;
  href: string;
  accent: string;
  iconBg: string;
};

export default function LoginRoleSelector({
  currentRole,
  personas,
}: {
  currentRole: string;
  personas: readonly Persona[];
}) {
  const current = personas.find((p) => p.role === currentRole) ?? personas[0];
  const Icon = ICONS[current.role as Role] ?? User;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-2 shadow-sm">
      <p className="text-xs font-medium text-[var(--text-muted)] px-2 py-1 mb-2">Sign in as</p>
      <div className="flex flex-wrap gap-2">
        {personas.map((p) => {
          const PIcon = ICONS[p.role as Role] ?? User;
          const isActive = p.role === currentRole;
          return (
            <Link
              key={p.role}
              href={p.href}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                isActive ? `${p.accent} border-current` : "border-transparent hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <PIcon className="h-4 w-4 shrink-0" />
              {p.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
