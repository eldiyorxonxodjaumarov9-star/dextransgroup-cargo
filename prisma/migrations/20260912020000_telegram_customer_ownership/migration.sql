-- CreateTable
CREATE TABLE "TelegramCustomer" (
    "id" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "phone" TEXT,
    "normalizedPhone" TEXT,
    "customerCode" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'UZ',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoOwnershipClaim" (
    "id" TEXT NOT NULL,
    "telegramCustomerId" TEXT NOT NULL,
    "cargoItemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "CargoOwnershipClaim_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "CargoItem" ADD COLUMN IF NOT EXISTS "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TelegramCustomer_telegramUserId_key" ON "TelegramCustomer"("telegramUserId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TelegramCustomer_customerCode_key" ON "TelegramCustomer"("customerCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramCustomer_normalizedPhone_idx" ON "TelegramCustomer"("normalizedPhone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramCustomer_status_idx" ON "TelegramCustomer"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CargoItem_customerId_idx" ON "CargoItem"("customerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CargoOwnershipClaim_status_createdAt_idx" ON "CargoOwnershipClaim"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CargoOwnershipClaim_cargoItemId_status_idx" ON "CargoOwnershipClaim"("cargoItemId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CargoOwnershipClaim_telegramCustomerId_status_idx" ON "CargoOwnershipClaim"("telegramCustomerId", "status");

-- Partial unique: one PENDING claim per customer+cargo
CREATE UNIQUE INDEX IF NOT EXISTS "CargoOwnershipClaim_pending_unique"
ON "CargoOwnershipClaim" ("telegramCustomerId", "cargoItemId")
WHERE "status" = 'PENDING';

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CargoItem_customerId_fkey'
  ) THEN
    ALTER TABLE "CargoItem"
      ADD CONSTRAINT "CargoItem_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "TelegramCustomer"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CargoOwnershipClaim_telegramCustomerId_fkey'
  ) THEN
    ALTER TABLE "CargoOwnershipClaim"
      ADD CONSTRAINT "CargoOwnershipClaim_telegramCustomerId_fkey"
      FOREIGN KEY ("telegramCustomerId") REFERENCES "TelegramCustomer"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CargoOwnershipClaim_cargoItemId_fkey'
  ) THEN
    ALTER TABLE "CargoOwnershipClaim"
      ADD CONSTRAINT "CargoOwnershipClaim_cargoItemId_fkey"
      FOREIGN KEY ("cargoItemId") REFERENCES "CargoItem"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
