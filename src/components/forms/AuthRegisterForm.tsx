"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { useState } from "react";
import ValidatedEmailInput from "@/components/ui/ValidatedEmailInput";
import ValidatedPhoneInput from "@/components/ui/ValidatedPhoneInput";

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
          {/* Section: Portfolio project (optional) */}
          <section className="space-y-4 pt-6 border-t border-[var(--border)] lg:pt-0 lg:border-t-0">
            <div className="pb-0.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                Portfolio project (optional)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Add one project with up to 5 images. You can add more projects later from Profile → Update portfolio.</p>
            </div>
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
          disabled={false}
        />
      </div>
    </form>
  );
}
