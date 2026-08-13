import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTopReset = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Immediately reset default browser scroll without smooth animation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 2. Force Lenis smooth scroll engine to reset its internal virtual coordinates instantly
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true, force: true });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTopReset;
