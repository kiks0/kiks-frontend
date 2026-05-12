/**
 * Formats a raw price string from the database into a localized currency string.
 * Supports ALL currencies dynamically using Intl.NumberFormat.
 */
export const formatCurrency = (rawPrice, targetCurrency, rates) => {
    if (!rawPrice) return '---';
    
    // 1. Extract raw number
    const numericValue = typeof rawPrice === 'number' 
        ? rawPrice 
        : parseFloat(rawPrice.toString().replace(/[^0-9.]/g, '')) || 0;
    
    // 2. Convert to Target (Base is INR)
    const rate = rates[targetCurrency] || 1;
    const convertedAmount = numericValue * rate;
    
    // 3. Dynamic formatting for ANY currency
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: targetCurrency,
            minimumFractionDigits: targetCurrency === 'INR' || targetCurrency === 'JPY' ? 0 : 2,
            maximumFractionDigits: targetCurrency === 'INR' || targetCurrency === 'JPY' ? 0 : 2
        }).format(convertedAmount);
    } catch (e) {
        // Fallback if currency code is invalid or unsupported by browser
        return `${targetCurrency} ${convertedAmount.toFixed(2)}`;
    }
};
