import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setCurrency } from '../store/currencySlice';

// Inline SVGs for precise identical Chanel reproduction without dependency issues
const IconInsta = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;
const IconFb = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
const IconYt = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>;
const IconIn = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>;

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

  const locations = [
    // Asia
    { name: 'India', code: 'hi', lang: 'Hindi', currency: 'INR' },
    { name: 'India (English)', code: 'en', lang: 'English', currency: 'INR' },
    { name: 'Japan', code: 'ja', lang: 'Japanese', currency: 'JPY' },
    { name: 'China', code: 'zh', lang: 'Chinese', currency: 'CNY' },
    { name: 'United Arab Emirates', code: 'ar', lang: 'Arabic', currency: 'AED' },
    { name: 'Saudi Arabia', code: 'ar', lang: 'Arabic', currency: 'AED' },
    { name: 'Singapore', code: 'en', lang: 'English', currency: 'USD' },
    
    // Europe
    { name: 'France', code: 'fr', lang: 'French', currency: 'EUR' },
    { name: 'United Kingdom', code: 'en', lang: 'English', currency: 'GBP' },
    { name: 'Germany', code: 'de', lang: 'German', currency: 'EUR' },
    { name: 'Italy', code: 'it', lang: 'Italian', currency: 'EUR' },
    { name: 'Spain', code: 'es', lang: 'Spanish', currency: 'EUR' },
    { name: 'Switzerland', code: 'fr', lang: 'French', currency: 'EUR' },
    
    // North America
    { name: 'United States', code: 'en', lang: 'English', currency: 'USD' },
    { name: 'Canada', code: 'en', lang: 'English', currency: 'CAD' },
    { name: 'Mexico', code: 'es', lang: 'Spanish', currency: 'MXN' },
    
    // Oceania
    { name: 'Australia', code: 'en', lang: 'English', currency: 'USD' },
    
    // Others
    { name: 'Brazil', code: 'es', lang: 'Spanish', currency: 'USD' },
    { name: 'South Africa', code: 'en', lang: 'English', currency: 'USD' }
  ];

  const handleValidateLocation = () => {
    const loc = locations.find(l => l.name === selectedLocation);
    if (loc) {
      i18n.changeLanguage(loc.code);
      dispatch(setCurrency(loc.currency));
      localStorage.setItem('kiks_location_name', loc.name);
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
    <footer className="bg-black text-white pt-10 md:pt-20 pb-12 font-sans overflow-hidden border-t border-white/10">

      {/* Location Selection Modal (Chanel Style) */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLocationModalOpen(false)}></div>
          <div className="bg-[#0A0A0A] text-white w-full max-w-[600px] p-10 md:p-16 relative z-10 text-center animate-fade-in shadow-2xl border border-white/10">
            <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-6 right-6 text-white hover:text-gold-500 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-[14px] md:text-[18px] font-black tracking-[0.4em] mb-10 leading-relaxed px-4 text-white uppercase font-serif">
              {t('footer.modal.title', { location: selectedLocation })}
            </h2>
            <p className="text-[11px] md:text-[12px] text-white/50 tracking-[0.2em] mb-12 max-w-sm mx-auto leading-relaxed uppercase font-black">
              {t('footer.modal.desc')}
            </p>
            <div className="mb-12">
              <p className="text-[9px] md:text-[10px] font-black tracking-[0.3em] mb-6 text-white/30 uppercase">{t('footer.modal.change')}</p>
              <div className="relative border-b border-white/20 pb-4">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-transparent text-[14px] md:text-[16px] text-center focus:outline-none cursor-pointer appearance-none px-8 text-white font-bold tracking-widest uppercase"
                >
                  {locations.map(loc => (
                    <option key={loc.name} value={loc.name} className="text-black bg-white">{loc.name}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-1 pointer-events-none text-white/40">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
                </div>
              </div>
            </div>
            <button onClick={handleValidateLocation} className="w-full md:w-auto bg-white text-black px-20 py-5 text-[11px] md:text-[12px] font-black tracking-[0.5em] uppercase hover:bg-gold-500 hover:text-white transition-all duration-500 shadow-xl">
              {t('footer.validate')}
            </button>
          </div>
        </div>
      )}

      {/* Top Centered Brand Logo */}
      <div className="flex flex-col items-center mb-16 md:mb-20 font-serif">
        <Link to="/">
          <img src="/logo-kiks.webp" alt="Kiks Logo" className="h-24 md:h-32 w-auto object-contain" />
        </Link>
      </div>

      {/* Main 4-Column Architectural Grid */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 mb-20">
        <div>
          <h4 className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-4">{t('footer.explore')}</h4>
          <ul className="space-y-[10px]">
            <li><Link to={`/collection/${latestCollectionSlug}`} className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">{t('footer.links.new')}</Link></li>
          </ul>
          <div className="mt-12 flex items-center space-x-3">
            <span className="text-[12px] md:text-[13px] text-[#A0A0A0]">{t('footer.high_contrast')}</span>
            <button onClick={() => setIsHighContrast(!isHighContrast)} className={`w-9 h-4 rounded-full relative focus:outline-none flex items-center transition-colors duration-300 ${isHighContrast ? 'bg-white' : 'bg-[#333]'}`}>
              <div className={`w-3.5 h-3.5 rounded-full absolute top-[1px] transition-all duration-300 ${isHighContrast ? 'bg-black left-[19px]' : 'bg-gray-400 left-[1px]'}`}></div>
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-4">{t('footer.services')}</h4>
          <ul className="space-y-[10px]">

            <li><Link to="/account" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">{t('footer.links.account')}</Link></li>
            <li><Link to="/refund-policy" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Refund Policy</Link></li>
            <li><Link to="/return-policy" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Return Policy</Link></li>

          </ul>
        </div>

        <div>
          <h4 className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-4">{t('footer.house')}</h4>
          <ul className="space-y-[10px] mb-12">
            <li><Link to="/terms-conditions" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/disclaimer" className="text-[12px] md:text-[13px] text-[#A0A0A0] hover:text-white transition-colors">Disclaimer</Link></li>
          </ul>

          {/* Compact Newsletter */}
          <div className="mt-8">
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
                  className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/10"
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
        <div className="border-b border-white/10 pb-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-2 text-[#A0A0A0] text-[12px]">
            <span>{t('footer.detect')}</span>
            <button onClick={() => setIsLocationModalOpen(true)} className="text-white flex items-center font-medium ml-1">
              {selectedLocation} - {locations.find(l => l.name === selectedLocation)?.lang || 'English'}
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
          <div className="flex space-x-6 mt-6 md:mt-0 text-[#A0A0A0]">
            <a href="https://instagram.com/kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconInsta /></a>
            <a href="https://facebook.com/kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconFb /></a>
            <a href="https://youtube.com/@kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconYt /></a>
            <a href="https://linkedin.com/company/kiks-ultra-luxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconIn /></a>
          </div>
        </div>
        <div>
          <p className="text-[#666666] text-[10px] md:text-[11px] leading-relaxed max-w-4xl tracking-widest">
            Kiksultraluxury ({selectedLocation})
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
