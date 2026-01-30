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
  IndianRupee,
  FolderLock,
  Calculator,
  Ruler,
} from "lucide-react";
import { getAdminSettings } from "@/lib/settings";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";
import LandingScrollAnimations from "@/components/animations/LandingScrollAnimations";
import VisualizeIllustration from "@/components/landing/VisualizeIllustration";
import {
  HowItWorksIllo,
  BudgetIllo,
  VerifiedFirmsIllo,
  ProjectTrackingIllo,
  DigitalTwinIllo,
  WhoItsForIllo,
  StartWithClarityIllo,
} from "@/components/landing/SectionIllustrations";
import ContactForm from "@/components/landing/ContactForm";

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
    { name: "Studio Maple", mark: "SM", logoBg: "bg-[var(--foreground)]" },
    { name: "UrbanWeave", mark: "UW", logoBg: "bg-[var(--brand)]" },
    { name: "Aura Interiors", mark: "AI", logoBg: "bg-[var(--accent-teal)]" },
    { name: "Frame & Form", mark: "FF", logoBg: "bg-[var(--accent-amber)]" },
    { name: "Nexa Design", mark: "ND", logoBg: "bg-[var(--foreground)]/80" },
    { name: "Spaces & Co", mark: "SC", logoBg: "bg-[var(--brand)]" },
    { name: "Design Nest", mark: "DN", logoBg: "bg-[var(--accent-emerald)]" },
  ];

  return (
    <div className="bg-white relative overflow-x-hidden min-w-0 w-full -mt-[var(--header-height)] pt-[var(--header-height)]">
      {/* Flowing abstract background — parallax blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div data-parallax-blob className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[var(--brand)]/8 blur-3xl transition-transform" />
        <div data-parallax-blob className="absolute top-1/3 -left-40 h-[450px] w-[450px] rounded-full bg-[var(--brand)]/6 blur-3xl transition-transform" />
        <div data-parallax-blob className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[var(--brand)]/7 blur-3xl transition-transform" />
        <div data-parallax-blob className="absolute bottom-1/3 left-1/4 h-[350px] w-[350px] rounded-full bg-[var(--foreground)]/5 blur-3xl transition-transform" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--background)_70%)] pointer-events-none" />
      </div>

      <LandingScrollAnimations>
      <main className="relative z-10">
        {/* Hero — full viewport; always center-aligned */}
        <section className="hero section relative overflow-hidden text-center">
          <div
            className="absolute inset-0 z-0"
            style={{
              background: "linear-gradient(180deg, var(--surface-subtle) 0%, var(--background) 50%)",
            }}
          />
          <div className="page-inner relative z-10">
            <FadeIn className="mx-auto max-w-3xl text-center">
              {/* AI-assisted layouts — wide, compact card */}
              <FadeIn delay={0.05}>
                <div className="mb-8 md:mb-10 flex justify-center">
                  <div className="w-full max-w-2xl rounded-xl border border-[var(--foreground)]/10 bg-gradient-to-r from-[var(--foreground)]/[0.03] via-[var(--surface-subtle)] to-[var(--foreground)]/[0.04] px-5 py-4 md:px-6 md:py-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-center">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand)]/15 text-[var(--brand)]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">Coming soon</span>
                        <h2 className="text-lg font-bold text-[var(--foreground)] leading-tight">
                          <span className="text-[var(--brand)]">AI-assisted layouts</span>
                        </h2>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] leading-snug sm:border-l sm:border-[var(--border)] sm:pl-6 sm:flex-1 text-center">
                      Visualize your space and try different styles from your floor plan — decide with confidence before a single brick is laid.
                    </p>
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="mb-6 flex justify-center">
                  <span className="badge">Interior OS · India</span>
                </div>
              </FadeIn>
              <FadeIn delay={0.15}>
                <h1 className="heading-hero mb-6 text-center">
                  Transparency in every step of your{" "}
                  <span className="text-[var(--brand)]">interior</span> journey
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed text-center">
                  <span className="text-[var(--foreground)] font-medium">Budget with clarity</span>, choose verified firms, track milestones, and keep every document in one secure place.
                </p>
              </FadeIn>
              <FadeIn delay={0.25}>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/estimator" className="btn btn-primary text-base px-6 py-3">
                    Get AI cost estimate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href="/designers" className="btn btn-secondary text-base px-6 py-3">
                    Browse verified firms
                  </Link>
                </div>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-[var(--foreground)]">Transparent pricing</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-[var(--foreground)]">Milestone approvals</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                      <FolderLock className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-[var(--foreground)]">Document vault</span>
                  </div>
                </div>
              </FadeIn>
            </FadeIn>
          </div>
        </section>

        {/* How it works — timeline flowchart */}
        <section id="how-it-works" className="section section-alt section-bg-pattern section-bg-gradient-alt text-center">
          <div className="page-inner">
            <FadeIn className="mx-auto max-w-2xl text-center mb-16 md:mb-20">
              <p className="eyebrow mb-3 text-[var(--accent-teal)]">How it works</p>
              <h2 className="heading-lg mb-4">Six <span className="text-[var(--brand)]">clear</span> steps</h2>
              <p className="text-[var(--text-muted)] text-lg mb-0">
                From first estimate to handover — a <span className="text-[var(--brand)] font-medium">predictable</span> path.
              </p>
              <HowItWorksIllo />
            </FadeIn>
            <FadeIn>
              <div className="relative">
                {/* Desktop: horizontal timeline with connecting line */}
                <div className="hidden lg:block">
                  <div className="absolute left-0 right-0 top-8 h-0.5 bg-[var(--border)]" aria-hidden />
                  <div className="relative grid grid-cols-6 gap-4">
                    {steps.map((item) => (
                      <FadeInItem key={item.step} className="flex flex-col items-center text-center">
                        <div className="relative z-10 mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand)] bg-white text-lg font-bold text-[var(--brand)] shadow-md transition-all hover:scale-105 hover:shadow-lg">
                          {item.step}
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-[var(--foreground)]">{item.title}</h3>
                        <p className="text-xs text-[var(--text-muted)] leading-snug">{item.desc}</p>
                      </FadeInItem>
                    ))}
                  </div>
                </div>
                {/* Mobile / tablet: vertical timeline */}
                <div className="lg:hidden space-y-0">
                  {steps.map((item, stepIndex) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <FadeInItem className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand)] bg-white text-base font-bold text-[var(--brand)] shadow-md">
                          {item.step}
                        </FadeInItem>
                        {stepIndex < steps.length - 1 && (
                          <div className="my-1 h-8 w-0.5 flex-shrink-0 bg-[var(--border)]" aria-hidden />
                        )}
                      </div>
                      <FadeInItem className="flex-1 pb-8">
                        <h3 className="mb-1 text-base font-semibold text-[var(--foreground)]">{item.title}</h3>
                        <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                      </FadeInItem>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Feature: AI Cost Estimator */}
        <section id="features" className="section section-bg-pattern-light section-bg-gradient-light relative text-center md:text-left">
          <div className="page-inner relative">
            <BudgetIllo />
            <FadeIn className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center relative">
              <FadeInItem>
                <div>
                  <p className="eyebrow mb-3 text-[var(--accent-teal)]">AI Cost Estimator</p>
                <h2 className="heading-lg mb-4">Know your <span className="text-[var(--brand)]">budget</span> before you start</h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Our AI Cost Estimator gives you an upfront cost range from your home size and location. <span className="text-[var(--accent-teal)] font-medium">City and pincode-specific</span>, transparent — no surprises.
                </p>
                <ul className="space-y-3 mb-8 text-[var(--text-muted)]">
                  {[
                    { text: "City & pincode specific pricing", icon: MapPin },
                    { text: "Transparent ₹/sqft logic", icon: Calculator },
                    { text: "AI-powered cost range in seconds", icon: Sparkles },
                  ].map(({ text, icon: Icon }) => (
                    <li key={text} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/estimator" className="btn btn-primary">
                  Open AI Cost Estimator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </div>
              </FadeInItem>
              <FadeInItem>
                <div className="card-subtle p-6 md:p-8">
                  <p className="eyebrow mb-4">What you enter</p>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3 py-3 border-b border-[var(--border)]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="text-[var(--text-muted)]">City · Pincode</span>
                    </div>
                    <div className="flex items-center gap-3 py-3 border-b border-[var(--border)]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <Ruler className="h-4 w-4" />
                      </div>
                      <span className="text-[var(--text-muted)]">Sq ft · Property type</span>
                    </div>
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <span className="text-[var(--text-muted)]">Range + cost breakup</span>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            </FadeIn>
          </div>
        </section>

        {/* Feature: Verified Firms — reversed layout */}
        <section id="firms" className="section section-alt section-bg-pattern section-bg-gradient-alt relative text-center md:text-left">
          <div className="page-inner relative">
            <VerifiedFirmsIllo />
            <FadeIn className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center relative">
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
                <p className="eyebrow mb-3 text-[var(--accent-amber)]">Verified firms</p>
                <h2 className="heading-lg mb-4">Hire with <span className="text-[var(--brand)]">confidence</span></h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Every firm is <span className="text-[var(--accent-amber)] font-medium">reviewed</span> before going live. Credible profiles, real experience, and a clear view of what they deliver.
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
        <section className="section section-bg-pattern-light section-bg-gradient-light relative text-center md:text-left">
          <div className="page-inner relative">
            <ProjectTrackingIllo />
            <FadeIn className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center relative">
              <div>
                <p className="eyebrow mb-3 text-[var(--accent-emerald)]">Project tracking</p>
                <h2 className="heading-lg mb-4">Stay on schedule, stay in <span className="text-[var(--brand)]">control</span></h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Track progress by <span className="text-[var(--accent-emerald)] font-medium">milestone</span>, review updates, and approve each step before moving forward. Payment releases only after your sign-off.
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
        <section className="section section-alt section-bg-pattern section-bg-gradient-alt relative text-center md:text-left">
          <div className="page-inner relative">
            <DigitalTwinIllo />
            <FadeIn className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center relative">
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
                <p className="eyebrow mb-3 text-[var(--accent-teal)]">Digital twin</p>
                <h2 className="heading-lg mb-4">Every home document in <span className="text-[var(--brand)]">one place</span></h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Store wiring, plumbing, floor plans, and handover files <span className="text-[var(--accent-teal)] font-medium">securely</span> — for maintenance, resale, or future upgrades.
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
        <section className="section section-bg-pattern-light section-bg-gradient-light text-center">
          <div className="page-inner section-tight">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <p className="eyebrow mb-3 text-[var(--accent-amber)]">Coming soon</p>
              <h2 className="heading-lg mb-4"><span className="text-[var(--brand)]">Visualize</span> your space before it’s built</h2>
              <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">
                AI-assisted layouts and styles from your floor plan — to help you <span className="text-[var(--brand)] font-medium">decide faster</span>.
              </p>
              <VisualizeIllustration />
              <p className="text-xs text-[var(--text-subtle)] mb-6 max-w-md mx-auto">
                Upload your plan → choose styles → see how your room could look.
              </p>
              <button disabled className="btn btn-secondary opacity-60 cursor-not-allowed">
                Coming soon
              </button>
            </FadeIn>
          </div>
        </section>

        {/* Who is it for */}
        <section className="section section-alt section-bg-pattern section-bg-gradient-alt text-center">
          <div className="page-inner">
            <FadeIn className="mx-auto max-w-2xl text-center mb-6">
              <p className="eyebrow mb-3">Who it’s for</p>
              <h2 className="heading-lg"><span className="text-[var(--brand)]">Homeowners</span> and growing <span className="text-[var(--brand)]">studios</span></h2>
            </FadeIn>
            <WhoItsForIllo />
            <StaggerChildren className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mt-4">
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

        {/* Trusted by — logo strip, one line of sizing */}
        <section className="section section-bg-pattern-light section-bg-gradient-light text-center">
          <div className="page-inner">
            <FadeIn className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-10">
                <span className="text-[var(--brand)]">Trusted</span> by growing studios
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-10 sm:gap-y-6">
                {firms.map((firm) => (
                  <div
                    key={firm.name}
                    className="flex items-center gap-3 shrink-0"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${firm.logoBg} text-white text-xs font-semibold tracking-tight`}
                      aria-hidden
                    >
                      {firm.mark}
                    </div>
                    <span className="text-sm text-[var(--foreground)] font-medium whitespace-nowrap">
                      {firm.name}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Contact — compact, classy card */}
        <section id="contact" className="section section-alt section-compact section-bg-pattern section-bg-gradient-alt relative">
          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[var(--brand)]/5 blur-3xl" />
          </div>
          <div className="page-inner relative z-10">
            <FadeIn className="mx-auto max-w-3xl">
              <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-lg shadow-[var(--foreground)]/5">
                <div className="grid gap-0 md:grid-cols-2" data-contact-block>
                  {/* Form — compact */}
                  <div className="relative p-6 md:p-7 md:border-r border-[var(--border)]">
                    <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-[var(--brand)]/40 rounded-full hidden md:block" aria-hidden />
                    <p className="eyebrow mb-1.5 text-[var(--brand)]">Get in touch</p>
                    <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Talk to our team</h2>
                    <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
                      Walkthrough or project details. We reply within 24 hours.
                    </p>
                    <ContactForm />
                  </div>
                  {/* Contact + social — compact list */}
                  <div className="p-6 md:p-7 bg-[var(--surface-subtle)]/60 flex flex-col justify-center">
                    <p className="eyebrow text-[var(--text-muted)] mb-4">Reach us</p>
                    <ul className="space-y-3 mb-6">
                      <li>
                        <a href="mailto:hello@interioros.com" className="flex items-center gap-3 text-sm text-[var(--foreground)] hover:text-[var(--brand)] transition-colors">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[var(--border)] text-[var(--brand)]">
                            <Mail className="h-4 w-4" />
                          </span>
                          <span className="font-medium">hello@interioros.com</span>
                        </a>
                      </li>
                      <li>
                        <a href="tel:+919000000000" className="flex items-center gap-3 text-sm text-[var(--foreground)] hover:text-[var(--brand)] transition-colors">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[var(--border)] text-[var(--brand)]">
                            <PhoneCall className="h-4 w-4" />
                          </span>
                          <span className="font-medium">+91 90000 00000</span>
                        </a>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[var(--border)] text-[var(--brand)]">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span className="font-medium">Bengaluru, India</span>
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                      <span className="text-xs font-medium text-[var(--text-muted)]">Follow</span>
                      <div className="flex gap-2">
                        <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text-muted)] hover:text-[var(--brand)] hover:border-[var(--brand)]/40 transition-colors" aria-label="Twitter">
                          <Twitter className="h-4 w-4" />
                        </a>
                        <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text-muted)] hover:text-[var(--brand)] hover:border-[var(--brand)]/40 transition-colors" aria-label="LinkedIn">
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text-muted)] hover:text-[var(--brand)] hover:border-[var(--brand)]/40 transition-colors" aria-label="Instagram">
                          <Instagram className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Final CTA — Start with clarity */}
        <section className="section section-bg-pattern-light section-bg-gradient-light text-center">
          <div className="page-inner section-tight relative">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <StartWithClarityIllo />
              <h2 className="heading-lg mb-4">
                Start with <span className="text-[var(--brand)]">clarity</span>
              </h2>
              <p className="text-lg text-[var(--text-muted)] mb-8">
                Estimate costs, choose a firm, and track execution in one place.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/estimator" className="btn btn-primary">
                  Try AI Cost Estimator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/designers" className="btn btn-secondary">
                  Find a firm
                </Link>
              </div>
              {landingLinks.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-subtle)]">
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

        {/* Trust built in — clear 4-column grid with hierarchy */}
        <section className="section section-alt section-compact section-bg-pattern section-bg-gradient-alt">
          <div className="page-inner">
            <FadeIn className="rounded-2xl bg-[var(--foreground)] p-6 sm:p-8 md:p-12 text-white shadow-xl overflow-hidden relative w-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden />
              <div className="relative w-full flex flex-col items-center">
                <div className="w-full max-w-2xl text-center mb-8 md:mb-12 px-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 text-center drop-shadow-sm">
                    <span className="text-white">Clarity first.</span>{" "}
                    <span className="text-[#FDE68A]">Trust built in.</span>
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed text-center">
                    How we keep your interior journey transparent and secure.
                  </p>
                </div>
                <div className="w-full grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4" data-trust-grid>
                  <div className="trust-item flex flex-col items-center rounded-xl bg-white/[0.07] p-4 sm:p-6 text-center backdrop-blur-sm border border-white/10 transition-colors hover:bg-white/[0.1] hover:border-white/20">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--brand-light)]">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">Transparent rates</h3>
                    <p className="text-xs text-[var(--text-subtle)] leading-snug">Rates set and maintained by admin.</p>
                  </div>
                  <div className="trust-item flex flex-col items-center rounded-xl bg-white/[0.07] p-4 sm:p-6 text-center backdrop-blur-sm border border-white/10 transition-colors hover:bg-white/[0.1] hover:border-white/20">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--brand-light)]">
                      <BadgeCheck className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">Verified firms</h3>
                    <p className="text-xs text-[var(--text-subtle)] leading-snug">Every firm reviewed before listing.</p>
                  </div>
                  <div className="trust-item flex flex-col items-center rounded-xl bg-white/[0.07] p-4 sm:p-6 text-center backdrop-blur-sm border border-white/10 transition-colors hover:bg-white/[0.1] hover:border-white/20">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--brand-light)]">
                      <ClipboardCheck className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">Milestone approvals</h3>
                    <p className="text-xs text-[var(--text-subtle)] leading-snug">Payments released only after approval.</p>
                  </div>
                  <div className="trust-item flex flex-col items-center rounded-xl bg-white/[0.07] p-4 sm:p-6 text-center backdrop-blur-sm border border-white/10 transition-colors hover:bg-white/[0.1] hover:border-white/20">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--brand-light)]">
                      <FileText className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">Project vault</h3>
                    <p className="text-xs text-[var(--text-subtle)] leading-snug">Full records in your digital twin.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      </LandingScrollAnimations>

      {/* Footer — above fixed background (z-10), solid bg and explicit colors for visibility */}
      <footer className="relative z-10 border-t border-[#e2e8f0] bg-[#ffffff] text-[#334155]">
        <div className="page-inner py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-[#334155] mb-2">Interior OS</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Interior infrastructure for modern Indian homes — budgeting, verified firms, and document vault.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-3">Links</h4>
              <div className="flex flex-col gap-2 text-sm">
                {footerLinks.map((link) => (
                  <Link key={link.label} href={link.url} className="text-[#64748b] hover:text-[#334155] transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-3">Social</h4>
              <div className="flex flex-col gap-2 text-sm">
                {socialLinks.length === 0 ? (
                  <p className="text-xs text-[#94a3b8]">Configure social links in admin.</p>
                ) : (
                  socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#64748b] hover:text-[#334155] transition-colors"
                    >
                      {link.platform}
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-[#e2e8f0]">
            <p className="text-xs text-[#94a3b8]">© Interior OS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
