import "@/lib/env";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { SESSION_COOKIE } from "./constants";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    // Do not throw during page render — login/session simply fails closed.
    console.error("[auth] SESSION_SECRET is missing in production");
    return "";
  }

  return "dextrans-cargo-dev-secret";
}

function sign(value: string) {
  const secret = getSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(userId: string, username: string) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET is required to create a session");
  }
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${username}.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  if (!getSecret()) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [userId, username, expiresStr, signature] = parts;
  const payload = `${userId}.${username}.${expiresStr}`;
  const expected = sign(payload);
  if (!expected) return null;

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  return { userId, username };
}

export async function loginAdmin(username: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return user;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
