import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, ShoppingBag, Heart, User, UserPlus, ChevronDown, Shield, ChevronLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toggleWishlistAndSync } from '../store/wishlistSlice';
import { openAuthModal, openWishlistAuthPopup, openCart, closeCart } from '../store/uiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchOverlay from './SearchOverlay';
import CartDrawer from './CartDrawer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
  const location = useLocation();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const currentPath = location.pathname.toLowerCase();
  const isWhiteThemePage = 
    currentPath.includes('/account') || 
    currentPath.includes('/admin') || 
    currentPath.includes('/blog') || 
    currentPath.includes('/addresses') || 
    currentPath.includes('/orders') || 
    currentPath.includes('/wishlist') ||
    currentPath.includes('/checkout') ||
    currentPath.includes('/order-success') ||
    currentPath.includes('/payment-cancelled') ||
    currentPath.includes('/login') ||
    currentPath.includes('/register') ||
    currentPath.includes('/privacy-policy') ||
    currentPath.includes('/terms-conditions') ||
    currentPath.includes('/return-policy') ||
    currentPath.includes('/refund-policy') ||
    currentPath.includes('/cancellation-policy') ||
    currentPath.includes('/disclaimer') ||
    currentPath.includes('/about') ||
    (currentPath.includes('/collection') && (location.pathname.split('/').length > 3 || location.search.includes('view=products'))) ||
    currentPath.includes('/product') ||
    currentPath.includes('/contact');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isCartOpen = useSelector((state) => state.ui.isCartOpen);
  const setIsCartOpen = (isOpen) => isOpen ? dispatch(openCart()) : dispatch(closeCart());
  const [navCollections, setNavCollections] = useState([]);
  const [mobileMenuLevel, setMobileMenuLevel] = useState('main'); // 'main' or 'collections'

  const { items: cartItems, total: cartTotal } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = user && (
    user.role === 'admin' ||
    user.email === 'kiksultraluxury@gmail.com' ||
    user.email.endsWith('@kiksultraluxury.com')
  );

  const lastScrollY = useRef(0);

  useEffect(() => {
    // Fetch collections for navigation
    fetch(`${API_URL}/api/collections`)
      .then(res => res.json())
      .then(data => setNavCollections(data))
      .catch(() => { });

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

  // Handle Route Changes (Close menu and reset scroll lock)
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileMenuLevel('main');
    // Ensure scroll is restored on route change as a fail-safe
    document.body.style.overflow = 'unset';
  }, [location.pathname]);

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
      <nav className={`fixed w-full z-[99999] transition-all duration-300 ${isScrolled || isWhiteThemePage || isMobileMenuOpen ? 'bg-white py-0 shadow-sm text-black' : 'bg-transparent py-0.5 text-white'}`}>
        <div className="container mx-auto px-5 lg:px-12 flex flex-col items-center">

          {/* ======================================= */}
          {/* MOBILE NAVBAR (Visisble only on Mobile) */}
          {/* ======================================= */}
          <div className={`flex md:hidden flex-row items-center justify-between w-full relative z-50 h-[56px] ${isScrolled || isWhiteThemePage || isMobileMenuOpen ? 'text-black' : 'text-white'}`}>

            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center space-x-3.5 px-1">
              <button className="hover:text-gold-400 transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
              </button>
              <button className="hover:text-gold-400 transition-colors" onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}>
                <Search size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Center: Brand Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  window.location.href = '/';
                }}
                className="flex items-center justify-center transform transition hover:opacity-70 pointer-events-auto"
              >
                <img
                  src="/logo-kiks.png"
                  alt="Kiks Logo"
                  width="120"
                  height="40"
                  className="h-10 w-auto object-contain transition-all"
                />
              </Link>
            </div>

            {/* Right: Mobile Icons */}
            <div className="flex items-center space-x-3.5 px-1">
              <Link to="/account" className="hover:text-gold-400 transition-colors">
                <User size={18} strokeWidth={1.5} />
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsCartOpen(true);
                }}
                className="hover:text-gold-400 transition-colors relative flex items-center justify-center"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full grid place-items-center pt-[0.5px] pl-[1px] leading-none">
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

            {/* Top Row: Brand Logo (Center) & Action Icons (Right) */}
            <div className={`w-full flex items-center justify-center relative transition-all duration-500 ${showMenu ? 'pt-3 pb-1' : 'py-2'} px-12`}>
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
                className="flex items-center justify-center transform transition z-50"
              >
                <img
                  src="/logo-kiks.png"
                  alt="KIKS Logo"
                  width="180"
                  height="72"
                  className={`w-auto object-contain transition-all duration-500 ${showMenu ? 'h-14 md:h-18' : 'h-9 md:h-11'}`}
                />
              </Link>

              {/* Right Side Icons - Moved to top row */}
              <div className={`flex space-x-4 items-center absolute right-12 ${isScrolled || isWhiteThemePage ? 'text-black/70' : 'text-white/70'}`}>
                <button className="hover:text-current hover:opacity-100 transition-all" onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}>
                  <Search size={18} strokeWidth={1.5} />
                </button>
                <Link to="/account" className="hover:text-current hover:opacity-100 transition-all">
                  <User size={18} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/wishlist');
                    }
                  }}
                  className="hover:text-current hover:opacity-100 transition-all relative"
                >
                  <Heart size={18} strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full grid place-items-center pt-[0.5px] pl-[1px] leading-none">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="hover:text-current hover:opacity-100 transition-all relative"
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full grid place-items-center pt-[0.5px] pl-[1px] leading-none">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

              <div
                className={`w-full flex items-center justify-center relative transition-all duration-500 ease-in-out px-10 ${showMenu ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0 pointer-events-none'
                  }`}
              >
                <div className={`flex space-x-16 text-[10px] tracking-[0.3em] font-light items-center mx-auto font-sans ${isScrolled || isWhiteThemePage ? 'text-black' : 'text-white'}`}>
                  <div
                    className="relative group h-full flex items-center py-1 cursor-pointer"
                    onMouseEnter={() => setIsCollectionsHovered(true)}
                    onMouseLeave={() => setIsCollectionsHovered(false)}
                  >
                    <div className="opacity-60 hover:opacity-100 transition-all flex items-center">
                      {t('nav.collections')} <ChevronDown size={12} className="ml-1 opacity-60" strokeWidth={1.5} />
                    </div>

                  {/* Minimal Dropdown */}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-300 ${isCollectionsHovered ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                    <div className="bg-white border border-black/10 shadow-xl w-64 flex flex-col py-2">
                      {navCollections.length > 0 ? navCollections.map(col => (
                        <Link 
                          key={col.id} 
                          to={`/collection/${col.slug}`} 
                          className="block px-6 py-3 text-[10px] tracking-[0.1em] text-black/70 hover:text-black hover:bg-neutral-50 transition-colors uppercase font-bold"
                          onClick={() => setIsCollectionsHovered(false)}
                        >
                          {col.name}
                        </Link>
                      )) : (
                        <span className="px-6 py-4 text-[10px] tracking-[0.1em] text-black/40">{t('nav.vault_empty')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Link to="/blog" className="opacity-60 hover:opacity-100 transition-all">{t('nav.blog')}</Link>
                <Link to="/contact" className="opacity-60 hover:opacity-100 transition-all">{t('nav.contact')}</Link>
                {!isAuthenticated && (
                  <>
                    <Link to="/login" className="opacity-60 hover:opacity-100 transition-all">{t('nav.login')}</Link>
                    <Link to="/register" className="opacity-60 hover:opacity-100 transition-all">{t('nav.register')}</Link>
                  </>
                )}
                {isAuthenticated && isAdmin && (
                  <Link to="/admin" className="opacity-60 hover:opacity-100 transition-all uppercase">{t('nav.admin')}</Link>
                )}
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
              className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100000] md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[400px] bg-white z-[100001] md:hidden flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.1)] border-r border-black/5"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-black/10">
                <div className="flex items-center space-x-4">
                  {mobileMenuLevel !== 'main' && (
                    <button onClick={() => setMobileMenuLevel('main')} className="text-black/60 hover:text-gold-500 transition-colors">
                      <ChevronLeft size={24} strokeWidth={1} />
                    </button>
                  )}
                  <span className="text-[11px] tracking-[0.4em] uppercase font-medium text-black font-serif italic">
                  </span>
                </div>
                <button onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }} className="text-black/60 hover:text-black transition-colors">
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
                      {/* Prominent Register CTA for Guests - At Top */}

                      {/* Main Links */}
                      <div className="space-y-6">
                        <button
                          onClick={() => setMobileMenuLevel('collections')}
                          className="w-full flex items-center justify-between group text-black hover:text-gold-500 transition-colors py-1"
                        >
                          <span className="text-[11px] tracking-[0.25em] uppercase font-medium font-sans">{t('nav.collections')}</span>
                          <ArrowRight size={14} className="text-black/20 group-hover:text-gold-500 transition-all transform group-hover:translate-x-1" />
                        </button>
                      </div>

                      <div className="space-y-8">

                        <Link
                          to="/blog"
                          onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }}
                          className="block text-[11px] tracking-[0.25em] uppercase font-medium font-sans text-black hover:text-gold-500"
                        >
                          {t('nav.blog')}
                        </Link>

                        <Link
                          to="/contact"
                          onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }}
                          className="block text-[11px] tracking-[0.25em] uppercase font-medium font-sans text-black hover:text-gold-500"
                        >
                          {t('nav.contact')}
                        </Link>
                      </div>

                      {/* Account Section */}
                      <div className="pt-10 mt-4 border-t border-black/5 space-y-6">
                        {!isAuthenticated ? (
                          <div className="space-y-6">
                            <Link
                              to="/login"
                              onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }}
                              className="flex items-center text-[10px] tracking-[0.3em] text-black/80 uppercase hover:text-black font-sans"
                            >
                              <User size={16} className="mr-4" strokeWidth={1} /> {t('nav.login')}
                            </Link>
                            <Link
                              to="/register"
                              onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }}
                              className="flex items-center text-[10px] tracking-[0.3em] text-black/80 uppercase hover:text-black font-sans mt-6"
                            >
                              <UserPlus size={16} className="mr-4" strokeWidth={1} /> {t('nav.register')}
                            </Link>
                          </div>
                        ) : (

                          <Link
                            to="/account"
                            onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }}
                            className="flex items-center text-[10px] tracking-[0.3em] text-black/80 uppercase hover:text-black font-sans"
                          >
                            <User size={16} className="mr-4" strokeWidth={1} /> {t('nav.profile')}
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            if (!isAuthenticated) {
                              navigate('/login');
                            } else {
                              navigate('/wishlist');
                            }
                          }}
                          className="flex items-center w-full text-[10px] tracking-[0.3em] text-black/80 uppercase hover:text-black font-sans relative text-left"
                        >
                          <Heart size={16} className="mr-4" strokeWidth={1} /> {t('nav.wishlist')}
                          {wishlistCount > 0 && (
                            <span className="absolute left-4 top-[-6px] bg-black text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full grid place-items-center pt-[0.5px] pl-[1px] shadow-lg leading-none">
                              {wishlistCount}
                            </span>
                          )}
                        </button>

                        {isAuthenticated && isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }}
                            className="flex items-center text-[10px] tracking-[0.3em] text-black font-bold uppercase font-sans"
                          >
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
                          onClick={() => { setIsMobileMenuOpen(false); setMobileMenuLevel('main'); }}
                          className="block text-[11px] tracking-[0.2em] text-black/60 hover:text-gold-500 uppercase transition-colors py-4 border-b border-black/5 font-sans"
                        >
                          {col.name}
                        </Link>
                      ))}
                      {navCollections.length === 0 && (
                        <p className="text-[10px] text-black/20 uppercase tracking-widest text-center py-20 italic">Collection closed</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Info */}
              <div className="p-8 border-t border-black/5 bg-zinc-100/30">
                <p className="text-[8px] tracking-[0.4em] uppercase text-black/60 text-center">© {new Date().getFullYear()} KIKSULTRALUXURY</p>
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
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[200000] w-12 h-12 md:w-14 md:h-14 bg-white border border-black/10 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 group ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 rounded-full bg-black/5 group-hover:bg-black/10 transition-colors" />
        <ChevronDown size={20} className="text-black rotate-180 group-hover:-translate-y-1 transition-transform" strokeWidth={1.5} />
      </button>
    </>
  );
};

export default Navbar;
