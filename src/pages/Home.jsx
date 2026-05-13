import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFullImageUrl } from '../utils/url';
import { Edit2, ChevronUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const isVideo = (url) => {
  if (!url) return false;
  return url.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/);
};

const Home = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [heroVideoUrl, setHeroVideoUrl] = useState('https://res.cloudinary.com/dprxiz6os/video/upload/v1778044738/hero-video_webm_vlvq4g.webm');
  const [signatureProduct, setSignatureProduct] = useState({
    image_url: 'https://res.cloudinary.com/dprxiz6os/image/upload/v1778429911/kiks_general/kiks-1778429909414-168768629_meinpk.png',
    name: 'Elite',
    description: 'Handcrafted with rare ingredients to define your signature presence.',
    strength: 'Extrait de Parfum',
    notes: 'Aoud, Midnight Spices, Rare Woods',
    link: '/collection/arambh/elite'
  });
  const [galleryImages, setGalleryImages] = useState([]);

  // High-Performance Mobile Stabilization
  useEffect(() => {
    ScrollTrigger.config({ 
      ignoreMobileResize: false,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize,scroll" 
    });
  }, []);

  // Animations logic (Keeping GSAP/ScrollTrigger as they are part of the original design)
  useEffect(() => {
    // Reveal animations...
  }, []);

  const [showcaseProducts, setShowcaseProducts] = useState([
    { id: 'elite', name: 'Elite', description: 'A powerful blend of rare woods and midnight spices, designed for the individual who commands presence without speaking a word.', image_url: '/elite1.webp', product_link: '/collection/arambh/elite' },
    { id: 'la-reina', name: 'La Reina', description: 'An opulent symphony of velvet roses and golden amber. La Reina is the essence of timeless femininity and unyielding grace.', image_url: '/la-reina.jpeg', product_link: '/collection/arambh/la-reina' },
    { id: 'el-rey', name: 'El Rey', description: 'Bold leather notes intertwined with aged tobacco and citrus undertones. El Rey is a fragrance of conquest and enduring legacy.', image_url: '/el-rey.jpeg', product_link: '/collection/arambh/el-rey' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const [showcaseRes, settingsRes, galleryRes] = await Promise.all([
          fetch(`${apiUrl}/api/marketing/showcase`),
          fetch(`${apiUrl}/api/settings`),
          fetch(`${apiUrl}/api/marketing/gallery`)
        ]);

        if (showcaseRes.ok) {
          const data = await showcaseRes.json();
          if (data && data.length > 0) setShowcaseProducts(data);
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data) {
            if (data.hero_video_url) setHeroVideoUrl(data.hero_video_url);
            setSignatureProduct({
              image_url: data.signature_product_image_url || '',
              name: data.signature_product_name || '',
              description: data.signature_product_desc || '',
              strength: data.signature_product_strength || '',
              notes: data.signature_product_notes || '',
              link: data.signature_product_link || ''
            });
          }
        }

        if (galleryRes.ok) {
          const data = await galleryRes.json();
          setGalleryImages(data);
        }
      } catch (err) {
        console.error("Consolidated fetch failed:", err);
      }
    };
    fetchData();
  }, []);

  // Parallax Scroll Hooks For "The Art of Creation" Section
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  // Animations tied directly to scroll progress
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1.2]);

  const opacityText = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]);
  const opacityHint = useTransform(scrollYProgress, [0.4, 0.5, 0.6], [0, 1, 0]);

  const yTextFast = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const yTextSlow = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const carouselRef = useRef(null);
  const storyRef = useRef(null);
  const storyTextRef = useRef(null);
  const storyImgRef = useRef(null);
  const showcaseContainerRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroDescRef = useRef(null);
  const heroSectionRef = useRef(null);

  useEffect(() => {
    if (!storyRef.current || !storyTextRef.current) return;

    const ctx = gsap.context(() => {
      const spans = storyTextRef.current.querySelectorAll(".reveal-word");

      // IMPORTANT:
      // kill existing animations only for this section
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === storyRef.current) {
          trigger.kill();
        }
      });

      // Initial state
      gsap.set(spans, {
        opacity: 0,
        y: 80,
        rotateX: 20,
        transformOrigin: "top center",
        force3D: true,
      });

      // Reveal animation
      gsap.to(spans, {
        opacity: 1,
        y: 0,
        rotateX: 0,

        stagger: 0.06,
        duration: 1.2,

        ease: "power4.out",

        scrollTrigger: {
          trigger: storyRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });

      // Background image animation
      if (storyImgRef.current) {
        gsap.to(storyImgRef.current, {
          scale: 1.12,
          ease: "none",

          scrollTrigger: {
            trigger: storyRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      ScrollTrigger.refresh();
    }, storyRef);

    return () => ctx.revert();
  }, [t]);

  // New Perfume Showcase Logic (GSAP Sticky Reveal)
  useEffect(() => {
    if (!showcaseContainerRef.current) return;
    
    const mm = gsap.matchMedia();

    // Desktop: Side-by-Side Split
    mm.add('(min-width: 768px)', () => {
      const photos = gsap.utils.toArray('.showcasePhoto:not(:first-child)');
      const sections = gsap.utils.toArray('.showcaseContentSection:not(:first-child)');

      if (photos.length === 0) return;

      // Set initial state for photos (reveal from bottom)
      gsap.set(photos, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 0 });

      sections.forEach((section, index) => {
        if (!photos[index]) return;
        
        const headline = section.querySelector('.showcaseReveal');

        // Image Reveal Timeline
        const animation = gsap.timeline()
          .to(photos[index], {
            clipPath: 'inset(0% 0% 0% 0%)',
            autoAlpha: 1,
            duration: 2,
            ease: "none"
          });

        ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          animation: animation,
          scrub: 1.2,
        });

        // Text Stagger Reveal
        if (headline && headline.children.length > 0) {
          gsap.from(headline.children, {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "top 40%",
              scrub: 1
            }
          });
        }
      });

      // Pin the showcase gallery
      ScrollTrigger.create({
        trigger: showcaseContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.showcaseRight',
        pinSpacing: false,
      });
    });

    mm.add("(max-width: 767px)", () => {
      const container = showcaseContainerRef.current;
      const wrapper = container?.querySelector(".mobileSlideshowWrapper");
      const slides = gsap.utils.toArray(container?.querySelectorAll(".mobileSlide"));

      if (!container || !wrapper || slides.length === 0) return;

      gsap.set(slides, {
        autoAlpha: 0,
        scale: 0.95,
      });

      gsap.set(slides[0], {
        autoAlpha: 1,
        scale: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          pin: wrapper,
          pinSpacing: true, // PREVENT OVERLAP
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      slides.forEach((slide, index) => {
        if (index === 0) return;

        // Crossfade: Previous slide fades out while current fades in
        tl.to(slides[index-1], {
            autoAlpha: 0,
            scale: 0.9,
            duration: 0.5,
            ease: "power2.inOut"
        }, index - 0.2)
        .to(slide, {
            autoAlpha: 1,
            scale: 1,
            duration: 1,
            ease: "power2.inOut"
        }, index - 0.1);
      });

      return () => {
        tl.kill();
      };
    });

    // Robust Refresh Protocol: Ensure ScrollTrigger is perfectly synced after images load
    const refreshTimer = setTimeout(() => {
        // Refresh only if we're not in the middle of a reveal
        ScrollTrigger.refresh();
        console.log("[GSAP] ScrollTrigger Synchronized.");
    }, 2000);

    return () => {
      clearTimeout(refreshTimer);
      mm.revert();
    };
  }, [showcaseProducts]);

  // Handle Scroll Stability on Refresh without breaking GSAP Reveal
  useEffect(() => {
    // Only clear memory on the very first mount
    ScrollTrigger.clearScrollMemory();
  }, []);

  const { scrollYProgress: carouselProgress } = useScroll({
    target: carouselRef,
  });
  const xTranslate = useTransform(carouselProgress, [0, 1], ["0%", "-66.666%"]);

  // Hero Scroll Animation with GSAP
  useEffect(() => {
    if (!heroTitleRef.current || !heroDescRef.current || !heroSectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: "top top",
          end: "+=100%",
          scrub: 1.5,
          pin: true,
          invalidateOnRefresh: true,
        }
      });

      tl.to(heroTitleRef.current, {
        scale: 2.5,
        opacity: 0,
        y: -150,
        ease: "power2.inOut"
      }, 0);

      tl.to(heroDescRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 100,
        ease: "power2.inOut"
      }, 0);
    });

    return () => ctx.revert();
  }, []);

  const { scrollY } = useScroll();

  return (
    <div className="bg-white min-h-screen text-black relative">
      <SEO
        title="KIKS Luxury Perfumes"
        description="High quality perfumes handcrafted with rare ingredients. Explore our exclusive collection of Extrait de Parfum."
        keywords="Luxury Perfume, Extrait de Parfum, KIKS, Premium Fragrance, Elite Collection"
      />


      {/* Hero Section */}
      <section ref={heroSectionRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-x-4 bottom-4 top-[100px] sm:inset-x-6 sm:bottom-6 sm:top-[120px] md:inset-x-10 md:bottom-10 md:top-[180px] border border-transparent z-30 pointer-events-none" />

        {/* Video Background */}
        <div className="absolute inset-0 z-0 group">
          <video
            key={heroVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center scale-100 opacity-100 will-change-transform"
          >
            <source src={heroVideoUrl.startsWith('http') || heroVideoUrl.startsWith('/assets') ? heroVideoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${heroVideoUrl}`} />
          </video>
          {/* Subtle Overlay to make text readable */}
          <div className="absolute inset-0 bg-black/20 z-[1]" />
        </div>

        {/* Text Overlay Content */}
        <div className="relative z-20 text-center px-6">
          <div className="flex flex-col items-center">
            <div ref={heroTitleRef} className="will-change-transform">
              <h1 className="text-5xl md:text-8xl font-serif tracking-[0.2em] text-white uppercase mb-8">
                {['K', 'I', 'K', 'S'].map((char, index) => (
                  <motion.span 
                    key={index} 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 1.2, 
                      delay: index * 0.15, 
                      ease: [0.215, 0.61, 0.355, 1] 
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
            </div>
              
            <div ref={heroDescRef} className="max-w-2xl">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1.2 }}
                className="text-[11px] md:text-base tracking-[0.2em] text-white/90 uppercase font-light leading-relaxed"
              >
                Handcrafted with rare ingredients to define your signature presence.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Product 1: SIGNATURE SHOWCASE */}
      {signatureProduct.name && (
      <section className="relative pt-16 pb-8 md:py-16 overflow-hidden bg-white">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-black/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-[1400px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12 lg:gap-24">

            {/* Mobile Header: Name on Top */}
            <div className="md:hidden text-center mb-6">
              <h2 className="text-5xl font-serif font-light tracking-[0.15em] leading-none text-black uppercase">
                {signatureProduct.name}
              </h2>
            </div>

            {/* Visual Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.2 }}
              className="w-full md:w-[48%] relative group"
            >
              {/* Desktop Only Frame */}
              <div className="hidden md:block absolute -inset-4 border border-black/5 pointer-events-none group-hover:border-black/10 transition-colors duration-1000" />
              
              <Link to={signatureProduct.link || "#"} className="relative block overflow-hidden rounded-sm md:bg-[#f9f9f9] md:border md:border-black/5 md:p-4">
                {isVideo(signatureProduct.image_url) ? (
                  <video
                    src={getFullImageUrl(signatureProduct.image_url)}
                    className="w-full h-auto object-cover md:object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={signatureProduct.image_url ? getFullImageUrl(signatureProduct.image_url) : "https://res.cloudinary.com/dprxiz6os/image/upload/v1778050809/IMG-20260506-WA0002.jpg_cqlvdx.webp"}
                    alt={signatureProduct.name}
                    fetchpriority="high"
                    width="800"
                    height="1000"
                    decoding="async"
                    style={{ willChange: 'transform' }}
                    className="w-full h-auto object-cover md:object-contain transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                  />
                )}
              </Link>
            </motion.div>

            {/* Narrative Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true, amount: 0.2 }}
              className="w-full md:w-[45%] flex flex-col items-center md:items-start justify-center text-center md:text-left relative"
            >
              {/* Large Background Ghost Text (Desktop Only) */}
              <div className="absolute -top-20 -left-10 text-[12rem] font-serif font-black text-black/[0.02] pointer-events-none select-none hidden lg:block uppercase tracking-tighter leading-none">
                {signatureProduct.name}
              </div>

              <div className="relative z-10 space-y-4 md:space-y-6 w-full mt-8 md:mt-0">
                {/* Header (Desktop Only) */}
                <div className="hidden md:block space-y-4">
                  <h2 className="text-5xl md:text-[5.5rem] font-serif font-light tracking-[0.15em] leading-none text-black uppercase">
                    {signatureProduct.name}
                  </h2>
                </div>

                {/* Description Block */}
                <div className="space-y-4 md:space-y-5 max-w-lg mx-auto md:mx-0">
                  <div className="space-y-2">
                    {signatureProduct.strength && (
                      <p className="text-[10px] md:text-xs tracking-[0.4em] text-black/40 uppercase font-black">
                        {signatureProduct.strength}
                      </p>
                    )}
                    {signatureProduct.description && (
                      <p className="text-[11px] md:text-base text-black leading-relaxed tracking-widest font-normal opacity-90">
                        {signatureProduct.description}
                      </p>
                    )}
                  </div>

                  {signatureProduct.link && (
                    <Link to={signatureProduct.link} className="inline-block group/link">
                      <span className="text-[10px] tracking-[0.4em] text-black uppercase font-bold border-b border-black/20 pb-1 group-hover/link:border-black transition-colors">
                        SHOP NOW
                      </span>
                    </Link>
                  )}

                  {(signatureProduct.notes) && (
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-black/5 mt-8">
                      <div>
                        <p className="text-[8px] tracking-[0.3em] uppercase text-black/40 font-bold mb-1">STRENGTH</p>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-black font-medium">{signatureProduct.strength || 'STRONG & RICH'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] tracking-[0.3em] uppercase text-black/40 font-bold mb-1">MAIN NOTES</p>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-black font-medium">{signatureProduct.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
      )}

      {/* SECTION 3: THE LUXURY SHOWCASE (GSAP STICKY REVEAL) */}
      <section ref={showcaseContainerRef} className="relative bg-white border-t border-black/5 overflow-hidden h-[300vh] md:h-auto">
        <div className="flex flex-col md:flex-row h-full">

          {/* Mobile View: Full-Screen Sticky Slideshow */}
          <div className="md:hidden mobileSlideshowWrapper h-screen w-full overflow-hidden">
            {showcaseProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="mobileSlide absolute inset-0 flex flex-col items-center justify-center px-8 py-10 bg-white"
                style={{ zIndex: 10 + index }}
              >
                {/* Name on Top */}
                <div className="text-center mb-6 w-full">
                  <h2 className="text-2xl font-serif text-black tracking-[0.1em] uppercase">{product.name}</h2>
                </div>

                {/* Image in Middle */}
                <div className="relative group w-full max-w-[200px] aspect-[3/4] mb-6">
                  <div className="absolute inset-0 bg-black/5 blur-3xl rounded-full opacity-30" />
                  <Link to={product.product_link || '#'} className="relative block w-full h-full bg-[#fcfcfc] border border-black/10 overflow-hidden aspect-[3/4]">
                    <img 
                      src={getFullImageUrl(product.image_url)} 
                      alt={product.name} 
                      loading="lazy"
                      width="300"
                      height="400"
                      decoding="async"
                      className="w-full h-full object-contain p-6" 
                    />
                  </Link>
                </div>

                {/* Description at Bottom */}
                <div className="max-w-[260px] text-center w-full">
                  <p className="text-[10px] text-black/70 leading-relaxed tracking-[0.12em] font-medium text-center italic mb-6 uppercase">{product.description}</p>
                  <Link
                    to={product.product_link || '#'}
                    className="inline-block text-[9px] text-black tracking-[0.3em] uppercase font-bold border-b border-black/30 pb-1 hover:border-black transition-colors"
                  >
                    Discover The Scent
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Side-by-Side Split */}
          <div className="hidden md:block showcaseContent w-1/2">
            {showcaseProducts.map((content, index) => (
              <div
                key={index}
                className="showcaseContentSection min-h-screen flex items-center justify-center p-4 md:p-12"
              >
                <div className="showcaseReveal max-w-lg w-full">
                  <h2 className="text-2xl md:text-5xl font-serif text-black tracking-[0.05em] mb-4 md:mb-6 leading-tight uppercase">
                    {content.name}
                  </h2>
                  <p className="text-[10px] md:text-sm text-black/70 leading-[1.6] md:leading-[2] tracking-widest font-medium">
                    {content.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:flex showcaseRight w-1/2 h-screen sticky top-0 items-center justify-center overflow-hidden border-l border-black/5">
            <div className="relative w-full h-full">
              {showcaseProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  className="showcasePhoto absolute inset-0 flex items-center justify-center p-2 md:p-8 lg:p-12"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <Link to={product.product_link || '#'} className="relative block w-full h-full bg-[#fcfcfc] border border-black/10 overflow-hidden group aspect-[3/4]">
                    <img
                      src={getFullImageUrl(product.image_url)}
                      alt={product.name}
                      loading="lazy"
                      width="600"
                      height="800"
                      decoding="async"
                      className="w-full h-full object-contain p-4 md:p-16"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Parallax Story Section with GSAP */}
      <section ref={storyRef} className="relative py-16 md:h-screen bg-[#f9f9f9] overflow-hidden">
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto flex flex-col items-center w-full">
            <span className="text-black text-[10px] tracking-[0.6em] uppercase font-black block mb-6">OUR PROCESS</span>

            <div className="overflow-hidden mb-8 w-full text-center">
              <h2
                ref={storyTextRef}
                className="text-3xl md:text-6xl lg:text-7xl font-serif text-white tracking-[0.1em] leading-[1.3] md:leading-[1.2] uppercase font-light text-center"
              >
                {t('home.symphony_notes')
                  .split(' ')
                  .map((word, index) => (
                    <span
                      key={index}
                      className="reveal-word inline-block will-change-transform mr-[0.25em]"
                    >
                      {word}
                    </span>
                  ))}
              </h2>
            </div>

            <p className="text-black/70 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto tracking-widest font-light">
              {t('home.creation_desc')}
            </p>
          </div>

          {/* Floating Secondary Image (Muse) */}
          <div className="floating-muse absolute right-[10%] top-[20%] w-32 md:w-48 aspect-[3/4] z-30 hidden md:block border border-black/10 shadow-2xl overflow-hidden group">
            <img
              src="/alchemy.webp"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover brightness-90 transition-all duration-1000"
              alt="Muse"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: THE EDITORIAL REVEAL (INTERACTIVE & LAYERED) */}
      <section className="relative min-h-screen bg-white overflow-hidden py-8 md:py-24 px-6 md:px-20 lg:px-32 flex flex-col justify-center">

        {/* Mouse Follow Glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-30"
          style={{
            background: 'radial-gradient(600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.15), transparent 80%)'
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left Column: The Visual Muse */}
          <div className="lg:col-span-5 relative group">
            <Link
              to="/collection/arambh"
              className="relative block aspect-[3/4] overflow-hidden border border-black/10 p-2 bg-black/[0.02]"
            >
              <img
                src="https://res.cloudinary.com/dprxiz6os/image/upload/v1778429911/kiks_general/kiks-1778429909414-168768629_meinpk.png"
                loading="lazy"
                width="600"
                height="800"
                decoding="async"
                className="w-full h-full object-cover transition-all duration-[2000ms] smooth-render"
                alt="Alchemy Muse"
              />
              <div className="absolute inset-0 border border-gold-500/20 m-4 pointer-events-none" />
            </Link>

            {/* Floating Label */}

          </div>

          {/* Right Column: The Composition */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 md:space-y-16 lg:pl-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-6"
            >

              <h2 className="text-4xl md:text-6xl font-serif font-light text-black tracking-widest leading-tight mb-8">
                OUR STORY
              </h2>
              <p className="text-black/60 text-[10px] tracking-[0.3em] uppercase font-bold mb-4 md:mb-12">
                QUALITY & TRADITION
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.6 }}
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
            >
              <div className="space-y-4">
                <p className="text-[10px] tracking-[0.4em] uppercase text-black font-black">{t('home.pure_sourcing_label')}</p>
                <p className="text-[11px] md:text-sm text-black leading-relaxed tracking-widest font-normal opacity-90">
                  {t('home.pure_sourcing_desc')}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] tracking-[0.4em] uppercase text-black font-black">{t('home.refined_alchemy_label')}</p>
                <p className="text-[11px] md:text-sm text-black leading-relaxed tracking-widest font-normal opacity-90">
                  {t('home.refined_alchemy_desc')}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              viewport={{ once: true, amount: 0.2 }}
              className="pt-4 flex justify-center lg:justify-start w-full"
            >
              <Link to="/collection/arambh" className="inline-block group/link">
                <span className="text-[10px] tracking-[0.3em] text-black uppercase font-black border-b border-black/20 pb-1 group-hover/link:border-black transition-all duration-500">
                  {t('home.explore_collection')}
                </span>
              </Link>
            </motion.div>
          </div>

        </div>

        {/* Social Proof: The Community Gallery (Tight Masonry Grid) */}
        <section className="pt-12 pb-8 md:pt-20 md:pb-12 border-t border-black/5 bg-white">
          <div className="container mx-auto px-6 max-w-[1400px]">
            <div className="text-center mb-10 md:mb-16">
                <h2 className="text-4xl md:text-6xl font-serif font-light text-black tracking-[0.2em] leading-tight mb-8 uppercase">
                  {t('home.house_kiks')}
                </h2>
                <p className="text-black/70 text-sm md:text-base leading-relaxed max-w-2xl mx-auto tracking-widest font-light">
                  Our community around the world.
                </p>
            </div>

            <div className="columns-2 md:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
              {galleryImages.length > 0 ? galleryImages.map((img, idx) => (
                <motion.div
                  key={img.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: (idx % 4) * 0.1 }}
                  className="relative group overflow-hidden break-inside-avoid"
                >
                  <img 
                    src={getFullImageUrl(img.image_url)} 
                    loading="lazy" 
                    decoding="async" 
                    className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" 
                    alt={`Lifestyle ${idx + 1}`} 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </motion.div>
              )) : (
                // Fallback Masonry Skeleton
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-neutral-50 border border-black/5 animate-pulse break-inside-avoid mb-4" />
                ))
              )}
            </div>
          </div>
        </section>


      </section>

    </div>
  );
};

export default Home;
