"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { useState, useRef } from "react";
import ValidatedEmailInput from "@/components/ui/ValidatedEmailInput";
import ValidatedPhoneInput from "@/components/ui/ValidatedPhoneInput";

const DESIGNER_STEPS = [
  { step: 1, label: "Account" },
  { step: 2, label: "Your firm" },
  { step: 3, label: "Business" },
  { step: 4, label: "About" },
  { step: 5, label: "Portfolio" },
] as const;
const DESIGNER_MAX_STEP = 5;

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="btn btn-primary w-full py-3 rounded-xl font-medium disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Please wait...
        </>
      ) : (
        label
      )}
    </button>
  );
}

export default function AuthRegisterForm({ fixedRole }: { fixedRole?: "CUSTOMER" | "FIRM" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorFromUrl = searchParams.get("error");
  const [role, setRole] = useState<"CUSTOMER" | "FIRM">(fixedRole ?? "CUSTOMER");
  const [portfolioError, setPortfolioError] = useState("");
  const [serverError, setServerError] = useState("");
  const [designerStep, setDesignerStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);

  const effectiveRole = fixedRole ?? role;
  const displayError = serverError || errorFromUrl;

  const isDesigner = effectiveRole === "FIRM";

  const handleSubmit = () => {
    setServerError("");
    setPortfolioError("");
  };

  const handleAction = async (formData: FormData): Promise<void> => {
    const result = await registerAction(undefined, formData);
    if (result?.redirect) {
      router.push(result.redirect);
      return;
    }
    if (result?.error) {
      setServerError(result.error);
    }
  };

  /** Validate required fields inside the current step container; return true if valid. */
  const validateCurrentStep = (): boolean => {
    if (!formRef.current) return false;
    const stepEl = formRef.current.querySelector(`[data-step="${designerStep}"]`);
    if (!stepEl) return true;
    const required = stepEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[required]");
    for (const el of required) {
      const v = ("value" in el ? el.value : (el as HTMLTextAreaElement).value)?.trim?.() ?? "";
      if (!v) {
        el.focus();
        setServerError("Please fill in all required fields in this step.");
        return false;
      }
      const minLen = el.getAttribute("minlength");
      if (minLen && v.length < parseInt(minLen, 10)) {
        el.focus();
        setServerError(`Please enter at least ${minLen} characters.`);
        return false;
      }
    }
    setServerError("");
    return true;
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) setDesignerStep((s) => Math.min(s + 1, DESIGNER_MAX_STEP));
  };

  const goBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setDesignerStep((s) => Math.max(s - 1, 1));
    setServerError("");
  };

  return (
<form
        ref={formRef}
        action={handleAction}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {isDesigner && (
          <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]/80 px-4 py-5 sm:px-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Step {designerStep} of {DESIGNER_MAX_STEP}
            </p>
            {/* Progress bar: full width, no layout dependency on step count */}
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all duration-300 ease-out"
                style={{ width: `${(designerStep / DESIGNER_MAX_STEP) * 100}%` }}
              />
            </div>
            {/* Step pills: grid so each step has equal space and never wraps awkwardly */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {DESIGNER_STEPS.map(({ step, label }) => {
                const isActive = designerStep === step;
                const isCompleted = designerStep > step;
                return (
                  <div
                    key={step}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-200 sm:h-9 sm:w-9 sm:text-sm ${
                        isCompleted
                          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                          : isActive
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white ring-2 ring-[var(--brand-light)] ring-offset-2 ring-offset-[var(--surface-subtle)]"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} /> : step}
                    </div>
                    <span
                      className={`max-w-full truncate text-center text-[10px] font-medium sm:text-xs ${
                        isActive ? "text-[var(--foreground)]" : isCompleted ? "text-[var(--brand)]" : "text-[var(--text-muted)]"
                      }`}
                      title={label}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      {/* Step 1: Account (designer) or full form (customer) */}
      <div
        data-step="1"
        className={isDesigner && designerStep !== 1 ? "hidden" : undefined}
      >
        <div className={isDesigner ? "lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0" : "space-y-5"}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">
                {isDesigner ? "Your name (primary contact)" : "Name"}
              </label>
              <input type="text" name="name" required className="input w-full" placeholder={isDesigner ? "Full name" : undefined} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Mobile number {isDesigner ? "(required)" : "(optional)"}
              </label>
              <ValidatedPhoneInput name="phone" required={isDesigner} placeholder="10-digit mobile" className="input w-full" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
              <ValidatedEmailInput name="email" placeholder="you@example.com" className="input w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Password</label>
              <input
                type="password"
                name="password"
                required
                autoComplete="new-password"
                className="input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                autoComplete="new-password"
                className="input w-full"
              />
            </div>
          </div>
        </div>
        {fixedRole ? (
          <input type="hidden" name="role" value={fixedRole} />
        ) : (
          <div className="space-y-2 mt-5">
            <label className="text-sm font-medium text-[var(--foreground)]">Role</label>
            <select
              name="role"
              value={effectiveRole}
              onChange={(e) => {
                setRole(e.target.value as "CUSTOMER" | "FIRM");
                setPortfolioError("");
                if ((e.target.value as "CUSTOMER" | "FIRM") === "FIRM") setDesignerStep(1);
              }}
              className="input w-full"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="FIRM">Interior firm</option>
            </select>
          </div>
        )}
      </div>

      {isDesigner && (
        <div className="space-y-8 pt-1">
          <div className="rounded-xl bg-[var(--surface-subtle)]/60 border border-[var(--border)]/80 px-4 py-3.5">
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
              Your profile will be reviewed before going live. Fill each section in order. Fields marked with * are required; others are optional.
            </p>
          </div>

          {/* Single-column flow: Firm → Business → About → Portfolio → Comments */}

          {/* Step 2: Your firm */}
          <div data-step="2" className={designerStep !== 2 ? "hidden" : undefined}>
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">1. Your firm</h3>
            <p className="text-xs text-[var(--text-muted)]">Business name and location. This helps customers find you.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Firm name <span className="text-red-500/90" aria-hidden>*</span>
                </label>
                <input type="text" name="firmName" required placeholder="e.g. Studio Nirmaan" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Firm owner or contact name <span className="text-red-500/90" aria-hidden>*</span>
                </label>
                <input type="text" name="ownerName" required placeholder="Same as above or business contact" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Alternate mobile (optional)</label>
                <ValidatedPhoneInput name="altPhone" placeholder="10-digit" className="input w-full" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Office address <span className="text-red-500/90" aria-hidden>*</span>
                </label>
                <input type="text" name="officeAddress" required placeholder="Street, area, landmark" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  City <span className="text-red-500/90" aria-hidden>*</span>
                </label>
                <input type="text" name="city" required placeholder="e.g. Mumbai" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Pincode <span className="text-red-500/90" aria-hidden>*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="e.g. 400001"
                  className="input w-full"
                  minLength={6}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  title="6-digit Indian pincode"
                />
              </div>
            </div>
          </section>
          </div>

          {/* Step 3: Business */}
          <div data-step="3" className={designerStep !== 3 ? "hidden" : undefined}>
          <section className="space-y-4 pt-6 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">2. Business</h3>
            <p className="text-xs text-[var(--text-muted)]">Type, experience and scale. Used for approval and customer trust.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Business type</label>
                <select name="businessType" className="input w-full" defaultValue="Residential">
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Experience (years) <span className="text-red-500/90" aria-hidden>*</span>
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  min={0}
                  max={99}
                  required
                  placeholder="e.g. 5"
                  className="input w-full"
                  title="Years in interior design"
                />
                <p className="text-xs text-[var(--text-muted)]">Years in interior design</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Typical project size</label>
                <select name="ticketSize" className="input w-full" defaultValue="0-5 lakhs">
                  <option value="0-5 lakhs">0–5 lakhs</option>
                  <option value="5-10 lakhs">5–10 lakhs</option>
                  <option value="10-15 lakhs">10–15 lakhs</option>
                  <option value="15-20 lakhs">15–20 lakhs</option>
                  <option value="20-25 lakhs">20–25 lakhs</option>
                  <option value="25-35 lakhs">25–35 lakhs</option>
                  <option value="35+ lakhs">35 lakhs+</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Designers in team (optional)</label>
                <input type="number" name="designersCount" min={0} max={99} placeholder="0" className="input w-full" defaultValue={0} />
              </div>
              <div className="space-y-2 sm:col-span-2 sm:max-w-xs">
                <label className="text-sm font-medium text-[var(--foreground)]">GST number (optional)</label>
                <input type="text" name="gst" placeholder="15-character GSTIN" className="input w-full" maxLength={15} />
              </div>
            </div>
          </section>
          </div>

          {/* Step 4: About your work */}
          <div data-step="4" className={designerStep !== 4 ? "hidden" : undefined}>
          <section className="space-y-4 pt-6 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">3. About your work</h3>
            <p className="text-xs text-[var(--text-muted)]">This appears on your public profile. Describe your services and approach.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  About your firm <span className="text-red-500/90" aria-hidden>*</span>
                </label>
                <textarea
                  name="about"
                  required
                  minLength={50}
                  rows={4}
                  placeholder="Describe your services, specialisations and design approach. Minimum 50 characters."
                  className="input w-full resize-y min-h-[100px]"
                  title="At least 50 characters"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Comments for review team (optional)</label>
                <textarea
                  name="comments"
                  rows={2}
                  placeholder="Anything else you want the review team to know"
                  className="input w-full resize-y min-h-[72px]"
                />
              </div>
            </div>
          </section>
          </div>

          {/* Step 5: Portfolio (optional) */}
          <div data-step="5" className={designerStep !== 5 ? "hidden" : undefined}>
          <section className="space-y-4 pt-6 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">4. Portfolio project (optional)</h3>
            <p className="text-xs text-[var(--text-muted)]">Add one project with up to 5 images now, or skip and add from Profile → Portfolio after signup.</p>
            <div className="space-y-3 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-subtle)]/40 px-4 py-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Project title</label>
                <input type="text" name="portfolioProjectTitle" maxLength={120} placeholder="e.g. Living room makeover" className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Short description</label>
                <textarea name="portfolioProjectDescription" rows={2} maxLength={500} placeholder="Brief description of this project" className="input w-full resize-y" />
              </div>
              <p className="text-xs text-[var(--text-muted)]">Add up to 5 images; each can have a title (max 50 characters).</p>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-wrap items-end gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-0.5">Image {i}</label>
                    <input type="file" name={`portfolioImage${i}`} accept="image/jpeg,image/png,image/webp" className="input w-full text-sm" />
                  </div>
                  <div className="w-36 sm:w-44">
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-0.5">Title (50 chars)</label>
                    <input type="text" name={`portfolioImageTitle${i}`} maxLength={50} placeholder="e.g. Living area" className="input w-full" />
                  </div>
                </div>
              ))}
              {portfolioError && (
                <p id="portfolio-error" className="text-sm text-red-600" role="alert">
                  {portfolioError}
                </p>
              )}
            </div>
          </section>
          </div>
        </div>
      )}

      {displayError && (
        <p className="text-sm text-red-600 rounded-xl bg-red-50 dark:bg-red-950/30 px-4 py-2.5 border border-red-100 dark:border-red-900/40" role="alert">
          {displayError}
        </p>
      )}
      <div className="pt-1 flex flex-wrap items-center gap-3">
        {isDesigner ? (
          <>
            {designerStep > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {designerStep < DESIGNER_MAX_STEP ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <SubmitButton label="Create designer account" disabled={false} />
            )}
          </>
        ) : (
          <SubmitButton label="Create account" disabled={false} />
        )}
      </div>
    </form>
  );
}
