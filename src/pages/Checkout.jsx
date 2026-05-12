import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    CreditCard,
    Truck,
    ShieldCheck,
    ChevronRight,
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Lock,
    CheckCircle,
    Loader,
    Package,
    Gift,
    Ticket,
    X,
    Smartphone,
    Banknote,
    QrCode,
    ChevronLeft,
    ArrowRight,
    Info,
    AlertCircle
} from 'lucide-react';
import { getFullImageUrl } from '../utils/url';
import { clearCart, setCart } from '../store/cartSlice';
import { formatCurrency } from '../utils/currency';
import ActionLoader from '../components/ActionLoader';
import { trackPurchase } from '../utils/analytics';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Support Direct Buy (Buy Now) from Product Page
    const directItem = location.state?.directItem;
    const { items: cartItems = [], total: cartTotal = 0 } = useSelector(state => state.cart || {});
    const items = directItem ? [directItem] : cartItems;
    
    const { user = null, isAuthenticated = false, token = null } = useSelector(state => state.auth || {});
    const { activeCurrency, rates, symbols } = useSelector(state => state.currency);

    const [step, setStep] = useState(1); // 1: Info & Shipping, 2: Payment & Authorization
    const [isLoading, setIsLoading] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showPartialCodPopup, setShowPartialCodPopup] = useState(false);
    const [pincodeError, setPincodeError] = useState(false);
    const [isVerifyingPincode, setIsVerifyingPincode] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [validationError, setValidationError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        phone: '',
        houseNo: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        paymentMethod: '',
        customerNote: ''
    });

    const [savedAddresses, setSavedAddresses] = useState(null);

    // Promo Code State
    const [promoInput, setPromoInput] = useState('');
    const [appliedCode, setAppliedCode] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [successToast, setSuccessToast] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetch(`${API_URL}/api/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setSavedAddresses(data);
                    // Pre-fill with shipping if exists, otherwise use profile data
                    if (data && data.shipping) {
                        setFormData(prev => ({
                            ...prev,
                            firstName: data.shipping.first_name || user?.first_name || user?.firstName || '',
                            lastName: data.shipping.last_name || user?.last_name || user?.lastName || '',
                            email: user?.email || '',
                            houseNo: data.shipping.house_no || '',
                            area: data.shipping.area || '',
                            landmark: data.shipping.landmark || '',
                            city: data.shipping.city,
                            state: data.shipping.state || '',
                            country: data.shipping.country || 'India',
                            pincode: data.shipping.pincode,
                            phone: data.shipping.phone || user?.telephone || ''
                        }));
                    } else {
                        // Pre-fill from user profile automatically
                        setFormData(prev => ({
                            ...prev,
                            firstName: user?.first_name || user?.firstName || '',
                            lastName: user?.last_name || user?.lastName || '',
                            email: user?.email || '',
                            phone: user?.telephone || ''
                        }));
                    }
                })
                .catch(err => console.error("Error fetching addresses:", err));
        }
    }, [isAuthenticated, token, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Clear field error if user types
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        
        // Luxury Purity: Only allow 6 numeric digits for pincode
        if (name === 'pincode') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        // Phone Purity: Only allow numeric digits (max 10)
        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [locationMismatch, setLocationMismatch] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState({ city: '', state: '' });

    // Auto-detect City and State based on Pincode with strict verification
    useEffect(() => {
        const detectLocation = async () => {
            const pincode = formData.pincode.trim();
            
            // Only trigger Indian Verification if it's a 6-digit numeric code
            if (pincode.length === 6 && /^\d+$/.test(pincode)) {
                setIsVerifyingPincode(true);
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                    const data = await res.json();
                    
                    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
                        const po = data[0].PostOffice[0];
                        const city = po.District || po.Name || "";
                        const state = po.State || "";

                        setDetectedLocation({ city, state });
                        setFormData(prev => ({
                            ...prev,
                            city: city,
                            state: state
                        }));
                        setPincodeError(false);
                        setLocationMismatch(false);
                    } else {
                        // Strict Boutique Protocol: If 6 digits but not in registry, mark as error
                        setDetectedLocation({ city: '', state: '' });
                        setPincodeError(true);
                        setLocationMismatch(false);
                    }
                } catch (err) {
                    console.error("Boutique Fault: Pincode handshake failed.", err);
                    setPincodeError(false); // Fallback to manual if API is down
                    setLocationMismatch(false);
                } finally {
                    setIsVerifyingPincode(false);
                }
            } else {
                // Not an Indian 6-digit code - disable verification & mismatch logic
                setDetectedLocation({ city: '', state: '' });
                setLocationMismatch(false);
            }
        };

        const timer = setTimeout(detectLocation, 300);
        return () => clearTimeout(timer);
    }, [formData.pincode]);

    // Integrity Guard: Check if manual changes conflict with pincode
    useEffect(() => {
        if (detectedLocation.city && formData.city) {
            if (formData.city.toLowerCase().trim() !== detectedLocation.city.toLowerCase().trim()) {
                setLocationMismatch(true);
            } else {
                setLocationMismatch(false);
            }
        }
    }, [formData.city, detectedLocation]);

    // --- REAL-TIME CART VALIDATION (Price & Stock) ---
    useEffect(() => {
        const validateCart = async () => {
            if (items.length === 0) {
                setIsValidating(false);
                return;
            }

            try {
                // Fetch latest data for all items in the cart
                const updatedItems = await Promise.all(items.map(async (item) => {
                    const res = await fetch(`${API_URL}/api/products/${item.slug}`);
                    if (!res.ok) return item; 
                    const freshProduct = await res.json();
                    
                    const priceRaw = (freshProduct.sale_price || freshProduct.price || "0").toString().replace(/[^0-9]/g, '');
                    const currentPrice = parseInt(priceRaw) || 0;
                    
                    const oldPriceRaw = (item.sale_price || item.price || "0").toString().replace(/[^0-9]/g, '');
                    const oldPrice = parseInt(oldPriceRaw) || 0;

                    return {
                        ...item,
                        price: freshProduct.price,
                        sale_price: freshProduct.sale_price,
                        stock_count: freshProduct.stock_count,
                        isOOS: freshProduct.stock_count < item.quantity,
                        priceChanged: currentPrice !== oldPrice
                    };
                }));

                const oosItems = updatedItems.filter(i => i.isOOS);
                if (oosItems.length > 0) {
                    setValidationError(`Inventory update: ${oosItems.map(i => i.name).join(', ')} is currently unavailable.`);
                } else {
                    setValidationError('');
                }

                // Determine if we need to update Redux (only if data actually changed)
                const hasChanges = updatedItems.some((item, idx) => {
                    const old = items[idx];
                    if (!old) return true;
                    return item.price !== old.price || 
                           item.sale_price !== old.sale_price || 
                           item.stock_count !== old.stock_count ||
                           item.isOOS !== old.isOOS;
                });

                if (hasChanges) {
                    dispatch(setCart({ items: updatedItems }));
                }
            } catch (err) {
                console.error("Cart validation fault:", err);
            } finally {
                setIsValidating(false);
            }
        };

        validateCart();
    }, []);

    const selectSavedAddress = (addr) => {
        setFormData(prev => ({
            ...prev,
            firstName: addr.first_name,
            lastName: addr.last_name,
            houseNo: addr.house_no || '',
            area: addr.area || '',
            landmark: addr.landmark || '',
            city: addr.city,
            state: addr.state || '',
            country: addr.country || 'India',
            pincode: addr.pincode,
            phone: addr.phone,
            email: addr.email || prev.email
        }));
        setFieldErrors({}); // Clear errors when selecting saved address
    };

    const validateForm = () => {
        const errors = {};
        const requiredFields = [
            'firstName', 'lastName', 'email', 'phone', 
            'houseNo', 'area', 'landmark', 'city', 'state', 'pincode'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                errors[field] = 'Required';
            }
        });

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email';
        }

        // Phone validation (10 digits)
        if (formData.phone && formData.phone.length < 10) {
            errors.phone = '10 digits required';
        }

        // Pincode Security Guard: Block if not recognized or not entered
        if (pincodeError || !formData.pincode) {
            errors.pincode = 'Verified Pincode Required';
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0 || pincodeError) {
            // Auto-scroll to first error
            const firstErrorField = pincodeError ? 'pincode' : requiredFields.find(f => errors[f]);
            if (firstErrorField) {
                const element = document.getElementsByName(firstErrorField)[0];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }
            return false;
        }
        return true;
    };

    // Abandoned Cart Sync for Guests (Step 1 email entry)
    useEffect(() => {
        if (!isAuthenticated && formData.email && formData.email.includes('@') && items.length > 0) {
            const syncGuestCart = async () => {
                try {
                    await fetch(`${API_URL}/api/carts/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: formData.email.toLowerCase(),
                            items: items.map(i => ({
                                product_id: i.id,
                                product_name: i.name,
                                quantity: i.quantity,
                                price: i.sale_price || i.price,
                                image_url: i.image_url
                            }))
                        })
                    });
                } catch (err) {
                    console.error("Guest cart sync fault:", err);
                }
            };
            const timer = setTimeout(syncGuestCart, 1000);
            return () => clearTimeout(timer);
        }
    }, [formData.email, items, isAuthenticated]);

    const handleApplyPromo = async () => {
        if (!promoInput) return;
        setIsApplying(true);
        setPromoError('');
        try {
            const response = await fetch(`${API_URL}/api/promo-codes/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    code: promoInput, 
                    cartTotal: subtotal,
                    items: items 
                })
            });
            const data = await response.json();
            if (response.ok) {
                setAppliedCode(data.code);
                setDiscountAmount(data.discount_amount);
                setPromoError('');
                setSuccessToast('Promo Manifest Secured');
                setTimeout(() => setSuccessToast(''), 2000);
            } else {
                setPromoError(data.msg);
                setAppliedCode(null);
                setDiscountAmount(0);
            }
        } catch (err) {
            setPromoError(err.message || 'Validation failed. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    const removePromo = () => {
        setAppliedCode(null);
        setDiscountAmount(0);
        setPromoInput('');
        setPromoError('');
    };

    const calculateSubtotal = () => {
        return items.reduce((acc, item) => {
            const rawPrice = (item?.sale_price || item?.price || "0").toString();
            const price = parseInt(rawPrice.replace(/[^0-9]/g, '')) || 0;
            return acc + (price * (item.quantity || 1));
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const shipping = 0;
    const finalTotal = subtotal + shipping - discountAmount;

    // Partial COD Calculations (30% online, 70% cod)
    const isPartialSelected = formData.paymentMethod.toLowerCase().includes('partial');
    const amountOnline = isPartialSelected ? Math.round(finalTotal * 0.30) : finalTotal;
    const amountCOD = isPartialSelected ? (finalTotal - amountOnline) : 0;

    const handleSubmitOrder = async () => {
        if (isValidating) return;
        
        // Final Sweep: Validate before submission
        if (!validateForm()) {
            setOrderError('Please complete all required fields highlighted in red.');
            return;
        }

        if (validationError) {
            setOrderError(validationError);
            return;
        }
        setIsLoading(true);
        setOrderError('');

        if (!formData.paymentMethod) {
            setOrderError('Please select a payment method first.');
            setIsLoading(false);
            return;
        }

        try {
            // Handle 100% Discount / Free Orders
            if (amountOnline <= 0) {
                const freeOrderId = await placeBackendOrder(null, 'Pending');
                if (freeOrderId) {
                    // Track Purchase for Free/100% Discount orders
                    trackPurchase(freeOrderId, {
                        total_amount: finalTotal,
                        applied_promo_code: appliedCode,
                        items: items.map(item => ({
                            product_id: item.id,
                            product_name: item.name,
                            price: Number(String(item.sale_price || item.price).replace(/[^0-9.]/g, '')),
                            quantity: item.quantity
                        }))
                    });
                    dispatch(clearCart());
                    navigate(`/order-success/${freeOrderId}`);
                }
                return;
            }

            // 1. Create the Order Draft (PAYMENT NOT COMPLETED) FIRST
            const draftOrderId = await placeBackendOrder(null, 'Payment Pending');
            if (!draftOrderId) return; 

            // 2. Create Razorpay Order
            const rzpRes = await fetch(`${API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ amount: amountOnline })
            });

            if (!rzpRes.ok) throw new Error("Failed to initialize secure payment.");

            const rzpOrder = await rzpRes.json();
            const keyRes = await fetch(`${API_URL}/api/payment/key`);
            const { key } = await keyRes.json();

            const options = {
                key: key,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: 'KIKS Ultra Luxury',
                description: 'Payment Authorization',
                order_id: rzpOrder.id,
                theme: { color: '#000000' },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone
                },
                handler: async function (response) {
                    try {
                        // 3. Confirm Payment and Finalize Order
                        const confirmRes = await fetch(`${API_URL}/api/orders/${draftOrderId}/confirm-payment`, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                ...(token && { 'Authorization': `Bearer ${token}` })
                            },
                            body: JSON.stringify(response)
                        });
                        const confirmData = await confirmRes.json();

                        if (confirmData.success) {
                            // Track Purchase for Paid orders
                            trackPurchase(draftOrderId, {
                                total_amount: finalTotal,
                                applied_promo_code: appliedCode,
                                items: items.map(item => ({
                                    product_id: item.id,
                                    product_name: item.name,
                                    price: Number(String(item.sale_price || item.price).replace(/[^0-9.]/g, '')),
                                    quantity: item.quantity
                                }))
                            });
                            dispatch(clearCart());
                            navigate(`/order-success/${draftOrderId}`);
                        } else {
                            setOrderError('Payment verification failed. Order marked as Abandoned.');
                        }
                    } catch (err) {
                        setOrderError('Verification fault: ' + err.message);
                    } finally {
                        setIsLoading(false);
                    }
                },
                modal: {
                    ondismiss: function() {
                        setIsLoading(false);
                        // Trigger Abandoned/Failure Email
                        fetch(`${API_URL}/api/orders/${draftOrderId}/notify-payment-failure`, { method: 'POST' }).catch(() => {});
                        navigate('/payment-cancelled');
                    }
                }
            };

            const rzpWindow = new window.Razorpay(options);
            rzpWindow.on('payment.failed', function (response){
                setIsLoading(false);
                // Trigger Abandoned/Failure Email
                fetch(`${API_URL}/api/orders/${draftOrderId}/notify-payment-failure`, { method: 'POST' }).catch(() => {});
                navigate('/payment-cancelled');
            });
            rzpWindow.open();

        } catch (error) {
            console.error('Payment Flow Error:', error);
            setOrderError(`Payment fault: ${error.message}`);
            setIsLoading(false);
        }
    };

    const placeBackendOrder = async (paymentData = null, status = 'Pending') => {
        try {
            const orderPayload = {
                user_id: user?.id || null,
                customer_name: `${formData.firstName} ${formData.lastName}`,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: `${formData.houseNo}, ${formData.area}, ${formData.landmark}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pincode}`,
                total_amount: finalTotal,
                amount_paid: isPartialSelected ? amountOnline : finalTotal,
                amount_pending: isPartialSelected ? amountCOD : 0,
                payment_method: formData.paymentMethod.includes('online') ? 'Razorpay (Online)' : formData.paymentMethod,
                status: status,
                items: items.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price: Number(String(item.sale_price || item.price).replace(/[^0-9.]/g, '')),
                    image_url: item.image_url,
                    size: item.size,
                    slug: item.slug
                })),
                applied_promo_code: appliedCode,
                discount_amount: discountAmount,
                is_gift: false, // Default
                customer_note: formData.customerNote,
                razorpay_order_id: paymentData?.razorpay_order_id || null,
                razorpay_payment_id: paymentData?.razorpay_payment_id || null,
                razorpay_signature: paymentData?.razorpay_signature || null
            };

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(orderPayload)
            });

            const data = await response.json();
            if (response.ok) {
                return data.order_id;
            } else {
                throw new Error(data.msg || 'Database registry failed.');
            }
        } catch (error) {
            console.error('Backend Order Error:', error);
            setOrderError(`System Error: ${error.message}`);
            setIsLoading(false);
            return null;
        }
    };

    const inputClasses = "w-full bg-neutral-50/50 border-b border-black/20 py-3 md:py-4 text-[15px] tracking-[0.1em] text-black focus:border-black outline-none transition-all placeholder:text-black/30 placeholder:text-[11px] placeholder:tracking-widest rounded-none px-4";
    const labelClasses = "text-[11px] tracking-[0.25em] font-bold text-black/60 uppercase mb-2 block";

    if (items.length === 0 && !isLoading) {
        return (
            <div className="bg-white min-h-screen pt-56 flex flex-col items-center justify-center text-center px-6">
                <div className="w-px h-24 bg-black/10 mb-12" />
                <h1 className="text-3xl font-serif tracking-[0.2em] uppercase text-black mb-6">Selection Empty</h1>
                <p className="text-[10px] tracking-widest text-black/40 uppercase mb-16 max-w-xs leading-loose font-sans">
                    Your personal boutique awaits its first curated order.
                </p>
                <Link to="/collection" className="border border-black/20 px-16 py-5 text-[10px] font-bold tracking-[0.5em] uppercase hover:bg-black hover:text-white transition-all text-black">
                    Return to Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen text-black pt-24 md:pt-40 pb-24 px-6 md:px-10 lg:px-20 font-sans">
            <ActionLoader isLoading={isLoading} message={isValidating ? "Validating Selection" : "Processing with your order"} />
            <div className="container mx-auto max-w-7xl">

                <div className="mb-12 md:mb-24 text-center">
                    <h1 className="text-3xl md:text-6xl font-serif tracking-[0.2em] uppercase mb-6 text-black">Checkout</h1>
                    <div className="flex items-center justify-center space-x-2 md:space-x-4 text-[8px] md:text-[9px] tracking-[0.3em] md:tracking-[0.5em] text-black uppercase font-bold">
                        <span className="text-black">01 Details</span>
                        <div className="w-6 md:w-10 h-px bg-black/20" />
                        <span className="text-black">02 Payment</span>
                        <div className="w-6 md:w-10 h-px bg-black/20" />
                        <span className="text-black text-[10px]">●</span>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-start">

                    {/* Main Form Area (Order 2 on mobile, 1 on desktop) */}
                    <div className="space-y-12 md:space-y-24 w-full order-2 lg:order-1">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <h2 className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase font-bold text-black mb-10 border-b border-black/5 pb-6">Shipping Details</h2>

                                    {/* Saved Address Selector */}
                                    {isAuthenticated && savedAddresses && (
                                        <div className="mb-12">
                                            <p className="text-[9px] tracking-[0.4em] text-black uppercase mb-6 font-bold italic">Select from your Saved Addresses:</p>
                                            <div className="flex flex-wrap gap-4">
                                                {/* Unified list of all stored addresses */}
                                                {[
                                                    ...(savedAddresses.billing ? [savedAddresses.billing] : []),
                                                    ...(savedAddresses.shipping ? [savedAddresses.shipping] : []),
                                                    ...(savedAddresses.additional || [])
                                                ]
                                                .filter(addr => addr.first_name)
                                                .map((addr, idx) => (
                                                    <button 
                                                        key={idx} 
                                                        onClick={() => selectSavedAddress(addr)} 
                                                        className="border border-black/10 px-6 py-3 text-[8px] tracking-[0.2em] uppercase hover:border-gold-500 transition-all bg-neutral-50"
                                                    >
                                                        Address {idx + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-10 md:space-y-16">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="relative group">
                                                <label className={`${labelClasses} ${fieldErrors.firstName ? 'text-red-500' : ''}`}>First Name <span className={formData.firstName ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} className={`${inputClasses} ${fieldErrors.firstName ? 'border-red-500' : ''}`} />
                                                {fieldErrors.firstName && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.firstName}</p>}
                                            </div>
                                            <div className="relative group">
                                                <label className={`${labelClasses} ${fieldErrors.lastName ? 'text-red-500' : ''}`}>Last Name <span className={formData.lastName ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} className={`${inputClasses} ${fieldErrors.lastName ? 'border-red-500' : ''}`} />
                                                {fieldErrors.lastName && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.lastName}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="relative group">
                                                <label className={`${labelClasses} ${fieldErrors.email ? 'text-red-500' : ''}`}>Email <span className={formData.email ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                <input name="email" value={formData.email} onChange={handleInputChange} className={`${inputClasses} ${fieldErrors.email ? 'border-red-500' : ''}`} />
                                                {fieldErrors.email && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.email}</p>}
                                            </div>
                                            <div className="relative group">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className={`${labelClasses} ${fieldErrors.phone ? 'text-red-500' : ''}`}>Phone <span className={(formData.phone?.length === 10 && !isCheckingPhone && !phoneError) ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                    {phoneError && <span className="text-[7px] text-red-500 font-bold tracking-widest uppercase animate-pulse">{phoneError}</span>}
                                                    {isCheckingPhone && <span className="text-[7px] text-black font-bold tracking-widest uppercase">Verifying Registry...</span>}
                                                </div>
                                                <input 
                                                    name="phone" 
                                                    value={formData.phone} 
                                                    onChange={handleInputChange} 
                                                    className={`${inputClasses} ${phoneError || fieldErrors.phone ? 'border-red-500 text-red-500' : ''}`} 
                                                    placeholder="10-Digit Mobile Number"
                                                />
                                                {fieldErrors.phone && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.phone}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="relative group">
                                                <label className={`${labelClasses} ${fieldErrors.houseNo ? 'text-red-500' : ''}`}>House No / Apt / Suite <span className={formData.houseNo ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                <input name="houseNo" placeholder="E.g. Villa 402, 4th Floor" value={formData.houseNo} onChange={handleInputChange} className={`${inputClasses} ${fieldErrors.houseNo ? 'border-red-500' : ''}`} />
                                                {fieldErrors.houseNo && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.houseNo}</p>}
                                            </div>
                                            <div className="relative group">
                                                <label className={`${labelClasses} ${fieldErrors.area ? 'text-red-500' : ''}`}>Area / Street <span className={formData.area ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                <input name="area" placeholder="E.g. Emerald Hills" value={formData.area} onChange={handleInputChange} className={`${inputClasses} ${fieldErrors.area ? 'border-red-500' : ''}`} />
                                                {fieldErrors.area && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.area}</p>}
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <label className={`${labelClasses} ${fieldErrors.landmark ? 'text-red-500' : ''}`}>Landmark (Near you) <span className={formData.landmark ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                            <input name="landmark" placeholder="E.g. Near Marina Tower" value={formData.landmark} onChange={handleInputChange} className={`${inputClasses} ${fieldErrors.landmark ? 'border-red-500' : ''}`} />
                                            {fieldErrors.landmark && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.landmark}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                            <div className="relative group">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className={`${labelClasses} ${fieldErrors.city ? 'text-red-500' : ''}`}>City <span className={formData.city ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                    {locationMismatch && (
                                                        <span className="text-[7px] text-red-500 font-bold tracking-widest uppercase animate-pulse">
                                                            Note: Typically {detectedLocation.city}
                                                        </span>
                                                    )}
                                                </div>
                                                <input name="city" value={formData.city} onChange={handleInputChange} className={`${inputClasses} ${locationMismatch || fieldErrors.city ? 'border-red-500/50' : ''}`} />
                                                {fieldErrors.city && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.city}</p>}
                                            </div>
                                            <div className="relative group">
                                                <label className={`${labelClasses} ${fieldErrors.state ? 'text-red-500' : ''}`}>State <span className={formData.state ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                <input name="state" value={formData.state} onChange={handleInputChange} className={`${inputClasses} ${fieldErrors.state ? 'border-red-500' : ''}`} />
                                                {fieldErrors.state && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.state}</p>}
                                            </div>
                                            <div className="relative group">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className={`${labelClasses} ${pincodeError || fieldErrors.pincode ? 'text-red-500' : ''}`}>
                                                        Pincode <span className={(formData.pincode?.length === 6 && !isVerifyingPincode && !pincodeError) ? 'text-green-600' : 'text-red-500'}>*</span>
                                                    </label>
                                                    {pincodeError && (
                                                        <span className="text-[8px] text-red-500 font-black tracking-widest uppercase animate-pulse">
                                                            Not Recognized
                                                        </span>
                                                    )}
                                                    {(!pincodeError && formData.pincode.length === 6 && !isVerifyingPincode) && (
                                                        <span className="text-[8px] text-green-600 font-black tracking-widest uppercase">
                                                            Verified
                                                        </span>
                                                    )}
                                                    {isVerifyingPincode && <span className="text-[8px] text-black/40 font-bold tracking-widest uppercase">Verifying...</span>}
                                                </div>
                                                <input 
                                                    name="pincode" 
                                                    value={formData.pincode} 
                                                    onChange={handleInputChange} 
                                                    className={`${inputClasses} ${(pincodeError || fieldErrors.pincode) ? 'border-red-500 text-red-500 bg-red-50/10' : formData.pincode.length === 6 ? 'border-green-600/30' : ''}`} 
                                                    placeholder="6-Digit PIN"
                                                />
                                                {fieldErrors.pincode && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.pincode}</p>}
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-black/5 space-y-6">
                                            <div className="relative group">
                                                <label className={labelClasses}>Special Instructions / Customer Note (Optional)</label>
                                                <textarea 
                                                    name="customerNote"
                                                    value={formData.customerNote} 
                                                    onChange={handleInputChange} 
                                                    className={`${inputClasses} resize-none h-24`} 
                                                    placeholder="E.g. Deliver to front desk, call upon arrival, or specific delivery window..."
                                                    maxLength={500}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-10">
                                            {(!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.houseNo || !formData.area || !formData.city || !formData.state || !formData.pincode) && (
                                                <div className="text-center mb-10 animate-pulse">
                                                    <span 
                                                        style={{ color: '#ff0000', fontWeight: '900' }}
                                                        className="text-[7px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] uppercase inline-block"
                                                    >
                                                        PLEASE COMPLETE ALL REQUIRED FIELDS TO CONTINUE *
                                                    </span>
                                                </div>
                                            )}
                                            {locationMismatch && (
                                                <p className="text-red-500 text-[9px] tracking-widest mb-4 uppercase text-center font-black animate-pulse">
                                                    ⚠️ Pincode {formData.pincode} belongs to {detectedLocation.city}. Please verify your city.
                                                </p>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (validateForm()) {
                                                        setStep(2);
                                                    }
                                                }}
                                                className={`w-full h-16 border border-black text-black text-[13px] font-bold tracking-[0.5em] uppercase transition-all flex items-center justify-center font-sans ${
                                                    isVerifyingPincode || locationMismatch || isCheckingPhone || !!phoneError || pincodeError ? 'opacity-50 cursor-not-allowed bg-neutral-50' : 'hover:bg-black hover:text-white'
                                                }`}
                                                disabled={isVerifyingPincode || locationMismatch || isCheckingPhone || !!phoneError || pincodeError}
                                            >
                                                {isVerifyingPincode ? 'Verifying Details...' : isCheckingPhone ? 'Checking Registry...' : 'Proceed to Payment'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <h2 className="text-[10px] md:text-[11px] tracking-[0.6em] uppercase font-bold text-black mb-8 md:mb-16 border-b border-black/5 pb-6">Secure Payment</h2>
                                        <div className="bg-neutral-50/50 border border-black/5 overflow-hidden">
                                            {/* Payment Options Header */}
                                            <div className="p-6 md:p-8 border-b border-black/5">
                                                <p className="text-[9px] tracking-[0.4em] font-bold uppercase text-black mb-4">Select Payment Method</p>
                                                <div className="space-y-3">
                                                    {[
                                                        { id: 'Credit/Debit Card (Prepaid)', label: 'CREDIT / DEBIT CARD' },
                                                        { id: 'UPI / Razorpay (Prepaid)', label: 'UPI / WALLETS / QR' },
                                                        { id: 'Partial COD (30% Prepaid)', label: 'PARTIAL COD (30% NOW / 70% ON DELIVERY)' }
                                                    ].map((method) => (
                                                        <button
                                                            key={method.id}
                                                            type="button"
                                                            onClick={() => {
                                                                if (method.id === 'Partial COD (30% Prepaid)' && formData.paymentMethod !== method.id) {
                                                                    setShowPartialCodPopup(true);
                                                                } else {
                                                                    setFormData({ ...formData, paymentMethod: method.id });
                                                                }
                                                            }}
                                                            className={`w-full flex items-center p-4 border transition-all ${formData.paymentMethod === method.id ? 'border-black/40 bg-white' : 'border-black/5 hover:bg-neutral-100/50'}`}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 ${formData.paymentMethod === method.id ? 'border-black' : 'border-black/20'}`}>
                                                                {formData.paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-black" />}
                                                            </div>
                                                            <span className={`text-[10px] md:text-[11px] tracking-[0.2em] font-semibold uppercase text-left text-black`}>
                                                                {method.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Summary & Action Area */}
                                            <div className="p-6 md:p-8 space-y-8 bg-neutral-50/30">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-black">Delivery summary</p>
                                                        <p className="text-[11px] tracking-widest text-black leading-relaxed font-sans">
                                                            <span className="text-black font-semibold">{formData.firstName} {formData.lastName}</span><br />
                                                            {formData.houseNo}, {formData.area}<br />
                                                            {formData.city}, {formData.pincode}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => setStep(1)} className="text-[9px] tracking-[0.2em] uppercase text-black border-b border-black font-bold hover:text-black/60 transition-colors">Edit</button>
                                                </div>

                                                <div className="pt-8 border-t border-black/5">
                                                    <div className="flex items-start space-x-3 mb-6 cursor-pointer group" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                                                        <div className={`mt-0.5 w-4 h-4 border transition-all flex items-center justify-center flex-shrink-0 ${agreedToTerms ? 'border-black bg-black' : 'border-black'}`}>
                                                            {agreedToTerms && <CheckCircle size={10} className="text-white" />}
                                                        </div>
                                                        <span className="text-[9px] tracking-[0.1em] uppercase text-black group-hover:text-black transition-colors leading-relaxed">
                                                            I agree to the <Link to="/terms" className="text-black border-b border-black">Terms</Link> & <Link to="/privacy" className="text-black border-b border-black">Privacy Policy</Link>
                                                        </span>
                                                    </div>

                                                    {validationError && (
                                                        <div className="bg-red-500/5 border border-red-500/20 p-6 mb-8 flex items-center gap-4 animate-pulse">
                                                            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                                                            <p className="text-red-600 text-[10px] tracking-[0.2em] uppercase font-black leading-relaxed">
                                                                {validationError}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {orderError && (
                                                        <div className="py-6 mb-4 flex items-center justify-center gap-3">
                                                            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                                                            <p style={{ color: '#ff0000' }} className="text-[10px] tracking-[0.2em] uppercase leading-relaxed">
                                                                {orderError}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <button
                                                        disabled={isLoading || isValidating || !agreedToTerms || !!validationError}
                                                        onClick={handleSubmitOrder}
                                                        className={`w-full h-16 border border-black text-black text-[13px] font-bold tracking-[0.5em] uppercase transition-all flex flex-col items-center justify-center disabled:bg-neutral-100 disabled:cursor-not-allowed ${isLoading || isValidating || !agreedToTerms || !!validationError ? '' : 'group hover:bg-black hover:text-white'}`}
                                                    >
                                                        {isLoading || isValidating ? (
                                                            <div className="flex flex-col items-center">
                                                                <Loader className="animate-spin mb-1 text-black" size={14} />
                                                                <span className="text-[8px] tracking-[0.2em] text-black">{isValidating ? 'VALIDATING INVENTORY' : 'PROCESSING'}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="mb-1 group-hover:text-white transition-colors">Complete Purchase</span>
                                                                <span className="text-[14px] font-serif tracking-[0.1em] group-hover:text-white transition-colors">{formatCurrency(amountOnline, activeCurrency, rates, symbols)}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                            <div className="flex flex-col items-center space-y-6 mt-8">
                                                <div className="flex items-center space-x-6 text-black">
                                                    <Lock size={12} />
                                                    <span className="text-[8px] tracking-[0.3em] uppercase">256-Bit SSL Secure Payment</span>
                                                </div>
                                            </div>
                                    </motion.div>
                                )}
                        </AnimatePresence>

                        {/* Success Toast Notification */}
                        <AnimatePresence>
                            {successToast && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999999] bg-black text-white px-8 py-4 flex items-center gap-4 shadow-2xl border border-white/10"
                                >
                                    <Ticket size={16} className="text-gold-500" />
                                    <span className="text-[10px] tracking-[0.4em] uppercase font-black">{successToast}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary Sidebar (Order 1 on mobile, 2 on desktop) */}
                    <div className="lg:sticky lg:top-40 w-full order-1 lg:order-2">
                        <div className="bg-neutral-50 border border-black/5 p-6 md:p-8 lg:p-10 space-y-8 md:space-y-10 relative overflow-hidden">
                            <h3 className="text-[11px] tracking-[0.5em] font-bold uppercase border-b border-black/10 pb-6 text-black">Your Selection</h3>

                            <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex space-x-6">
                                        <div className="w-20 h-24 flex-shrink-0 bg-white overflow-hidden border border-black/5">
                                            <img src={getFullImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-center">
                                            <h4 className="text-[12px] font-serif tracking-widest uppercase text-black mb-2 font-medium">{item.name}</h4>
                                            <p className="text-[9px] tracking-[0.4em] text-black uppercase font-semibold">Qty {item.quantity}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[11px] font-semibold tracking-widest text-black font-sans">{item.price}</span>
                                                {item.isOOS && (
                                                    <span className="text-[8px] text-red-500 font-black tracking-widest animate-pulse">UNAVAILABLE</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Section */}
                            <div className="pt-10 border-t border-black/10">
                                <label className="text-[9px] tracking-[0.4em] font-bold uppercase text-black mb-4 block">Apply Promo Code</label>
                                <AnimatePresence mode="wait">
                                    {!appliedCode ? (
                                        <motion.div 
                                            key="input"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex gap-4"
                                        >
                                            <input 
                                                value={promoInput}
                                                onChange={(e) => setPromoInput(e.target.value)}
                                                placeholder="ENTER CODE" 
                                                className="bg-transparent border-b border-black py-2 text-[11px] tracking-widest text-black outline-none flex-grow placeholder:text-black/40"
                                            />
                                            <button 
                                                onClick={handleApplyPromo}
                                                disabled={isApplying || !promoInput}
                                                className="text-[9px] tracking-[0.3em] font-bold uppercase text-black hover:text-black/60 transition-colors disabled:text-black"
                                            >
                                                {isApplying ? '...' : 'Apply'}
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="applied"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center justify-between bg-neutral-100 border border-black/5 px-6 py-5 shadow-sm"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center">
                                                    <Ticket size={14} className="text-black/60" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-black">{appliedCode}</p>
                                                    <p className="text-[9px] tracking-[0.1em] text-black/40 uppercase mt-0.5 font-medium">Manifest Applied</p>
                                                </div>
                                            </div>
                                            <button onClick={removePromo} className="text-black/20 hover:text-black transition-colors p-2">
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {promoError && <p className="text-[8px] tracking-widest text-red-500 uppercase mt-3">{promoError}</p>}
                            </div>

                            <div className="space-y-6 pt-10">
                                <div className="flex justify-between items-center text-black">
                                    <span className="text-[10px] tracking-[0.3em] uppercase">Order Subtotal</span>
                                    <span className="text-[12px] font-semibold tracking-widest">{formatCurrency(subtotal, activeCurrency, rates, symbols)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-black">
                                        <span className="text-[10px] tracking-[0.3em] uppercase">Promo Manifest</span>
                                        <span className="text-[12px] font-semibold tracking-widest">-{formatCurrency(discountAmount, activeCurrency, rates, symbols)}</span>
                                    </div>
                                )}
                                {isPartialSelected && (
                                    <div className="pt-6 space-y-4 border-t border-black/10">
                                        <div className="flex justify-between items-center text-black">
                                            <span className="text-[10px] tracking-[0.3em] uppercase">Due Now (30%)</span>
                                            <span className="text-[14px] font-bold tracking-widest">{formatCurrency(amountOnline, activeCurrency, rates, symbols)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-black">
                                            <span className="text-[9px] tracking-[0.3em] uppercase">On Delivery (70%)</span>
                                            <span className="text-[11px] font-semibold tracking-widest">{formatCurrency(amountCOD, activeCurrency, rates, symbols)}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-8 border-t border-black/20">
                                    <span className="text-[11px] tracking-[0.5em] font-bold uppercase text-black">Total Order</span>
                                    <span className="text-2xl font-serif tracking-[0.1em] text-black">{formatCurrency(finalTotal, activeCurrency, rates, symbols)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Partial COD Non-Refundable Popup */}
            <AnimatePresence>
                {showPartialCodPopup && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPartialCodPopup(false)}
                            className="absolute inset-0 bg-white/90 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white border border-black/10 p-8 md:p-12 shadow-2xl text-center"
                        >
                            <div className="text-center space-y-8">
                                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto">
                                    <Info size={24} className="text-black" />
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-serif tracking-[0.1em] uppercase text-black mb-4">Partial COD Policy</h3>
                                    <p className="text-[11px] tracking-widest text-black uppercase leading-loose max-w-sm mx-auto font-sans">
                                        To ensure the security of high-value orders, we require a <span className="text-black font-bold">30% secure payment</span> today. The remaining 70% will be collected at your doorstep.
                                    </p>
                                </div>

                                <div className="py-2"></div>

                                <div className="space-y-4">
                                    <button 
                                        onClick={() => {
                                            setFormData({ ...formData, paymentMethod: 'Partial COD (30% Prepaid)' });
                                            setShowPartialCodPopup(false);
                                        }}
                                        className="w-full h-16 border border-black text-black text-[11px] font-bold tracking-[0.5em] uppercase hover:bg-black hover:text-white transition-all"
                                    >
                                        I Understand & Accept
                                    </button>
                                    <button 
                                        onClick={() => setShowPartialCodPopup(false)}
                                        className="text-[9px] tracking-[0.3em] font-bold uppercase text-black hover:text-black transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowPartialCodPopup(false)}
                                className="absolute top-6 right-6 text-black hover:text-black transition-colors"
                            >
                                <X size={20} strokeWidth={1} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Checkout;
