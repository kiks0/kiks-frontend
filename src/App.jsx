// KIKS ULTRA LUXURY - Production Build v1.0.4
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchExchangeRates, setCurrency } from './store/currencySlice';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import CookieBanner from './components/CookieBanner';
import PromoPopup from './components/PromoPopup';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopReset from './components/ScrollToTopReset';
import CartSync from './components/CartSync';
import AuthModal from './components/AuthModal';
import WishlistAuthPopup from './components/WishlistAuthPopup';

// Lazy Loaded Pages for Performance
const Home = lazy(() => import('./pages/Home'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Auth = lazy(() => import('./pages/Auth'));
const Collection = lazy(() => import('./pages/Collection'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Admin = lazy(() => import('./pages/Admin'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Addresses = lazy(() => import('./pages/Addresses'));
const Orders = lazy(() => import('./pages/Orders'));
const Security = lazy(() => import('./pages/Security'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Returns = lazy(() => import('./pages/Returns'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const About = lazy(() => import('./pages/About'));
const CancellationPolicy = lazy(() => import('./pages/CancellationPolicy'));
const Story = lazy(() => import('./pages/Story'));
const PersonalDetails = lazy(() => import('./pages/PersonalDetails'));

import PageLoader from './components/PageLoader';

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchExchangeRates());
    
    // Global session validator for real-time security (e.g. instant logout on deletion)
    const checkSession = async () => {
      const token = localStorage.getItem('kiks_token');
      if (!token) return;
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          const { logout } = await import('./store/authSlice');
          dispatch(logout());
          window.location.href = '/login?reason=session_expired';
        }
      } catch (e) {}
    };

    checkSession();
    // Check every 30 seconds for long-running sessions (Instant logout on deletion)
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Router>
      <ScrollToTopReset />
      <div className="flex flex-col min-h-screen bg-black overflow-x-hidden">
        <Loader />
        <CookieBanner />
        <PromoPopup />
        <CartSync />
        <AuthModal />
        <WishlistAuthPopup />
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/personal-details" element={<PersonalDetails />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/account/security" element={<Security />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPostDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth isRegisterInitial={true} />} />
              <Route path="/collection/:slug" element={<Collection />} />
              <Route path="/collection/:collectionSlug/:productSlug" element={<ProductDetail />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<Terms />} />
              <Route path="/return-policy" element={<Returns />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/cancellation-policy" element={<CancellationPolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/about" element={<About />} />
              <Route path="/essence" element={<Story />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

