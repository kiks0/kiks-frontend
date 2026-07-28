import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LenisProvider = ({ children }) => {
  useEffect(() => {
    // Initialize Lenis with luxurious, slow, and smooth settings
    const lenis = new Lenis({
      duration: 1.8, // Slower duration for a heavier, premium feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Buttery smooth easing
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Keep GSAP ScrollTrigger in perfect sync with Lenis scrolling
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis's requestAnimationFrame to GSAP's ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable GSAP's lag smoothing to prevent stuttering
    gsap.ticker.lagSmoothing(0);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return <>{children}</>;
};

export default LenisProvider;
