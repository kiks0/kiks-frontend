import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShoppingBag, Heart, ArrowRight, Loader2, Compass, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../store/cartSlice';
import { toggleWishlistAndSync } from '../store/wishlistSlice';
import { getFullImageUrl } from '../utils/url';

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
    const wishlistItems = useSelector(state => state.wishlist.items);

    useEffect(() => {
        const fetchCollectionData = async () => {
            setLoading(true);
            try {
                // Fetch collection details
                const colRes = await fetch(`${API_URL}/api/collections/${category}`);
                const colData = await colRes.json();
                setCollection(colData);

                // Fetch products for this collection
                const prodRes = await fetch(`${API_URL}/api/products?collection=${category}`);
                const prodData = await prodRes.json();
                setProducts(prodData);
            } catch (error) {
                console.error("Error fetching collection:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollectionData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [category, view]); // Re-run when view changes

    const handleOpenProducts = () => {
        navigate(`?category=${category}&view=products`);
    };

    if (loading) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center text-white font-serif tracking-widest uppercase">
                {t('collection.not_found')}
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-white overflow-x-hidden pt-20">
            <SEO 
                title={`${collection.name} Collection`}
                description={collection.description || `Explore our exclusive ${collection.name} collection of premium fragrances.`}
                keywords={`${collection.name}, Luxury Perfume Collection, KIKS`}
                image={collection.banner_url}
            />
            <AnimatePresence mode="wait">
                {view === 'editorial' ? (
                    /* LUXE EDITORIAL LANDING */
                    <motion.section 
                        key="editorial"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden"
                    >
                        {/* Background Image / Texture */}
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={getFullImageUrl(collection.banner_url)} 
                                alt="Background" 
                                className="w-full h-full object-cover opacity-30 grayscale saturate-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                        </div>

                        {/* Centered Minimal Content */}
                        <div className="relative z-10 text-center flex flex-col items-center px-6">
                            <motion.div
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="mb-12"
                            >
                                <h1 className="text-5xl md:text-[14rem] font-serif tracking-[0.2em] md:tracking-[0.3em] leading-none text-white/[0.03] inline-block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap uppercase">
                                    {collection.name}
                                </h1>
                                <h2 className="text-2xl md:text-8xl font-serif tracking-[0.15em] text-white relative z-20 uppercase leading-tight">
                                    {collection.name} <br className="md:hidden" />
                                    <span className="text-[9px] md:text-sm block mt-3 md:mt-8 tracking-[0.4em] text-white/40 font-sans italic lowercase">Collection</span>
                                </h2>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-[10px] md:text-[11px] tracking-[0.6em] text-gold-500 mb-20 font-normal uppercase max-w-lg leading-[2.4]"
                            >
                                {collection.description || t('collection.mastery')}
                            </motion.p>

                            <button 
                                onClick={handleOpenProducts}
                                className="relative px-16 py-6 border border-white/5 hover:border-gold-500/50 transition-all duration-700 bg-white/5 backdrop-blur-xl group overflow-hidden"
                            >
                                <span className="relative z-10 text-[10px] tracking-[0.5em] font-normal flex items-center text-white/80 group-hover:text-gold-400">
                                    {t('collection.open_vault')} <ArrowRight size={14} className="ml-6 transition-transform group-hover:translate-x-3" />
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gold-500/10 transition-transform duration-1000" />
                            </button>
                        </div>

                        {/* Side details */}
                        <div className="absolute left-6 md:left-12 bottom-6 md:bottom-12 overflow-hidden">
                            <span className="inline-block h-px w-12 md:w-24 bg-white/10 mr-4 align-middle" />
                            <span className="text-[7px] md:text-[8px] tracking-[0.4em] text-white/40 uppercase">Selection I - IV</span>
                        </div>
                    </motion.section>
                ) : (
                    /* CONCENTRATED PRODUCT VAULT */
                    <motion.section 
                        key="products"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-24 px-6 lg:px-20 container mx-auto"
                    >
                        {/* Elegant Minimal Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 md:mb-32 border-b border-white/10 pb-16 relative">
                            <div className="absolute top-[-20px] md:top-[-40px] left-0 text-[60px] md:text-[120px] font-serif text-white/[0.02] pointer-events-none select-none">
                                {products.length.toString().padStart(2, '0')}
                            </div>
                            
                            <div className="relative z-10">
                                <button 
                                    onClick={() => navigate(`?category=${category}&view=editorial`)}
                                    className="text-[8px] tracking-[0.5em] uppercase text-gold-500/50 hover:text-gold-500 transition-colors flex items-center mb-6 group"
                                >
                                    <ArrowRight size={10} className="mr-3 rotate-180 group-hover:-translate-x-2 transition-transform" /> Back to Collection
                                </button>
                                <h2 className="text-4xl md:text-6xl font-serif tracking-[0.05em] text-white uppercase italic">
                                    {collection.name} <span className="not-italic text-white/20 ml-4 font-light">Our Selection</span>
                                </h2>
                                <p className="text-white/40 text-[9px] tracking-[0.6em] uppercase mt-6 max-w-md leading-relaxed">
                                    Exploring the sensory architecture of {collection.name.toLowerCase()}
                                </p>
                            </div>

                            <div className="mt-12 md:mt-0 flex flex-col items-end">
                                <div className="w-12 h-px bg-gold-500/30 mb-4" />
                                <p className="text-[10px] tracking-[0.4em] uppercase text-white font-normal">Collection</p>
                                <p className="text-[8px] tracking-[0.4em] uppercase text-white/20 mt-2">Selection I - IV</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-12 md:gap-y-40 gap-x-4 md:gap-x-20">
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
                                                onClick={(e) => { e.preventDefault(); dispatch(toggleWishlistAndSync(product)); }}
                                                className={`p-1.5 md:p-3 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black transition-all ${wishlistItems.some(i => i.id === product.id) ? 'bg-gold-500 text-dark-900' : 'bg-black/40 text-white'}`}
                                            >
                                                <Heart size={12} fill={wishlistItems.some(i => i.id === product.id) ? "currentColor" : "none"} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); dispatch(addToCart({...product, quantity: 1})); }}
                                                className="p-1.5 md:p-3 backdrop-blur-md border border-white/10 bg-black/40 text-white hover:bg-gold-500 hover:text-dark-900 transition-all"
                                            >
                                                <ShoppingBag size={12} />
                                            </button>
                                        </div>
                                    </Link>
                                    
                                    <div className="flex flex-col items-center px-2">
                                        <h3 className="text-[11px] md:text-base font-serif font-light tracking-[0.15em] md:tracking-[0.2em] mb-2 md:mb-3 group-hover:text-gold-500 transition-colors duration-500 uppercase text-center line-clamp-1 text-white/85">
                                            {product.name}
                                        </h3>
                                        <div className="h-px w-6 md:w-8 bg-gold-500/30 mb-3 md:mb-5 mx-auto" />
                                        <span className="text-[10px] md:text-[11px] font-light tracking-[0.25em] uppercase text-gold-500">{product.price}</span>

                                        <Link
                                            to={`/collection/${category}/${product.slug}`}
                                            className="mt-4 md:mt-7 text-[8px] md:text-[9px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-white/25 hover:text-gold-400 transition-colors font-normal border-b border-white/[0.08] pb-0.5"
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

            <div className="h-40" />
        </div>
    );
};

export default Collection;
