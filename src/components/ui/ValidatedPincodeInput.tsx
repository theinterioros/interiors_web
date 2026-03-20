"use client";

import { useMemo, useState } from "react";
import { validatePincodeIndia } from "@/lib/validation";

type Props = {
  name: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
};

export default function ValidatedPincodeInput({
  name,
  id,
  required,
  placeholder = "e.g. 500001",
  className = "input w-full",
  defaultValue = "",
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => {
    if (!value) return null;
    return validatePincodeIndia(value);
  }, [value]);

  const invalid =
    Boolean(required && touched && !value) ||
    Boolean(touched && value && result && !result.valid);
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <input
        type="text"
        name={name}
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        onFocus={() => setTouched(true)}
        required={required}
        placeholder={placeholder}
        className={`${className} ${invalid ? "border-red-500 focus:border-red-500" : ""}`}
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={invalid ? errorId : undefined}
        autoComplete="off"
      />
      {invalid && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          Pincode must be exactly 6 digits.
        </p>
      )}
    </div>
  );
}

