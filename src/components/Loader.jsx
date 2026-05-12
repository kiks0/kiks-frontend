import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent scrollbar jumping
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setIsLoaded(true);
      document.body.style.overflow = 'unset';
    }, 1200);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] } 
          }}
          className="fixed inset-0 z-[9999999] bg-white grid place-items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
             {/* Subtle Glow */}
             <div className="absolute inset-0 bg-black/5 blur-[40px] rounded-full animate-pulse" />
             
             <img 
                src="/logo-kiks.png" 
                alt="Kiks Loading" 
                className="w-[80px] md:w-[100px] h-auto relative z-10 animate-luxury-pulse"
              />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
