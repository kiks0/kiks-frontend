import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { closeWishlistAuthPopup } from '../store/uiSlice';

const WishlistAuthPopup = () => {
    const dispatch = useDispatch();
    const { isWishlistAuthPopupOpen } = useSelector(state => state.ui);

    return (
        <AnimatePresence>
            {isWishlistAuthPopupOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0a0a] border-t border-white/10 py-4 px-6 md:px-12"
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-center relative">
                        <div className="text-center">
                            <p className="text-[11px] md:text-xs tracking-[0.1em] text-white/80 font-light">
                                <Link 
                                    to="/login" 
                                    className="text-white font-bold underline underline-offset-4 hover:text-gold-500 transition-colors"
                                    onClick={() => dispatch(closeWishlistAuthPopup())}
                                >
                                    Sign in
                                </Link>
                                <span className="mx-1">or</span>
                                <Link 
                                    to="/register" 
                                    className="text-white font-bold underline underline-offset-4 hover:text-gold-500 transition-colors"
                                    onClick={() => dispatch(closeWishlistAuthPopup())}
                                >
                                    create an account
                                </Link>
                                <span className="ml-1">to access your wishlist from anywhere.</span>
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => dispatch(closeWishlistAuthPopup())}
                            className="absolute right-0 p-2 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WishlistAuthPopup;
