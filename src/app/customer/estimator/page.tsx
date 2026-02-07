import Link from "next/link";
import { Calculator } from "lucide-react";
import CustomerEstimatorClient from "./CustomerEstimatorClient";
import PageBackLink from "@/components/ui/PageBackLink";

export const dynamic = "force-dynamic";

export default async function CustomerEstimatorPage() {
  return (
    <div className="space-y-8">
      <header>
        <PageBackLink href="/customer/dashboard" label="Dashboard" />
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">AI Cost Estimator</p>
        </div>
        <h1 className="heading-lg mb-1">Detailed cost estimate</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Enter your property details to get an AI-powered cost range and breakdown. Use this to plan your budget before connecting with a designer.
        </p>
      </header>
      <CustomerEstimatorClient />
    </div>
  );
}
