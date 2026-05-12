/**
 * KIKS Ultra Luxury - Analytics Utility
 * Handles GA4 Ecommerce Events for Revenue Tracking
 */

export const trackPurchase = (orderId, orderData) => {
    if (typeof window.gtag !== 'function') {
        console.warn('GA4 (gtag.js) not found. Skipping purchase tracking.');
        return;
    }

    const items = orderData.items.map(item => ({
        item_id: item.product_id,
        item_name: item.product_name,
        index: 0,
        item_brand: "KIKS",
        item_category: "Fragrance",
        price: Number(item.price),
        quantity: item.quantity
    }));

    window.gtag("event", "purchase", {
        transaction_id: orderId,
        value: Number(orderData.total_amount),
        tax: 0,
        shipping: 0,
        currency: "INR",
        coupon: orderData.applied_promo_code || "",
        items: items
    });

    console.log(`[ANALYTICS] Purchase tracked for Order #${orderId}`);
};
