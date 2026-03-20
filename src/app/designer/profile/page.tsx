import Link from "next/link";
import { updateFirmProfileAction, createPortfolioProjectWithImagesAction, saveDesignerBankAccountAction } from "@/app/actions/designer";
import PortfolioProjectCard from "@/components/designer/PortfolioProjectCard";
import AddProjectModal from "@/components/designer/AddProjectModal";
import BankAccountForm from "@/components/designer/BankAccountForm";
import PageTabs from "@/components/ui/PageTabs";
import { Building2, Calendar, IndianRupee, Landmark } from "lucide-react";
import { requireFirmPaid } from "@/lib/auth";
import { sql } from "@/lib/db";
import { FIRM_REGISTRATION_AMOUNT } from "@/lib/registrationPayments";

export const dynamic = "force-dynamic";

type Props = { searchParams?: Promise<{ tab?: string; portfolioError?: string; portfolioSuccess?: string; bankError?: string; bankSuccess?: string }> };

export default async function DesignerProfilePage({ searchParams }: Props) {
  const user = await requireFirmPaid();
  const params = await searchParams;
  const tabParam = params?.tab;
  const tab = tabParam === "portfolio" ? "portfolio" : tabParam === "bank" ? "bank" : "details";
  const portfolioError = params?.portfolioError ? decodeURIComponent(params.portfolioError) : null;
  const portfolioSuccess = params?.portfolioSuccess ?? null;
  const bankError = params?.bankError ? decodeURIComponent(params.bankError) : null;
  const bankSuccess = params?.bankSuccess ?? null;

  const [profile] = await sql<{
    id: string;
    name: string;
    firm_name: string | null;
    owner_name: string | null;
    office_address: string | null;
    gst: string | null;
    business_type: string | null;
    ticket_size: string | null;
    designers_count: number | null;
    comments: string | null;
    experience_years: number;
    city: string;
    pincode: string;
    about: string;
    google_review_links: string | null;
    status: string;
    platform_margin_pct: number | null;
    margin_accepted_at: Date | null;
    subscription_expires_at: Date | null;
  }>`
    select id, name, firm_name, owner_name, office_address, gst, business_type, ticket_size,
           designers_count, comments, experience_years, city, pincode, about,
           google_review_links, status, platform_margin_pct, margin_accepted_at, subscription_expires_at
    from firm_profiles
    where user_id = ${user.id}
    limit 1
  `;

  const subscriptionExpiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const isSubscriptionActive = subscriptionExpiresAt ? subscriptionExpiresAt > new Date() : true;
  const isExpiringSoon = subscriptionExpiresAt && subscriptionExpiresAt > new Date() && subscriptionExpiresAt.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

  const [bankAccount] = await sql<{ account_holder_name: string; ifsc: string; account_last4: string }>`
    select account_holder_name, ifsc, account_last4 from designer_bank_accounts where user_id = ${user.id} limit 1
  `;

  type PortfolioRow = { id: string; work_id: string | null; blob_url: string; file_name: string };
  let portfolio: PortfolioRow[] = [];
  if (profile) {
    try {
      portfolio = await sql<PortfolioRow>`
        select id, work_id, blob_url, file_name
        from firm_portfolio_files
        where profile_id = ${profile.id}
        order by created_at desc
      `;
    } catch {
      const flat = await sql<{ id: string; blob_url: string; file_name: string }>`
        select id, blob_url, file_name
        from firm_portfolio_files
        where profile_id = ${profile.id}
        order by created_at desc
      `;
      portfolio = flat.map((f) => ({ ...f, work_id: null }));
    }
  }

  let works: { id: string; title: string; description: string | null; display_order: number }[] = [];
  try {
    works = profile
      ? await sql<{ id: string; title: string; description: string | null; display_order: number }>`
          select id, title, description, display_order
          from firm_portfolio_works
          where profile_id = ${profile.id}
          order by display_order
        `
      : [];
  } catch {
    // table may not exist
  }

  const filesByWorkId = new Map<string, typeof portfolio>();
  for (const f of portfolio) {
    if (f.work_id) {
      if (!filesByWorkId.has(f.work_id)) filesByWorkId.set(f.work_id, []);
      filesByWorkId.get(f.work_id)!.push(f);
    }
  }

  const profileTabs = [
    { label: "Details", href: "/designer/profile", active: tab === "details" },
    { label: "Portfolio", href: "/designer/profile?tab=portfolio", active: tab === "portfolio", count: works.length },
    { label: "Bank account", href: "/designer/profile?tab=bank", active: tab === "bank" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
          <p className="eyebrow">Profile</p>
        </div>
        <h1 className="heading-lg mb-1">Manage Your Profile</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Update your details and upload portfolio for customers to view.
        </p>
      </header>

      <PageTabs tabs={profileTabs} className="mb-6" />

      {tab === "details" && (
        <>
      {/* Subscription status — always visible at top */}
      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">Subscription</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Your listing status. Renew yearly to stay visible to customers.</p>
        </div>
        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              {subscriptionExpiresAt
                ? (subscriptionExpiresAt > new Date()
                  ? `Active until ${subscriptionExpiresAt.toLocaleDateString()}`
                  : "Expired")
                : "Active (no expiry set)"}
            </span>
          </div>
          <Link
            href="/designer/renew"
            className="btn btn-primary text-sm inline-flex items-center gap-2"
          >
            <IndianRupee className="h-4 w-4" />
            {!subscriptionExpiresAt || subscriptionExpiresAt <= new Date() ? "Subscribe / Renew" : "Renew early"} (₹{FIRM_REGISTRATION_AMOUNT.toLocaleString()}/year)
          </Link>
        </div>
        {isExpiringSoon && subscriptionExpiresAt && subscriptionExpiresAt > new Date() && (
          <p className="px-4 pb-3 text-xs text-[var(--accent-amber)]">Expires in less than 30 days.</p>
        )}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <form action={updateFirmProfileAction} className="p-5 sm:p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Firm Name</label>
              <input name="firmName" defaultValue={profile?.firm_name ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Owner Name</label>
              <input name="ownerName" defaultValue={profile?.owner_name ?? ""} className="input" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Name</label>
              <input name="name" defaultValue={profile?.name ?? ""} required className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Experience (Years)</label>
              <input
                name="experienceYears"
                type="number"
                min={0}
                defaultValue={profile?.experience_years ?? 0}
                required
                className="input"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">City</label>
              <input name="city" defaultValue={profile?.city ?? ""} required className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Pincode</label>
              <input
                name="pincode"
                defaultValue={profile?.pincode ?? ""}
                required
                className="input"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Office Address</label>
            <input name="officeAddress" defaultValue={profile?.office_address ?? ""} className="input" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">GST</label>
              <input name="gst" defaultValue={profile?.gst ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Business Type</label>
              <input name="businessType" defaultValue={profile?.business_type ?? ""} className="input" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Ticket Size</label>
              <input name="ticketSize" defaultValue={profile?.ticket_size ?? ""} className="input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Designers Count</label>
              <input
                name="designersCount"
                type="number"
                min={0}
                defaultValue={profile?.designers_count ?? 0}
                className="input"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">About (Bio)</label>
            <textarea name="about" rows={4} defaultValue={profile?.about ?? ""} required className="input" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Google Review Links</label>
            <textarea
              name="googleReviewLinks"
              rows={2}
              defaultValue={profile?.google_review_links ?? ""}
              className="input"
              placeholder="One URL per line (e.g. Google Business profile)"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Comments</label>
            <textarea name="comments" rows={3} defaultValue={profile?.comments ?? ""} className="input" />
          </div>
          <button type="submit" className="btn btn-primary">
            Save Profile
          </button>
        </form>
      </div>
        </>
      )}

      {tab === "bank" && (
      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[var(--text-muted)]" />
            Bank account (payout details)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Add your bank account to receive milestone payments. Required before you can submit milestones for customer approval. Enter your account number twice to confirm.
          </p>
        </div>
        <div className="p-5">
          {bankError && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300" role="alert">
              {bankError}
            </div>
          )}
          {bankSuccess === "1" && (
            <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-300" role="status">
              Bank account saved. You can update it anytime below.
            </div>
          )}
          {bankAccount ? (
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Current account: <span className="font-medium text-[var(--foreground)]">{bankAccount.account_holder_name}</span>, ••••{bankAccount.account_last4}, IFSC {bankAccount.ifsc}. Update below if needed.
            </p>
          ) : null}
          <BankAccountForm action={saveDesignerBankAccountAction} existingBank={bankAccount ?? null} />
        </div>
      </div>
      )}

      {tab === "portfolio" && (
      <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">Portfolio</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Up to 5 projects, 5 images per project. Upload a file or paste an image URL.</p>
          </div>
          {portfolioError && (
            <div className="mx-4 mt-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300" role="alert">
              {portfolioError}
            </div>
          )}
          {portfolioSuccess && ["1", "deleted", "updated", "projectDeleted"].includes(portfolioSuccess) && (
            <div className="mx-4 mt-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-300" role="status">
              {portfolioSuccess === "1" && "Image added to your portfolio."}
              {portfolioSuccess === "deleted" && "Image removed."}
              {portfolioSuccess === "updated" && "Caption updated."}
              {portfolioSuccess === "projectDeleted" && "Project removed."}
            </div>
          )}
          <div className="p-5 space-y-6">
              <AddProjectModal
                canAddMore={works.length < 5}
                nextLabel={works.length === 0 ? "Add your first project" : "Add another project"}
                action={createPortfolioProjectWithImagesAction}
              />
              {works
                .slice()
                .sort((a, b) => a.display_order - b.display_order)
                .map((work, index) => (
                  <PortfolioProjectCard
                    key={work.id}
                    work={work}
                    workFiles={filesByWorkId.get(work.id) ?? []}
                    projectNumber={index + 1}
                  />
                ))}
            </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 px-5 pb-5">Add up to 5 projects. Each project can have a name, description, and up to 5 images. Customers see your name, description, and these projects when they browse your portfolio.</p>
      </div>
      )}
    </div>
  );
}
