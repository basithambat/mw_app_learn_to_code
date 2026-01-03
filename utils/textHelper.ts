/**
 * Truncates text to maximum 60 words
 * If text is less than 60 words, it returns as-is
 * If text is more than 60 words, it truncates to 60 words and adds ellipsis
 */
export const truncateTo60Words = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Split into words, filtering out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  
  // If 60 words or less, return as is
  if (words.length <= 60) {
    return words.join(' ');
  }
  
  // If more than 60 words, truncate to 60 and add ellipsis
  return words.slice(0, 60).join(' ') + '...';
};
