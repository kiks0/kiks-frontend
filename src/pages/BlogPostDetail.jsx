import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import PageLoader from '../components/PageLoader';
import SEO from '../components/SEO';
import { getFullImageUrl } from '../utils/url';
import { logClientActivity } from '../utils/clientLogger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const renderContent = (content) => {
    if (!content) return '';

    let safeContent = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Markdown links
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    safeContent = safeContent.replace(markdownLinkRegex, (match, anchorText, url) => {
        const isExternal = url.startsWith('http://') || url.startsWith('https://');
        const target = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${url}" ${target} class="underline underline-offset-4 text-black hover:text-black/60 transition-colors duration-200">${anchorText}</a>`;
    });

    // Split by line breaks and wrap in clean paragraph tags for proper editorial alignment
    const paragraphs = safeContent
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    return paragraphs.map(p => `<p>${p}</p>`).join('');
};

const formatEditorialTitle = (title) => {
    const words = title.split(' ');
    const conjunctions = ['for', 'the', 'of', 'in', 'to', 'and', 'with', 'a', 'an'];
    return words.map((word, i) => {
        if (conjunctions.includes(word.toLowerCase())) {
            return `<span class="font-serif italic font-light lowercase px-2 md:px-4" key="${i}">${word}</span>`;
        }
        return `<span class="uppercase font-serif" key="${i}">${word}</span>`;
    }).join(' ');
};

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
                if (data && data.title) {
                    logClientActivity('Opened blog post', data.title);
                }
            }
        } catch (err) {
            console.error("Error fetching story detail:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageLoader fullScreen />;

    if (!post) {
        return (
            <div className="bg-[#fcfaf8] min-h-screen flex items-center justify-center text-black">
                <div className="text-center">
                    <h2 className="text-3xl font-serif mb-6 uppercase tracking-widest font-light">The story has faded</h2>
                    <Link to="/blog" className="text-black underline text-xs tracking-widest uppercase">Back to Journal</Link>
                </div>
            </div>
        );
    }

    const showcaseImages = post.showcase_images 
        ? (typeof post.showcase_images === 'string' ? JSON.parse(post.showcase_images) : post.showcase_images)
        : [];

    return (
        <div className="bg-[#fcfaf8] min-h-screen text-black pt-20 md:pt-32 pb-0 font-sans selection:bg-black/10 selection:text-black overflow-hidden">
            <SEO
                title={post.title}
                description={post.content.substring(0, 160)}
                keywords={post.keywords || "Luxury Perfume, Fragrance Blog"}
                image={post.image_url}
            />
            
            {/* Navigation Back */}
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-[1400px]">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 md:mb-20"
                >
                    <Link to="/blog" className="group flex items-center space-x-3 text-black/40 hover:text-black transition-all text-[9px] tracking-[0.3em] uppercase font-bold">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Journal Home</span>
                    </Link>
                </motion.div>
            </div>

            {/* EDITORIAL HERO */}
            <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-12 mb-8 md:mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif leading-tight md:leading-[1.25] text-center tracking-[0.04em] text-[#1a1a1a] z-0 relative max-w-4xl mx-auto px-2 md:px-8 uppercase font-normal mb-8 md:mb-12"
                >
                    {post.title}
                </motion.h1>

                <div className="relative w-full flex justify-center mt-8 md:mt-[-2vw] z-10 pointer-events-none">
                    {/* Left Meta */}
                    <div className="absolute left-4 md:left-20 top-1/2 -translate-y-1/2 w-[20%] text-left hidden md:block">
                        <p className="text-[9px] tracking-[0.4em] uppercase text-black/50 leading-loose">
                            Published<br/><span className="text-black">{new Date(post.created_at).toLocaleDateString()}</span>
                        </p>
                    </div>

                    {/* Center Image/Video */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-[60vw] md:w-[25vw] h-[80vw] md:h-[35vw] max-w-[350px] max-h-[450px] overflow-hidden pointer-events-auto shadow-2xl bg-white"
                    >
                        {(post.image_url && (post.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || post.image_url.includes('video/upload'))) ? (
                            <video
                                src={getFullImageUrl(post.image_url)}
                                className="w-full h-full object-cover grayscale-[20%] contrast-125"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <img
                                src={getFullImageUrl(post.image_url)}
                                alt={post.title}
                                className="w-full h-full object-cover grayscale-[20%] contrast-125"
                            />
                        )}
                    </motion.div>

                    {/* Right Meta */}
                    <div className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 w-[20%] text-right hidden md:block">
                        <p className="text-[9px] tracking-[0.4em] uppercase text-black/50 leading-loose">
                            Written by<br/><span className="text-black">{post.author}</span>
                        </p>
                    </div>
                </div>
                
                {/* Mobile Meta (visible only on small screens) */}
                <div className="flex md:hidden justify-between items-center max-w-[340px] mx-auto mt-6 px-4 text-center border-t border-black/10 pt-4">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-black/60 font-medium text-left">
                        Published<br/><span className="text-black font-bold mt-0.5 inline-block">{new Date(post.created_at).toLocaleDateString()}</span>
                    </p>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-black/60 font-medium text-right">
                        Written by<br/><span className="text-black font-bold mt-0.5 inline-block">{post.author}</span>
                    </p>
                </div>
            </div>

            {/* DIVIDER NAV */}
            <div className="w-full border-y border-black/10 py-6 md:py-8 flex justify-center mb-10 md:mb-20">
                <span className="text-[8px] md:text-[9px] tracking-[0.5em] uppercase text-black/60 font-bold flex items-center">
                    Begin Reading <ArrowRight size={14} className="ml-4" />
                </span>
            </div>

            {/* EDITORIAL CONTENT */}
            <article className="max-w-[700px] mx-auto px-6 md:px-0 relative">
                
                <style>{`
                    .editorial-content {
                        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        word-break: normal;
                        overflow-wrap: break-word;
                    }
                    /* Refined Magazine Drop Cap */
                    .editorial-content > p:first-of-type::first-letter {
                        float: left;
                        font-size: 3.5rem;
                        line-height: 0.85;
                        padding-top: 0.1rem;
                        padding-right: 0.6rem;
                        padding-left: 0rem;
                        font-family: 'Copperplate Gothic', 'Copperplate', 'Times New Roman', serif;
                        color: #1a1a1a;
                        text-transform: uppercase;
                        font-weight: 600;
                    }
                    @media (min-width: 768px) {
                        .editorial-content > p:first-of-type::first-letter {
                            font-size: 5rem;
                            padding-right: 0.8rem;
                        }
                    }
                    .editorial-content p {
                        font-size: 12px;
                        line-height: 1.625;
                        color: rgba(0, 0, 0, 0.5);
                        margin-bottom: 2rem;
                        text-align: justify;
                        text-indent: 0;
                        letter-spacing: 0.05em;
                        font-weight: 300;
                    }
                    @media (min-width: 768px) {
                        .editorial-content p {
                            font-size: 15px;
                            line-height: 1.625;
                            margin-bottom: 2.5rem;
                            text-align: justify;
                        }
                    }
                    
                    /* Massive Dark Blockquotes */
                    .editorial-content blockquote {
                        width: 100vw;
                        position: relative;
                        left: 50%;
                        right: 50%;
                        margin-left: -50vw;
                        margin-right: -50vw;
                        background-color: #1a1a1a;
                        color: #fcfaf8;
                        padding: 4rem 8vw;
                        margin-top: 3rem;
                        margin-bottom: 3rem;
                        text-align: center;
                        font-family: 'Copperplate Gothic', 'Copperplate', 'Times New Roman', serif;
                        font-style: italic;
                        font-size: 2rem;
                        line-height: 1.4;
                        font-weight: 300;
                    }
                    @media (min-width: 768px) {
                        .editorial-content blockquote {
                            font-size: 3.5rem;
                            padding: 8rem 20vw;
                            margin-top: 8rem;
                            margin-bottom: 8rem;
                        }
                    }
                    .editorial-content blockquote p {
                        color: #fcfaf8;
                        font-size: inherit;
                        line-height: inherit;
                        margin: 0;
                    }
                    .editorial-content blockquote p:first-of-type::first-letter {
                        float: none;
                        font-size: inherit;
                        padding: 0;
                        color: inherit;
                        font-family: inherit;
                        text-transform: none;
                    }
                    .editorial-content blockquote::before {
                        content: '';
                    }
                    
                    /* Styling h2/h3 inside content */
                    .editorial-content h2, .editorial-content h3 {
                        font-family: 'Copperplate Gothic', 'Copperplate', 'Times New Roman', serif;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        font-weight: 400;
                        margin-top: 4rem;
                        margin-bottom: 2rem;
                        font-size: 1.5rem;
                    }
                    @media (min-width: 768px) {
                        .editorial-content h2, .editorial-content h3 {
                            font-size: 2rem;
                            margin-top: 6rem;
                        }
                    }
                `}</style>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="editorial-content"
                    dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
                />

            </article>

            {/* DYNAMIC FOOTER BLOCK */}
            {showcaseImages.length > 0 ? (
                <div className="w-full bg-[#fcfaf8] text-black border-t border-black/10 mt-16 md:mt-32 pt-16 md:pt-32 pb-16 flex flex-col justify-center overflow-hidden">
                    <div className="text-center px-6 mb-16 md:mb-24">
                        <h2 className="font-serif italic text-4xl md:text-5xl lg:text-6xl mb-8 leading-[1.1] font-light">
                            Discover the Inspiration
                        </h2>
                        <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-black/50">
                            Immerse yourself in the scent behind the story.
                        </p>
                    </div>
                    
                    <div className="container mx-auto px-6 max-w-[1000px]">
                        <div className={`columns-2 ${showcaseImages.length === 3 ? 'md:columns-3' : 'md:columns-4'} gap-2 md:gap-4 space-y-2 md:space-y-4`}>
                            {showcaseImages.map((url, i) => (
                                <Link key={i} to={post.related_link || '#'} className="relative group overflow-hidden break-inside-avoid block">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 0.8, delay: (i % 4) * 0.1 }}
                                    >
                                        <img src={getFullImageUrl(url)} alt={`Showcase ${i+1}`} className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full bg-[#fcfaf8] text-black border-t border-black/10 mt-16 md:mt-32 px-6 py-16 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-[1400px] w-full mx-auto"
                    >
                        <h2 className="font-serif italic text-4xl md:text-5xl lg:text-6xl mb-8 leading-[1.1] font-light">
                            Here's How You Can<br/>Experience The Legacy.
                        </h2>
                        <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-black/50 mb-16 md:mb-24">
                            Discover the scent that lingers when the story ends.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 mt-12 w-full max-w-[900px] mx-auto">
                            <Link to="/collection/la-reina" className="group block flex flex-col items-center">
                                <div className="w-[70%] md:w-[85%] aspect-[4/5] bg-black/5 mb-6 overflow-hidden">
                                    <img src="https://res.cloudinary.com/dprxiz6os/image/upload/v1778429853/kiks_general/kiks-1778429852010-758699176_xco2ys.jpg" alt="La Reina" className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                </div>
                                <h4 className="text-[9px] tracking-[0.4em] uppercase font-bold mb-3 text-black">La Reina</h4>
                                <p className="text-xs text-black/50 leading-relaxed font-light">Explore the feminine luxury.</p>
                            </Link>
                            <Link to="/collection/el-rey" className="group block flex flex-col items-center">
                                <div className="w-[70%] md:w-[85%] aspect-[4/5] bg-black/5 mb-6 overflow-hidden">
                                    <img src="https://res.cloudinary.com/dprxiz6os/image/upload/v1779798423/kiks_general/kiks-1779798422610-749106583_xke7wd.webp" alt="El Rey" className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                </div>
                                <h4 className="text-[9px] tracking-[0.4em] uppercase font-bold mb-3 text-black">El Rey</h4>
                                <p className="text-xs text-black/50 leading-relaxed font-light">Command the room.</p>
                            </Link>
                            <Link to="/collection/signature" className="group block flex flex-col items-center">
                                <div className="w-[70%] md:w-[85%] aspect-[4/5] bg-black/5 mb-6 overflow-hidden">
                                    <img src="https://res.cloudinary.com/dprxiz6os/image/upload/v1778050809/IMG-20260506-WA0002.jpg_cqlvdx.webp" alt="Signature Collection" className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                </div>
                                <h4 className="text-[9px] tracking-[0.4em] uppercase font-bold mb-3 text-black">The Signature</h4>
                                <p className="text-xs text-black/50 leading-relaxed font-light">The pinnacle of desire.</p>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}
            
        </div>
    );
};

export default BlogPostDetail;