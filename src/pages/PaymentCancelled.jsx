import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight, ShoppingBag, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';

const PaymentCancelled = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="bg-white min-h-screen text-black pt-48 md:pt-64 pb-40 px-6 font-sans relative overflow-hidden">
            
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-red-500/[0.02] blur-[120px] rounded-full" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/10 to-transparent" />
            </div>

            <motion.div 
                className="container mx-auto max-w-4xl text-center relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            >
                {/* Decorative Icon */}
                <motion.div 
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.5 }}
                    className="w-20 h-20 border border-red-500/20 rounded-full flex items-center justify-center mb-16 mx-auto relative group"
                >
                    <XCircle size={32} strokeWidth={1} className="text-red-500" />
                    <div className="absolute inset-0 bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition-colors" />
                </motion.div>

                {/* Main Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                >
                    <h1 className="text-3xl md:text-7xl font-serif tracking-[0.1em] mb-8 leading-tight text-black uppercase">
                        Payment <span className="text-red-500">Incomplete</span>
                    </h1>
                </motion.div>
                
                {/* Status Message */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="text-[12px] md:text-sm tracking-[0.5em] text-black/60 uppercase mb-20 max-w-2xl mx-auto leading-relaxed"
                >
                    Your transaction was not completed. <br className="hidden md:block" /> No funds have been charged from your account.
                </motion.p>

                {/* Info Box */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="bg-red-500/[0.01] border border-red-500/10 p-12 md:p-20 mb-24 relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="relative z-10">
                        <span className="text-[9px] tracking-[0.6em] text-red-500/60 uppercase mb-8 block font-bold">Transaction Status: Dismissed</span>
                        
                        <p className="text-[11px] tracking-[0.3em] text-black/50 uppercase leading-loose max-w-sm mx-auto mb-12 font-sans font-medium">
                            If you encountered an issue during checkout, you can return to your cart to complete your purchase or try a different payment method.
                        </p>

                        <div className="flex items-center justify-center space-x-12 pt-8 border-t border-red-500/5 opacity-40">
                             <div className="flex flex-col items-center">
                                <ShoppingBag size={16} className="mb-3" strokeWidth={1.5} />
                                <span className="text-[7px] tracking-[0.3em] uppercase">Cart Saved</span>
                             </div>
                             <div className="flex flex-col items-center">
                                <MessageSquare size={16} className="mb-3" strokeWidth={1.5} />
                                <span className="text-[7px] tracking-[0.3em] uppercase">Support Ready</span>
                             </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Actions */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="space-y-12"
                >
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <Link to="/checkout" className="w-full md:w-auto border border-black text-black px-12 py-5 text-[11px] font-bold tracking-[0.5em] uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center group">
                            Retry Purchase <ArrowRight size={16} className="ml-4 transition-transform group-hover:translate-x-2" />
                        </Link>
                        <Link to="/" className="w-full md:w-auto border border-black/10 px-12 py-5 text-[11px] font-bold tracking-[0.5em] uppercase hover:border-black transition-all text-black">
                            Back to Home
                        </Link>
                    </div>

                    <div className="pt-16 pb-12 flex flex-col items-center">
                        <div className="w-px h-12 bg-black/10 mb-8" />
                        <p className="text-[10px] tracking-[0.8em] text-black/20 uppercase font-bold italic">Secure Luxury Shopping</p>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default PaymentCancelled;
