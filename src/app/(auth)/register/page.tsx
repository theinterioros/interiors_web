import Link from "next/link";
import AuthRegisterForm from "@/components/forms/AuthRegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400">Interior OS</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Create your account</h1>
          <p className="text-sm text-neutral-500">
            Join as a customer or apply as a verified designer.
          </p>
        </div>
        <AuthRegisterForm />
        <p className="text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-neutral-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
