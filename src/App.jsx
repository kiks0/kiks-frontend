// KIKS ULTRA LUXURY - Production Build v1.0.4
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchExchangeRates, setCurrency } from './store/currencySlice';
import { logout } from './store/authSlice';
import { fetchWishlist } from './store/wishlistSlice';

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
import PageLoader from './components/PageLoader';

import ProtectedRoute from './components/ProtectedRoute';

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
const PersonalDetails = lazy(() => import('./pages/PersonalDetails'));
const PaymentCancelled = lazy(() => import('./pages/PaymentCancelled'));



function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchExchangeRates());
    dispatch(fetchWishlist());
    
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
          dispatch(logout());
          window.location.href = '/';
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
      <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
        <Loader />
        <CookieBanner />
        <PromoPopup />
        <CartSync />
        <AuthModal />
        <WishlistAuthPopup />
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader fullScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Protected Account Routes */}
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/account/personal-details" element={<ProtectedRoute><PersonalDetails /></ProtectedRoute>} />
              <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/account/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
              
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPostDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Auth key="login" />} />
              <Route path="/register" element={<Auth isRegisterInitial={true} key="register" />} />
              <Route path="/collection/:slug" element={<Collection />} />
              <Route path="/collection/:collectionSlug/:productSlug" element={<ProductDetail />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<Terms />} />
              <Route path="/return-policy" element={<Returns />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/cancellation-policy" element={<CancellationPolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/about" element={<About />} />

            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
