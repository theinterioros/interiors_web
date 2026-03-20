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
      <p className="text-xs font-medium text-[var(--text-muted)] px-2 py-1 mb-2 text-center">Sign in as</p>
      <div className="flex flex-nowrap justify-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {personas.map((p) => {
          const PIcon = ICONS[p.role as Role] ?? User;
          const isActive = p.role === currentRole;
          return (
            <Link
              key={p.role}
              href={p.href}
              scroll={false}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium border transition-colors ${
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
