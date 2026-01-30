import Link from "next/link";
import { Mail, MapPin, PhoneCall } from "lucide-react";
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
    <div className="bg-[radial-gradient(1200px_circle_at_top_left,_#fbf4eb,_#fdfaf6_55%,_#ffffff_100%)] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-900 text-sm font-semibold text-white shadow-sm">
              IO
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.32em] text-neutral-900">
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
              className="rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-300 hover:text-neutral-900"
            >
              Customer Sign In
            </Link>
            <Link
              href="/login?role=firm"
              className="rounded-full border border-amber-300 bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
            >
              Firm Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <LandingSection className="mx-auto max-w-6xl px-8 py-24">
          <div className="panel-dark">
            <div className="grid gap-16 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-amber-200/80">
                  Interior OS • India
                </div>
                <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                  Bring <span className="text-amber-300">transparency</span> to interior execution.
                </h1>
                <p className="text-base text-amber-100/80">
                  India&apos;s interior infrastructure platform for{" "}
                  <span className="font-semibold text-white">budgeting</span>,{" "}
                  <span className="font-semibold text-white">verified firm selection</span>,{" "}
                  <span className="font-semibold text-white">milestone tracking</span>, and{" "}
                  <span className="font-semibold text-white">secure document storage</span>.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/estimator"
                    className="rounded-full bg-amber-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,158,11,0.35)] hover:bg-amber-500"
                  >
                    Get AI Cost Estimator
                  </Link>
                  <Link
                    href="/designers"
                    className="rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Browse Verified Firms
                  </Link>
                </div>
                <div className="grid gap-4 text-sm text-amber-100/80 sm:grid-cols-3">
                  <div className="panel-pill">Transparent pricing</div>
                  <div className="panel-pill">Milestone approvals</div>
                  <div className="panel-pill">Document vault</div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Product Snapshot</p>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: "AI Cost Estimator",
                      detail: "Room-by-room price clarity in minutes.",
                    },
                    {
                      title: "Verified firms",
                      detail: "Profiles reviewed before listing.",
                    },
                    {
                      title: "End to End Live Project Tracking",
                      detail: "Milestones, approvals, and progress updates in real time.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="panel-card">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-amber-100/70">{item.detail}</p>
                    </div>
                  ))}
                  <div className="panel-card text-xs text-amber-100/70">
                    Built for homeowners and growing studios.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20" id="how-it-works">
          <div className="panel-dark">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.32em] text-amber-200/70">How it works</p>
                <h2 className="text-3xl font-semibold text-white">Six clear steps</h2>
                <p className="text-sm text-amber-100/70">
                  A predictable journey from estimate to handover.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  "Enter Property Details",
                  "AI Cost Estimation",
                  "AR / 3D Visualization",
                  "Choose Verified Firm",
                  "Track Project",
                  "Pay via Escrow",
                ].map((label, index) => (
                  <div key={label} className="panel-card">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <p className="text-sm font-semibold text-white">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20" id="features">
          <div className="panel-dark">
            <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
              <div className="panel-card">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                  AI Cost Estimator
                </p>
                <div className="mt-4 space-y-3 text-sm text-amber-100/80">
                  <div className="panel-card">City • Pincode • Sq ft • Property type</div>
                  <div className="panel-card">Range + clear cost breakup</div>
                  <div className="panel-card">AI-ready foundation (upgrade later)</div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-white">
                  See a realistic budget before you start.
                </h2>
                <p className="text-base text-amber-100/80">
                  Get an upfront cost range based on your home size and location — simple, clear, and
                  designed to set the right expectations.
                </p>
                <ul className="space-y-2 text-sm text-amber-100/80">
                  <li>City & pincode specific pricing</li>
                  <li>Transparent ₹/sqft logic</li>
                  <li>Built for AI upgrades later</li>
                </ul>
                <Link
                  href="/estimator"
                  className="inline-flex rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(245,158,11,0.35)] hover:bg-amber-500"
                >
                  Open AI Cost Estimator
                </Link>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20" id="firms">
          <div className="panel-dark">
            <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-amber-200/70">Verified firms</p>
                <h2 className="text-3xl font-semibold text-white">Hire with confidence, not guesswork.</h2>
                <p className="text-base text-amber-100/80">
                  Each firm is reviewed before they go live. You get credible profiles, real
                  experience, and a clear view of their strengths.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/designers"
                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    View Approved Firms
                  </Link>
                  <Link
                    href="/register?role=firm"
                    className="inline-flex rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(245,158,11,0.35)] hover:bg-amber-500"
                  >
                    Apply as a Firm
                  </Link>
                </div>
              </div>
              <div className="panel-card">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Firm spotlight</p>
                <div className="mt-4 space-y-3 text-sm text-amber-100/80">
                  <div className="panel-card">Verified • 8+ years experience</div>
                  <div className="panel-card">Bengaluru • Residential interiors</div>
                  <div className="panel-card">Portfolio snapshots available</div>
                </div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20">
          <div className="panel-dark">
            <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
              <div className="panel-card">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Project tracking</p>
                <div className="mt-4 space-y-3 text-sm text-amber-100/80">
                  <div className="panel-card">Pending → Submitted → Approved</div>
                  <div className="panel-card">Photo updates at each stage</div>
                  <div className="panel-card">Hold / release payment controls</div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-white">Stay on schedule, stay in control.</h2>
                <p className="text-base text-amber-100/80">
                  Track progress by milestone, review updates, and approve each step before moving
                  forward.
                </p>
                <ul className="space-y-2 text-sm text-amber-100/80">
                  <li>Milestone-based tracking</li>
                  <li>Customer approval gates</li>
                  <li>Payment release simulation</li>
                </ul>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20">
          <div className="panel-dark">
            <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-amber-200/70">Digital twin</p>
                <h2 className="text-3xl font-semibold text-white">Keep every home document in one place.</h2>
                <p className="text-base text-amber-100/80">
                  Store wiring, plumbing, floor plans, and handover files securely for maintenance,
                  resale, or future upgrades.
                </p>
                <ul className="space-y-2 text-sm text-amber-100/80">
                  <li>Free for the first year</li>
                  <li>Secure cloud access</li>
                  <li>Ready for renovations and resale</li>
                </ul>
                <Link
                  href="/digital-twin"
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Explore Digital Twin
                </Link>
              </div>
              <div className="panel-card">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Document vault</p>
                <div className="mt-4 space-y-3 text-sm text-amber-100/80">
                  <div className="panel-card">Wiring diagrams</div>
                  <div className="panel-card">Plumbing layouts</div>
                  <div className="panel-card">Floor plans & handover files</div>
                </div>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20">
          <div className="panel-dark text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Coming Soon</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Visualize your space before it’s built.
            </h2>
            <p className="mt-3 text-base text-amber-100/80">
              Explore AI-assisted layouts and styles from your floor plan. A preview tool designed to
              help you decide faster.
            </p>
            <button
              disabled
              className="mt-6 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-amber-100/60"
            >
              Coming Soon
            </button>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20">
          <div className="panel-dark">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="panel-card">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Who is it for?</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Customers</h3>
                <p className="mt-2 text-sm text-amber-100/80">
                  Plan budgets, choose vetted firms, track milestones, and protect payments.
                </p>
              </div>
              <div className="panel-card">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Who is it for?</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Interior Firms</h3>
                <p className="mt-2 text-sm text-amber-100/80">
                  Manage leads, approvals, milestone payments, and client communication in one place.
                </p>
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20">
          <div className="panel-dark">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-200/70">
                  Connected interior firms
                </p>
                <h2 className="text-3xl font-semibold text-white">Trusted by growing studios</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[
                  { name: "Studio Maple", mark: "SM" },
                  { name: "UrbanWeave", mark: "UW" },
                  { name: "Aura Interiors", mark: "AI" },
                  { name: "Frame & Form", mark: "FF" },
                  { name: "Nexa Design", mark: "ND" },
                ].map((firm) => (
                  <div key={firm.name} className="panel-card min-w-[220px]">
                    <div className="flex items-center gap-3 text-sm font-semibold text-white">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-600/20 text-xs font-semibold text-amber-200">
                        {firm.mark}
                      </div>
                      <span>{firm.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection className="mx-auto max-w-6xl px-8 py-20" id="contact">
          <div className="panel-dark">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
              <div className="panel-card">
                <h2 className="text-3xl font-semibold text-white">Talk to our team</h2>
                <p className="mt-2 text-sm text-amber-100/80">
                  Get a walkthrough or share your project requirements.
                </p>
                <div className="mt-4 grid gap-3">
                  <input
                    placeholder="Name"
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-amber-100/40"
                  />
                  <input
                    placeholder="Email"
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-amber-100/40"
                  />
                  <input
                    placeholder="Phone"
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-amber-100/40"
                  />
                  <textarea
                    placeholder="Tell us about your project"
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-amber-100/40"
                    rows={4}
                  />
                  <button className="rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(245,158,11,0.35)] hover:bg-amber-500">
                    Request a call
                  </button>
                </div>
              </div>
              <div className="panel-card">
                <h3 className="text-xl font-semibold text-white">Contact</h3>
                <div className="mt-3 space-y-2 text-sm text-amber-100/80">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-400" />
                    hello@interioros.com
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-amber-400" />
                    +91 90000 00000
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-400" />
                    Bengaluru, India
                  </div>
                </div>
                <p className="mt-4 text-sm text-amber-100/60">
                  We respond within 24 hours on business days.
                </p>
              </div>
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
