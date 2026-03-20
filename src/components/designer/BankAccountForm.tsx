"use client";

import { useRef, useState } from "react";

type BankAccountFormProps = {
  action: (formData: FormData) => void;
  existingBank: { account_holder_name: string; ifsc: string } | null;
};

function normalizeAccountNumber(value: string): string {
  return value.replace(/\s/g, "").trim();
}

export default function BankAccountForm({ action, existingBank }: BankAccountFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const accountNumber = normalizeAccountNumber(
      (form.elements.namedItem("accountNumber") as HTMLInputElement)?.value ?? ""
    );
    const confirmAccountNumber = normalizeAccountNumber(
      (form.elements.namedItem("confirmAccountNumber") as HTMLInputElement)?.value ?? ""
    );

    if (accountNumber.length > 0 && confirmAccountNumber.length > 0 && accountNumber !== confirmAccountNumber) {
      e.preventDefault();
      setMatchError("Account number and confirm account number do not match.");
      return;
    }
    setMatchError(null);
    // Let form submit to server action
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="accountHolderName">
          Account holder name
        </label>
        <input
          id="accountHolderName"
          name="accountHolderName"
          type="text"
          required
          minLength={3}
          defaultValue={existingBank?.account_holder_name ?? ""}
          className="input"
          placeholder="As on bank record"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="accountNumber">
          Account number
        </label>
        <input
          id="accountNumber"
          name="accountNumber"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          minLength={9}
          className="input"
          placeholder={existingBank ? "Re-enter to update" : "Enter account number"}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="confirmAccountNumber">
          Confirm account number
        </label>
        <input
          id="confirmAccountNumber"
          name="confirmAccountNumber"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          minLength={9}
          className="input"
          placeholder="Re-enter account number"
        />
        {matchError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {matchError}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="ifsc">
          IFSC
        </label>
        <input
          id="ifsc"
          name="ifsc"
          type="text"
          required
          maxLength={11}
          defaultValue={existingBank?.ifsc ?? ""}
          className="input font-mono uppercase"
          placeholder="e.g. HDFC0001234"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {existingBank ? "Update bank account" : "Save bank account"}
      </button>
    </form>
  );
}
