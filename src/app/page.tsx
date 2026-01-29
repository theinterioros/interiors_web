import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  FileText,
  Mail,
  MapPin,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import { getAdminSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

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
          { label: "AI Cost Estimator", url: "/estimator", showInHeader: false, showInFooter: true, showInLanding: true },
      { label: "Firms", url: "/designers", showInHeader: true, showInFooter: true, showInLanding: true },
          { label: "Digital Twin", url: "/digital-twin", showInHeader: false, showInFooter: true, showInLanding: true },
          { label: "Login", url: "/login", showInHeader: false, showInFooter: true, showInLanding: false },
        ];
  const footerLinks = marketingLinks.filter((link) => link.showInFooter);
  const landingLinks = marketingLinks.filter((link) => link.showInLanding);
  const socialLinks = settings.socialLinks.filter((link) => link.showInFooter || link.showInHeader);

  return (
    <div className="bg-[radial-gradient(1100px_circle_at_top_left,_#fff4e5,_#fefcf9_60%,_#ffffff_100%)] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-900 text-sm font-semibold text-white shadow-sm">
              IO
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-900">
              Interior OS
            </span>
          </Link>
          <nav className="hidden items-center gap-3 text-sm text-neutral-700 md:flex">
            <a
              href="#how-it-works"
              className="rounded-full px-4 py-2 transition hover:bg-neutral-900 hover:text-white"
            >
              How it works
            </a>
            <Link
              href="/login?role=customer"
              className="rounded-full border border-neutral-200 bg-white/80 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-300 hover:text-neutral-900"
            >
              Customer Sign In
            </Link>
            <Link
              href="/login?role=firm"
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500"
            >
              Firm Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <LandingSection className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.32em] text-neutral-500 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Interior OS • India
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-neutral-900 md:text-5xl">
                Bring{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  transparency
                </span>{" "}
                to interior execution.
              </h1>
              <p className="text-base text-neutral-600">
                India&apos;s interior infrastructure platform for{" "}
                <span className="font-semibold text-neutral-900">budgeting</span>,{" "}
                <span className="font-semibold text-neutral-900">verified firm selection</span>,{" "}
                <span className="font-semibold text-neutral-900">milestone tracking</span>, and{" "}
                <span className="font-semibold text-neutral-900">secure document storage</span>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/estimator"
                  className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500"
                >
                  Get AI Cost Estimator
                </Link>
                <Link
                  href="/designers"
                  className="rounded-full border border-white/70 bg-white/80 px-6 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-200 hover:bg-white"
                >
                  Browse Verified Firms
                </Link>
              </div>
              <div className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                  <BadgeCheck className="h-4 w-4 text-amber-500" />
                  Transparent{" "}
                  <span className="font-semibold text-neutral-900">pricing</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                  <ClipboardList className="h-4 w-4 text-amber-500" />
                  Milestone{" "}
                  <span className="font-semibold text-neutral-900">approvals</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Document{" "}
                  <span className="font-semibold text-neutral-900">vault</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Product Snapshot</p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-white/70 bg-gradient-to-br from-amber-50 to-amber-100/60 p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">AI Cost Estimator</p>
                    <p className="text-xs text-neutral-500">
                      Room-by-room price clarity in minutes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-white/70 bg-gradient-to-br from-amber-50 to-amber-100/60 p-4">
                  <Building2 className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Verified firms</p>
                    <p className="text-xs text-neutral-500">Profiles reviewed before listing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-white/70 bg-white/80 p-4 text-xs text-neutral-600">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-amber-500" />
                  Built for homeowners and growing studios.
                </div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20" id="how-it-works">
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">How it works</p>
              <h2 className="text-3xl font-semibold text-neutral-900">
                Six{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  clear steps
                </span>
              </h2>
              <p className="text-sm text-neutral-500">A predictable journey from estimate to handover.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Enter Property Details", icon: ClipboardList },
                { label: "AI Cost Estimation", icon: Sparkles },
                { label: "AR / 3D Visualization", icon: BadgeCheck },
                { label: "Choose Verified Firm", icon: Building2 },
                { label: "Track Project", icon: FileText },
                { label: "Pay via Escrow", icon: ArrowRight },
              ].map((step, index) => (
                <div key={step.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-neutral-900">{step.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20" id="features">
          <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">AI Cost Estimator</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  City • Pincode • Sq ft • Property type
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Range + clear cost breakup
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  AI-ready foundation (upgrade later)
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-neutral-900">
                See a{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  realistic budget
                </span>{" "}
                before you start.
              </h2>
              <p className="text-base text-neutral-600">
                Get an upfront cost range based on your home size and location — simple, clear, and
                designed to set the right expectations.
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>City & pincode specific pricing</li>
                <li>Transparent ₹/sqft logic</li>
                <li>Built for AI upgrades later</li>
              </ul>
              <Link
                href="/estimator"
                className="inline-flex rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500"
              >
                Open AI Cost Estimator
              </Link>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20" id="firms">
          <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">Verified firms</p>
              <h2 className="text-3xl font-semibold text-neutral-900">
                Hire with{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  confidence
                </span>
                , not guesswork.
              </h2>
              <p className="text-base text-neutral-600">
                Each firm is reviewed before they go live. You get credible profiles, real
                experience, and a clear view of their strengths.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/designers"
                  className="inline-flex rounded-full border border-white/70 bg-white/80 px-6 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-200 hover:bg-white"
                >
                  View Approved Firms
                </Link>
                <Link
                  href="/register?role=firm"
                  className="inline-flex rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500"
                >
                  Apply as a Firm
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Firm spotlight</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Verified • 8+ years experience
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Bengaluru • Residential interiors
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Portfolio snapshots available
                </div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Project tracking</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Pending → Submitted → Approved
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Photo updates at each stage
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Hold / release payment controls
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-neutral-900">
                Stay on{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  schedule
                </span>
                , stay in control.
              </h2>
              <p className="text-base text-neutral-600">
                Track progress by milestone, review updates, and approve each step before moving
                forward.
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Milestone-based tracking</li>
                <li>Customer approval gates</li>
                <li>Payment release simulation</li>
              </ul>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">Digital twin</p>
              <h2 className="text-3xl font-semibold text-neutral-900">
                Keep every{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  home document
                </span>{" "}
                in one place.
              </h2>
              <p className="text-base text-neutral-600">
                Store wiring, plumbing, floor plans, and handover files securely for maintenance,
                resale, or future upgrades.
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Free for the first year</li>
                <li>Secure cloud access</li>
                <li>Ready for renovations and resale</li>
              </ul>
              <Link
                href="/digital-twin"
                className="inline-flex rounded-full border border-white/70 bg-white/80 px-6 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-200 hover:bg-white"
              >
                Explore Digital Twin
              </Link>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Document vault</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Wiring diagrams
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Plumbing layouts
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  Floor plans & handover files
                </div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Coming Soon</p>
            <h2 className="mt-4 text-3xl font-semibold text-neutral-900">
              Visualize your space before it’s built.
            </h2>
            <p className="mt-3 text-base text-neutral-600">
              Explore AI-assisted layouts and styles from your floor plan. A preview tool designed to
              help you decide faster.
            </p>
            <button
              disabled
              className="mt-6 rounded-full border border-neutral-300 bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-400"
            >
              Coming Soon
            </button>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Who is it for?</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-900">Customers</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Plan budgets, choose vetted firms, track milestones, and protect payments.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Who is it for?</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-900">Interior Firms</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Manage leads, approvals, milestone payments, and client communication in one place.
              </p>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">
                Connected interior firms
              </p>
              <h2 className="text-3xl font-semibold text-neutral-900">
                Trusted by{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  growing studios
                </span>
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[
                { name: "Studio Maple", mark: "SM" },
                { name: "UrbanWeave", mark: "UW" },
                { name: "Aura Interiors", mark: "AI" },
                { name: "Frame & Form", mark: "FF" },
                { name: "Nexa Design", mark: "ND" },
              ].map((firm) => (
                <div
                  key={firm.name}
                  className="min-w-[220px] rounded-2xl border border-white/70 bg-white/80 p-4 text-sm font-semibold text-neutral-800 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                      {firm.mark}
                    </div>
                    <span>{firm.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20" id="contact">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-3xl font-semibold text-neutral-900">
                Talk to{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  our team
                </span>
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Get a walkthrough or share your project requirements.
              </p>
              <div className="mt-4 grid gap-3">
                <input
                  placeholder="Name"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Email"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Phone"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Tell us about your project"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  rows={4}
                />
                <button className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500">
                  Request a call
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900">Contact</h3>
              <div className="mt-3 space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  hello@interioros.com
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-amber-600" />
                  +91 90000 00000
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  Bengaluru, India
                </div>
              </div>
              <p className="mt-4 text-sm text-neutral-500">
                We respond within 24 hours on business days.
              </p>
            </div>
          </div>
        </LandingSection>
        <LandingSection className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-900 px-8 py-12 text-white shadow-sm">
            <h2 className="text-3xl font-semibold">
              Clarity first.{" "}
              <span className="text-indigo-200">Trust built in.</span>
            </h2>
            <div className="mt-6 grid gap-4 text-sm text-neutral-200 md:grid-cols-2">
              <p>Transparent rates set by admin.</p>
              <p>Firms reviewed before listing.</p>
              <p>Milestone approvals before release.</p>
              <p>Full project records in your vault.</p>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold text-neutral-900">
            Start your interior journey with confidence.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Estimate costs, choose a firm, and track execution in one place.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/estimator"
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-amber-400 hover:to-amber-500"
            >
              Try AI Cost Estimator
            </Link>
            <Link
              href="/designers"
              className="rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-300"
            >
              Find a Firm
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

      <footer className="border-t border-neutral-200 bg-white">
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
