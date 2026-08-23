import { createHmac, timingSafeEqual } from "crypto";

export type TelegramInitDataUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

export type ValidatedTelegramInitData = {
  user: TelegramInitDataUser;
  authDate: number;
  raw: Record<string, string>;
};

export class InitDataValidationError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "InitDataValidationError";
    this.status = status;
  }
}

function safeEqualHex(a: string, b: string) {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    if (left.length === 0 || left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function buildDataCheckString(params: URLSearchParams): string {
  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort((a, b) => a.localeCompare(b));
  return pairs.join("\n");
}

export function computeWebAppDataHash(
  dataCheckString: string,
  botToken: string
): string {
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  return createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
}

export function getInitDataMaxAgeSeconds(
  envValue = process.env.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS
): number {
  const parsed = Number(envValue ?? 600);
  if (!Number.isFinite(parsed) || parsed <= 0) return 600;
  return Math.floor(parsed);
}

/**
 * Validates raw Telegram.WebApp.initData per official WebApp algorithm.
 * Never trust initDataUnsafe alone — always call this server-side first.
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
  options?: { maxAgeSeconds?: number; nowSeconds?: number }
): ValidatedTelegramInitData {
  if (!initData || typeof initData !== "string") {
    throw new InitDataValidationError("Missing initData");
  }
  if (!botToken) {
    throw new InitDataValidationError("Bot token is not configured", 503);
  }

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    throw new InitDataValidationError("Malformed initData");
  }

  const hash = params.get("hash");
  if (!hash) {
    throw new InitDataValidationError("Missing hash");
  }

  const dataCheckString = buildDataCheckString(params);
  const expected = computeWebAppDataHash(dataCheckString, botToken);
  if (!safeEqualHex(hash, expected)) {
    throw new InitDataValidationError("Invalid initData signature");
  }

  const authDateRaw = params.get("auth_date");
  const authDate = Number(authDateRaw);
  if (!authDateRaw || !Number.isFinite(authDate) || authDate <= 0) {
    throw new InitDataValidationError("Invalid auth_date");
  }

  const now = options?.nowSeconds ?? Math.floor(Date.now() / 1000);
  const maxAge = options?.maxAgeSeconds ?? getInitDataMaxAgeSeconds();
  if (now - authDate > maxAge) {
    throw new InitDataValidationError("initData expired");
  }

  const userRaw = params.get("user");
  if (!userRaw) {
    throw new InitDataValidationError("Missing user");
  }

  let user: TelegramInitDataUser;
  try {
    user = JSON.parse(userRaw) as TelegramInitDataUser;
  } catch {
    throw new InitDataValidationError("Malformed user JSON");
  }

  if (
    !user ||
    typeof user !== "object" ||
    typeof user.id !== "number" ||
    !Number.isFinite(user.id) ||
    !Number.isInteger(user.id) ||
    user.id <= 0
  ) {
    throw new InitDataValidationError("Invalid user id");
  }

  const raw: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    raw[key] = value;
  }

  return { user, authDate, raw };
}
