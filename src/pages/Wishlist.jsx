import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toggleWishlistAndSync } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
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
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [addedId, setAddedId] = useState(null);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white font-sans pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1400px]">
        
        {/* Page Header */}
        <header className="mb-16 md:mb-24 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/account" className="inline-flex items-center text-[9px] tracking-[0.4em] text-white/30 hover:text-white transition-colors uppercase mb-8 group">
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Account
            </Link>
          </motion.div>
          <p className="text-[10px] md:text-[11px] tracking-[0.4em] font-medium uppercase mb-4 opacity-50">Private Selection</p>
          <h1 className="text-3xl md:text-5xl font-serif tracking-[0.15em] uppercase text-white mb-6">Wishlist</h1>
          <div className="w-16 h-[1px] bg-gold-500/50"></div>
        </header>

        <AnimatePresence mode="popLayout">
          {wishlistItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-8 opacity-20">
                 <Heart size={64} strokeWidth={0.5} />
              </div>
              <h2 className="text-xl md:text-2xl font-serif tracking-widest uppercase mb-6">Your wishlist is currently empty</h2>
              <p className="text-gray-500 text-xs tracking-widest uppercase mb-10 max-w-md leading-relaxed">
                Explore our collections and save your favorite fragrances to find them easily later.
              </p>
              <Link to="/collection/arambh" className="inline-flex items-center justify-center px-10 py-4 bg-white text-black text-[10px] tracking-[0.2em] font-bold uppercase border border-white hover:bg-transparent hover:text-white transition-all duration-500">
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
                    className="absolute top-4 right-4 z-20 p-2.5 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full opacity-100 transition-all duration-300 hover:bg-white hover:text-black"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>

                  {/* Product Image Wrapper */}
                  <div className="relative aspect-[4/5] bg-[#151515] overflow-hidden mb-8 border border-white/5 transition-colors group-hover:border-white/10 flex items-center justify-center p-8">
                    <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center cursor-pointer">
                      <img 
                        src={getFullImageUrl(product.image_url)} 
                        alt={product.name}
                        className="w-full h-full object-contain transform transition-transform duration-1000 group-hover:scale-110"
                      />
                    </Link>
                    
                    {/* Hover Overlay Actions (Desktop Only) */}
                    <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="px-8 py-3 bg-black text-white border border-white text-[10px] tracking-[0.2em] font-bold uppercase transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-white hover:text-black flex items-center gap-2"
                        >
                           {addedId === product.id ? <><Check size={14} /> ADDED</> : 'ADD TO BAG'}
                        </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col space-y-3">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-gold-500/80 font-bold">{product.category || 'EXCLUSIF'}</p>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="text-lg md:text-xl font-serif tracking-[0.1em] uppercase text-white leading-tight group-hover:text-gold-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium uppercase tracking-widest">
                       {product.volume || '100ML'} - EXTRAIT DE PARFUM
                    </p>
                    <div className="pt-2 flex items-center justify-between mb-4">
                       <span className="text-sm tracking-[0.1em] font-light">{formatCurrency(product.price, activeCurrency, rates, symbols)}</span>
                       <Link to={`/product/${product.slug}`} className="text-[9px] tracking-[0.2em] text-white/40 hover:text-white uppercase transition-colors underline underline-offset-4">Details</Link>
                    </div>

                    {/* Mobile Only Add to Bag Button */}
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="md:hidden w-full py-4 bg-white text-black text-[10px] tracking-[0.2em] font-bold uppercase flex items-center justify-center gap-2 active:bg-gold-500 transition-colors"
                    >
                        {addedId === product.id ? <><Check size={14} /> ADDED TO BAG</> : <><ShoppingBag size={14} /> ADD TO BAG</>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Wishlist;

