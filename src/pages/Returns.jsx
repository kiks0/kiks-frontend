import { motion } from 'framer-motion';
import { RotateCcw, Shield, Box, HelpCircle, CheckCircle } from 'lucide-react';

const Returns = () => {
    const sections = [
        {
            title: "1. Return Window",
            icon: <RotateCcw size={18} />,
            content: "You have 7 days from the date of delivery to initiate a return. Requests made after this period will not be accepted. We recommend inspecting your order immediately upon arrival."
        },
        {
            title: "2. Condition of Item",
            icon: <Box size={18} />,
            content: "To be eligible for a return, the perfume must be in its original packaging, unopened, and unused. Items that show signs of usage or tampering are strictly non-returnable due to hygiene reasons."
        },
        {
            title: "3. Proof of Purchase",
            icon: <Shield size={18} />,
            content: "All returns must be accompanied by an original invoice or order confirmation. We cannot process returns without valid proof of purchase from our official boutique."
        },
        {
            title: "4. Return Process",
            icon: <HelpCircle size={18} />,
            content: "To start a return, contact our concierge at kiksultraluxury@gmail.com. If your return is accepted, we will send you instructions on how and where to send your package."
        },
        {
            title: "5. Inspection",
            icon: <CheckCircle size={18} />,
            content: "Once we receive your returned item, it will undergo a quality check. We reserve the right to deny a return if the item does not meet our required standards."
        }
    ];

    return (
        <div className="bg-white min-h-screen text-black pt-28 md:pt-48 pb-20 md:pb-32 px-5 md:px-12 font-sans selection:bg-black/10">
            <div className="container mx-auto max-w-5xl">
                <header className="text-center mb-16 md:mb-24 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <p className="text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] text-gold-500 uppercase font-black mb-6 not-italic">Commitment to Quality</p>
                        <h1 className="text-2xl sm:text-5xl md:text-7xl font-serif tracking-normal md:tracking-[0.1em] text-black uppercase mb-8 leading-tight break-words not-italic font-normal">
                            Return Policy
                        </h1>
                        <div className="w-16 md:w-20 h-px bg-black/10 mx-auto mb-8"></div>
                        <p className="text-black/40 text-[10px] md:text-[11px] font-normal tracking-[0.2em] md:tracking-[0.4em] uppercase max-w-2xl mx-auto leading-loose break-words not-italic">
                            We ensure every bottle meets our standard. Please read our guidelines for returns at <span className="text-black font-bold">kiksultraluxury.com</span>.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-24">
                    {sections.map((section, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className="relative group p-6 md:p-8 bg-black/[0.01] border border-black/5"
                        >
                            <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 border-b border-black/5 pb-4 md:pb-6">
                                <div className="p-2.5 md:p-3 bg-black/[0.03] border border-black/10 text-gold-500 group-hover:bg-gold-500 group-hover:text-white transition-all duration-500 flex-shrink-0">
                                    {section.icon}
                                </div>
                                <h2 className="text-lg md:text-xl font-serif tracking-widest uppercase text-black group-hover:text-gold-600 transition-colors leading-snug break-words not-italic font-normal">
                                    {section.title}
                                </h2>
                            </div>
                            <p className="text-black/60 text-[11px] md:text-[12px] uppercase tracking-[0.1em] font-medium leading-loose not-italic break-words">
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>


            </div>
        </div>
    );
};

export default Returns;
