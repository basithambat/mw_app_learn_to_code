-- AlterTable
ALTER TABLE "content_items" ADD COLUMN     "canonical_url" TEXT,
ADD COLUMN     "enrichment_error" TEXT,
ADD COLUMN     "enrichment_status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "image_source_page_url" TEXT,
ADD COLUMN     "og_image_url" TEXT,
ADD COLUMN     "site_name" TEXT,
ADD COLUMN     "twitter_image_url" TEXT;

-- CreateTable
CREATE TABLE "image_search_cache" (
    "id" TEXT NOT NULL,
    "query_hash" TEXT NOT NULL,
    "query_text" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "results_json" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_search_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "image_search_cache_query_hash_key" ON "image_search_cache"("query_hash");

-- CreateIndex
CREATE INDEX "image_search_cache_created_at_idx" ON "image_search_cache"("created_at");

-- CreateIndex
CREATE INDEX "content_items_enrichment_status_idx" ON "content_items"("enrichment_status");
