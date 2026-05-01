import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Star, Smartphone, ChevronRight, X, Mail, MessageSquare, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../store/authSlice';
import { clearWishlist } from '../store/wishlistSlice';
import { clearCart } from '../store/cartSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Account = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const appUser = useSelector((state) => state.auth.user);
  const [userName, setUserName] = useState(
    appUser ? `${appUser.first_name || ''} ${appUser.last_name || ''}`.trim() || appUser.email.split('@')[0] : 'User'
  );
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();
  const [ordersCount, setOrdersCount] = useState(0);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackStatus, setCallbackStatus] = useState('idle'); // idle, loading, success
  const [callbacksCount, setCallbacksCount] = useState(0);

  useEffect(() => {
    if (appUser) {
        setUserName(`${appUser.first_name || ''} ${appUser.last_name || ''}`.trim() || appUser.email.split('@')[0]);
        // Fetch order count
        const token = localStorage.getItem('kiks_token') || null;
        if (token) {
             fetch('http://localhost:5000/api/orders/myorders', {
                 headers: { 'Authorization': `Bearer ${token}` }
             })
             .then(res => {
                 if(res.ok) return res.json();
                 return [];
             })
             .then(data => setOrdersCount(data.length || 0))
             .catch(err => console.error("Error fetching account orders:", err));

             // Fetch callback count
             fetch(`${API_URL}/api/waitlist/myrequests?email=${appUser?.email}`)
             .then(res => res.json())
             .then(data => setCallbacksCount(data.count || 0))
             .catch(err => console.error("Error fetching callbacks:", err));
        }
    } else {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setUserName(user.name || user.username || 'User');
            } catch (e) {
                setUserName(savedUser);
            }
            // Fetch order count for savedUser locally if token exists
            const token = localStorage.getItem('kiks_token') || null;
            if (token) {
                 fetch(`${API_URL}/api/orders/myorders`, {
                     headers: { 'Authorization': `Bearer ${token}` }
                 })
                 .then(res => {
                     if(res.ok) return res.json();
                     return [];
                 })
                 .then(data => setOrdersCount(data.length || 0))
                 .catch(err => console.error("Error fetching account orders:", err));
            }
        } else {
            // If No User, redirect to login
            navigate('/login');
        }
    }
  }, [appUser, navigate]);

  const cartItems = useSelector((state) => state.cart.items);
  const { token } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    // 1. Sync one last time before clearing if user is logged in
    if (appUser && token) {
      try {
        console.log("[ACCOUNT] Finalizing Palace synchronization before departure...");
        await fetch(`${API_URL}/api/carts/sync`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: appUser.id,
            email: appUser.email,
            items: cartItems.map(i => ({
              product_id: i.id,
              product_name: i.name,
              quantity: i.quantity,
              price: i.price,
              image_url: i.image_url,
              size: i.size
            }))
          })
        });
        console.log("[ACCOUNT] Synchronization complete.");
      } catch (err) {
        console.error("Final logout sync failed:", err);
      }
    }

    dispatch(logout());
    dispatch(clearWishlist());
    dispatch(clearCart());
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen font-sans">
      
      {/* SECTION 1: WHITE WELCOME */}
      <section className="bg-white pt-[140px] md:pt-[160px] pb-12 flex flex-col items-center justify-center animate-fade-in text-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-[10px] md:text-[11px] tracking-[0.3em] font-medium uppercase mb-4 text-black/60">Welcome</p>
          <h1 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase text-black font-normal">{userName}</h1>
        </motion.div>
      </section>

      {/* SECTION 2: BLACK DASHBOARD - Min height to cover background */}
      <section className="bg-[#0A0A0A] text-white py-20 min-h-[70vh]">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1400px]">
          
          {/* Header 3-Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-16 md:gap-x-12 mb-24">
            
            {/* YOUR PRODUCTS */}
            <div className="flex flex-col">
              <h3 className="text-[12px] md:text-[13px] font-bold tracking-[0.2em] uppercase mb-4 text-white">Your Products</h3>
              <div className="w-full h-[1px] bg-white/10 mb-8"></div>
              
              <Link to="/orders" className="flex items-start space-x-5 group cursor-pointer">
                <div className="mt-1 text-white/80 group-hover:text-gold-500 transition-all">
                  <ShoppingBag size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold tracking-wide mb-2 text-white group-hover:text-gold-400 transition-colors">Orders</h4>
                  <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                     {ordersCount === 0 ? "You have no recorded acquisitions" : `You have ${ordersCount} recent ${ordersCount === 1 ? 'acquisition' : 'acquisitions'}`}
                  </p>
                </div>
              </Link>
            </div>

            {/* SELECTIONS */}
            <div className="flex flex-col">
              <h3 className="text-[12px] md:text-[13px] font-bold tracking-[0.2em] uppercase mb-4 text-white">Selections</h3>
              <div className="w-full h-[1px] bg-white/10 mb-8"></div>
              
              <Link to="/wishlist" className="flex items-start space-x-5 group cursor-pointer">
                <div className="mt-1 text-white/80 group-hover:text-gold-500 transition-all">
                  <Star size={20} strokeWidth={1} fill={wishlistCount > 0 ? "currentColor" : "none"} />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold tracking-wide mb-2 text-white group-hover:text-gold-400 transition-colors">Wishlist</h4>
                  <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                    {wishlistCount === 0 ? "Your wishlist is currently empty" : `You have ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'} saved`}
                  </p>
                </div>
              </Link>
            </div>

             {/* SERVICES */}
            <div className="flex flex-col">
              <h3 className="text-[12px] md:text-[13px] font-bold tracking-[0.2em] uppercase mb-4 text-white">Services</h3>
              <div className="w-full h-[1px] bg-white/10 mb-8"></div>
              
              <div 
                onClick={() => setIsConciergeOpen(true)}
                className="flex items-start space-x-5 group cursor-pointer"
              >
                <div className="mt-1 text-white/80 group-hover:text-gold-500 transition-all transform group-hover:scale-110">
                  <Smartphone size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold tracking-wide mb-2 text-white group-hover:text-gold-400 transition-colors">Client Services</h4>
                  <p className="text-[11px] text-neutral-500 font-medium leading-relaxed max-w-[280px]">
                    Access your dedicated KIKS advisor for priority assistance, bespoke requests, and expert guidance.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* ACCOUNT DETAILS */}
          <div className="flex flex-col mt-20">
            <h3 className="text-[12px] md:text-[13px] font-bold tracking-[0.2em] uppercase mb-4 text-white">Account Details</h3>
            <div className="w-full h-[1px] bg-white/10 mb-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Link items */}
              <Link to="/account/security" className="flex items-center justify-between py-8 md:pr-12 group border-b border-white/5 hover:border-white/20 transition-all">
                <h4 className="text-[12px] font-bold tracking-wide text-white group-hover:text-gold-400 transition-colors">Login & Security</h4>
                <ChevronRight size={14} className="text-white/20 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link to="/account/personal-details" className="flex items-center justify-between py-8 md:px-12 group border-b border-white/5 hover:border-white/20 transition-all">
                <h4 className="text-[12px] font-bold tracking-wide text-white group-hover:text-gold-400 transition-colors">Personal details</h4>
                <ChevronRight size={14} className="text-white/20 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/addresses" className="flex items-center justify-between py-8 md:pl-12 group border-b border-white/5 hover:border-white/20 transition-all">
                <h4 className="text-[12px] font-bold tracking-wide text-white group-hover:text-gold-400 transition-colors">Addresses</h4>
                <ChevronRight size={14} className="text-white/20 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
              </Link>


              <div className="flex items-center py-8 md:px-12 border-b border-white/5">
                <button 
                  onClick={handleLogout}
                  className="text-[12px] font-bold tracking-wide text-white/80 hover:text-gold-400 border-b border-transparent hover:border-gold-400 pb-1 transition-all font-serif"
                >
                  Log out
                </button>
              </div>

              <div className="border-b border-white/5 hidden md:block"></div>
            </div>
          </div>

        </div>
      </section>

      {/* CONCIERGE MODAL */}
      <AnimatePresence>
        {isConciergeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConciergeOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0F0F0F] border border-white/10 p-6 sm:p-10 md:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button 
                onClick={() => setIsConciergeOpen(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} strokeWidth={1} />
              </button>

              <div className="text-center mb-6 sm:mb-10">
                <h3 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider font-light">Client Services</h3>
              </div>

              <div className="space-y-6">
                <a href="mailto:kiksultraluxury@gmail.com" className="flex items-center p-4 sm:p-6 bg-white/[0.02] border border-white/5 hover:border-gold-500/30 transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center mr-4 sm:mr-6 text-gold-500 group-hover:bg-gold-500 group-hover:text-black transition-all">
                    <Mail size={18} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] tracking-widest text-white/30 uppercase mb-1">Electronic Mail</p>
                    <p className="text-xs md:text-sm text-white tracking-wide">kiksultraluxury@gmail.com</p>
                  </div>
                </a>

                <a href="https://wa.me/918401020339" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 sm:p-6 bg-white/[0.02] border border-white/5 hover:border-gold-500/30 transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center mr-4 sm:mr-6 text-gold-500 group-hover:bg-gold-500 group-hover:text-black transition-all">
                    <MessageSquare size={18} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] tracking-widest text-white/30 uppercase mb-1">Instant Concierge</p>
                    <p className="text-xs md:text-sm text-white tracking-wide">WhatsApp Messaging</p>
                  </div>
                </a>

                {!showCallbackForm ? (
                  <div 
                    onClick={() => setShowCallbackForm(true)}
                    className="flex items-center p-4 sm:p-6 bg-white/[0.02] border border-white/5 hover:border-gold-500/30 transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center mr-4 sm:mr-6 text-gold-500 group-hover:bg-gold-500 group-hover:text-black transition-all relative">
                      <Phone size={18} strokeWidth={1.5} />
                      {callbacksCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gold-500 text-black text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-fade-in shadow-lg">
                          {callbacksCount}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] tracking-widest text-white/30 uppercase mb-1">Priority Line</p>
                      <p className="text-xs md:text-sm text-white tracking-wide">Request a Call Back</p>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 bg-gold-500/5 border border-gold-500/20"
                  >
                    {callbackStatus === 'success' ? (
                      <div className="text-center py-4">
                         <p className="text-gold-500 text-xs tracking-widest uppercase font-bold mb-2">Request Received</p>
                         <p className="text-white/60 text-[10px] tracking-wide">An advisor will contact you shortly.</p>
                         <button 
                          onClick={() => { setShowCallbackForm(false); setCallbackStatus('idle'); }}
                          className="mt-6 text-[9px] text-white/40 uppercase tracking-[0.3em] hover:text-white"
                         >
                          Back to menu
                         </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-white/40 text-[9px] tracking-widest uppercase mb-6">Enter your telephone number</p>
                        <div className="flex flex-col space-y-4">
                          <input 
                            type="tel"
                            placeholder="+91 00000 00000"
                            value={callbackPhone}
                            onChange={(e) => setCallbackPhone(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-all font-light"
                          />
                          <button 
                            disabled={callbackStatus === 'loading' || !callbackPhone}
                            onClick={async () => {
                              setCallbackStatus('loading');
                              try {
                                await fetch(`${API_URL}/api/waitlist/callback`, {
                                  method: 'POST',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('kiks_token')}`
                                  },
                                  body: JSON.stringify({ 
                                    phone: callbackPhone,
                                    name: userName,
                                    email: appUser?.email
                                  })
                                });
                                setCallbackStatus('success');
                                setCallbacksCount(prev => prev + 1);
                              } catch (e) {
                                setCallbackStatus('idle');
                              }
                            }}
                            className="w-full bg-gold-500 text-black py-3 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-white transition-all disabled:opacity-50"
                          >
                            {callbackStatus === 'loading' ? 'Processing...' : 'Confirm Request'}
                          </button>
                          <button 
                            onClick={() => setShowCallbackForm(false)}
                            className="text-[9px] text-white/20 uppercase tracking-[0.3em] pt-2 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="mt-8 sm:mt-12 text-center">
                <p className="text-[9px] tracking-[0.2em] text-neutral-600 uppercase leading-loose">
                  Our advisors are available 24/7 to ensure your experience with KIKS remains absolute.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Account;


