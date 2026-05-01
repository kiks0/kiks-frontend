import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeAuthModal } from '../store/uiSlice';

const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state) => state.ui.isAuthModalOpen);

  if (!isOpen) return null;

  const handleAction = (path) => {
    dispatch(closeAuthModal());
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeAuthModal())}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[1001] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#0a0a0a] border border-white/10 w-full max-w-[480px] relative pointer-events-auto overflow-hidden group"
            >
              {/* Subtle Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              
              {/* Close Button */}
              <button
                onClick={() => dispatch(closeAuthModal())}
                className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors z-10 p-2"
              >
                <X size={20} strokeWidth={1} />
              </button>

              <div className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center">
                {/* Brand Icon */}
                <div className="w-16 h-16 rounded-full border border-gold-500/20 flex items-center justify-center mb-8 bg-gold-500/5">
                  <ShieldCheck size={32} className="text-gold-500" strokeWidth={1} />
                </div>

                <h2 className="text-2xl md:text-3xl font-serif tracking-[0.2em] text-white uppercase mb-4">
                  Join the Circle
                </h2>
                
                <p className="text-[11px] md:text-base tracking-[0.1em] text-white/50 mb-10 leading-relaxed font-light italic">
                  Create an account or sign in to save your favorite fragrances to your personal wishlist and experience the world of KIKS.
                </p>

                <div className="w-full space-y-4">
                  <button
                    onClick={() => handleAction('/login')}
                    className="w-full h-14 bg-white text-black text-[11px] font-black tracking-[0.4em] uppercase hover:bg-gold-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 group/btn shadow-xl"
                  >
                    <LogIn size={16} strokeWidth={1.5} className="group-hover/btn:translate-x-1 transition-transform" />
                    Sign In
                  </button>

                  <button
                    onClick={() => handleAction('/register')}
                    className="w-full h-14 border border-white/10 text-white text-[11px] font-black tracking-[0.4em] uppercase hover:bg-white/5 transition-all duration-500 flex items-center justify-center gap-3 group/btn"
                  >
                    <UserPlus size={16} strokeWidth={1.5} className="group-hover/btn:translate-x-1 transition-transform" />
                    Create Account
                  </button>
                </div>

                <p className="mt-8 text-[9px] tracking-[0.3em] text-white/20 uppercase font-black">
                  Excellence is a choice.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
