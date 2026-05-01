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

const Home = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Animations logic (Keeping GSAP/ScrollTrigger as they are part of the original design)
  useEffect(() => {
    // Reveal animations...
  }, []);

  const showcaseProducts = [
    { id: 'elite', name: 'Elite', desc: 'A powerful blend of rare woods and midnight spices, designed for the individual who commands presence without speaking a word.', image: '/elite1.webp', key: '1' },
    { id: 'la-reina', name: 'La Reina', desc: 'An opulent symphony of velvet roses and golden amber. La Reina is the essence of timeless femininity and unyielding grace.', image: '/la-reina.jpeg', key: '2' },
    { id: 'el-rey', name: 'El Rey', desc: 'Bold leather notes intertwined with aged tobacco and citrus undertones. El Rey is a fragrance of conquest and enduring legacy.', image: '/el-rey.jpeg', key: '3' }
  ];

  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketing/gallery`);
        const data = await res.json();
        setGalleryImages(data);
      } catch (err) {
        console.error("Gallery fetch failed:", err);
      }
    };
    fetchGallery();
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

  useEffect(() => {
    if (!storyRef.current || !storyTextRef.current) return;

    const mm = gsap.matchMedia();

    mm.add({
      // Desktop
      isDesktop: "(min-width: 800px)",
      // Mobile
      isMobile: "(max-width: 799px)"
    }, (context) => {
      const { isMobile } = context.conditions;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: storyRef.current,
          start: "top top",
          end: isMobile ? "+=100%" : "+=200%",
          scrub: isMobile ? 0.5 : 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // Background Image Zoom (Blur disabled on mobile for performance)
      tl.to(storyImgRef.current, {
        scale: isMobile ? 1.15 : 1.3,
        filter: isMobile ? "brightness(0.4)" : "blur(4px) brightness(0.4)",
        duration: 1
      }, 0);

      // Text Reveal
      const currentText = storyTextRef.current.innerText || "";
      const words = currentText.split(' ');
      storyTextRef.current.innerHTML = words.map(word => `<span class="inline-block opacity-0 translate-y-10" style="margin-right: 0.25em; will-change: transform, opacity;">${word}</span>`).join(' ');

      tl.to(storyTextRef.current.querySelectorAll('span'), {
        opacity: 1,
        y: 0,
        stagger: isMobile ? 0.05 : 0.1,
        duration: 0.8,
        ease: "power2.out"
      }, 0.2);

      // Floating Muse Portrait (Simplified on mobile)
      if (!isMobile) {
        tl.from(".floating-muse", {
          x: 100,
          opacity: 0,
          duration: 1.5,
          ease: "power3.out"
        }, 0.3);
      } else {
        gsap.set(".floating-muse", { display: "none" });
      }
    });

    return () => mm.revert();
  }, []);

  // New Perfume Showcase Logic (GSAP Sticky Reveal)
  useEffect(() => {
    const mm = gsap.matchMedia();

    // Desktop: Side-by-Side Split
    mm.add('(min-width: 768px)', () => {
      const photos = gsap.utils.toArray('.showcasePhoto:not(:first-child)');
      const sections = gsap.utils.toArray('.showcaseContentSection:not(:first-child)');

      // Set initial state for photos (reveal from bottom)
      gsap.set(photos, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 1 });

      sections.forEach((section, index) => {
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
        if (headline) {
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
      const wrapper = container.querySelector(".mobileSlideshowWrapper");
      const slides = gsap.utils.toArray(container.querySelectorAll(".mobileSlide"));

      if (!container || !wrapper || slides.length === 0) return;

      gsap.set(slides, {
        opacity: 0,
        scale: 0.95,
      });

      gsap.set(slides[0], {
        opacity: 1,
        scale: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          pin: wrapper,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      slides.forEach((slide, index) => {
        if (index === 0) return;

        tl.to(
          slide,
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.inOut",
          },
          index
        );
      });

      return () => {
        tl.kill();
      };
    });

    return () => mm.revert();
  }, []);

  const { scrollYProgress: carouselProgress } = useScroll({
    target: carouselRef,
  });
  const xTranslate = useTransform(carouselProgress, [0, 1], ["0%", "-66.666%"]);

  // Hero Text Scroll Animations (Vanishing in Center)
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 350], [1, 3]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="bg-dark-900 min-h-screen text-white relative">
      <SEO
        title="The Essence of Elegance"
        description="KIKS Ultra Luxury: A symphony of rare notes and artisanal craftsmanship. Explore our exclusive collection of Extrait de Parfum."
        keywords="Luxury Perfume, Extrait de Parfum, KIKS, Premium Fragrance, Elite Collection"
      />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        <div className="absolute inset-x-4 bottom-4 top-[100px] sm:inset-x-6 sm:bottom-6 sm:top-[120px] md:inset-x-10 md:bottom-10 md:top-[180px] border border-white/10 z-30 pointer-events-none" />

        {/* Video Background */}
        <div className="absolute inset-0 z-0 group">
          <div className="absolute inset-0 bg-dark-900/50 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-transparent to-dark-900 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-125"
          >
            <source src="/hero-video.webm" type="video/webm" />
          </video>
        </div>

        {/* Ambient Subtle Glow */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gold-500/5 blur-[120px] rounded-full mix-blend-screen opacity-20" />
        </div>

        <div className="absolute top-1/2 left-4 md:left-12 z-30 hidden md:block transform -translate-y-1/2">
          <p className="text-[9px] tracking-[0.4em] font-light text-white/50 uppercase transform -rotate-90 origin-center whitespace-nowrap">{t('home.exclusive_parfums')}</p>
        </div>
        <div className="absolute bottom-12 right-12 md:bottom-16 md:right-16 z-30 hidden md:block">
          <p className="text-[9px] tracking-[0.4em] font-light text-white/50 uppercase">{t('home.elite_title')}</p>
        </div>

        {/* Main Center Content */}
        <div className="relative z-20 text-center px-6 w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full pt-[10vh] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              scale: heroScale,
              opacity: heroOpacity
            }}
          >
            <h1 className="text-6xl md:text-[140px] font-serif text-white tracking-[0.25em] uppercase leading-none will-change-transform">
              KIKS
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Product 1: ELITE */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-gold-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-[1400px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-32">

            {/* Left: Image with Decorative Frame */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="w-full md:w-[45%] relative group"
            >
              <div className="absolute -inset-4 border border-white/5 pointer-events-none group-hover:border-gold-500/20 transition-colors duration-1000" />
              <div className="relative block overflow-hidden rounded-sm bg-[#0a0a0a] border border-white/5 p-4 md:p-8">
                <img
                  src="/elite1.webp"
                  alt="Elite"
                  className="w-full h-auto object-contain transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              </div>
            </motion.div>

            {/* Right: Rich Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                viewport={{ once: true }}
                className="w-full md:w-[50%] flex flex-col items-center md:items-start justify-center text-center md:text-left relative"
              >
                {/* Large Background Ghost Text */}
                <div className="absolute -top-20 -left-10 text-[12rem] font-serif font-black text-white/[0.02] pointer-events-none select-none hidden lg:block uppercase tracking-tighter leading-none">
                  ELITE
                </div>

                <div className="relative z-10 space-y-10 w-full">
                  {/* Header */}
                  <div className="space-y-4">
                    <h2 className="text-5xl md:text-[5.5rem] font-serif font-light tracking-[0.15em] leading-none text-white uppercase">
                      ELITE
                    </h2>
                  </div>

                {/* Description Block */}
                <div className="space-y-6 max-w-lg">
                  <p className="text-gold-500/80 text-[11px] tracking-[0.4em] uppercase font-bold">Extrait de Parfum</p>
                  <p className="text-sm md:text-base text-gray-400 leading-loose tracking-widest font-light italic opacity-80">
                    "A daring fusion of rare agarwood and subtle saffron, crafted for those who define their own path."
                  </p>
                </div>

                {/* Olfactory Composition Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-12 border-y border-white/10 py-10 w-full max-w-md">
                  <div className="space-y-2">
                    <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Intensity</span>
                    <p className="text-[11px] text-white tracking-[0.2em] uppercase font-medium">DEEP / RESINOUS</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Key Notes</span>
                    <p className="text-[11px] text-white tracking-[0.2em] uppercase font-medium">OUD, SAFFRON</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Projection</span>
                    <p className="text-[11px] text-white tracking-[0.2em] uppercase font-medium">HIGH / ENVELOPING</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Duration</span>
                    <p className="text-[11px] text-white tracking-[0.2em] uppercase font-medium">12+ HOURS</p>
                  </div>
                </div>

                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION 3: THE LUXURY SHOWCASE (GSAP STICKY REVEAL) */}
      <section ref={showcaseContainerRef} className="relative bg-[#050505] border-t border-white/5 overflow-hidden h-[300vh] md:h-auto">
        <div className="flex flex-col md:flex-row h-full">

          {/* Mobile View: Full-Screen Sticky Slideshow */}
          <div className="md:hidden mobileSlideshowWrapper h-screen w-full overflow-hidden">
            {showcaseProducts.map((product, index) => (
              <div
                key={product.id}
                className="mobileSlide absolute inset-0 flex flex-col items-center justify-center px-8 py-10 bg-[#050505]"
                style={{ zIndex: 10 + index }}
              >
                {/* Name on Top */}
                <div className="text-center mb-6 w-full">
                  <span className="text-gold-500 text-[8px] tracking-[0.5em] uppercase font-bold block mb-2">Collection</span>
                  <h2 className="text-2xl font-serif text-white tracking-[0.1em] uppercase">{product.name}</h2>
                </div>

                {/* Image in Middle */}
                <div className="relative group w-full max-w-[200px] aspect-[3/4] mb-6">
                  <div className="absolute inset-0 bg-gold-500/5 blur-3xl rounded-full opacity-30" />
                  <div className="relative block w-full h-full bg-[#0d0d0d] border border-white/10 overflow-hidden">
                    <img src={getFullImageUrl(product.image)} alt={product.name} className="w-full h-full object-contain p-6" />
                  </div>
                </div>

                {/* Description at Bottom */}
                <div className="max-w-[260px] text-center w-full">
                  <p className="text-[10px] text-gray-400 leading-relaxed tracking-[0.12em] font-medium text-center italic mb-6 uppercase">{product.desc}</p>
                  <Link
                    to={`/collection/arambh/${product.id}`}
                    className="inline-block text-[9px] text-gold-500 tracking-[0.3em] uppercase font-bold border-b border-gold-500/30 pb-1 hover:border-gold-500 transition-colors"
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
                  <h2 className="text-2xl md:text-5xl font-serif text-white tracking-[0.05em] mb-4 md:mb-6 leading-tight uppercase">
                    {content.name}
                  </h2>
                  <p className="text-[10px] md:text-sm text-gray-400 leading-[1.6] md:leading-[2] tracking-widest font-medium">
                    {content.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:flex showcaseRight w-1/2 h-screen sticky top-0 items-center justify-center overflow-hidden border-l border-white/5">
            <div className="relative w-full h-full">
              {showcaseProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="showcasePhoto absolute inset-0 flex items-center justify-center p-2 md:p-8 lg:p-12"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <div className="relative w-full max-w-lg aspect-[3/4] bg-[#0d0d0d] border border-white/10 overflow-hidden group">
                    <img
                      src={getFullImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 md:p-16"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Parallax Story Section with GSAP */}
      <section ref={storyRef} className="relative min-h-[80vh] md:h-screen bg-[#0a0a0a] overflow-hidden">
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto flex flex-col items-center w-full">
            <span className="text-gold-500 text-[10px] tracking-[0.6em] uppercase font-black block mb-6">The Art of Fragrance</span>

            <div className="overflow-hidden mb-8 w-full">
              <h2
                ref={storyTextRef}
                className="text-3xl md:text-6xl lg:text-7xl font-serif text-white tracking-[0.1em] leading-[1.3] md:leading-[1.2] uppercase font-light text-center"
              >
                A Symphony of <br /> Rare Notes.
              </h2>
            </div>

            <p className="text-xs text-gray-400 max-w-lg mx-auto leading-[2.5] tracking-[0.15em] font-semibold text-center uppercase">
              Distilled from the most precious ingredients on earth, every KIKS Ultra Luxury fragrance is meticulously curated to awaken the senses and capture raw emotion in a crystalline bottle.
            </p>
          </div>

          {/* Floating Secondary Image (Muse) */}
          <div className="floating-muse absolute right-[10%] top-[20%] w-32 md:w-48 aspect-[3/4] z-30 hidden md:block border border-white/10 shadow-2xl overflow-hidden group">
            <img
              src="/alchemy.webp"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover md:grayscale brightness-75 hover:grayscale-0 transition-all duration-1000"
              alt="Muse"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: THE EDITORIAL REVEAL (INTERACTIVE & LAYERED) */}
      <section className="relative min-h-screen bg-[#050505] overflow-hidden py-16 md:py-24 px-6 md:px-20 lg:px-32 flex flex-col justify-center">

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
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="relative aspect-[3/4] overflow-hidden border border-white/10 p-2 bg-white/[0.02]"
            >
              <img
                src="/la-reina-story.webp"
                className="w-full h-full object-cover md:grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-[2000ms]"
                alt="Editorial Muse"
              />
              <div className="absolute inset-0 border border-gold-500/20 m-4 pointer-events-none" />
            </motion.div>

            {/* Floating Label */}
            <div className="absolute -right-8 -bottom-8 bg-black border border-white/10 p-8 hidden md:block">
              <span className="text-gold-500 text-[8px] tracking-[0.5em] uppercase font-black block mb-2">Chapter V</span>
              <p className="text-white text-[10px] tracking-[0.2em] uppercase font-light italic">The Alchemy of Scent</p>
            </div>
          </div>

          {/* Right Column: The Composition */}
          <div className="lg:col-span-7 flex flex-col space-y-16 lg:pl-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-white text-4xl md:text-5xl font-serif font-light tracking-tight leading-tight text-center lg:text-left">
                Where Tradition Meets Modernity.
              </h3>
              <div className="w-20 h-[1px] bg-gold-500/40 mx-auto lg:mx-0" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 border-t border-white/5 pt-12"
            >
              <div className="space-y-4 text-center sm:text-left">
                <span className="text-gold-500 text-xs md:text-[10px] tracking-[0.3em] uppercase font-bold">Pure Sourcing</span>
                <p className="text-white/40 text-sm md:text-xs leading-relaxed tracking-wider font-light italic">
                  Hand-selected botanicals from the most remote regions, ensuring unparalleled purity and depth.
                </p>
              </div>
              <div className="space-y-4 text-center sm:text-left">
                <span className="text-gold-500 text-xs md:text-[10px] tracking-[0.3em] uppercase font-bold">Refined Alchemy</span>
                <p className="text-white/40 text-sm md:text-xs leading-relaxed tracking-wider font-light italic">
                  Traditional distillation techniques meeting precision engineering to create an olfactory masterpiece.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="pt-8 flex justify-center lg:justify-start"
            >
              <Link
                to="/collection"
                className="inline-flex items-center space-x-6 md:space-x-12 group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-gold-500 transition-all duration-700">
                  <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
                </div>
                <span className="text-[11px] md:text-[10px] text-white font-black tracking-[0.4em] md:tracking-[0.6em] uppercase group-hover:text-gold-400 transition-colors">
                  Explore The Collection
                </span>
              </Link>
            </motion.div>
          </div>

        </div>

        {/* Social Proof: The Community Gallery */}
        <section className="pt-16 pb-8 md:py-24 border-t border-white/5 bg-[#080808]">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="text-center md:text-left w-full">
                <span className="text-gold-500 text-[10px] tracking-[0.5em] uppercase font-bold block mb-4">Community</span>
                <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight uppercase leading-none">The Collective</h2>
              </div>
              <p className="text-xs text-white/30 tracking-[0.2em] uppercase max-w-[250px] md:text-right leading-relaxed hidden md:block">
                Our creations in the hands of the global elite.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.length > 0 ? galleryImages.map((img, idx) => (
                <motion.div
                  key={img.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-zinc-900 overflow-hidden group aspect-square relative ${idx === 1 ? 'md:aspect-[3/4] md:row-span-2' : idx === 5 ? 'md:col-span-2' : ''}`}
                >
                  <img src={getFullImageUrl(img.image_url)} loading="lazy" decoding="async" className="w-full h-full object-cover md:grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt={`Lifestyle ${idx + 1}`} />
                </motion.div>
              )) : (
                // Fallback if gallery is empty
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-zinc-900 animate-pulse" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Vertical Decorative Text */}
        <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 hidden xl:block">
          <p className="text-[9px] tracking-[2em] text-white/10 uppercase vertical-text">Signature Essence 2026</p>
        </div>
      </section>

      {/* Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center hover:border-gold-500/50 hover:bg-black/80 transition-all duration-500 group"
      >
        <ChevronUp size={20} className="text-white/50 group-hover:text-gold-500 transition-colors" />
      </button>

    </div>
  );
};

export default Home;
