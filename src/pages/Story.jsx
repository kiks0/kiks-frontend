import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, History, MapPin, Feather, Sparkles, Droplets } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Story = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        // Initialize GSAP animations for the story chapters
        const ctx = gsap.context(() => {
            const chapters = gsap.utils.toArray('.story-chapter');
            
            chapters.forEach((chapter, i) => {
                const bg = chapter.querySelector('.chapter-bg');
                const content = chapter.querySelector('.chapter-content');
                
                // Background Parallax
                gsap.fromTo(bg, 
                    { y: "-10%" },
                    { 
                        y: "10%",
                        ease: "none",
                        scrollTrigger: {
                            trigger: chapter,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );

                // Content Reveal
                gsap.fromTo(content,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: chapter,
                            start: "top 60%",
                        }
                    }
                );
            });

            // Special line animation
            gsap.fromTo(".progress-line", 
                { height: 0 },
                { 
                    height: "100%", 
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: true
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const chapters = [
        {
            id: '01',
            title: "The Vision",
            subtitle: "Sacred Beginnings",
            desc: "KIKS was born from a desire to capture the ephemeral beauty of raw emotions. We believe that a fragrance is not just a scent, but a silent storyteller that lingers in the memory.",
            image: "/story-hero.webp",
            accent: "Chapter I"
        },
        {
            id: '02',
            title: "The Alchemy",
            subtitle: "Masterful Composition",
            desc: "Our master perfumers blend the rarest oils with mathematical precision and artistic intuition. Each note is a brushstroke on an invisible canvas, creating a symphony that evolves with your skin.",
            image: "/alchemy.webp",
            accent: "Chapter II"
        },
        {
            id: '03',
            title: "The Sillage",
            subtitle: "Invisible Presence",
            desc: "We focus on the 'Trail'—the invisible aura that follows you. Our Extraits de Parfum are designed to stay present for over 18 hours, ensuring your legacy is felt long after you leave.",
            image: "/la-reina-story.webp",
            accent: "Chapter III"
        },
        {
            id: '04',
            title: "The Source",
            subtitle: "Global Rarity",
            desc: "From the cedar forests of the Atlas Mountains to the jasmine fields of Grasse, we traverse the globe to find ingredients that possess a soul and a history.",
            image: "/el-rey-story.webp",
            accent: "Chapter IV"
        }
    ];

    return (
        <div ref={containerRef} className="bg-[#050505] text-white w-full overflow-hidden">
            
            {/* STICKY PROGRESS INDICATOR */}
            <div className="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-4">
                <div className="w-[1px] h-32 bg-white/10 relative overflow-hidden">
                    <div className="progress-line absolute top-0 left-0 w-full bg-gold-500 origin-top" />
                </div>
                <span className="text-gold-500 text-[9px] tracking-[0.4em] uppercase font-bold transform -rotate-90 origin-center translate-y-12">The Essence</span>
            </div>

            {/* HERO SECTION */}
            <section className="h-screen w-full relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <img src="/story-hero.webp" className="w-full h-full object-cover scale-110 blur-sm md:blur-0" alt="Hero" />
                </div>
                <div className="relative z-20 text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="space-y-6"
                    >
                        <span className="text-gold-500 text-[10px] tracking-[0.8em] uppercase block font-black mb-4">Establishing Excellence</span>
                        <h1 className="text-5xl md:text-8xl font-serif tracking-[0.1em] uppercase leading-tight">
                            The <span className="italic text-gold-500">Arambh</span> <br /> Manifesto
                        </h1>
                        <p className="text-xs md:text-sm text-white/40 tracking-[0.4em] uppercase font-light mt-8">Explore The Art of Creation</p>
                    </motion.div>
                </div>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-gold-500 to-transparent" />
                </div>
            </section>

            {/* CHAPTERS */}
            {chapters.map((chapter, index) => (
                <section key={chapter.id} className="story-chapter min-h-screen relative flex items-center py-24 md:py-32 overflow-hidden border-b border-white/5">
                    <div className="chapter-bg absolute inset-0 z-0 opacity-20 pointer-events-none">
                        <img src={chapter.image} className="w-full h-full object-cover" alt="Background" />
                    </div>
                    
                    <div className="container mx-auto px-6 md:px-20 lg:px-32 relative z-10">
                        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                            
                            {/* Visual Content */}
                            <div className={`lg:col-span-5 ${index % 2 !== 0 ? 'lg:order-last' : ''}`}>
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-gold-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative aspect-[3/4] overflow-hidden border border-white/10 p-2 bg-white/[0.02]">
                                        <img src={chapter.image} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt={chapter.title} />
                                        <div className="absolute inset-0 border border-gold-500/20 m-4 pointer-events-none" />
                                    </div>
                                    <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-[#0a0a0a] border border-white/10 p-6 md:p-10">
                                        <span className="text-gold-500 text-3xl md:text-5xl font-serif italic">{chapter.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="lg:col-span-7 chapter-content">
                                <div className="space-y-8 max-w-xl">
                                    <div className="space-y-4">
                                        <span className="text-gold-500 text-[10px] tracking-[0.5em] uppercase font-black block">{chapter.accent}</span>
                                        <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight uppercase leading-tight">
                                            {chapter.title} <br /> 
                                            <span className="italic text-gold-500 text-3xl md:text-5xl">{chapter.subtitle}</span>
                                        </h2>
                                    </div>
                                    <div className="w-20 h-[1px] bg-gold-500/40" />
                                    <p className="text-white/60 text-base md:text-lg leading-relaxed font-light font-serif">
                                        {chapter.desc}
                                    </p>
                                    
                                    {/* Stats for Chapter 3 specifically */}
                                    {chapter.id === '03' && (
                                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                                            <div>
                                                <div className="flex items-center space-x-2 text-gold-500 mb-2">
                                                    <History size={16} />
                                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Longevity</span>
                                                </div>
                                                <p className="text-white text-xl font-serif italic">18+ Hours</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2 text-gold-500 mb-2">
                                                    <Sparkles size={16} />
                                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Concentration</span>
                                                </div>
                                                <p className="text-white text-xl font-serif italic">35% Extrait</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            ))}

            {/* FINAL CTA: THE LEGACY */}
            <section className="relative min-h-[80vh] flex items-center justify-center py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-black z-10" />
                    <img src="/campaign-model.png" className="w-full h-full object-cover opacity-30 grayscale" alt="Finale" />
                </div>
                
                <div className="relative z-20 text-center px-6">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="space-y-6">
                            <span className="text-gold-500 text-[10px] tracking-[0.6em] uppercase block font-black">Your Chapter Begins</span>
                            <h2 className="text-5xl md:text-8xl font-serif text-white tracking-widest uppercase italic leading-tight">
                                Create Your <br /> Own Legacy
                            </h2>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <Link
                                to="/collection"
                                className="group relative inline-flex items-center space-x-12 px-16 py-8 border border-white/10 rounded-full overflow-hidden transition-all duration-700 bg-white/5 hover:border-gold-500"
                            >
                                <span className="text-[12px] font-black tracking-[0.4em] uppercase z-10 text-white group-hover:text-black transition-colors duration-700">Enter The Vault</span>
                                <ArrowRight size={20} className="z-10 text-gold-500 group-hover:text-black transition-colors duration-700" />
                                <div className="absolute inset-0 bg-gold-500 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.19,1,0.22,1]" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Story;
