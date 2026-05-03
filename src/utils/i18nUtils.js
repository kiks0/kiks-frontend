/**
 * Internationalization Utilities for KIKS
 * Maps countries to their respective language codes and currencies.
 */

export const COUNTRY_MAPPING = [
    { name: 'Albania', code: 'AL', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Argentina', code: 'AR', langCode: 'es', langName: 'Spanish', currency: 'ARS' },
    { name: 'Australia', code: 'AU', langCode: 'en', langName: 'English', currency: 'AUD' },
    { name: 'Austria', code: 'AT', langCode: 'de', langName: 'German', currency: 'EUR' },
    { name: 'Bahrain', code: 'BH', langCode: 'en', langName: 'English', currency: 'BHD' },
    { name: 'Belgium', code: 'BE', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Bosnia and Herzegovina', code: 'BA', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Brazil', code: 'BR', langCode: 'pt', langName: 'Portuguese', currency: 'BRL' },
    { name: 'Bulgaria', code: 'BG', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Canada', code: 'CA', langCode: 'en', langName: 'English', currency: 'CAD' },
    { name: 'Chile', code: 'CL', langCode: 'es', langName: 'Spanish', currency: 'CLP' },
    { name: 'Croatia', code: 'HR', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Czech Republic', code: 'CZ', langCode: 'en', langName: 'English', currency: 'CZK' },
    { name: 'Denmark', code: 'DK', langCode: 'en', langName: 'English', currency: 'DKK' },
    { name: 'Estonia', code: 'EE', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Finland', code: 'FI', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'France', code: 'FR', langCode: 'fr', langName: 'French', currency: 'EUR' },
    { name: 'Germany', code: 'DE', langCode: 'de', langName: 'German', currency: 'EUR' },
    { name: 'Greece', code: 'GR', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Hong Kong S.A.R.', code: 'HK', langCode: 'en', langName: 'English', currency: 'HKD' },
    { name: 'Hungary', code: 'HU', langCode: 'en', langName: 'English', currency: 'HUF' },
    { name: 'India', code: 'IN', langCode: 'en', langName: 'English', currency: 'INR' },
    { name: 'Indonesia', code: 'ID', langCode: 'en', langName: 'English', currency: 'IDR' },
    { name: 'Ireland', code: 'IE', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Israel', code: 'IL', langCode: 'en', langName: 'English', currency: 'ILS' },
    { name: 'Italy', code: 'IT', langCode: 'it', langName: 'Italian', currency: 'EUR' },
    { name: 'Japan', code: 'JP', langCode: 'ja', langName: 'Japanese', currency: 'JPY' },
    { name: 'Saudi Arabia', code: 'SA', langCode: 'en', langName: 'English', currency: 'SAR' },
    { name: 'Korea', code: 'KR', langCode: 'ko', langName: 'Korean', currency: 'KRW' },
    { name: 'Kuwait', code: 'KW', langCode: 'en', langName: 'English', currency: 'KWD' },
    { name: 'Latin America', code: 'LX', langCode: 'es', langName: 'Spanish', currency: 'USD' },
    { name: 'Latvia', code: 'LV', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Lithuania', code: 'LT', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Luxembourg', code: 'LU', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Mainland China', code: 'CN', langCode: 'zh', langName: 'Chinese', currency: 'CNY' },
    { name: 'Malaysia', code: 'MY', langCode: 'en', langName: 'English', currency: 'MYR' },
    { name: 'Mexico', code: 'MX', langCode: 'es', langName: 'Spanish', currency: 'MXN' },
    { name: 'Netherlands', code: 'NL', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Norway', code: 'NO', langCode: 'en', langName: 'English', currency: 'NOK' },
    { name: 'Other Locations', code: 'WW', langCode: 'en', langName: 'English', currency: 'USD' },
    { name: 'Panama', code: 'PA', langCode: 'es', langName: 'Spanish', currency: 'USD' },
    { name: 'Peru', code: 'PE', langCode: 'es', langName: 'Spanish', currency: 'PEN' },
    { name: 'Poland', code: 'PL', langCode: 'en', langName: 'English', currency: 'PLN' },
    { name: 'Portugal', code: 'PT', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Qatar', code: 'QA', langCode: 'en', langName: 'English', currency: 'QAR' },
    { name: 'Romania', code: 'RO', langCode: 'en', langName: 'English', currency: 'RON' },
    { name: 'Russia', code: 'RU', langCode: 'ru', langName: 'Russian', currency: 'RUB' },
    { name: 'Serbia', code: 'RS', langCode: 'en', langName: 'English', currency: 'RSD' },
    { name: 'Singapore', code: 'SG', langCode: 'en', langName: 'English', currency: 'SGD' },
    { name: 'Slovakia', code: 'SK', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'Slovenia', code: 'SI', langCode: 'en', langName: 'English', currency: 'EUR' },
    { name: 'South Africa', code: 'ZA', langCode: 'en', langName: 'English', currency: 'ZAR' },
    { name: 'Spain', code: 'ES', langCode: 'es', langName: 'Spanish', currency: 'EUR' },
    { name: 'Sweden', code: 'SE', langCode: 'en', langName: 'English', currency: 'SEK' },
    { name: 'Switzerland', code: 'CH', langCode: 'fr', langName: 'French', currency: 'CHF' },
    { name: 'Taiwan Region', code: 'TW', langCode: 'zh', langName: 'Chinese', currency: 'TWD' },
    { name: 'Thailand', code: 'TH', langCode: 'en', langName: 'English', currency: 'THB' },
    { name: 'Türkiye', code: 'TR', langCode: 'en', langName: 'English', currency: 'TRY' },
    { name: 'UAE', code: 'AE', langCode: 'en', langName: 'English', currency: 'AED' },
    { name: 'United Kingdom', code: 'GB', langCode: 'en', langName: 'English', currency: 'GBP' },
    { name: 'United States', code: 'US', langCode: 'en', langName: 'English', currency: 'USD' },
    { name: 'Vietnam', code: 'VN', langCode: 'en', langName: 'English', currency: 'VND' }
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
