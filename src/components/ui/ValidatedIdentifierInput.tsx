"use client";

import { useState } from "react";
import { validateEmail, validatePhoneIndia, isEmailLike, sanitizePhoneInputLive, PHONE_ERROR, EMAIL_ERROR } from "@/lib/validation";

type Props = {
  name: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
};

export default function ValidatedIdentifierInput({
  name,
  id,
  required,
  placeholder = "Email or 10-digit mobile",
  className = "input w-full",
  autoComplete = "username",
}: Props) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const isEmail = value.trim().includes("@");
  const emailResult = value ? validateEmail(value) : null;
  const phoneResult = value ? validatePhoneIndia(value) : null;
  const invalid = touched && value && (isEmail ? !emailResult?.valid : !phoneResult?.valid);
  const errorMessage = invalid ? (isEmail ? EMAIL_ERROR : PHONE_ERROR) : "";
  const errorId = id ? `${id}-error` : undefined;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (isEmailLike(raw)) {
      setValue(raw.replace(/\s/g, ""));
    } else {
      setValue(sanitizePhoneInputLive(raw));
    }
    if (raw) setTouched(true);
  }

  function handleBlur() {
    if (value.trim().includes("@")) {
      const trimmed = value.trim().toLowerCase();
      if (trimmed !== value) setValue(trimmed);
    }
    setTouched(true);
  }

  return (
    <div className="space-y-1.5">
      <input
        type="text"
        name={name}
        id={id}
        required={required}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${invalid ? "border-red-500 focus:border-red-500" : ""}`}
        autoComplete={autoComplete}
        title="Enter your email or 10-digit Indian mobile number"
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
      />
      {invalid && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
