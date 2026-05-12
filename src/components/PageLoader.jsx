import { motion } from 'framer-motion';

const PageLoader = ({ fullScreen = false }) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-[1000000] flex items-center justify-center bg-white"
        : "min-h-[40vh] md:min-h-[60vh] w-full grid place-items-center bg-white";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
                opacity: 0,
                transition: { duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }
            }}
            className={containerClasses}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative flex flex-col items-center"
            >
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-black/5 blur-[40px] rounded-full animate-pulse" />

                <img
                    src="/logo-kiks.png"
                    alt="Kiks Loading"
                    className="w-[70px] md:w-[90px] h-auto relative z-10 animate-luxury-pulse"
                />
            </motion.div>
        </motion.div>
    );
};

export default PageLoader;
