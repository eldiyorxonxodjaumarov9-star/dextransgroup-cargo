import { isTelegramAdminId, parseTelegramAdminIds } from "@/lib/telegram/config";

export function assertTelegramAdmin(
  userId: number | string | null | undefined,
  adminIds = parseTelegramAdminIds()
): boolean {
  if (userId == null) return false;
  return isTelegramAdminId(userId, adminIds);
}

export function requireTelegramAdmin(
  userId: number | string | null | undefined,
  adminIds?: string[]
): asserts userId is number | string {
  if (!assertTelegramAdmin(userId, adminIds)) {
    throw new Error("UNAUTHORIZED_ADMIN");
  }
}
