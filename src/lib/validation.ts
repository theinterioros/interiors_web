/**
 * Validation for email and Indian mobile numbers.
 * Phone: allow digits, spaces, hyphens, parentheses, leading +; strip then validate 10 digits starting with 6/7/8/9.
 * Email: trim, lowercase, exactly one @, local part and domain with at least one .; no spaces; allow plus addressing and new TLDs.
 */

export const PHONE_ERROR = "Enter a valid 10-digit Indian mobile number.";
export const EMAIL_ERROR = "Enter a valid email address.";

/**
 * Sanitize and validate email. Trim, lowercase, exactly one @, text before @, domain with ., no spaces.
 * Returns { valid: true, sanitized } or { valid: false }.
 */
export function validateEmail(
  value: string
): { valid: true; sanitized: string } | { valid: false } {
  const trimmed = value.trim();
  if (trimmed.includes(" ")) return { valid: false };
  const lower = trimmed.toLowerCase();
  const atCount = (lower.match(/@/g) || []).length;
  if (atCount !== 1) return { valid: false };
  const atIndex = lower.indexOf("@");
  const local = lower.slice(0, atIndex);
  const domain = lower.slice(atIndex + 1);
  if (!local.length || !domain.includes(".")) return { valid: false };
  return { valid: true, sanitized: lower };
}

/**
 * Indian mobile: allow digits, spaces, hyphens, parentheses, leading +.
 * Strip spaces, hyphens, parentheses; strip +91 or leading 0; must be exactly 10 digits starting with 6, 7, 8, or 9.
 * Returns { valid: true, sanitized: "9876543210" } or { valid: false }.
 */
export function validatePhoneIndia(
  value: string
): { valid: true; sanitized: string } | { valid: false } {
  const cleaned = value.replace(/[\s\-()]/g, "");
  const digits = cleaned.replace(/\D/g, "");
  let ten = digits;
  if (ten.length === 12 && ten.startsWith("91")) ten = ten.slice(2);
  else if (ten.length === 11 && ten.startsWith("0")) ten = ten.slice(1);
  if (ten.length !== 10 || !/^[6789]\d{9}$/.test(ten)) return { valid: false };
  return { valid: true, sanitized: ten };
}

/** @deprecated Use validateEmail for new code. */
export function isValidEmail(value: string): boolean {
  return validateEmail(value).valid;
}

/** @deprecated Use validatePhoneIndia for new code. */
export function isValidIndianMobile(value: string): boolean {
  return validatePhoneIndia(value).valid;
}

/**
 * Normalize Indian mobile to 10 digits for storage. Returns null if invalid.
 */
export function normalizeIndianMobile(value: string): string | null {
  const result = validatePhoneIndia(value);
  return result.valid ? result.sanitized : null;
}

/**
 * For live input: allow only digits, +, spaces, hyphens, parentheses.
 * Strip to effective digits (+91 / leading 0 removed) and truncate to 10.
 * Returns a string of at most 10 digits (so user cannot enter more than 10).
 */
export function sanitizePhoneInputLive(value: string): string {
  const allowed = value.replace(/[^\d+\s\-()]/g, "");
  const digits = allowed.replace(/\D/g, "");
  let ten = digits;
  if (ten.length >= 12 && ten.startsWith("91")) ten = ten.slice(2);
  else if (ten.length >= 11 && ten.startsWith("0")) ten = ten.slice(1);
  return ten.slice(0, 10);
}

/**
 * Check if a string looks like an email (contains @) or a phone number.
 * Useful for login identifier field.
 */
export function isEmailLike(value: string): boolean {
  return value.trim().includes("@");
}

/** Portfolio file: max 10MB; PDF or image (JPEG, PNG, WebP). */
export const PORTFOLIO_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const PORTFOLIO_ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function validatePortfolioFile(
  file: File | null
): { valid: true } | { valid: false; error: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: "Please select a file." };
  }
  if (file.size > PORTFOLIO_FILE_MAX_BYTES) {
    return { valid: false, error: "File must be 10 MB or smaller." };
  }
  const type = file.type?.toLowerCase();
  if (!type || !PORTFOLIO_ALLOWED_TYPES.includes(type as (typeof PORTFOLIO_ALLOWED_TYPES)[number])) {
    return { valid: false, error: "File must be PDF or image (JPEG, PNG, WebP)." };
  }
  return { valid: true };
}
