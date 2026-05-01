import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, Layout, Sparkles, Loader2 } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import SEO from '../components/SEO';
import { getFullImageUrl } from '../utils/url';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Blog = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
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

    if (loading) {
        return (
            <div className="bg-black min-h-[60vh] flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-white pt-32 md:pt-48 pb-20 md:pb-24 font-sans selection:bg-gold-500/30 selection:text-white">
            <SEO 
                title="The Journal of Essence" 
                description="Explore the timeless heritage of niche perfumery and the art of olfactory creation. Read our latest stories and insights."
                keywords="Luxury Perfume Blog, Fragrance Stories, Niche Perfumery, Olfactory Art"
            />
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-[1300px]">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16 border-b border-white/5 pb-12">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center space-x-4 mb-10"
                        >
                            <span className="w-12 h-[1px] bg-gold-500" />
                            <p className="text-gold-500 text-[9px] tracking-[0.6em] font-black uppercase">The Journal of Essence</p>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-[0.05em] uppercase font-light leading-[1.1] mb-2"
                        >
                            Insights & <br />Essences
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] font-light max-w-lg mt-8 md:mt-12 leading-relaxed uppercase"
                        >
                            Exploring the timeless heritage of niche perfumery and the art of olfactory creation.
                        </motion.p>
                    </div>
                </div>

                {/* Blogs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-16 md:gap-y-20">
                    {posts.length === 0 ? (
                        <div className="col-span-full py-20 text-center border border-white/5 bg-white/[0.01]">
                            <p className="text-white/20 tracking-[0.5em] uppercase text-[10px]">The archive is currently being curated.</p>
                        </div>
                    ) : (
                        posts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, delay: idx * 0.15 }}
                                viewport={{ once: true }}
                                className="group flex flex-col cursor-pointer"
                                onClick={() => navigate(`/blog/${post.slug}`)}
                            >
                                <div className="overflow-hidden rounded-2xl mb-8 relative aspect-[16/10] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-shadow duration-700">
                                    <img
                                        src={getFullImageUrl(post.image_url)}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

                                    <div className="absolute top-6 left-6 z-20">
                                        <span className="bg-black/40 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full text-[8px] tracking-[0.3em] font-black uppercase text-white/90 whitespace-nowrap">
                                            {post.author || 'Kiks Artisan'} • Editorial
                                        </span>
                                    </div>

                                    <div className="absolute bottom-6 left-6 z-20 flex items-center md:translate-y-2 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <span className="flex items-center text-white/80 md:text-white/60 text-[9px] md:text-[8px] tracking-[0.3em] font-bold uppercase">
                                            <Calendar size={12} className="mr-2 text-gold-500" /> {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start px-2">
                                    <h2 className="text-xl md:text-2xl font-serif text-white group-hover:text-gold-500 transition-colors duration-500 tracking-[0.03em] uppercase font-light mb-3 md:mb-4 leading-tight">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-400 md:text-gray-500 text-[11px] md:text-xs leading-relaxed mb-6 md:mb-8 line-clamp-2 uppercase tracking-[0.1em] font-light">
                                        {post.content.substring(0, 150)}...
                                    </p>
                                    <div className="flex items-center space-x-3 text-gold-500 text-[10px] md:text-[9px] tracking-[0.4em] font-black uppercase group/btn">
                                        <span className="relative">Read Narrative</span>
                                        <ArrowRight size={14} className="transform group-hover/btn:translate-x-2 transition-transform duration-500" />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default Blog;
