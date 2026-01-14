import { getEnv } from '../config/env';
import axios from 'axios';

export interface RewriteResult {
  rewrittenTitle: string;
  rewrittenSubtext: string;
}

/**
 * LLM Service with cost-optimized providers
 * Primary: Gemini 2.0 Flash (best cost/quality)
 * Fallback: Mistral Small 3.1 (cheapest)
 */
export class LLMService {
  private googleApiKey?: string;
  private mistralApiKey?: string;
  private openaiKey?: string;

  constructor() {
    const env = getEnv() as any;
    this.googleApiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
    this.mistralApiKey = env.MISTRAL_API_KEY;
    this.openaiKey = env.OPENAI_API_KEY;
  }

  async rewriteContent(
    title: string,
    summary: string,
    retryCount = 0
  ): Promise<RewriteResult> {
    const prompt = `Rewrite this news item to be catchy and concise. Keep the core meaning but make it more engaging.

Title: ${title}
Summary: ${summary}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "rewrittenTitle": "catchy rewritten title",
  "rewrittenSubtext": "engaging rewritten summary"
}`;

    try {
      // Primary: Gemini 2.0 Flash (best cost/quality ratio)
      if (this.googleApiKey) {
        return await this.callGemini(prompt);
      }

      // Fallback 1: Mistral Small (cheapest)
      if (this.mistralApiKey) {
        return await this.callMistral(prompt);
      }

      // Fallback 2: OpenAI (if available)
      if (this.openaiKey) {
        return await this.callOpenAI(prompt);
      }

      // No API keys - use local model (LaMini-Flan-T5)
      console.log('No LLM API keys found, using local Xenova/LaMini-Flan-T5-248M...');
      return await this.callLocal(title, summary);

    } catch (error) {
      // Retry with fallback
      if (retryCount < 1) {
        console.warn(`LLM call failed, retrying with fallback...`);
        return await this.callLocal(title, summary);
      }
      throw error;
    }
  }

  /**
   * Generic chat method for custom LLM interactions (e.g., policy checking)
   */
  async chat(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json';
    }
  ): Promise<string> {
    const combined = `${systemPrompt}\n\n${userPrompt}`;
    const temp = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 500;
    const responseFormat = options?.responseFormat ?? 'text';

    try {
      // Primary: Gemini
      if (this.googleApiKey) {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.googleApiKey}`,
          {
            contents: [{
              parts: [{ text: combined }]
            }],
            generationConfig: {
              temperature: temp,
              maxOutputTokens: maxTokens,
              ...(responseFormat === 'json' && { responseMimeType: 'application/json' })
            }
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
          }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('No response from Gemini');
        }

        return text.trim();
      }

      // Fallback: Mistral
      if (this.mistralApiKey) {
        const response = await axios.post(
          'https://api.mistral.ai/v1/chat/completions',
          {
            model: 'mistral-small-2409',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: temp,
            max_tokens: maxTokens
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.mistralApiKey}`
            },
            timeout: 60000
          }
        );

        return response.data.choices?.[0]?.message?.content?.trim() || '';
      }

      throw new Error('No LLM API key available for chat');
    } catch (error) {
      console.error('[LLM] Chat failed:', error);
      throw error;
    }
  }

  private async callLocal(title: string, summary: string): Promise<RewriteResult> {
    const { pipeline } = await import('@xenova/transformers');

    // Lazy load the pipeline
    // LaMini-Flan-T5-248M is ~500MB quantized, fits easily in cloud run memory
    const generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-248M', {
      quantized: true,
    });

    // We do two separate generations for better control
    // 1. Title
    const titlePrompt = `Rewrite this news title to be catchy, short, and engaging: "${title}"`;
    const titleOutput = await generator(titlePrompt, {
      max_new_tokens: 20,
      temperature: 0.7,
      repetition_penalty: 1.2
    });
    const newTitle = (titleOutput[0] as any).generated_text;

    // 2. Summary
    const summaryPrompt = `Summarize this news story in a concise, engaging way (max 60 words): "${summary}"`;
    const summaryOutput = await generator(summaryPrompt, {
      max_new_tokens: 80,
      temperature: 0.6,
      repetition_penalty: 1.2
    });
    const newSummary = (summaryOutput[0] as any).generated_text;

    return {
      rewrittenTitle: newTitle.replace(/"/g, '').trim(),
      rewrittenSubtext: newSummary.replace(/"/g, '').trim()
    };
  }

  private async callGemini(prompt: string): Promise<RewriteResult> {
    if (!this.googleApiKey) {
      throw new Error('Google API key not set');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.googleApiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
          responseMimeType: 'application/json'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 1 minute
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No response from Gemini');
    }

    return this.parseJSONResponse(text);
  }

  private async callMistral(prompt: string): Promise<RewriteResult> {
    if (!this.mistralApiKey) {
      throw new Error('Mistral API key not set');
    }

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-2409', // Cheapest option
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.mistralApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const text = response.data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No response from Mistral');
    }

    return this.parseJSONResponse(text);
  }

  private async callOpenAI(prompt: string): Promise<RewriteResult> {
    if (!this.openaiKey) {
      throw new Error('OpenAI API key not set');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // Cheaper than GPT-4
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const text = response.data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No response from OpenAI');
    }

    return this.parseJSONResponse(text);
  }

  private parseJSONResponse(text: string): RewriteResult {
    // Try to extract JSON from response (handles markdown code blocks)
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(jsonText);

      // Validate structure
      if (!parsed.rewrittenTitle || !parsed.rewrittenSubtext) {
        throw new Error('Invalid JSON structure');
      }

      return {
        rewrittenTitle: parsed.rewrittenTitle.trim(),
        rewrittenSubtext: parsed.rewrittenSubtext.trim()
      };
    } catch (error) {
      // If JSON parsing fails, try to extract from text
      const titleMatch = jsonText.match(/"rewrittenTitle":\s*"([^"]+)"/);
      const subtextMatch = jsonText.match(/"rewrittenSubtext":\s*"([^"]+)"/);

      if (titleMatch && subtextMatch) {
        return {
          rewrittenTitle: titleMatch[1],
          rewrittenSubtext: subtextMatch[1]
        };
      }

      throw new Error(`Failed to parse LLM response: ${text.substring(0, 100)}`);
    }
  }

  private mockRewrite(title: string, summary: string): RewriteResult {
    // Simple fallback if no API keys
    return {
      rewrittenTitle: title, // Keep original if no LLM
      rewrittenSubtext: summary.substring(0, 200)
    };
  }
}
