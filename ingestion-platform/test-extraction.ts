
import { HTMLExtractor } from './src/ingestion/html-extractor';

async function test() {
    const extractor = new HTMLExtractor();
    const url = 'https://inshorts.com/en/read';
    const selector = 'div[itemscope][itemtype="http://schema.org/NewsArticle"]';

    console.log('Fetching:', url);
    try {
        const result = await extractor.extract(url, selector);
        console.log(`Extracted ${result.items.length} items`);
        if (result.items.length > 0) {
            console.log('Sample item:', result.items[0]);
        }
    } catch (e) {
        console.error('Extraction failed:', e);
    }
}

test();
