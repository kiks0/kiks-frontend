import { useRef, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFullImageUrl } from '../utils/url';
import { Edit2, ChevronUp } from 'lucide-react';
import { logClientActivity } from '../utils/clientLogger';

gsap.registerPlugin(ScrollTrigger);

const isVideo = (url) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/);
};

const Home = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [heroVideoUrl, setHeroVideoUrl] = useState('');
    const [heroSlides, setHeroSlides] = useState(() => {
        try {
            localStorage.removeItem('kiks_hero_slides_cache');
            const cached = localStorage.getItem('hero_slides_cache');
            return cached ? JSON.parse(cached) : [];
        } catch { return []; }
    });
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [signatureProduct, setSignatureProduct] = useState(() => {
        try {
            const cached = localStorage.getItem('signature_product_cache');
            if (cached) return JSON.parse(cached);
        } catch { }
        return {
            image_url: '',
            name: '',
            description: '',
            strength: '',
            notes: '',
            link: ''
        };
    });
    const [galleryImages, setGalleryImages] = useState([]);
    const [interludeTexts, setInterludeTexts] = useState({
        text_1: 'The Essence',
        text_2: 'Uncompromising',
        subtext: 'Crafted in India, for the world.'
    });
    const [mobileSliderProgress, setMobileSliderProgress] = useState(0);

    useEffect(() => {
        logClientActivity('Opened home page');
    }, []);

    // Indestructible Mobile & Refresh Stabilization (Zero Scroll Jumping)
    useEffect(() => {
        if (window.history && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'auto';
        }

        ScrollTrigger.clearScrollMemory();
        ScrollTrigger.config({
            ignoreMobileResize: true,
            limitCallbacks: true
        });
    }, []);

    // Animations logic (Keeping GSAP/ScrollTrigger as they are part of the original design)
    useEffect(() => {
        // Reveal animations...
    }, []);

    const [showcaseProducts, setShowcaseProducts] = useState(() => {
        try {
            const cached = localStorage.getItem('showcase_products_cache');
            if (cached) return JSON.parse(cached);
        } catch { }
        return [];
    });

    useEffect(() => {
        const fetchData = async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            try {
                const [showcaseRes, settingsRes, galleryRes, heroRes] = await Promise.all([
                    fetch(`${apiUrl}/api/marketing/showcase`),
                    fetch(`${apiUrl}/api/settings`),
                    fetch(`${apiUrl}/api/marketing/gallery`),
                    fetch(`${apiUrl}/api/settings/hero`)
                ]);

                if (showcaseRes.ok) {
                    const data = await showcaseRes.json();
                    if (data && data.length > 0) {
                        setShowcaseProducts(data);
                        try { localStorage.setItem('showcase_products_cache', JSON.stringify(data)); } catch (e) { }
                    }
                }

                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (data) {
                        if (data.hero_video_url) setHeroVideoUrl(data.hero_video_url);
                        const sigProd = {
                            image_url: data.signature_product_image_url || '',
                            name: data.signature_product_name || '',
                            description: data.signature_product_desc || '',
                            strength: data.signature_product_strength || '',
                            notes: data.signature_product_notes || '',
                            link: data.signature_product_link || ''
                        };
                        setSignatureProduct(sigProd);
                        try { localStorage.setItem('signature_product_cache', JSON.stringify(sigProd)); } catch (e) { }
                        setInterludeTexts({
                            text_1: data.interlude_text_1 || 'The Essence',
                            text_2: data.interlude_text_2 || 'Uncompromising',
                            subtext: data.interlude_subtext || 'Crafted in India, for the world.'
                        });
                    }
                }

                if (galleryRes.ok) {
                    const data = await galleryRes.json();
                    setGalleryImages(data);
                }

                if (heroRes && heroRes.ok) {
                    const data = await heroRes.json();
                    if (data && data.length > 0) {
                        setHeroSlides(data);
                        try {
                            localStorage.removeItem('kiks_hero_slides_cache');
                            localStorage.setItem('hero_slides_cache', JSON.stringify(data));
                        } catch (e) { }
                    }
                }
                setHeroLoaded(true);
            } catch (err) {
                console.error("Consolidated fetch failed:", err);
                setHeroLoaded(true);
            }
        };
        fetchData();
    }, []);

    const activeSlides = useMemo(() => {
        if (heroSlides.length > 0) return heroSlides;
        if (!heroLoaded) return [{ id: 'loading', media_url: '', mobile_media_url: '', title: '', subtitle: '', button_text: '' }];
        return [
            {
                id: 'default-1',
                media_url: heroVideoUrl || '/assets/hero.mp4',
                mobile_media_url: heroVideoUrl || '/assets/hero.mp4',
                title: 'Arambh Collection',
                subtitle: 'Exclusive',
                button_text: 'Explore',
                button_link: '/collection/arambh'
            }
        ];
    }, [heroSlides, heroVideoUrl, heroLoaded]);

    useEffect(() => {
        if (activeSlides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeSlides.length]);

    // Swipe & Drag handling for Hero Banners (Mobile & Desktop)
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleSwipeStart = (clientX) => {
        touchStartX.current = clientX;
        touchEndX.current = clientX;
    };

    const handleSwipeMove = (clientX) => {
        touchEndX.current = clientX;
    };

    const handleSwipeEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50; // minimum 50px swipe/drag distance to trigger slide transition
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
            } else {
                setCurrentSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
            }
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    const heroSwipeHandlers = {
        onTouchStart: (e) => handleSwipeStart(e.touches[0].clientX),
        onTouchMove: (e) => handleSwipeMove(e.touches[0].clientX),
        onTouchEnd: handleSwipeEnd,
        onMouseDown: (e) => handleSwipeStart(e.clientX),
        onMouseMove: (e) => {
            if (e.buttons === 1) handleSwipeMove(e.clientX);
        },
        onMouseUp: handleSwipeEnd,
        onMouseLeave: (e) => {
            if (e.buttons === 1 && touchStartX.current !== 0) handleSwipeEnd();
        }
    };

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
    const showcaseTrackRef = useRef(null);

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

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: storyRef.current,
                    start: "top 92%",
                    toggleActions: "play none none none",
                    invalidateOnRefresh: true,
                }
            });

            // 1. Label fades in
            tl.from(".story-label", {
                opacity: 0,
                y: 20,
                duration: 0.6,
                ease: "power2.out"
            })
                // 2. Title words reveal sequentially
                .fromTo(spans, {
                    opacity: 0,
                    y: 80,
                    rotateX: 20,
                    transformOrigin: "top center",
                    force3D: true,
                }, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    stagger: 0.06,
                    duration: 1.0,
                    ease: "power4.out",
                }, "-=0.3")
                // 3. Description fades up
                .from(".story-desc", {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.5")
                // 4. Muse image floats in smoothly from the right
                .from(".floating-muse", {
                    opacity: 0,
                    x: 60,
                    duration: 1.2,
                    ease: "power3.out"
                }, "-=0.7");

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

    // Buttery-Smooth Perfume Showcase Logic: Horizontal Pin for Desktop & Vertical Alternating Cross-Parallax for Mobile
    useEffect(() => {
        if (!showcaseContainerRef.current || !showcaseTrackRef.current) return;

        // Prevent mobile address bar resize from causing jumpy layout shifts or lagging
        ScrollTrigger.config({ ignoreMobileResize: true });

        let ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // Desktop: Hardware-accelerated smooth horizontal pin without layout thrashing
            mm.add("(min-width: 768px)", () => {
                const container = document.querySelector('.desktopShowcaseContainer');
                const track = showcaseTrackRef.current;

                if (!container || !track) return;

                const getScrollDistance = () => track.scrollWidth - window.innerWidth;
                if (getScrollDistance() <= 0 && showcaseProducts.length === 0) return;

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: container,
                        start: "top top",
                        end: () => `+=${Math.max(0, getScrollDistance())}`,
                        pin: true,
                        anticipatePin: 1,
                        scrub: 0.6,
                        invalidateOnRefresh: true,
                        fastScrollEnd: true,
                    }
                });

                tl.to(track, {
                    x: () => -Math.max(0, getScrollDistance()),
                    ease: "none",
                    force3D: true,
                });

                // Animate transition texts with hardware GPU acceleration
                const texts = gsap.utils.toArray('.transitionText');
                texts.forEach((text) => {
                    gsap.fromTo(text,
                        { opacity: 0, scale: 0.8 },
                        {
                            opacity: 1,
                            scale: 1,
                            force3D: true,
                            scrollTrigger: {
                                trigger: text,
                                containerAnimation: tl,
                                start: "left center",
                                end: "right center",
                                scrub: true,
                            }
                        }
                    );
                });
            });

            // Mobile: Smooth Horizontal Touch Carousel (handled natively by CSS snap & scroll-smooth)
            mm.add("(max-width: 767px)", () => {
                // No intrusive vertical scroll animations needed for the horizontal 70/30 slider
            });

            // Refresh ScrollTrigger cleanly once layout stabilizes
            const refreshTimer = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 300);

            return () => clearTimeout(refreshTimer);

        }, showcaseContainerRef);

        return () => ctx.revert();
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


    const { scrollY } = useScroll();

    return (
        <div className="bg-white min-h-screen text-black relative">
            <SEO
                title="Premium Perfumes & Fragrances"
                description="High quality perfumes handcrafted with rare ingredients. Explore our exclusive collection of Extrait de Parfum."
                keywords="Luxury Perfume, Extrait de Parfum, KIKS, Premium Fragrance, Elite Collection"
            />


            {/* Desktop Hero Section (Only shown on Desktop - uses landscape photo/video) */}
            <section {...heroSwipeHandlers} className="relative h-screen hidden md:flex items-center justify-center overflow-hidden bg-[#f9f9f9] select-none cursor-grab active:cursor-grabbing">
                <div className="absolute inset-x-4 bottom-4 top-[100px] sm:inset-x-6 sm:bottom-6 sm:top-[120px] md:inset-x-10 md:bottom-10 md:top-[180px] border border-transparent z-30 pointer-events-none" />

                {/* Rotating Media Slides */}
                {activeSlides.map((slide, index) => {
                    const isCurrent = index === (currentSlideIndex % activeSlides.length);
                    const mediaUrl = slide.media_url || '';
                    const fullMediaUrl = mediaUrl.startsWith('http') || mediaUrl.startsWith('/assets') ? mediaUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${mediaUrl}`;
                    const hasMedia = Boolean(mediaUrl);
                    const slideIsVideo = isVideo(mediaUrl);

                    return (
                        <div
                            key={slide.id || index}
                            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${isCurrent ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            {hasMedia && (
                                slideIsVideo ? (
                                    <video
                                        key={mediaUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        poster={fullMediaUrl.includes('cloudinary') && fullMediaUrl.match(/\.(webm|mp4|mov|ogg)$/i) ? fullMediaUrl.replace(/\.[^/.]+$/, ".jpg") : undefined}
                                        className="w-full h-full object-cover object-center scale-100 will-change-transform bg-[#f9f9f9] pointer-events-none"
                                    >
                                        <source src={fullMediaUrl} />
                                    </video>
                                ) : (
                                    <img
                                        key={mediaUrl}
                                        src={fullMediaUrl}
                                        alt={slide.title || "Hero Background"}
                                        draggable={false}
                                        onDragStart={(e) => e.preventDefault()}
                                        className="w-full h-full object-cover object-center scale-100 will-change-transform bg-[#f9f9f9] select-none pointer-events-none"
                                    />
                                )
                            )}

                            {/* Subtle Overlay only if text is present to enhance readability */}
                            {(slide.title || slide.subtitle) && (
                                <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />
                            )}
                        </div>
                    );
                })}

                {/* Hero Content Overlaid (Desktop ONLY) */}
                {(() => {
                    const slide = activeSlides[currentSlideIndex % activeSlides.length] || {};
                    const hasOverlayText = Boolean(slide.title || slide.subtitle || slide.button_text);
                    if (!hasOverlayText) return null;

                    return (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end text-white text-center px-4 pb-28 lg:pb-32 pointer-events-none">
                            <motion.div
                                key={`desktop-text-${currentSlideIndex}`}
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.2 }
                                    }
                                }}
                                className="flex flex-col items-center pointer-events-auto"
                            >
                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                                    className="flex flex-col items-center"
                                >
                                    {slide.subtitle && (
                                        <div className="text-[11px] tracking-[0.4em] uppercase font-bold mb-4 drop-shadow-md text-white opacity-60">
                                            {slide.subtitle}
                                        </div>
                                    )}
                                    {slide.title && (
                                        <div
                                            role="heading"
                                            aria-level="1"
                                            className="text-6xl lg:text-[4.5rem] font-serif font-light tracking-[0.1em] uppercase mb-10 drop-shadow-lg leading-tight text-white opacity-60"
                                        >
                                            {slide.title}
                                        </div>
                                    )}
                                </motion.div>

                                {slide.button_text && (
                                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}>
                                        <motion.div
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Link
                                                to={slide.button_link || "#"}
                                                className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-12 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-500 shadow-2xl block"
                                            >
                                                {slide.button_text}
                                            </Link>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    );
                })()}

                {/* Carousel Navigation Dots */}
                {activeSlides.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                        {activeSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlideIndex(idx)}
                                className={`h-1.5 transition-all duration-500 rounded-full ${idx === (currentSlideIndex % activeSlides.length) ? 'w-8 bg-white opacity-90' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Mobile Hero Section (Only shown on Mobile - portrait uncropped display using mobile_media_url if provided) */}
            <section {...heroSwipeHandlers} className="relative h-[90vh] sm:h-screen flex md:hidden items-center justify-center overflow-hidden bg-[#f9f9f9] select-none">
                <div className="absolute inset-x-4 bottom-4 top-[100px] border border-transparent z-30 pointer-events-none" />

                {/* Rotating Mobile Media Slides */}
                {activeSlides.map((slide, index) => {
                    const isCurrent = index === (currentSlideIndex % activeSlides.length);
                    const mediaUrl = slide.mobile_media_url || slide.media_url || '';
                    const fullMediaUrl = mediaUrl.startsWith('http') || mediaUrl.startsWith('/assets') ? mediaUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${mediaUrl}`;
                    const hasMedia = Boolean(mediaUrl);
                    const slideIsVideo = isVideo(mediaUrl);

                    return (
                        <div
                            key={slide.id || index}
                            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${isCurrent ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            {hasMedia && (
                                slideIsVideo ? (
                                    <video
                                        key={mediaUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        poster={fullMediaUrl.includes('cloudinary') && fullMediaUrl.match(/\.(webm|mp4|mov|ogg)$/i) ? fullMediaUrl.replace(/\.[^/.]+$/, ".jpg") : undefined}
                                        className="w-full h-full object-cover object-center scale-100 will-change-transform bg-[#f9f9f9] pointer-events-none"
                                    >
                                        <source src={fullMediaUrl} />
                                    </video>
                                ) : (
                                    <img
                                        key={mediaUrl}
                                        src={fullMediaUrl}
                                        alt={slide.title || "Hero Background"}
                                        draggable={false}
                                        onDragStart={(e) => e.preventDefault()}
                                        className="w-full h-full object-cover object-center scale-100 will-change-transform bg-[#f9f9f9] select-none pointer-events-none"
                                    />
                                )
                            )}

                            {/* Subtle Overlay only if text is present */}
                            {(slide.title || slide.subtitle) && (
                                <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />
                            )}
                        </div>
                    );
                })}

                {/* Hero Content Overlaid (Mobile ONLY - uses EXACT same text & button as desktop!) */}
                {(() => {
                    const slide = activeSlides[currentSlideIndex % activeSlides.length] || {};
                    const hasOverlayText = Boolean(slide.title || slide.subtitle || slide.button_text);
                    if (!hasOverlayText) return null;

                    return (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end text-white text-center px-4 pb-24 pointer-events-none">
                            <motion.div
                                key={`mobile-text-${currentSlideIndex}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="flex flex-col items-center pointer-events-auto"
                            >
                                {slide.subtitle && (
                                    <span className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3 drop-shadow-md text-white opacity-60">
                                        {slide.subtitle}
                                    </span>
                                )}
                                {slide.title && (
                                    <h1 className="text-[2.25rem] font-serif font-light tracking-[0.1em] uppercase mb-6 drop-shadow-lg leading-tight text-white opacity-60">
                                        {slide.title}
                                    </h1>
                                )}
                                {slide.button_text && (
                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Link
                                            to={slide.button_link || "#"}
                                            className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-12 py-3.5 text-[11px] tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black active:scale-95 transition-all duration-500 shadow-2xl block"
                                        >
                                            {slide.button_text}
                                        </Link>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    );
                })()}

                {/* Carousel Navigation Dots */}
                {activeSlides.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                        {activeSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlideIndex(idx)}
                                className={`h-1.5 transition-all duration-500 rounded-full ${idx === (currentSlideIndex % activeSlides.length) ? 'w-8 bg-white opacity-90' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Product 1: SIGNATURE SHOWCASE */}
            {signatureProduct.name && (
                <section className="relative pt-8 pb-4 md:py-16 overflow-hidden bg-white">
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
                                            className="w-full max-h-[55vh] md:max-h-[65vh] object-cover md:object-contain mx-auto"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            preload="metadata"
                                        />
                                    ) : (
                                        <img
                                            src={getFullImageUrl(signatureProduct.image_url || '')}
                                            alt={signatureProduct.name}
                                            fetchPriority="high"
                                            width="800"
                                            height="1000"
                                            decoding="async"
                                            style={{ willChange: 'transform' }}
                                            className="w-full max-h-[55vh] md:max-h-[65vh] object-cover md:object-contain mx-auto transition-transform duration-[2000ms] ease-out group-hover:scale-105"
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

                                <div className="relative z-10 space-y-4 md:space-y-6 w-full mt-4 md:mt-0">
                                    {/* Header (Desktop Only) */}
                                    <div className="hidden md:block space-y-4">
                                        <h2 className="text-5xl md:text-[5.5rem] font-serif font-light tracking-[0.15em] leading-none text-black uppercase">
                                            {signatureProduct.name}
                                        </h2>
                                    </div>

                                    {/* Description Block */}
                                    <div className="space-y-3 md:space-y-5 max-w-lg mx-auto md:mx-0">
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
                                            <div className="pt-4 border-t border-black/5 mt-4 md:pt-8 md:mt-8">
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

            {/* SECTION 3: THE LUXURY SHOWCASE WRAPPER (ANIMATION ON MOBILE & DESKTOP) */}
            <div ref={showcaseContainerRef}>
                {/* DESKTOP ONLY: HORIZONTAL PINNED SHOWCASE */}
                <section className="desktopShowcaseContainer hidden md:block relative bg-white overflow-hidden w-full">
                    <div ref={showcaseTrackRef} className="flex h-screen w-max items-center will-change-transform">
                        {showcaseProducts.map((product, index) => (
                            <div key={product.id || index} className="flex items-center h-full">

                                {/* Product Screen */}
                                <div className="w-screen h-screen flex items-center justify-center p-8 md:px-16 flex-shrink-0 relative overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
                                        <h1 className="text-[10vw] md:text-[11vw] font-serif font-black tracking-tighter uppercase whitespace-nowrap select-none px-4">{product.name}</h1>
                                    </div>

                                    <div className="max-w-[1300px] w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 mx-auto">
                                        <div className="w-full md:w-[48%] flex flex-col justify-center text-center md:text-left">
                                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-black uppercase tracking-[0.05em]">{product.name}</h2>
                                            <p className="text-[12px] md:text-sm text-black/70 leading-relaxed tracking-widest font-normal mb-8 max-w-md mx-auto md:mx-0">
                                                {product.description}
                                            </p>
                                            <div>
                                                <Link
                                                    to={product.product_link || '#'}
                                                    className="inline-block text-[10px] md:text-[11px] text-black tracking-[0.3em] uppercase font-bold border-b border-black/30 pb-2 hover:border-black transition-colors"
                                                >
                                                    Discover The Scent
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-[48%] h-[50vh] md:h-[65vh] flex items-center justify-center relative">
                                            <div className="absolute inset-0 bg-black/5 blur-3xl rounded-full opacity-30 transform scale-75 pointer-events-none" />
                                            <Link to={product.product_link || '#'} className="relative block w-full max-w-[420px] h-full bg-[#fcfcfc] border border-black/10 overflow-hidden shadow-2xl group">
                                                <img
                                                    src={getFullImageUrl(product.image_url)}
                                                    alt={product.name}
                                                    loading="eager"
                                                    decoding="async"
                                                    className="w-full h-full object-contain p-8 md:p-12 group-hover:scale-105 transition-transform duration-700 ease-out"
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Transitional Interlude Screen (if not the last item) */}
                                {index < showcaseProducts.length - 1 && (
                                    <div className="w-screen h-screen flex flex-col items-center justify-center flex-shrink-0 bg-neutral-50 border-x border-black/5 px-8">
                                        <h2 className="transitionText will-change-transform transform-gpu text-[12vw] md:text-[8vw] font-serif italic text-black/20 whitespace-nowrap leading-none">
                                            {product.transition_title || (index === 0 ? 'The Essence' : 'Uncompromising')}
                                        </h2>
                                        <p className="transitionText will-change-transform transform-gpu mt-6 text-[9px] md:text-xs tracking-[0.4em] uppercase font-bold text-black/40 text-center">
                                            {interludeTexts.subtext}
                                        </p>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                </section>

                {/* MOBILE ONLY: SIMPLE & RESPONSIVE TOUCH SLIDER */}
                <section className="mobileShowcaseContainer block md:hidden relative bg-white w-full pt-4 pb-2 overflow-hidden border-t border-black/5">
                    <div className="text-center px-6 mb-3">
                        <h2 className="text-xl font-serif tracking-[0.2em] uppercase text-black font-normal">Our Scents</h2>
                    </div>

                    {/* Ultra-Smooth Gentle Horizontal Slider Track */}
                    <div 
                        className="flex items-stretch overflow-x-auto gap-4 px-6 pb-2 hide-scrollbar w-full transform-gpu select-none"
                        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y', transform: 'translateZ(0)' }}
                        data-lenis-prevent-touch="true"
                        onScroll={(e) => {
                            const target = e.currentTarget;
                            const scrollLeft = target.scrollLeft;
                            const scrollWidth = target.scrollWidth - target.clientWidth;
                            if (scrollWidth > 0) {
                                setMobileSliderProgress((scrollLeft / scrollWidth) * 100);
                            }
                        }}
                    >
                        {showcaseProducts.map((product, index) => (
                            <div
                                key={product.id || index}
                                className="w-[82vw] sm:w-[340px] flex-shrink-0 flex flex-col"
                            >
                                <div className="bg-white border border-black/10 shadow-sm p-3.5 sm:p-4 flex flex-col justify-between flex-grow rounded-sm w-full mx-auto">
                                    {/* Clean Full-Scale Product Image */}
                                    <Link
                                        to={product.product_link || '#'}
                                        className="relative block w-full aspect-square overflow-hidden mb-3 bg-[#fafafa] border border-black/5 p-3 flex items-center justify-center group"
                                        draggable={false}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.02] opacity-60 pointer-events-none" />
                                        <img
                                            src={getFullImageUrl(product.image_url)}
                                            alt={product.name}
                                            loading="eager"
                                            decoding="async"
                                            draggable={false}
                                            className="w-full h-full object-contain filter drop-shadow-xl pointer-events-none select-none"
                                        />
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex flex-col flex-grow justify-between text-center w-full">
                                        <div>
                                            <span className="text-[8px] tracking-[0.4em] font-bold text-black/40 block mb-1">Extrait de Parfum</span>
                                            <h3 className="text-xl font-serif tracking-[0.15em] text-black uppercase font-normal mb-2 line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-[11px] text-black/70 leading-[1.5] tracking-widest font-light mb-3 line-clamp-2 px-1">
                                                {product.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto pt-1">
                                            <Link
                                                to={product.product_link || '#'}
                                                className="inline-flex items-center justify-center space-x-2 text-[10px] tracking-[0.35em] uppercase text-black font-bold border-b border-black/30 pb-1.5 hover:border-black transition-all"
                                            >
                                                <span>Explore Scent</span>
                                                <span>&rarr;</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Elegant Luxury Progress Tracker */}
                    <div className="flex items-center justify-center mt-6 mb-2">
                        <div className="w-[120px] md:w-[200px] h-[1px] bg-black/10 relative overflow-hidden">
                            <div 
                                className="absolute top-0 left-0 h-full bg-black" 
                                style={{ 
                                    width: `${Math.max(10, mobileSliderProgress)}%`, 
                                    transition: 'width 0.2s cubic-bezier(0.25, 1, 0.5, 1)' 
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Immersive Parallax Story Section with GSAP */}
            <section ref={storyRef} className="relative py-8 md:py-16 md:h-screen bg-[#f9f9f9] overflow-hidden">
                <div className="relative z-20 h-full flex flex-col items-center justify-center px-6">
                    <div className="text-center max-w-4xl mx-auto flex flex-col items-center w-full">
                        <span className="story-label text-black text-[10px] tracking-[0.6em] uppercase font-black block mb-6">OUR PROCESS</span>

                        <div className="overflow-hidden mb-8 w-full text-center">
                            <h2
                                ref={storyTextRef}
                                className="text-3xl md:text-6xl lg:text-7xl font-serif text-black tracking-[0.1em] leading-[1.3] md:leading-[1.2] uppercase font-light text-center"
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

                        <p className="story-desc text-black/70 text-[12px] md:text-[14px] leading-relaxed max-w-2xl mx-auto tracking-[0.15em] font-medium uppercase text-center opacity-80">
                            {t('home.creation_desc')}
                        </p>
                    </div>

                    {/* Floating Secondary Image (Muse) */}
                    <Link to="/collection/arambh" className="floating-muse absolute right-[10%] top-[20%] w-32 md:w-48 aspect-[3/4] z-30 hidden md:block border border-black/10 shadow-2xl overflow-hidden group">
                        <img
                            src="https://res.cloudinary.com/dprxiz6os/image/upload/v1779191418/Gemini_Generated_Image_6kx4eu6kx4eu6kx4_xsm3qk.webp"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                            alt="Muse"
                        />
                    </Link>
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
                            to="/collection/The%20Arambh"
                            className="relative block aspect-[3/4] overflow-hidden border border-black/10 p-2 bg-black/[0.02]"
                        >
                            <img
                                src="https://res.cloudinary.com/dprxiz6os/image/upload/v1779191419/araambh_1_mh8uqw.webp"
                                loading="lazy"
                                width="600"
                                height="800"
                                decoding="async"
                                className="w-full h-full object-cover transition-all duration-[2000ms]"
                                alt="Alchemy Muse"
                            />
                            <div className="absolute inset-0 border border-gold-500/20 m-4 pointer-events-none" />
                        </Link>

                        {/* Floating Label */}

                    </div>

                    {/* Right Column: The Composition */}
                    <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-16 lg:pl-12">
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
                                THE ART OF ALCHEMY
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.6 }}
                            viewport={{ once: true, amount: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 md:mb-16"
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
                            className="pt-2 md:pt-4 flex justify-center lg:justify-start w-full"
                        >
                            <Link to="/collection/The%20Arambh" className="inline-block group/link">
                                <span className="text-[10px] tracking-[0.3em] text-black uppercase font-black border-b border-black/20 pb-1 group-hover/link:border-black transition-all duration-500">
                                    {t('home.explore_collection')}
                                </span>
                            </Link>
                        </motion.div>
                    </div>

                </div>

                {/* Social Proof: The House of KIKS Editorial Mosaic (Dynamic Masonry) */}
                <section className="pt-12 pb-12 md:pt-20 md:pb-20 border-t border-black/5 bg-neutral-50/40">
                    <div className="container mx-auto px-4 sm:px-6 max-w-[1500px]">
                        <div className="text-center mb-10 md:mb-14">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-black/50 font-semibold mb-3 block">
                                Global Presence
                            </span>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-black tracking-[0.18em] leading-tight mb-4 uppercase">
                                {t('home.house_kiks')}
                            </h2>
                            <p className="text-black/60 text-xs md:text-sm leading-relaxed max-w-lg mx-auto tracking-widest font-light">
                                Curated moments & timeless presence around the globe.
                            </p>
                        </div>

                        {/* Responsive Art Museum Masonry (2 columns on mobile, 3 tablet, 4 desktop with generous breathing room) */}
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6 md:gap-10 space-y-4 sm:space-y-6 md:space-y-10">
                            {galleryImages.length > 0 ? galleryImages.map((img, idx) => (
                                <motion.div
                                    key={img.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.15 }}
                                    transition={{ duration: 0.8, delay: (idx % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative group overflow-hidden break-inside-avoid bg-neutral-100 rounded-xs mb-4 sm:mb-6 md:mb-10 border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer"
                                >
                                    <img
                                        src={getFullImageUrl(img.image_url)}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-auto object-cover transform transition-transform duration-1000 ease-out group-hover:scale-105"
                                        alt={`House of KIKS Exhibition ${idx + 1}`}
                                    />
                                </motion.div>
                            )) : (
                                // Fallback Art Masonry Skeleton with Natural Varying Heights
                                [1, 2, 3, 4, 5, 6, 7, 8].map((i, idx) => {
                                    const skelHeights = ['h-[320px]', 'h-[480px]', 'h-[280px]', 'h-[400px]', 'h-[350px]', 'h-[520px]'];
                                    return (
                                        <div key={i} className={`w-full ${skelHeights[idx % skelHeights.length]} bg-neutral-200/60 border border-black/5 animate-pulse break-inside-avoid rounded-xs mb-4 sm:mb-6 md:mb-10`} />
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>


            </section>

        </div>
    );
};

export default Home;
