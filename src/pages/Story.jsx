import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Microscope, History, Feather, MapPin } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Story = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Subtle Parallax for all images
            gsap.utils.toArray('.reveal-img').forEach(img => {
                gsap.fromTo(img,
                    { scale: 1.05 },
                    {
                        scale: 1,
                        ease: "none",
                        scrollTrigger: {
                            trigger: img,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );
            });

            // Smooth fade for text blocks
            gsap.utils.toArray('.text-reveal').forEach(text => {
                gsap.from(text, {
                    y: 20,
                    opacity: 0,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: text,
                        start: "top 90%",
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-[#050505] text-white w-full overflow-hidden font-sans pb-32">

            {/* HERO: CLEAN TEXT-ONLY INTRODUCTION */}
            <section className="h-[70vh] w-full relative flex items-center justify-center overflow-hidden mb-20 bg-black">
                <div className="relative z-10 text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5 }}
                        className="space-y-6"
                    >
                        <span className="text-gold-500 text-[10px] tracking-[0.6em] uppercase block font-bold">Chapter 01</span>
                        <h1 className="text-4xl md:text-7xl font-serif tracking-[0.1em] uppercase leading-tight">
                            The Birth of <br /><span className="italic text-gold-500">Pure Essence</span>
                        </h1>
                        <div className="w-12 h-[1px] bg-gold-500/40 mx-auto mt-8" />
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: CRAFT & ALCHEMY */}
            <section className="container mx-auto px-6 md:px-20 max-w-7xl mb-40">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10 text-reveal">
                        <div className="space-y-2">
                            <span className="text-gold-500 text-[9px] tracking-[0.4em] uppercase font-black">The Artisans</span>
                            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight uppercase leading-tight">
                                Sacred <br /> <span className="italic text-gold-500">Alchemy</span>
                            </h2>
                        </div>

                        <p className="text-white/50 text-sm md:text-base leading-relaxed font-light max-w-xl">
                            We source only the rarest resins and oils from the most remote corners of the globe. Each batch is aged for 24 months in dark mahogany barrels, allowing the scent to develop its signature depth.
                        </p>

                        <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/10">
                            <div className="flex items-start space-x-4">
                                <MapPin size={16} className="text-gold-500/60 mt-1" />
                                <div>
                                    <p className="text-gold-500 text-[9px] uppercase tracking-widest font-bold">Source</p>
                                    <p className="text-white text-sm font-serif">Qatar</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <History size={16} className="text-gold-500/60 mt-1" />
                                <div>
                                    <p className="text-gold-500 text-[9px] uppercase tracking-widest font-bold">Aging</p>
                                    <p className="text-white text-sm font-serif">24 Months</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="reveal-img relative">
                        <div className="aspect-[4/5] overflow-hidden rounded shadow-2xl border border-white/5 relative z-10">
                            <img
                                src="/alchemy.webp"
                                className="w-full h-full object-cover"
                                alt="Alchemy"
                            />
                        </div>
                        {/* Decorative glow */}
                        <div className="absolute -inset-10 bg-gold-500/5 blur-[80px] -z-10 rounded-full" />
                    </div>
                </div>
            </section>

            {/* SECTION 3: INVISIBLE SILLAGE (BETTER CONTRAST) */}
            <section className="w-full relative h-[80vh] flex items-center justify-center overflow-hidden mb-40">
                <div className="absolute inset-0 z-0 reveal-img">
                    <img
                        src="https://images.unsplash.com/photo-1557170334-a7c3d40d0460?q=80&w=2500&auto=format&fit=crop"
                        className="w-full h-full object-cover brightness-[0.4]"
                        alt="Atmosphere"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 text-center px-6 text-reveal">
                    <div className="mb-10 flex justify-center">
                        <div className="p-4 rounded-full border border-gold-500/20 bg-black/40 backdrop-blur-sm">
                            <Feather size={32} className="text-gold-500" strokeWidth={1} />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-6xl font-serif tracking-[0.2em] uppercase italic mb-6">
                        Invisible Sillage
                    </h2>
                    <p className="text-white/50 text-[10px] md:text-[12px] tracking-[0.3em] uppercase max-w-lg mx-auto leading-loose">
                        A trail that remains long after you have left the room. It is the signature of your presence.
                    </p>
                </div>
            </section>

            {/* SECTION 4: DATA TILES (REDUCED SPACE) */}
            <section className="container mx-auto px-6 md:px-20 max-w-5xl mb-40 text-reveal">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 rounded overflow-hidden">
                    <div className="p-12 text-center space-y-4 bg-white/[0.02]">
                        <p className="text-gold-500/50 text-[9px] tracking-[0.4em] uppercase font-black">Persistence</p>
                        <p className="text-white text-2xl md:text-3xl font-serif tracking-widest uppercase">18 Hours</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">Enduring Legacy</p>
                    </div>
                    <div className="p-12 text-center space-y-4 border-y md:border-y-0 md:border-x border-white/10">
                        <p className="text-gold-500/50 text-[9px] tracking-[0.4em] uppercase font-black">Diffusion</p>
                        <p className="text-white text-2xl md:text-3xl font-serif tracking-widest uppercase">Extreme</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">Projective Power</p>
                    </div>
                    <div className="p-12 text-center space-y-4 bg-white/[0.02]">
                        <p className="text-gold-500/50 text-[9px] tracking-[0.4em] uppercase font-black">Concentration</p>
                        <p className="text-white text-2xl md:text-3xl font-serif tracking-widest uppercase">35% Parfum</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">Purest Essence</p>
                    </div>
                </div>
            </section>

            {/* FINALE: ENHANCED CTA */}
            <section className="container mx-auto px-6 text-center text-reveal pb-20">
                <div className="max-w-3xl mx-auto py-24 px-10 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5">
                    <div className="space-y-6 mb-16">
                        <span className="text-gold-500/60 text-[10px] tracking-[0.6em] uppercase block font-black">The Next Step</span>
                        <h2 className="text-4xl md:text-6xl font-serif text-white tracking-widest uppercase italic leading-tight">
                            Create Your <br /> Legacy
                        </h2>
                    </div>

                    <div className="flex justify-center">
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
            </section>

        </div>
    );
};

export default Story;
