import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Lock, Database, UserCheck } from 'lucide-react';

const PrivacyPolicy = () => {
    const sections = [
        {
            title: "1. Data Collection",
            icon: <Eye size={18} />,
            content: "We collect information you provide directly to us when you make a purchase, create an account, or subscribe to our newsletter. This may include your name, email, phone number, and delivery address."
        },
        {
            title: "2. How We Use Data",
            icon: <UserCheck size={18} />,
            content: "Your data is used to process orders, personalize your experience, and keep you updated on our latest collections. We never sell your personal information to third parties."
        },
        {
            title: "3. Secure Payments",
            icon: <Lock size={18} />,
            content: "All financial transactions are handled through encrypted payment gateways (Razorpay). We do not store sensitive payment information like credit card numbers on our servers."
        },
        {
            title: "4. Cookies & Tracking",
            icon: <Database size={18} />,
            content: "We use cookies to improve our website's performance and understand how you interact with our boutique. You can choose to disable cookies in your browser settings at any time."
        },
        {
            title: "5. Your Rights",
            icon: <ShieldCheck size={18} />,
            content: "You have the right to access, correct, or delete your personal information. If you wish to manage your data, please contact our privacy concierge at kiksultraluxury@gmail.com."
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
                        <p className="text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] text-gold-500 uppercase font-black mb-6 not-italic">Privacy & Protection</p>
                        <h1 className="text-2xl sm:text-5xl md:text-7xl font-serif tracking-normal md:tracking-[0.1em] text-black uppercase mb-8 leading-tight break-words not-italic font-normal">
                            Privacy Policy
                        </h1>
                        <div className="w-16 md:w-20 h-px bg-black/10 mx-auto mb-8"></div>
                        <p className="text-black/40 text-[10px] md:text-[11px] font-normal tracking-[0.2em] md:tracking-[0.4em] uppercase max-w-2xl mx-auto leading-loose break-words not-italic">
                            Your security is our commitment. Learn how we safeguard your information at <span className="text-black font-bold">kiksultraluxury.com</span>.
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

export default PrivacyPolicy;
