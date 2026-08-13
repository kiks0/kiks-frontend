import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { removeFromCart, updateQuantity, setCart } from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';
import { getFullImageUrl } from '../utils/url';
import { formatCurrency } from '../utils/currency';
import { logClientActivity } from '../utils/clientLogger';

const CartDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { items, total } = useSelector(state => state.cart);
  const { activeCurrency, rates, symbols } = useSelector(state => state.currency);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // --- REAL-TIME CART SYNC ---
  useEffect(() => {
    if (isOpen) {
      logClientActivity('Opened cart drawer', `Items count: ${items.length}`);
      if (items.length > 0) {
        const syncCart = async () => {
          try {
            const updatedItems = await Promise.all(items.map(async (item) => {
              const currentSlug = item.slug || item.productId || String(item.id).split('-')[0] || item.name?.toLowerCase().replace(/\s+/g, '-');
              console.log(`[STOCK_CHECK] Checking ${item.name} with slug: ${currentSlug}`);
  
              const res = await fetch(`${API_URL}/api/products/${currentSlug}`);
              if (!res.ok) {
                console.warn(`[STOCK_SYNC] Failed to fetch stock for ${item.name}. Status: ${res.status}`);
                return item;
              }
              const fresh = await res.json();
              console.log(`[STOCK_SYNC] ${item.name}: Server says ${fresh.stock_count}, Cart needs ${item.quantity}`);
  
              let freshPrice = fresh.price;
              let freshSalePrice = fresh.sale_price;
              let freshStock = fresh.stock_count;

              if (fresh.variants && (item.isVariant || (item.size && item.size !== (fresh.size || '100 ML')))) {
                  let parsedVariants = [];
                  try {
                      parsedVariants = typeof fresh.variants === 'string' ? JSON.parse(fresh.variants) : (fresh.variants || []);
                      if (!Array.isArray(parsedVariants)) parsedVariants = [];
                  } catch (e) {}
                  const targetSize = String(item.variantName || item.size || '').trim().toLowerCase();
                  const targetIndex = String(item.id).includes('-') ? parseInt(String(item.id).split('-')[1]) - 1 : (item.variantIndex !== undefined ? parseInt(item.variantIndex) - 1 : -1);
                  const matchingVariant = parsedVariants.find((v, idx) => String(v.size || v.name || '').trim().toLowerCase() === targetSize || (targetIndex >= 0 && idx === targetIndex));
                  if (matchingVariant) {
                      freshPrice = (matchingVariant.price !== undefined && matchingVariant.price !== '') ? matchingVariant.price : freshPrice;
                      freshSalePrice = (matchingVariant.sale_price !== undefined && matchingVariant.sale_price !== '') ? matchingVariant.sale_price : '';
                      freshStock = matchingVariant.stock !== undefined ? matchingVariant.stock : freshStock;
                  }
              }

              const priceRaw = (freshSalePrice || freshPrice || "0").toString().replace(/[^0-9]/g, '');
              const currentPrice = parseInt(priceRaw) || 0;
  
              const oldPriceRaw = (item.sale_price || item.price || "0").toString().replace(/[^0-9]/g, '');
              const oldPrice = parseInt(oldPriceRaw) || 0;
  
              const isStockOut = Number(freshStock || 0) <= 0 || Number(freshStock || 0) < Number(item.quantity);
  
              return {
                ...item,
                price: freshPrice,
                sale_price: freshSalePrice,
                stock_count: freshStock,
                isOOS: isStockOut,
                priceChanged: currentPrice !== oldPrice
              };
            }));
  
            // Determine if we need to update Redux (only if data actually changed)
            const hasChanges = updatedItems.some((item, idx) => {
              const old = items[idx];
              if (!old) return true;
              return item.price !== old.price ||
                item.sale_price !== old.sale_price ||
                item.stock_count !== old.stock_count ||
                item.isOOS !== old.isOOS;
            });
  
            if (hasChanges) {
              dispatch(setCart({ items: updatedItems }));
            }
          } catch (err) {
            console.error("Cart sync fault:", err);
          }
        };
        syncCart();
      }
    }
  }, [isOpen]);

  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    return parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
  };

  const handleUpdateQuantity = (id, size, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      dispatch(updateQuantity({ id, size, quantity: newQty }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/80 backdrop-blur-md z-[199999]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[85%] sm:w-[80%] max-w-[360px] sm:max-w-[450px] bg-white z-[200000] shadow-2xl flex flex-col font-sans overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 md:p-8 border-b border-black/5 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center space-x-2.5 sm:space-x-3">
                <h2 className="text-xs sm:text-base md:text-xl font-black tracking-[0.2em] sm:tracking-[0.3em] text-black uppercase flex items-center">
                  {t('cart.your_bag')}
                  {items.some(i => i.isOOS) && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-ping" title="OOS Detected" />
                  )}
                </h2>
                <span className="text-[9px] sm:text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-black tracking-widest shadow-xs">{cartCount}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black shrink-0"
              >
                <X size={18} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto px-4 sm:px-6 md:px-8 py-4 custom-scrollbar">
              {items.length > 0 ? (
                <div className="space-y-6 py-2">
                  {items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${item.id}-${item.size}`}
                      className="flex items-center gap-3.5 sm:gap-4 md:gap-5 group cursor-pointer border-b border-black/5 pb-5 last:border-0 last:pb-0"
                      onClick={() => {
                        const slug = item.slug || item.productId || String(item.id).split('-')[0] || item.name?.toLowerCase().replace(/\s+/g, '-');
                        const variantQuery = item.variantName || item.size || '';
                        onClose();
                        navigate(`/product/${slug}${variantQuery ? `?variant=${encodeURIComponent(variantQuery)}` : ''}`);
                      }}
                    >
                      {/* Product Image */}
                      <div className="w-[70px] sm:w-[78px] md:w-20 aspect-[4/5] bg-neutral-50/80 overflow-hidden flex-shrink-0 border border-black/5 rounded-sm group-hover:border-black/20 transition-all flex items-center justify-center">
                        <img
                          src={getFullImageUrl(item.image_url || item.image || item.banner_url)}
                          alt={item.name}
                          className="w-full h-full object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow flex flex-col justify-center gap-1.5 sm:gap-2 min-w-0 py-0.5">
                        <div>
                          <div className="flex justify-between items-center gap-2">
                            <h3 className="text-xs sm:text-[13px] font-bold tracking-[0.1em] text-black uppercase leading-tight truncate group-hover:opacity-60 transition-opacity">
                              {(item.name || '').replace(/\s*\([^)]*\)$/, '')}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(removeFromCart({ id: item.id, size: item.size }));
                              }}
                              className="p-1 text-black/30 hover:text-red-600 transition-colors shrink-0 -mr-1"
                              title="Remove item"
                            >
                              <Trash2 size={15} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-black/50 tracking-[0.1em] uppercase font-bold mt-0.5 truncate">
                            {item.volume || item.size || '100 ML'}
                          </p>
                        </div>
                        
                        {item.isOOS && (
                          <div className="bg-red-500/10 border border-red-500/20 py-1 px-2 rounded-sm">
                             <p className="text-[8px] text-red-600 font-black tracking-[0.15em] animate-pulse uppercase truncate">
                                UNAVAILABLE • OUT OF STOCK
                             </p>
                          </div>
                        )}

                        {/* Price & Quantity Selector Row */}
                        <div className="flex items-center justify-between gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
                          <p className="text-[12px] sm:text-[13px] font-black tracking-widest text-black">
                            {formatCurrency(parsePrice(item.sale_price || item.price) * item.quantity, activeCurrency, rates, symbols)}
                          </p>

                          <div className="flex items-center border border-black/20 rounded-full h-7 sm:h-8 px-1.5 bg-white shadow-xs shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(item.id, item.size, item.quantity, -1);
                              }}
                              className="p-1 text-black/60 hover:text-black transition-colors"
                            >
                              <Minus size={12} strokeWidth={2} />
                            </button>
                            <span className="w-6 sm:w-7 text-center text-[11px] font-black text-black select-none">{item.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(item.id, item.size, item.quantity, 1);
                              }}
                              className="p-1 text-black/60 hover:text-black transition-colors"
                            >
                              <Plus size={12} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/5 rounded-full flex items-center justify-center mb-5 sm:mb-6">
                    <ShoppingBag size={28} strokeWidth={1} />
                  </div>
                  <p className="text-xs sm:text-sm font-light tracking-[0.2em] uppercase mb-6 sm:mb-8">{t('cart.empty')}</p>
                  <button
                    onClick={onClose}
                    className="text-[9px] sm:text-[10px] tracking-[0.3em] font-bold text-black uppercase border-b border-black/20 pb-1 hover:border-black transition-all"
                  >
                    {t('cart.start')}
                  </button>
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 md:p-8 border-t border-black/10 bg-neutral-50/80 shrink-0">
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <span className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-black/50 uppercase font-black">{t('cart.subtotal')}</span>
                  <span className="text-base sm:text-lg font-black tracking-widest text-black">{formatCurrency(total || 0, activeCurrency, rates, symbols)}</span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <button
                    disabled={items.length === 0}
                    onClick={() => {
                      const oosItems = items.filter(i => i.isOOS);
                      if (oosItems.length > 0) {
                        oosItems.forEach(item => {
                          dispatch(removeFromCart({ id: item.id, size: item.size }));
                        });
                        return;
                      }
                      onClose();
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        navigate('/checkout');
                      }
                    }}
                    className={`w-full py-3.5 sm:py-4 text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.3em] uppercase flex items-center justify-center gap-2 sm:gap-3 transition-all rounded-xs shadow-md ${items.some(i => i.isOOS) ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-black text-white hover:bg-neutral-800'} disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    <span className="relative z-10 flex items-center text-center">
                      {items.some(i => i.isOOS) ? 'REMOVE OUT OF STOCK ITEMS' : t('cart.checkout')} 
                      {!items.some(i => i.isOOS) && <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform shrink-0" />}
                    </span>
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 sm:py-3.5 flex items-center justify-center border border-black/15 bg-white text-black text-[9px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all rounded-xs shadow-xs"
                  >
                    {t('cart.continue')}
                  </button>
                </div>
                <p className="text-[8px] sm:text-[9px] text-black/40 text-center mt-4 sm:mt-5 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold">
                  {t('cart.free_shipping')}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
