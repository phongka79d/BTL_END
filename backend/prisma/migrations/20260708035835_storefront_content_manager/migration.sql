-- CreateEnum
CREATE TYPE "StorefrontLinkType" AS ENUM ('product', 'category', 'customUrl');

-- CreateEnum
CREATE TYPE "StorefrontNavItemType" AS ENUM ('link', 'mega_menu');

-- CreateTable
CREATE TABLE "CarouselSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "primary_button_label" TEXT NOT NULL,
    "link_type" "StorefrontLinkType" NOT NULL,
    "product_id" TEXT,
    "category_id" TEXT,
    "custom_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarouselSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontNavItem" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "item_type" "StorefrontNavItemType" NOT NULL,
    "icon" TEXT,
    "link_type" "StorefrontLinkType",
    "product_id" TEXT,
    "category_id" TEXT,
    "custom_url" TEXT,
    "featured_title" TEXT,
    "featured_description" TEXT,
    "featured_image_url" TEXT,
    "featured_link_label" TEXT,
    "featured_link_type" "StorefrontLinkType",
    "featured_product_id" TEXT,
    "featured_category_id" TEXT,
    "featured_custom_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorefrontNavItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarouselSlide_is_active_sort_order_idx" ON "CarouselSlide"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "StorefrontNavItem_parent_id_idx" ON "StorefrontNavItem"("parent_id");

-- CreateIndex
CREATE INDEX "StorefrontNavItem_is_active_sort_order_idx" ON "StorefrontNavItem"("is_active", "sort_order");

-- AddForeignKey
ALTER TABLE "CarouselSlide" ADD CONSTRAINT "CarouselSlide_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarouselSlide" ADD CONSTRAINT "CarouselSlide_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontNavItem" ADD CONSTRAINT "StorefrontNavItem_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "StorefrontNavItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontNavItem" ADD CONSTRAINT "StorefrontNavItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontNavItem" ADD CONSTRAINT "StorefrontNavItem_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontNavItem" ADD CONSTRAINT "StorefrontNavItem_featured_product_id_fkey" FOREIGN KEY ("featured_product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontNavItem" ADD CONSTRAINT "StorefrontNavItem_featured_category_id_fkey" FOREIGN KEY ("featured_category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
