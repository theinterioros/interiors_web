import Link from "next/link";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="page bg-[radial-gradient(900px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)]">
      <div className="page-inner max-w-md text-center">
        <div className="mx-auto flex w-fit items-center gap-2 text-xs uppercase tracking-[0.4em] text-neutral-400">
          <Lock className="h-4 w-4 text-amber-600" />
          Restricted
        </div>
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
