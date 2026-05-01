import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, ArrowLeft, Loader2, Sparkles, Droplets, Wind, Zap, Truck, ChevronDown, ChevronUp, Star, Trash2, Camera, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../store/cartSlice';
import { toggleWishlistAndSync } from '../store/wishlistSlice';
import { openAuthModal } from '../store/uiSlice';
import { formatCurrency } from '../utils/currency';
import SEO from '../components/SEO';
import { getFullImageUrl } from '../utils/url';

import PageLoader from '../components/PageLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductAccordion = ({ title, isOpen: externalIsOpen, onToggle, defaultOpen = false, children, extra }) => {
    const [localIsOpen, setLocalIsOpen] = useState(defaultOpen);
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : localIsOpen;
    const toggle = () => onToggle ? onToggle(!isOpen) : setLocalIsOpen(!isOpen);

    return (
        <div className="border-t border-[#333] w-full bg-black">
            <button
                onClick={toggle}
                className="w-full flex justify-between items-center py-5 group"
            >
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-white font-sans group-hover:text-gold-400 transition-colors">
                    {title}
                </span>
                <div className="flex items-center space-x-6">
                    {extra && <div className="hidden sm:flex">{extra}</div>}
                    {isOpen ? <ChevronUp size={16} className="text-[#888] stroke-[1.5]" /> : <ChevronDown size={16} className="text-[#888] stroke-[1.5]" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black"
                    >
                        <div className="pb-8 pt-4 px-2 text-[#aaa] text-xs tracking-[0.05em] leading-loose font-sans">
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
    const [notifyEmail, setNotifyEmail] = useState('');
    const [notifyPhone, setNotifyPhone] = useState('');
    const [notifyName, setNotifyName] = useState('');
    const [notifyStatus, setNotifyStatus] = useState({ type: '', msg: '' });

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

    const handleAddToCart = () => {
        if (product) {
            dispatch(addToCart({ ...product, quantity }));
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
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center text-white font-serif tracking-widest uppercase">
                {t('product.not_found')}
            </div>
        );
    }

    const isProductInWishlist = wishlistItems.some(i => i.id === product.id);

    return (
        <div className="bg-black min-h-screen text-white pt-32 md:pt-40 pb-32 px-6 lg:px-20 font-sans selection:bg-gold-500/30 selection:text-white">
            <SEO
                title={product.name}
                description={product.description?.substring(0, 160)}
                keywords={`${product.name}, ${product.collection_name || ''}, Luxury Perfume, Extrait de Parfum`}
                image={product.image_url}
            />
            <button
                onClick={() => product?.collection_slug ? navigate(`/collection/${product.collection_slug}`) : navigate(-1)}
                className="inline-flex items-center space-x-4 mb-12 text-[10px] tracking-[0.3em] font-bold uppercase text-white/30 hover:text-white transition-colors"
            >
                <ArrowLeft size={14} /> <span>{t('product.back_to')} {product.collection_name || 'Previous'}</span>
            </button>

            <div className="container mx-auto flex flex-col lg:flex-row justify-center gap-16 lg:gap-24 items-start max-w-5xl">

                {/* Product Image Gallery */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end lg:pr-10">

                    {/* Main Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative w-full max-w-[360px] lg:sticky lg:top-40 aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl group"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="w-full h-full"
                            >
                                {activeImage?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) ? (
                                    <video
                                        src={getFullImageUrl(activeImage)}
                                        className="w-full h-full object-cover opacity-90 absolute inset-0"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={getFullImageUrl(activeImage)}
                                        alt={product.name}
                                        className="w-full h-full object-cover opacity-90 absolute inset-0"
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Horizontal Thumbnails (Mobile & Desktop) */}
                    <div className="flex mt-6 space-x-4 overflow-x-auto hide-scrollbar w-full max-w-[360px] lg:sticky lg:top-[calc(10rem+480px)]">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`w-16 h-20 flex-shrink-0 border transition-all ${activeImage === img ? 'border-white/60 opacity-100' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/30'}`}
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
                                <h1 className="text-2xl md:text-3xl font-black tracking-[0.2em] uppercase leading-tight pb-2">
                                    {product.name}
                                </h1>
                                <div className="w-full h-[2px] bg-white" />
                            </div>

                            <p className="text-[9px] tracking-[0.2em] uppercase text-white/50 font-black mb-4">{product.product_type || 'EXTRAIT DE PARFUM SPRAY'}</p>

                            <button
                                onClick={handleMoreDetails}
                                className="text-[9px] tracking-[0.1em] uppercase text-white/40 bg-white/0 border-b border-white/10 hover:text-white hover:border-white transition-all mb-2 pb-0.5 w-fit"
                            >
                                More details
                            </button>


                        </div>

                        {/* Price & Wishlist Row */}
                        <div className="flex items-center justify-between mb-4 md:mb-8">
                            <p className="text-xl font-bold text-white tracking-[0.1em]">
                                {formatCurrency(product.price, activeCurrency, rates, symbols)}*
                            </p>
                            <div className="flex items-center space-x-3 md:space-x-5">
                                <span className="bg-white px-2 py-0.5 text-black text-[9px] font-black tracking-[0.1em] uppercase">New</span>
                                <button
                                    onClick={() => {
                                        dispatch(toggleWishlistAndSync(product));
                                    }}
                                    className={`transition-all duration-300 ${isProductInWishlist ? 'text-gold-500' : 'text-white/30 hover:text-white'}`}
                                >
                                    <Heart size={20} fill={isProductInWishlist ? "currentColor" : "none"} strokeWidth={1} />
                                </button>
                            </div>
                        </div>

                        <div className="h-[1px] bg-white/5 w-full mb-4 md:mb-8" />

                        {/* Size Display */}
                        <div className="mb-4 md:mb-8 space-y-2 md:space-y-4">
                            <div className="flex flex-col space-y-2 md:space-y-4">
                                <p className="text-[10px] md:text-[11px] tracking-[0.2em] text-white/80 font-black uppercase">Size</p>
                                <div className="w-full bg-transparent border border-white/10 p-3 md:p-4 text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white">
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
                            <button
                                onClick={handleAddToCart}
                                className="w-full h-12 md:h-14 bg-black text-white border border-white text-[11px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-500 active:scale-[0.98]"
                            >
                                ADD TO BAG
                            </button>

                            <div className="flex flex-col space-y-4 md:space-y-8 pt-1">
                                <p className="text-[9px] md:text-[10px] text-white/30 tracking-widest leading-loose">
                                    *MRP (inclusive of all taxes).
                                </p>

                                <button
                                    onClick={handleClientReviewsLink}
                                    className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white font-black underline underline-offset-[8px] hover:text-gold-400 transition-all w-fit"
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
                            <div className="bg-white/5 border border-white/5 p-10">
                                <span className="text-[11px] tracking-[0.4em] font-black text-gold-500 uppercase block mb-6">Coming Soon</span>
                                <p className="text-[11px] text-white/40 tracking-widest leading-loose mb-10 italic">This fragrance is currently being prepared. Join the waitlist to be notified when it's available.</p>
                                <form onSubmit={handleWaitlistSubmit} className="space-y-5">
                                    {!isAuthenticated && (
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="FULL NAME"
                                                value={notifyName}
                                                onChange={(e) => setNotifyName(e.target.value.toUpperCase())}
                                                required
                                                className="w-full bg-black border border-white/10 p-5 text-[10px] tracking-[0.2em] uppercase focus:border-white outline-none transition-colors"
                                            />
                                            <input
                                                type="email"
                                                placeholder="EMAIL ADDRESS"
                                                value={notifyEmail}
                                                onChange={(e) => setNotifyEmail(e.target.value.toUpperCase())}
                                                required
                                                className="w-full bg-black border border-white/10 p-5 text-[10px] tracking-[0.2em] uppercase focus:border-white outline-none transition-colors"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="MOBILE NUMBER"
                                                value={notifyPhone}
                                                onChange={(e) => setNotifyPhone(e.target.value)}
                                                required
                                                className="w-full bg-black border border-white/10 p-5 text-[10px] tracking-[0.2em] uppercase focus:border-white outline-none transition-colors"
                                            />
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={notifyStatus.type === 'loading'}
                                        className="w-full h-14 border border-white text-white text-[11px] font-black tracking-[0.5em] uppercase hover:bg-white hover:text-black transition-all"
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
                                                    ? 'border-gold-500/30 bg-gold-500/5 text-gold-500'
                                                    : notifyStatus.type === 'error'
                                                        ? 'border-red-500/30 bg-red-500/5 text-red-400'
                                                        : 'border-white/10 bg-white/5 text-white/60'
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

            {/* Accordion Sections - Adjusted Spacing */}
            <div className="container mx-auto mt-10 md:mt-20 max-w-4xl px-6 mb-20">
                <h2 className="text-center text-[16px] md:text-2xl font-black tracking-[0.4em] md:tracking-[0.6em] uppercase mb-8 md:mb-16 text-white">ADDITIONAL INFORMATION</h2>

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
                    title={t('product.additional')}
                    isOpen={isAdditionalOpen}
                    onToggle={setIsAdditionalOpen}
                >
                    <p className="mb-6 text-[10px] tracking-[0.2em] text-white/60"><span className="uppercase font-black text-white/40 mr-2">{t('product.concentration')}:</span> <span className="font-bold text-white">PARFUM (EXTRAIT)</span></p>
                    <p className="mb-14 text-[10px] tracking-[0.2em] text-white/60"><span className="uppercase font-black text-white/40 mr-2">{t('product.volume')}:</span> <span className="font-bold text-white">100ML / 3.4 OZ</span></p>

                    {/* Consolidated Olfactory Pyramid */}
                    <div className="mt-14 space-y-10 border-t border-white/5 pt-10">
                        <h4 className="text-[10px] tracking-[0.4em] uppercase text-white mb-8 font-black">Fragrance Notes</h4>
                        <div className="grid grid-cols-1 gap-8">
                            <div>
                                <span className="text-[9px] tracking-[0.3em] uppercase text-gold-500 font-black block mb-3">Top Notes</span>
                                <p className="text-[11px] leading-relaxed text-white/70 italic font-serif">
                                    {(product.top_note_label && product.top_note_label !== product.top_notes) ? `${product.top_note_label}: ${product.top_notes}` : product.top_notes}
                                </p>
                            </div>
                            <div>
                                <span className="text-[9px] tracking-[0.3em] uppercase text-gold-500 font-black block mb-3">Heart Notes</span>
                                <p className="text-[11px] leading-relaxed text-white/70 italic font-serif">
                                    {(product.heart_note_label && product.heart_note_label !== product.heart_notes) ? `${product.heart_note_label}: ${product.heart_notes}` : product.heart_notes}
                                </p>
                            </div>
                            <div>
                                <span className="text-[9px] tracking-[0.3em] uppercase text-gold-500 font-black block mb-3">Base Notes</span>
                                <p className="text-[11px] leading-relaxed text-white/70 italic font-serif">
                                    {(product.base_note_label && product.base_note_label !== product.base_notes) ? `${product.base_note_label}: ${product.base_notes}` : product.base_notes}
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
                            <div className="flex items-center space-x-2 text-white">
                                <Star size={12} fill="white" stroke="white" />
                                <span className="text-[12px] text-white font-black">
                                    {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : '5.0'}
                                </span>
                                <span className="text-[10px] text-white/30 ml-2 tracking-[0.1em] font-sans uppercase">
                                    ({reviews.length})
                                </span>
                            </div>
                        }
                    >
                        <div className="space-y-16">
                            {/* REVIEW SUBMISSION FORM */}
                            {isAuthenticated ? (
                                <div className="mb-20 bg-white/[0.02] p-5 md:p-10 border border-white/5">
                                    <h4 className="text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.4em] font-black uppercase text-white mb-8 md:mb-10">{t('product.share_critique')}</h4>
                                    <form onSubmit={handleAddReview} className="space-y-6 md:space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
                                            <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white/40">{t('product.rating')}</p>
                                            <div className="flex space-x-2 md:space-x-3">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                        className={`transition-all duration-300 ${star <= reviewForm.rating ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                                                    >
                                                        <Star
                                                            className="w-4 h-4 md:w-5 md:h-5"
                                                            fill={star <= reviewForm.rating ? "white" : "none"}
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
                                            className="w-full bg-transparent border-b border-white/10 py-4 text-xs tracking-widest focus:border-white outline-none transition-colors"
                                            value={reviewForm.title}
                                            onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                        />
                                        <textarea
                                            placeholder={t('product.experience_placeholder')}
                                            required
                                            className="w-full bg-transparent border border-white/10 p-5 text-xs tracking-widest leading-relaxed focus:border-white outline-none h-32 transition-colors"
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        />

                                        {/* Image Upload */}
                                        <div className="space-y-4 md:space-y-6">
                                            <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white/40">Visual Verification</p>
                                            <div className="flex flex-wrap gap-4 md:gap-6">
                                                {selectedImages.map((file, idx) => (
                                                    <div key={idx} className="relative w-24 h-24 border border-white/10 p-1">
                                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                                                            className="absolute -top-2 -right-2 bg-white text-black rounded-full p-1 shadow-xl"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="w-24 h-24 border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                                                    <Camera size={24} className="text-white/20" strokeWidth={1.5} />
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
                                            className="w-full h-14 bg-white text-black text-[11px] font-black tracking-[0.5em] uppercase hover:bg-gray-200 transition-all"
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
                                <div className="mb-20 p-10 text-center border border-white/5 italic">
                                    <p className="text-[11px] tracking-[0.3em] text-white/30">{t('product.restricted')} <Link to="/auth" className="text-white font-black underline underline-offset-8 decoration-gold-500">Authenticate</Link></p>
                                </div>
                            )}

                            {/* REVIEWS LIST */}
                            <div className="space-y-24 pb-20">
                                {reviews.length === 0 ? (
                                    <p className="text-[11px] tracking-widest text-white/20 text-center py-20 italic">No reviews yet. Be the first to share your experience.</p>
                                ) : (
                                    reviews.map((rev, i) => (
                                        <div key={rev.id} className={`${i > 0 ? 'border-t border-white/5 pt-20' : ''} relative group`}>
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center space-x-1.5 text-white">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            fill={i < rev.rating ? "white" : "none"}
                                                            stroke="white"
                                                            strokeWidth={1}
                                                            className={i < rev.rating ? "opacity-100" : "opacity-20"}
                                                        />
                                                    ))}
                                                </div>
                                                {(user && (Number(user.id) === Number(rev.user_id) || user.role === 'admin' || user.email === 'hit.goyani1010@gmail.com')) && (
                                                    <button
                                                        onClick={() => handleDeleteReview(rev.id)}
                                                        className="text-red-500/40 hover:text-red-500 transition-all text-[9px] uppercase tracking-widest"
                                                    >
                                                        Remove Review
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-white font-black text-sm tracking-[0.1em] mb-6 uppercase">{rev.title}</p>
                                            <p className="text-white/60 leading-relaxed text-sm max-w-2xl">{rev.comment}</p>

                                            {rev.image_urls && rev.image_urls.length > 0 && (
                                                <div className="flex flex-wrap gap-6 mt-10">
                                                    {rev.image_urls.map((url, idx) => (
                                                        <div key={idx} className="w-32 h-32 overflow-hidden border border-white/10 group/img cursor-zoom-in" onClick={() => window.open(url, '_blank')}>
                                                            <img src={url} alt={`Review ${idx}`} className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-1000" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-5 mt-10">
                                                <div className="w-6 h-6 border border-white/10 flex items-center justify-center text-[10px] text-white">
                                                    {rev.first_name?.[0]}
                                                </div>
                                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                                                    {rev.first_name} {rev.last_name} • <span className="text-gold-500/40">Verified Client</span>
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
            <div className="bg-black pt-10 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    {/* NEW: CINEMATIC STORY BANNER */}
                    {product.story_banner && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, filter: "grayscale(100%)" }}
                            whileInView={{ opacity: 1, y: 0, filter: "grayscale(0%)" }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            className="w-full aspect-video md:aspect-[21/9] mb-12 md:mb-16 overflow-hidden border border-white/5 p-2 bg-white/[0.02]"
                        >
                            {product.story_banner?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) ? (
                                <video
                                    src={product.story_banner}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={product.story_banner}
                                    className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[3000ms] ease-in-out"
                                    alt="Story Banner"
                                />
                            )}
                        </motion.div>
                    )}

                    <div className="mb-16 md:mb-24 border-y border-white/5 py-12 md:py-16">
                        <h3 className="text-[14px] tracking-[0.5em] text-white font-black uppercase text-center mb-10 md:mb-12 italic">Notes Story</h3>

                        <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-0 relative">
                            {/* Top Notes */}
                            <div className="flex flex-col items-center text-center px-4 md:px-8">
                                <h4 className="text-[11px] tracking-[0.4em] uppercase text-white/40 mb-10 md:mb-14 font-black">Top Notes</h4>
                                <div className="flex flex-wrap justify-center gap-8 mb-8">
                                    <div className="flex flex-col items-center space-y-6 group">
                                        <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-700">
                                            <img
                                                src={product.top_note_icon || "https://cdn-icons-png.flaticon.com/512/3503/3503792.png"}
                                                className={`w-full h-full rounded-full object-cover ${!product.top_note_icon ? 'invert opacity-40' : ''} group-hover:opacity-100 group-hover:scale-110 transition-all duration-700`}
                                                alt="Top Note"
                                            />
                                        </div>
                                        {product.top_note_label && product.top_note_label !== product.top_notes && (
                                            <p className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-white transition-all">
                                                {product.top_note_label}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[13px] tracking-widest text-white/80 italic font-serif leading-loose max-w-[250px]">{product.top_notes}</p>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block absolute left-1/3 top-0 bottom-0 w-px border-l border-dashed border-white/10" />

                            {/* Heart Notes */}
                            <div className="flex flex-col items-center text-center px-4 md:px-8">
                                <h4 className="text-[11px] tracking-[0.4em] uppercase text-white/40 mb-10 md:mb-14 font-black">Heart Notes</h4>
                                <div className="flex flex-wrap justify-center gap-8 mb-8">
                                    <div className="flex flex-col items-center space-y-6 group">
                                        <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-700">
                                            <img
                                                src={product.heart_note_icon || "https://cdn-icons-png.flaticon.com/512/2926/2926330.png"}
                                                className={`w-full h-full rounded-full object-cover ${!product.heart_note_icon ? 'invert opacity-40' : ''} group-hover:opacity-100 group-hover:scale-110 transition-all duration-700`}
                                                alt="Heart Note"
                                            />
                                        </div>
                                        {product.heart_note_label && product.heart_note_label !== product.heart_notes && (
                                            <p className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-white transition-all">
                                                {product.heart_note_label}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[13px] tracking-widest text-white/80 italic font-serif leading-loose max-w-[250px]">{product.heart_notes}</p>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block absolute left-2/3 top-0 bottom-0 w-px border-l border-dashed border-white/10" />

                            {/* Base Notes */}
                            <div className="flex flex-col items-center text-center px-4 md:px-8">
                                <h4 className="text-[11px] tracking-[0.4em] uppercase text-white/40 mb-10 md:mb-14 font-black">Base Notes</h4>
                                <div className="flex flex-wrap justify-center gap-8 mb-8">
                                    <div className="flex flex-col items-center space-y-6 group">
                                        <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-700">
                                            <img
                                                src={product.base_note_icon || "https://cdn-icons-png.flaticon.com/512/3503/3503792.png"}
                                                className={`w-full h-full rounded-full object-cover ${!product.base_note_icon ? 'invert opacity-40' : ''} group-hover:opacity-100 group-hover:scale-110 transition-all duration-700`}
                                                alt="Base Note"
                                            />
                                        </div>
                                        {product.base_note_label && product.base_note_label !== product.base_notes && (
                                            <p className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-white transition-all">
                                                {product.base_note_label}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[13px] tracking-widest text-white/80 italic font-serif leading-loose max-w-[250px]">{product.base_notes}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. THE MUSE / INSPIRATION SECTION (Arched Layout) */}
                    <div className="mb-12 md:mb-20 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 lg:gap-40 items-center">
                        <div className="order-2 md:order-1 lg:px-12">
                            <h3 className="text-xl md:text-2xl font-serif tracking-[0.2em] text-white mb-6 md:mb-8 leading-tight uppercase">
                                {product.name ? `The Fragrance Signature of ${product.name}` : 'The Fragrance Signature of KIKS'}
                            </h3>
                            <div className="w-16 h-px bg-gold-500 mb-6 md:mb-8" />
                            <p className="text-[13px] md:text-[15px] text-white/50 leading-relaxed tracking-wider font-light">
                                {product.muse_story || "Each creation is a study in captivating contrasts. Like a silent authority that rules with a serene, clarifying focus, yet possesses a soul that blossoms with the intoxicating warmth of a hidden garden. This fragrance is the essence of perfect equilibrium."}
                            </p>
                        </div>
                        <div className="order-1 md:order-2 flex justify-center md:justify-end">
                            <motion.div
                                initial={{ filter: "grayscale(100%)", scale: 1.05 }}
                                whileInView={{ filter: "grayscale(0%)", scale: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                                className="w-full max-w-[500px] aspect-[4/5] rounded-t-full overflow-hidden border border-white/5 p-3 bg-white/[0.02]"
                            >
                                {product.muse_image?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) ? (
                                    <video
                                        src={product.muse_image}
                                        className="w-full h-full object-cover rounded-t-full"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={product.muse_image || "https://images.unsplash.com/photo-1615485290382-441e4d019cb5?q=80&w=2000&auto=format&fit=crop"}
                                        className="w-full h-full object-cover rounded-t-full"
                                        alt="Muse"
                                    />
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* 3. ABOUT THE HOUSE SECTION */}
                    <div className="mb-16 md:mb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center bg-white/[0.02] p-6 md:p-12 border border-white/5 backdrop-blur-sm">
                        <div className="flex justify-center lg:justify-start">
                            <img
                                src="/logo-kiks.webp"
                                className="w-full max-w-[300px] md:max-w-[350px] h-auto object-contain opacity-40 hover:opacity-100 transition-opacity duration-1000"
                                alt="About House"
                            />
                        </div>
                        <div className="lg:px-8 text-center lg:text-left">
                            <h3 className="text-[14px] tracking-[0.4em] font-black uppercase text-white mb-6 md:mb-8">About KIKS</h3>
                            <p className="text-[12px] text-white/40 leading-loose tracking-widest font-medium">
                                Each fragrance is a crafted balance of strength and subtlety, tradition and individuality.
                                Made for those who seek depth in every note — and meaning in every moment.
                                Our premium process preserves the high quality of our scents, prepared to perfection.
                                We don't just create perfumes; we capture ephemeral moments and crystallize them into timeless olfactory diamonds.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
