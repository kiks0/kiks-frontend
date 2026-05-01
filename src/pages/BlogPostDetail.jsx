import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Share2, Loader2, Tag } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import SEO from '../components/SEO';
import { getFullImageUrl } from '../utils/url';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BlogPostDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`${API_URL}/api/blogs/slug/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setPost(data);
            }
        } catch (err) {
            console.error("Error fetching story detail:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-3xl font-serif mb-6 uppercase tracking-widest font-light">The story has faded</h2>
                    <Link to="/blog" className="text-gold-500 underline text-xs tracking-widest uppercase">Back to Journal</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-white pt-20 md:pt-32 pb-12 md:pb-24 font-sans selection:bg-gold-500/30 selection:text-white">
            <SEO
                title={post.title}
                description={post.content.substring(0, 160)}
                keywords={post.keywords || "Luxury Perfume, Fragrance Blog"}
                image={post.image_url}
            />
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-[1000px]">

                {/* Navigation Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link to="/blog" className="group flex items-center space-x-3 text-white/40 hover:text-white transition-all text-[10px] tracking-[0.3em] uppercase font-bold">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Journal Home</span>
                    </Link>
                </motion.div>

                {/* Article Header */}
                <header className="mb-6 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap items-center gap-4 md:gap-8 mb-6 md:mb-8 text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase font-black text-gold-500/80"
                    >
                        <span className="flex items-center"><Calendar size={13} className="mr-2" /> {new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center"><User size={13} className="mr-2" /> By {post.author}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-serif text-white uppercase tracking-[0.05em] font-light leading-tight mb-8"
                    >
                        {post.title}
                    </motion.h1>

                    {post.keywords && (
                        <div className="flex flex-wrap gap-4 mb-8">
                            {post.keywords.split(',').map((tag, i) => (
                                <span key={i} className="flex items-center text-[8px] tracking-[0.3em] uppercase text-white/40 bg-white/5 px-3 py-1 rounded">
                                    <Tag size={10} className="mr-2" /> {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                {/* Featured Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                    className="w-full h-[40vh] md:h-[70vh] mb-8 md:mb-20 overflow-hidden relative group rounded-2xl border border-white/5"
                >
                    <img
                        src={getFullImageUrl(post.image_url)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-20" />
                </motion.div>

                {/* Article Content */}
                <article className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-base md:text-lg lg:text-xl text-white/80 leading-[1.8] md:leading-[2] tracking-wide mb-12 whitespace-pre-wrap font-light"
                    >
                        {post.content}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-white/[0.03] border border-white/5 p-8 sm:p-12 md:p-16 rounded-2xl md:rounded-3xl mb-8 md:mb-12 text-center"
                    >
                        <h3 className="text-gold-500 text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] font-bold uppercase mb-6">The Legacy of Scent</h3>
                        <p className="text-white/60 text-xs md:text-sm leading-[2.2] md:leading-[2.5] tracking-widest font-light italic uppercase">"Perfume is the most intense form of memory. It lingers when the story ends."</p>
                    </motion.div>
                </article>

                {/* Sharing footer */}
                <footer className="mt-12 md:mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-center">
                    <Link to="/blog" className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-gold-500 font-black hover:text-white transition-all underline underline-offset-8">
                        Discover more insights
                    </Link>
                </footer>

            </div>
        </div>
    );
};

export default BlogPostDetail;