import { motion, AnimatePresence } from 'framer-motion';

const ActionLoader = ({ isLoading, message = "Processing" }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999999] bg-black/90 backdrop-blur-md flex items-center justify-center"
                >
                    <div className="relative flex flex-col items-center">
                        {/* Luxury Gold Glow */}
                        <div className="absolute inset-0 bg-gold-500/20 blur-[80px] rounded-full animate-pulse" />
                        
                        <motion.img 
                            src="/logo-kiks.webp" 
                            alt="KIKS Logo" 
                            className="w-[120px] md:w-[180px] h-auto relative z-10"
                            animate={{ 
                                scale: [1, 1.05, 1],
                                opacity: [0.8, 1, 0.8]
                            }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                        />
                        
                        <div className="mt-12 flex flex-col items-center relative z-10">
                            <div className="w-16 h-[1px] bg-gold-500/30 mb-4" />
                            <p className="text-[10px] tracking-[0.6em] text-gold-500 uppercase font-black animate-pulse">
                                {message}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ActionLoader;
