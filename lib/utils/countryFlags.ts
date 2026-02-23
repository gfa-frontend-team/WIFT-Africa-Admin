/**
 * Country Flags Utility
 * Converts ISO country codes to emoji flags for chapter dropdowns
 */

/**
 * Converts ISO country code to emoji flag
 * @param countryCode - ISO 3166-1 alpha-2 code (e.g., "NG", "KE", "ZA")
 * @returns Emoji flag or 🌍 for global/invalid codes
 * 
 * @example
 * getEmojiFlag("NG") // Returns 🇳🇬
 * getEmojiFlag("KE") // Returns 🇰🇪
 * getEmojiFlag("AFRICA") // Returns 🌍
 */
export function getEmojiFlag(countryCode: string | undefined): string {
  if (!countryCode || countryCode === 'AFRICA' || countryCode === 'GLOBAL') {
    return '🌍';
  }
  
  // Convert ISO code to regional indicator symbols
  // Each letter is converted to its corresponding regional indicator symbol
  // A = U+1F1E6, B = U+1F1E7, etc.
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => 
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
}

/**
 * Formats chapter display name with flag emoji
 * @param chapterName - Chapter name
 * @param countryCode - ISO country code
 * @returns Formatted string with flag emoji prefix
 * 
 * @example
 * formatChapterWithFlag("Nigeria", "NG") // Returns "🇳🇬 Nigeria"
 * formatChapterWithFlag("Global", "AFRICA") // Returns "🌍 Global"
 */
export function formatChapterWithFlag(chapterName: string, countryCode: string | undefined): string {
  return `${getEmojiFlag(countryCode)} ${chapterName}`;
}
