
import { RSSExtractor } from './src/ingestion/rss-extractor';

async function test() {
    const extractor = new RSSExtractor();
    const url = 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms';

    console.log('Fetching RSS:', url);
    try {
        const items = await extractor.extract(url);
        console.log(`Extracted ${items.length} items`);
        if (items.length > 0) {
            console.log('Sample item:', items[0]);
        }
    } catch (e) {
        console.error('Extraction failed:', e);
    }
}

test();
