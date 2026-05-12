import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { closeWishlistAuthPopup } from '../store/uiSlice';

const WishlistAuthPopup = () => {
    const dispatch = useDispatch();
    const { isWishlistAuthPopupOpen, wishlistAuthContext } = useSelector(state => state.ui);

    const getContextMessage = () => {
        if (wishlistAuthContext === 'cart') {
            return 'to add item in the cart .';
        } else if (wishlistAuthContext === 'buy') {
            return 'for buy the product now ';
        }
        return 'to access your wishlist from anywhere.';
    };

    return (
        <AnimatePresence>
            {isWishlistAuthPopupOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-black/10 py-6 px-6 md:px-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-center relative">
                        <div className="text-center">
                            <p className="text-[11px] md:text-xs tracking-[0.2em] text-black/60 font-medium uppercase">
                                <Link 
                                    to="/login" 
                                    className="text-black font-black underline underline-offset-8 decoration-black/10 hover:decoration-black transition-all"
                                    onClick={() => dispatch(closeWishlistAuthPopup())}
                                >
                                    Sign in
                                </Link>
                                <span className="mx-2">or</span>
                                <Link 
                                    to="/register" 
                                    className="text-black font-black underline underline-offset-8 decoration-black/10 hover:decoration-black transition-all"
                                    onClick={() => dispatch(closeWishlistAuthPopup())}
                                >
                                    create an account
                                </Link>
                                <span className="ml-2">{getContextMessage()}</span>
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => dispatch(closeWishlistAuthPopup())}
                            className="absolute right-0 p-2 text-black/20 hover:text-black transition-colors"
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
