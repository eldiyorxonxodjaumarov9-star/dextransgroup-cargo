-- Idempotent core tables for production recovery when migrations were
-- falsely baselined without applying SQL. Does not drop or truncate data.

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "telegramUrl" TEXT,
    "locationUrl" TEXT,
    "country" TEXT,
    "province" TEXT,
    "district" TEXT,
    "receiver" TEXT,
    "phone2" TEXT,
    "workingHours" TEXT,
    "notes" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "entryType" TEXT NOT NULL DEFAULT 'MANUAL',
    "pdfUrl" TEXT,
    "pdfFileName" TEXT,
    "pdfData" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Operator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "telegram" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "warehouseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CargoItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trackNumber" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "price" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "etaDate" TIMESTAMP(3),
    "telegramUrl" TEXT,
    "locationUrl" TEXT,
    "chinaAddress" TEXT,
    "notes" TEXT,
    "entryType" TEXT NOT NULL DEFAULT 'MANUAL',
    "pdfUrl" TEXT,
    "pdfFileName" TEXT,
    "pdfData" BYTEA,
    "warehouseId" TEXT,
    "operatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CargoItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GuestServiceMedia" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT,
    "fileName" TEXT,
    "data" BYTEA,
    "mediaUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuestServiceMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CargoItem_trackNumber_key" ON "CargoItem"("trackNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_username_key" ON "AdminUser"("username");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Operator_warehouseId_fkey') THEN
    ALTER TABLE "Operator" ADD CONSTRAINT "Operator_warehouseId_fkey"
      FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CargoItem_warehouseId_fkey') THEN
    ALTER TABLE "CargoItem" ADD CONSTRAINT "CargoItem_warehouseId_fkey"
      FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CargoItem_operatorId_fkey') THEN
    ALTER TABLE "CargoItem" ADD CONSTRAINT "CargoItem_operatorId_fkey"
      FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
