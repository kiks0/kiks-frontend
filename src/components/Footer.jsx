import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setCurrency } from '../store/currencySlice';
import { COUNTRY_MAPPING, applyLocationSettings } from '../utils/i18nUtils';

// Inline SVGs for precise identical Chanel reproduction without dependency issues
const IconInsta = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;
const IconFb = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
const IconYt = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>;
const IconIn = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>;

const Footer = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(localStorage.getItem('kiks_location_name') || 'India');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [latestCollectionSlug, setLatestCollectionSlug] = useState('arambh');

  useEffect(() => {
    const fetchLatestCollection = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/collections`);
        const data = await res.json();
        if (data && data.length > 0) {
          // APIs usually return newest first, if not, we pick the last one.
          // Let's check the first one as standard for 'latest'.
          setLatestCollectionSlug(data[0].slug);
        }
      } catch (err) {
        console.error("Failed to fetch latest collection for footer:", err);
      }
    };
    fetchLatestCollection();
  }, []);

  const locations = COUNTRY_MAPPING;

  const handleValidateLocation = () => {
    const loc = applyLocationSettings(selectedLocation, i18n, dispatch, setCurrency);
    if (loc) {
      window.location.reload(); // Refresh to apply all translations and rates perfectly
    }
    setIsLocationModalOpen(false);
  };

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  return (
    <footer className="bg-black text-white pt-8 md:pt-20 pb-10 font-sans overflow-hidden border-t border-white/10 relative z-[100]">

      {/* Location Selection Modal (Chanel Style) */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsLocationModalOpen(false)}></div>
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[#050505] text-white w-full h-full md:h-auto md:max-w-[1000px] p-8 md:p-16 relative z-10 overflow-y-auto scrollbar-hide border border-white/5"
            >
              <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-all group">
                <span className="text-[10px] uppercase tracking-[0.3em] mr-4 opacity-0 group-hover:opacity-100 transition-all">Close</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>

              <div className="text-center mb-16">
                <h2 className="text-[14px] md:text-[20px] font-serif tracking-[0.4em] uppercase mb-4 text-gold-500">Change Location & Language</h2>
                <div className="w-12 h-[1px] bg-gold-500/30 mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {['Americas', 'Europe', 'Asia-Pacific', 'Middle East'].map(region => {
                  const filteredLocations = locations.filter(l => l.region === region);
                  if (filteredLocations.length === 0) return null;
                  
                  return (
                    <div key={region} className="flex flex-col space-y-6">
                      <h3 className="text-[10px] font-black tracking-[0.4em] text-gold-500 uppercase border-b border-white/5 pb-6 mb-2">
                        {region}
                      </h3>
                      <ul className="space-y-4">
                        {filteredLocations.map(loc => (
                          <li key={loc.name}>
                            <button 
                              onClick={() => {
                                setSelectedLocation(loc.name);
                                const applied = applyLocationSettings(loc.name, i18n, dispatch, setCurrency);
                                if (applied) window.location.reload();
                              }}
                              className={`text-[10px] uppercase tracking-[0.2em] transition-all text-left w-full hover:text-white group flex items-center justify-between ${selectedLocation === loc.name ? 'text-white font-bold' : 'text-white/30'}`}
                            >
                              <span className="flex-grow">{loc.name}</span>
                              <span className="text-[8px] opacity-0 group-hover:opacity-40 transition-all ml-2 whitespace-nowrap">
                                {loc.langName}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Centered Brand Logo */}
      <div className="flex flex-col items-center mb-8 md:mb-20 font-serif">
        <Link to="/">
          <img src="/logo-kiks.webp" alt="Kiks Logo" className="h-24 md:h-32 w-auto object-contain" />
        </Link>
      </div>

      {/* Main 4-Column Architectural Grid */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 lg:gap-8 mb-8 md:mb-20">
        <div className="text-center md:text-left">
          <h4 className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-4">{t('footer.explore')}</h4>
          <ul className="space-y-[10px]">
            <li><Link to={`/collection/${latestCollectionSlug}`} className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">{t('footer.links.new')}</Link></li>
          </ul>
          <div className="mt-8 flex items-center justify-center md:justify-start space-x-3">
            <span className="text-[12px] md:text-[13px] text-[#A0A0A0]">{t('footer.high_contrast')}</span>
            <button onClick={() => setIsHighContrast(!isHighContrast)} className={`w-9 h-4 rounded-full relative focus:outline-none flex items-center transition-colors duration-300 ${isHighContrast ? 'bg-white' : 'bg-[#333]'}`}>
              <div className={`w-3.5 h-3.5 rounded-full absolute top-[1px] transition-all duration-300 ${isHighContrast ? 'bg-black left-[19px]' : 'bg-gray-400 left-[1px]'}`}></div>
            </button>
          </div>
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-4">{t('footer.services')}</h4>
          <ul className="space-y-[10px]">

            <li><Link to="/account" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">{t('footer.links.account')}</Link></li>
            <li><Link to="/refund-policy" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Refund Policy</Link></li>
            <li><Link to="/return-policy" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Return Policy</Link></li>
            <li><Link to="/cancellation-policy" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Cancellation Policy</Link></li>

          </ul>
        </div>

        <div className="text-center md:text-left">
          <h4 className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-4">{t('footer.house')}</h4>
          <ul className="space-y-[10px] mb-8">
            <li><Link to="/terms-conditions" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/disclaimer" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Disclaimer</Link></li>
          </ul>

          {/* Compact Newsletter */}
          <div className="mt-6">
            <h4 className="text-white text-[10px] font-bold uppercase tracking-wider mb-6">Newsletter</h4>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/newsletter/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: newsletterEmail, source: 'footer' })
                  });
                  
                  if (res.ok) {
                    setIsSubscribed(true);
                    setNewsletterEmail('');
                    setTimeout(() => setIsSubscribed(false), 4000);
                  } else {
                    console.error("Server rejected subscription");
                  }
                } catch (err) {
                  console.error("Newsletter subscription failed", err);
                }
              }}
              className="relative border-b border-white/20 pb-2 group focus-within:border-white transition-all"
            >
              <label className="text-[10px] text-[#A0A0A0] block mb-2 font-medium">Email</label>
              <div className="flex items-center">
                <input 
                  type="email" 
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your address"
                  className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/10 text-center md:text-left"
                />
                <button type="submit" className="text-white hover:text-gold-500 transition-colors ml-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Success Popup */}
        <AnimatePresence>
          {isSubscribed && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-12 right-12 z-[300] bg-white text-black p-8 shadow-2xl border border-black/10 flex items-center space-x-6"
            >
              <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Welcome to KIKS</p>
                <p className="text-[10px] text-black/60 uppercase tracking-widest mt-1">You are now part of the circle</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Footer Section */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="border-b border-white/10 pb-6 mb-6 flex flex-col md:flex-row justify-between items-center md:items-center">
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => setIsLocationModalOpen(true)} 
              className="text-white flex items-center text-[11px] tracking-widest hover:text-gold-500 transition-colors group"
            >
              <span className="font-bold border-b border-white/20 pb-0.5 group-hover:border-gold-500 transition-all">Change location and language</span>
              <span className="mx-2 text-white/40">:</span>
              <span className="text-white/60 font-medium">{selectedLocation.replace(/\s*\(.*\)/, '')} ({COUNTRY_MAPPING.find(c => c.name === selectedLocation.replace(/\s*\(.*\)/, ''))?.langName || 'English'})</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
          <div className="flex justify-center space-x-8 mt-6 md:mt-0 text-[#A0A0A0]">
            <a href="https://instagram.com/kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconInsta /></a>
            <a href="https://facebook.com/kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconFb /></a>
            <a href="https://youtube.com/@kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconYt /></a>
            <a href="https://linkedin.com/company/kiks-ultra-luxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconIn /></a>
          </div>
        </div>
        <div className="text-center md:text-left">
          <p className="text-[#666666] text-[10px] md:text-[11px] leading-relaxed max-w-4xl tracking-widest mx-auto md:mx-0">
            Kiksultraluxury ({selectedLocation})
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
