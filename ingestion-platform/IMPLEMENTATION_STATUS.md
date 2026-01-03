# Implementation Status vs Full Spec

## ✅ What's DONE

### 1. Core Infrastructure ✅
- [x] Database schema (Postgres/Prisma)
- [x] Redis queue setup (BullMQ)
- [x] S3/Minio storage
- [x] Docker compose setup
- [x] Environment configuration

### 2. Adapter System ✅
- [x] SourceAdapter interface
- [x] Adapter registry
- [x] Inshorts adapter (using Playwright - needs to switch to HTML)
- [x] RSS extractor (created, not registered as adapter)
- [x] HTML extractor (created, not used for Inshorts)
- [x] Playwright extractor (working)

### 3. Extraction Pipeline ✅
- [x] `ingest-source` queue + worker
- [x] Content hashing & deduplication
- [x] Database upsert logic
- [x] Multi-method extraction (RSS/HTML/Playwright/Firecrawl)

### 4. Rewrite Pipeline ✅
- [x] `rewrite-item` queue + worker
- [x] LLM service with Gemini/Mistral/OpenAI support
- [x] Rewrite hash idempotency
- [x] JSON validation & retry logic

### 5. Image Pipeline (Partial) ⚠️
- [x] `resolve-image` queue + worker
- [x] Image download & S3 upload
- [x] Basic image validation
- [x] Mock image search (needs real SERP)
- [x] Mock nano banana (needs real integration)

### 6. API & Scheduler ✅
- [x] Feed API (`GET /api/feed`)
- [x] Sources API (`GET /api/sources`)
- [x] Job trigger API (`POST /api/jobs/run`)
- [x] Basic scheduler (hourly)

---

## ❌ What's MISSING (Per Full Spec)

### 1. Database Schema Updates ❌
**Missing fields in `content_items`:**
- [ ] `canonical_url` (enrichment)
- [ ] `site_name` (enrichment)
- [ ] `og_image_url` (enrichment)
- [ ] `twitter_image_url` (enrichment)
- [ ] `enrichment_status` enum (pending | done | failed)
- [ ] `enrichment_error` text
- [ ] `image_source_page_url` (SERP result page)
- [ ] `image_status` needs `og_used` option

**Missing table:**
- [ ] `image_search_cache` (for SERP query caching)

### 2. Enrichment Stage ❌
**Completely missing:**
- [ ] `enrich-item` queue
- [ ] `enrich-item` worker
- [ ] OG metadata extractor (canonical, og:image, og:site_name)
- [ ] Playwright fallback for blocked pages
- [ ] Enrichment status tracking

**Current flow:** `ingest-source → rewrite-item → resolve-image`  
**Should be:** `ingest-source → enrich-item → rewrite-item → resolve-image`

### 3. Inshorts Adapter Fix ❌
**Current:** Uses Playwright (expensive, slow)  
**Should be:** Uses HTML/Cheerio (cheap, fast)

**Needs:**
- [ ] Switch Inshorts to `extractionMethod: 'html'`
- [ ] Fix HTML selector for Inshorts schema.org structure
- [ ] Test HTML extraction works

### 4. RSS Adapter Registration ❌
- [ ] Create generic RSS adapter class
- [ ] Register RSS adapters in registry
- [ ] Test with real RSS feeds

### 5. SERP Image Search ❌
**Current:** Mock provider  
**Needs:**
- [ ] SerpAPI provider implementation
- [ ] Serper provider implementation (alternative)
- [ ] DataForSEO provider (alternative)
- [ ] Query caching (image_search_cache table)
- [ ] Candidate ranking & filtering
- [ ] Source page URL tracking

### 6. Image Resolution Priority ❌
**Current:** Web search → Generate  
**Should be:** OG image → SERP → nano banana

**Missing:**
- [ ] Check `og_image_url` first
- [ ] Validate OG image before using
- [ ] Only fallback to SERP if OG fails
- [ ] Only generate if both fail

### 7. Nano Banana Integration ❌
**Current:** Mock implementation  
**Needs:**
- [ ] Real nano banana API integration
- [ ] Category-based style presets
- [ ] Prompt template with constraints
- [ ] Image generation metadata storage

### 8. Source Registry ❌
**Current:** Hardcoded in scheduler  
**Needs:**
- [ ] `SOURCE_REGISTRY` with intervals
- [ ] Support for multiple source types
- [ ] Configurable intervals per source

### 9. Prompt Registry ❌
**Missing:**
- [ ] Category-based prompt templates
- [ ] Versioned prompts
- [ ] Prompt registry file/module

### 10. Image Search Caching ❌
**Missing:**
- [ ] `image_search_cache` table
- [ ] Query hash computation
- [ ] Cache lookup before API call
- [ ] TTL policy (30 days)

---

## 🔧 What Needs UPDATES

### 1. Inshorts Adapter
- [ ] Change from Playwright to HTML extraction
- [ ] Fix selectors for schema.org markup
- [ ] Test extraction works

### 2. Image Resolution Logic
- [ ] Add OG image check as first priority
- [ ] Implement SERP providers
- [ ] Add proper nano banana integration
- [ ] Update image_status enum

### 3. Pipeline Flow
- [ ] Add `enrich-item` stage between ingest and rewrite
- [ ] Update worker to handle enrich queue
- [ ] Ensure proper sequencing

### 4. Database Migration
- [ ] Add enrichment fields
- [ ] Add image_search_cache table
- [ ] Update image_status enum values

---

## 📋 Implementation Priority

### Phase 1: Critical (Blocking)
1. **Switch Inshorts to HTML** (cost savings)
2. **Add enrichment stage** (OG image extraction)
3. **Update DB schema** (enrichment fields)
4. **Fix image priority** (OG → SERP → Generate)

### Phase 2: Important (Core Features)
5. **SERP provider** (SerpAPI/Serper)
6. **Image search cache** (cost optimization)
7. **Nano banana integration** (fallback generation)
8. **RSS adapter registration** (multi-source)

### Phase 3: Nice to Have
9. **Prompt registry** (category-based prompts)
10. **Source registry** (configurable intervals)
11. **Better error handling** (enrichment failures)

---

## 🎯 Next Steps to Complete Spec

1. **Update DB schema** - Add enrichment + cache tables
2. **Create enrichment worker** - OG extraction
3. **Fix Inshorts adapter** - HTML instead of Playwright
4. **Implement SERP providers** - SerpAPI/Serper
5. **Integrate nano banana** - Real API calls
6. **Update image resolution** - OG → SERP → Generate priority
7. **Add caching** - Image search query cache
8. **Test end-to-end** - Full pipeline validation

---

## Current Status Summary

**Working:** ✅ Extraction, Rewrite, Basic Image, API, Scheduler  
**Missing:** ❌ Enrichment, SERP, Nano Banana, OG Priority, Caching  
**Needs Fix:** ⚠️ Inshorts (HTML), Image Priority, DB Schema

**Completion:** ~60% of full spec
