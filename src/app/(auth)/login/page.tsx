import Link from "next/link";
import { LogIn } from "lucide-react";
import AuthLoginForm from "@/components/forms/AuthLoginForm";
import { getAdminSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  const settings = await getAdminSettings();
  const role =
    searchParams?.role === "firm"
      ? "firm"
      : searchParams?.role === "admin"
        ? "admin"
        : "customer";

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] px-6 py-16">
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
            <LogIn className="h-4 w-4 text-amber-600" />
            Interior OS
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            {role === "firm"
              ? "Firm sign in"
              : role === "admin"
                ? "Admin sign in"
                : "Customer sign in"}
          </h1>
          <p className="text-sm text-neutral-500">
            {role === "firm"
              ? "Manage incoming requests, milestones, and approvals."
              : role === "admin"
                ? "Review firms, projects, and payments."
                : "Track milestones, approvals, and your digital twin."}
          </p>
        </div>
        <AuthLoginForm otpEnabled={settings.otpEnabled} />
        <p className="text-sm text-neutral-500">
          New here?{" "}
          <Link
            href={`/register?role=${role}`}
            className="text-neutral-900 underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
