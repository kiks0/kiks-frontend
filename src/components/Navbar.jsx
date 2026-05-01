import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, ShoppingBag, Heart, User, ChevronDown, Shield, ChevronLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SearchOverlay from './SearchOverlay';
import CartDrawer from './CartDrawer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;

  const isAccountPage = location.pathname.startsWith('/account') || location.pathname === '/addresses' || location.pathname === '/orders' || location.pathname === '/wishlist';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [navCollections, setNavCollections] = useState([]);
  const [mobileMenuLevel, setMobileMenuLevel] = useState('main'); // 'main' or 'collections'

  const { items: cartItems, total: cartTotal } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = user && (
    user.role === 'admin' ||
    user.email === 'hit.goyani1010@gmail.com' ||
    user.email.endsWith('@kiksultraluxury.com')
  );

  const lastScrollY = useRef(0);

  useEffect(() => {
    // Fetch collections for navigation
    fetch(`${API_URL}/api/collections`)
      .then(res => res.json())
      .then(data => setNavCollections(data))
      .catch(err => console.error("Nav collections error:", err));

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (isMobileMenuOpen) return; // Don't hide navbar if menu is open

      if (currentScrollY < 50) {
        // At the top
        setShowMenu(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setShowMenu(false);
      } else {
        // Scrolling up
        setShowMenu(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || isAccountPage
        ? 'bg-black/95 backdrop-blur-md py-2 shadow-2xl text-white'
        : 'bg-transparent py-3 text-white'
        }`}>
        <div className="container mx-auto px-5 lg:px-12 flex flex-col items-center">

          {/* ======================================= */}
          {/* MOBILE NAVBAR (Visisble only on Mobile) */}
          {/* ======================================= */}
          <div className="flex md:hidden flex-row items-center justify-between w-full relative z-50 h-[64px] text-white">

            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center space-x-3.5 px-1">
              <button className="hover:text-gold-400 transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={20} strokeWidth={1} /> : <Menu size={20} strokeWidth={1} />}
              </button>
              <button className="hover:text-gold-400 transition-colors" onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}>
                <Search size={20} strokeWidth={1} />
              </button>
            </div>

            {/* Center: Brand Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
              <Link
                to="/"
                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center transform transition hover:opacity-70 pointer-events-auto"
              >
                <img
                  src="/logo-kiks.webp"
                  alt="Kiks Logo"
                  className="h-12 w-auto object-contain transition-all"
                />
              </Link>
            </div>

            {/* Right: Mobile Icons */}
            <div className="flex items-center space-x-3.5 px-1">
              <Link to="/account" className="hover:text-gold-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <User size={20} strokeWidth={1} />
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsCartOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-gold-400 transition-colors relative flex items-center justify-center"
              >
                <ShoppingBag size={20} strokeWidth={1} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white border border-white/20 text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-fade-in shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ========================================= */}
          {/* DESKTOP NAVBAR (Visible only on Desktop)  */}
          {/* ========================================= */}
          <div className="hidden md:flex flex-col items-center w-full relative z-50">

            {/* Brand Logo - Centered Top */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center justify-center transform transition hover:opacity-70 z-50 relative mt-2 mb-1"
            >
              <img
                src="/logo-kiks.webp"
                alt="KIKS Logo"
                className="h-12 md:h-16 w-auto object-contain transition-all"
              />
            </Link>

            {/* Desktop Menu - Centered Below Logo */}
            <div
              className={`w-full flex items-center justify-center relative transition-all duration-500 ease-in-out px-10 ${showMenu ? 'max-h-24 opacity-100 mb-1' : 'max-h-0 opacity-0 mb-0 pointer-events-none'
                }`}
            >
              <div className="flex space-x-12 text-[11px] tracking-[0.15em] font-medium items-center mx-auto text-white font-sans">
                <div
                  className="relative group h-full flex items-center py-2 cursor-pointer"
                  onMouseEnter={() => setIsCollectionsHovered(true)}
                  onMouseLeave={() => setIsCollectionsHovered(false)}
                >
                  <div className="hover:text-gold-400 transition-colors flex items-center">
                    {t('nav.collections')} <ChevronDown size={14} className="ml-1 opacity-60" strokeWidth={1.5} />
                  </div>

                  {/* Minimal Dropdown */}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-300 ${isCollectionsHovered ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                    <div className="bg-black border border-white/5 shadow-2xl p-6 w-64 flex flex-col space-y-4">
                      {navCollections.length > 0 ? navCollections.map(col => (
                        <Link key={col.id} to={`/collection/${col.slug}`} className="text-[11px] tracking-[0.1em] text-neutral-400 hover:text-white transition-colors uppercase">{col.name}</Link>
                      )) : (
                        <span className="text-[11px] tracking-[0.1em] text-neutral-600">{t('nav.vault_empty')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Link to="/blog" className="hover:text-gold-400 transition-colors">{t('nav.blog')}</Link>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">{t('nav.contact')}</Link>
                {!isAuthenticated && (
                  <>
                    <Link to="/login" className="hover:text-gold-400 transition-colors">{t('nav.login')}</Link>
                    <Link to="/register" className="hover:text-gold-400 transition-colors">{t('nav.register')}</Link>
                  </>
                )}
                {isAuthenticated && isAdmin && (
                  <Link to="/admin" className="text-gold-500 hover:text-white transition-colors text-[9px] tracking-[0.2em] font-bold">{t('nav.admin')}</Link>
                )}
              </div>

              {/* Right Side Icons */}
              <div className="flex space-x-5 items-center absolute right-12 text-white">
                <button className="hover:text-gold-400 transition-colors" onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}>
                  <Search size={18} strokeWidth={1} />
                </button>
                <Link to="/account" className="hover:text-gold-400 transition-colors"><User size={18} strokeWidth={1} /></Link>
                <Link to="/wishlist" className="hover:text-gold-400 transition-colors relative">
                  <Heart size={18} strokeWidth={1} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-black text-white border border-white/20 text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-fade-in shadow-lg">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="hover:text-gold-400 transition-colors relative"
                >
                  <ShoppingBag size={18} strokeWidth={1} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-black text-white border border-white/20 text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-fade-in shadow-lg">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </nav>

      {/* Mobile Sidebar (Chanel Style) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[400px] bg-black z-[100] md:hidden flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)] border-r border-white/5"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  {mobileMenuLevel !== 'main' && (
                    <button onClick={() => setMobileMenuLevel('main')} className="text-white/60 hover:text-gold-500 transition-colors">
                      <ChevronLeft size={24} strokeWidth={1} />
                    </button>
                  )}
                  <span className="text-[11px] tracking-[0.4em] uppercase font-medium text-white font-serif italic">
                    {mobileMenuLevel === 'main' ? 'THE MENU' : mobileMenuLevel}
                  </span>
                </div>
                <button onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }} className="text-white/60 hover:text-white transition-colors">
                  <X size={24} strokeWidth={1} />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-grow overflow-y-auto relative">
                <AnimatePresence mode="wait">
                  {mobileMenuLevel === 'main' ? (
                    <motion.div
                      key="main-level"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-8 space-y-8 flex flex-col"
                    >
                      {/* Main Links */}
                      <div className="space-y-6">
                        <button 
                          onClick={() => setMobileMenuLevel('collections')}
                          className="w-full flex items-center justify-between group text-white hover:text-gold-500 transition-colors py-1"
                        >
                          <span className="text-[11px] tracking-[0.25em] uppercase font-medium font-sans">{t('nav.collections')}</span>
                          <ArrowRight size={14} className="text-white/20 group-hover:text-gold-500 transition-all transform group-hover:translate-x-1" />
                        </button>
                        
                        <Link to="/blog" className="block text-[11px] tracking-[0.25em] uppercase font-medium font-sans text-white hover:text-gold-500" onClick={() => setIsMobileMenuOpen(false)}>
                          {t('nav.blog')}
                        </Link>
                        
                        <Link to="/contact" className="block text-[11px] tracking-[0.25em] uppercase font-medium font-sans text-white hover:text-gold-500" onClick={() => setIsMobileMenuOpen(false)}>
                          {t('nav.contact')}
                        </Link>
                      </div>

                      {/* Account Section */}
                      <div className="pt-10 mt-4 border-t border-white/5 space-y-6">
                        {!isAuthenticated ? (
                          <Link to="/login" className="flex items-center text-[10px] tracking-[0.3em] text-white/30 uppercase hover:text-white font-sans" onClick={() => setIsMobileMenuOpen(false)}>
                            <User size={16} className="mr-4" strokeWidth={1} /> {t('nav.login')}
                          </Link>
                        ) : (
                          <Link to="/account" className="flex items-center text-[10px] tracking-[0.3em] text-white/30 uppercase hover:text-white font-sans" onClick={() => setIsMobileMenuOpen(false)}>
                            <User size={16} className="mr-4" strokeWidth={1} /> {t('nav.profile')}
                          </Link>
                        )}
                        
                        <Link to="/wishlist" className="flex items-center text-[10px] tracking-[0.3em] text-white/30 uppercase hover:text-white font-sans relative" onClick={() => setIsMobileMenuOpen(false)}>
                          <Heart size={16} className="mr-4" strokeWidth={1} /> {t('nav.wishlist')}
                          {wishlistCount > 0 && (
                            <span className="absolute left-4 top-[-6px] bg-white text-black text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>

                        {isAuthenticated && isAdmin && (
                          <Link to="/admin" className="flex items-center text-[10px] tracking-[0.3em] text-gold-500 font-bold uppercase font-sans" onClick={() => setIsMobileMenuOpen(false)}>
                            <Shield size={16} className="mr-4" strokeWidth={1} /> {t('nav.admin')}
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="collections-level"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8 space-y-6"
                    >
                      {/* Nested Collection Links */}
                      {navCollections.map(col => (
                        <Link 
                          key={col.id} 
                          to={`/collection/${col.slug}`} 
                          className="block text-[11px] tracking-[0.2em] text-white/60 hover:text-gold-500 uppercase transition-colors py-4 border-b border-white/5 font-sans"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {col.name}
                        </Link>
                      ))}
                      {navCollections.length === 0 && (
                        <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-20 italic">The vault is closed</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Info */}
              <div className="p-8 border-t border-white/5 bg-zinc-900/30">
                <p className="text-[8px] tracking-[0.4em] uppercase text-white/20 text-center">© {new Date().getFullYear()} KIKSULTRALUXURY</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Screen Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Side Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] w-12 h-12 md:w-14 md:h-14 bg-black border border-gold-500/30 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 rounded-full bg-gold-500/5 group-hover:bg-gold-500/10 transition-colors" />
        <ChevronDown size={20} className="text-gold-500 rotate-180 group-hover:-translate-y-1 transition-transform" strokeWidth={1.5} />
      </button>
    </>
  );
};

export default Navbar;
