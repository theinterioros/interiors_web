import Link from "next/link";
import AuthLoginForm from "@/components/forms/AuthLoginForm";
import { getAdminSettings } from "@/lib/settings";

export default async function LoginPage() {
  const settings = await getAdminSettings();

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400">Interior OS</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Welcome back</h1>
          <p className="text-sm text-neutral-500">
            Sign in to track milestones, approvals, and your digital twin.
          </p>
        </div>
        <AuthLoginForm otpEnabled={settings.otpEnabled} />
        <p className="text-sm text-neutral-500">
          New here?{" "}
          <Link href="/register" className="text-neutral-900 underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
