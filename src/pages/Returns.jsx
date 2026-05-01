import { motion } from 'framer-motion';
import { RefreshCcw, AlertTriangle, CheckCircle2, Package, Clock, ShieldAlert } from 'lucide-react';

const Returns = () => {
    return (
        <div className="bg-[#050505] min-h-screen text-white pt-20 md:pt-32 pb-16 px-6 font-sans selection:bg-gold-500/30">
            <div className="container mx-auto max-w-4xl">
                
                <header className="text-center mb-10 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2 }}
                    >
                        <p className="text-[10px] tracking-[0.6em] text-gold-500 uppercase font-black mb-4">Concierge Assistance</p>
                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif tracking-[0.1em] text-white uppercase mb-6">Return Policy</h1>
                        <div className="w-20 h-px bg-white/10 mx-auto mb-8"></div>
                        
                        <div className="bg-white/[0.02] border border-white/5 block mx-auto max-w-xl p-6 sm:p-8 md:p-10 mb-8 text-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gold-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                           <p className="text-[10px] md:text-xs tracking-[0.4em] font-black uppercase text-gold-500 mb-4 inline-flex items-center gap-4">
                              <Clock size={14} /> 7-Day Professional Window
                           </p>
                           <p className="text-white/40 text-[9px] md:text-[10px] tracking-widest uppercase leading-relaxed relative z-10">
                              Our Return Policy is valid for <span className="text-white">7 days</span> from the date of delivery. <br className="hidden sm:block" />
                              Note: Due to hygiene reasons, <span className="text-white">opened or used perfumes</span> are non-returnable.
                           </p>
                        </div>
                    </motion.div>
                </header>

                <div className="space-y-12 md:space-y-20">
                    {/* Eligibility Section */}
                    <section>
                        <h2 className="text-2xl md:text-3xl font-serif tracking-[0.2em] uppercase text-white mb-12 flex items-center gap-6">
                            <span className="text-xs text-white/20 font-sans tracking-widest">01</span> Eligibility for Returns
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                "The perfume must be unused, unopened, and untested",
                                "Product must be in original packaging with seals intact",
                                "The item must be in the same condition as received",
                                "A receipt or proof of purchase is required"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                                    <CheckCircle2 size={18} className="text-gold-500 flex-shrink-0 mt-1" />
                                    <p className="text-[11px] md:text-xs tracking-widest uppercase text-white/60 leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 md:mt-12 p-6 md:p-10 border border-red-500/10 bg-red-500/[0.01] flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                            <ShieldAlert className="text-red-500/40" size={32} strokeWidth={1} />
                            <p className="text-[10px] md:text-[11px] tracking-[0.2em] text-red-500/60 font-black uppercase italic leading-relaxed">
                                Due to the hygienic and personal nature of perfumes, we do NOT accept returns for products that have been opened, sprayed, or tampered with.
                            </p>
                        </div>
                    </section>

                    {/* Non-Returnable Items */}
                    <section className="bg-white/[0.03] p-8 md:p-20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gold-500" />
                        <h2 className="text-2xl font-serif tracking-[0.2em] uppercase text-white mb-12">Non-Returnable Items</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            {[
                                "Opened or used perfumes",
                                "Tester or sample perfumes",
                                "Gift cards",
                                "Sale or discounted items",
                                "Health or personal care items"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white/50 border-b border-white/5 pb-4">
                                    <div className="w-1 h-1 bg-gold-500 rounded-full" /> {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Damaged or Incorrect Items */}
                    <section className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-2xl font-serif tracking-[0.2em] uppercase text-white mb-8 italic italic-serif">Damaged or Incorrect Items</h2>
                            <p className="text-white/40 text-[13px] leading-[2.2] tracking-[0.1em] mb-12">
                                If you receive a perfume that is damaged, leaked, broken, or incorrect, please contact us within <span className="text-gold-500 font-bold">48 hours</span> of delivery with clear photos or videos of the product and packaging.
                            </p>
                            <div className="flex">
                                <a href="mailto:kiksultraluxury@gmail.com" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black text-[10px] font-black tracking-[0.4em] uppercase hover:bg-gold-500 transition-all shadow-xl w-full sm:w-auto">
                                    Report Issue
                                </a>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 p-8 md:p-12 bg-zinc-900/50 border border-white/5 flex flex-col items-center justify-center text-center">
                            <RefreshCcw size={48} className="text-gold-500 mb-8 opacity-20" />
                            <h3 className="text-lg font-serif tracking-widest uppercase mb-4">Exchanges</h3>
                            <p className="text-[10px] tracking-widest text-white/30 uppercase leading-loose">
                                We only replace items if they are defective, damaged, or incorrectly delivered. 
                                Request an exchange via our concierge at kiksultraluxury@gmail.com
                            </p>
                        </div>
                    </section>
                </div>

                <footer className="mt-20 md:mt-32 pt-16 border-t border-white/5 pb-16">
                     <div className="flex flex-col items-center">
                        <Package size={24} className="text-white/10 mb-8" strokeWidth={1} />
                        <p className="text-[9px] tracking-[0.6em] text-white/20 uppercase font-black">All returns subject to artisan inspection</p>
                     </div>
                </footer>

            </div>
        </div>
    );
};

export default Returns;
