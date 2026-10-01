-- Add nullable checkout snapshots so existing orders remain readable.
ALTER TABLE "Order"
  ADD COLUMN "recipient_name" TEXT,
  ADD COLUMN "recipient_phone" TEXT,
  ADD COLUMN "note" TEXT;
