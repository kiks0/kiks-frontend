import { motion } from 'framer-motion';
import { Scale, BookOpen, ShieldCheck, CreditCard, Truck, RefreshCcw } from 'lucide-react';

const Terms = () => {
    const sections = [
        {
            title: "1. Use of Website",
            icon: <Scale size={18} />,
            content: "You must be at least 18 years old to use this website or make a purchase. You agree to use the website for lawful purposes only."
        },
        {
            title: "2. Products & Orders",
            icon: <BookOpen size={18} />,
            content: "All perfumes are subject to availability. Product images are for representation purposes only. Prices may change without prior notice. We reserve the right to refuse or cancel orders at our discretion."
        },
        {
            title: "3. Payments",
            icon: <CreditCard size={18} />,
            content: "All payments are processed securely through Razorpay and other authorized payment gateways. We do not store your card or banking details on our servers."
        },
        {
            title: "4. Shipping & Delivery",
            icon: <Truck size={18} />,
            content: "Delivery timelines may vary depending on your location. Delays caused by courier services, weather conditions, or unforeseen circumstances are beyond our control."
        },
        {
            title: "5. Returns & Refunds",
            icon: <RefreshCcw size={18} />,
            content: "Returns and refunds are governed by our Return Policy and Refund Policy, available on our website. Due to hygiene and safety reasons, opened, used, or tampered perfume products are non-returnable and non-refundable."
        },
        {
            title: "6. Intellectual Property",
            icon: <ShieldCheck size={18} />,
            content: "All content on this website including logos, text, images, and design is the property of Kiks Ultra Luxury and may not be copied, reproduced, or distributed without written permission."
        }
    ];

    return (
        <div className="bg-[#050505] min-h-screen text-white pt-40 md:pt-56 pb-40 px-6 font-sans selection:bg-gold-500/30">
            <div className="container mx-auto max-w-5xl">
                
                <header className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <p className="text-[10px] tracking-[0.6em] text-gold-500 uppercase font-black mb-6">Foundations of Trust</p>
                        <h1 className="text-4xl md:text-7xl font-serif tracking-[0.1em] text-white uppercase mb-8 leading-tight">Terms & Conditions</h1>
                        <div className="w-20 h-px bg-white/10 mx-auto mb-10"></div>
                        <p className="text-white/40 text-[11px] font-medium tracking-[0.4em] uppercase max-w-2xl mx-auto leading-loose">
                            Welcome to Kiks Ultra Luxury. By accessing <span className="text-white">kiksultraluxury.com</span>, you agree to comply with and be bound by the following Terms and Conditions.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                    {sections.map((section, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className="relative group"
                        >
                            <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                                <div className="p-3 bg-white/[0.03] border border-white/10 text-gold-500 group-hover:bg-gold-500 group-hover:text-black transition-all duration-500">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-serif tracking-widest uppercase text-white group-hover:text-gold-400 transition-colors">
                                    {section.title}
                                </h2>
                            </div>
                            <p className="text-white/50 text-[13px] leading-[2] tracking-wide font-medium italic">
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Extended Terms in Footer of details */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-40 pt-20 border-t border-white/10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="space-y-4">
                            <h4 className="text-gold-500 text-[9px] tracking-[0.4em] font-black uppercase">7. Limitation of Liability</h4>
                            <p className="text-[11px] text-white/30 uppercase leading-loose tracking-widest">Kiks Ultra Luxury shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-gold-500 text-[9px] tracking-[0.4em] font-black uppercase">9. Governing Law</h4>
                            <p className="text-[11px] text-white/30 uppercase leading-loose tracking-widest">These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts located in Gujarat, India.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-gold-500 text-[9px] tracking-[0.4em] font-black uppercase">13. Contact Info</h4>
                            <p className="text-[11px] text-white/30 uppercase leading-loose tracking-widest italic">For any questions regarding these Terms and Conditions, contact us via kiksultraluxury@gmail.com</p>
                        </div>
                    </div>
                </motion.div>

                <footer className="mt-40 text-center">
                    <p className="text-[9px] tracking-[0.8em] text-white/10 uppercase font-black">Refining the Essence of Luxury Since 2026</p>
                </footer>

            </div>
        </div>
    );
};

export default Terms;
