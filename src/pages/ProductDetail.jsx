import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
import { logClientActivity } from '../utils/clientLogger';

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
                        <div className="pb-6 pt-4 px-0 md:px-2 text-black/70 text-[10px] md:text-[11px] tracking-[0.05em] leading-relaxed font-sans">
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
    const location = useLocation();
    const { activeCurrency, rates, symbols } = useSelector(state => state.currency);
    const [product, setProduct] = useState(null);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [existingReviewImages, setExistingReviewImages] = useState([]);
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
    const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);

    // Verified Review Eligibility
    const [canReview, setCanReview] = useState(false);
    const [reviewEligibilityReason, setReviewEligibilityReason] = useState(null); // 'purchase_required', 'already_reviewed'
    const [checkingEligibility, setCheckingEligibility] = useState(false);

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
                if (data && data.name) {
                    logClientActivity('Opened product details', data.name);
                }

                // Fetch Reviews
                if (data.id) {
                    const revRes = await fetch(`${API_URL}/api/reviews/product/${data.id}`);
                    const revData = await revRes.json();
                    setReviews(revData);

                    // Verified Review Eligibility
                    if (isAuthenticated) {
                        const eligRes = await fetch(`${API_URL}/api/reviews/check/${data.id}`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                        });
                        if (eligRes.ok) {
                            const eligData = await eligRes.json();
                            setCanReview(eligData.canReview);
                            setReviewEligibilityReason(eligData.reason);
                        }
                    }
                }

                // Fetch Suggested Products
                try {
                    const suggRes = await fetch(`${API_URL}/api/products`);
                    if (suggRes.ok) {
                        const allProducts = await suggRes.json();
                        const suggestions = Array.isArray(allProducts) ? allProducts.filter(p => p.id !== data.id && !p.is_deleted).slice(0, 3) : [];
                        setSuggestedProducts(suggestions);
                    }
                } catch (suggErr) {
                    console.error("Error fetching suggested products:", suggErr);
                }

                // Initialize Gallery & Variant selection from URL
                let initialVariantIdx = 0;
                const params = new URLSearchParams(window.location.search);
                const targetVariant = params.get('variant') || params.get('size');
                let targetOpt = null;

                if (targetVariant && data && data.variants) {
                    const searchStr = String(targetVariant).trim().toLowerCase();
                    let parsedVariants = [];
                    try {
                        parsedVariants = typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants;
                    } catch (e) {}
                    if (Array.isArray(parsedVariants)) {
                        const foundIdx = parsedVariants.findIndex(v => String(v.size || '').trim().toLowerCase() === searchStr);
                        if (foundIdx !== -1) {
                            initialVariantIdx = foundIdx + 1;
                            targetOpt = parsedVariants[foundIdx];
                        }
                    }
                }

                let baseImages = [];
                const mainImg = (targetOpt && targetOpt.image_url) ? targetOpt.image_url : data.image_url;
                if (mainImg) {
                    baseImages = [mainImg];
                    let gUrls = [];
                    const sourceGallery = (targetOpt && targetOpt.gallery_urls && targetOpt.gallery_urls.length > 0) ? targetOpt.gallery_urls : data.gallery_urls;
                    if (Array.isArray(sourceGallery)) {
                        gUrls = sourceGallery;
                    } else if (typeof sourceGallery === 'string' && sourceGallery.trim() !== '') {
                        try { gUrls = JSON.parse(sourceGallery); } catch(e) {}
                    }
                    if (Array.isArray(gUrls) && gUrls.length > 0) {
                        baseImages = [...baseImages, ...gUrls];
                    }
                }
                setImages(baseImages);
                setActiveImage(baseImages[0]);
                setSelectedVariantIndex(initialVariantIdx);
            } catch (error) {
                console.error("Error fetching product data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        window.scrollTo(0, 0);
    }, [slug, productSlug]);

    const formatNotes = (notes) => {
        if (!notes) return '';
        return notes.split(',')
            .map(note => note.trim())
            .filter(note => note.length > 0)
            .map(note => note.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
            )
            .join(', ');
    };

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
            setReviewMsg({ type: 'error', text: 'Please select a rating for your review.' });
            setSubmittingReview(false);
            return;
        }

        try {
            // 1. Upload Images if any
            let imageUrls = [...existingReviewImages];
            if (selectedImages.length > 0) {
                setUploadingImages(true);
                for (const file of selectedImages) {
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('folder', 'kiks_reviews');
                    const uploadRes = await fetch(`${API_URL}/api/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
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
            const endpoint = editingReviewId ? `${API_URL}/api/reviews/${editingReviewId}` : `${API_URL}/api/reviews`;
            const method = editingReviewId ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ product_id: product.id, ...reviewForm, image_urls: imageUrls })
            });
            const data = await res.json();
            if (res.ok) {
                setReviewMsg({ type: 'success', text: editingReviewId ? 'Review updated successfully.' : 'Review submitted successfully.' });
                setReviewForm({ rating: 0, title: '', comment: '' });
                setSelectedImages([]);
                setExistingReviewImages([]);
                setEditingReviewId(null);
                // Re-fetch reviews
                const revRes = await fetch(`${API_URL}/api/reviews/product/${product.id}`);
                setReviews(await revRes.json());
                // Immediately update eligibility to prevent duplicate review submission on frontend
                setCanReview(false);
                setReviewEligibilityReason('already_reviewed');
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

    const handleStartEdit = (rev) => {
        setEditingReviewId(rev.id);
        setReviewForm({
            rating: rev.rating || 5,
            title: rev.title || '',
            comment: rev.comment || ''
        });
        const prevImgs = rev.image_urls ? (Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)) : [];
        setExistingReviewImages(prevImgs);
        setSelectedImages([]);
        setCanReview(true);
        setIsReviewsOpen(true);
        setReviewMsg({ type: '', text: '' });
        setTimeout(() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleCancelEdit = async () => {
        setEditingReviewId(null);
        setReviewForm({ rating: 0, title: '', comment: '' });
        setSelectedImages([]);
        setExistingReviewImages([]);
        setReviewMsg({ type: '', text: '' });
        if (product && product.id && isAuthenticated) {
            const eligRes = await fetch(`${API_URL}/api/reviews/check/${product.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            if (eligRes.ok) {
                const eligData = await eligRes.json();
                setCanReview(eligData.canReview);
                setReviewEligibilityReason(eligData.reason);
            }
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            const res = await fetch(`${API_URL}/api/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });

            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== id));
                if (editingReviewId === id) handleCancelEdit();
                setReviewMsg({ type: 'success', text: 'Review deleted successfully.' });
                setTimeout(() => setReviewMsg({ type: '', text: '' }), 3000);
                // Refresh eligibility so user can review again after removing their review
                if (product && product.id && isAuthenticated) {
                    const eligRes = await fetch(`${API_URL}/api/reviews/check/${product.id}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                    });
                    if (eligRes.ok) {
                        const eligData = await eligRes.json();
                        setCanReview(eligData.canReview);
                        setReviewEligibilityReason(eligData.reason);
                    }
                }
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

    const allSizeOptions = useMemo(() => {
        if (!product) return [];
        let parsedVariants = [];
        try {
            if (Array.isArray(product.variants)) {
                parsedVariants = product.variants;
            } else if (typeof product.variants === 'string' && product.variants.trim() !== '') {
                const parsed = JSON.parse(product.variants);
                if (Array.isArray(parsed)) parsedVariants = parsed;
            }
        } catch (e) {
            console.warn('Could not parse variants:', e);
        }

        const safeGallery = (urls) => {
            if (Array.isArray(urls)) return urls;
            if (typeof urls === 'string' && urls.trim() !== '') {
                try {
                    const res = JSON.parse(urls);
                    return Array.isArray(res) ? res : [];
                } catch (e) { return []; }
            }
            return [];
        };

        return [
            {
                isBase: true,
                index: 0,
                name: product.size || '100 ML',
                price: product.price || '',
                sale_price: product.sale_price || '',
                stock: product.stock_count !== undefined ? parseInt(product.stock_count || 0) : 50,
                image_url: product.image_url,
                gallery_urls: safeGallery(product.gallery_urls)
            },
            ...parsedVariants.map((v, idx) => ({
                isBase: false,
                index: idx + 1,
                name: v.size || `Variant ${idx + 1}`,
                price: v.price || product.price || '',
                sale_price: v.sale_price || '',
                stock: v.stock !== undefined ? parseInt(v.stock || 0) : 50,
                image_url: v.image_url || product.image_url,
                gallery_urls: (safeGallery(v.gallery_urls).length > 0) ? safeGallery(v.gallery_urls) : safeGallery(product.gallery_urls)
            }))
        ];
    }, [product]);

    const currentOption = allSizeOptions[selectedVariantIndex] || allSizeOptions[0] || {};
    const displayPrice = (currentOption.price !== undefined && currentOption.price !== '') ? currentOption.price : (product?.price || '');
    const displaySalePrice = (currentOption.sale_price !== undefined && currentOption.sale_price !== '') 
        ? currentOption.sale_price 
        : (currentOption.isBase ? (product?.sale_price || '') : '');
    const isStockAvailable = (currentOption.stock !== undefined ? currentOption.stock : (product ? product.stock_count : 0)) > 0;

    const getDiscountPercentage = (sale, reg) => {
        try {
            if (!sale || !reg) return 0;
            const s = parseFloat(sale.toString().replace(/[^0-9.]/g, ''));
            const r = parseFloat(reg.toString().replace(/[^0-9.]/g, ''));
            if (isNaN(s) || isNaN(r) || r === 0) return 0;
            return Math.round((1 - (s / r)) * 100);
        } catch (e) {
            return 0;
        }
    };

    const handleVariantSelect = (index) => {
        setSelectedVariantIndex(index);
        const opt = allSizeOptions[index];
        if (opt && product) {
            let newImages = [];
            const baseImg = opt.image_url || product.image_url;
            if (baseImg) {
                newImages = [baseImg];
                const gUrls = Array.isArray(opt.gallery_urls) ? opt.gallery_urls : [];
                if (gUrls && gUrls.length > 0) {
                    newImages = [...newImages, ...gUrls];
                }
            }
            if (newImages.length > 0) {
                setImages(newImages);
                setActiveImage(newImages[0]);
            }
            try {
                const newUrl = opt.name ? `${window.location.pathname}?variant=${encodeURIComponent(opt.name)}` : window.location.pathname;
                window.history.replaceState(null, '', newUrl);
            } catch (e) {}
        }
    };

    useEffect(() => {
        if (allSizeOptions.length > 0 && !loading) {
            const params = new URLSearchParams(location.search);
            const targetVariant = params.get('variant') || params.get('size');
            if (targetVariant !== null && targetVariant !== '') {
                const searchStr = String(targetVariant).trim().toLowerCase();
                let targetIndex = allSizeOptions.findIndex(opt => String(opt.name || '').trim().toLowerCase() === searchStr);
                if (targetIndex === -1 && /^\d+$/.test(targetVariant)) {
                    const parsedIdx = parseInt(targetVariant, 10);
                    if (allSizeOptions[parsedIdx]) targetIndex = parsedIdx;
                }
                if (targetIndex >= 0 && targetIndex !== selectedVariantIndex) {
                    setSelectedVariantIndex(targetIndex);
                    const opt = allSizeOptions[targetIndex];
                    if (opt && product) {
                        let newImages = [];
                        const baseImg = opt.image_url || product.image_url;
                        if (baseImg) {
                            newImages = [baseImg];
                            const gUrls = Array.isArray(opt.gallery_urls) ? opt.gallery_urls : [];
                            if (gUrls && gUrls.length > 0) {
                                newImages = [...newImages, ...gUrls];
                            }
                        }
                        if (newImages.length > 0) {
                            setImages(newImages);
                            setActiveImage(newImages[0]);
                        }
                    }
                }
            }
        }
    }, [allSizeOptions, location.search, loading, product]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('cart'));
            return;
        }
        if (product) {
            setIsAdding(true);

            // Reduced delay for "Snappy" premium feel
            await new Promise(resolve => setTimeout(resolve, 300));

            const itemToCart = {
                ...product,
                id: currentOption.isBase ? product.id : `${product.id}-${currentOption.index}`,
                productId: product.id,
                slug: product.slug || String(product.name).toLowerCase().replace(/\s+/g, '-'),
                name: currentOption.isBase ? product.name : `${product.name} (${currentOption.name})`,
                price: displayPrice,
                sale_price: displaySalePrice,
                image_url: currentOption.image_url || product.image_url,
                size: currentOption.name || product.size || '100 ML',
                volume: currentOption.name || product.size || '100 ML',
                isVariant: !currentOption.isBase,
                variantIndex: currentOption.index,
                variantName: currentOption.name,
                quantity
            };

            dispatch(addToCart(itemToCart));
            setIsAdding(false);
            setIsAdded(true);

            const newTotal = totalItems + quantity;
            showNotification(`${itemToCart.name} added to bag. (Total: ${newTotal})`);

            setTimeout(() => setIsAdded(false), 2000);
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            dispatch(openWishlistAuthPopup('buy'));
            return;
        }
        if (product) {
            const itemToBuy = {
                ...product,
                id: currentOption.isBase ? product.id : `${product.id}-${currentOption.index}`,
                productId: product.id,
                slug: product.slug || String(product.name).toLowerCase().replace(/\s+/g, '-'),
                name: currentOption.isBase ? product.name : `${product.name} (${currentOption.name})`,
                price: displayPrice,
                sale_price: displaySalePrice,
                image_url: currentOption.image_url || product.image_url,
                size: currentOption.name || product.size || '100 ML',
                volume: currentOption.name || product.size || '100 ML',
                isVariant: !currentOption.isBase,
                variantIndex: currentOption.index,
                variantName: currentOption.name,
                quantity: 1
            };

            navigate('/checkout', {
                state: {
                    directItem: itemToBuy
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
                    customer_name: clientName,
                    variant_size: currentOption?.name || null
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
            setNotifyStatus({ type: 'error', msg: 'Database connection failed. Please ensure the server is active.' });
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

    const activeVariantId = currentOption.isBase ? product.id : `${product.id}-${currentOption.index}`;
    const isProductInWishlist = wishlistItems.some(i => String(i.id) === String(activeVariantId));

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
                "itemCondition": "https://schema.org/NewCondition",
                "hasMerchantReturnPolicy": {
                    "@type": "MerchantReturnPolicy",
                    "applicableCountry": "IN",
                    "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
                },
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": 0,
                        "currency": activeCurrency || "INR"
                    },
                    "shippingDestination": {
                        "@type": "DefinedRegion",
                        "addressCountry": "IN"
                    }
                }
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
        <div className="bg-white min-h-screen text-black pt-20 md:pt-36 pb-12 md:pb-32 px-6 lg:px-20 font-sans selection:bg-black/10 selection:text-black">
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
                className="inline-flex items-center space-x-3 mb-6 md:mb-12 text-[10px] tracking-[0.3em] font-bold uppercase text-black/40 hover:text-black transition-colors"
            >
                <ArrowLeft size={14} /> <span>{t('product.back_to')} {product.collection_name || 'Previous'}</span>
            </button>

            <div className="container mx-auto flex flex-col lg:flex-row justify-center gap-10 md:gap-16 lg:gap-24 items-start max-w-5xl">

                {/* Product Image Gallery */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end lg:pr-10">

                    {/* Main Image with Swipe Support - 60 FPS Native Touch Optimized */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{
                            touchAction: 'pan-y',
                            transform: 'translateZ(0)',
                            willChange: 'transform',
                            WebkitTapHighlightColor: 'transparent',
                        }}
                        className="relative w-full max-w-[360px] lg:sticky lg:top-40 aspect-[3/4] overflow-hidden bg-[#f9f9f9] border border-black/5 shadow-2xl group cursor-grab active:cursor-grabbing"
                    >
                        {displaySalePrice && (
                            <div className="absolute top-4 left-4 bg-black text-white text-[10px] md:text-[11px] font-bold px-3 py-1.5 tracking-widest uppercase z-20 shadow-md pointer-events-none">
                                -{getDiscountPercentage(displaySalePrice, displayPrice)}%
                            </div>
                        )}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isAuthenticated) {
                                    dispatch(openWishlistAuthPopup('wishlist'));
                                } else {
                                    const variantId = currentOption.isBase ? product.id : `${product.id}-${currentOption.index}`;
                                    const itemForWishlist = {
                                        ...product,
                                        id: variantId,
                                        productId: product.id,
                                        slug: product.slug || String(product.name).toLowerCase().replace(/\s+/g, '-'),
                                        name: currentOption.isBase ? product.name : `${product.name} (${currentOption.name})`,
                                        price: displayPrice,
                                        sale_price: displaySalePrice,
                                        image_url: currentOption.image_url || product.image_url,
                                        size: currentOption.name || product.size || '100 ML',
                                        volume: currentOption.name || product.size || '100 ML',
                                        isVariant: !currentOption.isBase,
                                        variantIndex: currentOption.index,
                                        variantName: currentOption.name
                                    };
                                    const isInWishlist = wishlistItems.some(i => String(i.id) === String(variantId));
                                    dispatch(toggleWishlistAndSync(itemForWishlist));
                                    showNotification(isInWishlist ? `Removed from wishlist.` : `${itemForWishlist.name} added to wishlist.`);
                                }
                            }}
                            className={`absolute top-4 right-4 z-20 p-2 sm:p-2.5 rounded-full backdrop-blur-md shadow-md transition-all transform hover:scale-110 ${isProductInWishlist ? 'bg-black text-white border border-black/10' : 'bg-white/85 text-black border border-black/10 hover:bg-black hover:text-white'}`}
                        >
                            <Heart size={16} fill={isProductInWishlist ? "currentColor" : "none"} />
                        </button>
                        <AnimatePresence initial={false}>
                            <motion.div
                                key={activeImage}
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                style={{
                                    willChange: 'transform, opacity',
                                    transform: 'translate3d(0, 0, 0)',
                                    backfaceVisibility: 'hidden',
                                    contain: 'paint layout',
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.15}
                                dragMomentum={false}
                                onDragEnd={(e, { offset }) => {
                                    const swipeThreshold = 35;
                                    if (offset.x < -swipeThreshold) {
                                        const currentIndex = images.indexOf(activeImage);
                                        const nextIndex = (currentIndex + 1) % images.length;
                                        setActiveImage(images[nextIndex]);
                                    } else if (offset.x > swipeThreshold) {
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
                                        decoding="async"
                                        loading="eager"
                                        fetchPriority="high"
                                        style={{ contain: 'paint', transform: 'translateZ(0)' }}
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
                    <div
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            touchAction: 'pan-x pan-y',
                            transform: 'translateZ(0)',
                        }}
                        className="flex mt-6 space-x-4 overflow-x-auto hide-scrollbar w-full max-w-[360px] lg:sticky lg:top-[calc(10rem+480px)]"
                    >
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                style={{ transform: 'translateZ(0)', contain: 'paint' }}
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
                                    <img
                                        src={getFullImageUrl(img)}
                                        alt={`Gallery ${idx}`}
                                        decoding="async"
                                        loading="eager"
                                        style={{ contain: 'paint' }}
                                        className="w-full h-full object-cover"
                                    />
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




                        </div>

                        {/* Price & Wishlist Row */}
                        <div className="flex items-center justify-between mb-4 md:mb-8">
                            <div className="flex flex-col">
                                {displaySalePrice ? (
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <p className="text-[11px] md:text-xs text-black/40 line-through tracking-[0.1em]">
                                                {formatCurrency(displayPrice, activeCurrency, rates, symbols)}
                                            </p>
                                        </div>
                                        <div className="flex items-baseline space-x-2">
                                            <p className="text-2xl md:text-4xl font-bold text-black tracking-[0.1em]">
                                                {formatCurrency(displaySalePrice, activeCurrency, rates, symbols)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xl md:text-2xl font-bold text-black tracking-[0.1em]">
                                        {formatCurrency(displayPrice, activeCurrency, rates, symbols)}*
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-3 md:space-x-5">
                                <span className="bg-black px-2 py-0.5 text-white text-[9px] font-black tracking-[0.1em] uppercase">New</span>
                            </div>
                        </div>

                        <div className="h-[1px] bg-black/5 w-full mb-4 md:mb-8" />

                        {/* Dynamic Size & Variant Selector */}
                        <div className="mb-6 md:mb-8">
                            <div className="flex flex-wrap gap-3">
                                {allSizeOptions.map((opt, idx) => {
                                    const isSelected = selectedVariantIndex === idx;
                                    const outOfStock = opt.stock <= 0;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleVariantSelect(idx)}
                                            className={`py-3 px-7 text-center transition-all duration-300 flex flex-col items-center justify-center bg-white ${isSelected ? 'border border-black text-black font-black' : 'border border-black/15 text-black/50 font-medium hover:border-black/50 hover:text-black'} ${outOfStock && !isSelected ? 'opacity-45 bg-neutral-50' : ''}`}
                                        >
                                            <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase">{opt.name}</span>
                                            {outOfStock && (
                                                <span className="text-[8px] text-red-500 font-black uppercase tracking-widest mt-1">(Sold Out)</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions Section */}
                    {isStockAvailable ? (
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
                                    Customer reviews
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
                            <div className="bg-black/[0.02] border border-black/5 p-6 md:p-8">
                                <span className="text-[11px] tracking-[0.4em] font-black text-black uppercase block mb-4">Coming Soon</span>
                                <p className="text-[11px] text-black/40 tracking-widest leading-loose mb-6 italic">This fragrance is currently being prepared. Join the waitlist to be notified when it's available.</p>
                                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
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
            <div className="container mx-auto mt-8 md:mt-32 max-w-4xl px-3.5 sm:px-6 mb-8 md:mb-20">
                <h2 className="text-center text-[11px] md:text-sm font-black tracking-[0.4em] md:tracking-[0.6em] uppercase mb-6 md:mb-16 text-black opacity-80">PRODUCT DESCRIPTION</h2>

                {/* THE MUSE / INSPIRATION SECTION (Arched Layout) */}
                <div className="mb-8 md:mb-12 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 lg:gap-40 items-center">
                    <div className="order-2 md:order-1 lg:px-12 px-4 text-center md:text-left flex flex-col justify-center">
                        <h3 className="text-lg md:text-2xl font-serif tracking-[0.2em] text-black mb-4 md:mb-8 leading-tight uppercase">
                            {product.name ? `The Fragrance Signature of ${product.name}` : 'The Fragrance Signature of KIKS'}
                        </h3>
                        <p className="text-[12px] md:text-[15px] text-black/50 leading-relaxed tracking-wider font-light text-justify md:text-justify">
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

                <div ref={descriptionRef}>
                    <ProductAccordion
                        title={t('product.description')}
                        isOpen={isDescriptionOpen}
                        onToggle={setIsDescriptionOpen}
                    >
                        {/* Visual Olfactory Notes Story - Displayed first inside Description Tab */}
                        <div className="mb-12 pb-10 border-b border-black/5">
                            <div className="flex flex-col space-y-8 md:space-y-16">
                                {[
                                    { title: 'Top Notes', data: product.top_notes_icons, fallback: "https://cdn-icons-png.flaticon.com/512/3503/3503792.png", text: product.top_note_label },
                                    { title: 'Heart Notes', data: product.heart_notes_icons, fallback: "https://cdn-icons-png.flaticon.com/512/2926/2926330.png", text: product.heart_note_label },
                                    { title: 'Base Notes', data: product.base_notes_icons, fallback: "https://cdn-icons-png.flaticon.com/512/3503/3503792.png", text: product.base_note_label }
                                ].map((layer, lIdx) => {
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
                                            <h4 className="text-[12px] md:text-[14px] tracking-[0.3em] uppercase text-black mb-4 md:mb-8 font-black">{layer.title}</h4>

                                            <div
                                                className="flex flex-row flex-wrap justify-center items-start gap-x-2 sm:gap-x-6 md:gap-x-10 gap-y-6 md:gap-y-10 mb-6 md:mb-8 max-w-3xl mx-auto w-full px-1"
                                                style={{ transform: 'translateZ(0)' }}
                                            >
                                                {notes && notes.length > 0 ? notes.map((note, nIdx) => (
                                                    <div key={nIdx} style={{ transform: 'translateZ(0)' }} className="flex flex-col items-center group flex-shrink-0 w-[calc(33.33%-8px)] max-w-[85px] md:max-w-none md:w-24">
                                                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white border border-black/5 flex items-center justify-center mb-2.5 md:mb-4 transition-all duration-700 hover:shadow-xl hover:scale-110 overflow-hidden shadow-sm">
                                                            <img
                                                                src={getFullImageUrl(note.url) || layer.fallback}
                                                                decoding="async"
                                                                loading="lazy"
                                                                style={{ contain: 'paint' }}
                                                                className="w-full h-full object-cover transition-transform duration-700"
                                                                alt={note.name || "Scent Note"}
                                                            />
                                                        </div>
                                                        <p className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase text-black/70 font-black leading-tight text-center px-1">
                                                            {note.name || "Layer Note"}
                                                        </p>
                                                    </div>
                                                )) : (
                                                    <div className="flex flex-col items-center group col-span-3">
                                                        <div className="w-14 h-14 md:w-18 md:h-18 rounded-full bg-black/[0.03] border border-black/10 flex items-center justify-center mb-4">
                                                            <img src={layer.fallback} className="w-7 h-7 md:w-9 md:h-9 object-contain opacity-20" alt="Olfactory Fallback" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {layer.text && (
                                                <p className="text-[11px] md:text-[13px] tracking-widest text-black/80 italic font-serif leading-relaxed max-w-2xl border-t border-black/5 pt-4 md:pt-6">{layer.text}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Product Description - Starts directly after Notes Story finishes */}
                        <p className="whitespace-pre-wrap text-[12px] md:text-[15px] text-black/50 leading-relaxed tracking-wider font-light text-justify md:text-justify">{product.description}</p>
                    </ProductAccordion>
                </div>

                <ProductAccordion
                    title="ADDITIONAL INFORMATION"
                    isOpen={isAdditionalOpen}
                    onToggle={setIsAdditionalOpen}
                >
                    {product.additional_info && (
                        <p className="whitespace-pre-wrap text-[12px] md:text-[15px] text-black/50 leading-relaxed tracking-wider font-light text-justify md:text-justify">
                            {product.additional_info}
                        </p>
                    )}
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
                            {/* REVIEW SUBMISSION FORM - SECURED BY VERIFIED PURCHASE PROTOCOL */}
                            {isAuthenticated ? (
                                canReview ? (
                                    <div className="mb-14 bg-black/[0.02] p-4 sm:p-6 md:p-10 border border-black/5 w-full">
                                        <div className="flex items-center justify-between mb-8 md:mb-10">
                                            <h4 className="text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.4em] font-black uppercase text-black">{editingReviewId ? 'Edit your review' : 'Share your review'}</h4>
                                            {editingReviewId && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="text-[9px] md:text-[10px] tracking-widest uppercase text-red-500 font-bold underline hover:text-red-700"
                                                >
                                                    Cancel Edit
                                                </button>
                                            )}
                                        </div>
                                        <form onSubmit={handleAddReview} className="space-y-6 md:space-y-8">
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6">
                                                <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-black/50 font-bold">{t('product.rating')}</p>
                                                <div className="flex space-x-3">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                            className={`transition-all duration-300 p-1 ${star <= reviewForm.rating ? 'text-black' : 'text-black/20 hover:text-black/40'}`}
                                                        >
                                                            <Star
                                                                className="w-5 h-5 md:w-5 md:h-5"
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
                                                className="w-full bg-transparent border border-black/10 p-4 sm:p-5 text-xs tracking-widest leading-relaxed focus:border-black outline-none h-32 transition-colors text-black"
                                                value={reviewForm.comment}
                                                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            />

                                            {/* Image Upload */}
                                            <div className="space-y-4 md:space-y-8">
                                                <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-black/40">Visual Verification</p>
                                                <div className="flex flex-wrap gap-3 md:gap-6">
                                                    {existingReviewImages.map((url, idx) => (
                                                        <div key={`existing-${idx}`} className="relative w-20 h-20 sm:w-24 sm:h-24 border border-black/10 p-1 bg-white">
                                                            <img src={getFullImageUrl(url)} alt="preview" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setExistingReviewImages(existingReviewImages.filter((_, i) => i !== idx))}
                                                                className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-xl hover:bg-red-600 transition-colors"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {selectedImages.map((file, idx) => (
                                                        <div key={`new-${idx}`} className="relative w-20 h-20 sm:w-24 sm:h-24 border border-black/10 p-1 bg-white">
                                                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                                                                className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-xl hover:bg-red-600 transition-colors"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label className="w-20 h-20 sm:w-24 sm:h-24 border border-black/10 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-all bg-white/50">
                                                        <Camera size={22} className="text-black/30" strokeWidth={1.5} />
                                                        <span className="text-[8px] uppercase tracking-widest text-black/40 mt-1 font-bold">Add Photo</span>
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

                                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={submittingReview || uploadingImages}
                                                    className="w-full h-14 bg-black text-white text-[11px] font-black tracking-[0.3em] sm:tracking-[0.5em] uppercase hover:bg-black/90 transition-all"
                                                >
                                                    {submittingReview ? 'SAVING...' : uploadingImages ? 'UPLOADING...' : (editingReviewId ? 'UPDATE REVIEW' : 'SUBMIT REVIEW')}
                                                </button>
                                                {editingReviewId && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        className="w-full sm:w-48 h-14 bg-black/10 text-black text-[11px] font-black tracking-[0.2em] uppercase hover:bg-black/20 transition-all"
                                                    >
                                                        CANCEL
                                                    </button>
                                                )}
                                            </div>
                                            <AnimatePresence>
                                                {reviewMsg.text && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className={`mt-4 p-4 text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-center border ${reviewMsg.type === 'success'
                                                            ? 'border-green-500/30 bg-green-500/5 text-green-700 font-bold'
                                                            : 'border-red-500/30 bg-red-500/5 text-red-600 font-bold'
                                                            }`}
                                                    >
                                                        {reviewMsg.text}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="mb-14 p-6 sm:p-10 text-center border border-black/10 bg-black/[0.02] w-full">
                                        <p className="text-[10px] md:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-black uppercase font-black mb-3">
                                            {reviewEligibilityReason === 'already_reviewed' ? 'REVIEW SUBMITTED' : 'PURCHASE REQUIRED'}
                                        </p>
                                        <p className="text-[9px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-black/50 uppercase leading-relaxed max-w-md mx-auto">
                                            {reviewEligibilityReason === 'already_reviewed'
                                                ? 'You have already submitted a review for this creation. You can edit or remove your review in the list below.'
                                                : 'Reviews are reserved exclusively for patrons who have purchased and received this creation.'}
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div className="mb-14 p-6 sm:p-10 text-center border border-black/10 bg-black/[0.02] w-full">
                                    <p className="text-[10px] md:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-black uppercase font-black mb-3">
                                        Purchase Required
                                    </p>
                                    <p className="text-[9px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-black/50 uppercase leading-relaxed max-w-md mx-auto mb-6">
                                        Reviews are reserved exclusively for patrons who have purchased and received this creation from our store.
                                    </p>
                                    <Link
                                        to="/login"
                                        className="inline-block text-[9px] md:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] text-black font-black border-b border-black/30 pb-1 hover:text-black/60 hover:border-black/60 transition-all uppercase"
                                    >
                                        Login to leave a review
                                    </Link>
                                </div>
                            )}

                            {/* REVIEWS LIST */}
                            <div className="space-y-16 sm:space-y-24 pb-12 sm:pb-20">
                                {reviews.length === 0 ? (
                                    <p className="text-[11px] tracking-widest text-black/30 text-center py-12 sm:py-20 italic font-serif">No reviews yet. Be the first to share your experience with this creation.</p>
                                ) : (
                                    reviews.map((rev, i) => (
                                        <div key={rev.id} className={`${i > 0 ? 'border-t border-black/5 pt-12 sm:pt-20' : ''} relative group`}>
                                            <div className="flex flex-wrap items-center justify-between gap-y-3 mb-6 sm:mb-8">
                                                <div className="flex items-center space-x-1.5 text-black">
                                                    {[...Array(5)].map((_, idx) => (
                                                        <Star
                                                            key={idx}
                                                            size={14}
                                                            fill={idx < rev.rating ? "black" : "none"}
                                                            stroke="black"
                                                            strokeWidth={1.5}
                                                            className={idx < rev.rating ? "opacity-100" : "opacity-20"}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center space-x-4 sm:space-x-6">
                                                    {(user && Number(user.id) === Number(rev.user_id)) && (
                                                        <button
                                                            onClick={() => handleStartEdit(rev)}
                                                            className="text-blue-600/80 hover:text-blue-600 transition-all text-[10px] sm:text-[11px] font-bold font-sans uppercase tracking-[0.15em] underline underline-offset-4"
                                                        >
                                                            Edit Review
                                                        </button>
                                                    )}
                                                    {(user && (Number(user.id) === Number(rev.user_id) || user.email === 'kiksultraluxury@gmail.com' || user.email === 'hit.goyani1010@gmail.com')) && (
                                                        <button
                                                            onClick={() => handleDeleteReview(rev.id)}
                                                            className="text-red-500 hover:text-red-600 transition-all text-[10px] sm:text-[11px] font-bold font-sans uppercase tracking-[0.15em] underline underline-offset-4"
                                                        >
                                                            Remove Review
                                                        </button>
                                                    )}
                                                </div>
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
                                                <div className="w-6 h-6 border border-black/20 bg-black/5 flex items-center justify-center text-[10px] text-black font-bold">
                                                    {rev.first_name?.[0]}
                                                </div>
                                                <p className="text-[10px] text-black/70 font-bold uppercase tracking-[0.2em]">
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
            <div className="bg-white pt-10 pb-2 md:pb-12 px-6">
                <div className="container mx-auto max-w-6xl">


                    {/* 2. RECOMMENDED PRODUCT SUGGESTIONS (Frameless Minimalist Luxury) */}
                    {suggestedProducts.length > 0 && (
                        <>
                            {/* MOBILE & TABLET: Smooth Frameless Horizontal Slider */}
                            <div className="block md:hidden mb-14 border-b border-black/5 pb-12 w-full">
                                <h3 className="text-center text-[11px] sm:text-[12px] font-black tracking-[0.4em] uppercase mb-8 text-black opacity-80">
                                    YOU MAY ALSO LIKE
                                </h3>
                                <div 
                                    className={`flex items-stretch gap-5 pb-2 hide-scrollbar w-full select-none transform-gpu ${
                                        suggestedProducts.length === 1 ? 'justify-center' : 'overflow-x-auto justify-start sm:justify-center'
                                    }`}
                                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y', transform: 'translateZ(0)' }}
                                    data-lenis-prevent-touch="true"
                                >
                                    {suggestedProducts.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className={`${
                                                suggestedProducts.length === 1 ? 'w-[250px] sm:w-[280px] max-w-full mx-auto' : 'w-[200px] sm:w-[240px]'
                                            } flex-shrink-0 flex flex-col group text-center`}
                                        >
                                            <Link 
                                                to={`/product/${item.slug || item.id}`} 
                                                className="block relative aspect-[4/5] bg-[#f9f9f9] overflow-hidden mb-4 flex items-center justify-center p-5 rounded-none"
                                                draggable={false}
                                            >
                                                <img
                                                    src={getFullImageUrl(item.image_url)}
                                                    alt={item.name}
                                                    draggable={false}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none transform transition-transform duration-700 group-hover:scale-105"
                                                />
                                                {item.sale_price && (
                                                    <div className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold px-2 py-1 tracking-widest uppercase z-10 shadow-sm pointer-events-none">
                                                        -{Math.round(((Number(item.price) - Number(item.sale_price)) / Number(item.price)) * 100)}%
                                                    </div>
                                                )}
                                            </Link>
                                            <Link to={`/product/${item.slug || item.id}`}>
                                                <h4 className="text-[13px] sm:text-[14px] font-serif tracking-[0.18em] uppercase text-black mb-1.5 line-clamp-1 group-hover:opacity-60 transition-opacity">
                                                    {item.name}
                                                </h4>
                                            </Link>
                                            <span className="text-[12px] font-normal tracking-[0.15em] text-black/70">
                                                {formatCurrency(item.sale_price || item.price, activeCurrency, rates, symbols)}
                                            </span>
                                            {(() => {
                                                let parsedVariants = [];
                                                try {
                                                    if (item.variants) {
                                                        parsedVariants = typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants;
                                                    }
                                                } catch(e){}
                                                if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
                                                    const sizes = [item.size || '100ML', ...parsedVariants.map(v => v.size)].filter(Boolean);
                                                    return (
                                                        <span className="text-[9px] mt-1.5 uppercase font-medium tracking-[0.2em] text-black/40">
                                                            {sizes.join(' | ')}
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* DESKTOP: Minimalist 3-Column Studio Grid */}
                            <div className="hidden md:block mb-8 md:mb-12 border-b border-black/5 pb-10">
                                <h3 className="text-center text-[13px] font-black tracking-[0.5em] uppercase mb-14 text-black opacity-80">
                                    YOU MAY ALSO LIKE
                                </h3>
                                <div className="flex flex-wrap items-stretch justify-center gap-10 md:gap-12 lg:gap-16 max-w-5xl mx-auto">
                                    {suggestedProducts.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="w-full md:w-[280px] lg:w-[310px] flex flex-col group text-center"
                                        >
                                            <Link 
                                                to={`/product/${item.slug || item.id}`} 
                                                className="block relative aspect-[4/5] bg-[#f9f9f9] overflow-hidden mb-6 flex items-center justify-center p-8 transition-colors duration-500 hover:bg-[#f2f2f2]"
                                            >
                                                <img
                                                    src={getFullImageUrl(item.image_url)}
                                                    alt={item.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-contain filter drop-shadow-md transform transition-transform duration-700 group-hover:scale-105"
                                                />
                                                {item.sale_price && (
                                                    <div className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold px-2 py-1 tracking-widest uppercase z-10 shadow-sm pointer-events-none">
                                                        -{Math.round(((Number(item.price) - Number(item.sale_price)) / Number(item.price)) * 100)}%
                                                    </div>
                                                )}
                                            </Link>
                                            <Link to={`/product/${item.slug || item.id}`}>
                                                <h4 className="text-[15px] lg:text-[16px] font-serif tracking-[0.2em] uppercase text-black font-normal mb-2 group-hover:opacity-60 transition-opacity line-clamp-1">
                                                    {item.name}
                                                </h4>
                                            </Link>
                                            <span className="text-[13px] font-normal tracking-[0.15em] text-black/70">
                                                {formatCurrency(item.sale_price || item.price, activeCurrency, rates, symbols)}
                                            </span>
                                            {(() => {
                                                let parsedVariants = [];
                                                try {
                                                    if (item.variants) {
                                                        parsedVariants = typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants;
                                                    }
                                                } catch(e){}
                                                if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
                                                    const sizes = [item.size || '100ML', ...parsedVariants.map(v => v.size)].filter(Boolean);
                                                    return (
                                                        <span className="text-[10px] mt-2 uppercase font-medium tracking-[0.2em] text-black/40">
                                                            {sizes.join(' | ')}
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* 3. ABOUT THE HOUSE SECTION */}
                    <div className="mb-4 md:mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center bg-white p-6 md:p-12 border border-black/5">
                        <div className="flex justify-center lg:justify-start">
                            <img
                                src="/logo-kiks.png"
                                loading="lazy"
                                decoding="async"
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
                                    loading="lazy"
                                    decoding="async"
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
                                    <h3 className="text-base sm:text-lg font-serif text-black mb-2 sm:mb-3 tracking-wide uppercase italic">
                                        {selectedReviewImage.review.title}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-black/70 leading-relaxed font-sans tracking-wide">
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
