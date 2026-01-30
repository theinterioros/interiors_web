import Link from "next/link";
import {
  Mail,
  MapPin,
  PhoneCall,
  ArrowRight,
  Check,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  FileText,
  Zap,
  Droplets,
  LayoutGrid,
  ClipboardCheck,
  Camera,
  Lock,
  Linkedin,
  Instagram,
  Twitter,
} from "lucide-react";
import { getAdminSettings } from "@/lib/settings";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";

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

  const steps = [
    { step: "1", title: "Property details", desc: "Share your property and budget." },
    { step: "2", title: "AI cost estimate", desc: "Get a clear cost range instantly." },
    { step: "3", title: "Choose a firm", desc: "Pick from verified interior studios." },
    { step: "4", title: "Track milestones", desc: "Approve each stage before payment." },
    { step: "5", title: "Escrow payments", desc: "Release only when you sign off." },
    { step: "6", title: "Document vault", desc: "Keep plans and handover in one place." },
  ];

  const firms = [
    { name: "Studio Maple", mark: "SM" },
    { name: "UrbanWeave", mark: "UW" },
    { name: "Aura Interiors", mark: "AI" },
    { name: "Frame & Form", mark: "FF" },
    { name: "Nexa Design", mark: "ND" },
  ];

  return (
    <div className="bg-white">
      <main>
        {/* Hero — full viewport */}
        <section
          className="hero section relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, var(--surface-subtle) 0%, var(--background) 50%)",
          }}
        >
          <div className="page-inner relative z-10">
            <FadeIn className="mx-auto max-w-3xl text-center">
              <FadeIn delay={0.1}>
                <div className="mb-6 inline-block">
                  <span className="badge">Interior OS · India</span>
                </div>
              </FadeIn>
              <FadeIn delay={0.15}>
                <h1 className="heading-hero mb-6">
                  Transparency in every step of your{" "}
                  <span className="text-[var(--brand)]">interior</span> journey
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
                  Budget with clarity, choose verified firms, track milestones, and keep every document in one secure place.
                </p>
              </FadeIn>
              <FadeIn delay={0.25}>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/estimator" className="btn btn-primary text-base px-6 py-3">
                    Get cost estimate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href="/designers" className="btn btn-secondary text-base px-6 py-3">
                    Browse verified firms
                  </Link>
                </div>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[var(--text-muted)]">
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[var(--brand)]" />
                    Transparent pricing
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[var(--brand)]" />
                    Milestone approvals
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[var(--brand)]" />
                    Document vault
                  </span>
                </div>
              </FadeIn>
              <FadeIn delay={0.35}>
                <div className="mt-8 flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-xs font-medium text-[var(--text-muted)] shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
                    AI-assisted layouts — coming soon
                  </span>
                </div>
              </FadeIn>
            </FadeIn>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="section section-alt section-bg-pattern">
          <div className="page-inner">
            <FadeIn className="mx-auto max-w-2xl text-center mb-16 md:mb-20">
              <p className="eyebrow mb-3">How it works</p>
              <h2 className="heading-lg mb-4">Six clear steps</h2>
              <p className="text-[var(--text-muted)] text-lg">
                From first estimate to handover — a predictable path.
              </p>
            </FadeIn>
            <StaggerChildren className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((item) => (
                <FadeInItem key={item.step} className="group">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-sm font-semibold text-[var(--brand)] group-hover:border-[var(--brand)] transition-colors">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="heading-md mb-1">{item.title}</h3>
                      <p className="text-[var(--text-muted)]">{item.desc}</p>
                    </div>
                  </div>
                </FadeInItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Feature: AI Cost Estimator */}
        <section id="features" className="section section-bg-pattern-light">
          <div className="page-inner">
            <FadeIn className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
              <FadeInItem>
                <div>
                  <p className="eyebrow mb-3">AI Cost Estimator</p>
                <h2 className="heading-lg mb-4">Know your budget before you start</h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Get an upfront cost range from your home size and location. City and pincode-specific rates, clear ₹/sqft logic — no surprises.
                </p>
                <ul className="space-y-3 mb-8 text-[var(--text-muted)]">
                  {["City & pincode specific pricing", "Transparent ₹/sqft logic", "Built for AI upgrades later"].map((line) => (
                    <li key={line} className="flex items-center gap-3">
                      <Check className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/estimator" className="btn btn-primary">
                  Open cost estimator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </div>
              </FadeInItem>
              <FadeInItem>
                <div className="card-subtle p-6 md:p-8">
                  <p className="eyebrow mb-4">What you enter</p>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                      <span className="text-[var(--text-muted)]">City · Pincode</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                      <span className="text-[var(--text-muted)]">Sq ft · Property type</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[var(--text-muted)]">Range + cost breakup</span>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            </FadeIn>
          </div>
        </section>

        {/* Feature: Verified Firms — reversed layout */}
        <section id="firms" className="section section-alt section-bg-pattern">
          <div className="page-inner">
            <FadeIn className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
              <FadeInItem className="order-2 lg:order-1">
                <div className="card-subtle p-6 md:p-8">
                  <p className="eyebrow mb-4">Firm spotlight</p>
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Verified · 8+ years</p>
                        <p className="text-sm text-[var(--text-muted)]">Reference projects and verified documents</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Bengaluru · Residential</p>
                        <p className="text-sm text-[var(--text-muted)]">Primary service area and on-site team</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <LayoutGrid className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Portfolio & scope</p>
                        <p className="text-sm text-[var(--text-muted)]">Images, floor plans, and scope highlights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInItem>
              <div className="order-1 lg:order-2">
                <p className="eyebrow mb-3">Verified firms</p>
                <h2 className="heading-lg mb-4">Hire with confidence</h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Every firm is reviewed before going live. Credible profiles, real experience, and a clear view of what they deliver.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/designers" className="btn btn-primary">
                    View approved firms
                  </Link>
                  <Link href="/register?role=firm" className="btn btn-secondary">
                    Apply as a firm
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Feature: Project tracking */}
        <section className="section section-bg-pattern-light">
          <div className="page-inner">
            <FadeIn className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
              <div>
                <p className="eyebrow mb-3">Project tracking</p>
                <h2 className="heading-lg mb-4">Stay on schedule, stay in control</h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Track progress by milestone, review updates, and approve each step before moving forward. Payment releases only after your sign-off.
                </p>
                <ul className="space-y-3 mb-8 text-[var(--text-muted)]">
                  {["Milestone-based tracking", "Customer approval gates", "Payment release simulation"].map((line) => (
                    <li key={line} className="flex items-center gap-3">
                      <Check className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <FadeInItem>
                <div className="card-subtle p-6 md:p-8">
                  <p className="eyebrow mb-4">Status flow</p>
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Pending → Submitted → Approved</p>
                        <p className="text-sm text-[var(--text-muted)]">Always see what’s next for approval</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Photo updates per stage</p>
                        <p className="text-sm text-[var(--text-muted)]">Progress proof on every milestone</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Hold / release controls</p>
                        <p className="text-sm text-[var(--text-muted)]">Release only when you approve</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            </FadeIn>
          </div>
        </section>

        {/* Feature: Digital Twin — reversed */}
        <section className="section section-alt section-bg-pattern">
          <div className="page-inner">
            <FadeIn className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
              <FadeInItem className="order-2 lg:order-1">
                <div className="card-subtle p-6 md:p-8">
                  <p className="eyebrow mb-4">Document vault</p>
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Wiring diagrams</p>
                        <p className="text-sm text-[var(--text-muted)]">Safety, maintenance, upgrades</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <Droplets className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Plumbing layouts</p>
                        <p className="text-sm text-[var(--text-muted)]">Access points and valve locations</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Floor plans & handover</p>
                        <p className="text-sm text-[var(--text-muted)]">As-built drawings and warranties</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInItem>
              <div className="order-1 lg:order-2">
                <p className="eyebrow mb-3">Digital twin</p>
                <h2 className="heading-lg mb-4">Every home document in one place</h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Store wiring, plumbing, floor plans, and handover files securely — for maintenance, resale, or future upgrades.
                </p>
                <ul className="space-y-3 mb-8 text-[var(--text-muted)]">
                  {["Free for the first year", "Secure cloud access", "Ready for renovations and resale"].map((line) => (
                    <li key={line} className="flex items-center gap-3">
                      <Check className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/digital-twin" className="btn btn-secondary">
                  Explore digital twin
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Coming soon */}
        <section className="section section-bg-pattern-light">
          <div className="page-inner section-tight">
            <FadeIn className="mx-auto max-w-xl text-center">
              <p className="eyebrow mb-3">Coming soon</p>
              <h2 className="heading-lg mb-4">Visualize your space before it’s built</h2>
              <p className="text-[var(--text-muted)] mb-6">
                AI-assisted layouts and styles from your floor plan — to help you decide faster.
              </p>
              <button disabled className="btn btn-secondary opacity-60 cursor-not-allowed">
                Coming soon
              </button>
            </FadeIn>
          </div>
        </section>

        {/* Who is it for */}
        <section className="section section-alt section-bg-pattern">
          <div className="page-inner">
            <FadeIn className="mx-auto max-w-2xl text-center mb-14 md:mb-16">
              <p className="eyebrow mb-3">Who it’s for</p>
              <h2 className="heading-lg">Homeowners and growing studios</h2>
            </FadeIn>
            <StaggerChildren className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <FadeInItem className="card p-6 md:p-8">
                <p className="eyebrow mb-3">Customers</p>
                <h3 className="heading-md mb-3">Plan budgets, choose vetted firms</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Track milestones, protect payments, and keep project documents in one secure place.
                </p>
              </FadeInItem>
              <FadeInItem className="card p-6 md:p-8">
                <p className="eyebrow mb-3">Interior firms</p>
                <h3 className="heading-md mb-3">Manage leads and approvals</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Milestone payments, client communication, and project execution in one place.
                </p>
              </FadeInItem>
            </StaggerChildren>
          </div>
        </section>

        {/* Trusted by */}
        <section className="section section-bg-pattern-light">
          <div className="page-inner">
            <FadeIn className="mx-auto max-w-2xl text-center mb-12">
              <p className="eyebrow mb-3">Connected firms</p>
              <h2 className="heading-lg">Trusted by growing studios</h2>
            </FadeIn>
            <StaggerChildren className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
              {firms.map((firm) => (
                <FadeInItem key={firm.name} className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] text-sm font-semibold text-[var(--brand)]">
                    {firm.mark}
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">{firm.name}</span>
                </FadeInItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="section section-alt section-bg-pattern">
          <div className="page-inner">
            <FadeIn className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <FadeInItem className="card p-6 md:p-8">
                <h2 className="heading-lg mb-3">Talk to our team</h2>
                <p className="text-[var(--text-muted)] mb-6">
                  Get a walkthrough or share your project requirements.
                </p>
                <form className="space-y-4">
                  <input type="text" placeholder="Name" className="input" />
                  <input type="email" placeholder="Email" className="input" />
                  <input type="tel" placeholder="Phone" className="input" />
                  <textarea placeholder="Tell us about your project" rows={4} className="input resize-none" />
                  <button type="submit" className="btn btn-primary w-full">
                    Request a call
                  </button>
                </form>
              </FadeInItem>
              <FadeInItem className="card p-6 md:p-8 flex flex-col">
                <h3 className="heading-md mb-3">Contact</h3>
                <div className="space-y-3 text-[var(--text-muted)]">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                    <span className="text-sm">hello@interioros.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneCall className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                    <span className="text-sm">+91 90000 00000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                    <span className="text-sm">Bengaluru, India</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--text-subtle)]">
                  We respond within 24 hours on business days.
                </p>
                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <p className="eyebrow mb-3">Follow us</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      aria-label="Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </FadeInItem>
            </FadeIn>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section section-bg-pattern-light">
          <div className="page-inner section-tight">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 className="heading-lg mb-4">Start with clarity</h2>
              <p className="text-lg text-[var(--text-muted)] mb-8">
                Estimate costs, choose a firm, and track execution in one place.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/estimator" className="btn btn-primary">
                  Try cost estimator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/designers" className="btn btn-secondary">
                  Find a firm
                </Link>
              </div>
              {landingLinks.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-muted)]">
                  {landingLinks.map((link) => (
                    <Link key={link.label} href={link.url} className="hover:text-[var(--foreground)] transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>
        </section>

        {/* Clarity strip — Trust built in */}
        <section className="section section-alt section-compact section-bg-pattern">
          <div className="page-inner section-tight">
            <FadeIn className="rounded-xl bg-[var(--foreground)] p-8 md:p-12 text-white">
              <h2 className="heading-lg mb-8 text-white">
                Clarity first. <span className="text-[var(--brand-light)]">Trust built in.</span>
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--brand-light)]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="text-[var(--text-subtle)] pt-1">Transparent rates set by admin.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--brand-light)]">
                    <BadgeCheck className="h-6 w-6" />
                  </div>
                  <p className="text-[var(--text-subtle)] pt-1">Firms reviewed before listing.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--brand-light)]">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <p className="text-[var(--text-subtle)] pt-1">Milestone approvals before release.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--brand-light)]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-[var(--text-subtle)] pt-1">Full project records in your vault.</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-white">
        <div className="page-inner py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Interior OS</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Interior infrastructure for modern Indian homes — budgeting, verified firms, and document vault.
              </p>
            </div>
            <div>
              <h4 className="eyebrow mb-3">Links</h4>
              <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                {footerLinks.map((link) => (
                  <Link key={link.label} href={link.url} className="hover:text-[var(--foreground)] transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="eyebrow mb-3">Social</h4>
              <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                {socialLinks.length === 0 ? (
                  <p className="text-xs text-[var(--text-subtle)]">Configure social links in admin.</p>
                ) : (
                  socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.platform}
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-subtle)]">© Interior OS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
