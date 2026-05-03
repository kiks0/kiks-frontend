/**
 * Internationalization Utilities for KIKS
 * Maps countries to their respective language codes and currencies.
 */

export const COUNTRY_MAPPING = [
    // Asia
    { name: 'India', langCode: 'en', langName: 'English', currency: 'INR' },
    { name: 'United Arab Emirates', langCode: 'en', langName: 'English', currency: 'AED' },
    { name: 'Saudi Arabia', langCode: 'en', langName: 'English', currency: 'AED' },
    { name: 'Qatar', langCode: 'en', langName: 'English', currency: 'QAR' },
    { name: 'Kuwait', langCode: 'en', langName: 'English', currency: 'KWD' },
    { name: 'Oman', langCode: 'en', langName: 'English', currency: 'OMR' },
    { name: 'Bahrain', langCode: 'en', langName: 'English', currency: 'BHD' },
    { name: 'Japan', langCode: 'ja', langName: 'Japanese', currency: 'JPY' },
    { name: 'China', langCode: 'zh', langName: 'Chinese', currency: 'CNY' },
    { name: 'Singapore', langCode: 'en', langName: 'English', currency: 'SGD' },
    { name: 'Malaysia', langCode: 'en', langName: 'English', currency: 'MYR' },
    { name: 'Thailand', langCode: 'en', langName: 'English', currency: 'THB' },
    { name: 'Vietnam', langCode: 'en', langName: 'English', currency: 'VND' },
    { name: 'Indonesia', langCode: 'en', langName: 'English', currency: 'IDR' },
    { name: 'South Korea', langCode: 'en', langName: 'English', currency: 'KRW' },
    { name: 'Hong Kong', langCode: 'en', langName: 'English', currency: 'HKD' },

    // Europe
    { name: 'France', langCode: 'fr', langName: 'French', currency: 'EUR' },
    { name: 'United Kingdom', langCode: 'en', langName: 'English', currency: 'GBP' },
    { name: 'Germany', langCode: 'de', langName: 'German', currency: 'EUR' },
    { name: 'Italy', langCode: 'it', langName: 'Italian', currency: 'EUR' },
    { name: 'Spain', langCode: 'es', langName: 'Spanish', currency: 'EUR' },
    { name: 'Switzerland', langCode: 'fr', langName: 'French', currency: 'EUR' },
    { name: 'Netherlands', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Belgium', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Sweden', langCode: 'en', langName: 'English', currency: 'SEK' },
    { name: 'Norway', langCode: 'en', langName: 'English', currency: 'NOK' },
    { name: 'Denmark', langCode: 'en', langName: 'English', currency: 'DKK' },
    { name: 'Portugal', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Austria', langCode: 'de', langName: 'German', currency: 'EUR' },
    { name: 'Greece', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Turkey', langCode: 'en', langName: 'English', currency: 'TRY' },
    { name: 'Russia', langCode: 'ru', langName: 'Russian', currency: 'RUB' },

    // Americas
    { name: 'United States', langCode: 'en', langName: 'English', currency: 'USD' },
    { name: 'Canada', langCode: 'en', langName: 'English', currency: 'CAD' },
    { name: 'Mexico', langCode: 'es', langName: 'Spanish', currency: 'MXN' },
    { name: 'Brazil', langCode: 'es', langName: 'Spanish', currency: 'BRL' },
    { name: 'Argentina', langCode: 'es', langName: 'Spanish', currency: 'ARS' },

    // Oceania
    { name: 'Australia', langCode: 'en', langName: 'English', currency: 'AUD' },

    // Africa
    { name: 'South Africa', langCode: 'en', langName: 'English', currency: 'ZAR' },
    { name: 'Israel', langCode: 'en', langName: 'English', currency: 'ILS' }
];

/**
 * Detect and apply language/currency settings based on country name
 */
export const applyLocationSettings = (countryName, i18n, dispatch, setCurrencyAction) => {
    const mapping = COUNTRY_MAPPING.find(c => c.name === countryName);
    if (mapping) {
        // Apply language
        if (i18n && i18n.changeLanguage) {
            i18n.changeLanguage(mapping.langCode);
        }
        
        // Apply currency
        if (dispatch && setCurrencyAction) {
            dispatch(setCurrencyAction(mapping.currency));
        }
        
        // Persist location name
        localStorage.setItem('kiks_location_name', countryName);
        
        return mapping;
    }
    return null;
};
