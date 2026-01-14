export interface GenerationOptions {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  seed?: number;
}

export interface ImageGenerationProvider {
  generate(options: GenerationOptions): Promise<string>; // returns URL
}

/**
 * Google Gemini Nano Banana Image Generation Provider
 * Uses the same GOOGLE_API_KEY as text rewriting
 * 
 * Note: Gemini image generation may use different endpoints depending on availability.
 * This implementation uses the standard Gemini API with image generation capabilities.
 * 
 * If the API returns base64, we'll need to upload it to S3 in the worker.
 */
export class GeminiNanoBananaProvider implements ImageGenerationProvider {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(options: GenerationOptions): Promise<string> {
    // STAFF FIX: Use Imagen 4 stable model WITH models/ prefix (Verified available in account)
    const model = options.model || 'models/imagen-4.0-generate-001';
    const width = options.width || 1024;
    const height = options.height || 768;

    try {
      // Use the generateContent endpoint with image generation model
      const response = await fetch(
        `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: options.prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[NanoBanana] API error: ${response.status}`, errorText);
        throw new Error(`Gemini image generation failed: ${response.status}`);
      }

      const data = await response.json() as any;

      // Handle response - Gemini returns inlineData with base64
      if (data.candidates?.[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData) {
            // Base64 image - return as data URL (worker will handle S3 upload)
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      // Fallback: If response format is unexpected
      console.warn('[NanoBanana] Unexpected response format:', JSON.stringify(data).substring(0, 200));
      throw new Error('Unexpected response format from Gemini image generation');
    } catch (error) {
      console.error('[NanoBanana] Generation failed:', error);
      throw error;
    }
  }
}

export class MockNanoBananaProvider implements ImageGenerationProvider {
  async generate(options: GenerationOptions): Promise<string> {
    console.log(`[MockGen] Generating image with prompt: ${options.prompt}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `https://via.placeholder.com/1024x768.png?text=Generated+${encodeURIComponent(options.prompt.substring(0, 20))}...`;
  }
}

/**
 * Pollinations.ai Image Generation Provider (Free, No Auth)
 * Docs: https://pollinations.ai/
 * 
 * Pros: Instant, free, no key required.
 * Cons: Reliability varies, lower quality than Imagen/Gemini.
 */
export class PollinationsImageProvider implements ImageGenerationProvider {
  async generate(options: GenerationOptions): Promise<string> {
    const prompt = encodeURIComponent(options.prompt);
    const width = options.width || 1024;
    const height = options.height || 768;
    const seed = options.seed || Math.floor(Math.random() * 1000000);

    // Pollinations returns image directly at this URL
    return `https://image.pollinations.ai/prompt/${prompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  }
}

/**
 * Together AI Image Generation Provider (Low Cost, High Performance)
 * Docs: https://api.together.xyz/docs/inference
 * 
 * Recommended Models:
 * - black-forest-labs/FLUX.1-schnell (~$0.0006/img)
 * - stabilityai/stable-diffusion-xl-base-1.0 (~$0.002/img)
 */
export class TogetherImageProvider implements ImageGenerationProvider {
  private apiKey: string;
  private baseUrl = 'https://api.together.xyz/v1/images/generations';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(options: GenerationOptions): Promise<string> {
    if (!this.apiKey) throw new Error('Together AI API key is missing');

    const model = options.model || 'black-forest-labs/FLUX.1-schnell';
    const width = options.width || 1024;
    const height = options.height || 768;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: options.prompt,
          width,
          height,
          steps: 4, // 4 steps for flux-schnell is optimal
          n: 1,
          response_format: 'b64_json'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TogetherAI] API error: ${response.status}`, errorText);
        throw new Error(`Together AI generation failed: ${response.status}`);
      }

      const data = await response.json() as any;
      const base64Data = data.data?.[0]?.b64_json;

      if (!base64Data) {
        throw new Error('Unexpected response format from Together AI');
      }

      return `data:image/png;base64,${base64Data}`;
    } catch (error) {
      console.error('[TogetherAI] Generation failed:', error);
      throw error;
    }
  }
}
