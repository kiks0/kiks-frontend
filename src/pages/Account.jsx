/* eslint-disable */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Heart, Smartphone, ChevronRight, X, Mail, MessageSquare, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, updateProfile } from '../store/authSlice';
import { clearWishlist } from '../store/wishlistSlice';
import { clearCart } from '../store/cartSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Account = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const appUser = useSelector((state) => state.auth.user);
  const [userName, setUserName] = useState(
    appUser ? appUser.first_name || appUser.email.split('@')[0] : 'User'
  );
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();
  const [ordersCount, setOrdersCount] = useState(0);
  const [loadingOrdersCount, setLoadingOrdersCount] = useState(true);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackStatus, setCallbackStatus] = useState('idle'); // idle, loading, success
  const [callbacksCount, setCallbacksCount] = useState(0);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState('idle'); // idle, loading, success
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (appUser) {
        setUserName(appUser.first_name || appUser.email.split('@')[0]);
        // Fetch order count
        const token = localStorage.getItem('kiks_token') || null;
        if (token) {
             fetch(`${API_URL}/api/orders/myorders`, {
                 headers: { 'Authorization': `Bearer ${token}` }
             })
             .then(res => {
                 if(res.ok) return res.json();
                 return [];
             })
              .then(data => {
                  setOrdersCount(data.length || 0);
                  setLoadingOrdersCount(false);
              })
              .catch(err => {
                  console.error("Error fetching account orders:", err);
                  setLoadingOrdersCount(false);
              });

             // Fetch callback count
             fetch(`${API_URL}/api/waitlist/myrequests?email=${appUser?.email}`)
             .then(res => res.json())
             .then(data => setCallbacksCount(data.count || 0))
             .catch(err => console.error("Error fetching callbacks:", err));

             // Fetch deletion status
             setDeletionRequested(appUser.deletion_requested || false);
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
                  .then(data => {
                      setOrdersCount(data.length || 0);
                      setLoadingOrdersCount(false);
                  })
                  .catch(err => {
                      console.error("Error fetching account orders:", err);
                      setLoadingOrdersCount(false);
                  });
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
    setShowLogoutConfirm(false);
    
    // 1. Sync one last time before clearing if user is logged in
    if (appUser && token) {
      // Non-blocking sync to keep logout fast
      fetch(`${API_URL}/api/carts/sync`, {
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
      }).catch(err => console.error("Final logout sync failed:", err));
    }

    dispatch(logout());
    dispatch(clearWishlist());
    dispatch(clearCart());
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen font-sans">
      
      {/* SECTION 1: DRAMATIC WELCOME (TAG BYPASS STRATEGY) */}
      <section className="bg-black pt-[180px] md:pt-[220px] pb-[100px] md:pb-[80px] flex flex-col items-center justify-center text-center px-6 w-full">
        <div className="flex flex-col items-center justify-center w-full">
          <span 
            className="text-[9px] md:text-[10px] tracking-[0.6em] font-black uppercase mb-2 text-white opacity-40 translate-x-[0.3em] block"
          >
            Welcome
          </span>
          <div 
            className="text-2xl md:text-4xl font-serif tracking-[0.3em] uppercase text-white font-light leading-none translate-x-[0.15em]"
          >
            {userName || 'User'}
          </div>
        </div>
      </section>

      {/* SECTION 2: WHITE DASHBOARD - Min height to cover background */}
      <section className="bg-white text-black py-10 md:py-20 min-h-[70vh] border-t border-black/5">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1400px]">
          
          {/* Header 3-Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-x-12 mb-10 md:mb-24">
            
            {/* YOUR PRODUCTS */}
            <div className="flex flex-col">
              <h3 className="text-[13px] md:text-[14px] font-bold tracking-[0.1em] uppercase mb-4 text-black">Your products</h3>
              <div className="w-full h-[1px] bg-black/10 mb-8"></div>
              
              <Link to="/orders" className="flex items-start space-x-5 group cursor-pointer">
                <div className="mt-1 text-black/80 group-hover:text-gold-500 transition-all">
                  <ShoppingBag size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold tracking-wide mb-2 text-black group-hover:text-gold-400 transition-colors">Orders</h4>
                  <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                     {loadingOrdersCount ? (
                        <span className="flex items-center gap-2">
                           Fetching your history <span className="flex gap-1"><span className="w-1 h-1 bg-black/20 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-black/20 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-1 h-1 bg-black/20 rounded-full animate-bounce [animation-delay:-0.3s]"></span></span>
                        </span>
                     ) : ordersCount === 0 ? "You have no recorded orders" : `You have ${ordersCount} ${ordersCount === 1 ? 'order' : 'orders'} recorded`}
                  </p>
                </div>
              </Link>
            </div>

            {/* SELECTIONS */}
            <div className="flex flex-col">
              <h3 className="text-[13px] md:text-[14px] font-bold tracking-[0.1em] uppercase mb-4 text-black">Selections</h3>
              <div className="w-full h-[1px] bg-black/10 mb-8"></div>
              
              <Link to="/wishlist" className="flex items-start space-x-5 group cursor-pointer">
                <div className="mt-1 text-black/80 group-hover:text-gold-500 transition-all">
                  <Heart size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold tracking-wide mb-2 text-black group-hover:text-gold-400 transition-colors">Wishlist</h4>
                  <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                    {wishlistCount === 0 ? "Your wishlist is currently empty" : `You have ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'} saved`}
                  </p>
                </div>
              </Link>
            </div>

             {/* SERVICES */}
            <div className="flex flex-col">
              <h3 className="text-[13px] md:text-[14px] font-bold tracking-[0.1em] uppercase mb-4 text-black">Services</h3>
              <div className="w-full h-[1px] bg-black/10 mb-8"></div>
              
              <div 
                onClick={() => setIsConciergeOpen(true)}
                className="flex items-start space-x-5 group cursor-pointer"
              >
                <div className="mt-1 text-black/80 group-hover:text-gold-500 transition-all transform group-hover:scale-110">
                  <Smartphone size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold tracking-wide mb-2 text-black group-hover:text-gold-400 transition-colors uppercase">Care & services</h4>
                  <p className="text-[11px] text-neutral-500 font-medium leading-relaxed max-w-[280px]">
                    Get support via callback, WhatsApp, or email, and request account deletion.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* ACCOUNT DETAILS */}
          <div className="flex flex-col mt-12 md:mt-20">
            <h3 className="text-[13px] md:text-[14px] font-bold tracking-[0.1em] uppercase mb-4 text-black">Account details</h3>
            <div className="w-full h-[1px] bg-black/10 mb-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Link items */}
              <Link to="/account/security" className="flex items-center justify-between py-8 md:pr-12 group border-b border-black/5 hover:border-black/20 transition-all">
                <h4 className="text-[11px] font-medium tracking-wider text-black/80 group-hover:text-gold-400 transition-colors uppercase">Login & security</h4>
                <ChevronRight size={14} className="text-black/20 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link to="/account/personal-details" className="flex items-center justify-between py-8 md:px-12 group border-b border-black/5 hover:border-black/20 transition-all">
                <h4 className="text-[11px] font-medium tracking-wider text-black/80 group-hover:text-gold-400 transition-colors uppercase">Personal details</h4>
                <ChevronRight size={14} className="text-black/20 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link to="/addresses" className="flex items-center justify-between py-8 md:pl-12 group border-b border-black/5 hover:border-black/20 transition-all">
                <h4 className="text-[11px] font-medium tracking-wider text-black/80 group-hover:text-gold-400 transition-colors uppercase">Addresses</h4>
                <ChevronRight size={14} className="text-black/20 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            {/* Elite Logout Button */}
            <div className="flex justify-center mt-12 md:mt-20">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full max-w-sm bg-black text-white py-5 px-10 text-[11px] font-black tracking-[0.4em] uppercase border border-black hover:bg-white hover:text-black transition-all duration-700 shadow-xl group flex items-center justify-center gap-4"
              >
                Log out from account
                <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* CONCIERGE MODAL */}
      <AnimatePresence>
        {isConciergeOpen && (
          <div className="fixed inset-0 z-[1000000] overflow-y-auto flex items-start justify-center py-10 md:py-20 p-4 sm:p-6 md:p-10">
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
              className="relative w-full max-w-[480px] bg-white border border-black/10 p-5 sm:p-10 md:p-12 overflow-y-auto max-h-[85vh] md:max-h-[90vh] shadow-[0_40px_100px_rgba(0,0,0,0.1)] font-sans"
            >
              <button 
                onClick={() => setIsConciergeOpen(false)}
                className="absolute top-5 right-5 text-black/40 hover:text-black transition-colors z-[10]"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              <div className="text-center mb-6 sm:mb-10 px-10">
                <h3 className="text-xl md:text-2xl font-serif text-black uppercase tracking-wider font-light">User Support</h3>
              </div>

              <div className="space-y-6">
                <a href="mailto:kiksultraluxury@gmail.com" className="flex items-center p-4 sm:p-6 bg-black/[0.02] border border-black/5 hover:border-black transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 flex items-center justify-center mr-4 sm:mr-6 text-black/60 group-hover:bg-black group-hover:text-white transition-all">
                    <Mail size={18} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] tracking-widest text-black/30 uppercase mb-1">Electronic Mail</p>
                    <p className="text-xs md:text-sm text-black tracking-wide">kiksultraluxury@gmail.com</p>
                  </div>
                </a>

                <a href="https://wa.me/918401020339" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 sm:p-6 bg-black/[0.02] border border-black/5 hover:border-black transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 flex items-center justify-center mr-4 sm:mr-6 text-black/60 group-hover:bg-black group-hover:text-white transition-all">
                    <MessageSquare size={18} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] tracking-widest text-black/30 uppercase mb-1">Instant Support</p>
                    <p className="text-xs md:text-sm text-black tracking-wide">WhatsApp Messaging</p>
                  </div>
                </a>

                {!showCallbackForm ? (
                  <div 
                    onClick={() => setShowCallbackForm(true)}
                    className="flex items-center p-4 sm:p-6 bg-black/[0.02] border border-black/5 hover:border-black transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 flex items-center justify-center mr-4 sm:mr-6 text-black/60 group-hover:bg-black group-hover:text-white transition-all relative">
                      <Phone size={18} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] tracking-widest text-black/30 uppercase mb-1">Priority Line</p>
                      <p className="text-xs md:text-sm text-black tracking-wide">Request a Call Back</p>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 bg-black/[0.02] border border-black/5"
                  >
                    {callbackStatus === 'success' ? (
                      <div className="text-center py-4">
                         <p className="text-gold-500 text-xs tracking-widest uppercase font-bold mb-2">Request Received</p>
                         <p className="text-black/60 text-[10px] tracking-wide">An advisor will contact you shortly.</p>
                         <button 
                          onClick={() => { setShowCallbackForm(false); setCallbackStatus('idle'); }}
                          className="mt-6 text-[9px] text-black/40 uppercase tracking-[0.3em] hover:text-black"
                         >
                          Back to menu
                         </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-black/40 text-[9px] tracking-widest uppercase mb-6">Enter your telephone number</p>
                        <div className="flex flex-col space-y-4">
                          <input 
                            type="tel"
                            placeholder="+91"
                            value={callbackPhone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setCallbackPhone(val);
                            }}
                            maxLength="10"
                            className="w-full bg-white border border-black/10 px-4 py-3 text-black text-sm focus:outline-none focus:border-black transition-all font-light"
                          />
                          <button 
                            disabled={callbackStatus === 'loading' || !callbackPhone || callbackPhone.length < 10}
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
                            className="w-full bg-black text-white py-4 text-[10px] tracking-[0.4em] uppercase font-black hover:bg-black/90 border border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                          >
                            {callbackStatus === 'loading' ? 'Processing...' : 'Confirm Request'}
                          </button>
                          <button 
                            onClick={() => setShowCallbackForm(false)}
                            className="text-[9px] text-black/20 uppercase tracking-[0.3em] pt-2 hover:text-black"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ACCOUNT DELETION REQUEST */}
                <div className="pt-6 border-t border-black/5">
                  {deletionStatus === 'success' || deletionRequested ? (
                    <div className="p-6 bg-red-500/5 border border-red-500/20 text-center">
                      <p className="text-red-500 text-[10px] tracking-widest uppercase font-bold mb-2">Request Sent</p>
                      <p className="text-black/40 text-[9px] tracking-wide uppercase leading-relaxed">
                        Your account deletion request has been submitted to the administration.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <p className="text-black/20 text-[9px] tracking-widest uppercase text-center">Security & Privacy</p>
                      <button 
                        disabled={deletionStatus === 'loading'}
                        onClick={async () => {
                          setDeletionStatus('loading');
                          try {
                            const res = await fetch(`${API_URL}/api/users/request-deletion`, {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('kiks_token')}`
                              }
                            });
                            if (res.ok) {
                              setDeletionStatus('success');
                              setDeletionRequested(true);
                              dispatch(updateProfile({ deletion_requested: true }));
                            }
                          } catch (e) {
                            setDeletionStatus('idle');
                          }
                        }}
                        className="w-full border border-black/10 py-4 text-[9px] tracking-[0.3em] uppercase text-black/40 hover:text-red-500 hover:border-red-500/30 transition-all font-bold"
                      >
                        {deletionStatus === 'loading' ? 'Processing...' : 'Request Account Deletion'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 sm:mt-12 text-center">
                <p className="text-[9px] tracking-[0.2em] text-neutral-400 uppercase leading-loose">
                  Our advisors are available 24/7 to ensure your experience with KIKS remains absolute.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200003] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-black/10 p-10 md:p-12 text-center shadow-2xl"
            >
              <div className="mb-8">
                <div className="w-12 h-12 border border-gold-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X size={20} className="text-gold-500 font-light" />
                </div>
                <h3 className="text-sm font-serif tracking-[0.3em] uppercase text-black mb-4">End Session</h3>
                <p className="text-[10px] tracking-[0.15em] text-black/40 uppercase leading-relaxed">
                  Are you certain you wish to depart from the boutique? Your selections will be synchronized.
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-black text-white py-4 text-[10px] font-black tracking-[0.3em] uppercase border border-black hover:bg-white hover:text-black transition-all duration-500"
                >
                  Confirm Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full border border-black/10 py-4 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 hover:text-black transition-all"
                >
                  Remain in the site
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Account;

