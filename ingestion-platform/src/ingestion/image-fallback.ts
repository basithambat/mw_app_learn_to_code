/**
 * Fallback image extraction for Inshorts
 * Parses background-image URLs from HTML when Firecrawl extraction misses them
 */

export function extractImageFromHtml(html: string, title: string): string | null {
  // Inshorts uses background-image in style attributes
  // Look for patterns like: style="background-image: url('https://media.inshorts.com/...')"
  const backgroundImageRegex = /background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi;
  const matches = Array.from(html.matchAll(backgroundImageRegex));

  // Filter for Inshorts media URLs
  const inshortsMediaRegex = /https?:\/\/media\.inshorts\.com\/[^\s'")]+/i;
  for (const match of matches) {
    const url = match[1];
    if (inshortsMediaRegex.test(url)) {
      return url;
    }
  }

  // Fallback: look for any img tags with Inshorts media URLs
  const imgTagRegex = /<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi;
  const imgMatches = Array.from(html.matchAll(imgTagRegex));
  for (const match of imgMatches) {
    const url = match[1];
    if (inshortsMediaRegex.test(url)) {
      return url;
    }
  }

  return null;
}

/**
 * Extract image URL from markdown (if Firecrawl returns markdown)
 */
export function extractImageFromMarkdown(markdown: string): string | null {
  // Look for markdown image syntax: ![alt](url)
  const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const matches = Array.from(markdown.matchAll(markdownImageRegex));

  const inshortsMediaRegex = /https?:\/\/media\.inshorts\.com\/[^\s)]+/i;
  for (const match of matches) {
    const url = match[1];
    if (inshortsMediaRegex.test(url)) {
      return url;
    }
  }

  return null;
}
