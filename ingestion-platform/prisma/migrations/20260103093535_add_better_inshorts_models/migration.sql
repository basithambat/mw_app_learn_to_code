-- CreateTable
CREATE TABLE "editions" (
    "edition_id" TEXT NOT NULL,
    "date_local" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL,
    "cutoff_at" TIMESTAMPTZ(6) NOT NULL,
    "mode" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "editions_pkey" PRIMARY KEY ("edition_id")
);

-- CreateTable
CREATE TABLE "edition_stories" (
    "edition_id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "added_at" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT NOT NULL,
    "update_count" INTEGER NOT NULL DEFAULT 0,
    "last_updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "edition_stories_pkey" PRIMARY KEY ("edition_id","story_id")
);

-- CreateTable
CREATE TABLE "explore_items" (
    "explore_id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "fetched_at" TIMESTAMPTZ(6) NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "explore_items_pkey" PRIMARY KEY ("explore_id")
);

-- CreateTable
CREATE TABLE "user_story_state" (
    "user_id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "edition_id" TEXT,
    "status" TEXT NOT NULL,
    "delivered_at" TIMESTAMPTZ(6),
    "seen_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "saved_at" TIMESTAMPTZ(6),
    "dismissed_at" TIMESTAMPTZ(6),
    "dismissed_scope" TEXT,

    CONSTRAINT "user_story_state_pkey" PRIMARY KEY ("user_id","story_id")
);

-- CreateTable
CREATE TABLE "category_preferences" (
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "manual_order" INTEGER NOT NULL,
    "lock_order" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "category_preferences_pkey" PRIMARY KEY ("user_id","category_id")
);

-- CreateTable
CREATE TABLE "category_ranking_signals" (
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "auto_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_ranking_signals_pkey" PRIMARY KEY ("user_id","category_id")
);

-- CreateIndex
CREATE INDEX "editions_date_local_idx" ON "editions"("date_local");

-- CreateIndex
CREATE INDEX "edition_stories_edition_id_rank_idx" ON "edition_stories"("edition_id", "rank");

-- CreateIndex
CREATE INDEX "explore_items_category_score_idx" ON "explore_items"("category", "score" DESC);

-- CreateIndex
CREATE INDEX "explore_items_fetched_at_idx" ON "explore_items"("fetched_at");

-- CreateIndex
CREATE INDEX "user_story_state_user_id_edition_id_status_idx" ON "user_story_state"("user_id", "edition_id", "status");

-- CreateIndex
CREATE INDEX "user_story_state_user_id_status_idx" ON "user_story_state"("user_id", "status");

-- CreateIndex
CREATE INDEX "category_preferences_user_id_manual_order_idx" ON "category_preferences"("user_id", "manual_order");

-- AddForeignKey
ALTER TABLE "edition_stories" ADD CONSTRAINT "edition_stories_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "editions"("edition_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edition_stories" ADD CONSTRAINT "edition_stories_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explore_items" ADD CONSTRAINT "explore_items_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_story_state" ADD CONSTRAINT "user_story_state_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
