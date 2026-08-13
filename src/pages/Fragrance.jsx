import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, ArrowRight, ArrowLeft, Check, X, Filter, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import { openWishlistAuthPopup } from '../store/uiSlice';
import { toggleWishlistAndSync } from '../store/wishlistSlice';
import { getFullImageUrl } from '../utils/url';
import { formatCurrency } from '../utils/currency';
import PageLoader from '../components/PageLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PriceFilter = ({ searchParams, setSearchParams }) => {
    const minVal = searchParams.get('minPrice') || '';
    const maxVal = searchParams.get('maxPrice') || '';
    const [localMin, setLocalMin] = useState(minVal);
    const [localMax, setLocalMax] = useState(maxVal);

    // Sync local state when URL changes externally
    useEffect(() => {
        setLocalMin(minVal);
        setLocalMax(maxVal);
    }, [minVal, maxVal]);

    const applyPrice = () => {
        const newParams = new URLSearchParams(searchParams);
        if (localMin) newParams.set('minPrice', localMin);
        else newParams.delete('minPrice');
        if (localMax) newParams.set('maxPrice', localMax);
        else newParams.delete('maxPrice');
        setSearchParams(newParams);
    };

    return (
        <div className="border-b border-black/10 py-5">
            <div className="w-full flex items-center justify-between mb-4">
                <span className="text-[11px] tracking-[0.2em] font-bold uppercase text-black">
                    Price Range
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-black/50 text-[10px]">₹</span>
                    <input 
                        type="number" 
                        placeholder="Min" 
                        value={localMin}
                        onChange={e => setLocalMin(e.target.value)}
                        onBlur={applyPrice}
                        onKeyDown={e => e.key === 'Enter' && applyPrice()}
                        className="w-full pl-6 pr-2 py-2 text-[10px] tracking-[0.1em] border border-black/10 focus:outline-none focus:border-black/40 bg-neutral-50"
                    />
                </div>
                <span className="text-black/30">-</span>
                <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-black/50 text-[10px]">₹</span>
                    <input 
                        type="number" 
                        placeholder="Max" 
                        value={localMax}
                        onChange={e => setLocalMax(e.target.value)}
                        onBlur={applyPrice}
                        onKeyDown={e => e.key === 'Enter' && applyPrice()}
                        className="w-full pl-6 pr-2 py-2 text-[10px] tracking-[0.1em] border border-black/10 focus:outline-none focus:border-black/40 bg-neutral-50"
                    />
                </div>
            </div>
        </div>
    );
};

const Fragrance = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [searchParams, setSearchParams] = useSearchParams();

    const activeFilters = useMemo(() => {
        const getArr = (key) => searchParams.get(key) ? searchParams.get(key).split(',') : [];
        return {
            gender: getArr('gender'),
            family: getArr('family'),
            intensity: getArr('intensity'),
            characteristics: getArr('characteristics'),
            occasions: getArr('occasions'),
            seasons: getArr('seasons'),
            notes: getArr('notes')
        };
    }, [searchParams]);

    const [products, setProducts] = useState([]);
    const [facets, setFacets] = useState({});
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [waitlistStatus, setWaitlistStatus] = useState({});

    const [expandedGroups, setExpandedGroups] = useState({
        gender: true, family: true, notes: true, characteristics: false, occasions: false, seasons: false, intensity: false
    });
    
    const [noteSearchQuery, setNoteSearchQuery] = useState('');
    const [notesExpanded, setNotesExpanded] = useState(false);

    const FILTER_OPTIONS = {
        gender: ['Men', 'Women', 'Unisex'],
        family: ['Woody', 'Floral', 'Amber', 'Fresh', 'Citrus', 'Gourmand', 'Aquatic'],
        intensity: ['Light', 'Moderate', 'Strong', 'Intense'],
        characteristics: ['Fresh', 'Sweet', 'Spicy', 'Woody', 'Smoky', 'Musky', 'Powdery', 'Creamy', 'Earthy'],
        occasions: ['Everyday', 'Office', 'Date Night', 'Party', 'Wedding', 'Formal'],
        seasons: ['Spring', 'Summer', 'Autumn', 'Winter', 'All Season'],
        notes: [
            'Bergamot', 'Rose', 'Oud', 'Vanilla', 'Sandalwood', 'Patchouli',
            'Jasmine', 'Musk', 'Amber', 'Vetiver', 'Cardamom', 'Lemon',
            'Lavender', 'Cedarwood', 'Tonka Bean', 'Pink Pepper', 'Iris',
            'Saffron', 'Tobacco', 'Grapefruit', 'Neroli', 'Geranium',
            'Orange Blossom', 'Frankincense', 'Myrrh', 'Leather', 'Oakmoss'
        ]
    };

    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { items: wishlistItems = [] } = useSelector((state) => state.wishlist || {});
    const { activeCurrency, rates, symbols } = useSelector((state) => state.currency);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const query = new URLSearchParams(searchParams);
                query.set('withFacets', 'true');
                
                const res = await fetch(`${API_URL}/api/products?${query.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setProducts(data);
                        setTotalResults(data.length);
                        setFacets({});
                    } else {
                        setProducts(data.products || []);
                        setFacets(data.facets || {});
                        setTotalResults(data.total || 0);
                    }
                }
            } catch (error) {
                console.error("Error fetching fragrances:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchProducts();
        }, 150);
        
        return () => clearTimeout(timer);
    }, [searchParams]);

    // Force scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('cart'));
            return;
        }
        const itemToCart = {
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
        dispatch(addToCart(itemToCart));
        showNotification(`${product.name} added to bag.`);
    };

    const handleBuyNow = (e, product) => {
        e.stopPropagation();
        e.preventDefault();
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
        e.stopPropagation();
        e.preventDefault();
        
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
        e.stopPropagation();
        e.preventDefault();
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('wishlist'));
            return;
        }
        dispatch(toggleWishlistAndSync(product));
        const isAdded = !wishlistItems.some(item => String(item.id) === String(product.id));
        showNotification(isAdded ? `${product.name} added to wishlist.` : `${product.name} removed from wishlist.`);
    };

    const updateFilter = useCallback((group, value) => {
        const newParams = new URLSearchParams(searchParams);
        let current = newParams.get(group) ? newParams.get(group).split(',') : [];
        
        if (current.includes(value)) {
            current = current.filter(v => v !== value);
        } else {
            current.push(value);
        }
        
        if (current.length > 0) {
            newParams.set(group, current.join(','));
        } else {
            newParams.delete(group);
        }
        
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const clearAllFilters = useCallback(() => {
        setSearchParams(new URLSearchParams());
    }, [setSearchParams]);

    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const renderFilterGroup = (title, groupKey) => {
        const isExpanded = expandedGroups[groupKey];
        const activeSelected = activeFilters[groupKey] || [];
        
        const facetData = facets[groupKey] || [];
        const allOptionsMap = new Map();
        
        // Use counts from facets
        facetData.forEach(f => {
            allOptionsMap.set(f.value, f.count);
        });
        
        // Include any active selection even if not in facets
        activeSelected.forEach(val => {
            if (!allOptionsMap.has(val)) allOptionsMap.set(val, 0);
        });
        
        let displayOptions = Array.from(allOptionsMap.entries())
            .map(([value, count]) => ({ value, count }));
        
        if (groupKey === 'notes') {
            displayOptions = displayOptions.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
            if (noteSearchQuery) {
                displayOptions = displayOptions.filter(o => o.value.toLowerCase().includes(noteSearchQuery.toLowerCase()));
            }
            if (!notesExpanded && !noteSearchQuery) {
                displayOptions = displayOptions.slice(0, 6);
            }
        }
        
        // Do not hide groups. They must always be visible.

        return (
            <div className="border-b border-black/10 py-5">
                <button 
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center justify-between group outline-none"
                    aria-expanded={isExpanded}
                >
                    <span className="text-[11px] tracking-[0.2em] font-bold uppercase text-black group-hover:text-black/70 transition-colors">
                        {title}
                    </span>
                    {isExpanded ? <ChevronUp size={14} className="text-black/50" /> : <ChevronDown size={14} className="text-black/50" />}
                </button>
                
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-3">
                                {groupKey === 'notes' && (
                                    <div className="relative mb-3">
                                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40" />
                                        <input 
                                            type="text" 
                                            placeholder="SEARCH NOTES..." 
                                            value={noteSearchQuery}
                                            onChange={(e) => setNoteSearchQuery(e.target.value)}
                                            className="w-full pl-7 pr-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold border border-black/10 bg-neutral-50 focus:outline-none focus:border-black/40 placeholder-black/30 transition-colors"
                                        />
                                    </div>
                                )}
                                
                                {displayOptions.map(({ value, count }) => {
                                    const isSelected = activeSelected.includes(value);
                                    return (
                                        <label key={value} className="flex items-center group cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={isSelected} 
                                                onChange={() => updateFilter(groupKey, value)} 
                                            />
                                            <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-black border-black' : 'border-black/20 group-hover:border-black/50'}`}>
                                                {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                                            </div>
                                            <span className={`ml-3 text-[10px] sm:text-[11px] tracking-[0.15em] uppercase transition-colors line-clamp-1 ${isSelected ? 'text-black font-bold' : 'text-black/70 group-hover:text-black'}`}>
                                                {value}
                                            </span>
                                            <span className="ml-auto pl-2 text-[9px] text-black/40 tracking-widest">
                                                ({count})
                                            </span>
                                        </label>
                                    );
                                })}
                                
                                {groupKey === 'notes' && !noteSearchQuery && allOptionsMap.size > 6 && (
                                    <button 
                                        onClick={() => setNotesExpanded(!notesExpanded)}
                                        className="text-[9px] tracking-[0.2em] font-bold uppercase text-black/50 hover:text-black underline decoration-black/20 underline-offset-4 mt-3"
                                    >
                                        {notesExpanded ? 'Show Less' : `View All ${allOptionsMap.size} Notes`}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderActiveChips = () => {
        const chips = [];
        Object.entries(activeFilters).forEach(([group, values]) => {
            if (Array.isArray(values)) {
                values.forEach(val => {
                    chips.push(
                        <span key={`${group}-${val}`} className="inline-flex items-center px-3 py-1.5 bg-black text-white text-[9px] tracking-[0.2em] uppercase font-bold mr-2 mb-2 shadow-sm">
                            {val}
                            <button onClick={() => updateFilter(group, val)} className="ml-2 text-white/60 hover:text-white transition-colors">
                                <X size={10} strokeWidth={2.5} />
                            </button>
                        </span>
                    );
                });
            }
        });
        
        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        if (minP || maxP) {
            chips.push(
                <span key="price-range" className="inline-flex items-center px-3 py-1.5 bg-black text-white text-[9px] tracking-[0.2em] uppercase font-bold mr-2 mb-2 shadow-sm">
                    {minP ? `₹${minP}` : '0'} - {maxP ? `₹${maxP}` : 'MAX'}
                    <button onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('minPrice');
                        newParams.delete('maxPrice');
                        setSearchParams(newParams);
                    }} className="ml-2 text-white/60 hover:text-white transition-colors">
                        <X size={10} strokeWidth={2.5} />
                    </button>
                </span>
            );
        }

        if (chips.length === 0) return null;
        
        return (
            <div className="flex flex-wrap items-center mb-6 animate-fade-in">
                {chips}
                <button onClick={clearAllFilters} className="text-[9px] font-bold tracking-[0.2em] uppercase text-black/50 hover:text-black underline decoration-black/20 underline-offset-4 ml-1 mb-2">
                    Clear All
                </button>
            </div>
        );
    };

    const sidebarContentJsx = (
        <>
            <PriceFilter searchParams={searchParams} setSearchParams={setSearchParams} />
            {renderFilterGroup('Gender', 'gender')}
            {renderFilterGroup('Fragrance Family', 'family')}
            {renderFilterGroup('Perfume Notes', 'notes')}
            {renderFilterGroup('Scent Characteristics', 'characteristics')}
            {renderFilterGroup('Occasions', 'occasions')}
            {renderFilterGroup('Season', 'seasons')}
            {renderFilterGroup('Intensity', 'intensity')}
        </>
    );

    return (
        <div className="min-h-screen bg-[#faf8f9] text-black pt-[80px] md:pt-[140px] pb-12">
            {/* Top Navigation & Status Bar */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-4 pb-4 flex justify-between items-center sticky top-[56px] md:top-[60px] bg-[#faf8f9]/90 backdrop-blur-md z-40 transition-all">
                <Link
                    to="/"
                    className="inline-flex items-center text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold text-black/60 hover:text-black transition-colors"
                >
                    <ArrowLeft size={14} className="mr-2" />
                    <span className="hidden sm:inline">Back to Home</span>
                    <span className="sm:hidden">Home</span>
                </Link>
                <div className="flex items-center space-x-4 sm:space-x-8">
                    <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold text-black/60">
                        {loading ? 'Updating...' : `${totalResults} Fragrance${totalResults !== 1 ? 's' : ''}`}
                    </span>
                    <button 
                        onClick={() => setIsFilterDrawerOpen(true)} 
                        className="flex items-center text-[10px] tracking-[0.2em] uppercase font-bold text-black border border-black/20 px-4 py-1.5 hover:bg-black hover:text-white transition-colors"
                    >
                        <Filter size={12} className="mr-2" /> Filter
                    </button>
                </div>
            </div>

            <div className="flex flex-col max-w-[1600px] mx-auto">
                {/* Main Product Area */}
                <main className="flex-1 w-full relative min-h-screen">
                    {/* Active Filters Bar */}
                    <div className="px-4 md:px-8 pt-6 pb-2 min-h-[60px]">
                        {renderActiveChips()}
                    </div>

                    {/* Products Grid / Stack */}
                    <div className="flex flex-col relative">
                        {loading && products.length === 0 ? (
                             <div className="py-20 w-full flex items-center justify-center">
                                 <PageLoader fullScreen={false} />
                             </div>
                        ) : products.length === 0 ? (
                            <div className="py-40 text-center px-4">
                                <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-[0.1em] mb-4 text-black">No fragrances found</h2>
                                <p className="text-[10px] sm:text-xs tracking-[0.2em] text-black/50 uppercase mb-8 leading-relaxed">
                                    The combination you selected is currently unavailable in the vault.
                                </p>
                                <button 
                                    onClick={clearAllFilters} 
                                    className="px-10 py-3.5 bg-black text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-black/80 transition-colors shadow-lg active:scale-95"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            products.map((product, idx) => {
                                const isEven = idx % 2 === 0;
                                const isWishlisted = wishlistItems.some(item => String(item.id) === String(product.id));
                                const targetUrl = `/product/${product.slug || String(product.name).toLowerCase().replace(/\s+/g, '-')}`;

                                return (
                                    <section
                                        key={product.id || idx}
                                        className={`w-full py-8 md:py-12 px-4 md:px-8 lg:px-12 flex items-center justify-center bg-white/40 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                                    >
                                        <div className={`max-w-6xl w-full mx-auto flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-center justify-center ${isEven ? '' : 'md:grid-flow-dense'}`}>
                                            
                                            {/* Product Image */}
                                            <div className={`relative group w-[220px] sm:w-[280px] md:w-[400px] lg:w-[480px] aspect-[3/4] shrink-0 mx-auto overflow-hidden bg-neutral-100 border border-black/5 shadow-xl transition-all duration-700 hover:shadow-2xl ${isEven ? 'md:col-start-1' : 'md:col-start-2'}`}>
                                                <Link to={targetUrl} className="block w-full h-full relative">
                                                    <img
                                                        src={getFullImageUrl(product.image_url)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                    {product.sale_price && (
                                                        <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black text-white text-[8px] md:text-[9px] font-bold px-2 py-1 tracking-widest uppercase z-10 shadow-sm">
                                                            -{Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)}%
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-center justify-center">
                                                        <span className="bg-white/95 text-black px-4 py-2 md:px-6 md:py-2.5 text-[9px] md:text-[10px] tracking-[0.25em] md:tracking-[0.3em] uppercase font-bold shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                            Explore
                                                        </span>
                                                    </div>
                                                </Link>

                                                <button
                                                    onClick={(e) => handleWishlistToggle(e, product)}
                                                    aria-label="Wishlist"
                                                    className={`absolute top-2.5 right-2.5 md:top-3 md:right-3 z-10 p-1.5 sm:p-2 rounded-full backdrop-blur-md border border-black/10 shadow-md transition-all transform hover:scale-110 ${isWishlisted ? 'bg-black text-white' : 'bg-white/85 text-black hover:bg-black hover:text-white'}`}
                                                >
                                                    <Heart size={12} className="md:w-3.5 md:h-3.5" fill={isWishlisted ? "currentColor" : "none"} />
                                                </button>
                                            </div>

                                            {/* Product Details */}
                                            <div className={`w-full max-w-sm md:max-w-md mx-auto flex flex-col items-center md:items-start text-center md:text-left shrink-0 ${isEven ? 'md:col-start-2' : 'md:col-start-1'}`}>
                                                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 md:mb-3">
                                                    <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] text-black/50 uppercase">
                                                        {product.category || product.fragrance_family || "PARFUM EXTRAIT"}
                                                    </span>
                                                    <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-gold-500/60" />
                                                    <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.25em] text-black/40 uppercase">
                                                        {product.size || "100 ML"}
                                                    </span>
                                                </div>

                                                <Link to={targetUrl} className="block mb-2 md:mb-4">
                                                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-[0.14em] uppercase hover:text-black/70 transition-colors line-clamp-1">
                                                        {product.name}
                                                    </h2>
                                                </Link>

                                                <div className="mb-6 md:mb-8 flex items-center justify-center md:justify-start space-x-3">
                                                    {product.sale_price ? (
                                                        <div className="flex items-center space-x-2.5 md:space-x-3">
                                                            <span className="text-xl md:text-3xl lg:text-4xl font-bold tracking-[0.2em] uppercase text-black">
                                                                {formatCurrency(product.sale_price, activeCurrency, rates, symbols)}
                                                            </span>
                                                            <span className="text-sm md:text-base lg:text-lg line-through text-black/35 tracking-widest">
                                                                {formatCurrency(product.price, activeCurrency, rates, symbols)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xl md:text-3xl lg:text-4xl font-bold tracking-[0.2em] uppercase text-black">
                                                            {formatCurrency(product.price, activeCurrency, rates, symbols)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="w-[210px] sm:w-[250px] md:w-full flex flex-col md:flex-row gap-3 mx-auto md:mx-0">
                                                    {product.stock_count > 0 ? (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleAddToCart(e, product)}
                                                                className="w-full md:flex-1 py-3 bg-black text-white border border-black text-[10px] md:text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center shadow-md active:scale-95"
                                                            >
                                                                <ShoppingBag size={13} className="mr-2 md:mr-3 shrink-0" />
                                                                Add To Bag
                                                            </button>

                                                            <button
                                                                onClick={(e) => handleBuyNow(e, product)}
                                                                className="w-full md:flex-1 py-3 bg-white text-black border border-black/80 text-[10px] md:text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm active:scale-95"
                                                            >
                                                                Buy Now
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="w-full bg-black/[0.02] border border-black/5 p-6 mt-2">
                                                            <span className="text-[10px] tracking-[0.4em] font-black text-black uppercase block mb-4 text-center md:text-left">Coming Soon</span>
                                                            <p className="text-[10px] text-black/40 tracking-widest leading-loose mb-6 italic text-center md:text-left">This fragrance is currently being prepared. Join the waitlist to be notified when it's available.</p>
                                                            <button
                                                                onClick={(e) => handleNotifyMe(e, product)}
                                                                disabled={waitlistStatus[product.id] === 'loading' || waitlistStatus[product.id] === 'success'}
                                                                className="w-full h-12 bg-black text-white text-[10px] font-black tracking-[0.4em] uppercase hover:bg-black/90 transition-all flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed"
                                                            >
                                                                {waitlistStatus[product.id] === 'loading' ? (
                                                                    <Loader2 size={16} className="animate-spin" />
                                                                ) : waitlistStatus[product.id] === 'success' ? (
                                                                    <span className="flex items-center gap-2"><Check size={16} /> ADDED</span>
                                                                ) : (
                                                                    'Notify Me'
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <Link
                                                    to={targetUrl}
                                                    className="hidden sm:inline-flex items-center text-[9px] tracking-[0.25em] font-bold uppercase text-black/50 hover:text-black transition-colors group mt-5"
                                                >
                                                    Explore Product
                                                    <ArrowRight size={12} className="ml-1.5 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    </section>
                                );
                            })
                        )}
                    </div>
                </main>
            </div>

            {/* Global Filter Drawer (Right Side) */}
            <AnimatePresence>
                {isFilterDrawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
                        />
                        
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 right-0 w-full sm:w-[420px] bg-white z-[100000] shadow-2xl flex flex-col overflow-hidden"
                            data-lenis-prevent="true"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white shrink-0">
                                <h3 className="text-xs tracking-[0.3em] font-bold uppercase text-black">Filter & Sort</h3>
                                <button 
                                    onClick={() => setIsFilterDrawerOpen(false)}
                                    className="p-2 bg-neutral-100 rounded-full text-black hover:bg-black hover:text-white transition-colors"
                                >
                                    <X size={16} strokeWidth={2} />
                                </button>
                            </div>
                            
                            {/* Drawer Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-2 pb-24" data-lenis-prevent="true">
                                {sidebarContentJsx}
                            </div>

                            {/* Drawer Sticky Footer Action */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/10 bg-white/95 backdrop-blur-md pb-8">
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={clearAllFilters}
                                        className="w-1/3 py-3.5 bg-neutral-100 text-black text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-neutral-200 transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <button 
                                        onClick={() => setIsFilterDrawerOpen(false)}
                                        className="w-2/3 py-3.5 bg-black text-white text-[10px] tracking-[0.2em] font-bold uppercase shadow-lg active:scale-95 transition-transform"
                                    >
                                        Show {totalResults} Fragrances
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* LUXURY TOAST NOTIFICATION */}
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

export default Fragrance;
