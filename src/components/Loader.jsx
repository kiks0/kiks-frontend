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
      <img 
        src="/logo-kiks.webp" 
        alt="Kiks Loading" 
        className="w-[100px] md:w-[130px] h-auto relative z-10 animate-luxury-pulse"
      />
    </div>
  );
};

export default Loader;
