import { motion } from 'framer-motion';

const PageLoader = () => {
    return (
        <div className="min-h-[60vh] w-full flex items-center justify-center bg-black">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative flex flex-col items-center"
            >
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-gold-500/10 blur-[40px] rounded-full animate-pulse" />
                
                <img 
                    src="/logo-kiks.webp" 
                    alt="Kiks Loading" 
                    className="w-[100px] md:w-[130px] h-auto relative z-10 animate-luxury-pulse"
                />
            </motion.div>
        </div>
    );
};

export default PageLoader;
