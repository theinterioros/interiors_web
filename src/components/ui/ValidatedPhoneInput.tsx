"use client";

import { useState } from "react";
import { validatePhoneIndia, sanitizePhoneInputLive, PHONE_ERROR } from "@/lib/validation";

type Props = {
  name: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  defaultValue?: string;
  "aria-describedby"?: string;
};

export default function ValidatedPhoneInput({
  name,
  id,
  required,
  placeholder = "e.g. 9876543210 or +91 98765 43210",
  className = "input w-full",
  autoComplete = "tel",
  defaultValue = "",
  "aria-describedby": ariaDescribedby,
}: Props) {
  const [value, setValue] = useState(defaultValue ? sanitizePhoneInputLive(defaultValue) : "");
  const [touched, setTouched] = useState(false);
  const result = value ? validatePhoneIndia(value) : null;
  const invalid = touched && value && !result?.valid;
  const errorId = id ? `${id}-error` : undefined;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(sanitizePhoneInputLive(e.target.value));
    if (e.target.value) setTouched(true);
  }

  return (
    <div className="space-y-1.5">
      <input
        type="tel"
        name={name}
        id={id}
        required={required}
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        inputMode="tel"
        placeholder={placeholder}
        className={`${className} ${invalid ? "border-red-500 focus:border-red-500" : ""}`}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : ariaDescribedby}
      />
      {invalid && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {PHONE_ERROR}
        </p>
      )}
    </div>
  );
}
