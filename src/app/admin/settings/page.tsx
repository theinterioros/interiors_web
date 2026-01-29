import {
  addMarketingLinkAction,
  addSocialLinkAction,
  deleteLinkAction,
  updateSettingsAction,
} from "@/app/actions/admin";
import { getAdminSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Admin Settings</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Configuration</h1>
          <p className="text-sm text-neutral-500">Manage OTP, SMTP, fees, and links.</p>
        </div>

        <form action={updateSettingsAction} className="space-y-6 rounded-2xl border border-neutral-200 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Enable email OTP login</label>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" name="otpEnabled" defaultChecked={settings.otpEnabled} />
              <span>Allow OTP login/signup</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Customer registration fee</label>
              <input
                type="number"
                name="customerRegistrationFee"
                defaultValue={settings.customerRegistrationFee}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Firm yearly fee</label>
              <input
                type="number"
                name="designerYearlyFee"
                defaultValue={settings.designerYearlyFee}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Digital Twin yearly fee</label>
              <input
                type="number"
                name="digitalTwinYearlyFee"
                defaultValue={settings.digitalTwinYearlyFee}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">SMTP host</label>
              <input
                name="smtpHost"
                defaultValue={settings.smtpHost ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">SMTP port</label>
              <input
                name="smtpPort"
                type="number"
                defaultValue={settings.smtpPort ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">SMTP user</label>
              <input
                name="smtpUser"
                defaultValue={settings.smtpUser ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">SMTP password</label>
              <input
                name="smtpPass"
                type="password"
                defaultValue={settings.smtpPass ?? ""}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">SMTP secure</label>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" name="smtpSecure" defaultChecked={settings.smtpSecure ?? false} />
                <span>Use TLS/SSL</span>
              </div>
            </div>
          </div>

          <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Save settings
          </button>
        </form>

        <div className="grid gap-6 md:grid-cols-2">
          <form action={addSocialLinkAction} className="space-y-4 rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Social links</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Platform</label>
              <input
                name="platform"
                placeholder="Instagram"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">URL</label>
              <input
                name="url"
                placeholder="https://instagram.com/interior-os"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
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
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
              Add social link
            </button>
            <div className="space-y-2 text-sm text-neutral-600">
              {settings.socialLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between">
                  <span>{link.platform}</span>
                  <form action={deleteLinkAction}>
                    <input type="hidden" name="linkId" value={link.id} />
                    <input type="hidden" name="type" value="social" />
                    <button className="text-xs text-neutral-500 underline">Remove</button>
                  </form>
                </div>
              ))}
            </div>
          </form>

          <form action={addMarketingLinkAction} className="space-y-4 rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Header/Footer links</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Label</label>
              <input
                name="label"
                placeholder="Firms"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">URL</label>
              <input
                name="url"
                placeholder="/designers"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
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
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
              Add link
            </button>
            <div className="space-y-2 text-sm text-neutral-600">
              {settings.marketingLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between">
                  <span>{link.label}</span>
                  <form action={deleteLinkAction}>
                    <input type="hidden" name="linkId" value={link.id} />
                    <input type="hidden" name="type" value="marketing" />
                    <button className="text-xs text-neutral-500 underline">Remove</button>
                  </form>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
