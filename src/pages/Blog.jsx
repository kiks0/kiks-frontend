import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Play, Clock } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import SEO from '../components/SEO';
import { getFullImageUrl } from '../utils/url';
import { logClientActivity } from '../utils/clientLogger';
import { motion } from 'framer-motion';

// Swiper for mobile
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard } from 'swiper/modules';
import 'swiper/css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BlogCard = ({ post, onClick }) => {
    const isVideo = post.image_url && (post.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || post.image_url.includes('video/upload'));
    const readTime = Math.max(1, Math.ceil((post.content || '').split(/\s+/).length / 150));

    return (
        <div 
            onClick={onClick}
            className="flex flex-col items-center w-full group cursor-pointer pb-6 transition-all duration-500 ease-out hover:-translate-y-1.5"
        >
            {/* Image Container */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/5] overflow-hidden rounded-sm shadow-md group-hover:shadow-xl bg-black/5 transition-shadow duration-500 flex-shrink-0">
                {isVideo ? (
                    <video
                        src={getFullImageUrl(post.image_url)}
                        className="w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-105"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        src={getFullImageUrl(post.image_url)}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-105"
                    />
                )}
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>

            {/* Content Underneath */}
            <div className="mt-5 md:mt-6 flex flex-col items-center text-center px-2 w-full">
                <div className="flex flex-wrap justify-center items-center gap-y-1 text-black/50 text-[8px] md:text-[9px] tracking-[0.35em] font-bold uppercase mb-2.5">
                    <div className="flex items-center">
                        <Calendar size={11} className="mr-1.5 opacity-70" /> 
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <span className="mx-2.5 text-black/25">|</span>
                    <div className="flex items-center">
                        <Clock size={11} className="mr-1.5 opacity-70" /> 
                        {readTime} Min Read
                    </div>
                </div>

                <h2 className="text-[12px] md:text-[13px] lg:text-[14px] font-serif text-black tracking-[0.06em] uppercase font-bold leading-relaxed line-clamp-3 min-h-[50px] md:min-h-[58px] flex items-center justify-center text-center w-full px-2">
                    {post.title}
                </h2>

                <div className="mt-3 flex items-center justify-center space-x-3 text-black text-[9px] md:text-[10px] tracking-[0.35em] font-black uppercase transition-all duration-300 opacity-75 group-hover:opacity-100">
                    <span className="w-6 md:w-8 h-[1px] bg-black/30 group-hover:w-10 group-hover:bg-black transition-all" />
                    <span className="flex items-center space-x-1.5">
                        <Play size={9} fill="currentColor" />
                        <span>Explore</span>
                    </span>
                    <span className="w-6 md:w-8 h-[1px] bg-black/30 group-hover:w-10 group-hover:bg-black transition-all" />
                </div>
            </div>
        </div>
    );
};

const Blog = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileSwiper, setMobileSwiper] = useState(null);
    const [mobileIndex, setMobileIndex] = useState(0);

    useEffect(() => {
        fetchPosts();
        logClientActivity('Opened blog list');
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
        <div className="bg-white min-h-screen text-black font-sans selection:bg-black/10 selection:text-black relative overflow-x-hidden">
            <SEO
                title="The Journal of Kiks Ultra Luxury"
                description="Explore the timeless heritage of niche perfumery and the art of olfactory creation. Read our latest stories and insights."
                keywords="Luxury Perfume Blog, Fragrance Stories, Perfume By Kiksultraluxury"
            />

            {/* Header Title */}
            <div className="pt-28 md:pt-36 pb-6 md:pb-12 text-center w-full">
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }}>
                    <h1 className="text-[10px] md:text-[11px] tracking-[0.6em] font-black uppercase text-black/40">Inside KIKS</h1>
                </motion.div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[50vh] w-full relative z-10">
                    <PageLoader />
                </div>
            ) : posts.length === 0 ? (
                <div className="flex items-center justify-center min-h-[50vh] w-full relative z-10">
                    <p className="text-black/30 tracking-[0.5em] uppercase text-[10px]">The archive is currently being curated.</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.1 }}
                    className="w-full relative z-10"
                >
                    {/* DESKTOP & TABLET: 3 BLOGS PER LINE (GRID) */}
                    <div className="hidden md:block w-full max-w-[1240px] mx-auto px-6 lg:px-12 pb-28">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
                            {posts.map((post, index) => (
                                <BlogCard 
                                    key={post.id || index} 
                                    post={post} 
                                    onClick={() => navigate(`/blog/${post.slug}`)} 
                                />
                            ))}
                        </div>
                    </div>

                    {/* MOBILE: SWIPER SLIDER WITH RELIABLE CLICKABLE ARROWS */}
                    <div className="block md:hidden w-full px-4 pb-20 relative">
                        <div className="relative max-w-[340px] sm:max-w-[380px] mx-auto">
                            <Swiper
                                grabCursor={true}
                                centeredSlides={true}
                                slidesPerView={1}
                                spaceBetween={20}
                                loop={posts.length > 1}
                                speed={400}
                                keyboard={{ enabled: true }}
                                onSwiper={setMobileSwiper}
                                onSlideChange={(swiper) => setMobileIndex(swiper.realIndex ?? swiper.activeIndex)}
                                modules={[Keyboard]}
                                className="w-full"
                            >
                                {posts.map((post, index) => (
                                    <SwiperSlide key={post.id || index}>
                                        <div className="px-2">
                                            <BlogCard 
                                                post={post} 
                                                onClick={() => navigate(`/blog/${post.slug}`)} 
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Floating Side Arrows on Mobile (Vertically centered near image) */}
                            {posts.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (mobileSwiper) mobileSwiper.slidePrev();
                                        }}
                                        className="absolute left-0 top-[35%] -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 text-black border border-black/15 shadow-xl flex items-center justify-center active:scale-90 transition-transform backdrop-blur"
                                        aria-label="Previous story"
                                    >
                                        <ChevronLeft className="w-5 h-5 -ml-0.5" strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (mobileSwiper) mobileSwiper.slideNext();
                                        }}
                                        className="absolute right-0 top-[35%] -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 text-black border border-black/15 shadow-xl flex items-center justify-center active:scale-90 transition-transform backdrop-blur"
                                        aria-label="Next story"
                                    >
                                        <ChevronRight className="w-5 h-5 -mr-0.5" strokeWidth={2} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Bottom Navigation Bar & Counter */}
                        {posts.length > 1 && (
                            <div className="flex items-center justify-between max-w-[280px] mx-auto mt-2 px-2 py-2 border-t border-black/10">
                                <button
                                    type="button"
                                    onClick={() => mobileSwiper?.slidePrev()}
                                    className="flex items-center space-x-1 text-[10px] tracking-[0.25em] font-bold uppercase text-black/60 hover:text-black active:scale-95 py-1 px-2"
                                >
                                    <ChevronLeft size={14} />
                                    <span>Prev</span>
                                </button>
                                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-black/50">
                                    {mobileIndex + 1} / {posts.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => mobileSwiper?.slideNext()}
                                    className="flex items-center space-x-1 text-[10px] tracking-[0.25em] font-bold uppercase text-black/60 hover:text-black active:scale-95 py-1 px-2"
                                >
                                    <span>Next</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Blog;
