import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFullImageUrl } from '../utils/url';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t } = useTranslation();
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

    mm.add('(min-width: 768px)', () => {
      const photos = gsap.utils.toArray('.showcasePhoto:not(:first-child)');
      const sections = gsap.utils.toArray('.showcaseContentSection:not(:first-child)');

      // Set initial state for photos (reveal from bottom)
      gsap.set(photos, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 1 });

      sections.forEach((section, index) => {
        const headline = section.querySelector('.showcaseReveal');
        const img = photos[index].querySelector('img');

        // Image Reveal Timeline (Stable - No Zoom)
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

        // Text Stagger Reveal (Faster and cleaner)
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
      });

      // Pin the showcase gallery
      ScrollTrigger.create({
        trigger: showcaseContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.showcaseRight', // Pin the right side now
        pinSpacing: false,
      });
    });

    return () => mm.revert();
  }, []);

  const { scrollYProgress: carouselProgress } = useScroll({
    target: carouselRef,
  });
  const xTranslate = useTransform(carouselProgress, [0, 1], ["0%", "-66.666%"]);

  return (
    <div className="bg-dark-900 min-h-screen text-white">
      <SEO
        title="The Essence of Elegance"
        description="KIKS Ultra Luxury: A symphony of rare notes and artisanal craftsmanship. Explore our exclusive collection of Extrait de Parfum."
        keywords="Luxury Perfume, Extrait de Parfum, KIKS, Premium Fragrance, Elite Collection"
      />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        <div className="absolute inset-x-4 bottom-4 top-[100px] sm:inset-x-6 sm:bottom-6 sm:top-[120px] md:inset-x-10 md:bottom-10 md:top-[180px] border border-white/10 z-30 pointer-events-none" />

        {/* Video Background */}
        <div className="absolute inset-0 z-0">
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
        <Link to="/essence" className="relative z-20 text-center px-6 w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full pt-[25vh] md:pt-[20vh] cursor-pointer group/hero">

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="text-[9px] md:text-sm font-light text-gray-300 max-w-sm mx-auto mb-8 md:mb-10 tracking-[0.4em] md:tracking-widest leading-relaxed group-hover/hero:text-gold-400 transition-colors"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="group relative inline-flex items-center justify-center px-10 py-4 text-[10px] tracking-[0.3em] font-medium uppercase text-white hover:text-dark-900 overflow-hidden transition-colors duration-500">
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-sm opacity-30 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
              <span className="absolute inset-0 w-full h-full transition-all duration-500 ease-out transform translate-y-full bg-white group-hover:translate-y-0" />
              <span className="relative z-10 pt-[2px]">{t('home.discover')}</span>
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/50 transform origin-left transition-transform duration-500 ease-out group-hover:scale-x-0" />
            </div>
          </motion.div>
        </Link>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center"
        >
          <span className="text-[8px] uppercase tracking-[0.5em] text-white/50 mb-3 block font-light">{t('common.scroll')}</span>
          <div className="w-[1px] h-12 bg-white/10 relative overflow-hidden">
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-full bg-gold-500 absolute top-0"
            />
          </div>
        </motion.div>
      </section>

      {/* Product 1: ELITE */}
      <section className="py-12 md:py-32 container mx-auto px-6 md:px-12 lg:px-20 max-w-[1400px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-24">

          {/* Left: Image */}
          <motion.div
            className="w-full md:w-[45%] relative group"
          >
            <Link to="/product/elite" className="w-full block relative px-4 md:px-0">
              <img
                src="/elite1.webp"
                alt="Elite Collection Front"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain shadow-2xl shadow-black/50 transition-transform duration-700 group-hover:scale-105 rounded-xl"
              />
            </Link>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true }}
            className="w-full md:w-[55%] flex flex-col items-center md:items-start justify-center text-center md:text-left font-sans"
          >
            <h2 className="text-2xl md:text-[2.2rem] font-serif font-light tracking-[0.05em] mb-4 md:mb-6 leading-[1.4] text-white">
              Elite
            </h2>

            <p className="text-[10px] md:text-xs text-gray-300 mb-10 leading-relaxed font-semibold tracking-[0.08em] max-w-lg">
              {t('home.elite_desc')}
            </p>

            <div className="flex space-x-4">
              <Link
                to="/product/elite"
                className="inline-flex items-center justify-center px-10 py-3.5 bg-[#2a2a2a] rounded-full text-[11px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-dark-900 transition-all duration-300 font-medium"
              >
                {t('home.discover_btn')}
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 3: THE LUXURY SHOWCASE (GSAP STICKY REVEAL) */}
      <section ref={showcaseContainerRef} className="relative bg-[#050505] border-t border-white/5 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Mobile/Tablet View (Visible on < md) */}
          <div className="md:hidden flex flex-col w-full">
            {[
              {
                id: 'elite',
                name: 'Elite',
                desc: 'A powerful blend of rare woods and midnight spices, designed for the individual who commands presence without speaking a word.',
                image: '/elite1.webp'
              },
              {
                id: 'la-reina',
                name: 'La Reina',
                desc: 'An opulent symphony of velvet roses and golden amber. La Reina is the essence of timeless femininity and unyielding grace.',
                image: '/la-reina.jpeg'
              },
              {
                id: 'el-rey',
                name: 'El Rey',
                desc: 'Bold leather notes intertwined with aged tobacco and citrus undertones. El Rey is a fragrance of conquest and enduring legacy.',
                image: '/el-rey.jpeg'
              }
            ].map((product, index) => (
              <div key={product.id} className="flex flex-col items-center justify-center px-6 py-8 border-b border-white/5">
                <div className="w-full max-w-[280px] aspect-[3/4] bg-[#0d0d0d] border border-white/10 mb-6 overflow-hidden">
                  <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-contain p-8" />
                </div>
                <div className="text-center">

                  <h2 className="text-3xl font-serif text-white tracking-[0.05em] mb-4 uppercase">{product.name}</h2>
                  <p className="text-[11px] text-gray-400 leading-relaxed tracking-widest font-medium px-4">{product.desc}</p>

                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Visible on >= md) */}
          <div className="hidden md:block showcaseContent w-1/2">
            {[
              {
                name: 'Elite',
                desc: 'A powerful blend of rare woods and midnight spices, designed for the individual who commands presence without speaking a word.'
              },
              {
                name: 'La Reina',
                desc: 'An opulent symphony of velvet roses and golden amber. La Reina is the essence of timeless femininity and unyielding grace.'
              },
              {
                name: 'El Rey',
                desc: 'Bold leather notes intertwined with aged tobacco and citrus undertones. El Rey is a fragrance of conquest and enduring legacy.'
              }
            ].map((content, index) => (
              <div
                key={index}
                className="showcaseContentSection h-screen flex items-center justify-center p-24"
              >
                <div className="showcaseReveal max-w-lg">

                  <h2 className="text-5xl font-serif text-white tracking-[0.05em] mb-6 leading-tight uppercase">
                    {content.name}
                  </h2>
                  <p className="text-sm text-gray-400 leading-[2] tracking-widest font-medium">
                    {content.desc}
                  </p>

                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:flex showcaseRight w-1/2 h-screen sticky top-0 items-center justify-center overflow-hidden border-l border-white/5">
            <div className="relative w-full h-full">
              {[
                { id: 'elite', name: 'Elite', image: '/elite1.webp' },
                { id: 'la-reina', name: 'La Reina', image: '/la-reina.jpeg' },
                { id: 'el-rey', name: 'El Rey', image: '/el-rey.jpeg' }
              ].map((product, index) => (
                <div
                  key={product.id}
                  className="showcasePhoto absolute inset-0 flex items-center justify-center p-16 lg:p-24"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="relative w-full max-w-lg aspect-[3/4] bg-[#0d0d0d] border border-white/10 overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain p-16"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Parallax Story Section with GSAP */}
      <section ref={storyRef} className="relative min-h-[80vh] md:h-screen bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] z-10" />
          <img
            ref={storyImgRef}
            src="https://images.unsplash.com/photo-1616604847470-a3c3fdfded8b?q=80&w=2500&auto=format&fit=crop"
            alt="Perfumery Art"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 h-full flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
            <p className="text-gold-500 text-[10px] md:text-xs font-semibold tracking-[0.2em] mb-8 font-sans uppercase">
              {t('home.art_creation')}
            </p>

            <div className="overflow-hidden mb-8">
              <h2
                ref={storyTextRef}
                className="text-3xl md:text-6xl lg:text-7xl font-serif text-white tracking-[0.1em] leading-[1.3] md:leading-[1.2] uppercase font-light text-center"
              >
                {t('home.symphony_notes')}
              </h2>
            </div>

            <p className="text-[10px] md:text-xs text-gray-400 max-w-lg mx-auto leading-[2.5] tracking-[0.15em] font-semibold">
              {t('home.creation_desc')}
            </p>
          </div>

          {/* Floating Secondary Image (Muse) */}
          <div className="floating-muse absolute right-[10%] top-[20%] w-32 md:w-48 aspect-[3/4] z-30 hidden md:block border border-white/10 shadow-2xl overflow-hidden">
            <img
              src="/alchemy.webp"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover md:grayscale brightness-75 hover:grayscale-0 transition-all duration-1000"
              alt="Muse"
            />
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden">
            <div className="w-full h-full bg-gold-500 absolute top-0 animate-scroll-line" />
          </div>
        </div>
      </section>

      {/* SECTION 5: THE EDITORIAL REVEAL (INTERACTIVE & LAYERED) */}
      <section className="relative min-h-screen bg-[#050505] overflow-hidden py-16 md:py-24 px-6 md:px-20 lg:px-32 flex flex-col justify-center">

        {/* Mouse Follow Glow - The 'Unique' Touch */}
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
              <p className="text-white text-[10px] tracking-[0.2em] uppercase font-light italic">THE SIGNATURE</p>
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
                Beyond the <br /> <span className="text-gold-500 italic">Invisible Senses</span>
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
                <span className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-bold">The Sourcing</span>
                <p className="text-white/40 text-[11px] md:text-xs leading-relaxed tracking-wider font-light italic">
                  Extracted from hand-selected blossoms in Grasse, aged for eighteen months in charred oak.
                </p>
              </div>
              <div className="space-y-4 text-center sm:text-left">
                <span className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-bold">The Alchemy</span>
                <p className="text-white/40 text-[11px] md:text-xs leading-relaxed tracking-wider font-light italic">
                  A high-concentration extrait that evolves with your unique body chemistry.
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
                <span className="text-[9px] md:text-[10px] text-white font-black tracking-[0.4em] md:tracking-[0.6em] uppercase group-hover:text-gold-400 transition-colors">
                  Explore The Collection
                </span>
              </Link>
            </motion.div>
          </div>

        </div>

        {/* Social Proof: The Community Gallery */}
        <section className="pt-16 pb-8 md:py-24 border-t border-white/5 bg-[#080808]">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-16 space-y-8 md:space-y-0 text-center md:text-left">
              <div className="max-w-xl">
                <span className="text-gold-500 text-[8px] md:text-[9px] tracking-[0.4em] md:tracking-[0.5em] uppercase font-black block mb-4">The Collective</span>
                <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight uppercase italic leading-tight">
                  Seen in <br /> <span className="text-white not-italic font-sans font-black tracking-widest">KIKS</span>
                </h2>
              </div>
              <p className="text-[9px] md:text-xs text-white/30 tracking-[0.2em] uppercase max-w-[250px] md:text-right leading-relaxed">
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
                  className={`bg-zinc-900 overflow-hidden group aspect-square ${idx === 1 ? 'md:aspect-[3/4] md:row-span-2' : idx === 5 ? 'md:col-span-2' : ''}`}
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

    </div>
  );
};

export default Home;
