"use client";

import ValidatedEmailInput from "@/components/ui/ValidatedEmailInput";
import ValidatedPhoneInput from "@/components/ui/ValidatedPhoneInput";

type Props = {
  defaultContactEmail: string;
  defaultContactPhone: string;
  defaultContactAddress: string;
};

export default function AdminSettingsContactFields({
  defaultContactEmail,
  defaultContactPhone,
  defaultContactAddress,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">Contact email</label>
        <ValidatedEmailInput
          name="contactEmail"
          defaultValue={defaultContactEmail}
          placeholder="hello@interioros.com"
          className="input w-full"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">Contact phone</label>
        <ValidatedPhoneInput
          name="contactPhone"
          defaultValue={defaultContactPhone}
          placeholder="+91 90000 00000"
          className="input w-full"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">Contact address</label>
        <input
          name="contactAddress"
          type="text"
          defaultValue={defaultContactAddress}
          placeholder="Bengaluru, India"
          className="input w-full"
        />
      </div>
    </div>
  );
}
