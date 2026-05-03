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
          setLatestCollectionSlug(data[0].slug);
        }
      } catch (err) {
        console.error("Failed to fetch latest collection for footer:", err);
      }
    };
    fetchLatestCollection();
  }, []);

  const locations = [...COUNTRY_MAPPING].sort((a, b) => a.name.localeCompare(b.name));

  const handleValidateLocation = () => {
    const loc = applyLocationSettings(selectedLocation, i18n, dispatch, setCurrency);
    if (loc) {
      window.location.reload(); 
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
    <footer className="bg-black text-white pt-8 md:pt-20 pb-10 font-sans overflow-hidden border-t border-white/10">

      {/* Location Selection Modal (Chanel Style) */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLocationModalOpen(false)}></div>
          <div className="bg-[#0A0A0A] text-white w-full max-w-[600px] p-6 sm:p-10 md:p-16 relative z-10 text-center animate-fade-in shadow-2xl border border-white/10 mx-4">
            <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-6 right-6 text-white hover:text-gold-500 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-[12px] sm:text-[14px] md:text-[18px] font-black tracking-[0.2em] sm:tracking-[0.4em] mb-6 sm:mb-10 leading-relaxed px-2 sm:px-4 text-white uppercase font-serif">
              {t('footer.modal.title', { location: selectedLocation })}
            </h2>
            <p className="text-[9px] sm:text-[11px] md:text-[12px] text-white/50 tracking-[0.15em] sm:tracking-[0.2em] mb-8 sm:mb-12 max-w-sm mx-auto leading-relaxed uppercase font-black px-2">
              {t('footer.modal.desc')}
            </p>
            <div className="mb-12">
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black tracking-[0.3em] mb-6 text-white/30 uppercase">{t('footer.modal.change')}</p>
              <div className="relative border-b border-white/20 pb-4">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-transparent text-[12px] sm:text-[14px] md:text-[16px] text-center focus:outline-none cursor-pointer appearance-none px-4 sm:px-8 text-white font-bold tracking-[0.1em] sm:tracking-widest uppercase"
                >
                  {locations.map(loc => (
                    <option key={loc.name} value={loc.name} className="text-white bg-[#0A0A0A]">{loc.name}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-1 pointer-events-none text-white/40">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
                </div>
              </div>
            </div>
            <button onClick={handleValidateLocation} className="w-full md:w-auto bg-white text-black px-10 md:px-20 py-4 md:py-5 text-[10px] md:text-[12px] font-black tracking-[0.3em] md:tracking-[0.5em] uppercase hover:bg-gold-500 hover:text-white transition-all duration-500 shadow-xl">
              {t('footer.validate')}
            </button>
          </div>
        </div>
      )}

      {/* Top Centered Brand Logo */}
      <div className="flex flex-col items-center mb-8 md:mb-20 font-serif">
        <Link to="/">
          <img src="/logo-kiks.webp" alt="Kiks Logo" className="h-24 md:h-32 w-auto object-contain" />
        </Link>
      </div>

      {/* Main Grid */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-3 gap-12 mb-8 md:mb-20">
        <div className="text-center md:text-left">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-wider mb-4">Explore</h4>
          <ul className="space-y-[10px]">
            <li><Link to={`/collection/${latestCollectionSlug}`} className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">New Arrivals</Link></li>
          </ul>
          <div className="mt-8 flex items-center justify-center md:justify-start space-x-3">
            <span className="text-[12px] text-[#A0A0A0]">Contrast</span>
            <button onClick={() => setIsHighContrast(!isHighContrast)} className={`w-9 h-4 rounded-full relative transition-colors duration-300 ${isHighContrast ? 'bg-white' : 'bg-[#333]'}`}>
              <div className={`w-3.5 h-3.5 rounded-full absolute top-[1px] transition-all duration-300 ${isHighContrast ? 'bg-black left-[19px]' : 'bg-gray-400 left-[1px]'}`}></div>
            </button>
          </div>
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-wider mb-4">Services</h4>
          <ul className="space-y-[10px]">
            <li><Link to="/account" className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">My Account</Link></li>
            <li><Link to="/refund-policy" className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">Refund Policy</Link></li>
            <li><Link to="/return-policy" className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">Return Policy</Link></li>
          </ul>
        </div>

        <div className="text-center md:text-left">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-wider mb-4">Newsletter</h4>
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
                }
              } catch (err) {}
            }}
            className="relative border-b border-white/20 pb-2 flex items-center"
          >
            <input 
              type="email" 
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your address"
              className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/10"
            />
            <button type="submit" className="text-white hover:text-gold-500 transition-colors ml-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Footer Section - MATCHING SCREENSHOT EXACTLY */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="border-t border-white/10 pt-12">
          
          {/* Horizontal Row of Languages */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4 mb-8">
            {locations.filter(l => ['France', 'Germany', 'India', 'Spain', 'United States'].includes(l.name)).map(loc => (
              <button 
                key={loc.name}
                onClick={() => {
                  applyLocationSettings(loc.name, i18n, dispatch, setCurrency);
                  window.location.reload();
                }}
                className="text-[11px] font-medium tracking-[0.05em] text-[#666666] hover:text-white transition-colors"
              >
                {loc.name} ({loc.langName})
              </button>
            ))}
            
            <button 
              onClick={() => setIsLocationModalOpen(true)} 
              className="flex items-center text-[11px] font-bold tracking-[0.1em] text-white hover:text-gold-500 transition-all uppercase"
            >
              Change location and language 
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-3"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>

          {/* Current Selection Status */}
          <div className="flex flex-col md:flex-row justify-between items-center text-[11px] font-black tracking-[0.2em] uppercase">
            <div className="mb-4 md:mb-0">
              <span className="text-[#444444] mr-2">CURRENT:</span>
              <span className="text-white">{selectedLocation} ({locations.find(l => l.name === selectedLocation)?.langName || 'English'})</span>
            </div>
            
            <div className="flex items-center space-x-12">
              <div className="flex space-x-8 text-[#444444]">
                <a href="https://instagram.com/kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconInsta /></a>
                <a href="https://facebook.com/kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconFb /></a>
              </div>
              <p className="text-[#222222]">
                &copy; {new Date().getFullYear()} KIKS ULTRA LUXURY
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
