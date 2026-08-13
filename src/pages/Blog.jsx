import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Play, Clock } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import SEO from '../components/SEO';
import { getFullImageUrl } from '../utils/url';
import { logClientActivity } from '../utils/clientLogger';
import { motion } from 'framer-motion';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Blog = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    useEffect(() => {
        fetchPosts();
        logClientActivity('Opened blog slider');
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/blogs`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (err) {
            console.error("Error fetching stories:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen text-black font-sans selection:bg-black/10 selection:text-black relative overflow-hidden">
            <SEO
                title="The Journal of Kiks Ultra Luxury"
                description="Explore the timeless heritage of niche perfumery and the art of olfactory creation. Read our latest stories and insights."
                keywords="Luxury Perfume Blog, Fragrance Stories, Perfume By Kiksultraluxury"
            />

            {/* Header Overlay - Always visible but subtle */}
            <div className="absolute top-32 md:top-40 w-full text-center z-[100] pointer-events-none">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}>
                    <h1 className="text-[9px] md:text-[11px] tracking-[0.6em] font-black uppercase text-black/30">Inside KIKS</h1>
                </motion.div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-screen w-full relative z-10">
                    <PageLoader />
                </div>
            ) : posts.length === 0 ? (
                <div className="flex items-center justify-center h-screen w-full relative z-10">
                    <p className="text-black/30 tracking-[0.5em] uppercase text-[10px]">The archive is currently being curated.</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 pt-32 pb-20"
                >
                    <style>
                        {`
                            /* Swiper Custom Styles */
                            .blog-swiper {
                                width: 100%;
                                height: auto;
                            }
                            .swiper-slide {
                                display: flex;
                                justify-content: center;
                                align-items: flex-start;
                                width: 100%; /* 100% width on mobile guarantees exact horizontal centering between icons */
                                transition: all 0.5s ease;
                                opacity: 1;
                                transform: scale(1);
                            }
                            @media (min-width: 768px) {
                                .swiper-slide { width: 32%; max-width: 260px; }
                            }
                            @media (min-width: 1200px) {
                                .swiper-slide { width: 22%; max-width: 280px; }
                            }
                            
                            /* Hide navigation arrows when disabled or when sliding is not needed */
                            .swiper-button-disabled {
                                opacity: 0 !important;
                                pointer-events: none !important;
                                cursor: default;
                            }

                            /* Image hover transition */
                            .slide-img {
                                transition: transform 2s ease-out;
                            }

                            /* Title presentation */
                            .slide-title {
                                transition: all 0.5s ease;
                            }
                        `}
                    </style>

                    <div className="relative w-full">
                        <Swiper
                            grabCursor={true}
                            centeredSlides={false}
                            centerInsufficientSlides={true}
                            slidesPerView={'auto'}
                            spaceBetween={0}
                            breakpoints={{
                                768: { spaceBetween: 30 },
                                1200: { spaceBetween: 40 }
                            }}
                            loop={false} // No looping or repeating duplicates
                            speed={600}
                            keyboard={{ enabled: true }}
                            mousewheel={{ forceToAxis: true, sensitivity: 1 }}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            onInit={(swiper) => {
                                swiper.params.navigation.prevEl = prevRef.current;
                                swiper.params.navigation.nextEl = nextRef.current;
                                swiper.navigation.init();
                                swiper.navigation.update();
                            }}
                            modules={[Navigation, Keyboard]}
                            className="blog-swiper"
                        >
                            {posts.map((post, index) => (
                                <SwiperSlide key={post.id || index} onClick={() => navigate(`/blog/${post.slug}`)}>
                                    <div className="flex flex-col items-center w-[84%] sm:w-[80%] md:w-full mx-auto mt-10 md:mt-16 group cursor-pointer pb-6 transition-transform duration-700 ease-out hover:-translate-y-1 hover:scale-[1.02]">
                                        {/* Image Container */}
                                        <div className="relative w-full h-[44vh] md:h-[270px] lg:h-[300px] overflow-hidden rounded-sm shadow-xl bg-black/5 flex-shrink-0">
                                            {(post.image_url && (post.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || post.image_url.includes('video/upload'))) ? (
                                                <video
                                                    src={getFullImageUrl(post.image_url)}
                                                    className="slide-img w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={getFullImageUrl(post.image_url)}
                                                    alt={post.title}
                                                    className="slide-img w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                                                />
                                            )}
                                            {/* Subtle overlay on hover */}
                                            <div className="absolute inset-0 bg-black/5 transition-colors duration-700 group-hover:bg-transparent" />
                                        </div>

                                        {/* Content Underneath */}
                                        <div className="slide-title mt-6 md:mt-8 flex flex-col items-center text-center px-4 w-full">
                                            <div className="flex flex-wrap justify-center items-center gap-y-2 text-black/50 text-[8px] md:text-[9px] tracking-[0.4em] font-bold uppercase mb-3 md:mb-4">
                                                <div className="flex items-center">
                                                    <Calendar size={12} className="mr-2" /> {new Date(post.created_at).toLocaleDateString()}
                                                </div>
                                                <span className="mx-3 text-black/20 hidden sm:inline-block">|</span>
                                                <div className="flex items-center">
                                                    <Clock size={12} className="mr-2" /> 
                                                    {Math.max(1, Math.ceil((post.content || '').split(/\s+/).length / 150))} Min Read
                                                </div>
                                            </div>
                                            <h2 className="text-[13px] md:text-[14px] lg:text-[15px] font-serif text-black tracking-[0.08em] uppercase font-bold mb-4 md:mb-5 leading-relaxed max-w-xl h-[78px] md:h-[84px] lg:h-[96px] flex items-center justify-center overflow-hidden w-full">
                                                {post.title}
                                            </h2>

                                            <div className="flex items-center justify-center space-x-3 text-black text-[10px] tracking-[0.4em] font-black uppercase transition-all duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100">
                                                <span className="w-8 h-[1px] bg-black/30" />
                                                <span className="flex items-center space-x-2">
                                                    <Play size={10} fill="currentColor" />
                                                    <span>Explore</span>
                                                </span>
                                                <span className="w-8 h-[1px] bg-black/30" />
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Custom Navigation Arrows (Visible on Mobile, Hidden on Desktop) */}
                        <button
                            ref={prevRef}
                            className="absolute left-2 sm:left-4 top-[calc(40px+22vh)] -translate-y-1/2 z-[100] w-10 h-10 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-lg flex md:hidden items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 pointer-events-auto hover:scale-105 outline-none focus:outline-none"
                            aria-label="Previous story"
                        >
                            <ChevronLeft className="w-5 h-5 -ml-0.5" strokeWidth={1.5} />
                        </button>
                        <button
                            ref={nextRef}
                            className="absolute right-2 sm:right-4 top-[calc(40px+22vh)] -translate-y-1/2 z-[100] w-10 h-10 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-lg flex md:hidden items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 pointer-events-auto hover:scale-105 outline-none focus:outline-none"
                            aria-label="Next story"
                        >
                            <ChevronRight className="w-5 h-5 -mr-0.5" strokeWidth={1.5} />
                        </button>
                    </div>

                </motion.div>
            )}
        </div>
    );
};

export default Blog;
