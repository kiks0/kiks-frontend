/**
 * Formats a raw price string from the database into a localized currency string.
 * @param {string|number} rawPrice - The price string (e.g., "1499" or "₹ 1,500")
 * @param {string} targetCurrency - (e.g., "USD", "INR")
 * @param {object} rates - Current exchange rates from Redux
 * @param {object} symbols - Currency symbols map
 */
export const formatCurrency = (rawPrice, targetCurrency, rates, symbols) => {
    if (!rawPrice) return '---';
    
    // 1. Extract raw number
    const numericValue = typeof rawPrice === 'number' 
        ? rawPrice 
        : parseInt(rawPrice.toString().replace(/[^0-9]/g, '')) || 0;
    
    // 2. Convert to Target (Base is INR)
    const rate = rates[targetCurrency] || 1;
    const convertedAmount = numericValue * rate;
    
    // 3. Format based on luxury standards
    const symbol = symbols[targetCurrency] || symbols['INR'];
    
    // Handle specific formatting for certain currencies
    if (targetCurrency === 'INR') {
        return symbol + ' ' + Math.round(convertedAmount).toLocaleString('en-IN');
    }
    
    return symbol + ' ' + convertedAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};
