import { createHash } from 'crypto';
import { NormalizedItem } from '../adapters/types';

/**
 * Normalize text for hashing:
 * - lowercase
 * - trim
 * - collapse whitespace to single spaces
 * - remove non-printing characters
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
}

/**
 * Compute dedupe hash per spec:
 * sha256(
 *   normalize(source_id) + "||" +
 *   normalize(source_category || "") + "||" +
 *   normalize(title) + "||" +
 *   normalize(summary) + "||" +
 *   normalize(source_url || "")
 * )
 */
export function computeContentHash(item: NormalizedItem): string {
  const parts = [
    normalizeText(item.source_id),
    normalizeText(item.source_category || ''),
    normalizeText(item.title),
    normalizeText(item.summary),
    normalizeText(item.source_url || ''),
  ];

  const combined = parts.join('||');
  return createHash('sha256').update(combined).digest('hex');
}
