import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem('kiks_cookies_accepted');
        if (!hasAccepted) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('kiks_cookies_accepted', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[1000]"
                >
                    <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-gold-500/10 transition-all duration-700" />

                        <div className="flex items-start space-x-6 relative z-10">
                            <div className="flex-shrink-0 mt-1">
                                <ShieldCheck className="text-gold-500" size={24} strokeWidth={1} />
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-[10px] tracking-[0.3em] uppercase font-black text-white mb-2 leading-relaxed">
                                    Cookie Consent & Privacy
                                </h4>
                                <p className="text-[10px] tracking-widest text-white/40 leading-loose uppercase font-light">
                                    Kiks utilizes refined artisanal cookies to enhance your digital odyssey and remember your preferences within our vault.
                                </p>

                                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                                    <button
                                        onClick={handleAccept}
                                        className="w-full sm:w-auto bg-white text-black py-3 px-8 text-[9px] font-black tracking-[0.3em] uppercase hover:bg-gold-500 transition-all duration-500"
                                    >
                                        I Accept
                                    </button>
                                    <Link
                                        to="/privacy-policy"
                                        onClick={() => setIsVisible(false)}
                                        className="text-[9px] tracking-[0.2em] uppercase text-white/30 hover:text-white underline underline-offset-4 transition-all"
                                    >
                                        Privacy Policy
                                    </Link>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-white/20 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
