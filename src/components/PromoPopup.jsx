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
        user.email === 'hit.goyani1010@gmail.com' ||
        user.email.endsWith('@kiksultraluxury.com') ||
        user.email === 'admin@kiks.com'
    );

    useEffect(() => {
        if (isAdmin) return; // Never show to administrators

        const fetchPopupData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketing/popup`);
                const data = await res.json();
                setPopupData(data);

                // Check if user has already seen the popup in this session
                const hasSeenPopup = sessionStorage.getItem('kiks_promo_seen');

                if (!hasSeenPopup && data.is_active) {
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
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('kiks_promo_seen', 'true');
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
                setTimeout(() => {
                    handleClose();
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Content Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`relative w-full overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(212,175,55,0.15)] ring-1 ring-gold-500/20 ${isImageOnly ? 'max-w-[380px] md:max-w-[420px]' : 'max-w-4xl bg-[#0a0a0a] border border-white/10'}`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-50 text-white/40 hover:text-white transition-colors bg-black/50 p-2 rounded-full backdrop-blur-sm"
                        >
                            <X size={16} />
                        </button>

                        {/* Image Side / Full Image */}
                        <div className={`relative overflow-hidden ${isImageOnly ? 'w-full aspect-[4/5]' : 'w-full md:w-1/2 h-48 md:h-auto'}`}>
                            {popupData?.redirect_url ? (
                                <a href={popupData.redirect_url} onClick={() => sessionStorage.setItem('kiks_promo_seen', 'true')}>
                                    <img
                                        src={popupData?.image_url ? (popupData.image_url.startsWith('http') ? popupData.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${popupData.image_url}`) : "/alchemy.webp"}
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms] brightness-90 contrast-110"
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
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms] brightness-90 contrast-110"
                                    alt="Promo"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:hidden" />
                        </div>

                        {/* Text Side (Only if not image only) */}
                        {!isImageOnly && (
                            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center">
                                {!isSubmitted ? (
                                    <>
                                        <span className="text-gold-500 text-[9px] tracking-[0.5em] uppercase font-black mb-4">Privileged Invitation</span>
                                        <h2 className="text-2xl md:text-4xl font-serif text-white tracking-widest uppercase italic mb-6 leading-tight">
                                            {popupData?.title || 'Join The Inner Circle'}
                                        </h2>
                                        <p className="text-[11px] text-white/40 tracking-[0.15em] mb-8 leading-relaxed max-w-xs uppercase">
                                            {popupData?.offer_text || 'Subscribe to receive a 10% privilege on your first curation.'}
                                        </p>

                                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="EMAIL ADDRESS"
                                                className="w-full bg-transparent border-b border-white/20 py-4 text-[10px] tracking-[0.3em] uppercase text-white focus:border-gold-500 outline-none transition-colors text-center"
                                            />
                                            <button
                                                type="submit"
                                                className="w-full bg-white text-black py-5 text-[10px] font-black tracking-[0.5em] uppercase hover:bg-gold-500 transition-colors duration-500"
                                            >
                                                Subscribe Now
                                            </button>
                                        </form>

                                        <button
                                            onClick={handleClose}
                                            className="mt-6 text-[8px] tracking-[0.4em] text-white/20 hover:text-white transition-colors uppercase"
                                        >
                                            Maybe Later
                                        </button>
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-12"
                                    >
                                        <div className="w-16 h-16 rounded-full border border-gold-500/30 flex items-center justify-center mb-8 mx-auto">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 bg-gold-500 rounded-full"
                                            />
                                        </div>
                                        <h3 className="text-white text-lg tracking-[0.3em] uppercase font-serif italic mb-2">Welcome to KIKS</h3>
                                        <p className="text-gold-500 text-[9px] tracking-[0.4em] uppercase font-black mb-8">You are now part of the circle.</p>
                                        
                                        <div className="bg-white/5 border border-white/10 p-6 space-y-3">
                                            <p className="text-[8px] tracking-[0.4em] text-white/40 uppercase">Your Private Invitation Code</p>
                                            <p className="text-2xl text-white tracking-[0.5em] font-light uppercase">KIKS10</p>
                                        </div>
                                        <p className="mt-6 text-[9px] text-white/30 tracking-widest uppercase">Use at checkout for your 10% privilege</p>
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
