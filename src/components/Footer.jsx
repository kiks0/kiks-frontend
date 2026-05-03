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
      <AnimatePresence>
        {isLocationModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsLocationModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0A0A0A] text-white w-full max-w-[500px] p-8 sm:p-12 relative z-10 text-center shadow-2xl border border-white/10"
            >
              <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
              
              <h2 className="text-[14px] font-bold tracking-[0.4em] mb-4 uppercase font-serif">Select Location</h2>
              <p className="text-[10px] text-white/40 tracking-[0.2em] mb-10 uppercase leading-relaxed">
                Choose your region to see appropriate currency and delivery options.
              </p>

              <div className="mb-12">
                <div className="relative border-b border-white/20 pb-4">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-transparent text-[16px] text-center focus:outline-none cursor-pointer appearance-none px-8 text-white font-medium tracking-widest uppercase"
                  >
                    {locations.map(loc => (
                      <option key={loc.name} value={loc.name} className="text-white bg-[#0A0A0A]">{loc.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-0 top-1 pointer-events-none text-white/40">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleValidateLocation} 
                className="w-full bg-white text-black py-5 text-[11px] font-black tracking-[0.5em] uppercase hover:bg-gold-500 hover:text-white transition-all duration-500"
              >
                Apply Selection
              </button>
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

      {/* Main Grid */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-3 gap-12 mb-8 md:mb-20">
        <div className="text-center md:text-left">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-wider mb-4">Explore</h4>
          <ul className="space-y-[10px]">
            <li><Link to={`/collection/${latestCollectionSlug}`} className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link to="/account" className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">My Account</Link></li>
          </ul>
        </div>

        <div className="text-center md:text-left">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-wider mb-4">Legal</h4>
          <ul className="space-y-[10px]">
            <li><Link to="/terms-conditions" className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="text-[12px] text-[#A0A0A0] hover:text-white transition-colors">Refund Policy</Link></li>
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
              placeholder="YOUR EMAIL"
              className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-white/20 uppercase tracking-widest"
            />
            <button type="submit" className="text-white hover:text-gold-500 transition-colors ml-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center">
          
          {/* THE NEW CLEAN SELECTOR */}
          <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
            <button 
              onClick={() => setIsLocationModalOpen(true)} 
              className="group flex items-center space-x-4 text-[11px] font-black tracking-[0.3em] uppercase hover:text-white transition-all"
            >
              <span className="text-white/40 group-hover:text-white transition-colors">Location</span>
              <span className="text-white">{selectedLocation}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
            <div className="mt-4 flex items-center space-x-3">
              <span className="text-[10px] text-white/30 tracking-widest uppercase">Contrast</span>
              <button onClick={() => setIsHighContrast(!isHighContrast)} className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isHighContrast ? 'bg-white' : 'bg-white/10'}`}>
                <div className={`w-3 h-3 rounded-full absolute top-[2px] transition-all duration-300 ${isHighContrast ? 'bg-black left-[17px]' : 'bg-white/40 left-[2px]'}`}></div>
              </button>
            </div>
          </div>

          <div className="flex justify-center space-x-10 text-white/40 mb-8 md:mb-0">
            <a href="https://instagram.com/kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconInsta /></a>
            <a href="https://facebook.com/kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconFb /></a>
            <a href="https://youtube.com/@kiksultraluxury" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><IconYt /></a>
          </div>

          <p className="text-white/20 text-[10px] tracking-[0.4em] uppercase">
            &copy; {new Date().getFullYear()} KIKS ULTRA LUXURY
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
