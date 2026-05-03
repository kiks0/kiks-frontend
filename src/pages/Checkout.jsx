import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
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
import { clearCart } from '../store/cartSlice';
import { formatCurrency } from '../utils/currency';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const { items = [], total = 0 } = useSelector(state => state.cart || {});
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
                    // Pre-fill with shipping if exists
                    if (data.shipping) {
                        setFormData(prev => ({
                            ...prev,
                            firstName: data.shipping.first_name,
                            lastName: data.shipping.last_name,
                            houseNo: data.shipping.house_no || '',
                            area: data.shipping.area || '',
                            landmark: data.shipping.landmark || '',
                            city: data.shipping.city,
                            state: data.shipping.state || '',
                            country: data.shipping.country || 'India',
                            pincode: data.shipping.pincode,
                            phone: data.shipping.phone
                        }));
                    }
                })
                .catch(err => console.error("Error fetching addresses:", err));
        }
    }, [isAuthenticated, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Auto-detect City and State based on Pincode with strict verification
    useEffect(() => {
        const detectLocation = async () => {
            if (formData.pincode.length === 6 && /^\d+$/.test(formData.pincode)) {
                setIsVerifyingPincode(true);
                setPincodeError(false);
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
                    const data = await res.json();
                    
                    if (data[0].Status === "Success" && data[0].PostOffice) {
                        const { District, State } = data[0].PostOffice[0];
                        setFormData(prev => ({
                            ...prev,
                            city: District,
                            state: State
                        }));
                        setPincodeError(false);
                    } else {
                        setPincodeError(true);
                    }
                } catch (err) {
                    console.error("Pincode detection failed:", err);
                    setPincodeError(true);
                } finally {
                    setIsVerifyingPincode(false);
                }
            } else if (formData.pincode.length > 0 && formData.pincode.length < 6) {
                setPincodeError(false);
            } else if (formData.pincode.length > 6) {
                setPincodeError(true);
            }
        };

        const timer = setTimeout(detectLocation, 500);
        return () => clearTimeout(timer);
    }, [formData.pincode]);

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
                    setValidationError(`Inventory depletion detected: ${oosItems.map(i => i.name).join(', ')} is currently unavailable.`);
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
            // Save address to user profile if logged in
            if (isAuthenticated && token) {
                await fetch(`${API_URL}/api/addresses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        type: 'shipping',
                        addressData: {
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                            house_no: formData.houseNo,
                            area: formData.area,
                            landmark: formData.landmark,
                            city: formData.city,
                            state: formData.state,
                            country: formData.country,
                            pincode: formData.pincode,
                            phone: formData.phone
                        }
                    })
                });
                console.log("Address sync successful");
            }
        } catch (addrErr) {
            console.error("Address sync failed:", addrErr);
            // We don't block the order if address sync fails, but we log it
        }

        try {
            // Create Razorpay Order
            const rzpRes = await fetch(`${API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ amount: amountOnline })
            });

            if (!rzpRes.ok) {
                throw new Error("Failed to initialize secure payment. Please try again.");
            }

            const rzpOrder = await rzpRes.json();

            // Fetch Razorpay Key
            const keyRes = await fetch(`${API_URL}/api/payment/key`);
            const { key } = await keyRes.json();

            const options = {
                key: key,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: 'KIKS Ultra Luxury',
                description: 'Payment Authorization',
                order_id: rzpOrder.id,
                theme: { color: '#D4AF37' },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                ...(token && { 'Authorization': `Bearer ${token}` })
                            },
                            body: JSON.stringify(response)
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            await placeBackendOrder();
                        } else {
                            setOrderError('Payment verification failed. Order not placed.');
                            setIsLoading(false);
                        }
                    } catch (err) {
                        setOrderError('Verification fault: ' + err.message);
                        setIsLoading(false);
                    }
                },
                modal: {
                    ondismiss: function() {
                        setOrderError('Your order got cancelled.');
                        setIsLoading(false);
                    }
                }
            };

            const rzpWindow = new window.Razorpay(options);
            rzpWindow.on('payment.failed', function (response){
                setOrderError('Payment Failed: ' + response.error.description);
                setIsLoading(false);
            });
            rzpWindow.open();

        } catch (error) {
            console.error('Payment Flow Error:', error);
            setOrderError(`Payment fault: ${error.message}`);
            setIsLoading(false);
        }
    };

    const placeBackendOrder = async () => {
        try {
            const orderData = {
                user_id: user?.id || null,
                customer_name: `${formData.firstName} ${formData.lastName}`,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: `${formData.houseNo}, ${formData.area}, Landmark: ${formData.landmark}, ${formData.city}, ${formData.state} - ${formData.pincode}, ${formData.country}`,
                total_amount: formatCurrency(finalTotal, activeCurrency, rates, symbols),
                customer_note: formData.customerNote,
                items: items.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    product_image: item.image_url,
                    quantity: item.quantity,
                    price: item.price
                })),
                payment_method: formData.paymentMethod,
                amount_paid: formatCurrency(amountOnline, activeCurrency, rates, symbols),
                amount_pending: formatCurrency(amountCOD, activeCurrency, rates, symbols),
                applied_promo_code: appliedCode,
                discount_amount: discountAmount
            };

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(clearCart());
                navigate(`/order-success/${data.order_id}`);
            } else {
                setOrderError(data.msg || 'Authorization failed. Please verify your credentials.');
            }
        } catch (error) {
            console.error('Submit Order Error:', error);
            setOrderError(`Communication fault: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full bg-transparent border-b border-white/20 py-3 md:py-4 text-sm tracking-[0.15em] text-white focus:border-white outline-none transition-all placeholder:text-white/10 rounded-none";
    const labelClasses = "text-[9px] tracking-[0.3em] font-bold text-white/50 uppercase mb-1 block";

    if (items.length === 0 && !isLoading) {
        return (
            <div className="bg-black min-h-screen pt-56 flex flex-col items-center justify-center text-center px-6">
                <div className="w-px h-24 bg-white/10 mb-12" />
                <h1 className="text-3xl font-serif tracking-[0.2em] uppercase text-white mb-6">Selection Empty</h1>
                <p className="text-[10px] tracking-widest text-white/40 uppercase mb-16 max-w-xs leading-loose font-sans">
                    Your personal boutique awaits its first curated acquisition.
                </p>
                <Link to="/collection" className="border border-white/20 px-16 py-5 text-[10px] font-bold tracking-[0.5em] uppercase hover:bg-white hover:text-black transition-all">
                    Return to Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#050505] min-h-screen text-white pt-24 md:pt-40 pb-24 px-6 md:px-10 lg:px-20 font-sans">
            <div className="container mx-auto max-w-7xl">

                <div className="mb-12 md:mb-24 text-center">
                    <h1 className="text-3xl md:text-6xl font-serif tracking-[0.2em] uppercase mb-6">Checkout</h1>
                    <div className="flex items-center justify-center space-x-2 md:space-x-4 text-[8px] md:text-[9px] tracking-[0.3em] md:tracking-[0.5em] text-white/40 uppercase font-black">
                        <span className={step === 1 ? 'text-white' : ''}>01 Details</span>
                        <div className="w-6 md:w-10 h-px bg-white/10" />
                        <span className={step === 2 ? 'text-white' : ''}>02 Payment</span>
                        <div className="w-6 md:w-10 h-px bg-white/10" />
                        <span className="opacity-50 text-[10px]">●</span>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-start">

                    {/* Main Form Area (Order 2 on mobile, 1 on desktop) */}
                    <div className="space-y-12 md:space-y-24 w-full order-2 lg:order-1">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <h2 className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase font-black mb-10 border-b border-white/5 pb-6">Shipping Details</h2>

                                    {/* Saved Address Selector */}
                                    {isAuthenticated && savedAddresses && (
                                        <div className="mb-12">
                                            <p className="text-[9px] tracking-[0.4em] text-gold-500 uppercase mb-6 font-black italic">Select from your Saved Addresses:</p>
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
                                                        className="border border-white/10 px-6 py-3 text-[8px] tracking-[0.2em] uppercase hover:border-gold-500 transition-all bg-white/[0.02]"
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
                                                <label className={labelClasses}>First Name</label>
                                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div className="relative group">
                                                <label className={labelClasses}>Last Name</label>
                                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="relative group">
                                                <label className={labelClasses}>Email</label>
                                                <input name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div className="relative group">
                                                <label className={labelClasses}>Phone</label>
                                                <input name="phone" value={formData.phone} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="relative group">
                                                <label className={labelClasses}>House No / Apt / Suite</label>
                                                <input name="houseNo" placeholder="E.G. VILLA 402, 4TH FLOOR" value={formData.houseNo} onChange={handleInputChange} className={inputClasses} required />
                                            </div>
                                            <div className="relative group">
                                                <label className={labelClasses}>Area / Street</label>
                                                <input name="area" placeholder="E.G. EMERALD HILLS" value={formData.area} onChange={handleInputChange} className={inputClasses} required />
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <label className={labelClasses}>Landmark (Near you)</label>
                                            <input name="landmark" placeholder="E.G. NEAR MARINA TOWER" value={formData.landmark} onChange={handleInputChange} className={inputClasses} required />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                            <div className="relative group">
                                                <label className={labelClasses}>City</label>
                                                <input name="city" value={formData.city} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div className="relative group">
                                                <label className={labelClasses}>State</label>
                                                <input name="state" value={formData.state} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div className="relative group">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className={labelClasses}>Pincode</label>
                                                    {pincodeError && <span className="text-[8px] text-red-500 font-black tracking-widest uppercase animate-pulse">Invalid Pincode</span>}
                                                    {isVerifyingPincode && <span className="text-[8px] text-gold-500/50 font-black tracking-widest uppercase">Verifying...</span>}
                                                </div>
                                                <input 
                                                    name="pincode" 
                                                    value={formData.pincode} 
                                                    onChange={handleInputChange} 
                                                    className={`${inputClasses} ${pincodeError ? 'border-red-500 text-red-500' : 'border-white/20 focus:border-white'}`} 
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-white/5 space-y-6">
                                            <div className="relative group">
                                                <label className={labelClasses}>Special Instructions / Customer Note (Optional)</label>
                                                <textarea 
                                                    name="customerNote"
                                                    value={formData.customerNote} 
                                                    onChange={handleInputChange} 
                                                    className={`${inputClasses} resize-none h-24`} 
                                                    placeholder="E.G. DELIVER TO FRONT DESK, CALL UPON ARRIVAL, OR SPECIFIC DELIVERY WINDOW..."
                                                    maxLength={500}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-10">
                                            <button
                                                onClick={() => setStep(2)}
                                                disabled={pincodeError || isVerifyingPincode || !formData.pincode}
                                                className={`w-full h-16 bg-white text-black text-[11px] font-black tracking-[0.6em] uppercase transition-all flex items-center justify-center font-sans ${pincodeError || isVerifyingPincode || !formData.pincode ? 'opacity-20 cursor-not-allowed grayscale' : 'hover:bg-gold-500'}`}
                                            >
                                                {isVerifyingPincode ? 'Verifying Details...' : 'Proceed to Payment'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <h2 className="text-[10px] md:text-[11px] tracking-[0.6em] uppercase font-black mb-8 md:mb-16 border-b border-white/5 pb-6">Secure Payment</h2>
                                        <div className="bg-white/[0.02] border border-white/5 overflow-hidden">
                                            {/* Payment Options Header */}
                                            <div className="p-6 md:p-8 border-b border-white/5">
                                                <p className="text-[9px] tracking-[0.4em] font-black uppercase text-gold-500 mb-4">Select Payment Method</p>
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
                                                            className={`w-full flex items-center p-4 border transition-all ${formData.paymentMethod === method.id ? 'border-white/40 bg-white/5' : 'border-white/5 hover:bg-white/[0.02]'}`}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 ${formData.paymentMethod === method.id ? 'border-gold-500' : 'border-white/20'}`}>
                                                                {formData.paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                                                            </div>
                                                            <span className={`text-[10px] md:text-[11px] tracking-[0.2em] font-bold uppercase text-left ${formData.paymentMethod === method.id ? 'text-white' : 'text-white/40'}`}>
                                                                {method.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Summary & Action Area */}
                                            <div className="p-6 md:p-8 space-y-8 bg-white/[0.01]">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] tracking-[0.4em] font-black uppercase text-white/20">Delivery summary</p>
                                                        <p className="text-[11px] tracking-widest text-white/70 leading-relaxed font-sans">
                                                            <span className="text-white font-bold">{formData.firstName} {formData.lastName}</span><br />
                                                            {formData.houseNo}, {formData.area}<br />
                                                            {formData.city}, {formData.pincode}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => setStep(1)} className="text-[9px] tracking-[0.2em] uppercase text-gold-500 border-b border-gold-500/30 font-bold hover:text-white transition-colors">Edit</button>
                                                </div>

                                                <div className="pt-8 border-t border-white/5">
                                                    <div className="flex items-start space-x-3 mb-6 cursor-pointer group" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                                                        <div className={`mt-0.5 w-4 h-4 border transition-all flex items-center justify-center flex-shrink-0 ${agreedToTerms ? 'border-gold-500 bg-gold-500' : 'border-white/20 group-hover:border-white/40'}`}>
                                                            {agreedToTerms && <CheckCircle size={10} className="text-black" />}
                                                        </div>
                                                        <span className="text-[9px] tracking-[0.1em] uppercase text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">
                                                            I agree to the <Link to="/terms" className="text-white border-b border-white/20">Terms</Link> & <Link to="/privacy" className="text-white border-b border-white/20">Privacy Policy</Link>
                                                        </span>
                                                    </div>

                                                    {orderError && <p className="text-red-400 text-[10px] tracking-widest mb-6 uppercase text-center">{orderError}</p>}
                                                    
                                                    <button
                                                        disabled={isLoading || isValidating || !agreedToTerms || !!validationError}
                                                        onClick={handleSubmitOrder}
                                                        className="w-full h-16 bg-white text-black text-[11px] font-black tracking-[0.5em] uppercase hover:bg-gold-500 transition-all flex flex-col items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed"
                                                    >
                                                        {isLoading || isValidating ? (
                                                            <div className="flex flex-col items-center">
                                                                <Loader className="animate-spin mb-1" size={14} />
                                                                <span className="text-[7px] tracking-[0.2em]">{isValidating ? 'VALIDATING BOUTIQUE INVENTORY' : 'PROCESSING'}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="mb-1">Complete Purchase</span>
                                                                <span className="text-[12px] font-serif tracking-[0.1em]">{formatCurrency(amountOnline, activeCurrency, rates, symbols)}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                            <div className="flex flex-col items-center space-y-6 opacity-30 mt-8">
                                                <div className="flex items-center space-x-6">
                                                    <Lock size={12} />
                                                    <span className="text-[8px] tracking-[0.3em] uppercase">256-Bit SSL Secure Payment</span>
                                                </div>
                                            </div>
                                    </motion.div>
                                )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary Sidebar (Order 1 on mobile, 2 on desktop) */}
                    <div className="lg:sticky lg:top-40 w-full order-1 lg:order-2">
                        <div className="bg-black border border-white/5 p-6 md:p-8 lg:p-10 space-y-8 md:space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />

                            <h3 className="text-[11px] tracking-[0.5em] font-black uppercase border-b border-white/10 pb-6">Your Boutique Selection</h3>

                            <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex space-x-6">
                                        <div className="w-20 h-24 flex-shrink-0 bg-zinc-900 overflow-hidden border border-white/5">
                                            <img src={getFullImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-center">
                                            <h4 className="text-[12px] font-serif tracking-widest uppercase text-white mb-2">{item.name}</h4>
                                            <p className="text-[9px] tracking-[0.4em] text-white/30 uppercase font-black">Qty {item.quantity}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[11px] font-bold tracking-widest text-white font-sans">{item.price}</span>
                                                {item.isOOS ? (
                                                    <span className="text-[7px] bg-red-500/10 text-red-500 px-1.5 py-0.5 font-black border border-red-500/20 tracking-widest">OUT OF STOCK</span>
                                                ) : (
                                                    <span className="text-[7px] bg-green-500/10 text-green-500 px-1.5 py-0.5 font-black border border-green-500/20 tracking-widest">READY</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Section */}
                            <div className="pt-10 border-t border-white/10">
                                <label className="text-[9px] tracking-[0.4em] font-black uppercase text-white/40 mb-4 block">Apply Promo Code</label>
                                {!appliedCode ? (
                                    <div className="flex gap-4">
                                        <input 
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            placeholder="ENTER CODE" 
                                            className="bg-transparent border-b border-white/20 py-2 text-[11px] tracking-widest text-white outline-none flex-grow placeholder:text-white/10"
                                        />
                                        <button 
                                            onClick={handleApplyPromo}
                                            disabled={isApplying || !promoInput}
                                            className="text-[9px] tracking-[0.3em] font-black uppercase text-gold-500 hover:text-white transition-colors disabled:opacity-20"
                                        >
                                            {isApplying ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-gold-400/5 border border-gold-500/20 px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <Ticket size={14} className="text-gold-500" />
                                            <div>
                                                <p className="text-[10px] tracking-widest font-black uppercase text-white">{appliedCode}</p>
                                                <p className="text-[8px] tracking-widest text-gold-500 uppercase mt-0.5">Manifest Applied</p>
                                            </div>
                                        </div>
                                        <button onClick={removePromo} className="text-white/30 hover:text-red-400 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                {promoError && <p className="text-[8px] tracking-widest text-red-500 uppercase mt-3">{promoError}</p>}
                            </div>

                            <div className="space-y-4 pt-10 border-t border-white/5 text-[10px] tracking-[0.3em] uppercase font-medium">
                                <div className="flex justify-between text-white/40">
                                    <span>Subtotal Value</span>
                                    <span>{formatCurrency(subtotal, activeCurrency, rates, symbols)}</span>
                                </div>
                                
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-gold-500 font-bold italic">
                                        <span>Promo Discount</span>
                                        <span>- {formatCurrency(discountAmount, activeCurrency, rates, symbols)}</span>
                                    </div>
                                )}
                                
                                {isPartialSelected && (
                                    <>
                                        <div className="flex justify-between text-gold-500 font-black">
                                            <span>Partial Amount (30%)</span>
                                            <span>{formatCurrency(amountOnline, activeCurrency, rates, symbols)}</span>
                                        </div>
                                        <div className="flex justify-between text-white/60">
                                            <span>Balance Due On Arrival</span>
                                            <span>{formatCurrency(amountCOD, activeCurrency, rates, symbols)}</span>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between items-center text-gold-500 font-black">
                                    <span>Standard Delivery</span>
                                    <span className="text-[9px] tracking-[0.1em]">Complimentary</span>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] md:text-[9px] tracking-[0.4em] uppercase text-white/30 mb-2 font-black font-sans">
                                        {isPartialSelected ? 'Total Order Amount' : 'Total Amount Due'}
                                    </p>
                                    <span className="text-2xl md:text-3xl font-serif tracking-widest text-white">{formatCurrency(finalTotal, activeCurrency, rates, symbols)}</span>
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
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 md:p-12 shadow-2xl text-center"
                        >
                            <div className="flex justify-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                                    <AlertCircle size={32} className="text-gold-500" />
                                </div>
                            </div>

                            <h3 className="text-xl md:text-2xl font-serif tracking-widest text-white uppercase mb-6">Payment Policy Notice</h3>
                            
                            <div className="space-y-4 mb-10">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gold-500 font-black">Partial COD Selection</p>
                                <p className="text-xs md:text-sm text-white/60 leading-relaxed tracking-widest font-light italic opacity-80">
                                    Please be advised that the <span className="text-white font-bold">Partial Amount (30%)</span> required for Partial COD orders is <span className="text-gold-500 font-bold">strictly non-refundable</span> once the order has been processed.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: 'Partial COD (30% Prepaid)' });
                                        setShowPartialCodPopup(false);
                                    }}
                                    className="w-full py-4 bg-white text-black text-[10px] font-black tracking-[0.4em] uppercase hover:bg-gold-500 transition-all shadow-xl"
                                >
                                    I UNDERSTAND & AGREE
                                </button>
                                <button
                                    onClick={() => setShowPartialCodPopup(false)}
                                    className="w-full py-4 bg-transparent text-white/40 text-[10px] font-black tracking-[0.4em] uppercase hover:text-white transition-all"
                                >
                                    CANCEL
                                </button>
                            </div>

                            <button 
                                onClick={() => setShowPartialCodPopup(false)}
                                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
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
