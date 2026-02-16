/**
 * Country Mapping Utility for Flag Display
 * 
 * Provides utilities for mapping African countries to their ISO codes
 * and generating flag URLs from FlagsAPI.com
 */

/**
 * Mapping of African country names to their ISO 3166-1 alpha-2 codes
 * Covers all 54 African nations
 */
export const COUNTRY_TO_CODE: Record<string, string> = {
    // North Africa
    'Algeria': 'DZ',
    'Egypt': 'EG',
    'Libya': 'LY',
    'Morocco': 'MA',
    'Tunisia': 'TN',
    'Sudan': 'SD',
    'South Sudan': 'SS',

    // West Africa
    'Benin': 'BJ',
    'Burkina Faso': 'BF',
    'Cape Verde': 'CV',
    'Cabo Verde': 'CV',
    'Ivory Coast': 'CI',
    "Côte d'Ivoire": 'CI',
    'Gambia': 'GM',
    'Ghana': 'GH',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Liberia': 'LR',
    'Mali': 'ML',
    'Mauritania': 'MR',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'Senegal': 'SN',
    'Sierra Leone': 'SL',
    'Togo': 'TG',

    // Central Africa
    'Cameroon': 'CM',
    'Central African Republic': 'CF',
    'Chad': 'TD',
    'Congo': 'CG',
    'Democratic Republic of the Congo': 'CD',
    'DR Congo': 'CD',
    'DRC': 'CD',
    'Equatorial Guinea': 'GQ',
    'Gabon': 'GA',
    'São Tomé and Príncipe': 'ST',
    'Sao Tome and Principe': 'ST',

    // East Africa
    'Burundi': 'BI',
    'Comoros': 'KM',
    'Djibouti': 'DJ',
    'Eritrea': 'ER',
    'Ethiopia': 'ET',
    'Kenya': 'KE',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Mauritius': 'MU',
    'Mozambique': 'MZ',
    'Rwanda': 'RW',
    'Seychelles': 'SC',
    'Somalia': 'SO',
    'Tanzania': 'TZ',
    'Uganda': 'UG',

    // Southern Africa
    'Angola': 'AO',
    'Botswana': 'BW',
    'Eswatini': 'SZ',
    'Swaziland': 'SZ',
    'Lesotho': 'LS',
    'Namibia': 'NA',
    'South Africa': 'ZA',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW',
}

/**
 * Get the ISO country code from either a code or country name
 * 
 * @param code - ISO country code (e.g., 'GH', 'NG')
 * @param name - Country name (e.g., 'Ghana', 'Nigeria')
 * @returns ISO code or 'AFRICA' for HQ/Global chapters, 'ZZ' for unknown
 * 
 * @example
 * getCountryIsoCode('GH', 'Ghana') // Returns 'GH'
 * getCountryIsoCode('HQ', 'Global') // Returns 'AFRICA'
 * getCountryIsoCode('', 'Kenya') // Returns 'KE'
 */
export function getCountryIsoCode(code?: string, name?: string): string {
    // Special case: HQ/Global chapters
    if (code === 'HQ' || code === 'AFRICA' || name === 'Global' || name === 'HQ') {
        return 'AFRICA'
    }

    // If we have a valid 2-letter code, use it
    if (code && code.length === 2 && code !== 'ZZ') {
        return code.toUpperCase()
    }

    // Try to find the code from the country name
    if (name && COUNTRY_TO_CODE[name]) {
        return COUNTRY_TO_CODE[name]
    }

    // Fallback to unknown
    return 'AFRICA'
}

/**
 * Generate a flag URL from FlagsAPI.com or return 'AFRICA' for HQ chapters
 * 
 * @param code - ISO country code (e.g., 'GH', 'NG')
 * @param name - Country name (e.g., 'Ghana', 'Nigeria')
 * @returns Flag URL or 'AFRICA' for special rendering
 * 
 * @example
 * getCountryFlagUrl('GH', 'Ghana') 
 * // Returns 'https://flagsapi.com/GH/flat/64.png'
 * 
 * getCountryFlagUrl('HQ', 'Global')
 * // Returns 'AFRICA' (to be rendered as 🌍 emoji)
 */
export function getCountryFlagUrl(code?: string, name?: string): string {
    const isoCode = getCountryIsoCode(code, name)

    // Special case: return indicator for globe emoji rendering
    if (isoCode === 'AFRICA') {
        return 'AFRICA'
    }

    // Generate FlagsAPI.com URL
    return `https://flagsapi.com/${isoCode}/flat/64.png`
}
