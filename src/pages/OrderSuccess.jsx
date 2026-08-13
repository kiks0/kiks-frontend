import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Mail, Sparkles as SparklesIcon, Diamond } from 'lucide-react';
import { useEffect } from 'react';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthorized = sessionStorage.getItem(`authorized_order_${orderId}`);
        if (!isAuthorized) {
            navigate('/', { replace: true });
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [orderId, navigate]);

    return (
        <div className="bg-white min-h-screen text-black pt-48 md:pt-64 pb-40 px-6 font-sans relative overflow-hidden">
            
            {/* Cinematic Golden Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#D4AF37]/[0.08] blur-[100px] rounded-full" 
                />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
            </div>

            <motion.div 
                className="container mx-auto max-w-4xl text-center relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            >
                {/* Decorative Luxury Icon */}
                <motion.div 
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
                    className="w-24 h-24 border border-[#D4AF37]/40 rounded-full flex items-center justify-center mb-12 mx-auto relative group"
                >
                    <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20 scale-110 animate-pulse" />
                    <Diamond size={36} strokeWidth={1} className="text-[#D4AF37]" />
                    <div className="absolute inset-0 bg-[#D4AF37]/5 blur-xl group-hover:bg-[#D4AF37]/10 transition-colors rounded-full" />
                </motion.div>

                {/* Main Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1 }}
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-[0.1em] mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#AA7C11] uppercase">
                        Thank You
                    </h1>
                    <h2 className="text-xl md:text-2xl font-serif tracking-[0.2em] mb-12 leading-tight text-black/80 uppercase font-bold">
                        For Your Purchase
                    </h2>
                </motion.div>
                
                {/* The User's Specific Message */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-[11px] md:text-sm tracking-[0.5em] text-black/60 uppercase mb-20 max-w-2xl mx-auto leading-loose font-medium"
                >
                    Your masterpiece is being prepared. <br /> We look forward to welcoming you again.
                </motion.p>

                {/* Order Certificate Box */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 1.2, ease: "easeOut" }}
                    className="bg-white/80 border border-[#D4AF37]/30 p-12 md:p-24 mb-24 relative overflow-hidden backdrop-blur-md shadow-[0_0_50px_rgba(212,175,55,0.08)]"
                >
                    {/* Golden Lines & Accents */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
                    
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute inset-0 border-[20px] border-[#D4AF37]/20 m-4" />
                    </div>

                    <div className="relative z-10">
                        <span className="text-[9px] tracking-[0.6em] text-[#D4AF37] uppercase mb-8 block font-bold">Official Order Receipt</span>
                        <div className="text-3xl md:text-5xl font-serif tracking-[0.2em] text-black mb-10 drop-shadow-sm">
                            #{orderId?.toString().toUpperCase() || 'XXXX-XXXX'}
                        </div>
                        
                        <div className="w-16 h-px bg-[#D4AF37]/30 mx-auto mb-10" />
                        
                        <p className="text-[11px] tracking-[0.3em] text-black/60 uppercase leading-loose max-w-sm mx-auto mb-14 font-sans font-medium">
                            An official confirmation has been securely dispatched to your email. Our artisans are now curating your order.
                        </p>

                        <div className="flex items-center justify-center space-x-12 pt-10 border-t border-[#D4AF37]/20 text-[#D4AF37]">
                             <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center transition-all">
                                <Mail size={18} className="mb-4" strokeWidth={1} />
                                <span className="text-[7px] tracking-[0.4em] uppercase text-black/50 font-bold">Mailed</span>
                             </motion.div>
                             <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center transition-all">
                                <Globe size={18} className="mb-4" strokeWidth={1} />
                                <span className="text-[7px] tracking-[0.4em] uppercase text-black/50 font-bold">Tracking</span>
                             </motion.div>
                             <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center transition-all">
                                <SparklesIcon size={18} className="mb-4" strokeWidth={1} />
                                <span className="text-[7px] tracking-[0.4em] uppercase text-black/50 font-bold">Signature</span>
                             </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Actions */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 1 }}
                    className="space-y-16"
                >
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link to="/" className="w-full md:w-auto bg-[#D4AF37] text-white px-12 py-5 text-[10px] font-black tracking-[0.5em] uppercase hover:bg-black hover:text-white transition-all duration-500 flex items-center justify-center group shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                            Continue Journey <ArrowRight size={16} className="ml-4 transition-transform group-hover:translate-x-2" />
                        </Link>
                        <Link to="/orders" className="w-full md:w-auto border border-black/20 px-12 py-5 text-[10px] font-bold tracking-[0.5em] uppercase hover:border-black hover:bg-black hover:text-white transition-all text-black">
                            View Collection
                        </Link>
                    </div>

                    <div className="pt-16 pb-12 flex flex-col items-center">
                        <div className="w-px h-16 bg-gradient-to-b from-[#D4AF37]/30 to-transparent mb-10" />
                        <p className="text-[10px] tracking-[1em] text-black/40 uppercase font-light">Experience the Essence Eternal</p>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default OrderSuccess;
