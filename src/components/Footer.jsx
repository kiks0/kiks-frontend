import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { setCurrency } from '../store/currencySlice';
import { COUNTRY_MAPPING, applyLocationSettings } from '../utils/i18nUtils';

// Inline SVGs for precise identical Chanel reproduction without dependency issues
const IconInsta = () => <svg xmlns="http://www.w-equiv.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;

const Footer = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(localStorage.getItem('kiks_location_name') || 'India');
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [latestCollectionSlug, setLatestCollectionSlug] = useState('arambh');
  const [openSection, setOpenSection] = useState(null);

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

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  const toggleSection = (section) => {
    if (window.innerWidth < 768) {
      setOpenSection(openSection === section ? null : section);
    }
  };

  const locations = COUNTRY_MAPPING;

  return (
    <footer className="bg-white text-black pt-12 md:pt-20 pb-10 font-sans overflow-hidden border-t border-black/10 relative z-[100]">
      {/* Top Centered Brand Logo */}
      <div className="flex flex-col items-center mb-12 md:mb-20 font-serif">
        <Link to="/">
          <img src="/logo-kiks.png" alt="Kiks Logo" className="h-20 md:h-28 w-auto object-contain" />
        </Link>
      </div>

      {/* Main 4-Column Architectural Grid - Expanded and Centered on Mobile */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-8 mb-10 md:mb-24 text-center md:text-left">
        {/* EXPLORE */}
        <div>
          <h4 className="text-black text-[11px] font-black md:font-bold uppercase tracking-[0.2em] mb-4 md:mb-8 leading-none">{t('footer.explore')}</h4>
          <ul className="space-y-3 md:space-y-6">
            <li><Link to={`/collection/${latestCollectionSlug}?view=products`} className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">{t('footer.links.new')}</Link></li>
            <li>
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <span className="text-[12px] md:text-[11px] text-black/60 font-medium normal-case">{t('footer.high_contrast')}</span>
                <button onClick={() => setIsHighContrast(!isHighContrast)} className={`w-8 h-4 rounded-full relative focus:outline-none flex items-center transition-colors duration-300 ${isHighContrast ? 'bg-black' : 'bg-neutral-200'}`}>
                  <div className={`w-3 h-3 rounded-full absolute top-[2px] transition-all duration-300 ${isHighContrast ? 'bg-white left-[18px]' : 'bg-white left-[2px]'}`}></div>
                </button>
              </div>
            </li>
          </ul>
        </div>

        {/* SERVICES */}
        <div>
          <h4 className="text-black text-[11px] font-black md:font-bold uppercase tracking-[0.2em] mb-4 md:mb-8 leading-none">{t('footer.services')}</h4>
          <ul className="space-y-3 md:space-y-6">
            <li><Link to="/account" className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">{t('footer.links.account')}</Link></li>
            <li><Link to="/refund-policy" className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">Refund Policy</Link></li>
            <li><Link to="/return-policy" className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">Return Policy</Link></li>
            <li><Link to="/cancellation-policy" className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">Cancellation Policy</Link></li>
          </ul>
        </div>

        {/* THE HOUSE */}
        <div>
          <h4 className="text-black text-[11px] font-black md:font-bold uppercase tracking-[0.2em] mb-4 md:mb-8 leading-none">{t('footer.house')}</h4>
          <ul className="space-y-3 md:space-y-6">
            <li><Link to="/terms-conditions" className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">Privacy Policy</Link></li>
            <li><Link to="/disclaimer" className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">Disclaimer</Link></li>
            <li><Link to="/about" className="text-[12px] md:text-[11px] text-black/60 hover:text-black transition-colors font-medium normal-case">About Us</Link></li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div className="pt-0 md:pt-0">
          <button 
            onClick={() => setIsNewsletterModalOpen(true)}
            className="text-black text-[11px] font-black md:font-bold uppercase tracking-[0.2em] mb-4 md:mb-8 hover:text-black/60 transition-all text-center md:text-left w-full md:w-auto block leading-none p-0 border-0 bg-transparent"
          >
            Newsletter
          </button>
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
        <div className="border-b border-black/10 pb-6 mb-4 flex flex-col md:flex-row justify-between items-center md:items-center">
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => setIsLocationModalOpen(true)} 
              className="text-black flex items-center justify-center md:justify-start text-[10px] md:text-[11px] tracking-widest hover:text-black/60 transition-colors group"
            >
              <span className="font-bold border-b border-black/20 pb-0.5 group-hover:border-black transition-all uppercase">Change location and language</span>
              <span className="mx-3 text-black/40">:</span>
              <span className="text-black/60 font-medium text-[11px] capitalize">{selectedLocation.toLowerCase()} ({COUNTRY_MAPPING.find(c => c.name === selectedLocation.replace(/\s*\(.*\)/, ''))?.langName || 'English'})</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2 transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
          <div className="flex justify-center mt-8 md:mt-0 text-black/60">
            <a href="https://www.instagram.com/kultraluxe?igsh=YXl6YW52ZjQ5dDBq" target="_blank" rel="noreferrer" className="hover:text-black transition-colors p-1"><IconInsta /></a>
          </div>
        </div>
        <div className="text-center md:text-left mt-4 border-t border-black/5 pt-6">
          <p className="text-black/40 text-[8px] md:text-[10px] leading-relaxed max-w-4xl tracking-[0.4em] mx-auto md:mx-0 font-bold">
            © 2026 KIKSULTRALUXURY. All rights reserved.
          </p>
        </div>
      </div>
      {/* Location Selection Modal (Chanel Style) */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000000] overflow-y-auto flex items-start justify-center py-10 md:py-20"
          >
            <div className="fixed inset-0 bg-white/98 backdrop-blur-sm -z-10" onClick={() => setIsLocationModalOpen(false)}></div>
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white text-black w-full h-auto md:max-w-[1100px] pt-24 pb-12 px-6 md:p-20 relative z-10 border border-black/5 shadow-2xl"
            >
              <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-4 right-4 md:top-10 md:right-10 text-black/40 hover:text-black transition-all group p-2 z-50">
                <span className="hidden md:inline text-[9px] uppercase tracking-[0.4em] mr-4 opacity-0 group-hover:opacity-100 transition-all font-bold">Dismiss</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>

              <div className="text-center mb-16 md:mb-24 px-4">
                <p className="text-[10px] md:text-[11px] tracking-[0.6em] text-black/60 uppercase font-black mb-6">Global Boutique</p>
                <h2 className="text-2xl md:text-5xl font-serif tracking-[0.2em] uppercase mb-8 text-black font-black leading-tight">Select Your Region</h2>
                <div className="w-20 h-[2px] bg-black mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 md:gap-x-16 gap-y-12 md:gap-y-16">
                {['Americas', 'Europe', 'Asia-Pacific', 'Middle East', 'Africa', 'Global'].map(region => {
                  const filteredLocations = locations.filter(l => l.region === region);
                  if (filteredLocations.length === 0) return null;
                  
                  return (
                    <div key={region} className="flex flex-col space-y-8">
                      <div className="bg-[#fcfcfc] border-b border-black/5 px-4 py-3 -mx-4 text-center md:text-left">
                        <h3 className="text-[10px] font-black tracking-[0.4em] text-gold-500 uppercase">
                          {region}
                        </h3>
                      </div>
                      <ul className="space-y-6 px-0 md:px-2">
                        {filteredLocations.map(loc => (
                          <li key={loc.name}>
                            <button 
                              onClick={() => {
                                setSelectedLocation(loc.name);
                                const applied = applyLocationSettings(loc.name, i18n, dispatch, setCurrency);
                                if (applied) window.location.reload();
                              }}
                              className={`text-[12px] md:text-[13px] uppercase tracking-[0.2em] transition-all text-center md:text-left w-full hover:text-black flex flex-col md:flex-row items-center md:items-center justify-between group py-2 ${selectedLocation === loc.name ? 'text-black font-black border-b md:border-b-0 md:border-l-4 border-black pl-0 md:pl-6' : 'text-black/60 font-bold hover:md:pl-4'}`}
                            >
                              <span className="flex-grow">{loc.name}</span>
                              <span className="text-[8px] opacity-0 group-hover:opacity-40 transition-all font-medium">
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
      {/* Simple Newsletter Modal */}
      <AnimatePresence>
        {isNewsletterModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000001] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-10 md:p-12 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsNewsletterModalOpen(false)}
                className="absolute top-6 right-6 text-black/40 hover:text-black transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>

              <div className="text-center mb-10">
                <h3 className="text-lg font-serif tracking-widest uppercase mb-4">Newsletter</h3>
                <div className="w-10 h-[1px] bg-black mx-auto mb-6"></div>
                <p className="text-[11px] text-black/60 tracking-widest uppercase leading-relaxed">
                  Join the circle. Enter your email to stay updated.
                </p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/newsletter/subscribe`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: newsletterEmail, source: 'footer_modal' })
                    });
                    if (res.ok) {
                      setIsSubscribed(true);
                      setNewsletterEmail('');
                      setIsNewsletterModalOpen(false);
                      setTimeout(() => setIsSubscribed(false), 4000);
                    }
                  } catch (err) { console.error(err); }
                }}
                className="space-y-8"
              >
                <div className="border-b border-black/10 pb-2 focus-within:border-black transition-colors">
                  <input 
                    type="email" 
                    required
                    autoFocus
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    className="w-full bg-transparent text-[11px] text-black outline-none placeholder:text-black/30 tracking-[0.3em] text-center"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-900 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
