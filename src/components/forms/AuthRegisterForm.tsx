"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { useState, useRef } from "react";
import ValidatedEmailInput from "@/components/ui/ValidatedEmailInput";
import ValidatedPhoneInput from "@/components/ui/ValidatedPhoneInput";
import { validatePortfolioFile } from "@/lib/validation";

const ACCEPT_PORTFOLIO = ".pdf,image/jpeg,image/png,image/webp";

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
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const effectiveRole = fixedRole ?? role;
  const displayError = serverError || errorFromUrl;

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const result = validatePortfolioFile(file);
    setPortfolioError(result.valid ? "" : result.error);
  };

  const hasPortfolioError = Boolean(portfolioError);

  const isDesigner = effectiveRole === "FIRM";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setServerError("");
    if (isDesigner && portfolioInputRef.current?.files?.length) {
      const result = validatePortfolioFile(portfolioInputRef.current.files[0]);
      if (!result.valid) {
        e.preventDefault();
        setPortfolioError(result.error);
        portfolioInputRef.current.focus();
      }
    }
  };

  const handleAction = async (formData: FormData) => {
    const result = await registerAction(undefined, formData);
    if (result?.redirect) {
      router.push(result.redirect);
      return;
    }
    if (result?.error) {
      setServerError(result.error);
    }
    return result;
  };

  return (
    <form
      action={handleAction}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Account fields: 2-col on lg for designer to use width */}
      <div className={isDesigner ? "lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0" : "space-y-5"}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {isDesigner ? "Contact person name" : "Name"}
            </label>
            <input type="text" name="name" required className="input w-full" />
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Role</label>
          <select
            name="role"
            value={effectiveRole}
            onChange={(e) => {
              setRole(e.target.value as "CUSTOMER" | "FIRM");
              setPortfolioError("");
            }}
            className="input w-full"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="FIRM">Interior firm</option>
          </select>
        </div>
      )}

      {isDesigner && (
        <div className="space-y-8 pt-1">
          <div className="rounded-xl bg-[var(--surface-subtle)]/60 border border-[var(--border)]/80 px-4 py-3.5">
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
              Your profile will be reviewed by our team before going live. You can add more portfolio items after signup.
            </p>
            <p className="text-xs text-[var(--text-subtle)] mt-2 font-medium">
              All fields below are required unless marked optional.
            </p>
          </div>

          {/* Designer sections: 2-col on lg to use width and reduce scroll */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
            {/* Left column: Your firm + Business */}
            <div className="space-y-8">
          {/* Section: Your firm */}
          <section className="space-y-4">
            <div className="pb-0.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                Your firm
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Basic business and contact details</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Firm name <span className="text-red-500/90 font-normal" aria-hidden>*</span>
                </label>
                <input type="text" name="firmName" required placeholder="e.g. Studio Nirmaan" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Owner / contact name <span className="text-red-500/90 font-normal" aria-hidden>*</span>
                </label>
                <input type="text" name="ownerName" required placeholder="Full name" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Alternate mobile</label>
                <ValidatedPhoneInput name="altPhone" placeholder="10-digit (optional)" className="input w-full" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Office address <span className="text-red-500/90 font-normal" aria-hidden>*</span>
                </label>
                <input type="text" name="officeAddress" required placeholder="Street, area, landmark" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  City <span className="text-red-500/90 font-normal" aria-hidden>*</span>
                </label>
                <input type="text" name="city" required placeholder="e.g. Mumbai" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Pincode <span className="text-red-500/90 font-normal" aria-hidden>*</span>
                </label>
                <input type="text" name="pincode" required placeholder="6 digits" className="input w-full" minLength={6} maxLength={6} pattern="[0-9]{6}" title="6-digit pincode" />
              </div>
            </div>
          </section>

          {/* Section: Business */}
          <section className="space-y-4 pt-6 border-t border-[var(--border)]">
            <div className="pb-0.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                Business
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Type, scale and experience</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Business type</label>
                <select name="businessType" className="input w-full" defaultValue="Residential">
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">GST number</label>
                <input type="text" name="gst" placeholder="Optional" className="input w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Experience (years) <span className="text-red-500/90 font-normal" aria-hidden>*</span>
                </label>
                <input type="number" name="experienceYears" min={0} required placeholder="0" className="input w-full" />
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
              <div className="space-y-2 sm:col-span-2 sm:max-w-[12rem]">
                <label className="text-sm font-medium text-[var(--foreground)]">Designers in team</label>
                <input type="number" name="designersCount" min={0} placeholder="0" className="input w-full" defaultValue={0} />
              </div>
            </div>
          </section>
            </div>

            {/* Right column: Portfolio + About */}
            <div className="space-y-8 lg:pt-0">
          {/* Section: Portfolio */}
          <section className="space-y-4 pt-6 border-t border-[var(--border)] lg:pt-0 lg:border-t-0">
            <div className="pb-0.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                Portfolio
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">One file now; add more from your dashboard later</p>
            </div>
            <div className="rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-subtle)]/40 px-4 py-5 transition-all duration-150 focus-within:border-[var(--brand)]/60 focus-within:bg-[var(--surface-subtle)]/60 focus-within:ring-2 focus-within:ring-[var(--brand)]/10">
              <label className="block cursor-pointer">
                <span className="text-sm font-medium text-[var(--foreground)] block mb-0.5">Upload PDF or image</span>
                <span className="text-xs text-[var(--text-muted)] block mb-3">Max 10 MB · PDF, JPEG, PNG or WebP</span>
                <input
                  ref={portfolioInputRef}
                  type="file"
                  name="portfolio"
                  accept={ACCEPT_PORTFOLIO}
                  className={`block w-full text-sm text-[var(--foreground)] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--brand)] file:text-white file:cursor-pointer hover:file:opacity-90 ${hasPortfolioError ? "ring-2 ring-red-500 rounded-lg" : ""}`}
                  onChange={handlePortfolioChange}
                  aria-invalid={hasPortfolioError}
                  aria-describedby={hasPortfolioError ? "portfolio-error" : undefined}
                />
              </label>
              {portfolioError && (
                <p id="portfolio-error" className="text-sm text-red-600 mt-2" role="alert">
                  {portfolioError}
                </p>
              )}
            </div>
          </section>

          {/* Section: About */}
          <section className="space-y-4 pt-6 border-t border-[var(--border)]">
            <div className="pb-0.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                About your work
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Help clients understand your style and approach</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                About your firm <span className="text-red-500/90 font-normal" aria-hidden>*</span>
              </label>
              <textarea
                name="about"
                required
                minLength={10}
                rows={4}
                placeholder="Services, specialisations, design philosophy (at least a few words)…"
                className="input w-full resize-y min-h-[100px]"
                title="Please describe your firm in at least a few words"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Comments</label>
              <textarea
                name="comments"
                rows={2}
                placeholder="Anything else for the review team (optional)"
                className="input w-full resize-y min-h-[72px]"
              />
            </div>
          </section>
            </div>
          </div>
        </div>
      )}

      {displayError && (
        <p className="text-sm text-red-600 rounded-xl bg-red-50 dark:bg-red-950/30 px-4 py-2.5 border border-red-100 dark:border-red-900/40" role="alert">
          {displayError}
        </p>
      )}
      <div className="pt-1">
        <SubmitButton
          label={effectiveRole === "FIRM" ? "Create designer account" : "Create account"}
          disabled={hasPortfolioError}
        />
      </div>
    </form>
  );
}
