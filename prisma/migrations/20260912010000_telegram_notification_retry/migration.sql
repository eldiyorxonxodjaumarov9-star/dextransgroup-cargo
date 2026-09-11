-- AlterTable
ALTER TABLE "TelegramNotificationEvent" ADD COLUMN IF NOT EXISTS "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "TelegramNotificationEvent" ADD COLUMN IF NOT EXISTS "lockedAt" TIMESTAMP(3);

-- DropIndex
DROP INDEX IF EXISTS "TelegramNotificationEvent_status_createdAt_idx";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramNotificationEvent_status_nextAttemptAt_idx" ON "TelegramNotificationEvent"("status", "nextAttemptAt");
