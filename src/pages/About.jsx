import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Globe, Shield, Wind, Droplets, Sparkles } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-white min-h-screen text-black pt-28 md:pt-32 pb-20 md:pb-32 px-5 md:px-12 font-sans overflow-hidden selection:bg-black selection:text-white">
            
            {/* HERO: THE MAISON SECTION */}
            <section className="container mx-auto max-w-7xl relative mb-20 md:mb-32">
                <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-24 relative">
                    
                    {/* Floating Brand Label - Fixed Positioning */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute -left-4 md:-left-12 top-0 vertical-text hidden xl:block"
                    >
                        <span className="text-[9px] tracking-[1em] uppercase font-black text-black/40">ESTABLISHED 2026 — INDIA</span>
                    </motion.div>

                    <div className="w-full lg:w-[50%] z-10">

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                                opacity: 0,
                                transition: { duration: 0.4, ease: "easeOut" }
                            }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.2] md:leading-[0.95] tracking-tight mt-12 md:mt-20 mb-8 md:mb-16 italic-serif"
                        >
                            Defining <br className="hidden md:block" />
                            <span className="text-gold-600">The New</span> <br className="hidden md:block" />
                            Presence
                        </motion.h1>


                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-black/60 text-sm md:text-lg leading-[1.8] font-normal max-w-lg mb-10 md:mb-0"
                        >
                            KIKS is an independent perfume Maison born from a singular obsession: to create fragrances that don't just linger, but command the space around them.
                        </motion.p>
                    </div>

                    {/* Asymmetric Image Composition */}
                    <div className="w-full lg:w-[50%] relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-zinc-50 border border-black/5"
                        >
                            <img 
                                src="https://res.cloudinary.com/dprxiz6os/image/upload/v1778429853/kiks_general/kiks-1778429852010-758699176_xco2ys.jpg" 
                                alt="KIKS Scent Design" 
                                className="w-full h-full object-cover grayscale brightness-105"
                            />
                        </motion.div>

                        {/* Floating Text Overlay - Balanced and Responsive */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 md:translate-x-0 md:-bottom-10 md:-left-20 bg-white p-6 md:p-12 border border-black/5 shadow-2xl w-[90%] md:max-w-xs z-20"
                        >
                             <h4 className="text-[10px] tracking-[0.4em] font-black uppercase mb-4 text-gold-600">Our Manifesto</h4>
                             <p className="text-[10px] md:text-[12px] leading-loose tracking-widest text-black/60 uppercase italic">
                                 "We do not craft perfumes for the masses. We craft them for the individual who seeks to be unforgettable."
                             </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* PHILOSOPHY: THE THREE PILLARS (EDITORIAL GRID) */}
            <section className="container mx-auto max-w-7xl mb-24 md:mb-32">
                <div className="grid grid-cols-1 2xl:grid-cols-12 gap-12 lg:gap-24 items-center">
                    <div className="2xl:col-span-6 border-l border-black/10 pl-8 md:pl-12 py-6 md:py-10">
                        <h2 className="text-[26px] xs:text-3xl md:text-5xl font-serif tracking-tighter md:tracking-tight mb-6 md:mb-8 leading-[1.1] break-words">Our <br /> Standards</h2>
                        <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-black/40 font-bold leading-loose max-w-sm">
                            Every bottle is a testament to our commitment to artisanal integrity and technical mastery.
                        </p>
                    </div>
                    
                    <div className="2xl:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/10 border border-black/10 overflow-hidden shadow-2xl">
                        {[
                            { title: "Pure Concentration", desc: "Premium oil concentrations ensuring long-lasting performance throughout the day." },
                            { title: "Rare Sourcing", desc: "Directly sourcing premium ingredients from key global regions to ensure unmatched quality." },
                            { title: "Small Batch", desc: "Limited production runs to ensure quality control and product exclusivity." },
                            { title: "Sustainably Crafted", desc: "Commitment to ethical sourcing and responsible packaging practices." }
                        ].map((pillar, i) => (
                            <div key={i} className="bg-white p-10 md:p-16 hover:bg-zinc-50 transition-all duration-700 group border-b md:border-b-0 border-black/5 last:border-0">
                                <div className="text-[9px] text-gold-600 font-black tracking-widest mb-6 block uppercase">0{i+1} —</div>
                                <h3 className="text-lg md:text-xl font-serif tracking-widest uppercase mb-6 group-hover:text-gold-700 transition-colors leading-relaxed">{pillar.title}</h3>
                                <p className="text-[11px] md:text-[12px] tracking-widest text-black/50 leading-relaxed uppercase font-medium">{pillar.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ARTISTRY SECTION: IMAGE HEAVY EDITORIAL */}
            <section className="bg-zinc-50 py-24 md:py-32 mb-24 md:mb-32">
                <div className="container mx-auto max-w-7xl px-5">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                         <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="w-full lg:w-1/2"
                         >
                            <div className="relative aspect-square md:aspect-[4/3] overflow-hidden shadow-2xl border border-black/5">
                                <img 
                                    src="https://res.cloudinary.com/dprxiz6os/image/upload/v1778389428/kiks_general/kiks-1778389426960-514260214_cpag5g.webp" 
                                    alt="Scent Alchemy" 
                                    className="w-full h-full object-cover grayscale contrast-110"
                                />
                            </div>
                         </motion.div>
                         <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="w-full lg:w-1/2 space-y-8 md:space-y-12"
                         >
                            <h3 className="text-3xl md:text-6xl font-serif tracking-tight leading-tight">OUR <br /> CRAFT</h3>
                            <div className="w-12 md:w-16 h-px bg-gold-600" />
                            <p className="text-black/60 text-base md:text-lg leading-relaxed max-w-lg">
                                We treat perfume as a high art. Each blend is matured in darkness for months, allowing the molecular structure to evolve into its final, perfect form.
                            </p>
                            <div className="flex items-center gap-8 md:gap-10 pt-4">
                                <div>
                                    <span className="block text-xl md:text-2xl font-serif mb-1">2026</span>
                                    <span className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-black/40 font-bold">ESTABLISHED</span>
                                </div>
                                <div className="w-px h-10 md:h-12 bg-black/10" />
                                <div>
                                    <span className="block text-xl md:text-2xl font-serif mb-1">GLOBAL</span>
                                    <span className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-black/40 font-bold">PRESENCE</span>
                                </div>
                            </div>
                         </motion.div>
                    </div>
                </div>
            </section>

            {/* FINAL LUXURY CALLOUT */}
            <section className="container mx-auto max-w-5xl text-center py-20 md:py-24">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="space-y-10 md:space-y-12"
                >
                    <p className="text-[9px] md:text-[10px] tracking-[0.8em] uppercase text-black/60 font-black">SHOP THE COLLECTION</p>
                    <h2 className="text-3xl md:text-6xl lg:text-7xl font-serif leading-tight italic-serif">
                        Presence is not seen. <br />
                        It is felt.
                    </h2>
                    <Link 
                        to="/collection/arambh" 
                        className="inline-block border border-black px-10 md:px-14 py-4 md:py-5 text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] font-black uppercase hover:bg-black hover:text-white transition-all duration-500"
                    >
                        Explore Collection
                    </Link>
                </motion.div>
            </section>

            {/* Footer Minimal Detail */}
            <div className="flex items-center justify-center space-x-8 md:space-x-12 opacity-30 mt-10 md:mt-20">
                <div className="w-8 md:w-12 h-px bg-black/20" />
                <Zap size={16} />
                <Globe size={16} />
                <Shield size={16} />
                <div className="w-8 md:w-12 h-px bg-black/20" />
            </div>
        </div>
    );
};

export default About;

