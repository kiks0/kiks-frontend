import { motion } from 'framer-motion';
import { ShieldCheck, Info, AlertTriangle, ExternalLink, Activity } from 'lucide-react';

const Disclaimer = () => {
    return (
        <div className="bg-[#050505] min-h-screen text-white pt-24 md:pt-32 pb-24 px-6 font-sans selection:bg-gold-500/30">
            <div className="container mx-auto max-w-4xl">
                
                <header className="text-center mb-16 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <p className="text-[10px] tracking-[0.4em] md:tracking-[0.6em] text-gold-500 uppercase font-black mb-4">Legal Transparency</p>
                        <h1 className="text-4xl md:text-7xl font-serif tracking-[0.1em] text-white uppercase mb-6">Disclaimer</h1>
                        <div className="w-16 h-px bg-white/10 mx-auto"></div>
                    </motion.div>
                </header>

                <div className="space-y-12 md:space-y-16">
                    
                    <section className="bg-white/[0.02] border border-white/5 p-8 md:p-12">
                         <div className="flex items-start gap-6 md:gap-8">
                            <Info className="text-gold-500 hidden md:block" size={24} strokeWidth={1.5} />
                            <div>
                                <h3 className="text-lg md:text-xl font-serif tracking-widest uppercase text-white mb-4">General Information</h3>
                                <p className="text-white/40 text-[12px] md:text-[13px] leading-relaxed md:leading-[2.2] tracking-wide">
                                    The information provided on <span className="text-white">kiksultraluxury.com</span> is for general informational purposes only. 
                                    All perfumes and related products sold on our website are intended for external use only. Individual results, 
                                    fragrance longevity, and scent perception may vary depending on skin type, environment, and personal sensitivity. 
                                    We do not guarantee specific outcomes such as attraction, emotional response, or health benefits from the use of our products.
                                </p>
                            </div>
                         </div>
                    </section>

                    <section className="bg-zinc-900 border border-white/5 p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/[0.03] blur-[100px] pointer-events-none" />
                        <h3 className="text-lg md:text-xl font-serif tracking-widest uppercase text-gold-500 mb-8 flex items-center gap-4">
                           <Activity size={20} /> Allergy & Sensitivity Notice
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            <ul className="space-y-4 md:space-y-6 text-[9px] md:text-[11px] font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase text-white/60">
                                <li className="flex items-center gap-4 border-b border-white/5 pb-3"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Some perfumes may cause allergic reactions</li>
                                <li className="flex items-center gap-4 border-b border-white/5 pb-3"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Review descriptions carefully</li>
                                <li className="flex items-center gap-4 border-b border-white/5 pb-3"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Conduct a patch test before use</li>
                            </ul>
                            <p className="text-white/30 text-[10px] md:text-[11px] leading-loose tracking-[0.1em] uppercase border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12 font-black italic">
                                Kiks Ultra Luxury shall not be held responsible for any adverse reactions resulting from the use of our products.
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
                        <div className="p-8 md:p-12 border border-white/5 bg-white/[0.01]">
                            <h3 className="text-base md:text-lg font-serif tracking-widest uppercase mb-6 text-white border-b border-white/5 pb-4 flex items-center gap-4">
                               <ExternalLink size={16} className="text-gold-500" /> External Links
                            </h3>
                            <p className="text-white/40 text-[12px] md:text-[13px] leading-relaxed tracking-wide font-medium italic">
                                Our website may contain links to third-party websites. We do not control or take responsibility for the content, 
                                privacy policies, or practices of these external sites.
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-white/5 bg-white/[0.01]">
                            <ShieldCheck size={32} md:size={40} strokeWidth={1} className="text-gold-400 mb-6 opacity-30" />
                            <p className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] text-white/50 uppercase leading-loose font-black max-w-xs">
                                By using our website and purchasing our products, you agree to this disclaimer.
                            </p>
                        </div>
                    </section>
                </div>

                <footer className="mt-20 md:mt-32 text-center border-t border-white/5 pt-12 md:pt-16">
                     <p className="text-[9px] tracking-[0.3em] md:tracking-[0.4em] text-white/10 uppercase font-black">Refining Awareness in the World of Scent</p>
                </footer>

            </div>
        </div>
    );
};

export default Disclaimer;
