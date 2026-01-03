import { getEnv } from '../config/env';

export interface ExtractOptions {
  onlyMainContent?: boolean;
  maxAge?: number; // Cache max age in seconds
  storeInCache?: boolean;
}

export interface ExtractResponse {
  data?: any;
  markdown?: string;
  html?: string;
  metadata?: any;
}

export class FirecrawlEngine {
  private apiKey: string | null;
  private baseUrl = 'https://api.firecrawl.dev';

  constructor() {
    const env = getEnv() as any;
    this.apiKey = env.FIRECRAWL_API_KEY || null;
  }

  private checkApiKey(): void {
    if (!this.apiKey) {
      throw new Error('Firecrawl API key not set');
    }
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    this.checkApiKey();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Firecrawl API error (${response.status}): ${errorText}`
      );
    }

    return response;
  }

  /**
   * Extract structured data from a URL using Firecrawl's v2 extraction API
   */
  async extract(
    url: string,
    schema: any,
    options: ExtractOptions = {}
  ): Promise<ExtractResponse> {
    // Firecrawl v2 API format
    const payload = {
      urls: [url],
      schema: schema,
    };

    const response = await this.request('/v2/extract', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    // Firecrawl v2 API response structure:
    // If async: { success: true, id: "...", urlTrace: [] }
    // If sync: { success: true, data: [{ url, extract: {...}, markdown, html }] }
    
    // Check if it's an async job (has id but no data yet)
    if (result.id && !result.data) {
      // Poll for results
      console.log(`[Firecrawl] Async job ${result.id}, polling for results...`);
      return await this.pollExtractResult(result.id);
    }
    
    // Handle sync response with data
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      const firstResult = result.data[0];
      return {
        data: firstResult.extract || firstResult.data,
        markdown: firstResult.markdown,
        html: firstResult.html,
        metadata: firstResult.metadata
      };
    }
    
    // Fallback: return as-is
    return result;
  }

  /**
   * Scrape a URL to get HTML/markdown (fallback for image extraction)
   */
  async scrape(
    url: string,
    options: { onlyMainContent?: boolean; maxAge?: number } = {}
  ): Promise<ExtractResponse> {
    // Firecrawl v2 API format for scrape
    const payload = {
      url: url,
    };

    const response = await this.request('/v2/scrape', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  /**
   * Poll for async extract job results
   */
  private async pollExtractResult(jobId: string, maxAttempts = 30, delayMs = 2000): Promise<ExtractResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      try {
        const response = await this.request(`/v2/extract/${jobId}`, {
          method: 'GET',
        });
        
        const result = await response.json();
        
        // If job is complete, return the data
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          const firstResult = result.data[0];
          return {
            data: firstResult.extract || firstResult.data,
            markdown: firstResult.markdown,
            html: firstResult.html,
            metadata: firstResult.metadata
          };
        }
        
        // If still processing, continue polling
        if (result.status === 'processing' || result.status === 'pending') {
          continue;
        }
        
        // If failed or unknown status, throw
        if (result.status === 'failed' || result.status === 'error') {
          throw new Error(`Firecrawl job failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        if (attempt === maxAttempts - 1) throw error;
        // Continue polling on error (might be transient)
      }
    }
    
    throw new Error(`Firecrawl job ${jobId} timed out after ${maxAttempts} attempts`);
  }

  /**
   * Retry helper with exponential backoff
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 2,
    baseDelay = 250
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Unknown error');
  }
}
