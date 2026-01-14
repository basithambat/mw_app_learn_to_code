import { pipeline } from '@xenova/transformers';

export class EmbeddingService {
    private static instance: EmbeddingService;
    private extractor: any;

    private constructor() { }

    public static async getInstance(): Promise<EmbeddingService> {
        if (!EmbeddingService.instance) {
            EmbeddingService.instance = new EmbeddingService();
            // Initialize the pipeline
            // We use quantization to keep it fast and low memory
            EmbeddingService.instance.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                quantized: false, // Better accuracy for cosine sim
            });
        }
        return EmbeddingService.instance;
    }

    /**
     * Generate 384-dimensional embedding for text
     */
    async generateEmbedding(text: string): Promise<number[]> {
        if (!text) return new Array(384).fill(0);

        // Truncate text to fit model context (approx)
        const truncated = text.slice(0, 1000);

        // Generate embedding
        // pooling: 'mean' gives the sentence embedding
        const output = await this.extractor(truncated, { pooling: 'mean', normalize: true });

        // Convert Tensor to standard array
        return Array.from(output.data);
    }
}
