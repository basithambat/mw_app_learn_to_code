import * as cheerio from 'cheerio';
import axios from 'axios';

export interface EnrichmentResult {
  canonicalUrl?: string;
  siteName?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
}

export class EnrichmentService {

  async enrich(sourceUrl: string): Promise<EnrichmentResult> {
    if (!sourceUrl) {
      return {};
    }

    try {
      // Try HTTP GET first (cheap)
      const result = await this.enrichWithHTTP(sourceUrl);
      if (result.canonicalUrl || result.ogImageUrl) {
        return result;
      }
    } catch (error) {
      console.warn(`[Enrichment] HTTP failed for ${sourceUrl}, trying Playwright...`);
    }

    // Fallback to Playwright if HTTP fails or blocked
    try {
      return await this.enrichWithPlaywright(sourceUrl);
    } catch (error) {
      console.error(`[Enrichment] Playwright also failed for ${sourceUrl}:`, error);
      return {};
    }
  }

  private async enrichWithHTTP(url: string): Promise<EnrichmentResult> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentIngestion/1.0)',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);
    const result: EnrichmentResult = {};

    // Canonical URL
    const canonical = $('link[rel="canonical"]').attr('href');
    if (canonical) {
      result.canonicalUrl = canonical.startsWith('http') 
        ? canonical 
        : new URL(canonical, url).href;
    }

    // OG Image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      result.ogImageUrl = ogImage.startsWith('http') 
        ? ogImage 
        : new URL(ogImage, url).href;
    }

    // Twitter Image
    const twitterImage = $('meta[name="twitter:image"]').attr('content') ||
                        $('meta[property="twitter:image"]').attr('content');
    if (twitterImage) {
      result.twitterImageUrl = twitterImage.startsWith('http') 
        ? twitterImage 
        : new URL(twitterImage, url).href;
    }

    // Site Name
    const siteName = $('meta[property="og:site_name"]').attr('content');
    if (siteName) {
      result.siteName = siteName;
    }

    return result;
  }

  private async enrichWithPlaywright(url: string): Promise<EnrichmentResult> {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const html = await page.content();
      await browser.close();

      const $ = cheerio.load(html);
      const result: EnrichmentResult = {};

      // Canonical
      const canonical = $('link[rel="canonical"]').attr('href');
      if (canonical) {
        result.canonicalUrl = canonical.startsWith('http') 
          ? canonical 
          : new URL(canonical, url).href;
      }

      // OG Image
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) {
        result.ogImageUrl = ogImage.startsWith('http') 
          ? ogImage 
          : new URL(ogImage, url).href;
      }

      // Twitter Image
      const twitterImage = $('meta[name="twitter:image"]').attr('content') ||
                          $('meta[property="twitter:image"]').attr('content');
      if (twitterImage) {
        result.twitterImageUrl = twitterImage.startsWith('http') 
          ? twitterImage 
          : new URL(twitterImage, url).href;
      }

      // Site Name
      const siteName = $('meta[property="og:site_name"]').attr('content');
      if (siteName) {
        result.siteName = siteName;
      }

      return result;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

}
