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
    // Use Gemini 2.5 Flash Image model (Nano Banana)
    // Model name: gemini-2.5-flash-image or gemini-3-pro-image-preview
    const model = options.model || 'gemini-2.5-flash-image';
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
