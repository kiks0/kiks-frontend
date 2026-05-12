import { motion } from 'framer-motion';
import { AlertCircle, Shield, Info, Scale, CheckCircle } from 'lucide-react';

const Disclaimer = () => {
    const sections = [
        {
            title: "1. Information Accuracy",
            icon: <Info size={18} />,
            content: "While we strive for perfection, Kiks Ultra Luxury does not guarantee that all product descriptions, pricing, or other content on this website are 100% accurate, complete, or error-free."
        },
        {
            title: "2. Color & Perception",
            icon: <Shield size={18} />,
            content: "We make every effort to display product colors as accurately as possible. However, actual colors may vary depending on your monitor settings and digital perception."
        },
        {
            title: "3. Health & Safety",
            icon: <AlertCircle size={18} />,
            content: "Our perfumes are for external use only. We recommend performing a patch test before full application. We are not responsible for any allergic reactions or sensitivities to ingredients."
        },
        {
            title: "4. External Links",
            icon: <Scale size={18} />,
            content: "This website may contain links to third-party sites. We are not responsible for the content, privacy policies, or practices of any third-party websites."
        },
        {
            title: "5. Brand Representation",
            icon: <CheckCircle size={18} />,
            content: "Kiks Ultra Luxury is an independent boutique. All brand names and trademarks mentioned are the property of their respective owners and are used for identification purposes only."
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
                        <p className="text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] text-gold-500 uppercase font-black mb-6 not-italic">Clarity & Transparency</p>
                        <h1 className="text-2xl sm:text-5xl md:text-7xl font-serif tracking-normal md:tracking-[0.1em] text-black uppercase mb-8 leading-tight break-words not-italic font-normal">
                            Disclaimer
                        </h1>
                        <div className="w-16 md:w-20 h-px bg-black/10 mx-auto mb-8"></div>
                        <p className="text-black/40 text-[10px] md:text-[11px] font-normal tracking-[0.2em] md:tracking-[0.4em] uppercase max-w-2xl mx-auto leading-loose break-words not-italic">
                            Your trust is our foundation. Please read our legal disclaimer carefully before using <span className="text-black font-bold">kiksultraluxury.com</span>.
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
                                <h2 className="text-base md:text-xl font-serif tracking-normal md:tracking-widest uppercase text-black group-hover:text-gold-600 transition-colors leading-tight break-words not-italic font-normal flex-grow">
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

export default Disclaimer;
