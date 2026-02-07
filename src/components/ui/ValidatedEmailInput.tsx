"use client";

import { useState } from "react";
import { validateEmail, EMAIL_ERROR } from "@/lib/validation";

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

export default function ValidatedEmailInput({
  name,
  id,
  required,
  placeholder = "you@example.com",
  className = "input w-full",
  autoComplete = "email",
  defaultValue = "",
  "aria-describedby": ariaDescribedby,
}: Props) {
  const [value, setValue] = useState(defaultValue.trim().toLowerCase());
  const [touched, setTouched] = useState(false);
  const result = value ? validateEmail(value) : null;
  const invalid = touched && value && !result?.valid;
  const errorId = id ? `${id}-error` : undefined;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value.replace(/\s/g, ""));
    if (e.target.value) setTouched(true);
  }

  function handleBlur() {
    const trimmed = value.trim().toLowerCase();
    if (trimmed !== value) setValue(trimmed);
    setTouched(true);
  }

  return (
    <div className="space-y-1.5">
      <input
        type="email"
        name={name}
        id={id}
        required={required}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${invalid ? "border-red-500 focus:border-red-500" : ""}`}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : ariaDescribedby}
      />
      {invalid && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {EMAIL_ERROR}
        </p>
      )}
    </div>
  );
}
