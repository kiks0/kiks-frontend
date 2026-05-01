import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeAuthModal } from '../store/uiSlice';

const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state) => state.ui.isAuthModalOpen);
  const [hoverSign, setHoverSign] = useState(false);
  const [hoverCreate, setHoverCreate] = useState(false);

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
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#0a0a0a',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 2000,
            padding: '16px 24px',
            boxShadow: '0 -20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 300 }}>
              <button
                onClick={() => handleAction('/login')}
                onMouseEnter={() => setHoverSign(true)}
                onMouseLeave={() => setHoverSign(false)}
                style={{
                  color: hoverSign ? '#D4AF37' : '#ffffff',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  letterSpacing: 'inherit',
                  textTransform: 'inherit',
                  transition: 'color 0.2s',
                }}
              >
                Sign in
              </button>
              <span style={{ margin: '0 8px' }}>or</span>
              <button
                onClick={() => handleAction('/register')}
                onMouseEnter={() => setHoverCreate(true)}
                onMouseLeave={() => setHoverCreate(false)}
                style={{
                  color: hoverCreate ? '#D4AF37' : '#ffffff',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  letterSpacing: 'inherit',
                  textTransform: 'inherit',
                  transition: 'color 0.2s',
                }}
              >
                create an account
              </button>
              <span style={{ marginLeft: '8px' }}>to access your wishlist and experience the world of KIKS from anywhere.</span>
            </p>

            <button
              onClick={() => dispatch(closeAuthModal())}
              style={{
                color: 'rgba(255,255,255,0.3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                flexShrink: 0,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
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
