import Link from "next/link";
import { KeyRound } from "lucide-react";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const resolved = await searchParams;
  const role =
    resolved?.role === "firm" || resolved?.role === "designer"
      ? "firm"
      : resolved?.role === "admin"
        ? "admin"
        : "customer";

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-[var(--brand-light)]/20 to-white">
      <main className="page flex-1 flex flex-col justify-center py-8">
        <div className="page-inner">
          <div className="mx-auto max-w-md">
            <div className="card rounded-2xl p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-light)] text-[var(--brand)]">
                <KeyRound className="h-7 w-7" />
              </div>
              <p className="eyebrow mb-2">Reset Password</p>
              <h1 className="heading-lg mb-4">Forgot Password?</h1>
              <ForgotPasswordForm role={role} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
