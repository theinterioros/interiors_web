"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import CitySelect from "@/components/ui/CitySelect";
import EstimatorResultSummary from "@/components/estimator/EstimatorResultSummary";
import ValidatedPincodeInput from "@/components/ui/ValidatedPincodeInput";
import { validateEmail, validatePhoneIndia, sanitizePhoneInputLive, PHONE_ERROR, EMAIL_ERROR } from "@/lib/validation";
import { ESTIMATOR_AREA_OPTIONS } from "@/lib/estimator-types";
import type { EstimatorApiData } from "@/lib/estimator-types";
import { Zap, X, Upload, ChevronRight, ChevronLeft, MapPin, Home, User, Palette } from "lucide-react";

type EstimatorFormProps = {
  variant?: "default" | "inline";
  /** When true, user is logged in as customer: show full breakdown and dashboard CTA instead of sign-up CTA */
  isLoggedInCustomer?: boolean;
};

const STEPS = [
  { id: 1, title: "Property location", short: "Location", icon: MapPin },
  { id: 2, title: "Property details", short: "Property", icon: Home },
  { id: 3, title: "Scope & finishes", short: "Scope", icon: Palette },
  { id: 4, title: "Your contact", short: "Contact", icon: User },
] as const;

export default function EstimatorForm({ variant = "default", isLoggedInCustomer = false }: EstimatorFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [result, setResult] = useState<EstimatorApiData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isInline = variant === "inline";

  const phoneResult = phone ? validatePhoneIndia(phone) : null;
  const phoneInvalid = phoneTouched && phone && !(phoneResult?.valid);
  const emailResult = email ? validateEmail(email) : null;
  const emailInvalid = emailTouched && email && !(emailResult?.valid);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = sanitizePhoneInputLive(e.target.value);
    setPhone(next);
    if (next) setPhoneTouched(true);
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\s/g, "");
    setEmail(raw);
    if (raw) setEmailTouched(true);
  }

  function handleEmailBlur() {
    const trimmed = email.trim().toLowerCase();
    if (trimmed !== email) setEmail(trimmed);
    setEmailTouched(true);
  }

  function canGoNext(): boolean {
    if (!formRef.current) return true;
    const form = formRef.current;
    if (step === 1) {
      const city = (form.querySelector('[name="city"]') as HTMLInputElement)?.value?.trim();
      const pincodeRaw = (form.querySelector('[name="pincode"]') as HTMLInputElement)?.value?.trim() ?? "";
      return Boolean(city) && /^\d{6}$/.test(pincodeRaw);
    }
    if (step === 2) {
      const configuration = (form.querySelector('[name="configuration"]') as HTMLSelectElement)?.value;
      const carpetArea = (form.querySelector('[name="carpetArea"]') as HTMLInputElement)?.value?.trim();
      const areaUnit = (form.querySelector('[name="areaUnit"]') as HTMLSelectElement)?.value || "sqft";
      const area = Number(carpetArea);
      const minArea = areaUnit === "sqyd" ? 12 : areaUnit === "sqm" ? 10 : 100;
      return !!configuration && !!carpetArea && !Number.isNaN(area) && area >= minArea;
    }
    if (step === 3) {
      const checked = form.querySelectorAll('input[name="areas"]:checked').length;
      return checked > 0;
    }
    return true;
  }

  function handleNext() {
    setError("");
    if (step === 1 && !canGoNext()) {
      setError("Please select your city and enter a valid 6-digit pincode.");
      return;
    }
    if (step === 2 && !canGoNext()) {
      setError("Please select configuration and enter carpet area (min 100 sq.ft or equivalent).");
      return;
    }
    if (step === 3 && !canGoNext()) {
      setError("Select at least one area for interiors (e.g. kitchen, wardrobes).");
      return;
    }
    setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setShowModal(false);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const emailRaw = String(formData.get("email") ?? "").trim();
    const phoneRaw = String(formData.get("phone") ?? "");

    const emailResult = validateEmail(emailRaw);
    if (!emailResult.valid) {
      setError(EMAIL_ERROR);
      setEmailTouched(true);
      return;
    }
    const phoneResult = validatePhoneIndia(phoneRaw);
    if (!phoneResult.valid) {
      setError(PHONE_ERROR);
      setPhoneTouched(true);
      return;
    }

    setLoading(true);
    const area = Number(formData.get("carpetArea"));
    const areaUnit = String(formData.get("areaUnit") ?? "sqft");
    const configuration = String(formData.get("configuration") || "2BHK");
    const propertyTypeRaw = String(formData.get("propertyType") || "flat");
    const propertyType = propertyTypeRaw === "villa" ? "villa" : "apartment";
    const areas = formData.getAll("areas").map((v) => String(v));
    const interiorTier = String(formData.get("interiorTier") ?? "standard");
    const material = String(formData.get("material") ?? "laminate");
    const possession = String(formData.get("possession") ?? "ready");
    const budgetNoteRaw = String(formData.get("budgetNote") ?? "").trim();

    const payload = {
      name,
      email: emailResult.sanitized,
      phone: phoneResult.sanitized,
      city: formData.get("city"),
      pincode: formData.get("pincode") ?? "",
      area: Math.max(0, area),
      areaUnit: areaUnit === "sqyd" ? "sqyd" : areaUnit === "sqm" ? "sqm" : "sqft",
      propertyType,
      bhk: configuration,
      interiorTier,
      material,
      possession,
      areas,
      ...(budgetNoteRaw ? { budgetNote: budgetNoteRaw } : {}),
    };

    try {
      const response = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to estimate.");
      }
      setResult(data);
      setShowModal(true);

      // Used to prefill the detailed estimator after sign-in.
      // Only stores the input fields needed by /api/estimator (no contact details).
      if (typeof window !== "undefined") {
        try {
          const prefill = {
            payload: {
              city: String(payload.city ?? "").trim(),
              pincode: String(payload.pincode ?? "").trim(),
              area: payload.area,
              areaUnit: payload.areaUnit,
              propertyType: payload.propertyType,
              bhk: payload.bhk,
              interiorTier: payload.interiorTier,
              material: payload.material,
              possession: payload.possession,
              areas: payload.areas,
              ...(payload.budgetNote ? { budgetNote: payload.budgetNote } : {}),
            },
            result: data as EstimatorApiData,
            version: 1,
          };
          localStorage.setItem("io_estimator_landing_prefill_v1", JSON.stringify(prefill));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to estimate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={isInline ? "w-full min-w-0" : "w-full min-w-0 max-w-2xl"}>
        <form ref={formRef} onSubmit={handleSubmit} className="w-full min-w-0">
          <div className="rounded-2xl border border-[var(--border)] bg-white shadow-lg overflow-visible">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 sm:px-8 py-4 border-b border-[var(--border)] bg-[var(--surface-subtle)]/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Get Cost Estimate</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    Tell us about your home — we use AI and local benchmarks for a clear estimate.
                  </p>
              </div>
            </div>

            {/* Step indicator — full-width bar + clear step labels */}
            <div className="px-6 sm:px-8 py-4 border-b border-[var(--border)] bg-[var(--surface-subtle)]/50">
              <div className="relative h-2 w-full rounded-full bg-[var(--border)] overflow-hidden mb-3">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[var(--brand)] transition-all duration-300 ease-out"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
              <div className="flex justify-between gap-2">
                {STEPS.map((s) => {
                  const isActive = step === s.id;
                  const isComplete = step > s.id;
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        className={`flex shrink-0 items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                          isActive
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : isComplete
                              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                              : "border-[var(--border)] bg-white text-[var(--text-muted)]"
                        }`}
                      >
                        {isComplete ? (
                          <span className="text-white text-xs font-bold" aria-hidden>✓</span>
                        ) : (
                          <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[var(--text-muted)]"}`} aria-hidden />
                        )}
                      </div>
                      <span
                        className={`mt-1.5 text-xs font-medium text-center truncate w-full ${
                          isActive ? "text-[var(--brand)]" : isComplete ? "text-[var(--foreground)]" : "text-[var(--text-muted)]"
                        }`}
                      >
                        {s.short}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step content — natural height per step */}
            <div className="px-6 sm:px-8 py-5 sm:py-6 min-h-[180px] transition-[min-height] duration-300 ease-out">
              {/* Step 1: Location */}
              <div
                className={step === 1 ? "block" : "hidden"}
                role="tabpanel"
                aria-labelledby="step-1-heading"
                aria-hidden={step !== 1}
              >
                <div className="mb-4">
                  <h3 id="step-1-heading" className="text-base font-semibold text-[var(--foreground)] mb-0.5">Property location</h3>
                  <p className="text-sm text-[var(--text-muted)]">City and pincode help tailor pricing.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="estimator-city" className="block text-sm font-medium text-[var(--foreground)]">City</label>
                    <CitySelect id="estimator-city" name="city" required placeholder="Select city" className="input w-full" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="estimator-pincode" className="block text-sm font-medium text-[var(--foreground)]">
                      Pincode
                    </label>
                    <ValidatedPincodeInput
                      id="estimator-pincode"
                      name="pincode"
                      placeholder="e.g. 500001"
                      className="input w-full max-w-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Property details */}
              <div
                className={step === 2 ? "block" : "hidden"}
                role="tabpanel"
                aria-labelledby="step-2-heading"
                aria-hidden={step !== 2}
              >
                <div className="mb-4">
                  <h3 id="step-2-heading" className="text-base font-semibold text-[var(--foreground)] mb-0.5">Property details</h3>
                  <p className="text-sm text-[var(--text-muted)]">Size and layout help calibrate scope and cost.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <label htmlFor="estimator-propertyType" className="block text-sm font-medium text-[var(--foreground)]">Property type</label>
                    <select id="estimator-propertyType" name="propertyType" className="input w-full min-w-0">
                      <option value="flat">Flat</option>
                      <option value="independent">Independent house</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <label htmlFor="estimator-configuration" className="block text-sm font-medium text-[var(--foreground)]">Configuration</label>
                    <select id="estimator-configuration" name="configuration" className="input w-full min-w-0" required>
                      <option value="1BHK">1 BHK</option>
                      <option value="2BHK">2 BHK</option>
                      <option value="3BHK">3 BHK</option>
                      <option value="4BHK">4 BHK</option>
                      <option value="5BHK">5+ BHK</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:col-span-2 min-w-0">
                    <div className="space-y-1.5 min-w-0">
                      <label htmlFor="estimator-carpetArea" className="block text-sm font-medium text-[var(--foreground)]">Carpet area</label>
                      <input
                        id="estimator-carpetArea"
                        name="carpetArea"
                        type="number"
                        min={1}
                        required
                        placeholder="e.g. 1200"
                        className="input w-full"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <label htmlFor="estimator-areaUnit" className="block text-sm font-medium text-[var(--foreground)]">Unit</label>
                      <select id="estimator-areaUnit" name="areaUnit" className="input w-full min-w-0" defaultValue="sqft">
                        <option value="sqft">Sq.ft</option>
                        <option value="sqyd">Sq.yd</option>
                        <option value="sqm">Sq.m</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] sm:col-span-2 -mt-1">Min 100 sq.ft equivalent (e.g. 100 sq.ft, 12 sq.yd, 10 sq.m)</p>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-[var(--foreground)]">Floor plan (optional)</label>
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" id="estimator-floorPlan" name="floorPlan" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-subtle)]/50 text-[var(--text-muted)] hover:border-[var(--brand)]/40 hover:bg-[var(--brand-light)]/20 hover:text-[var(--foreground)] transition-colors text-sm font-medium"
                    >
                      <Upload className="h-5 w-5 shrink-0" />
                      Upload PDF, PNG or JPG
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Scope & finishes */}
              <div
                className={step === 3 ? "block" : "hidden"}
                role="tabpanel"
                aria-labelledby="step-3-heading"
                aria-hidden={step !== 3}
              >
                <div className="mb-4">
                  <h3 id="step-3-heading" className="text-base font-semibold text-[var(--foreground)] mb-0.5">
                    Scope & finishes
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    What you want done, material quality, and timeline drivers. Estimates use AI; data is processed securely.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="estimator-interiorTier" className="block text-sm font-medium text-[var(--foreground)]">
                      Interior type
                    </label>
                    <select id="estimator-interiorTier" name="interiorTier" className="input w-full" required defaultValue="standard">
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <span className="block text-sm font-medium text-[var(--foreground)]">Areas required</span>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/40 p-3">
                      {ESTIMATOR_AREA_OPTIONS.map((opt) => (
                        <label
                          key={opt.key}
                          className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer"
                        >
                          <input type="checkbox" name="areas" value={opt.key} defaultChecked className="rounded border-[var(--border)]" />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="estimator-material" className="block text-sm font-medium text-[var(--foreground)]">
                      Material preference
                    </label>
                    <select id="estimator-material" name="material" className="input w-full" required defaultValue="laminate">
                      <option value="laminate">Laminate</option>
                      <option value="acrylic">Acrylic</option>
                      <option value="pu_finish">PU finish</option>
                      <option value="veneer">Veneer</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="estimator-possession" className="block text-sm font-medium text-[var(--foreground)]">
                      Possession status
                    </label>
                    <select id="estimator-possession" name="possession" className="input w-full" required defaultValue="ready">
                      <option value="ready">Ready</option>
                      <option value="under_construction">Under construction</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="estimator-budgetNote" className="block text-sm font-medium text-[var(--foreground)]">
                      Budget expectation <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                    </label>
                    <input
                      id="estimator-budgetNote"
                      name="budgetNote"
                      placeholder="e.g. around 15 lakhs"
                      className="input w-full"
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Contact */}
              <div
                className={step === 4 ? "block" : "hidden"}
                role="tabpanel"
                aria-labelledby="step-4-heading"
                aria-hidden={step !== 4}
              >
                <div className="mb-4">
                  <h3 id="step-4-heading" className="text-base font-semibold text-[var(--foreground)] mb-0.5">Your contact</h3>
                  <p className="text-sm text-[var(--text-muted)]">Share your contact to receive your estimate. Create a free account later for a detailed breakdown and to connect with verified designers.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3 space-y-1.5">
                    <label htmlFor="estimator-name" className="block text-sm font-medium text-[var(--foreground)]">Full name</label>
                    <input
                      id="estimator-name"
                      name="name"
                      required
                      placeholder="e.g. Priya Sharma"
                      className="input w-full"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1.5">
                    <label htmlFor="estimator-phone" className="block text-sm font-medium text-[var(--foreground)]">Phone</label>
                    <input
                      id="estimator-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={() => setPhoneTouched(true)}
                      placeholder="e.g. 9876543210 or +91 98765 43210"
                      className={`input w-full ${phoneInvalid ? "border-red-500 focus:border-red-500" : ""}`}
                      aria-invalid={phoneInvalid ? true : undefined}
                      aria-describedby={phoneInvalid ? "estimator-phone-error" : undefined}
                    />
                    {phoneInvalid && (
                      <p id="estimator-phone-error" className="text-sm text-red-600" role="alert">
                        {PHONE_ERROR}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-3 space-y-1.5">
                    <label htmlFor="estimator-email" className="block text-sm font-medium text-[var(--foreground)]">Email</label>
                    <input
                      id="estimator-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      placeholder="priya@example.com"
                      className={`input w-full ${emailInvalid ? "border-red-500 focus:border-red-500" : ""}`}
                      aria-invalid={emailInvalid ? true : undefined}
                      aria-describedby={emailInvalid ? "estimator-email-error" : undefined}
                    />
                    {emailInvalid && (
                      <p id="estimator-email-error" className="text-sm text-red-600" role="alert">
                        {EMAIL_ERROR}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inline error above buttons when present */}
            {error && (
              <div className="px-6 sm:px-8 pt-2">
                <p className="text-sm text-red-600 font-medium rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 border border-red-200 dark:border-red-800">
                  {error}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-5 border-t border-[var(--border)] bg-[var(--surface-subtle)]/30">
              <div className="min-w-0">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                    className="btn btn-ghost inline-flex items-center gap-2 text-sm font-medium py-2.5"
                  >
                    <ChevronLeft className="h-4 w-4 shrink-0" />
                    Back
                  </button>
                ) : (
                  <span />
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4" />
                    {loading ? "Estimating…" : "Get Instant Estimate"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
        <p className="text-xs text-[var(--text-muted)] text-center mt-3">Free, no obligations. Results in under 10 seconds.</p>
      </div>

      {/* Result modal — lead-gen for guests; full breakdown + dashboard CTA for logged-in customers */}
      {showModal && result && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75"
          aria-modal="true"
          role="dialog"
          aria-labelledby="estimate-result-title"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 id="estimate-result-title" className="text-xl font-semibold text-[var(--foreground)] mb-2 pr-10">
              Your estimate
            </h3>
            <div className="mb-5">
              <EstimatorResultSummary
                result={result}
                showSource={isLoggedInCustomer}
                variant={isLoggedInCustomer ? "breakdownOnly" : "rangeOnly"}
              />
            </div>
            {isLoggedInCustomer ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/customer/dashboard"
                  className="block w-full py-3 rounded-xl bg-[var(--brand)] text-white font-semibold text-center hover:opacity-90 transition-opacity"
                >
                  Go to dashboard
                </Link>
                <Link
                  href="/designers"
                  className="block w-full py-3 rounded-xl border-2 border-[var(--brand)] text-[var(--brand)] font-semibold text-center hover:bg-[var(--brand-light)] transition-colors"
                >
                  Browse designers
                </Link>
              </div>
            ) : (
              <a
                href="/login?role=customer&redirect=/customer/estimator"
                className="block w-full py-3 rounded-xl border-2 border-[var(--brand)] text-[var(--brand)] font-semibold text-center hover:bg-[var(--brand-light)] transition-colors"
              >
                Sign in to view detailed cost breakdown
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
