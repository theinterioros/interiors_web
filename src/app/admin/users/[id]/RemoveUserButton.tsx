"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteUserAction } from "@/app/actions/admin";

type Props = { userId: string; role: string; label: string };

export default function RemoveUserButton({ userId, role, label }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    const message =
      role === "ADMIN"
        ? "Remove this admin? They will lose access. You cannot remove yourself."
        : `Remove this ${role === "FIRM" ? "designer" : "customer"} and all their data (projects, payments, etc.)? This cannot be undone.`;
    if (!confirm(message)) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("userId", userId);
      await deleteUserAction(formData);
      router.push("/admin/users");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to remove user.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "Removing…" : label}
    </button>
  );
}
