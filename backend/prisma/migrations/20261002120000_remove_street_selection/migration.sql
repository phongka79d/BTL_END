-- Preserve the selected street name inside the user's free-text address detail before dropping the old fields.
UPDATE "User"
SET "address_detail" = CASE
  WHEN "address_detail" IS NULL OR "address_detail" = '' THEN "address_street_name"
  ELSE "address_detail" || ', ' || "address_street_name"
END
WHERE "address_street_name" IS NOT NULL
  AND btrim("address_street_name") <> ''
  AND POSITION(LOWER("address_street_name") IN LOWER(COALESCE("address_detail", ''))) = 0;

UPDATE "Order"
SET "shipping_address_detail" = CASE
  WHEN "shipping_address_detail" IS NULL OR "shipping_address_detail" = '' THEN "shipping_street_name"
  ELSE "shipping_address_detail" || ', ' || "shipping_street_name"
END
WHERE "shipping_street_name" IS NOT NULL
  AND btrim("shipping_street_name") <> ''
  AND POSITION(LOWER("shipping_street_name") IN LOWER(COALESCE("shipping_address_detail", ''))) = 0;

-- Drop the obsolete selectable fields only after their values have been folded into detail.
ALTER TABLE "User"
  DROP COLUMN "address_street_ref",
  DROP COLUMN "address_street_name";

ALTER TABLE "Order"
  DROP COLUMN "shipping_street_ref",
  DROP COLUMN "shipping_street_name";
