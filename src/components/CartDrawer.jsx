import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { removeFromCart, updateQuantity } from '../store/cartSlice';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../utils/url';

const CartDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, total } = useSelector((state) => state.cart);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    return parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
  };

  const handleUpdateQuantity = (id, size, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty > 0) dispatch(updateQuantity({ id, size, quantity: newQty }));
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-dark-900 z-[101] shadow-2xl shadow-black/80 flex flex-col font-sans border-l border-white/[0.05]"
          >
            {/* Header */}
            <div className="px-8 py-7 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <h2 className="text-[13px] font-normal tracking-[0.35em] text-white/90 uppercase">
                  {t('cart.your_bag')}
                </h2>
                {cartCount > 0 && (
                  <span className="text-[9px] text-gold-500 tracking-[0.2em] font-normal">
                    {cartCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white transition-colors duration-300"
              >
                <X size={20} strokeWidth={1} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-grow overflow-y-auto px-8 py-6 custom-scrollbar">
              {items.length > 0 ? (
                <div className="space-y-9 py-2">
                  {items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${item.id}-${item.size}`}
                      className="flex gap-5 group"
                    >
                      {/* Image */}
                      <div className="w-20 h-28 bg-dark-800 overflow-hidden flex-shrink-0 border border-white/[0.06]">
                        <img
                          src={getFullImageUrl(item.image_url || item.image || item.banner_url)}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-[11px] font-normal tracking-[0.18em] text-white/85 uppercase leading-relaxed pr-3">
                              {item.name}
                            </h3>
                            <button
                              onClick={() =>
                                dispatch(removeFromCart({ id: item.id, size: item.size }))
                              }
                              className="text-white/15 hover:text-white/60 transition-colors mt-0.5"
                            >
                              <Trash2 size={14} strokeWidth={1} />
                            </button>
                          </div>
                          <p className="text-[9px] text-white/30 tracking-[0.15em] uppercase mb-2">
                            {item.category} · {item.volume || item.size}
                          </p>
                          <p className="text-[12px] text-gold-500 font-normal tracking-[0.1em]">
                            ₹{(parsePrice(item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity — sharp square controls */}
                        <div className="flex items-center space-x-3 mt-3">
                          <div className="flex items-center border border-white/[0.1] h-8">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.size, item.quantity, -1)
                              }
                              className="w-8 h-full flex items-center justify-center text-white/40 hover:text-white transition-colors border-r border-white/[0.1]"
                            >
                              <Minus size={11} strokeWidth={1.5} />
                            </button>
                            <span className="w-8 text-center text-[11px] font-normal text-white/80">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.size, item.quantity, 1)
                              }
                              className="w-8 h-full flex items-center justify-center text-white/40 hover:text-white transition-colors border-l border-white/[0.1]"
                            >
                              <Plus size={11} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <ShoppingBag size={28} strokeWidth={0.75} className="mb-7 text-white/40" />
                  <p className="text-[11px] font-normal tracking-[0.35em] uppercase mb-8">
                    {t('cart.empty')}
                  </p>
                  <button
                    onClick={onClose}
                    className="text-[9px] tracking-[0.4em] font-normal text-white uppercase border-b border-white/20 pb-0.5 hover:border-white transition-all"
                  >
                    {t('cart.start')}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-8 py-8 border-t border-white/[0.06] bg-dark-800/60">
                <div className="flex items-end justify-between mb-7">
                  <span className="text-[9px] tracking-[0.45em] text-white/30 uppercase">
                    {t('cart.subtotal')}
                  </span>
                  <span className="text-[18px] font-light tracking-[0.05em] text-white">
                    ₹{(total || 0).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="flex h-13 items-center justify-center bg-white text-dark-900 text-[10px] font-normal tracking-[0.4em] uppercase hover:bg-gold-500 hover:text-white transition-all duration-500 relative group overflow-hidden h-[52px]"
                  >
                    <span className="relative z-10 flex items-center">
                      {t('cart.checkout')}
                      <ArrowRight
                        size={14}
                        strokeWidth={1}
                        className="ml-3 group-hover:translate-x-1 transition-transform"
                      />
                    </span>
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full h-[44px] flex items-center justify-center border border-white/10 text-white text-[9px] font-normal tracking-[0.4em] uppercase hover:border-white/30 hover:bg-white/[0.02] transition-all"
                  >
                    {t('cart.continue')}
                  </button>
                </div>

                <p className="text-[8px] text-white/20 text-center mt-6 tracking-[0.18em] uppercase">
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
