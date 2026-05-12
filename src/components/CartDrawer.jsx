import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { removeFromCart, updateQuantity, setCart } from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';
import { getFullImageUrl } from '../utils/url';
import { formatCurrency } from '../utils/currency';

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
    if (isOpen && items.length > 0) {
      const syncCart = async () => {
        try {
          const updatedItems = await Promise.all(items.map(async (item) => {
            const currentSlug = item.slug || item.name?.toLowerCase().replace(/\s+/g, '-');
            console.log(`[STOCK_CHECK] Checking ${item.name} with slug: ${currentSlug}`);

            const res = await fetch(`${API_URL}/api/products/${currentSlug}`);
            if (!res.ok) {
              console.warn(`[STOCK_SYNC] Failed to fetch stock for ${item.name}. Status: ${res.status}`);
              return item;
            }
            const fresh = await res.json();
            console.log(`[STOCK_SYNC] ${item.name}: Server says ${fresh.stock_count}, Cart needs ${item.quantity}`);

            const priceRaw = (fresh.sale_price || fresh.price || "0").toString().replace(/[^0-9]/g, '');
            const currentPrice = parseInt(priceRaw) || 0;

            const oldPriceRaw = (item.sale_price || item.price || "0").toString().replace(/[^0-9]/g, '');
            const oldPrice = parseInt(oldPriceRaw) || 0;

            const isStockOut = Number(fresh.stock_count || 0) <= 0 || Number(fresh.stock_count || 0) < Number(item.quantity);

            return {
              ...item,
              price: fresh.price,
              sale_price: fresh.sale_price,
              stock_count: fresh.stock_count,
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
            className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white z-[200000] shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-5 md:p-8 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-sm md:text-xl font-black tracking-[0.3em] text-black uppercase flex items-center">
                  {t('cart.your_bag')}
                  {items.some(i => i.isOOS) && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-ping" title="OOS Detected" />
                  )}
                </h2>
                <span className="text-[9px] bg-black/5 px-2 py-0.5 rounded-full text-black/60 font-bold tracking-widest">{cartCount}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto px-6 md:px-8 py-4 custom-scrollbar">
              {items.length > 0 ? (
                <div className="space-y-8 py-4">
                  {items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${item.id}-${item.size}`}
                      className="flex gap-6 group cursor-pointer"
                      onClick={() => {
                        const slug = item.slug || item.name?.toLowerCase().replace(/\s+/g, '-');
                        onClose();
                        navigate(`/product/${slug}`);
                      }}
                    >
                      {/* Product Image */}
                      <div className="w-24 h-32 bg-gray-50 overflow-hidden flex-shrink-0 border border-black/5 group-hover:border-black/20 transition-all">
                        <img
                          src={getFullImageUrl(item.image_url || item.image || item.banner_url)}
                          alt={item.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-xs font-bold tracking-[0.15em] text-black uppercase leading-relaxed pr-4 group-hover:opacity-60 transition-opacity">
                              {item.name}
                            </h3>
                            <div className="flex flex-col items-end space-y-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(removeFromCart({ id: item.id, size: item.size }));
                                }}
                                className="text-black/20 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                              </div>
                          </div>
                          <p className="text-[9px] text-black/40 tracking-[0.1em] uppercase mb-1">
                            {item.category} • {item.volume || item.size}
                          </p>
                          
                          {item.isOOS && (
                            <div className="mt-2 mb-3 bg-red-500/5 border border-red-500/10 py-1.5 px-3 rounded-sm">
                               <p className="text-[9px] text-red-500 font-black tracking-[0.2em] animate-pulse uppercase">
                                  ITEM UNAVAILABLE • OUT OF STOCK
                               </p>
                            </div>
                          )}

                          <p className="text-[11px] text-black font-bold tracking-widest">
                            {formatCurrency(parsePrice(item.sale_price || item.price) * item.quantity, activeCurrency, rates, symbols)}
                          </p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center border border-black/10 rounded-full h-8 px-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(item.id, item.size, item.quantity, -1);
                              }}
                              className="p-1 hover:text-black transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-[11px] font-bold text-black">{item.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(item.id, item.size, item.quantity, 1);
                              }}
                              className="p-1 hover:text-black transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={32} strokeWidth={1} />
                  </div>
                  <p className="text-sm font-light tracking-[0.2em] uppercase mb-8">{t('cart.empty')}</p>
                  <button
                    onClick={onClose}
                    className="text-[10px] tracking-[0.3em] font-bold text-black uppercase border-b border-black/20 pb-1 hover:border-black transition-all"
                  >
                    {t('cart.start')}
                  </button>
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-8 border-t border-black/5 bg-gray-50">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] tracking-[0.4em] text-black/40 uppercase">{t('cart.subtotal')}</span>
                  <span className="text-lg font-bold tracking-widest text-black">{formatCurrency(total || 0, activeCurrency, rates, symbols)}</span>
                </div>

                <div className="space-y-3">
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
                    className={`w-full h-14 text-[11px] font-black tracking-[0.4em] uppercase flex items-center justify-center space-x-4 transition-all group ${items.some(i => i.isOOS) ? 'bg-neutral-400 text-white' : 'bg-black text-white hover:bg-black/90'} disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    <span className="relative z-10 flex items-center">
                      {items.some(i => i.isOOS) ? 'REMOVE UNAVAILABLE ITEMS' : t('cart.checkout')} <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full h-14 flex items-center justify-center border border-black/10 text-black text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-black/5 transition-all"
                  >
                    {t('cart.continue')}
                  </button>
                </div>
                <p className="text-[9px] text-black/20 text-center mt-6 tracking-[0.1em] uppercase">
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
