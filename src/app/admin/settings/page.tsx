import {
  addMarketingLinkAction,
  addSocialLinkAction,
  deleteLinkAction,
  updateSettingsAction,
} from "@/app/actions/admin";
import { Settings } from "lucide-react";
import { getAdminSettings } from "@/lib/settings";
import FadeIn from "@/components/animations/FadeIn";

export const dynamic = "force-dynamic";

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
            <label className="text-sm font-medium text-[var(--foreground)]">Enable email OTP login</label>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input type="checkbox" name="otpEnabled" defaultChecked={settings.otpEnabled} />
              <span>Allow OTP login/signup</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Customer registration fee</label>
              <input
                type="number"
                name="customerRegistrationFee"
                defaultValue={settings.customerRegistrationFee}
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Firm yearly fee</label>
              <input
                type="number"
                name="designerYearlyFee"
                defaultValue={settings.designerYearlyFee}
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Digital Twin yearly fee</label>
              <input
                type="number"
                name="digitalTwinYearlyFee"
                defaultValue={settings.digitalTwinYearlyFee}
                className="input"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP host</label>
              <input name="smtpHost" defaultValue={settings.smtpHost ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP port</label>
              <input name="smtpPort" type="number" defaultValue={settings.smtpPort ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP user</label>
              <input name="smtpUser" defaultValue={settings.smtpUser ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP password</label>
              <input name="smtpPass" type="password" defaultValue={settings.smtpPass ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">SMTP secure</label>
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
    </div>
  );
}
