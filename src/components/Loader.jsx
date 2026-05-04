import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Match the user's requested 1.2s timeout before dismissing
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999999] bg-black flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
            }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
             <img 
                src="/logo-kiks.webp" 
                alt="Kiks Loading" 
                className="w-[100px] md:w-[130px] h-auto relative z-10 animate-luxury-pulse"
              />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
