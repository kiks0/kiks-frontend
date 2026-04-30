import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Star, Smartphone, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { logout } from '../store/authSlice';
import { clearWishlist } from '../store/wishlistSlice';
import { clearCart } from '../store/cartSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Account = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const appUser = useSelector((state) => state.auth.user);
  const [userName, setUserName] = useState(
    appUser ? `${appUser.first_name || ''} ${appUser.last_name || ''}`.trim() || appUser.email.split('@')[0] : 'Patron'
  );
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();
  const [ordersCount, setOrdersCount] = useState(0);

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
                 fetch('http://localhost:5000/api/orders/myorders', {
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
              
              <div className="flex items-start space-x-5 group cursor-pointer">
                <div className="mt-1 text-white/80 group-hover:text-white transition-colors">
                  <Smartphone size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold tracking-wide mb-2 text-white group-hover:text-neutral-400 transition-colors">Care & Services</h4>
                  <p className="text-[11px] text-neutral-500 font-medium leading-relaxed max-w-[280px]">
                    KIKS offers specialized repair and maintenance services. Your piece will be entrusted to expert artisans at our workshop.
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

              <Link to="/account" className="flex items-center justify-between py-8 md:pr-12 group border-b border-white/5 hover:border-white/20 transition-all">
                <h4 className="text-[12px] font-bold tracking-wide text-white group-hover:text-gold-400 transition-colors">Preferences</h4>
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

    </div>
  );
};

export default Account;


