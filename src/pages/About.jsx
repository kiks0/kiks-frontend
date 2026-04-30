import { motion } from 'framer-motion';
import { Sparkles, Wind, Droplets, Zap, Shield, Globe } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-black min-h-screen text-white pt-[100px] md:pt-[180px] pb-40 px-6 font-sans overflow-hidden">
            
            {/* HERITAGE SECTION */}
            <section className="container mx-auto max-w-7xl relative mb-40">
                <div className="absolute -top-10 md:-top-20 right-0 text-[5rem] md:text-[20rem] font-serif font-black text-white/[0.02] pointer-events-none select-none">KIKS</div>
                
                <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2 }}
                        className="w-full md:w-1/2"
                    >
                        <p className="text-[10px] tracking-[0.8em] text-gold-500 uppercase font-black mb-8">Establishment 2026</p>
                        <h1 className="text-5xl md:text-8xl font-serif tracking-[0.05em] leading-tight mb-12 uppercase italic-serif">
                             Our Story <br /> 
                             <span className="text-gold-500">of Scent</span>
                        </h1>
                        <p className="text-white/40 text-sm md:text-lg leading-[2.2] tracking-wide mb-12 max-w-xl">
                            At Kiks Ultra Luxury, we believe perfume is more than just a scent, it’s a part of who you are. 
                            We focus on creating long-lasting, high-quality fragrances that make a statement without saying a word.
                        </p>
                        <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/10">
                            <div>
                                <h4 className="text-white text-xs tracking-[0.4em] font-black uppercase mb-4">Vision</h4>
                                <p className="text-[11px] text-white/30 uppercase leading-loose tracking-widest">To become the silent signature of the world's most discerning individuals.</p>
                            </div>
                            <div>
                                <h4 className="text-white text-xs tracking-[0.4em] font-black uppercase mb-4">Craft</h4>
                                <p className="text-[11px] text-white/30 uppercase leading-loose tracking-widest">Sourcing only the rarest molecules and natural absolutes from across the globe.</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="w-full md:w-1/2 relative group"
                    >
                        <div className="aspect-[4/5] bg-zinc-900 overflow-hidden relative border border-white/5">
                            <img 
                                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=2000" 
                                alt="Maison Kiks" 
                                className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>
                        <div className="absolute -bottom-8 -right-8 bg-gold-500 w-48 h-48 flex items-center justify-center p-8 text-black text-center hidden lg:flex shadow-2xl">
                             <p className="text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed italic">
                                "The final touch of any masterpiece is the air that surrounds it."
                             </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* THE FOUR PILLARS */}
            <section className="bg-white/[0.02] py-40 border-y border-white/5 relative">
                 <div className="container mx-auto max-w-6xl px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-2xl md:text-4xl font-serif tracking-[0.3em] uppercase mb-6">Our Quality Standards</h2>
                        <div className="w-16 h-px bg-gold-400 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                        <motion.div 
                            whileHover={{ y: -10 }} 
                            className="space-y-8 p-12 hover:bg-white/[0.01] transition-all border border-transparent hover:border-white/5"
                        >
                            <Wind className="mx-auto text-gold-500 opacity-40" size={32} strokeWidth={1} />
                            <h3 className="text-xs tracking-[0.5em] font-black uppercase">Concentration</h3>
                            <p className="text-[10px] tracking-widest text-white/30 uppercase leading-loose">
                                Every KIKS perfume is highly concentrated, ensuring a long-lasting scent that stays with you and the people around you.
                            </p>
                        </motion.div>
                        <motion.div 
                            whileHover={{ y: -10 }} 
                            className="space-y-8 p-12 hover:bg-white/[0.01] transition-all border border-transparent hover:border-white/5"
                        >
                            <Droplets className="mx-auto text-gold-500 opacity-40" size={32} strokeWidth={1} />
                            <h3 className="text-xs tracking-[0.5em] font-black uppercase">Sourcing</h3>
                            <p className="text-[10px] tracking-widest text-white/30 uppercase leading-loose">
                                From the rose fields of Grasse to the deep forests of Vietnam, our ingredients are harvested with reverence for the earth.
                            </p>
                        </motion.div>
                        <motion.div 
                            whileHover={{ y: -10 }} 
                            className="space-y-8 p-12 hover:bg-white/[0.01] transition-all border border-transparent hover:border-white/5"
                        >
                            <Sparkles className="mx-auto text-gold-500 opacity-40" size={32} strokeWidth={1} />
                            <h3 className="text-xs tracking-[0.5em] font-black uppercase">Exclusivity</h3>
                            <p className="text-[10px] tracking-widest text-white/30 uppercase leading-loose">
                                We make our perfumes in small, exclusive batches. Owning a KIKS fragrance means you have something truly special.
                            </p>
                        </motion.div>
                    </div>
                 </div>
            </section>

            {/* FINAL QUOTE */}
            <section className="py-60 flex items-center justify-center text-center">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="max-w-4xl px-10"
                >
                    <h2 className="text-3xl md:text-6xl font-serif tracking-widest uppercase mb-12 leading-tight italic opacity-80 decoration-gold-500 decoration-1">
                        "Luxury is the ease of a t-shirt in a very expensive perfume."
                    </h2>
                    <p className="text-[10px] tracking-[0.8em] uppercase text-gold-500 font-bold">Kiks Ultra Luxury — Defining Presence</p>
                </motion.div>
            </section>

            <footer className="pb-20 text-center">
                 <div className="flex items-center justify-center space-x-12 opacity-10 grayscale hover:grayscale-0 transition-all duration-1000">
                    <Zap size={20} />
                    <Globe size={20} />
                    <Shield size={20} />
                 </div>
            </footer>
        </div>
    );
};

export default About;

