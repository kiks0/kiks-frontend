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

    if (loading) return <PageLoader fullScreen />;

    return (
        <div className="bg-white min-h-screen text-black pt-20 md:pt-32 pb-8 md:pb-16 font-sans selection:bg-black/10 selection:text-black">
            <SEO 
                title="The Journal of Essence" 
                description="Explore the timeless heritage of niche perfumery and the art of olfactory creation. Read our latest stories and insights."
                keywords="Luxury Perfume Blog, Fragrance Stories, Niche Perfumery, Olfactory Art"
            />
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-[1300px]">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-6 md:mb-8 border-b border-black/5 pb-6 md:pb-8">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center space-x-4 mb-4"
                        >
                            <span className="w-12 h-[1px] bg-black" />
                            <p className="text-black text-[9px] tracking-[0.6em] font-black uppercase">The Journal of Essence</p>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            className="hidden md:block text-2xl sm:text-3xl md:text-4xl font-serif text-black tracking-[0.05em] uppercase font-light leading-[1.1] mb-2"
                        >
                            Insights & <br />Essences
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-black/50 text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] font-light max-w-lg mt-4 md:mt-6 leading-relaxed uppercase"
                        >
                            Exploring the timeless heritage of niche perfumery and the art of olfactory creation.
                        </motion.p>
                    </div>
                </div>

                {/* Blogs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-10 md:gap-y-20">
                    {posts.length === 0 ? (
                        <div className="col-span-full py-20 text-center border border-black/5 bg-black/[0.01]">
                            <p className="text-black/20 tracking-[0.5em] uppercase text-[10px]">The archive is currently being curated.</p>
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
                                <div className="overflow-hidden rounded-2xl mb-8 relative aspect-[16/10] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-shadow duration-700">
                                    <img
                                        src={getFullImageUrl(post.image_url)}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />



                                    <div className="absolute bottom-6 left-6 z-20 flex items-center md:translate-y-2 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <span className="flex items-center text-white/80 md:text-white/60 text-[9px] md:text-[8px] tracking-[0.3em] font-bold uppercase">
                                            <Calendar size={12} className="mr-2 text-white" /> {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start px-2">
                                    <h2 className="text-xl md:text-2xl font-serif text-black group-hover:text-black/60 transition-colors duration-500 tracking-[0.03em] uppercase font-light mb-3 md:mb-4 leading-tight">
                                        {post.title}
                                    </h2>

                                    <div className="flex items-center space-x-3 text-black text-[10px] md:text-[9px] tracking-[0.4em] font-black uppercase group/btn">
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
