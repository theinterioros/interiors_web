import Link from "next/link";
import LandingSection from "@/components/landing/LandingSection";
import { getAdminSettings } from "@/lib/settings";

export default async function Home() {
  const settings = await getAdminSettings();
  type LinkItem = {
    label: string;
    url: string;
    showInHeader: boolean;
    showInFooter: boolean;
    showInLanding: boolean;
  };

  const marketingLinks: LinkItem[] =
    settings.marketingLinks.length > 0
      ? settings.marketingLinks.map((link) => ({
          label: link.label,
          url: link.url,
          showInHeader: link.showInHeader,
          showInFooter: link.showInFooter,
          showInLanding: link.showInLanding,
        }))
      : [
          { label: "Cost Estimator", url: "/estimator", showInHeader: true, showInFooter: true, showInLanding: true },
          { label: "Designers", url: "/designers", showInHeader: true, showInFooter: true, showInLanding: true },
          { label: "Digital Twin", url: "/digital-twin", showInHeader: false, showInFooter: true, showInLanding: true },
          { label: "Login", url: "/login", showInHeader: true, showInFooter: true, showInLanding: false },
        ];
  const headerLinks = marketingLinks.filter((link) => link.showInHeader);
  const footerLinks = marketingLinks.filter((link) => link.showInFooter);
  const landingLinks = marketingLinks.filter((link) => link.showInLanding);
  const socialLinks = settings.socialLinks.filter((link) => link.showInFooter || link.showInHeader);

  return (
    <div className="bg-white text-neutral-900">
      <header className="border-b border-neutral-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-800">
            Interior OS
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
            {headerLinks.map((link) => (
              <Link key={link.label} href={link.url} className="hover:text-neutral-900">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <LandingSection className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">India • Verified Interior Designers</p>
              <h1 className="text-4xl font-semibold leading-tight text-neutral-900 md:text-5xl">
                Design your home. Track every detail. Stay in control.
              </h1>
              <p className="text-base text-neutral-600">
                Interior OS is an all-in-one platform to estimate costs, discover verified interior
                designers, track your project milestones, and securely store your home’s digital twin
                — for life.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/estimator"
                  className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Estimate My Interior Cost
                </Link>
                <Link
                  href="/designers"
                  className="rounded-md border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-800 hover:border-neutral-400"
                >
                  Explore Verified Designers
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Interior OS Preview</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-neutral-800">Project Dashboard</p>
                  <p className="text-xs text-neutral-500">Milestone tracking, approvals, escrow status.</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-neutral-800">Digital Twin Vault</p>
                  <p className="text-xs text-neutral-500">Wiring, plumbing, floor plans secured.</p>
                </div>
                <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-xs text-neutral-500">
                  Subtle motion cards • light theme • calm UX
                </div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-neutral-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Estimator Preview</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-lg bg-white p-3">City • Pincode • Sq Ft • Property type</div>
                <div className="rounded-lg bg-white p-3">Estimated range with breakdown</div>
                <div className="rounded-lg border border-dashed border-neutral-200 p-3">
                  AI-ready logic placeholder
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-neutral-900">
                Know your interior cost before you commit.
              </h2>
              <p className="text-base text-neutral-600">
                Get a transparent cost estimate based on your home size, city, and local pricing. No
                calls. No pressure. Just clarity.
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>City & pincode based pricing</li>
                <li>Transparent ₹/sqft logic</li>
                <li>AI-ready (smarter estimates coming soon)</li>
              </ul>
              <Link
                href="/estimator"
                className="inline-flex rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Try the Cost Estimator
              </Link>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-neutral-900">
                Work only with verified interior designers.
              </h2>
              <p className="text-base text-neutral-600">
                Every designer on Interior OS is vetted and approved by our team — so you can focus on
                design, not due diligence.
              </p>
              <Link
                href="/designers"
                className="inline-flex rounded-md border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-800 hover:border-neutral-400"
              >
                Browse Designers Near Me
              </Link>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Designer Preview</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-lg bg-white p-3">Verified badge • 8+ years experience</div>
                <div className="rounded-lg bg-white p-3">Bengaluru • Residential specialist</div>
                <div className="rounded-lg bg-white p-3">Portfolio images ready</div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-neutral-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Milestone Tracking</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-lg bg-white p-3">Pending → Submitted → Approved</div>
                <div className="rounded-lg bg-white p-3">Photo updates from designers</div>
                <div className="rounded-lg bg-white p-3">Escrow-style payment controls</div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-neutral-900">
                Track every milestone. Approve with confidence.
              </h2>
              <p className="text-base text-neutral-600">
                From advance payments to final handover, Interior OS keeps your interior project
                structured, visual, and transparent.
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Milestone-based tracking</li>
                <li>Photo updates from designers</li>
                <li>Customer approval at every stage</li>
                <li>Escrow-style payments (secure & controlled)</li>
              </ul>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-neutral-900">
                Your home’s digital twin — stored forever.
              </h2>
              <p className="text-base text-neutral-600">
                All your home documents, safely stored in one place — wiring, plumbing, floor plans,
                and final handover files. Accessible anytime, anywhere.
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Free for the first year</li>
                <li>Secure cloud storage</li>
                <li>Useful for maintenance, resale, and renovations</li>
              </ul>
              <Link
                href="/digital-twin"
                className="inline-flex rounded-md border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-800 hover:border-neutral-400"
              >
                Learn About Digital Twin
              </Link>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Document Vault</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-lg bg-white p-3">Wiring diagrams</div>
                <div className="rounded-lg bg-white p-3">Plumbing layouts</div>
                <div className="rounded-lg bg-white p-3">Floor plans & handover files</div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Coming Soon</p>
            <h2 className="mt-4 text-3xl font-semibold text-neutral-900">
              Visualize your space before it’s built.
            </h2>
            <p className="mt-3 text-base text-neutral-600">
              Upload your floor plan and explore AI-generated interior designs tailored to your space.
              Experiment, iterate, and decide with confidence.
            </p>
            <button
              disabled
              className="mt-6 rounded-md border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-400"
            >
              Coming Soon
            </button>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl bg-neutral-900 px-8 py-12 text-white">
            <h2 className="text-3xl font-semibold">Built for clarity. Designed for trust.</h2>
            <div className="mt-6 grid gap-4 text-sm text-neutral-200 md:grid-cols-2">
              <p>Transparent pricing and admin-configured rates.</p>
              <p>Only approved designers, vetted by Interior OS.</p>
              <p>Milestone-based payments with controlled releases.</p>
              <p>Complete project documentation and digital twin storage.</p>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold text-neutral-900">
            Start your interior journey with clarity.
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/estimator"
              className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Estimate My Cost
            </Link>
            <Link
              href="/designers"
              className="rounded-md border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-800 hover:border-neutral-400"
            >
              Find Designers
            </Link>
          </div>
          {landingLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-neutral-500">
              {landingLinks.map((link) => (
                <Link key={link.label} href={link.url} className="underline">
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </LandingSection>
      </main>

      <footer className="border-t border-neutral-100">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Interior OS</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Premium interior design tracking for modern Indian homes.
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] text-neutral-400">Links</h4>
              <div className="mt-3 flex flex-col gap-2 text-sm text-neutral-600">
                {footerLinks.map((link) => (
                  <Link key={link.label} href={link.url}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] text-neutral-400">Social</h4>
              <div className="mt-3 flex flex-col gap-2 text-sm text-neutral-600">
                {socialLinks.length === 0 ? (
                  <p className="text-xs text-neutral-400">Configure social links in admin.</p>
                ) : (
                  socialLinks.map((link) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer">
                      {link.platform}
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-neutral-400">© Interior OS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
