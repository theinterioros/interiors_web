import {
  addMarketingLinkAction,
  addSocialLinkAction,
  deleteLinkAction,
  resetAiPromptAction,
  updateAiPromptsAction,
  updateSettingsAction,
} from "@/app/actions/admin";
import { Settings } from "lucide-react";
import { getAdminSettings } from "@/lib/settings";
import FadeIn from "@/components/animations/FadeIn";
import AdminSettingsContactFields from "./AdminSettingsContactFields";
import AdminCleanupProduction from "./AdminCleanupProduction";
import {
  DEFAULT_ESTIMATOR_PROMPT_EDITABLE,
  DEFAULT_VISUALIZATION_PROMPT_EDITABLE,
  ESTIMATOR_INPUT_CONTRACT,
  ESTIMATOR_OUTPUT_CONTRACT,
  VISUALIZATION_INPUT_CONTRACT,
  VISUALIZATION_OUTPUT_CONTRACT,
} from "@/lib/ai-prompts";

export const dynamic = "force-dynamic";

function shortText(value: string | null | undefined, limit = 180) {
  if (!value) return "Default prompt";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit)}...` : normalized;
}

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div>
      <FadeIn className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-[var(--brand)]" />
            <p className="eyebrow">Admin Settings</p>
          </div>
          <h1 className="heading-lg mb-3">Configuration</h1>
          <p className="text-[var(--text-muted)]">Manage OTP, SMTP, fees, and links.</p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <form action={updateSettingsAction} className="card space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Enable Email OTP Login</label>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input type="checkbox" name="otpEnabled" defaultChecked={settings.otpEnabled} />
              <span>Allow OTP login/signup</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Customer Registration Fee</label>
              <input
                type="number"
                name="customerRegistrationFee"
                defaultValue={settings.customerRegistrationFee}
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Firm Yearly Fee</label>
              <input
                type="number"
                name="designerYearlyFee"
                defaultValue={settings.designerYearlyFee}
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Digital Twin Yearly Fee</label>
              <input
                type="number"
                name="digitalTwinYearlyFee"
                defaultValue={settings.digitalTwinYearlyFee}
                className="input"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Contact Info (Get in Touch)</h3>
            <p className="text-xs text-[var(--text-muted)]">Shown beside the contact form and in Reach us.</p>
          </div>
          <AdminSettingsContactFields
            defaultContactEmail={settings.contactEmail ?? ""}
            defaultContactPhone={settings.contactPhone ?? ""}
            defaultContactAddress={settings.contactAddress ?? ""}
          />

          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-[var(--border)]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP Host</label>
              <input name="smtpHost" defaultValue={settings.smtpHost ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP Port</label>
              <input name="smtpPort" type="number" defaultValue={settings.smtpPort ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP User</label>
              <input name="smtpUser" defaultValue={settings.smtpUser ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP Password</label>
              <input name="smtpPass" type="password" defaultValue={settings.smtpPass ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP Secure</label>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <input type="checkbox" name="smtpSecure" defaultChecked={settings.smtpSecure ?? false} />
                <span>Use TLS/SSL</span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Save settings
          </button>
          </form>
        </FadeIn>

        <FadeIn delay={0.25} className="mt-8" id="ai-prompts">
          <form action={updateAiPromptsAction} className="card space-y-6">
            <div className="space-y-2">
              <h2 className="heading-md">AI Prompt Controls</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Edit only the instruction layer. Input and output contracts stay fixed in code to protect UX.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-[var(--foreground)]">AI Cost Estimator Prompt (editable)</label>
                  <button
                    type="submit"
                    formAction={resetAiPromptAction}
                    name="promptKey"
                    value="estimator"
                    className="btn btn-secondary text-xs"
                  >
                    Reset to default
                  </button>
                </div>
                <textarea
                  name="estimatorPromptCustom"
                  defaultValue={settings.estimatorPromptCustom ?? DEFAULT_ESTIMATOR_PROMPT_EDITABLE}
                  rows={9}
                  className="input min-h-[220px] w-full"
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Tip: tune tone, pricing assumptions, and reasoning style. Avoid changing JSON contract wording.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-[var(--foreground)]">AI Visualization Prompt (editable)</label>
                  <button
                    type="submit"
                    formAction={resetAiPromptAction}
                    name="promptKey"
                    value="visualization"
                    className="btn btn-secondary text-xs"
                  >
                    Reset to default
                  </button>
                </div>
                <textarea
                  name="visualizationPromptCustom"
                  defaultValue={settings.visualizationPromptCustom ?? DEFAULT_VISUALIZATION_PROMPT_EDITABLE}
                  rows={9}
                  className="input min-h-[220px] w-full"
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Tip: tune creativity and practical constraints while keeping room-wise output objective.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Estimator fixed contracts
                </p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap text-xs text-[var(--text-muted)]">
                  {ESTIMATOR_INPUT_CONTRACT}
                  {"\n\n"}
                  {ESTIMATOR_OUTPUT_CONTRACT}
                </pre>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Visualization fixed contracts
                </p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap text-xs text-[var(--text-muted)]">
                  {VISUALIZATION_INPUT_CONTRACT}
                  {"\n\n"}
                  {VISUALIZATION_OUTPUT_CONTRACT}
                </pre>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Save AI prompts
            </button>
          </form>
        </FadeIn>

        <FadeIn delay={0.28} className="mt-6">
          <div className="card space-y-4">
            <div>
              <h3 className="heading-md mb-1">Prompt change history</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Tracks updates and resets for Estimator and Visualization prompts.
              </p>
            </div>
            <div className="space-y-3">
              {settings.aiPromptAuditLogs.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No prompt changes recorded yet.</p>
              ) : (
                settings.aiPromptAuditLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-[var(--border)] p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="badge">
                        {log.promptKey === "estimator" ? "Estimator" : "Visualization"}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {log.action === "reset" ? "Reset to default" : "Updated"}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        by {log.adminName || log.adminEmail || "Admin"}
                      </span>
                      <span className="text-[var(--text-muted)]">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="rounded-lg bg-[var(--surface-subtle)] p-2">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Before</p>
                        <p className="text-xs text-[var(--text-muted)]">{shortText(log.previousValue)}</p>
                      </div>
                      <div className="rounded-lg bg-[var(--surface-subtle)] p-2">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">After</p>
                        <p className="text-xs text-[var(--text-muted)]">{shortText(log.newValue)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <FadeIn delay={0.3}>
            <form action={addSocialLinkAction} className="card space-y-4">
              <h2 className="heading-md mb-4">Social links</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Platform</label>
                <input name="platform" placeholder="Instagram" className="input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">URL</label>
                <input name="url" placeholder="https://instagram.com/interior-os" className="input" />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="showInHeader" defaultChecked />
                  Header
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="showInFooter" defaultChecked />
                  Footer
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="showInLanding" defaultChecked />
                  Landing
                </label>
              </div>
              <button type="submit" className="btn btn-primary">
                Add social link
              </button>
              <div className="space-y-2 text-sm">
                {settings.socialLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <span className="text-[var(--text-muted)]">{link.platform}</span>
                    <form action={deleteLinkAction}>
                      <input type="hidden" name="linkId" value={link.id} />
                      <input type="hidden" name="type" value="social" />
                      <button type="submit" className="text-xs text-[var(--brand)] hover:underline">
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </form>
          </FadeIn>

          <FadeIn delay={0.4}>
            <form action={addMarketingLinkAction} className="card space-y-4">
              <h2 className="heading-md mb-4">Header/Footer links</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Label</label>
                <input name="label" placeholder="Firms" className="input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">URL</label>
                <input name="url" placeholder="/designers" className="input" />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="showInHeader" defaultChecked />
                  Header
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="showInFooter" defaultChecked />
                  Footer
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="showInLanding" defaultChecked />
                  Landing
                </label>
              </div>
              <button type="submit" className="btn btn-primary">
                Add link
              </button>
              <div className="space-y-2 text-sm">
                {settings.marketingLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <span className="text-[var(--text-muted)]">{link.label}</span>
                    <form action={deleteLinkAction}>
                      <input type="hidden" name="linkId" value={link.id} />
                      <input type="hidden" name="type" value="marketing" />
                      <button type="submit" className="text-xs text-[var(--brand)] hover:underline">
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </form>
          </FadeIn>
        </div>

        <FadeIn delay={0.5} className="mt-8">
          <AdminCleanupProduction />
        </FadeIn>
    </div>
  );
}
