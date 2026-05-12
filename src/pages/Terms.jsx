import { motion } from 'framer-motion';
import { Scale, BookOpen, ShieldCheck, CreditCard, Truck, RefreshCcw, AlertTriangle, Gavel, Mail } from 'lucide-react';

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
        },
        {
            title: "7. Limitation of Liability",
            icon: <AlertTriangle size={18} />,
            content: "Kiks Ultra Luxury shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products."
        },
        {
            title: "8. Governing Law",
            icon: <Gavel size={18} />,
            content: "These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts located in Gujarat, India."
        },
        {
            title: "9. Contact Info",
            icon: <Mail size={18} />,
            content: "For any questions regarding these Terms and Conditions, please contact our support team at kiksultraluxury@gmail.com. We are here to assist you 24/7."
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
                        <p className="text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] text-gold-500 uppercase font-black mb-6 not-italic">Foundations of Trust</p>
                        <h1 className="text-xl sm:text-5xl md:text-7xl font-serif tracking-normal md:tracking-[0.1em] text-black uppercase mb-8 leading-tight break-words not-italic font-normal">
                            Terms & Conditions
                        </h1>
                        <div className="w-16 md:w-20 h-px bg-black/10 mx-auto mb-8"></div>
                        <p className="text-black/40 text-[10px] md:text-[11px] font-normal tracking-[0.2em] md:tracking-[0.4em] uppercase max-w-2xl mx-auto leading-loose break-words not-italic">
                            Welcome to Kiks Ultra Luxury. By accessing <span className="text-black font-bold">kiksultraluxury.com</span>, you agree to comply with and be bound by the following Terms and Conditions.
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

export default Terms;
