import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem('kiks_cookies_accepted');
        if (!hasAccepted) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
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
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-[1000]"
                >
                    <div className="bg-white border-t md:border border-black/10 p-6 md:p-10 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] md:shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden w-full">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-6 right-6 text-black hover:text-black/40 transition-all transform hover:rotate-90 duration-300 p-2 z-[30]"
                        >
                            <X size={20} strokeWidth={1.5} />
                        </button>
                        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-6 md:space-y-0 md:space-x-8 relative z-10">
                            <div className="flex-shrink-0 hidden md:block">
                                <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center bg-neutral-50 shadow-sm">
                                    <ShieldCheck className="text-black" size={24} strokeWidth={1} />
                                </div>
                            </div>
                            <div className="flex-grow w-full">
                                <h4 className="text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.4em] uppercase font-black text-black mb-3">
                                    Cookie Consent & Privacy
                                </h4>
                                <p className="text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] text-black/60 leading-relaxed uppercase font-light max-w-sm mx-auto md:mx-0">
                                    Kiks utilizes refined artisanal cookies to enhance your digital odyssey and preserve your preferences within our vault.
                                </p>

                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 sm:gap-10">
                                    <button
                                        onClick={handleAccept}
                                        className="w-full sm:w-auto bg-black text-white py-4 px-12 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black border border-black transition-all duration-500 shadow-xl"
                                    >
                                        I Accept
                                    </button>
                                    <Link
                                        to="/privacy-policy"
                                        onClick={() => setIsVisible(false)}
                                        className="text-[9px] tracking-[0.3em] uppercase text-black/40 hover:text-black border-b border-black/20 hover:border-white transition-all pb-1 whitespace-nowrap"
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
