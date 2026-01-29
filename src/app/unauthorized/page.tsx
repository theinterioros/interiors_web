import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-neutral-900">Access restricted</h1>
        <p className="text-sm text-neutral-500">
          You do not have permission to view this page.
        </p>
        <Link href="/" className="text-sm text-neutral-900 underline">
          Return to home
        </Link>
      </div>
    </div>
  );
}
