import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { removeFromCart, updateQuantity } from '../store/cartSlice';
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[199999]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-[#0a0a0a] z-[200000] shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-5 md:p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-sm md:text-xl font-black tracking-[0.3em] text-white uppercase">{t('cart.your_bag')}</h2>
                <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-white/60 font-bold tracking-widest">{cartCount}</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
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
                      className="flex gap-6 group"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-32 bg-[#151515] overflow-hidden flex-shrink-0 border border-white/5">
                        <img 
                          src={getFullImageUrl(item.image_url || item.image || item.banner_url)} 
                          alt={item.name} 
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-xs font-bold tracking-[0.15em] text-white uppercase leading-relaxed pr-4">
                              {item.name}
                            </h3>
                            <button 
                              onClick={() => dispatch(removeFromCart({ id: item.id, size: item.size }))}
                              className="text-white/20 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-[9px] text-white/40 tracking-[0.1em] uppercase mb-1">
                            {item.category} • {item.volume || item.size}
                          </p>
                          <p className="text-[11px] text-gold-500 font-bold tracking-widest">
                            {formatCurrency(parsePrice(item.price) * item.quantity, activeCurrency, rates, symbols)}
                          </p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border border-white/10 rounded-full h-8 px-1">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity, -1)}
                              className="p-1 hover:text-gold-500 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-[11px] font-bold text-white">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity, 1)}
                              className="p-1 hover:text-gold-500 transition-colors"
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
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={32} strokeWidth={1} />
                  </div>
                  <p className="text-sm font-light tracking-[0.2em] uppercase mb-8">{t('cart.empty')}</p>
                  <button 
                    onClick={onClose}
                    className="text-[10px] tracking-[0.3em] font-bold text-white uppercase border-b border-white/20 pb-1 hover:border-white transition-all"
                  >
                    {t('cart.start')}
                  </button>
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-[#0d0d0d]">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] tracking-[0.4em] text-white/40 uppercase">{t('cart.subtotal')}</span>
                  <span className="text-lg font-bold tracking-widest text-white">{formatCurrency(total || 0, activeCurrency, rates, symbols)}</span>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      onClose();
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        navigate('/checkout');
                      }
                    }}
                    className="flex h-14 w-full items-center justify-center bg-white text-black text-[11px] font-black tracking-[0.3em] uppercase hover:bg-gold-500 transition-all duration-500 relative group overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      {t('cart.checkout')} <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full h-14 flex items-center justify-center border border-white/10 text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white/5 transition-all"
                  >
                    {t('cart.continue')}
                  </button>
                </div>
                <p className="text-[9px] text-white/20 text-center mt-6 tracking-[0.1em] uppercase">
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
