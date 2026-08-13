import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem('cookies_accepted');
        if (!hasAccepted) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookies_accepted', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-[1000]"
                >
                    <div className="bg-white border-t border-black/10 px-6 py-5 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] md:shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden w-full">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 text-black/60 hover:text-black transition-all transform hover:rotate-90 duration-300 p-2 z-[30]"
                        >
                            <X size={18} strokeWidth={1.5} />
                        </button>
                        <div className="flex flex-col md:flex-row items-start text-left space-y-3 md:space-y-0 md:space-x-6 relative z-10 pr-6 md:pr-0">
                            <div className="flex-shrink-0 hidden md:block">
                                <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center bg-neutral-50 shadow-sm">
                                    <ShieldCheck className="text-black" size={20} strokeWidth={1} />
                                </div>
                            </div>
                            <div className="flex-grow w-full">
                                <h4 className="text-[11px] md:text-[12px] tracking-[0.25em] md:tracking-[0.3em] uppercase font-bold text-black mb-1.5">
                                    Cookie Consent & Privacy
                                </h4>
                                <p className="text-[10px] md:text-[11px] tracking-wider text-black/70 leading-relaxed font-light max-w-lg mb-4">
                                    Kiks utilizes refined artisanal cookies to enhance your digital odyssey and preserve your preferences within our vault.
                                </p>

                                <div className="flex flex-row items-center justify-start gap-6 pt-1">
                                    <button
                                        onClick={handleAccept}
                                        className="bg-black text-white py-3 px-8 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white hover:text-black border border-black transition-all duration-500 shadow-lg shrink-0"
                                    >
                                        I Accept
                                    </button>
                                    <Link
                                        to="/privacy-policy"
                                        onClick={() => setIsVisible(false)}
                                        className="text-[10px] tracking-[0.2em] uppercase text-black/60 hover:text-black border-b border-black/30 hover:border-black transition-all pb-0.5 whitespace-nowrap font-medium"
                                    >
                                        Privacy Policy
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
