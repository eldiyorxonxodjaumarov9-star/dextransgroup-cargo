-- CreateTable
CREATE TABLE IF NOT EXISTS "TelegramBotSession" (
    "id" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "step" TEXT,
    "payloadJson" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramBotSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TelegramProcessedUpdate" (
    "updateId" BIGINT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramProcessedUpdate_pkey" PRIMARY KEY ("updateId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TelegramCargoSubscription" (
    "id" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "cargoItemId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramCargoSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TelegramNotificationEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cargoItemId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "chatId" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "TelegramNotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TelegramBotSession_telegramUserId_key" ON "TelegramBotSession"("telegramUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramBotSession_expiresAt_idx" ON "TelegramBotSession"("expiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramCargoSubscription_cargoItemId_isActive_idx" ON "TelegramCargoSubscription"("cargoItemId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TelegramCargoSubscription_telegramUserId_cargoItemId_key" ON "TelegramCargoSubscription"("telegramUserId", "cargoItemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramNotificationEvent_status_createdAt_idx" ON "TelegramNotificationEvent"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramNotificationEvent_cargoItemId_idx" ON "TelegramNotificationEvent"("cargoItemId");

-- AddForeignKey (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TelegramCargoSubscription_cargoItemId_fkey'
  ) THEN
    ALTER TABLE "TelegramCargoSubscription"
      ADD CONSTRAINT "TelegramCargoSubscription_cargoItemId_fkey"
      FOREIGN KEY ("cargoItemId") REFERENCES "CargoItem"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
