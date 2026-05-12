import { motion } from 'framer-motion';
import { RefreshCcw, ShieldCheck, Clock, CheckCircle, Package } from 'lucide-react';

const RefundPolicy = () => {
    const sections = [
        {
            title: "1. Eligibility for Refund",
            icon: <RefreshCcw size={18} />,
            content: "Refunds are only issued for products that are returned in their original, unopened, and unused condition within 7 days of delivery. Due to hygiene and safety standards, opened or used perfumes cannot be refunded."
        },
        {
            title: "2. Processing Time",
            icon: <Clock size={18} />,
            content: "Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 5-7 business days."
        },
        {
            title: "3. Refund Method",
            icon: <ShieldCheck size={18} />,
            content: "Refunds will be credited back to the original payment method used during the purchase. Please note that banks may take additional time to reflect the credit in your account."
        },
        {
            title: "4. Shipping Costs",
            icon: <Package size={18} />,
            content: "Original shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your total refund amount unless the return is due to our error."
        },
        {
            title: "5. Damaged Goods",
            icon: <CheckCircle size={18} />,
            content: "If you receive a damaged or defective product, please contact us within 24 hours of delivery with photographic evidence. We will provide a full refund or a replacement at no extra cost."
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
                        <p className="text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] text-gold-500 uppercase font-black mb-6 not-italic">Fairness & Integrity</p>
                        <h1 className="text-2xl sm:text-5xl md:text-7xl font-serif tracking-normal md:tracking-[0.1em] text-black uppercase mb-8 leading-tight break-words not-italic font-normal">
                            Refund Policy
                        </h1>
                        <div className="w-16 md:w-20 h-px bg-black/10 mx-auto mb-8"></div>
                        <p className="text-black/40 text-[10px] md:text-[11px] font-normal tracking-[0.2em] md:tracking-[0.4em] uppercase max-w-2xl mx-auto leading-loose break-words not-italic">
                            Your satisfaction is our priority. Please review our refund guidelines to ensure a smooth experience at <span className="text-black font-bold">kiksultraluxury.com</span>.
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

export default RefundPolicy;
