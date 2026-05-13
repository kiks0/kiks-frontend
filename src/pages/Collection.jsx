import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShoppingBag, Heart, ArrowRight, Loader2, Compass, Layers, X } from 'lucide-react';
import SEO from '../components/SEO';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../store/cartSlice';
import { toggleWishlistAndSync } from '../store/wishlistSlice';
import { openAuthModal, openWishlistAuthPopup } from '../store/uiSlice';
import { getFullImageUrl } from '../utils/url';
import { formatCurrency } from '../utils/currency';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

import PageLoader from '../components/PageLoader';

const Collection = () => {
    const { t } = useTranslation();
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const category = slug || searchParams.get('category') || 'arambh';
    const view = searchParams.get('view') || 'editorial'; // 'editorial' or 'products'
    
    const [collection, setCollection] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.auth);
    const wishlistItems = useSelector(state => state.wishlist.items);
    const { activeCurrency, rates, symbols } = useSelector(state => state.currency);

    useEffect(() => {
        const fetchCollectionData = async () => {
            setLoading(true);
            try {
                // Fetch collection details
                const colRes = await fetch(`${API_URL}/api/collections/${category}`);
                if (!colRes.ok) {
                    setCollection(null);
                    setLoading(false);
                    return;
                }
                const colData = await colRes.json();
                setCollection(colData.msg ? null : colData);

                // Fetch products for this collection
                const prodRes = await fetch(`${API_URL}/api/products?collection=${category}`);
                const prodData = await prodRes.json();
                setProducts(Array.isArray(prodData) ? prodData : []);
            } catch (error) {
                console.error("Error fetching collection:", error);
                setCollection(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCollectionData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [category, view]); // Re-run when view changes

    const [cartFlashId, setCartFlashId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleOpenProducts = () => {
        navigate(`?category=${category}&view=products`);
    };

    const cartItems = useSelector(state => state.cart.items);
    const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('cart'));
            return;
        }
        dispatch(addToCart({...product, quantity: 1}));
        setCartFlashId(product.id);
        
        // Calculate new total for immediate feedback
        const newTotal = totalItems + 1;
        showNotification(`${product.name} added to cart. (Total: ${newTotal})`);
        
        setTimeout(() => setCartFlashId(null), 800);
    };

    const handleWishlistToggle = (e, product) => {
        e.preventDefault();
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('wishlist'));
        } else {
            const isInWishlist = wishlistItems.some(i => i.id === product.id);
            dispatch(toggleWishlistAndSync(product));
            showNotification(isInWishlist ? `Removed from wishlist.` : `${product.name} added to wishlist.`);
        }
    };

    if (loading) {
        return <PageLoader fullScreen />;
    }

    if (!collection) {
        return (
            <div className="bg-white min-h-screen flex flex-col items-center justify-center text-black px-6 text-center">
                <h2 className="font-serif text-3xl md:text-5xl tracking-[0.2em] uppercase mb-8">Coming Soon</h2>
                <p className="text-[10px] tracking-[0.4em] uppercase text-black/40 mb-12">We are currently preparing this collection.</p>
                <Link to="/" className="text-[10px] tracking-[0.5em] font-black uppercase border-b border-black/20 pb-2 hover:border-black transition-all">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen text-black overflow-x-hidden pt-0">
            <SEO 
                title={`${collection?.name || 'Luxury'} Collection`}
                description={collection?.description || `Explore our exclusive ${collection?.name} collection of premium fragrances.`}
                keywords={`${collection?.name}, Luxury Perfume Collection, KIKS`}
                image={collection?.banner_url}
            />
            <AnimatePresence mode="wait">
                {view === 'editorial' ? (
                    /* LUXE EDITORIAL LANDING */
                    <motion.section 
                        key="editorial"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
                    >
                        {/* Background Image / Texture */}
                        <div className="absolute inset-0 z-0">
                            {collection?.video_url ? (
                                <video 
                                    src={getFullImageUrl(collection.video_url)} 
                                    autoPlay 
                                    muted 
                                    loop 
                                    playsInline 
                                    className="w-full h-full object-cover opacity-100"
                                />
                            ) : (
                                <img 
                                    src={getFullImageUrl(collection?.banner_url)} 
                                    alt="Background" 
                                    className="w-full h-full object-cover opacity-100"
                                />
                            )}
                        </div>

                        {/* Centered Minimal Content */}
                        <div className="relative z-10 text-center flex flex-col items-center w-full">
                            <motion.div
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="mb-12 px-6"
                            >

                                <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif tracking-[0.1em] md:tracking-[0.15em] text-white relative z-20 uppercase leading-tight">
                                    {collection?.name} <br className="md:hidden" />
                                    <span className="text-[8px] sm:text-xs md:text-sm block mt-2 md:mt-8 tracking-[0.3em] md:tracking-[0.4em] text-white/40 font-sans italic lowercase">Collection</span>
                                </h2>
                            </motion.div>



                            <button 
                                onClick={handleOpenProducts}
                                className="relative w-[85%] max-w-[280px] md:w-auto md:min-w-[300px] md:px-16 py-5 md:py-6 border border-white/20 hover:border-white/40 transition-all duration-700 bg-white/[0.05] backdrop-blur-xl group overflow-hidden mt-16 md:mt-0 mx-auto"
                            >
                                <span className="relative z-10 text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] font-black flex items-center justify-center text-white group-hover:text-white/70 whitespace-nowrap">
                                    {t('collection.open_vault')} <ArrowRight size={14} className="ml-4 md:ml-6 transition-transform group-hover:translate-x-3" />
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/10 transition-transform duration-1000" />
                            </button>
                        </div>


                    </motion.section>
                ) : (
                    /* CONCENTRATED PRODUCT VAULT */
                    <motion.section 
                        key="products"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 md:py-24 px-6 lg:px-20 container mx-auto"
                    >
                        {/* Elegant Minimal Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-32 border-b border-black/10 pb-8 md:pb-16 relative">

                            
                            <div className="relative z-10">
                                 <button 
                                    onClick={() => navigate(`?category=${category}&view=editorial`)}
                                    className="text-[8px] tracking-[0.5em] uppercase text-black/50 hover:text-black transition-colors flex items-center mb-6 group"
                                >
                                    <ArrowRight size={10} className="mr-3 rotate-180 group-hover:-translate-x-2 transition-transform" /> Back to Collection
                                </button>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.05em] text-black uppercase italic">
                                    {collection?.name}
                                </h2>
                                <p className="text-black/40 text-[10px] tracking-[0.4em] md:tracking-[0.6em] uppercase mt-4 md:mt-6 max-w-md leading-relaxed">
                                    Explore our {(collection?.name || '').toLowerCase()} collection.
                                </p>
                            </div>


                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-12 md:gap-y-40 gap-x-6 md:gap-x-20">
                            {products.map((product, idx) => (
                                <motion.div 
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (idx % 2) * 0.1 + (Math.floor(idx/2) * 0.1) }}
                                    className="group relative"
                                >
                                    <Link to={`/collection/${category}/${product.slug}`} className="block relative aspect-[3/4] md:aspect-[4/5] mb-4 md:mb-8 overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-gold-500/30 transition-colors">
                                        <img 
                                            src={getFullImageUrl(product.image_url)} 
                                            alt={product.name} 
                                            loading="lazy"
                                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-transform duration-700"
                                        />
                                        
                                        {/* Floating Actions - Scaled down for mobile */}
                                        <div className="absolute top-2 right-2 md:top-6 md:right-6 flex flex-col space-y-2 md:space-y-4 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:translate-x-4 md:group-hover:translate-x-0">
                                             <button 
                                                onClick={(e) => handleWishlistToggle(e, product)}
                                                className={`p-1.5 md:p-3 rounded-full backdrop-blur-md border border-black/10 shadow-lg hover:shadow-xl hover:scale-110 transition-all ${wishlistItems.some(i => i.id === product.id) ? 'bg-black text-white' : 'bg-white/80 text-black'}`}
                                            >
                                                <Heart size={12} fill={wishlistItems.some(i => i.id === product.id) ? "currentColor" : "none"} />
                                            </button>
                                            <button 
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className={`p-1.5 md:p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ${cartFlashId === product.id ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-white hover:text-black'}`}
                                            >
                                                <ShoppingBag size={12} />
                                            </button>
                                        </div>
                                    </Link>
                                    
                                    <div className="flex flex-col items-center px-2">
                                        <h3 className="text-xs sm:text-sm md:text-lg font-serif tracking-[0.1em] md:tracking-[0.2em] mb-2 md:mb-2 group-hover:text-gold-500 transition-colors uppercase text-center line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-[8px] md:text-[9px] tracking-[0.2em] text-black/20 mb-3 md:mb-4 uppercase">Selection</p>
                                        <div className="h-px w-6 md:w-8 bg-black/20 mb-4 md:mb-6" />
                                         {product.sale_price ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <span className="text-[10px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-black">
                                                        {formatCurrency(product.sale_price, activeCurrency, rates, symbols)}
                                                    </span>
                                                    <span className="text-[8px] md:text-[9px] line-through text-black/30 tracking-widest">
                                                        {formatCurrency(product.price, activeCurrency, rates, symbols)}
                                                    </span>
                                                </div>
                                                <span className="text-[7px] bg-black/5 text-black px-1.5 py-0.5 font-bold uppercase tracking-widest border border-black/10">OFFER</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-black/80">
                                                {formatCurrency(product.price, activeCurrency, rates, symbols)}
                                            </span>
                                        )}
                                        
                                        <Link 
                                            to={`/collection/${category}/${product.slug}`}
                                            className="mt-6 md:mt-8 text-[9px] md:text-[8px] tracking-[0.3em] md:tracking-[0.4em] uppercase text-black/40 hover:text-black transition-colors font-bold border-b border-black/10 pb-1.5"
                                        >
                                            {t('collection.view_composition')}
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <div className="h-20 md:h-40" />

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
    );
};

export default Collection;
