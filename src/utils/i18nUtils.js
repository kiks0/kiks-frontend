/**
 * Internationalization Utilities for KIKS
 * Maps countries to their respective language codes and currencies.
 */

export const COUNTRY_MAPPING = [
    { name: 'Albania', code: 'AL', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Argentina', code: 'AR', langCode: 'es', langName: 'Spanish', currency: 'ARS', region: 'Americas' },
    { name: 'Australia', code: 'AU', langCode: 'en', langName: 'English', currency: 'AUD', region: 'Asia-Pacific' },
    { name: 'Austria', code: 'AT', langCode: 'de', langName: 'German', currency: 'EUR', region: 'Europe' },
    { name: 'Bahrain', code: 'BH', langCode: 'en', langName: 'English', currency: 'BHD', region: 'Middle East' },
    { name: 'Belgium', code: 'BE', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Bosnia and Herzegovina', code: 'BA', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Brazil', code: 'BR', langCode: 'pt', langName: 'Portuguese', currency: 'BRL', region: 'Americas' },
    { name: 'Bulgaria', code: 'BG', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Canada', code: 'CA', langCode: 'en', langName: 'English', currency: 'CAD', region: 'Americas' },
    { name: 'Chile', code: 'CL', langCode: 'es', langName: 'Spanish', currency: 'CLP', region: 'Americas' },
    { name: 'Croatia', code: 'HR', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Czech Republic', code: 'CZ', langCode: 'en', langName: 'English', currency: 'CZK', region: 'Europe' },
    { name: 'Denmark', code: 'DK', langCode: 'en', langName: 'English', currency: 'DKK', region: 'Europe' },
    { name: 'Estonia', code: 'EE', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Finland', code: 'FI', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'France', code: 'FR', langCode: 'fr', langName: 'French', currency: 'EUR', region: 'Europe' },
    { name: 'Germany', code: 'DE', langCode: 'de', langName: 'German', currency: 'EUR', region: 'Europe' },
    { name: 'Greece', code: 'GR', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Hong Kong S.A.R.', code: 'HK', langCode: 'en', langName: 'English', currency: 'HKD', region: 'Asia-Pacific' },
    { name: 'Hungary', code: 'HU', langCode: 'en', langName: 'English', currency: 'HUF', region: 'Europe' },
    { name: 'India', code: 'IN', langCode: 'en', langName: 'English', currency: 'INR', region: 'Asia-Pacific' },
    { name: 'Indonesia', code: 'ID', langCode: 'en', langName: 'English', currency: 'IDR', region: 'Asia-Pacific' },
    { name: 'Ireland', code: 'IE', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Israel', code: 'IL', langCode: 'en', langName: 'English', currency: 'ILS', region: 'Middle East' },
    { name: 'Italy', code: 'IT', langCode: 'it', langName: 'Italian', currency: 'EUR', region: 'Europe' },
    { name: 'Japan', code: 'JP', langCode: 'ja', langName: 'Japanese', currency: 'JPY', region: 'Asia-Pacific' },
    { name: 'Saudi Arabia', code: 'SA', langCode: 'en', langName: 'English', currency: 'SAR', region: 'Middle East' },
    { name: 'Korea', code: 'KR', langCode: 'ko', langName: 'Korean', currency: 'KRW', region: 'Asia-Pacific' },
    { name: 'Kuwait', code: 'KW', langCode: 'en', langName: 'English', currency: 'KWD', region: 'Middle East' },
    { name: 'Latin America', code: 'LX', langCode: 'es', langName: 'Spanish', currency: 'USD', region: 'Americas' },
    { name: 'Latvia', code: 'LV', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Lithuania', code: 'LT', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Luxembourg', code: 'LU', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Mainland China', code: 'CN', langCode: 'zh', langName: 'Chinese', currency: 'CNY', region: 'Asia-Pacific' },
    { name: 'Malaysia', code: 'MY', langCode: 'en', langName: 'English', currency: 'MYR', region: 'Asia-Pacific' },
    { name: 'Mexico', code: 'MX', langCode: 'es', langName: 'Spanish', currency: 'MXN', region: 'Americas' },
    { name: 'Netherlands', code: 'NL', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Norway', code: 'NO', langCode: 'en', langName: 'English', currency: 'NOK', region: 'Europe' },
    { name: 'Other Locations', code: 'WW', langCode: 'en', langName: 'English', currency: 'USD', region: 'Global' },
    { name: 'Panama', code: 'PA', langCode: 'es', langName: 'Spanish', currency: 'USD', region: 'Americas' },
    { name: 'Peru', code: 'PE', langCode: 'es', langName: 'Spanish', currency: 'PEN', region: 'Americas' },
    { name: 'Poland', code: 'PL', langCode: 'en', langName: 'English', currency: 'PLN', region: 'Europe' },
    { name: 'Portugal', code: 'PT', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Qatar', code: 'QA', langCode: 'en', langName: 'English', currency: 'QAR', region: 'Middle East' },
    { name: 'Romania', code: 'RO', langCode: 'en', langName: 'English', currency: 'RON', region: 'Europe' },
    { name: 'Russia', code: 'RU', langCode: 'ru', langName: 'Russian', currency: 'RUB', region: 'Europe' },
    { name: 'Serbia', code: 'RS', langCode: 'en', langName: 'English', currency: 'RSD', region: 'Europe' },
    { name: 'Singapore', code: 'SG', langCode: 'en', langName: 'English', currency: 'SGD', region: 'Asia-Pacific' },
    { name: 'Slovakia', code: 'SK', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'Slovenia', code: 'SI', langCode: 'en', langName: 'English', currency: 'EUR', region: 'Europe' },
    { name: 'South Africa', code: 'ZA', langCode: 'en', langName: 'English', currency: 'ZAR', region: 'Africa' },
    { name: 'Spain', code: 'ES', langCode: 'es', langName: 'Spanish', currency: 'EUR', region: 'Europe' },
    { name: 'Sweden', code: 'SE', langCode: 'en', langName: 'English', currency: 'SEK', region: 'Europe' },
    { name: 'Switzerland', code: 'CH', langCode: 'fr', langName: 'French', currency: 'CHF', region: 'Europe' },
    { name: 'Taiwan Region', code: 'TW', langCode: 'zh', langName: 'Chinese', currency: 'TWD', region: 'Asia-Pacific' },
    { name: 'Thailand', code: 'TH', langCode: 'en', langName: 'English', currency: 'THB', region: 'Asia-Pacific' },
    { name: 'Türkiye', code: 'TR', langCode: 'en', langName: 'English', currency: 'TRY', region: 'Middle East' },
    { name: 'UAE', code: 'AE', langCode: 'en', langName: 'English', currency: 'AED', region: 'Middle East' },
    { name: 'United Kingdom', code: 'GB', langCode: 'en', langName: 'English', currency: 'GBP', region: 'Europe' },
    { name: 'United States', code: 'US', langCode: 'en', langName: 'English', currency: 'USD', region: 'Americas' },
    { name: 'Vietnam', code: 'VN', langCode: 'en', langName: 'English', currency: 'VND', region: 'Asia-Pacific' }
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
