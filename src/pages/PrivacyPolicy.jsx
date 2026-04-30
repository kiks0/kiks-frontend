import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Globe, Mail, MapPin } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white pt-40 md:pt-56 pb-40 px-6 font-sans selection:bg-gold-500/30">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header Section */}
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="text-[10px] tracking-[0.6em] text-gold-500 uppercase font-black mb-6">Confidentiality & Care</p>
            <h1 className="text-4xl md:text-7xl font-serif tracking-[0.1em] text-white uppercase mb-8">Privacy Policy</h1>
            <div className="w-20 h-px bg-white/10 mx-auto"></div>
          </motion.div>
        </header>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="prose prose-invert prose-gold max-w-none space-y-16"
        >
          {/* Section 1: Introduction */}
          <section className="relative group">
            <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-gold-500 hidden md:block">
              <Globe size={20} strokeWidth={1} />
            </div>
            <h2 className="text-xl md:text-2xl font-serif tracking-widest uppercase border-b border-white/5 pb-4 mb-8">Who We Are</h2>
            <div className="text-white/60 text-sm md:text-base leading-[2] tracking-wide space-y-4">
              <p>Our website address is: <span className="text-white font-medium border-b border-gold-500/30">https://kiksultraluxury.com</span></p>
              <p>This website is owned and operated by <span className="text-white font-bold tracking-widest">Kiks Ultra Luxury</span>.</p>
              <p>If you have any questions about this Privacy Policy or our data practices, you can contact us at:</p>
              <div className="bg-white/[0.02] border border-white/5 p-8 mt-6 space-y-3 font-sans italic">
                 <p className="flex items-center gap-4 text-xs"><Mail size={14} className="text-gold-500" /> kiksultraluxury@gmail.com</p>
                 <p className="flex items-center gap-4 text-xs"><MapPin size={14} className="text-gold-500" /> Gujarat, India</p>
              </div>
            </div>
          </section>

          {/* Section 2: Data Collection */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif tracking-widest uppercase border-b border-white/5 pb-4 mb-8">Personal Data We Collect</h2>
            <div className="text-white/60 text-sm md:text-base leading-[2] tracking-wide space-y-8">
              <p>We collect personal data to provide, operate, and improve our website and services.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div className="border border-white/5 p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                  <h4 className="text-gold-500 text-[10px] tracking-[0.3em] font-black uppercase mb-4 flex items-center gap-2">
                    <FileText size={12} /> Identity Data
                  </h4>
                  <p className="text-xs uppercase tracking-widest">Name, Username</p>
                </div>
                <div className="border border-white/5 p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                  <h4 className="text-gold-500 text-[10px] tracking-[0.3em] font-black uppercase mb-4 flex items-center gap-2">
                    <MapPin size={12} /> Contact Data
                  </h4>
                  <p className="text-xs uppercase tracking-widest">Email address, phone number</p>
                </div>
                <div className="border border-white/5 p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                  <h4 className="text-gold-500 text-[10px] tracking-[0.3em] font-black uppercase mb-4 flex items-center gap-2">
                    <Lock size={12} /> Account Data
                  </h4>
                  <p className="text-xs uppercase tracking-widest">Login credentials and preferences</p>
                </div>
                <div className="border border-white/5 p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                  <h4 className="text-gold-500 text-[10px] tracking-[0.3em] font-black uppercase mb-4 flex items-center gap-2">
                    <Shield size={12} /> Transaction Data
                  </h4>
                  <p className="text-xs uppercase tracking-widest">Order details, billing and payment information</p>
                </div>
              </div>

              <div className="mt-12 bg-black border border-white/5 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                <h4 className="text-[11px] font-black tracking-[0.4em] uppercase text-white mb-6 underline underline-offset-[10px] decoration-gold-500/30">Why We Collect It</h4>
                <ul className="space-y-4 text-xs font-medium uppercase tracking-[0.2em]">
                  <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-gold-500 rounded-full" /> Process perfume orders and payments</li>
                  <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-gold-500 rounded-full" /> Manage customer accounts</li>
                  <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-gold-500 rounded-full" /> Provide customer support</li>
                  <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-gold-500 rounded-full" /> Improve website performance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Payment Info */}
          <section className="bg-white/[0.02] border border-white/5 p-10 md:p-16">
            <h2 className="text-xl md:text-2xl font-serif tracking-widest uppercase mb-8 text-center text-gold-500">Secure Payment Information</h2>
            <div className="text-center text-white/50 text-xs md:text-sm leading-loose tracking-[0.1em] max-w-2xl mx-auto italic uppercase">
              We use secure third-party payment gateways (such as <span className="text-white font-bold">Razorpay</span>) to process payments. 
              We do not store or process your credit card, debit card, or banking details on our servers. 
              All payment transactions are encrypted and handled directly by the payment service provider.
            </div>
          </section>

          {/* Additional Sections summarized for clarity and luxury feel */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 pt-12">
            <div>
              <h3 className="text-lg font-serif tracking-widest uppercase mb-6 text-white border-b border-white/5 pb-4">Cookies & Analytics</h3>
              <p className="text-white/40 text-[13px] leading-relaxed tracking-wide">
                Our website uses cookies to improve user experience, remember login details, and analyze traffic. 
                You can disable cookies through your browser settings. Analytics data is collected in an anonymous 
                manner to help us understand user behavior without compromising individual identities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-serif tracking-widest uppercase mb-6 text-white border-b border-white/5 pb-4">Your Rights</h3>
              <p className="text-white/40 text-[13px] leading-relaxed tracking-wide">
                You possess the inherent right to request access to your personal data, seek corrections, 
                withdraw consent at any time, or request total deletion from our digital vault. 
                To exercise these rights, please contact our concierge at <span className="text-gold-500 underline">kiksultraluxury@gmail.com</span>.
              </p>
            </div>
          </section>

          <footer className="pt-24 text-center border-t border-white/5">
            <p className="text-[9px] tracking-[0.5em] text-white/20 uppercase font-black">
              © 2026 Kiks Ultra Luxury - All Rights Confidential
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
