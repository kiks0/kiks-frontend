import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`fixed bottom-8 left-8 z-50 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <button 
        onClick={scrollToTop} 
        className="w-12 h-12 bg-dark-900/80 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-dark-900 overflow-hidden group transition-all duration-300"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} strokeWidth={1.5} className="group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
};

export default ScrollToTop;
