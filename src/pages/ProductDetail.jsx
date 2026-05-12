import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, ArrowLeft, Loader2, Sparkles, Droplets, Wind, Zap, Truck, ChevronDown, ChevronUp, Star, Trash2, Camera, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../store/cartSlice';
import { toggleWishlistAndSync } from '../store/wishlistSlice';
import { openAuthModal, openWishlistAuthPopup, openCart } from '../store/uiSlice';
import { formatCurrency } from '../utils/currency';
import SEO from '../components/SEO';
import { getFullImageUrl } from '../utils/url';

import PageLoader from '../components/PageLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductAccordion = ({ title, isOpen: externalIsOpen, onToggle, defaultOpen = false, children, extra }) => {
    const [selectedReviewImage, setSelectedReviewImage] = useState(null);

    const [localIsOpen, setLocalIsOpen] = useState(defaultOpen);
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : localIsOpen;
    const toggle = () => onToggle ? onToggle(!isOpen) : setLocalIsOpen(!isOpen);

    return (
        <div className="border-t border-black/10 w-full bg-white">
            <button
                onClick={toggle}
                className="w-full flex justify-between items-center py-5 group"
            >
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-black font-sans group-hover:text-black/60 transition-colors">
                    {title}
                </span>
                <div className="flex items-center space-x-6">
                    {extra && <div className="hidden sm:flex">{extra}</div>}
                    {isOpen ? <ChevronUp size={16} className="text-black/40 stroke-[1.5]" /> : <ChevronDown size={16} className="text-black/40 stroke-[1.5]" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white"
                    >
                        <div className="pb-8 pt-4 px-2 text-black/70 text-[11px] md:text-[12px] tracking-[0.05em] leading-relaxed font-sans">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductDetail = () => {
    const { t } = useTranslation();
    const { slug, productSlug } = useParams();
    const { activeCurrency, rates, symbols } = useSelector(state => state.currency);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });
    const [selectedReviewImage, setSelectedReviewImage] = useState(null);
    const [notifyEmail, setNotifyEmail] = useState('');
    const [notifyPhone, setNotifyPhone] = useState('');
    const [notifyName, setNotifyName] = useState('');
    const [notifyStatus, setNotifyStatus] = useState({ type: '', msg: '' });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    // Accordion visibility states
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);

    // Scroll Refs
    const descriptionRef = useRef(null);
    const reviewsRef = useRef(null);

    // Gallery States
    const [activeImage, setActiveImage] = useState(null);
    const [images, setImages] = useState([]);

    // Calculate Estimated Delivery Time (5 days from today)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const wishlistItems = useSelector(state => state.wishlist.items);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/products/${productSlug || slug}`);
                const data = await res.json();
                setProduct(data);

                // Fetch Reviews
                if (data.id) {
                    const revRes = await fetch(`${API_URL}/api/reviews/product/${data.id}`);
                    const revData = await revRes.json();
                    setReviews(revData);
                }

                // Initialize Gallery
                let baseImages = [];
                if (data.image_url) {
                    baseImages = [data.image_url];
                    if (data.gallery_urls && data.gallery_urls.length > 0) {
                        baseImages = [...baseImages, ...data.gallery_urls];
                    }
                }
                setImages(baseImages);
                setActiveImage(baseImages[0]);

            } catch (error) {
                console.error("Error fetching product data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [slug, productSlug]);

    const handleMoreDetails = () => {
        setIsDescriptionOpen(true);
        descriptionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleClientReviewsLink = () => {
        setIsReviewsOpen(true);
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        setReviewMsg({ type: '', text: '' });

        if (reviewForm.rating === 0) {
            setReviewMsg({ type: 'error', text: 'Please select a rating for your critique.' });
            setSubmittingReview(false);
            return;
        }

        try {
            // 1. Upload Images if any
            let imageUrls = [];
            if (selectedImages.length > 0) {
                setUploadingImages(true);
                for (const file of selectedImages) {
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('folder', 'kiks_reviews');
                    const uploadRes = await fetch(`${API_URL}/api/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('kiks_token')}` },
                        body: formData
                    });
                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        imageUrls.push(uploadData.url);
                    }
                }
                setUploadingImages(false);
            }

            // 2. Submit Review
            const res = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('kiks_token')}`
                },
                body: JSON.stringify({ product_id: product.id, ...reviewForm, image_urls: imageUrls })
            });
            const data = await res.json();
            if (res.ok) {
                setReviewMsg({ type: 'success', text: 'Review submitted successfully.' });
                setReviewForm({ rating: 0, title: '', comment: '' });
                setSelectedImages([]);
                // Re-fetch reviews
                const revRes = await fetch(`${API_URL}/api/reviews/product/${product.id}`);
                setReviews(await revRes.json());
            } else {
                setReviewMsg({ type: 'error', text: data.msg || 'Review submission failed.' });
            }
        } catch (err) {
            setReviewMsg({ type: 'error', text: 'An error occurred while submitting your review.' });
            console.error(err);
        } finally {
            setSubmittingReview(false);
            setUploadingImages(false);
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            const res = await fetch(`${API_URL}/api/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('kiks_token')}` }
            });

            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== id));
                setReviewMsg({ type: 'success', text: 'Review deleted successfully.' });
                setTimeout(() => setReviewMsg({ type: '', text: '' }), 3000);
            } else {
                const data = await res.json();
                setReviewMsg({ type: 'error', text: data.msg || 'Failed to delete review.' });
            }
        } catch (err) {
            console.error(err);
            setReviewMsg({ type: 'error', text: 'System error during deletion process.' });
        }
    };

    const [isAdded, setIsAdded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const cartItems = useSelector(state => state.cart.items);
    const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('cart'));
            return;
        }
        if (product) {
            setIsAdding(true);
            
            // Reduced delay for "Snappy" premium feel
            await new Promise(resolve => setTimeout(resolve, 300));
            
            dispatch(addToCart({ ...product, quantity }));
            setIsAdding(false);
            setIsAdded(true);
            
            const newTotal = totalItems + quantity;
            showNotification(`${product.name} added to cart. (Total: ${newTotal})`);
            
            setTimeout(() => setIsAdded(false), 2000);
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('buy'));
            return;
        }
        if (product) {
            navigate('/checkout', { 
                state: { 
                    directItem: { 
                        ...product, 
                        quantity: 1 
                    } 
                } 
            });
        }
    };

    const handleWaitlistSubmit = async (e) => {
        e.preventDefault();
        setNotifyStatus({ type: 'loading', msg: 'Processing request...' });
        try {
            const email = notifyEmail || user?.email;
            const phone = notifyPhone || user?.telephone || user?.phone;

            // Priority: Guest Input Name > Logged-in User Name > Default
            let clientName = notifyName.trim();
            if (!clientName && user) {
                const fname = user.first_name || user.firstName || '';
                const lname = user.last_name || user.lastName || '';
                if (fname || lname) clientName = `${fname} ${lname}`.trim();
            }
            if (!clientName) clientName = 'Valued Client';

            const res = await fetch(`${API_URL}/api/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    email: email,
                    phone: phone,
                    customer_name: clientName
                })
            });
            const data = await res.json();
            if (res.ok) {
                setNotifyStatus({ type: 'success', msg: data.msg });
                setNotifyEmail('');
            } else {
                setNotifyStatus({ type: 'error', msg: data.msg });
            }
        } catch (err) {
            console.error('Waitlist submission error:', err);
            setNotifyStatus({ type: 'error', msg: 'Palace Vault connection failed. Please ensure the server is active.' });
        }
    };

    if (loading) {
        return <PageLoader fullScreen />;
    }

    if (!product) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center text-black font-serif tracking-widest uppercase">
                {t('product.not_found')}
            </div>
        );
    }

    const isProductInWishlist = wishlistItems.some(i => i.id === product.id);

    // Generate JSON-LD Schema for Google Rich Results
    const generateProductSchema = () => {
        if (!product) return null;

        const cleanPrice = (val) => {
            if (!val) return 0;
            return parseFloat(val.toString().replace(/[^0-9.]/g, ''));
        };

        const schema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": [getFullImageUrl(product.image_url)],
            "description": product.description?.substring(0, 300),
            "sku": product.id?.toString() || product.slug,
            "brand": {
                "@type": "Brand",
                "name": "KIKS"
            },
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": activeCurrency || "INR",
                "price": cleanPrice(product.sale_price || product.price),
                "availability": product.stock_count > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "itemCondition": "https://schema.org/NewCondition"
            }
        };

        if (reviews && reviews.length > 0) {
            const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
            schema.aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": avgRating.toFixed(1),
                "reviewCount": reviews.length
            };
        }

        return JSON.stringify(schema);
    };

    return (
        <div className="bg-white min-h-screen text-black pt-32 md:pt-40 pb-12 md:pb-32 px-6 lg:px-20 font-sans selection:bg-black/10 selection:text-black">
            <script type="application/ld+json">
                {generateProductSchema()}
            </script>
            <SEO
                title={product.name}
                description={product.description?.substring(0, 160)}
                keywords={`${product.name}, ${product.collection_name || ''}, Luxury Perfume, Extrait de Parfum`}
                image={product.image_url}
            />
            <button
                onClick={() => product?.collection_slug ? navigate(`/collection/${product.collection_slug}`) : navigate(-1)}
                className="inline-flex items-center space-x-4 mb-12 text-[10px] tracking-[0.3em] font-bold uppercase text-black/30 hover:text-black transition-colors"
            >
                <ArrowLeft size={14} /> <span>{t('product.back_to')} {product.collection_name || 'Previous'}</span>
            </button>

            <div className="container mx-auto flex flex-col lg:flex-row justify-center gap-16 lg:gap-24 items-start max-w-5xl">

                {/* Product Image Gallery */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end lg:pr-10">

                    {/* Main Image with Swipe Support */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative w-full max-w-[360px] lg:sticky lg:top-40 aspect-[3/4] overflow-hidden bg-[#f9f9f9] border border-black/5 shadow-2xl group cursor-grab active:cursor-grabbing touch-none"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeImage}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipeThreshold = 50;
                                    if (offset.x < -swipeThreshold) {
                                        // Swipe Left -> Next Image
                                        const currentIndex = images.indexOf(activeImage);
                                        const nextIndex = (currentIndex + 1) % images.length;
                                        setActiveImage(images[nextIndex]);
                                    } else if (offset.x > swipeThreshold) {
                                        // Swipe Right -> Prev Image
                                        const currentIndex = images.indexOf(activeImage);
                                        const prevIndex = (currentIndex - 1 + images.length) % images.length;
                                        setActiveImage(images[prevIndex]);
                                    }
                                }}
                                className="w-full h-full"
                            >
                                {activeImage?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) ? (
                                    <video
                                        src={getFullImageUrl(activeImage)}
                                        className="w-full h-full object-cover opacity-90 absolute inset-0 pointer-events-none"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={getFullImageUrl(activeImage)}
                                        alt={product.name}
                                        className="w-full h-full object-cover opacity-90 absolute inset-0 pointer-events-none select-none"
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                        
                        {/* Swipe Indicators (Mobile) */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 md:hidden pointer-events-none">
                            {images.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1 rounded-full transition-all duration-300 ${images.indexOf(activeImage) === i ? 'w-4 bg-black/40' : 'w-1 bg-black/10'}`} 
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Horizontal Thumbnails (Mobile & Desktop) */}
                    <div className="flex mt-6 space-x-4 overflow-x-auto hide-scrollbar w-full max-w-[360px] lg:sticky lg:top-[calc(10rem+480px)]">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`w-16 h-20 flex-shrink-0 border transition-all ${activeImage === img ? 'border-black/60 opacity-100' : 'border-black/5 opacity-40 hover:opacity-100 hover:border-black/30'}`}
                            >
                                {img?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) ? (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center relative">
                                        <video src={getFullImageUrl(img)} className="w-full h-full object-cover opacity-40" muted />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Zap size={14} className="text-gold-500 opacity-80" />
                                        </div>
                                    </div>
                                ) : (
                                    <img src={getFullImageUrl(img)} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info Section - Refined Proportions */}
                <div className="w-full lg:w-[40%] flex flex-col pt-2">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex flex-col mb-6">
                            <div className="relative mb-2">
                                <h1 className="text-xl md:text-2xl font-serif tracking-[0.1em] uppercase leading-tight pb-2 font-light">
                                     {product.name}
                                 </h1>
                                <div className="w-full h-[2px] bg-black" />
                            </div>

                            <p className="text-[9px] tracking-[0.2em] uppercase text-black/50 font-black mb-4">{product.product_type || 'EXTRAIT DE PARFUM SPRAY'}</p>

                            <button
                                onClick={handleMoreDetails}
                                className="text-[9px] tracking-[0.1em] uppercase text-black/40 bg-white/0 border-b border-black/10 hover:text-black hover:border-black transition-all mb-2 pb-0.5 w-fit"
                            >
                                More details
                            </button>


                        </div>

                        {/* Price & Wishlist Row */}
                        <div className="flex items-center justify-between mb-4 md:mb-8">
                            <div className="flex flex-col">
                                {product.sale_price ? (
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <p className="text-[11px] md:text-xs text-black/40 line-through tracking-[0.1em]">
                                                {formatCurrency(product.price, activeCurrency, rates, symbols)}
                                            </p>
                                            <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase">
                                                SAVE {Math.round((1 - (parseFloat(product.sale_price.toString().replace(/[^0-9.]/g, '')) / parseFloat(product.price.toString().replace(/[^0-9.]/g, '')))) * 100)}%
                                            </span>
                                        </div>
                                        <div className="flex items-baseline space-x-2">
                                            <p className="text-2xl md:text-4xl font-bold text-black tracking-[0.1em]">
                                                {formatCurrency(product.sale_price, activeCurrency, rates, symbols)}
                                            </p>
                                            <span className="text-[10px] text-black/50 tracking-[0.2em] font-black uppercase italic">OFFER</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xl md:text-2xl font-bold text-black tracking-[0.1em]">
                                        {formatCurrency(product.price, activeCurrency, rates, symbols)}*
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-3 md:space-x-5">
                                <span className="bg-black px-2 py-0.5 text-white text-[9px] font-black tracking-[0.1em] uppercase">New</span>
                                <button
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            dispatch(openWishlistAuthPopup('wishlist'));
                                        } else {
                                            const isInWishlist = wishlistItems.some(i => i.id === product.id);
                                            dispatch(toggleWishlistAndSync(product));
                                            showNotification(isInWishlist ? `Removed from wishlist.` : `${product.name} added to wishlist.`);
                                        }
                                    }}
                                    className={`transition-all duration-300 ${isProductInWishlist ? 'text-black' : 'text-black/30 hover:text-black'}`}
                                >
                                    <Heart size={20} fill={isProductInWishlist ? "currentColor" : "none"} strokeWidth={1} />
                                </button>
                            </div>
                        </div>

                        <div className="h-[1px] bg-black/5 w-full mb-4 md:mb-8" />

                        {/* Size Display */}
                        <div className="mb-4 md:mb-8 space-y-2 md:space-y-4">
                            <div className="flex flex-col space-y-2 md:space-y-4">
                                <p className="text-[10px] md:text-[11px] tracking-[0.2em] text-black/80 font-black uppercase">Size</p>
                                <div className="w-full bg-transparent border border-black/10 p-3 md:p-4 text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-black">
                                    100 ML
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions Section */}
                    {product.stock_count > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="w-full flex flex-col space-y-4 md:space-y-6"
                        >
                            <div className="flex flex-row gap-2 md:gap-4 w-full">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding || isAdded}
                                    className={`flex-1 h-12 md:h-14 border border-black text-[9px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase transition-all duration-500 active:scale-[0.98] flex items-center justify-center ${isAdding || isAdded ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                                >
                                    {isAdding ? (
                                        <Loader2 size={16} className="animate-spin text-white" />
                                    ) : isAdded ? (
                                        'ADDED TO BAG'
                                    ) : (
                                        'ADD TO BAG'
                                    )}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 h-12 md:h-14 bg-black text-white border border-black text-[9px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase hover:bg-black/90 transition-all duration-500 active:scale-[0.98]"
                                >
                                    BUY NOW
                                </button>
                            </div>

                            <div className="flex flex-col space-y-4 md:space-y-8 pt-1">
                                <p className="text-[9px] md:text-[10px] text-black/30 tracking-widest leading-loose">
                                    *MRP (inclusive of all taxes).
                                </p>

                                <button
                                    onClick={handleClientReviewsLink}
                                    className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-black font-black underline underline-offset-[8px] hover:text-black/60 transition-all w-fit"
                                >
                                    Client reviews
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="w-full space-y-6"
                        >
                            <div className="bg-black/[0.02] border border-black/5 p-10">
                                <span className="text-[11px] tracking-[0.4em] font-black text-black uppercase block mb-6">Coming Soon</span>
                                <p className="text-[11px] text-black/40 tracking-widest leading-loose mb-10 italic">This fragrance is currently being prepared. Join the waitlist to be notified when it's available.</p>
                                <form onSubmit={handleWaitlistSubmit} className="space-y-5">
                                    {!isAuthenticated && (
                                        <div className="space-y-4">
                                            <input
                                                type="email"
                                                placeholder="EMAIL ADDRESS"
                                                value={notifyEmail}
                                                onChange={(e) => setNotifyEmail(e.target.value.toUpperCase())}
                                                required
                                                className="w-full bg-white border border-black/10 p-5 text-[10px] tracking-[0.2em] uppercase focus:border-black outline-none transition-colors"
                                            />
                                        </div>
                                    )}
                                     <button
                                        type="submit"
                                        disabled={notifyStatus.type === 'loading'}
                                        className="w-full h-14 bg-black text-white text-[11px] font-black tracking-[0.5em] uppercase hover:bg-black/90 transition-all"
                                    >
                                        {notifyStatus.type === 'loading' ? 'SENDING...' : 'NOTIFY ME'}
                                    </button>

                                    <AnimatePresence>
                                        {notifyStatus.msg && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`mt-4 p-4 text-[10px] tracking-widest uppercase text-center border ${notifyStatus.type === 'success'
                                                    ? 'border-black/20 bg-black/[0.02] text-black'
                                                    : notifyStatus.type === 'error'
                                                        ? 'border-red-500/30 bg-red-500/5 text-red-600'
                                                        : 'border-black/10 bg-black/[0.01] text-black/60'
                                                    }`}
                                            >
                                                {notifyStatus.msg}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Accordion Sections - Adjusted Spacing for Premium Feel */}
            <div className="container mx-auto mt-32 md:mt-60 max-w-4xl px-6 mb-20">
                <h2 className="text-center text-[11px] md:text-sm font-black tracking-[0.4em] md:tracking-[0.6em] uppercase mb-8 md:mb-16 text-black opacity-80">PRODUCT DESCRIPTION</h2>

                <div ref={descriptionRef}>
                    <ProductAccordion
                        title={t('product.description')}
                        isOpen={isDescriptionOpen}
                        onToggle={setIsDescriptionOpen}
                    >
                        <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                    </ProductAccordion>
                </div>

                <ProductAccordion
                    title="ADDITIONAL INFORMATION"
                    isOpen={isAdditionalOpen}
                    onToggle={setIsAdditionalOpen}
                >



                    {product.additional_info && (
                        <div className="mb-14 border-l border-black/10 pl-6 py-2">
                            <p className="text-[10px] md:text-[11px] leading-relaxed text-black/70 whitespace-pre-wrap font-serif italic tracking-wide">
                                {product.additional_info}
                            </p>
                        </div>
                    )}

                    {/* Consolidated Olfactory Pyramid */}
                    <div className="mt-14 space-y-10 border-t border-black/5 pt-10">
                        <h4 className="text-[10px] tracking-[0.4em] uppercase text-black mb-8 font-black">Fragrance Notes</h4>
                        <div className="grid grid-cols-1 gap-8">
                            <div>
                                <span className="text-[8px] tracking-[0.3em] uppercase text-black/40 font-black block mb-2">Top Notes</span>
                                <p className="text-[10px] md:text-[11px] leading-relaxed text-black/60 font-sans tracking-wide">
                                    {product.top_notes}
                                </p>
                            </div>
                            <div>
                                <span className="text-[8px] tracking-[0.3em] uppercase text-black/40 font-black block mb-2">Heart Notes</span>
                                <p className="text-[10px] md:text-[11px] leading-relaxed text-black/60 font-sans tracking-wide">
                                    {product.heart_notes}
                                </p>
                            </div>
                            <div>
                                <span className="text-[8px] tracking-[0.3em] uppercase text-black/40 font-black block mb-2">Base Notes</span>
                                <p className="text-[10px] md:text-[11px] leading-relaxed text-black/60 font-sans tracking-wide">
                                    {product.base_notes}
                                </p>
                            </div>
                        </div>
                    </div>
                </ProductAccordion>

                <div ref={reviewsRef}>
                    <ProductAccordion
                        title={t('product.reviews')}
                        isOpen={isReviewsOpen}
                        onToggle={setIsReviewsOpen}
                        extra={
                            <div className="flex items-center space-x-2 text-black">
                                <Star size={12} fill="black" stroke="black" />
                                <span className="text-[12px] text-black font-black">
                                    {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : '5.0'}
                                </span>
                                <span className="text-[10px] text-black/30 ml-2 tracking-[0.1em] font-sans uppercase">
                                    ({reviews.length})
                                </span>
                            </div>
                        }
                    >
                        <div className="space-y-16">
                            {/* REVIEW SUBMISSION FORM */}
                            {isAuthenticated ? (
                                <div className="mb-20 bg-black/[0.02] p-5 md:p-10 border border-black/5">
                                    <h4 className="text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.4em] font-black uppercase text-black mb-8 md:mb-10">{t('product.share_critique')}</h4>
                                    <form onSubmit={handleAddReview} className="space-y-6 md:space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
                                            <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white/40">{t('product.rating')}</p>
                                            <div className="flex space-x-2 md:space-x-3">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                        className={`transition-all duration-300 ${star <= reviewForm.rating ? 'text-black' : 'text-black/20 hover:text-black/40'}`}
                                                    >
                                                        <Star
                                                            className="w-4 h-4 md:w-5 md:h-5"
                                                            fill={star <= reviewForm.rating ? "black" : "none"}
                                                            stroke="currentColor"
                                                            strokeWidth={1.5}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <input
                                            placeholder={t('product.headline')}
                                            required
                                            className="w-full bg-transparent border-b border-black/10 py-4 text-xs tracking-widest focus:border-black outline-none transition-colors text-black"
                                            value={reviewForm.title}
                                            onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                        />
                                        <textarea
                                            placeholder={t('product.experience_placeholder')}
                                            required
                                            className="w-full bg-transparent border border-black/10 p-5 text-xs tracking-widest leading-relaxed focus:border-black outline-none h-32 transition-colors text-black"
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        />

                                        {/* Image Upload */}
                                        <div className="space-y-8 md:space-y-20">
                                            <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-black/40">Visual Verification</p>
                                            <div className="flex flex-wrap gap-4 md:gap-6">
                                                {selectedImages.map((file, idx) => (
                                                    <div key={idx} className="relative w-24 h-24 border border-black/10 p-1">
                                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                                                            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-xl"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="w-24 h-24 border border-black/10 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-all">
                                                    <Camera size={24} className="text-black/20" strokeWidth={1.5} />
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => setSelectedImages([...selectedImages, ...Array.from(e.target.files)])}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            disabled={submittingReview || uploadingImages}
                                            className="w-full h-14 bg-black text-white text-[11px] font-black tracking-[0.5em] uppercase hover:bg-black/90 transition-all"
                                        >
                                            {submittingReview ? 'SENDING...' : uploadingImages ? 'UPLOADING...' : t('product.log_critique')}
                                        </button>
                                        <AnimatePresence>
                                            {reviewMsg.text && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={`mt-6 p-4 text-[10px] tracking-[0.2em] uppercase text-center border ${reviewMsg.type === 'success'
                                                            ? 'border-gold-500/30 bg-gold-500/5 text-gold-500'
                                                            : 'border-red-500/30 bg-red-500/5 text-red-400'
                                                        }`}
                                                >
                                                    {reviewMsg.text}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </form>
                                </div>
                            ) : (
                                <div className="mb-20 p-10 text-center border border-black/5 bg-black/[0.01]">
                                    <p className="text-[10px] tracking-[0.5em] text-black uppercase font-black mb-4">
                                        Verified Purchase Required
                                    </p>
                                    <p className="text-[9px] tracking-[0.3em] text-black/30 uppercase leading-relaxed max-w-xs mx-auto mb-10">
                                        Critiques are reserved for patrons who have acquired this essence through the official boutique.
                                    </p>
                                    <Link 
                                        to="/login" 
                                        className="inline-block text-[9px] tracking-[0.4em] text-black font-black border-b border-black/30 pb-2 hover:text-black/60 hover:border-black/60 transition-all uppercase"
                                    >
                                        Access Account
                                    </Link>
                                </div>
                            )}

                            {/* REVIEWS LIST */}
                            <div className="space-y-24 pb-20">
                                {reviews.length === 0 ? (
                                    <p className="text-[11px] tracking-widest text-black/20 text-center py-20 italic">No reviews yet. Be the first to share your experience.</p>
                                ) : (
                                    reviews.map((rev, i) => (
                                        <div key={rev.id} className={`${i > 0 ? 'border-t border-black/5 pt-20' : ''} relative group`}>
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center space-x-1.5 text-black">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            fill={i < rev.rating ? "black" : "none"}
                                                            stroke="black"
                                                            strokeWidth={1}
                                                            className={i < rev.rating ? "opacity-100" : "opacity-20"}
                                                        />
                                                    ))}
                                                </div>
                                                {(user && (Number(user.id) === Number(rev.user_id) || user.role === 'admin' || user.email === 'kiksultraluxury@gmail.com')) && (
                                                    <button
                                                        onClick={() => handleDeleteReview(rev.id)}
                                                        className="text-red-500/40 hover:text-red-500 transition-all text-[9px] uppercase tracking-widest"
                                                    >
                                                        Remove Review
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-black font-black text-sm tracking-[0.1em] mb-6 uppercase">{rev.title}</p>
                                            <p className="text-black/60 leading-relaxed text-sm max-w-2xl">{rev.comment}</p>

                                            {rev.image_urls && (Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)).length > 0 && (
                                                <div className="flex flex-wrap gap-6 mt-10">
                                                    {(Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)).map((url, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="w-32 h-32 overflow-hidden border border-black/10 group/img cursor-zoom-in relative"
                                                            onClick={() => setSelectedReviewImage({ url, review: rev })}
                                                        >
                                                            <img
                                                                src={getFullImageUrl(url)}
                                                                alt={`Review ${idx}`}
                                                                className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-1000"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-5 mt-10">
                                                <div className="w-6 h-6 border border-white/10 flex items-center justify-center text-[10px] text-white">
                                                    {rev.first_name?.[0]}
                                                </div>
                                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                                                    {rev.first_name} {rev.last_name}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </ProductAccordion>
                </div>
            </div>

            {/* DYNAMIC STORYTELLING SECTION (Independent Editorial Experience) */}
            <div className="bg-white pt-10 pb-2 md:pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    {/* NEW: CINEMATIC STORY BANNER */}
                    {product.story_banner && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            className="w-full aspect-video md:aspect-[21/9] mb-12 md:mb-16 overflow-hidden border border-black/5 p-2 bg-black/[0.02]"
                        >
                            {product.story_banner?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) ? (
                                <video
                                    src={getFullImageUrl(product.story_banner)}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={getFullImageUrl(product.story_banner)}
                                    className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[3000ms] ease-in-out"
                                    alt="Story Banner"
                                />
                            )}
                        </motion.div>
                    )}

                    <div className="mb-16 md:mb-24 border-y border-black/5 py-12 md:py-16">
                        <h3 className="text-[14px] tracking-[0.5em] text-black font-black uppercase text-center mb-10 md:mb-12 italic">Notes Story</h3>

                        <div className="flex flex-col space-y-6 md:space-y-20">
                            {/* Layer Renderer Helper */}
                            {[
                                { title: 'Top Notes', data: product.top_notes_icons, fallback: "https://cdn-icons-png.flaticon.com/512/3503/3503792.png", text: product.top_note_label },
                                { title: 'Heart Notes', data: product.heart_notes_icons, fallback: "https://cdn-icons-png.flaticon.com/512/2926/2926330.png", text: product.heart_note_label },
                                { title: 'Base Notes', data: product.base_notes_icons, fallback: "https://cdn-icons-png.flaticon.com/512/3503/3503792.png", text: product.base_note_label }
                            ].map((layer, lIdx) => {
                                // Enhanced Safe Parsing logic
                                let notes = [];
                                try {
                                    if (typeof layer.data === 'string' && layer.data.trim()) {
                                        notes = JSON.parse(layer.data);
                                    } else if (Array.isArray(layer.data)) {
                                        notes = layer.data;
                                    }
                                } catch (e) {
                                    console.warn(`Registry Sync Warning: Olfactory layer "${layer.title}" has an unconventional data format.`, e);
                                    notes = [];
                                }

                                return (
                                    <div key={lIdx} className="flex flex-col items-center text-center px-2">
                                        <h4 className="text-[13px] md:text-[15px] tracking-[0.3em] uppercase text-black mb-3 md:mb-8 font-black">{layer.title}</h4>
                                        
                                        {/* Icons Grid - Fragrantica Style (Ultra-Compact Perfectly Centered) */}
                                        <div className="flex flex-row flex-nowrap md:flex-wrap justify-center items-start gap-x-1 md:gap-x-10 gap-y-4 md:gap-y-12 mb-4 md:mb-10 max-w-4xl mx-auto w-full px-1 overflow-x-auto no-scrollbar" style={{ justifyContent: 'safe center' }}>
                                            {notes && notes.length > 0 ? notes.map((note, nIdx) => (
                                                <div key={nIdx} className="flex flex-col items-center group flex-shrink-0 w-[68px] md:w-24">
                                                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white border border-black/5 flex items-center justify-center mb-2 md:mb-4 transition-all duration-700 hover:shadow-xl hover:scale-110 overflow-hidden shadow-sm">
                                                        <img
                                                            src={getFullImageUrl(note.url) || layer.fallback}
                                                            className="w-full h-full object-cover transition-transform duration-700"
                                                            alt={note.name || "Scent Note"}
                                                        />
                                                    </div>
                                                    <p className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase text-black/60 font-black leading-tight text-center px-1">
                                                        {note.name || "Layer Note"}
                                                    </p>
                                                </div>
                                            )) : (
                                                <div className="flex flex-col items-center group col-span-3">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/[0.03] border border-black/10 flex items-center justify-center mb-4">
                                                        <img src={layer.fallback} className="w-8 h-8 md:w-10 md:h-10 object-contain opacity-20" alt="Olfactory Fallback" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <p className="text-[11px] md:text-[13px] tracking-widest text-black/80 italic font-serif leading-loose max-w-2xl border-t border-black/5 pt-3 md:pt-6">{layer.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. THE MUSE / INSPIRATION SECTION (Arched Layout - Compact on Mobile) */}
                    <div className="mb-12 md:mb-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 lg:gap-40 items-center">
                        <div className="order-2 md:order-1 lg:px-12 px-4">
                            <h3 className="text-lg md:text-2xl font-serif tracking-[0.2em] text-black mb-4 md:mb-8 leading-tight uppercase">
                                {product.name ? `The Fragrance Signature of ${product.name}` : 'The Fragrance Signature of KIKS'}
                            </h3>
                            <div className="w-12 h-px bg-black mb-4 md:mb-8" />
                            <p className="text-[12px] md:text-[15px] text-black/50 leading-relaxed tracking-wider font-light">
                                {product.muse_story || "Each creation is a study in captivating contrasts. Like a silent authority that rules with a serene, clarifying focus, yet possesses a soul that blossoms with the intoxicating warmth of a hidden garden. This fragrance is the essence of perfect equilibrium."}
                            </p>
                        </div>
                        <div className="order-1 md:order-2 flex justify-center md:justify-end px-4">
                            <motion.div
                                initial={{ scale: 1.05 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                                className="w-full max-w-[350px] md:max-w-[500px] aspect-[4/5] rounded-t-full overflow-hidden border border-black/5 p-2 md:p-3 bg-black/[0.02]"
                            >
                                {product.muse_image?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) ? (
                                    <video
                                        src={getFullImageUrl(product.muse_image)}
                                        className="w-full h-full object-cover rounded-t-full"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={getFullImageUrl(product.muse_image) || "https://images.unsplash.com/photo-1615485290382-441e4d019cb5?q=80&w=2000&auto=format&fit=crop"}
                                        className="w-full h-full object-cover rounded-t-full"
                                        alt="Muse"
                                    />
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* 3. ABOUT THE HOUSE SECTION */}
                    <div className="mb-4 md:mb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center bg-white p-6 md:p-12 border border-black/5">
                        <div className="flex justify-center lg:justify-start">
                            <img
                                src="/logo-kiks.png"
                                className="w-full max-w-[300px] md:max-w-[350px] h-auto object-contain"
                                alt="About House"
                            />
                        </div>
                        <div className="lg:px-8 text-center lg:text-left">
                            <h3 className="text-[14px] tracking-[0.4em] font-black uppercase text-black mb-6 md:mb-8">About KIKS</h3>
                            <p className="text-[12px] text-black/40 leading-loose tracking-widest font-medium">
                                Each fragrance is a crafted balance of strength and subtlety, tradition and individuality.
                                Made for those who seek depth in every note — and meaning in every moment.
                                Our premium process preserves the high quality of our scents, prepared to perfection.
                                We don't just create perfumes; we capture ephemeral moments and crystallize them into timeless olfactory diamonds.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Review Image Lightbox */}
            <AnimatePresence>
                {selectedReviewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 sm:p-8 bg-white/95 backdrop-blur-sm"
                        onClick={() => setSelectedReviewImage(null)}
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            const startX = touch.clientX;
                            const handleTouchEnd = (e) => {
                                const deltaX = e.changedTouches[0].clientX - startX;
                                if (Math.abs(deltaX) > 50) {
                                    const { index, gallery } = selectedReviewImage;
                                    const newIndex = deltaX > 0 ? (index - 1 + gallery.length) % gallery.length : (index + 1) % gallery.length;
                                    setSelectedReviewImage({ ...selectedReviewImage, url: gallery[newIndex], index: newIndex });
                                }
                                window.removeEventListener('touchend', handleTouchEnd);
                            };
                            window.addEventListener('touchend', handleTouchEnd);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-3xl w-full bg-white border border-black/10 overflow-hidden flex flex-col md:flex-row shadow-2xl max-h-[85vh] md:max-h-none overflow-y-auto md:overflow-visible"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedReviewImage(null)}
                                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-black text-black hover:text-white transition-all rounded-full border border-black/10"
                            >
                                <X size={20} />
                            </button>

                            {/* Image Section */}
                            <div className="w-full md:w-3/5 h-[35vh] sm:h-[40vh] md:h-[60vh] bg-gray-100 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-black/10 flex-shrink-0">
                                <img
                                    src={getFullImageUrl(selectedReviewImage.url)}
                                    alt="Review Large"
                                    className="max-w-full max-h-full object-contain p-2"
                                />
                            </div>

                            {/* Info Section */}
                            <div className="w-full md:w-2/5 p-5 sm:p-6 flex flex-col justify-between bg-white overflow-y-auto">
                                <div>
                                    <div className="flex mb-3 sm:mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={10}
                                                className={i < selectedReviewImage.review.rating ? "fill-black text-black" : "text-black/10"}
                                            />
                                        ))}
                                    </div>
                                    <h3 className="text-base sm:text-lg font-serif text-white mb-2 sm:mb-3 tracking-wide uppercase italic">
                                        {selectedReviewImage.review.title}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-white/60 leading-relaxed font-sans tracking-wide">
                                        {selectedReviewImage.review.comment}
                                    </p>
                                </div>
                                 <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-black/5">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black/5 border border-black/10 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-black uppercase italic">
                                            {selectedReviewImage.review.first_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-[8px] sm:text-[9px] text-black/80 uppercase tracking-[0.2em] font-bold">
                                                {selectedReviewImage.review.first_name} {selectedReviewImage.review.last_name}
                                            </p>
                                            <p className="text-[7px] sm:text-[8px] text-black/40 uppercase tracking-[0.1em] mt-0.5">
                                                {new Date(selectedReviewImage.review.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
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
    );
};

export default ProductDetail;
