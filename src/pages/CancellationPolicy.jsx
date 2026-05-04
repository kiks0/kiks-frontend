import { motion } from 'framer-motion';
import { XCircle, Clock, CreditCard, Mail, AlertCircle, Search } from 'lucide-react';

const CancellationPolicy = () => {
    return (
        <div className="bg-[#050505] min-h-screen text-white pt-32 md:pt-48 pb-20 px-6 font-sans selection:bg-gold-500/30">
            <div className="container mx-auto max-w-4xl">

                {/* Header */}
                <header className="text-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <p className="text-[10px] tracking-[0.6em] text-gold-500 uppercase font-black mb-6">Order Modification</p>
                        <h1 className="text-4xl md:text-7xl font-serif tracking-[0.1em] text-white uppercase mb-8">Cancellation Policy</h1>
                        <div className="w-20 h-px bg-white/10 mx-auto"></div>
                    </motion.div>
                </header>

                <div className="space-y-16 md:space-y-24">

                    {/* Time Sensitive Alert */}
                    <section className="bg-white/[0.01] border border-white/5 p-12 md:p-24 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gold-500/30"></div>
                        <Clock className="text-gold-500/20 mx-auto mb-12" size={42} strokeWidth={1} />
                        <h3 className="text-2xl md:text-4xl font-serif tracking-[0.2em] uppercase text-white mb-10">Time Sensitive</h3>
                        <div className="space-y-6">
                            <p className="text-white/40 text-[11px] md:text-[12px] tracking-[0.3em] uppercase max-w-xl mx-auto leading-loose italic">
                                "To maintain our rapid delivery standards, orders are processed immediately upon confirmation."
                            </p>
                            <p className="text-gold-500/80 text-[13px] md:text-[15px] tracking-[0.5em] font-black uppercase">
                                Cancellations are only possible if the order is "On Hold" or "Processing"
                            </p>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gold-500/30"></div>
                    </section>

                    {/* Process Steps */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                        <div className="space-y-12">
                            <div className="border-l border-gold-500 pl-6 md:pl-8 space-y-4">
                                <h3 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-4">
                                    <XCircle size={18} className="text-gold-500" /> How to Cancel
                                </h3>
                                <p className="text-white/40 text-[13px] leading-relaxed tracking-wide">
                                    If your order is currently <span className="text-gold-500 font-bold italic">On Hold</span> or <span className="text-gold-500 font-bold italic">Processing</span>, it can be canceled directly from your <span className="text-white font-bold uppercase">Order History</span> page. Once an order reaches <span className="text-red-500 font-bold italic">Dispatch</span> or <span className="text-red-500 font-bold italic">In Transit</span>, cancellation is no longer possible. For assistance, contact our concierge at <span className="text-gold-500 underline font-bold">kiksultraluxury@gmail.com</span>.
                                </p>
                            </div>
                            <div className="border-l border-gold-500 pl-6 md:pl-8 space-y-4">
                                <h3 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-4">
                                    <CreditCard size={18} className="text-gold-500" /> Refund Process
                                </h3>
                                <p className="text-white/40 text-[13px] leading-relaxed tracking-wide">
                                    If your cancellation is approved before dispatch, a full refund will be initiated to your original payment method. Please allow <span className="text-white font-bold">5–10 business days</span> for the funds to reflect in your account.
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#0f0f0f] border border-white/5 p-8 md:p-12 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[80px] group-hover:bg-red-500/10 transition-colors" />
                            <h3 className="text-[11px] font-black tracking-[0.4em] uppercase text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-4">
                                <AlertCircle size={14} className="text-red-500" /> Late Requests
                            </h3>
                            <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-8 leading-loose">Once your order reaches the following stages, cancellation is no longer possible:</p>
                            <ul className="space-y-4 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                                <li className="flex items-center gap-4 border-l border-red-500/30 pl-4">Dispatch / Dispatched</li>
                                <li className="flex items-center gap-4 border-l border-red-500/30 pl-4">In Transit / Delivered</li>
                                <li className="flex items-center gap-4 text-red-400">Return shipping costs will apply for refused deliveries</li>
                            </ul>
                        </div>
                    </section>

                </div>

                <footer className="mt-20 md:mt-32 text-center border-t border-white/5 pt-16">
                    <p className="text-[9px] tracking-[0.4em] text-white/10 uppercase font-black">Securing Your Luxury Investment</p>
                </footer>

            </div>
        </div>
    );
};

export default CancellationPolicy;
