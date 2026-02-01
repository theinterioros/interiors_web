import Link from "next/link";
import {
  Mail,
  MapPin,
  PhoneCall,
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
  BadgeCheck,
  FileText,
  Zap,
  Droplets,
  LayoutGrid,
  ClipboardCheck,
  Camera,
  Lock,
  Wallet,
  Hammer,
  CheckCircle2,
  RotateCw,
  Linkedin,
  Instagram,
  Twitter,
  IndianRupee,
  FolderLock,
  Calculator,
  Ruler,
  Globe,
  Facebook,
  Youtube,
  Shield,
  TrendingUp,
  Box,
} from "lucide-react";
import { getAdminSettings } from "@/lib/settings";
import { getTrustedStudios } from "@/lib/trustedStudios";
import { getCurrentUser } from "@/lib/auth";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import FadeInItem from "@/components/animations/FadeInItem";
import LandingScrollAnimations from "@/components/animations/LandingScrollAnimations";
import VisualizeIllustration from "@/components/landing/VisualizeIllustration";
import {
  HowItWorksIllo,
  VerifiedFirmsIllo,
  ProjectTrackingIllo,
  DigitalTwinIllo,
  WhoItsForIllo,
} from "@/components/landing/SectionIllustrations";
import ContactForm from "@/components/landing/ContactForm";
import EstimatorForm from "@/components/estimator/EstimatorForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, user] = await Promise.all([getAdminSettings(), getCurrentUser()]);
  const isCustomer = user?.role === "CUSTOMER";
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
          { label: "Designers", url: "/designers", showInHeader: false, showInFooter: true, showInLanding: true },
          { label: "AI Visualization (coming soon)", url: "#", showInHeader: false, showInFooter: true, showInLanding: false },
          { label: "Login", url: "/login", showInHeader: false, showInFooter: true, showInLanding: false },
        ];
  const footerLinks = marketingLinks.filter((link) => link.showInFooter);
  const landingLinks = marketingLinks.filter((link) => link.showInLanding);
  const socialLinks = settings.socialLinks.filter(
    (link) => link.showInFooter || link.showInHeader || link.showInLanding
  );

  const steps = [
    { step: "1", title: "Property Details", desc: "Share your property and budget." },
    { step: "2", title: "AI Cost Estimate", desc: "Get a clear cost range instantly." },
    { step: "3", title: "Choose a Designer", desc: "Pick from verified interior studios." },
    { step: "4", title: "Project Tracking", desc: "Approve each stage before payment." },
    { step: "5", title: "Escrow Payments", desc: "Release only when you sign off." },
    { step: "6", title: "Document Vault", desc: "Keep plans and handover in one place." },
  ];

  const firms = await getTrustedStudios();

  return (
    <div className="page-gradient relative overflow-x-hidden min-w-0 w-full -mt-[var(--header-height)] pt-[var(--header-height)]">
      {/* Flowing abstract background — parallax blobs (navy + amber tint) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div data-parallax-blob className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[var(--navy-light)]/10 blur-3xl transition-transform" />
        <div data-parallax-blob className="absolute top-1/3 -left-40 h-[450px] w-[450px] rounded-full bg-[var(--brand)]/6 blur-3xl transition-transform" />
        <div data-parallax-blob className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[var(--navy)]/8 blur-3xl transition-transform" />
        <div data-parallax-blob className="absolute bottom-1/3 left-1/4 h-[350px] w-[350px] rounded-full bg-[var(--foreground)]/5 blur-3xl transition-transform" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_50%,rgba(255,255,255,0.6)_100%)] pointer-events-none" />
      </div>

      <LandingScrollAnimations>
      <main className="relative z-10 min-w-0">
        {/* Landing — full viewport: Interior OS overview + AI Cost Estimator inline */}
        <section className="landing-hero landing-hero-bg relative overflow-hidden">
          <div className="page-inner relative z-10 flex flex-col justify-center min-h-0 min-w-0">
            <FadeIn className="w-full min-w-0">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14 xl:gap-20 lg:items-center w-full min-w-0">
                {/* Left: value prop + features + CTA */}
                <div className="flex flex-col justify-center text-center lg:text-left">
                  <span className="inline-flex items-center gap-2 w-fit mx-auto lg:mx-0 rounded-full bg-[var(--brand-light)] px-4 py-2 text-sm font-medium text-[var(--brand)] mb-6">
                    <Zap className="h-4 w-4 shrink-0" />
                    AI-powered interior design platform
                  </span>
                  <h1 className="heading-hero text-[var(--foreground)] mb-4 tracking-tight">
                    Transparency in every step of your{" "}
                    <span className="text-[var(--brand)]">interior</span> journey
                  </h1>
                  <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                    Budget with clarity, choose verified designers, track your project, and keep every document in one secure place.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
                    {[
                      { icon: Zap, label: "AI Cost Estimates" },
                      { icon: Shield, label: "Verified Designers" },
                      { icon: TrendingUp, label: "Project Tracking" },
                      { icon: Lock, label: "Escrow Payments" },
                      { icon: Box, label: "Digital Twin" },
                      { icon: Sparkles, label: "AI-assisted layouts", soon: true },
                    ].map(({ icon: Icon, label, soon }) => (
                      <span
                        key={label}
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium ${soon ? "border border-dashed border-[var(--brand)]/50 bg-[var(--brand-light)]/60 text-[var(--text-muted)]" : "bg-white border border-[var(--border)] text-[var(--foreground)] shadow-sm"}`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[var(--brand)]" />
                        {label}
                        {soon && <em className="text-[10px] font-semibold uppercase not-italic text-[var(--brand)]">Soon</em>}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-center lg:justify-start">
                    {isCustomer ? (
                      <Link href="/designers" className="btn btn-primary inline-flex items-center gap-2">
                        Sign in to View Designers
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    ) : (
                      <Link href="/login?redirect=/designers" className="btn btn-primary inline-flex items-center gap-2">
                        Sign in to View Designers
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    )}
                  </div>
                </div>
                {/* Right: estimator form (multi-step, full width so complete form is visible) */}
                <div className="w-full min-w-0 flex justify-center lg:justify-end">
                  <FadeIn delay={0.08} className="w-full max-w-xl">
                    <EstimatorForm variant="inline" />
                  </FadeIn>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* How it works — timeline flowchart (symmetric spacing above/below) */}
        <section id="how-it-works" className="section section-compact section-alt section-bg-pattern section-bg-gradient-alt text-center">
          <div className="page-inner min-w-0 py-6 md:py-10">
            <FadeIn className="mx-auto max-w-2xl text-center mb-8 md:mb-10">
              <p className="eyebrow mb-3 text-[var(--accent-teal)]">How It Works</p>
              <h2 className="heading-lg mb-4">Six <span className="text-[var(--brand)]">clear</span> steps</h2>
              <p className="text-[var(--text-muted)] text-base sm:text-lg mb-0 max-w-lg mx-auto">
                From first estimate to handover — a predictable path.
              </p>
              <HowItWorksIllo />
            </FadeIn>
            <FadeIn>
              <div className="relative min-w-0">
                {/* Desktop: grid with flow line; on xl add arrows between steps */}
                <div className="hidden sm:block">
                  {/* Flow line under step numbers */}
                  <div className="absolute left-0 right-0 top-7 h-0.5 bg-[var(--border)]" aria-hidden />
                  {/* xl: flex row with flow line + arrow between each step */}
                  <div className="relative hidden xl:flex xl:items-start xl:justify-between xl:gap-0 xl:px-1">
                    {[
                      ...steps.slice(0, 2).map((item) => ({ kind: "step" as const, item })),
                      { kind: "coming" as const },
                      ...steps.slice(2).map((item) => ({ kind: "step" as const, item })),
                    ].map((node, idx, arr) => (
                      <span key={idx} className="contents">
                        {node.kind === "step" ? (
                          <div className="flex flex-1 flex-col items-center min-w-0">
                            <FadeInItem className="flex flex-col items-center text-center w-full">
                              <div className="relative z-10 mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand)] bg-white text-base font-bold text-[var(--brand)] shadow-md">
                                {node.item.step}
                              </div>
                              <h3 className="mb-0.5 text-xs sm:text-sm font-semibold text-[var(--foreground)]">{node.item.title}</h3>
                              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-snug">{node.item.desc}</p>
                            </FadeInItem>
                          </div>
                        ) : (
                          <div className="flex flex-1 flex-col items-center min-w-0">
                            <FadeInItem className="flex flex-col items-center text-center w-full">
                              <div className="relative z-10 mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--text-muted)] bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                                <Sparkles className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">Coming soon</span>
                              <h3 className="mb-0.5 text-xs sm:text-sm font-semibold text-[var(--foreground)]">AI-Assisted Layouts</h3>
                              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-snug">Visualize before build</p>
                            </FadeInItem>
                          </div>
                        )}
                        {idx < arr.length - 1 && (
                          <div className="flex shrink-0 items-center pt-5 text-[var(--brand)]/50" aria-hidden>
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        )}
                      </span>
                    ))}
                  </div>
                  {/* sm to lg: grid without arrows */}
                  <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:hidden gap-4 gap-y-6 items-start">
                    {steps.slice(0, 2).map((item) => (
                      <FadeInItem key={item.step} className="flex flex-col items-center text-center min-w-0">
                        <div className="relative z-10 mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand)] bg-white text-base font-bold text-[var(--brand)] shadow-md">
                          {item.step}
                        </div>
                        <h3 className="mb-0.5 text-xs sm:text-sm font-semibold text-[var(--foreground)]">{item.title}</h3>
                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-snug">{item.desc}</p>
                      </FadeInItem>
                    ))}
                    <FadeInItem className="flex flex-col items-center text-center min-w-0">
                      <div className="relative z-10 mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--text-muted)] bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">Coming soon</span>
                      <h3 className="mb-0.5 text-xs sm:text-sm font-semibold text-[var(--foreground)]">AI-Assisted Layouts</h3>
                      <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-snug">Visualize before build</p>
                    </FadeInItem>
                    {steps.slice(2).map((item) => (
                      <FadeInItem key={item.step} className="flex flex-col items-center text-center min-w-0">
                        <div className="relative z-10 mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand)] bg-white text-base font-bold text-[var(--brand)] shadow-md">
                          {item.step}
                        </div>
                        <h3 className="mb-0.5 text-xs sm:text-sm font-semibold text-[var(--foreground)]">{item.title}</h3>
                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-snug">{item.desc}</p>
                      </FadeInItem>
                    ))}
                  </div>
                </div>
                {/* Mobile: vertical timeline */}
                <div className="sm:hidden space-y-0">
                  {steps.slice(0, 2).map((item) => (
                    <div key={item.step} className="flex gap-3 pb-5">
                      <div className="flex flex-col items-center shrink-0">
                        <FadeInItem className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--brand)] bg-white text-sm font-bold text-[var(--brand)]">
                          {item.step}
                        </FadeInItem>
                        <div className="my-1 h-6 w-0.5 flex-shrink-0 bg-[var(--border)]" aria-hidden />
                      </div>
                      <FadeInItem className="flex-1 min-w-0 pb-2">
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">{item.title}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                      </FadeInItem>
                    </div>
                  ))}
                  <div className="flex gap-3 pb-5">
                    <div className="flex flex-col items-center shrink-0">
                      <FadeInItem className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-[var(--text-muted)] bg-[var(--surface-subtle)]">
                        <Sparkles className="h-4 w-4 text-[var(--text-muted)]" />
                      </FadeInItem>
                      <div className="my-1 h-6 w-0.5 flex-shrink-0 bg-[var(--border)]" aria-hidden />
                    </div>
                    <FadeInItem className="flex-1 min-w-0 pb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">Coming soon</span>
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">AI-Assisted Layouts</h3>
                      <p className="text-xs text-[var(--text-muted)]">Visualize before build</p>
                    </FadeInItem>
                  </div>
                  {steps.slice(2).map((item, stepIndex) => (
                    <div key={item.step} className="flex gap-3 pb-6">
                      <div className="flex flex-col items-center shrink-0">
                        <FadeInItem className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--brand)] bg-white text-sm font-bold text-[var(--brand)]">
                          {item.step}
                        </FadeInItem>
                        {stepIndex < steps.length - 3 && (
                          <div className="my-1 h-6 w-0.5 flex-shrink-0 bg-[var(--border)]" aria-hidden />
                        )}
                      </div>
                      <FadeInItem className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">{item.title}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                      </FadeInItem>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Coming soon — Visualize your space */}
        <section className="section section-compact section-bg-pattern-light section-bg-gradient-light text-center">
          <div className="page-inner section-tight min-w-0">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <p className="eyebrow mb-3 text-[var(--accent-amber)]">Coming Soon</p>
              <h2 className="heading-lg mb-4"><span className="text-[var(--brand)]">Visualize</span> your space before it&apos;s built</h2>
              <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto leading-relaxed">
                AI-assisted layouts and styles from your floor plan — decide faster.
              </p>
              <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-6 sm:p-8 shadow-sm mb-6">
                <VisualizeIllustration />
              </div>
              <p className="text-xs text-[var(--text-subtle)] mb-6 max-w-md mx-auto">
                Upload your plan → choose styles → see how your room could look.
              </p>
              <button disabled className="btn btn-secondary rounded-xl opacity-60 cursor-not-allowed">
                Coming Soon
              </button>
            </FadeIn>
          </div>
        </section>

        {/* Feature: Verified Designers — reversed layout */}
        <section id="designers" className="section section-compact section-alt section-bg-pattern section-bg-gradient-alt relative text-center md:text-left">
          <div className="page-inner relative min-w-0">
            <VerifiedFirmsIllo />
            <FadeIn className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center relative min-w-0">
              <FadeInItem className="order-2 lg:order-1 min-w-0">
                <div className="card-subtle p-5 md:p-6">
                  <p className="eyebrow mb-4">Designer Spotlight</p>
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Verified · 3 years</p>
                        <p className="text-sm text-[var(--text-muted)]">Reference projects, verified documents, and Google reviews</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Hyderabad · Residential</p>
                        <p className="text-sm text-[var(--text-muted)]">Primary service area and on-site team</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]">
                        <LayoutGrid className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] mb-1">Portfolio & Scope</p>
                        <p className="text-sm text-[var(--text-muted)]">Images, floor plans, and scope highlights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInItem>
              <div className="order-1 lg:order-2 min-w-0">
                <p className="eyebrow mb-3 text-[var(--accent-amber)]">Verified Designers</p>
                <h2 className="heading-lg mb-4">Hire with <span className="text-[var(--brand)]">confidence</span></h2>
                <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
                  Every designer is <span className="text-[var(--accent-amber)] font-medium">reviewed</span> before going live. Credible profiles, real experience, and a clear view of what they deliver.
                </p>
                <div className="flex flex-wrap gap-3">
                  {isCustomer ? (
                    <Link href="/designers" className="btn btn-primary">View Approved Designers</Link>
                  ) : (
                    <Link href="/login?redirect=/designers" className="btn btn-primary">Sign In to View Designers</Link>
                  )}
                  <Link href="/register?role=firm" className="btn btn-secondary">Apply as a Designer</Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Feature: Project Tracking */}
        <section className="section section-compact section-bg-pattern-light section-bg-gradient-light relative text-center md:text-left">
          <div className="page-inner relative min-w-0">
            <ProjectTrackingIllo />
            <FadeIn className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center relative min-w-0">
              <div className="min-w-0">
                <p className="eyebrow mb-3 text-[var(--accent-emerald)]">Project Tracking</p>
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
              <FadeInItem className="min-w-0">
                <div className="card-subtle p-5 md:p-6">
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

        {/* Escrow payment flow — icons explain each step */}
        <section className="section section-compact section-alt section-bg-pattern section-bg-gradient-alt text-center">
          <div className="page-inner min-w-0">
            <FadeIn className="max-w-2xl mx-auto">
              <p className="eyebrow mb-3 text-[var(--accent-emerald)]">Escrow Payments</p>
              <h2 className="heading-lg mb-4">How <span className="text-[var(--brand)]">escrow</span> protects you</h2>
              <p className="text-[var(--text-muted)] mb-8">
                Your payment is held securely until you approve each milestone.
              </p>
              <div className="text-left space-y-5 text-sm text-[var(--text-muted)]">
                <div className="flex gap-4 items-start rounded-xl p-5 bg-white border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--border-strong)] transition-all">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-emerald-light)] text-[var(--accent-emerald)]">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)] mb-0.5">Fund into escrow</p>
                    <p className="mb-0">You pay the milestone amount into escrow when starting a stage. Money is held, not released.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start rounded-xl p-5 bg-white border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--border-strong)] transition-all">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
                    <Hammer className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)] mb-0.5">Designer delivers</p>
                    <p className="mb-0">The designer completes the work and submits photos and updates for your review.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start rounded-xl p-5 bg-white border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--border-strong)] transition-all">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-teal-light)] text-[var(--accent-teal)]">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)] mb-0.5">You approve → release</p>
                    <p className="mb-0">You review and approve. Only then is the amount released to the designer.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start rounded-xl p-5 bg-white border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--border-strong)] transition-all">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                    <RotateCw className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)] mb-0.5">Repeat per milestone</p>
                    <p className="mb-0">Same flow for each stage. You stay in control; no upfront lump sum.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Feature: Digital Twin — reversed */}
        <section className="section section-compact section-alt section-bg-pattern section-bg-gradient-alt relative text-center md:text-left">
          <div className="page-inner relative min-w-0">
            <DigitalTwinIllo />
            <FadeIn className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center relative min-w-0">
              <FadeInItem className="order-2 lg:order-1 min-w-0">
                <div className="card-subtle p-5 md:p-6">
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
              <div className="order-1 lg:order-2 min-w-0">
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

        {/* Who is it for */}
        <section className="section section-compact section-alt section-bg-pattern section-bg-gradient-alt text-center">
          <div className="page-inner min-w-0">
            <FadeIn className="mx-auto max-w-2xl text-center mb-6">
              <p className="eyebrow mb-3">Who it’s for</p>
              <h2 className="heading-lg"><span className="text-[var(--brand)]">Homeowners</span> and growing <span className="text-[var(--brand)]">studios</span></h2>
            </FadeIn>
            <WhoItsForIllo />
            <StaggerChildren className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mt-4">
              <FadeInItem className="card p-6 md:p-8">
                <p className="eyebrow mb-3">Customers</p>
                <h3 className="heading-md mb-3">Plan Budgets, Choose Vetted Designers</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Track milestones, protect payments, and keep project documents in one secure place.
                </p>
              </FadeInItem>
              <FadeInItem className="card p-6 md:p-8">
                <p className="eyebrow mb-3">Interior Designers</p>
                <h3 className="heading-md mb-3">Manage Leads and Approvals</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Milestone payments, client communication, and project execution in one place.
                </p>
              </FadeInItem>
            </StaggerChildren>
          </div>
        </section>

        {/* Trusted by — logo strip */}
        <section className="section section-compact section-bg-pattern-light section-bg-gradient-light text-center">
          <div className="page-inner min-w-0">
            <FadeIn className="mx-auto max-w-3xl text-center">
              <p className="eyebrow mb-2 text-[var(--text-muted)]">Trusted by</p>
              <h2 className="heading-lg mb-10">
                <span className="text-[var(--brand)]">Growing</span> studios
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-12">
                {firms.map((firm) => (
                  <div
                    key={firm.id}
                    className="flex items-center gap-3 shrink-0 rounded-xl px-4 py-2.5 border border-[var(--border)] bg-white/80 shadow-sm hover:shadow-md hover:border-[var(--border-strong)] transition-all"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${firm.logoBg} text-white text-xs font-semibold tracking-tight`}
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

        {/* Trust built in — full section (no card) */}
        <section className="section section-compact bg-[var(--foreground-deep)] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--brand)]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden />
          <div className="page-inner relative min-w-0">
            <FadeIn className="relative w-full flex flex-col items-center min-w-0">
                <div className="w-full max-w-2xl text-center mb-8 md:mb-12 px-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 text-center tracking-tight">
                    <span className="text-white">Clarity first.</span>{" "}
                    <span className="text-[var(--accent-blush)]">Trust built in.</span>
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-center max-w-lg mx-auto">
                    How we keep your interior journey transparent and secure.
                  </p>
                </div>
                <div className="w-full grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 min-w-0" data-trust-grid>
                  <div className="trust-item flex flex-col items-center rounded-2xl bg-white/[0.08] p-5 sm:p-6 text-center backdrop-blur-sm border border-white/15 transition-all hover:bg-white/[0.12] hover:border-white/25 hover:scale-[1.02]">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[var(--brand-light)]">
                      <Calculator className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">AI Cost Estimates</h3>
                    <p className="text-xs text-slate-400 leading-snug">City and pincode-specific cost ranges.</p>
                  </div>
                  <div className="trust-item flex flex-col items-center rounded-2xl bg-white/[0.08] p-5 sm:p-6 text-center backdrop-blur-sm border border-white/15 transition-all hover:bg-white/[0.12] hover:border-white/25 hover:scale-[1.02]">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[var(--brand-light)]">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">AI Visualizations</h3>
                    <p className="text-xs text-slate-400 leading-snug">Coming soon — visualize your space.</p>
                  </div>
                  <div className="trust-item flex flex-col items-center rounded-2xl bg-white/[0.08] p-5 sm:p-6 text-center backdrop-blur-sm border border-white/15 transition-all hover:bg-white/[0.12] hover:border-white/25 hover:scale-[1.02]">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[var(--brand-light)]">
                      <BadgeCheck className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">Verified Designers</h3>
                    <p className="text-xs text-slate-400 leading-snug">Every designer reviewed before listing.</p>
                  </div>
                  <div className="trust-item flex flex-col items-center rounded-2xl bg-white/[0.08] p-5 sm:p-6 text-center backdrop-blur-sm border border-white/15 transition-all hover:bg-white/[0.12] hover:border-white/25 hover:scale-[1.02]">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[var(--brand-light)]">
                      <ClipboardCheck className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">Project Tracking</h3>
                    <p className="text-xs text-slate-400 leading-snug">Milestone approvals and photo updates.</p>
                  </div>
                  <div className="trust-item flex flex-col items-center rounded-2xl bg-white/[0.08] p-5 sm:p-6 text-center backdrop-blur-sm border border-white/15 transition-all hover:bg-white/[0.12] hover:border-white/25 hover:scale-[1.02]">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[var(--brand-light)]">
                      <Lock className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">Escrow Payments</h3>
                    <p className="text-xs text-slate-400 leading-snug">Release only when you approve.</p>
                  </div>
                  <div className="trust-item flex flex-col items-center rounded-2xl bg-white/[0.08] p-5 sm:p-6 text-center backdrop-blur-sm border border-white/15 transition-all hover:bg-white/[0.12] hover:border-white/25 hover:scale-[1.02]">
                    <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[var(--brand-light)]">
                      <FileText className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">Digital Twin</h3>
                    <p className="text-xs text-slate-400 leading-snug">Plans and handover in one vault.</p>
                  </div>
                </div>
            </FadeIn>
          </div>
        </section>

        {/* Chat with our team — above footer */}
        <section id="contact" className="section section-compact relative">
          <div className="page-inner min-w-0 overflow-hidden">
            <FadeIn className="overflow-hidden rounded-2xl border border-[var(--foreground)]/20 bg-[var(--foreground-deep)] shadow-2xl">
              <div className="grid md:grid-cols-2 min-h-[440px]">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <p className="eyebrow text-slate-400 mb-2">Contact</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Chat With Our Team</h2>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                    Need help or a demo? Get in touch and we&apos;ll get back within 24 hours.
                  </p>
                  <ContactForm />
                </div>
                <div className="relative min-h-[280px] md:min-h-0 bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                    alt="Modern interior design"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" aria-hidden />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      </LandingScrollAnimations>

      {/* Footer — Reach us (from admin) + Links + Social */}
      <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] min-w-0 overflow-x-hidden">
        <div className="page-inner py-10 md:py-12 min-w-0">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Interior OS</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Interior infrastructure for modern Indian homes — budgeting, verified designers, and document vault.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Links</h4>
              <div className="flex flex-col gap-2 text-sm">
                {footerLinks.map((link) => (
                  <Link key={link.label} href={link.url} className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Reach us</h4>
              <div className="flex flex-col gap-2 text-sm">
                {settings.contactEmail ? (
                  <a href={`mailto:${settings.contactEmail}`} className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {settings.contactEmail}
                  </a>
                ) : null}
                {settings.contactPhone ? (
                  <a href={`tel:${settings.contactPhone.replace(/\D/g, "")}`} className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
                    <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                    {settings.contactPhone}
                  </a>
                ) : null}
                {settings.contactAddress ? (
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {settings.contactAddress}
                  </span>
                ) : null}
                {!settings.contactEmail && !settings.contactPhone && !settings.contactAddress ? (
                  <p className="text-xs text-[var(--text-subtle)]">Set contact info in Admin → Settings.</p>
                ) : null}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Social</h4>
              <div className="flex flex-col gap-2 text-sm">
                {socialLinks.length === 0 ? (
                  <p className="text-xs text-[var(--text-subtle)]">Configure social links in admin.</p>
                ) : (
                  socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
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
