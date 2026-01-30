/**
 * Basic validation for email and Indian mobile numbers.
 * Use in server actions and optionally for client hints.
 */

/** RFC-style email regex (permissive but catches obvious mistakes) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Indian mobile: 10 digits, optionally prefixed with +91, 0, or spaces.
 * Returns true if the normalized number is exactly 10 digits.
 */
export function isValidIndianMobile(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  const withoutLeadingZeroOrCountry = digits.replace(/^0+/, "").replace(/^91/, "");
  return withoutLeadingZeroOrCountry.length === 10 && /^\d{10}$/.test(withoutLeadingZeroOrCountry);
}

/**
 * Normalize Indian mobile to 10 digits (no +91) for storage.
 * Returns null if invalid.
 */
export function normalizeIndianMobile(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  let ten = digits.replace(/^0+/, "");
  if (ten.length === 12 && ten.startsWith("91")) ten = ten.slice(2);
  if (ten.length !== 10 || !/^\d{10}$/.test(ten)) return null;
  return ten;
}

/**
 * Check if a string looks like an email (contains @) or a phone number.
 * Useful for login identifier field.
 */
export function isEmailLike(value: string): boolean {
  return value.trim().includes("@");
}
