import { useEffect, useState } from 'react';

const Loader = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Match the user's requested 1.2s timeout before dismissing
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[9999999] bg-black flex items-center justify-center transition-all duration-[800ms] ease-in-out ${
        isLoaded ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Subtle Glow */}
        <div className="absolute inset-0 bg-gold-500/10 blur-[40px] rounded-full animate-pulse" />
        
        <img 
            src="/logo-kiks.webp" 
            alt="Kiks Loading" 
            className="w-[100px] md:w-[130px] h-auto relative z-10 animate-luxury-pulse"
        />
        <div className="w-10 h-[1px] bg-gold-500/20 mt-8" />
        
        <div className="mt-8 flex flex-col items-center">
          <div className="w-12 h-[1px] bg-gold-500/30 mb-2" />
          <p className="text-[8px] tracking-[0.5em] text-gold-500/50 uppercase font-light">The Atelier is Preparing</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
