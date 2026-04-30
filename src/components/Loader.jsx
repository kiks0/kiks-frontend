import { useEffect, useState } from 'react';

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
    <div 
      className={`fixed inset-0 z-[9999999] bg-black flex items-center justify-center transition-all duration-[1200ms] ease-in-out ${
        isLoaded ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
      }`}
    >
      <img 
        src="/logo-kiks.webp" 
        alt="Kiks Ultra Luxury" 
        className="w-[120px] md:w-[160px] h-auto animate-luxury-fade invert"
      />
    </div>
  );
};

export default Loader;
