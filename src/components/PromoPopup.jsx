import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSelector } from 'react-redux';

const PromoPopup = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [isVisible, setIsVisible] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isAdmin = user && (
        user.email === 'kiksultraluxury@gmail.com' ||
        user.email === 'hit.goyani1010@gmail.com'
    );

    useEffect(() => {
        if (isAdmin) return; // Never show to administrators

        const fetchPopupData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketing/popup`);
                const data = await res.json();
                setPopupData(data);

                // Check localStorage timestamps for custom display intervals
                const dismissedAt = localStorage.getItem('kiks_promo_dismissed_at');
                const subscribedAt = localStorage.getItem('kiks_promo_subscribed_at');
                const now = Date.now();

                let shouldShow = true;

                // If user subscribed, hide for 21 days (3 weeks)
                if (subscribedAt) {
                    const diff = now - parseInt(subscribedAt, 10);
                    if (diff < 21 * 24 * 60 * 60 * 1000) {
                        shouldShow = false;
                    }
                }

                // If user closed the popup, hide for 5 days
                if (shouldShow && dismissedAt) {
                    const diff = now - parseInt(dismissedAt, 10);
                    if (diff < 5 * 24 * 60 * 60 * 1000) {
                        shouldShow = false;
                    }
                }

                // Fallback session check (respect current tab dismissal)
                if (sessionStorage.getItem('kiks_promo_seen') === 'true') {
                    shouldShow = false;
                }

                if (shouldShow && data.is_active) {
                    const timer = setTimeout(() => {
                        setIsVisible(true);
                    }, (data.delay_seconds || 5) * 1000);

                    return () => clearTimeout(timer);
                }
            } catch (err) {
                console.error("Failed to fetch popup data:", err);
            }
        };

        fetchPopupData();
    }, [isAdmin]);

    const handleClose = (isFromSubscription = false) => {
        setIsVisible(false);
        sessionStorage.setItem('kiks_promo_seen', 'true');
        if (!isFromSubscription) {
            localStorage.setItem('kiks_promo_dismissed_at', Date.now().toString());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, source: 'popup' })
            });

            if (res.ok) {
                setIsSubmitted(true);
                localStorage.setItem('kiks_promo_subscribed_at', Date.now().toString());
                localStorage.removeItem('kiks_promo_dismissed_at'); // clean up dismissed key
                setTimeout(() => {
                    handleClose(true);
                }, 3000);
            }
        } catch (err) {
            console.error("Popup subscription failed", err);
        }
    };

    const isImageOnly = !popupData?.title && !popupData?.offer_text;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[300000] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Content Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`relative w-full overflow-hidden flex flex-col md:flex-row shadow-[0_25px_80px_rgba(0,0,0,0.15)] ring-1 ring-gold-500/10 ${isImageOnly ? 'max-w-[380px] md:max-w-[420px]' : 'max-w-2xl bg-white border border-black/10'}`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-50 text-black/40 hover:text-black transition-colors bg-white/80 hover:bg-white p-2 rounded-full border border-black/5 shadow-sm backdrop-blur-sm"
                        >
                            <X size={16} />
                        </button>

                        {/* Image Side / Full Image */}
                        <div className={`relative overflow-hidden ${isImageOnly ? 'w-full aspect-[4/5]' : 'w-full md:w-1/2 h-48 md:h-auto'}`}>
                            {popupData?.redirect_url ? (
                                <a href={popupData.redirect_url} onClick={() => {
                                    sessionStorage.setItem('kiks_promo_seen', 'true');
                                    localStorage.setItem('kiks_promo_dismissed_at', Date.now().toString());
                                }}>
                                    <img
                                        src={popupData?.image_url ? (popupData.image_url.startsWith('http') ? popupData.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${popupData.image_url}`) : "/alchemy.webp"}
                                        className="w-full h-full object-cover"
                                        alt="Promo"
                                    />
                                    {isImageOnly && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                            <span className="bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-[0.4em]">Discover Collection</span>
                                        </div>
                                    )}
                                </a>
                            ) : (
                                <img
                                    src={popupData?.image_url ? (popupData.image_url.startsWith('http') ? popupData.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${popupData.image_url}`) : "/alchemy.webp"}
                                    className="w-full h-full object-cover"
                                    alt="Promo"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:hidden" />
                        </div>

                        {/* Text Side (Only if not image only) */}
                        {!isImageOnly && (
                            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center items-center text-center">
                                {!isSubmitted ? (
                                    <>
                                        <h2 className="text-xl md:text-2xl font-serif text-black tracking-widest uppercase italic mb-4 leading-tight">
                                            {popupData?.title || 'Newsletter'}
                                        </h2>
                                        <p className="text-[10px] md:text-[11px] text-black/50 tracking-[0.15em] mb-6 leading-relaxed max-w-xs uppercase">
                                            {popupData?.offer_text || 'Subscribe for the latest updates.'}
                                        </p>

                                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="EMAIL ADDRESS"
                                                className="w-full bg-transparent border-b border-black/10 py-4 text-[10px] tracking-[0.3em] text-black focus:border-black outline-none transition-colors text-center placeholder:text-black/30"
                                            />
                                            <button
                                                type="submit"
                                                className="w-full bg-black text-white py-5 text-[10px] font-black tracking-[0.5em] uppercase hover:bg-black/80 transition-colors duration-500"
                                            >
                                                Subscribe Now
                                            </button>
                                        </form>

                                        <button
                                            onClick={handleClose}
                                            className="mt-6 text-[8px] tracking-[0.4em] text-black/30 hover:text-black transition-colors uppercase"
                                        >
                                            Maybe Later
                                        </button>
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-8"
                                    >
                                        <div className="w-16 h-16 rounded-full border border-gold-500/30 flex items-center justify-center mb-6 mx-auto">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 bg-gold-500 rounded-full"
                                            />
                                        </div>
                                        <h3 className="text-black text-lg tracking-[0.3em] uppercase font-serif italic mb-2">Subscribed</h3>
                                        <p className="text-black text-[9px] tracking-[0.4em] uppercase font-black mb-3">You are now part of the list.</p>
                                        
                                        <div className="bg-black/5 border border-black/10 p-4">
                                            <p className="text-[8px] tracking-[0.4em] text-black/50 uppercase">Thank you for joining.</p>
                                        </div>
                                        <p className="mt-4 text-[9px] text-black/40 tracking-widest uppercase italic">Updates will be delivered to your inbox.</p>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PromoPopup;
