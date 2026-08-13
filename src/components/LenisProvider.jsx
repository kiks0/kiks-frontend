import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LenisProvider = ({ children }) => {
  useEffect(() => {
    // 1. Set scrollRestoration to manual to forbid the browser from making clumsy, jumpy adjustments during React hydration and GSAP animation setup
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Capture exact pixel scroll coordinates upon reload
    const savedScrollY = window.scrollY || document.documentElement.scrollTop;

    // 2. Initialize Lenis with luxurious, ultra-smooth settings
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    window.lenis = lenis;

    // Keep GSAP ScrollTrigger in perfect synchronization with Lenis scrolling
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis's requestAnimationFrame directly into GSAP's ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable GSAP's lag smoothing to prevent stuttering reflows
    gsap.ticker.lagSmoothing(0);

    // 3. Precision Scroll Lock: Instantly place the user at their exact previous scroll position without animation or drifting into the footer
    if (savedScrollY > 0) {
      requestAnimationFrame(() => {
        lenis.scrollTo(savedScrollY, { immediate: true });
      });
    }

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      window.lenis = null;
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return <>{children}</>;
};

export default LenisProvider;
