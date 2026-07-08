CREATE TABLE "StorefrontSetting" (
    "id" TEXT NOT NULL,
    "featured_product_limit" INTEGER NOT NULL DEFAULT 6,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorefrontSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StorefrontFeaturedProduct" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorefrontFeaturedProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StorefrontFeaturedProduct_product_id_key" ON "StorefrontFeaturedProduct"("product_id");
CREATE INDEX "StorefrontFeaturedProduct_is_active_sort_order_idx" ON "StorefrontFeaturedProduct"("is_active", "sort_order");

ALTER TABLE "StorefrontFeaturedProduct" ADD CONSTRAINT "StorefrontFeaturedProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "StorefrontSetting" ("id", "featured_product_limit", "updated_at")
VALUES ('home', 6, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
