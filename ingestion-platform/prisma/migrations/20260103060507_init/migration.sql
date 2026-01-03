-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_category" TEXT,
    "title_original" TEXT NOT NULL,
    "summary_original" TEXT NOT NULL,
    "source_url" TEXT,
    "published_at" TIMESTAMPTZ(6),
    "title_rewritten" TEXT,
    "summary_rewritten" TEXT,
    "rewrite_status" TEXT NOT NULL DEFAULT 'pending',
    "rewrite_model" TEXT,
    "rewrite_prompt_version" TEXT,
    "rewrite_hash" TEXT,
    "image_status" TEXT NOT NULL DEFAULT 'pending',
    "image_selected_url" TEXT,
    "image_storage_url" TEXT,
    "image_prompt" TEXT,
    "image_model" TEXT,
    "image_metadata" JSONB,
    "raw_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_runs" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "category" TEXT,
    "run_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "stats_json" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "ingestion_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_state" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "last_cursor" TEXT,
    "last_etag" TEXT,
    "last_run_at" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_items_hash_key" ON "content_items"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_rewrite_hash_key" ON "content_items"("rewrite_hash");

-- CreateIndex
CREATE INDEX "content_items_source_id_created_at_idx" ON "content_items"("source_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "content_items_source_category_created_at_idx" ON "content_items"("source_category", "created_at" DESC);

-- CreateIndex
CREATE INDEX "content_items_created_at_idx" ON "content_items"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ingestion_runs_run_id_key" ON "ingestion_runs"("run_id");

-- CreateIndex
CREATE INDEX "ingestion_runs_source_id_started_at_idx" ON "ingestion_runs"("source_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "ingestion_runs_status_idx" ON "ingestion_runs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "source_state_source_id_key" ON "source_state"("source_id");
