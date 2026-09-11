/**
 * Phone normalization for Telegram contact / customer profiles.
 * Prefers E.164; Uzbekistan (+998) supported.
 */

export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = String(raw).replace(/[^\d+]/g, "").trim();
  if (!digits) return null;

  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;

  // Local UZ formats: 998XXXXXXXXX, 0XXXXXXXXX, 9XXXXXXXX
  const onlyDigits = digits.replace(/\D/g, "");
  if (onlyDigits.startsWith("998") && onlyDigits.length === 12) {
    return `+${onlyDigits}`;
  }
  if (onlyDigits.startsWith("0") && onlyDigits.length === 10) {
    return `+998${onlyDigits.slice(1)}`;
  }
  if (onlyDigits.length === 9 && onlyDigits.startsWith("9")) {
    return `+998${onlyDigits}`;
  }

  if (digits.startsWith("+") && onlyDigits.length >= 10 && onlyDigits.length <= 15) {
    return `+${onlyDigits}`;
  }

  if (onlyDigits.length >= 10 && onlyDigits.length <= 15) {
    return `+${onlyDigits}`;
  }

  return null;
}

export function phonesMatch(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  return Boolean(na && nb && na === nb);
}
