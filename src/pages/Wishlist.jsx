import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toggleWishlistAndSync } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { openAuthModal } from '../store/uiSlice';
import { ShoppingBag, X, Heart, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getFullImageUrl } from '../utils/url';
import { formatCurrency } from '../utils/currency';

const Wishlist = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { activeCurrency, rates, symbols } = useSelector((state) => state.currency);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal());
    }
  }, [isAuthenticated, dispatch]);

  const [addedId, setAddedId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      dispatch(openAuthModal());
      return;
    }
    dispatch(addToCart({ ...product, quantity: 1 }));
    setAddedId(product.id);
    showNotification(`${product.name} added to bag.`);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="bg-white min-h-screen text-black font-sans pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1400px]">
        
        {/* Page Header */}
        <header className="mb-16 md:mb-24 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/account" className="inline-flex items-center text-[10px] tracking-[0.4em] text-black/30 hover:text-black transition-colors uppercase mb-12 group">
              <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> BACK TO ACCOUNT
            </Link>
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-[0.15em] uppercase text-black mb-8">Wishlist</h1>
        </header>

        <AnimatePresence mode="popLayout">
          {wishlistItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-8 opacity-20">
                 <Heart size={64} strokeWidth={0.5} className="text-black" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif tracking-widest uppercase mb-6 text-black">Your wishlist is currently empty</h2>
              <p className="text-black/40 text-xs tracking-widest uppercase mb-10 max-w-md leading-relaxed">
                Explore our collections and save your favorite fragrances to find them easily later.
              </p>
              <Link to="/collection/arambh" className="inline-flex items-center justify-center px-10 py-4 bg-black text-white text-[10px] tracking-[0.2em] font-bold uppercase border border-black hover:bg-transparent hover:text-black transition-all duration-500">
                EXPLORE THE COLLECTION
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {wishlistItems.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="group relative flex flex-col"
                >
                  {/* Remove Button */}
                  <button 
                    onClick={() => dispatch(toggleWishlistAndSync(product))}
                    className="absolute top-4 right-4 z-20 p-2.5 bg-white/40 backdrop-blur-md border border-black/10 text-black rounded-full opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>

                  {/* Product Image Wrapper */}
                  <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden mb-8 border border-black/5 transition-colors group-hover:border-black/10 flex items-center justify-center p-8">
                    <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center cursor-pointer">
                      <img 
                        src={getFullImageUrl(product.image_url)} 
                        alt={product.name}
                        className="w-full h-full object-contain transform transition-transform duration-1000 group-hover:scale-110"
                      />
                    </Link>
                    
                    {/* Hover Overlay Actions (Desktop Only) - Re-engineered for Absolute Readability */}
                    <div className="hidden md:flex absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-500 items-center justify-center pointer-events-none group-hover:pointer-events-auto p-4 border-t border-black/5 z-20">
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className={`w-full py-3 text-[10px] tracking-[0.2em] font-black uppercase transition-all duration-500 flex items-center justify-center gap-2 pointer-events-auto ${addedId === product.id ? 'bg-gold-600 text-white border border-gold-600' : 'bg-black text-white border border-black hover:bg-black/80'}`}
                        >
                           {addedId === product.id ? <><Check size={14} strokeWidth={3} /> ADDED</> : 'ADD TO BAG'}
                        </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col space-y-3">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-gold-600 font-bold">{product.category || 'EXCLUSIF'}</p>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="text-lg md:text-xl font-serif tracking-[0.1em] uppercase text-black leading-tight group-hover:text-gold-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-black/40 leading-relaxed font-medium uppercase tracking-widest">
                       {product.volume || '100ML'} - EXTRAIT DE PARFUM
                    </p>
                    <div className="pt-2 flex items-center justify-between mb-4">
                       <div className="flex flex-col">
                           {product.sale_price ? (
                               <div className="flex items-center space-x-3">
                                   <span className="text-sm tracking-[0.1em] font-bold text-gold-600">{formatCurrency(product.sale_price, activeCurrency, rates, symbols)}</span>
                                   <span className="text-[10px] line-through text-black/20 tracking-widest">{formatCurrency(product.price, activeCurrency, rates, symbols)}</span>
                               </div>
                           ) : (
                               <span className="text-sm tracking-[0.1em] font-light">{formatCurrency(product.price, activeCurrency, rates, symbols)}</span>
                           )}
                       </div>
                       <Link to={`/product/${product.slug}`} className="text-[9px] tracking-[0.2em] text-black/40 hover:text-black uppercase transition-colors underline underline-offset-4">Details</Link>
                    </div>

                    {/* Mobile Only Add to Bag Button */}
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className={`md:hidden w-full py-4 text-[10px] tracking-[0.2em] font-black uppercase flex items-center justify-center gap-2 transition-all duration-300 border border-black ${addedId === product.id ? 'bg-gold-600 text-white border-gold-600' : 'bg-black text-white hover:bg-black/90'}`}
                    >
                        {addedId === product.id ? <><Check size={14} strokeWidth={3} /> ADDED TO BAG</> : <><ShoppingBag size={14} /> ADD TO BAG</>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        
        {/* LUXURY TOAST NOTIFICATION - REDESIGNED FOR ELEGANCE & RESPONSIVENESS */}
        <AnimatePresence>
            {notification.show && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-[1000000] w-[90%] max-w-[400px]"
                >
                    <div className="bg-white/95 backdrop-blur-2xl border border-black/10 px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between group">
                        <div className="flex items-center space-x-5">
                            <div className="w-1 h-1 bg-black rounded-full flex-shrink-0" />
                            <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-black leading-relaxed">
                                {notification.message}
                            </span>
                        </div>
                        <button 
                            onClick={() => setNotification({ ...notification, show: false })} 
                            className="text-black/20 hover:text-black transition-all duration-300"
                        >
                            <X size={14} strokeWidth={1.5} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Wishlist;

