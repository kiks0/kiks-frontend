import { motion } from 'framer-motion';
import { CreditCard, Landmark, Mail, AlertCircle, CheckCircle2, Search } from 'lucide-react';

const RefundPolicy = () => {
    return (
        <div className="bg-[#050505] min-h-screen text-white pt-40 md:pt-56 pb-40 px-6 font-sans selection:bg-gold-500/30">
            <div className="container mx-auto max-w-4xl">
                
                {/* Header */}
                <header className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <p className="text-[10px] tracking-[0.6em] text-gold-500 uppercase font-black mb-6">Financial Assurance</p>
                        <h1 className="text-4xl md:text-7xl font-serif tracking-[0.1em] text-white uppercase mb-8">Refund Policy</h1>
                        <div className="w-20 h-px bg-white/10 mx-auto"></div>
                    </motion.div>
                </header>

                <div className="space-y-32">
                    
                    {/* Process Steps */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                        <div className="space-y-12">
                            <div className="border-l border-gold-500 pl-8 space-y-4">
                                <h3 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-4">
                                   <Search size={18} className="text-gold-500" /> Approval Process
                                </h3>
                                <p className="text-white/40 text-[13px] leading-relaxed tracking-wide">
                                    Once your returned item is received and inspected, we will notify you by email regarding the approval or rejection of your refund. 
                                    Refunds are approved only if the product meets our return eligibility conditions.
                                </p>
                            </div>
                            <div className="border-l border-gold-500 pl-8 space-y-4">
                                <h3 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-4">
                                   <CreditCard size={18} className="text-gold-500" /> Refund Method
                                </h3>
                                <p className="text-white/40 text-[13px] leading-relaxed tracking-wide">
                                    If approved: Your refund will be processed to your original payment method. 
                                    Refunds are usually completed within <span className="text-white font-bold">5–10 business days</span>, depending on your bank or payment provider.
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#0f0f0f] border border-white/5 p-12 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[80px] group-hover:bg-gold-500/10 transition-colors" />
                            <h3 className="text-[11px] font-black tracking-[0.4em] uppercase text-white mb-8 border-b border-white/10 pb-4">Partial Refunds</h3>
                            <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-8 leading-loose">Partial refunds may be granted in specific cases:</p>
                            <ul className="space-y-4 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                                <li className="flex items-center gap-4"><CheckCircle2 size={12} className="text-gold-500" /> Packaging damage not caused by us</li>
                                <li className="flex items-center gap-4"><CheckCircle2 size={12} className="text-gold-500" /> Missing original box or accessories</li>
                                <li className="flex items-center gap-4"><CheckCircle2 size={12} className="text-gold-500" /> Return requested after the approved timeframe</li>
                            </ul>
                        </div>
                    </section>

                    {/* Critical Alert */}
                    <section className="bg-red-900/[0.03] border border-red-500/10 p-12 md:p-16 text-center">
                        <AlertCircle className="text-red-500 mx-auto mb-8" size={32} strokeWidth={1} />
                        <h3 className="text-xl font-serif tracking-[0.15em] uppercase text-white mb-6 underline decoration-red-900 decoration-4 underline-offset-8">Non-Refundable Items</h3>
                        <p className="text-red-400 text-[10px] md:text-[11px] tracking-[0.3em] font-black uppercase max-w-2xl mx-auto italic">
                             Due to hygiene and safety reasons, opened, used, sprayed, or tampered perfume products are strictly non-refundable.
                        </p>
                    </section>

                    {/* Missing Refunds */}
                    <section className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
                         <div className="w-full md:w-1/2">
                            <h3 className="text-2xl font-serif tracking-widest uppercase text-white mb-8">Late or Missing Refunds</h3>
                            <div className="space-y-4">
                                {[
                                    "Recheck your bank account",
                                    "Contact your credit card company",
                                    "Contact your bank for processing status"
                                ].map((step, i) => (
                                    <p key={i} className="text-[11px] tracking-[0.2em] text-white/30 uppercase pb-3 border-b border-white/5 flex items-center gap-4">
                                        <Landmark size={14} className="text-gold-500" /> {step}
                                    </p>
                                ))}
                            </div>
                            <p className="mt-8 text-xs tracking-widest text-white/40 leading-relaxed uppercase">
                                If the issue persists, contact our financial concierge at <span className="text-gold-500 font-bold underline">kiksultraluxury@gmail.com</span>
                            </p>
                         </div>
                         <div className="w-full md:w-1/2 bg-white/[0.01] border border-white/10 p-12 space-y-8">
                             <h4 className="text-[10px] tracking-[0.5em] font-black uppercase text-gold-500 italic">Shipping Note</h4>
                             <p className="text-[11px] tracking-widest text-white/50 leading-loose uppercase italic">
                                 Customers are responsible for return shipping costs. We recommend using a trackable courier service for high-value perfumes. Shipping charges are non-refundable.
                             </p>
                             <div className="flex items-center gap-6 opacity-40">
                                <Landmark size={20} strokeWidth={1} />
                                <CreditCard size={20} strokeWidth={1} />
                                <Mail size={20} strokeWidth={1} />
                             </div>
                         </div>
                    </section>

                </div>

                <footer className="mt-40 text-center border-t border-white/5 pt-20">
                     <p className="text-[9px] tracking-[0.4em] text-white/10 uppercase font-black">Securing Your Luxury Investment</p>
                </footer>

            </div>
        </div>
    );
};

export default RefundPolicy;
