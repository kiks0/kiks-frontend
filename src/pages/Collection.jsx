import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShoppingBag, Heart, ArrowRight, Loader2, Compass, Layers, X, Check } from 'lucide-react';
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
import { logClientActivity } from '../utils/clientLogger';

const isVideo = (url) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/);
};

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
    const [waitlistStatus, setWaitlistStatus] = useState({});
    
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.auth);
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
                const validCollection = colData.msg ? null : colData;
                setCollection(validCollection);
                if (validCollection && validCollection.name) {
                    logClientActivity('Opened collection page', validCollection.name);
                }

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
        window.scrollTo(0, 0);
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
        showNotification(`${product.name} added to bag. (Total: ${newTotal})`);
        
        setTimeout(() => setCartFlashId(null), 800);
    };

    const handleBuyNow = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('buy'));
            return;
        }
        const itemToBuy = {
            ...product,
            id: product.id,
            productId: product.id,
            slug: product.slug || String(product.name).toLowerCase().replace(/\s+/g, '-'),
            name: product.name,
            price: product.sale_price || product.price,
            sale_price: product.sale_price || null,
            image_url: product.image_url,
            size: product.size || '100 ML',
            volume: product.size || '100 ML',
            quantity: 1
        };
        navigate('/checkout', { state: { directItem: itemToBuy } });
    };

    const handleNotifyMe = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated || !user?.email) {
            dispatch(openWishlistAuthPopup('notify'));
            return;
        }

        setWaitlistStatus(prev => ({ ...prev, [product.id]: 'loading' }));

        try {
            const res = await fetch(`${API_URL}/api/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    product_id: product.id,
                    product_name: product.name,
                    product_slug: product.slug || String(product.name).toLowerCase().replace(/\s+/g, '-')
                })
            });

            if (res.ok) {
                setWaitlistStatus(prev => ({ ...prev, [product.id]: 'success' }));
                showNotification(`You'll be notified when ${product.name} is back in stock.`);
                setTimeout(() => {
                    setWaitlistStatus(prev => ({ ...prev, [product.id]: null }));
                }, 3000);
            } else {
                setWaitlistStatus(prev => ({ ...prev, [product.id]: null }));
                const data = await res.json();
                showNotification(data.msg || 'Failed to join waitlist.');
            }
        } catch (err) {
            setWaitlistStatus(prev => ({ ...prev, [product.id]: null }));
            showNotification('Network error. Please try again.');
        }
    };

    const handleWishlistToggle = (e, product) => {
        e.preventDefault();
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('wishlist'));
        } else {
            const isInWishlist = wishlistItems.some(i => String(i.id) === String(product.id));
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
                title={collection?.name ? (collection.name.toLowerCase().endsWith('collection') ? collection.name : `${collection.name} Collection`) : 'Luxury Collection'}
                description={collection?.description || `Explore our exclusive ${collection?.name ? (collection.name.toLowerCase().endsWith('collection') ? collection.name : `${collection.name} collection`) : 'luxury collection'} of premium fragrances.`}
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
                        className="relative h-screen w-full overflow-hidden"
                    >
                        {/* Background Image / Texture */}
                        <div className="absolute inset-0 z-0">
                            {/* Desktop / Main Media */}
                            <div className="w-full h-full hidden md:block">
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
                            {/* Mobile Dedicated Media */}
                            <div className="w-full h-full block md:hidden">
                                {(collection?.mobile_banner_url || collection?.video_url || collection?.banner_url) && (
                                    isVideo(collection?.mobile_banner_url || collection?.video_url || collection?.banner_url) ? (
                                        <video 
                                            src={getFullImageUrl(collection?.mobile_banner_url || collection?.video_url || collection?.banner_url)} 
                                            autoPlay 
                                            muted 
                                            loop 
                                            playsInline 
                                            className="w-full h-full object-cover opacity-100"
                                        />
                                    ) : (
                                        <img 
                                            src={getFullImageUrl(collection?.mobile_banner_url || collection?.video_url || collection?.banner_url)} 
                                            alt="Background" 
                                            className="w-full h-full object-cover opacity-100"
                                        />
                                    )
                                )}
                            </div>
                        </div>

                        {/* Bottom Minimalist Content */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end text-center px-4 pb-32 sm:pb-36 md:pb-40 lg:pb-48 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="flex flex-col items-center pointer-events-auto max-w-6xl mx-auto"
                            >
                                <div className="mb-7 md:mb-9 px-4">
                                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5rem] font-serif font-light tracking-[0.15em] md:tracking-[0.2em] text-white/85 uppercase leading-tight drop-shadow-[0_2px_15px_rgba(255,255,255,0.25)]">
                                        {collection?.name} <br className="md:hidden" />
                                        <span className="text-[10px] sm:text-xs md:text-sm block mt-3 md:mt-4 tracking-[0.4em] md:tracking-[0.5em] text-white/80 font-sans uppercase font-semibold">Collection</span>
                                    </h1>
                                </div>

                                <button 
                                    onClick={handleOpenProducts}
                                    className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-10 md:px-14 py-3.5 md:py-4 text-[11px] tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black active:scale-95 transition-all duration-500 shadow-xl block mx-auto"
                                >
                                    {t('collection.open_vault')}
                                </button>
                            </motion.div>
                        </div>
                    </motion.section>
                ) : (
                    /* PRODUCT COLLECTION */
                    <motion.section 
                        key="products"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pt-28 md:pt-40 pb-12 md:pb-24 px-6 lg:px-20 container mx-auto"
                    >
                        {/* Elegant Minimal Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-16 relative">

                            
                            <div className="relative z-10">
                                 <button 
                                    onClick={() => navigate(`?category=${category}&view=editorial`)}
                                    className="text-[8px] tracking-[0.5em] uppercase text-black/50 hover:text-black transition-colors flex items-center mb-6 group"
                                >
                                    <ArrowRight size={10} className="mr-3 rotate-180 group-hover:-translate-x-2 transition-transform" /> Back to Collection
                                </button>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.05em] text-black uppercase italic">
                                    {collection?.name}
                                </h1>
                                <p className="text-black/40 text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase mt-4 md:mt-6 max-w-md leading-relaxed">
                                    {collection?.description || `Explore our ${collection?.name?.toLowerCase().endsWith('collection') ? collection?.name?.toLowerCase() : `${collection?.name?.toLowerCase()} collection`}.`}
                                </p>
                            </div>


                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 md:gap-y-24 gap-x-6 md:gap-x-20">
                            {products.map((product, idx) => (
                                <div 
                                    key={product.id}
                                    className="group relative"
                                >
                                    <Link to={`/collection/${category}/${product.slug}`} className="block relative w-[220px] sm:w-full mx-auto aspect-[3/4] md:aspect-[4/5] mb-4 md:mb-8 overflow-hidden bg-neutral-100 md:bg-zinc-900 border border-black/5 md:border-white/5 group-hover:border-gold-500/30 transition-colors shadow-xl md:shadow-none">
                                        <img 
                                            src={getFullImageUrl(product.image_url)} 
                                            alt={product.name} 
                                            loading="lazy"
                                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-transform duration-700"
                                        />
                                        {product.sale_price && (
                                            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black text-white text-[8px] md:text-[9px] font-bold px-2 py-1 tracking-widest uppercase z-10 shadow-sm">
                                                -{Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)}%
                                            </div>
                                        )}
                                        
                                        {/* Floating Actions - Wishlist everywhere, Shopping Bag on Desktop only */}
                                        <div className="absolute top-2 right-2 md:top-6 md:right-6 flex flex-col space-y-2 md:space-y-4 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:translate-x-4 md:group-hover:translate-x-0">
                                            <button
                                                onClick={(e) => handleWishlistToggle(e, product)}
                                                className={`p-1.5 md:p-3 rounded-full backdrop-blur-md border border-black/10 shadow-lg hover:shadow-xl hover:scale-110 transition-all ${wishlistItems.some(i => String(i.id) === String(product.id)) ? 'bg-black text-white' : 'bg-white/80 text-black'}`}
                                            >
                                                <Heart size={12} fill={wishlistItems.some(i => String(i.id) === String(product.id)) ? "currentColor" : "none"} />
                                            </button>
                                            {product.stock_count > 0 && (
                                                <button 
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    className={`hidden md:inline-flex p-1.5 md:p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ${cartFlashId === product.id ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-white hover:text-black'}`}
                                                >
                                                    <ShoppingBag size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </Link>
                                    
                                    <div className="flex flex-col items-center px-2">
                                        <Link to={`/collection/${category}/${product.slug}`} className="block">
                                            <h3 className="text-sm md:text-lg font-serif tracking-[0.1em] md:tracking-[0.2em] mb-3 md:mb-4 group-hover:text-gold-500 transition-colors uppercase text-center line-clamp-1">
                                                {product.name}
                                            </h3>
                                        </Link>
                                         {product.sale_price ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <span className="text-[11px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-black">
                                                        {formatCurrency(product.sale_price, activeCurrency, rates, symbols)}
                                                    </span>
                                                    <span className="text-[9px] md:text-[9px] line-through text-black/30 tracking-widest">
                                                        {formatCurrency(product.price, activeCurrency, rates, symbols)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-black/80">
                                                {formatCurrency(product.price, activeCurrency, rates, symbols)}
                                            </span>
                                        )}
                                        
                                        {/* Mobile-Only Stacked Action Buttons (Matched EXACTLY to Fragrance Page) */}
                                        <div className="w-[210px] sm:w-[250px] flex flex-col gap-2 mx-auto mt-4 md:hidden">
                                            {product.stock_count > 0 ? (
                                                <>
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        className="w-full py-2.5 bg-black text-white border border-black text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center shadow-md active:scale-95 whitespace-nowrap"
                                                    >
                                                        <ShoppingBag size={13} className="mr-2 shrink-0" />
                                                        Add To Bag
                                                    </button>

                                                    <button
                                                        onClick={(e) => handleBuyNow(e, product)}
                                                        className="w-full py-2.5 bg-white text-black border border-black/80 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm active:scale-95 whitespace-nowrap"
                                                    >
                                                        Buy Now
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full bg-black/[0.02] border border-black/5 p-5 mt-2">
                                                    <span className="text-[10px] tracking-[0.4em] font-black text-black uppercase block mb-3 text-center">Coming Soon</span>
                                                    <p className="text-[9px] text-black/40 tracking-widest leading-relaxed mb-5 italic text-center">This fragrance is currently being prepared. Join the waitlist to be notified.</p>
                                                    <button
                                                        onClick={(e) => handleNotifyMe(e, product)}
                                                        disabled={waitlistStatus[product.id] === 'loading' || waitlistStatus[product.id] === 'success'}
                                                        className="w-full h-10 bg-black text-white text-[9px] font-black tracking-[0.4em] uppercase hover:bg-black/90 transition-all flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed"
                                                    >
                                                        {waitlistStatus[product.id] === 'loading' ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : waitlistStatus[product.id] === 'success' ? (
                                                            <span className="flex items-center gap-2"><Check size={14} /> ADDED</span>
                                                        ) : (
                                                            'Notify Me'
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <Link 
                                            to={`/collection/${category}/${product.slug}`}
                                            className="hidden md:inline-block mt-6 md:mt-8 text-[8px] tracking-[0.4em] uppercase text-black/40 hover:text-black transition-colors font-bold border-b border-black/10 pb-1.5"
                                        >
                                            {t('collection.view_composition')}
                                        </Link>
                                    </div>
                                </div>
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
