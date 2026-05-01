import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeAuthModal } from '../store/uiSlice';

const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state) => state.ui.isAuthModalOpen);

  const handleAction = (path) => {
    dispatch(closeAuthModal());
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 z-[2000] p-4 md:p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <div className="container mx-auto max-w-7xl flex items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] md:text-[11px] tracking-[0.2em] text-white/50 uppercase font-light leading-relaxed">
                <button 
                  onClick={() => handleAction('/login')} 
                  className="text-white font-bold underline underline-offset-4 hover:text-gold-500 transition-all"
                >
                  Sign in
                </button>
                <span className="mx-2">or</span>
                <button 
                  onClick={() => handleAction('/register')} 
                  className="text-white font-bold underline underline-offset-4 hover:text-gold-500 transition-all"
                >
                  create an account
                </button>
                <span className="ml-2 hidden sm:inline">to access your wishlist and experience the world of KIKS from anywhere.</span>
                <span className="ml-2 sm:hidden">to access your wishlist.</span>
              </p>
            </div>
            
            <button
              onClick={() => dispatch(closeAuthModal())}
              className="text-white/30 hover:text-white transition-colors p-2"
            >
              <X size={16} strokeWidth={1} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
