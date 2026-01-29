import Link from "next/link";
import { UserPlus } from "lucide-react";
import AuthRegisterForm from "@/components/forms/AuthRegisterForm";

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  const roleParam =
    searchParams?.role === "firm"
      ? "FIRM"
      : searchParams?.role === "admin"
        ? "ADMIN"
        : "CUSTOMER";

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] px-6 py-16">
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
            <UserPlus className="h-4 w-4 text-amber-600" />
            Interior OS
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            {roleParam === "FIRM"
              ? "Firm sign up"
              : roleParam === "ADMIN"
                ? "Admin sign up"
                : "Customer sign up"}
          </h1>
          <p className="text-sm text-neutral-500">
            {roleParam === "FIRM"
              ? "Apply to become a verified interior firm on Interior OS."
              : roleParam === "ADMIN"
                ? "Admins are invite-only. Please sign in with your admin account."
                : "Join to track your interior project with clarity."}
          </p>
        </div>
        {roleParam === "ADMIN" ? (
          <Link href="/login?role=admin" className="text-sm text-neutral-900 underline">
            Go to admin sign in
          </Link>
        ) : (
          <AuthRegisterForm fixedRole={roleParam} />
        )}
        <p className="text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href={`/login?role=${roleParam.toLowerCase()}`} className="text-neutral-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
