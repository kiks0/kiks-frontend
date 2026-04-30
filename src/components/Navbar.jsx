import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, ShoppingBag, Heart, User, ChevronDown } from 'lucide-react';
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

  const isAccountPage =
    location.pathname.startsWith('/account') ||
    location.pathname === '/addresses' ||
    location.pathname === '/orders' ||
    location.pathname === '/wishlist';

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [navCollections, setNavCollections] = useState([]);

  const { items: cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin =
    user &&
    (user.email === 'hit.goyani1010@gmail.com' ||
      user.email.endsWith('@kiksultraluxury.com'));

  const lastScrollY = useRef(0);

  useEffect(() => {
    fetch(`${API_URL}/api/collections`)
      .then((res) => res.json())
      .then((data) => setNavCollections(data))
      .catch((err) => console.error('Nav collections error:', err));

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY < 50) {
        setShowMenu(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowMenu(false);
        setIsMobileMenuOpen(false);
      } else {
        setShowMenu(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled || isAccountPage
            ? 'bg-dark-900/97 backdrop-blur-md border-b border-white/[0.06] py-2 shadow-2xl shadow-black/60'
            : 'bg-transparent py-3'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-14 flex flex-col items-center">

          {/* ── MOBILE NAV ── */}
          <div className="flex md:hidden flex-row items-center justify-between w-full relative z-50 h-16 text-white">

            {/* Left */}
            <div className="flex items-center space-x-4">
              <button
                className="text-white/70 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X size={20} strokeWidth={1} />
                ) : (
                  <Menu size={20} strokeWidth={1} />
                )}
              </button>
              <button
                className="text-white/70 hover:text-white transition-colors"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={20} strokeWidth={1} />
              </button>
            </div>

            {/* Center logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex justify-center">
              <Link
                to="/"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center pointer-events-auto transition hover:opacity-60"
              >
                <img
                  src="/logo-kiks.webp"
                  alt="KIKS"
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4">
              <Link
                to="/account"
                className="text-white/70 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={20} strokeWidth={1} />
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsCartOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-white/70 hover:text-white transition-colors relative"
              >
                <ShoppingBag size={20} strokeWidth={1} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-1.5 text-gold-500 text-[8px] font-normal leading-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── DESKTOP NAV ── */}
          <div className="hidden md:flex flex-col items-center w-full relative z-50">

            {/* Logo */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center justify-center transition hover:opacity-60 z-50 relative mt-3 mb-2"
            >
              <img
                src="/logo-kiks.webp"
                alt="KIKS"
                className="h-14 md:h-20 w-auto object-contain transition-all"
              />
            </Link>

            {/* Menu row */}
            <div
              className={`w-full flex items-center justify-center relative transition-all duration-500 ease-in-out px-10 ${
                showMenu
                  ? 'max-h-24 opacity-100 mb-2'
                  : 'max-h-0 opacity-0 mb-0 pointer-events-none'
              }`}
            >
              {/* Nav links */}
              <div className="flex space-x-14 text-[11px] tracking-[0.28em] font-normal items-center mx-auto text-white">

                {/* Collections dropdown */}
                <div
                  className="relative group h-full flex items-center py-2 cursor-pointer"
                  onMouseEnter={() => setIsCollectionsHovered(true)}
                  onMouseLeave={() => setIsCollectionsHovered(false)}
                >
                  <div className="text-white/70 hover:text-white transition-colors duration-300 flex items-center">
                    {t('nav.collections')}
                    <ChevronDown size={12} className="ml-1.5 opacity-40" strokeWidth={1.5} />
                  </div>

                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ${
                      isCollectionsHovered
                        ? 'opacity-100 translate-y-0 visible'
                        : 'opacity-0 translate-y-2 invisible'
                    }`}
                  >
                    <div className="bg-dark-900 border border-white/[0.07] shadow-2xl shadow-black/80 p-7 w-60 flex flex-col space-y-5">
                      {navCollections.length > 0 ? (
                        navCollections.map((col) => (
                          <Link
                            key={col.id}
                            to={`/collection/${col.slug}`}
                            className="text-[10px] tracking-[0.18em] text-white/40 hover:text-white transition-colors duration-300 uppercase"
                          >
                            {col.name}
                          </Link>
                        ))
                      ) : (
                        <span className="text-[10px] tracking-[0.18em] text-white/20">
                          {t('nav.vault_empty')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to="/blog"
                  className="text-white/70 hover:text-white transition-colors duration-300"
                >
                  {t('nav.blog')}
                </Link>
                <Link
                  to="/contact"
                  className="text-white/70 hover:text-white transition-colors duration-300"
                >
                  {t('nav.contact')}
                </Link>

                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      className="text-white/70 hover:text-white transition-colors duration-300"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="text-white/70 hover:text-white transition-colors duration-300"
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                )}

                {isAuthenticated && isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gold-500 hover:text-gold-400 transition-colors text-[9px] tracking-[0.3em] font-normal"
                  >
                    {t('nav.admin')}
                  </Link>
                )}
              </div>

              {/* Right icons */}
              <div className="flex space-x-6 items-center absolute right-14 text-white">
                <button
                  className="text-white/60 hover:text-white transition-colors duration-300"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search size={17} strokeWidth={1} />
                </button>

                <Link
                  to="/account"
                  className="text-white/60 hover:text-white transition-colors duration-300"
                >
                  <User size={17} strokeWidth={1} />
                </Link>

                <Link
                  to="/wishlist"
                  className="text-white/60 hover:text-white transition-colors duration-300 relative"
                >
                  <Heart size={17} strokeWidth={1} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-1.5 text-gold-500 text-[8px] font-normal leading-none">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="text-white/60 hover:text-white transition-colors duration-300 relative"
                >
                  <ShoppingBag size={17} strokeWidth={1} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-1.5 text-gold-500 text-[8px] font-normal leading-none">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE MENU PANEL ── */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-dark-900/98 backdrop-blur-xl border-t border-white/[0.06] px-8 flex flex-col space-y-6 transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileMenuOpen && showMenu
              ? 'max-h-[80vh] py-10 opacity-100'
              : 'max-h-0 py-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col space-y-5">
            <span className="text-[11px] tracking-[0.3em] text-white/50 flex justify-between items-center uppercase">
              {t('nav.collections')} <ChevronDown size={12} className="opacity-30" />
            </span>
            <div className="flex flex-col space-y-4 pl-5 border-l border-white/[0.07]">
              {navCollections.map((col) => (
                <Link
                  key={col.id}
                  to={`/collection/${col.slug}`}
                  className="text-[10px] tracking-[0.25em] text-white/40 hover:text-white uppercase transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {col.name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/blog"
            className="text-[11px] tracking-[0.3em] text-white/60 hover:text-white uppercase transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('nav.blog')}
          </Link>
          <Link
            to="/contact"
            className="text-[11px] tracking-[0.3em] text-white/60 hover:text-white uppercase transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('nav.contact')}
          </Link>

          <div className="pt-8 mt-2 border-t border-white/[0.05] grid grid-cols-2 gap-5">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="flex items-center text-[10px] tracking-[0.25em] text-white/40 uppercase transition-colors hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={15} className="mr-3 opacity-60" /> {t('nav.login')}
              </Link>
            ) : (
              <Link
                to="/account"
                className="flex items-center text-[10px] tracking-[0.25em] text-white/40 uppercase transition-colors hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={15} className="mr-3 opacity-60" /> {t('nav.profile')}
              </Link>
            )}
            <Link
              to="/wishlist"
              className="flex items-center text-[10px] tracking-[0.25em] text-white/40 uppercase transition-colors hover:text-white relative"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Heart size={15} className="mr-3 opacity-60" /> {t('nav.wishlist')}
              {wishlistCount > 0 && (
                <span className="ml-1.5 text-gold-500 text-[8px] font-normal">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* WhatsApp concierge */}
      <a
        href="https://wa.me/919998887766"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] group flex items-center"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 bg-dark-900 border border-gold-500/40 flex items-center justify-center shadow-2xl shadow-black/60 group-hover:border-gold-500 transition-all duration-500 relative">
          <div className="absolute inset-0 animate-ping bg-gold-500/10 group-hover:hidden" />
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 md:w-6 md:h-6 fill-gold-500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.341-4.438 9.886-9.886 9.886m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </div>
      </a>
    </>
  );
};

export default Navbar;
