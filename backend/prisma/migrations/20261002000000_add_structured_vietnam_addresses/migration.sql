-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "address_province_code" TEXT,
  ADD COLUMN "address_province_name" TEXT,
  ADD COLUMN "address_ward_code" TEXT,
  ADD COLUMN "address_ward_name" TEXT,
  ADD COLUMN "address_street_ref" TEXT,
  ADD COLUMN "address_street_name" TEXT,
  ADD COLUMN "address_detail" TEXT;

-- AlterTable
ALTER TABLE "Order"
  ADD COLUMN "shipping_province_code" TEXT,
  ADD COLUMN "shipping_province_name" TEXT,
  ADD COLUMN "shipping_ward_code" TEXT,
  ADD COLUMN "shipping_ward_name" TEXT,
  ADD COLUMN "shipping_street_ref" TEXT,
  ADD COLUMN "shipping_street_name" TEXT,
  ADD COLUMN "shipping_address_detail" TEXT;
