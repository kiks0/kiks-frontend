import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, LogIn, UserPlus, Phone, Calendar, Globe, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';
import { fetchWishlist, clearWishlist } from '../store/wishlistSlice';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { setCurrency } from '../store/currencySlice';
import { applyLocationSettings } from '../utils/i18nUtils';

const Auth = ({ isRegisterInitial = false }) => {
    const [isRegister, setIsRegister] = useState(isRegisterInitial);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Reactivation State
    const [showReactivateModal, setShowReactivateModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [reactivateEmail, setReactivateEmail] = useState('');
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [otpTimer, setOtpTimer] = useState(180); // 3 minutes in seconds
    const [isReactivating, setIsReactivating] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && status !== 'success') {
            navigate('/');
        }
    }, [isAuthenticated, navigate, status]);

    // OTP Timer Logic
    useEffect(() => {
        let interval;
        if (showOtpModal && otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        } else if (otpTimer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [showOtpModal, otpTimer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    const location = useLocation();

    // Sync state when navigating between /login and /register
    useEffect(() => {
        // Use proper location hook for reliable navigation on mobile
        const path = location.pathname;
        if (path.includes('/register')) {
            setIsRegister(true);
        } else if (path.includes('/login')) {
            setIsRegister(false);
            setIsForgotPassword(false);
            setIsResetPassword(false);
        }
        
        // Reset status/errors on path change
        setStatus('idle');
        setErrorMessage('');
        
        // Check for reset token in URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            setResetToken(token);
            setIsResetPassword(true);
        }
    }, [isRegisterInitial, location.pathname, location.search]);
    
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [errorMessage, setErrorMessage] = useState('');

    // Comprehensive Country data (Synchronized with PersonalDetails)
    const countryList = [
        { name: 'India', code: '+91', iso: 'IN', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'United Arab Emirates', code: '+971', iso: 'AE', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Saudi Arabia', code: '+966', iso: 'SA', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Qatar', code: '+974', iso: 'QA', length: 8, pattern: /^[0-9]{8}$/ },
        { name: 'Kuwait', code: '+965', iso: 'KW', length: 8, pattern: /^[0-9]{8}$/ },
        { name: 'Oman', code: '+968', iso: 'OM', length: 8, pattern: /^[0-9]{8}$/ },
        { name: 'Bahrain', code: '+973', iso: 'BH', length: 8, pattern: /^[0-9]{8}$/ },
        { name: 'United Kingdom', code: '+44', iso: 'GB', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'United States', code: '+1', iso: 'US', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'France', code: '+33', iso: 'FR', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Germany', code: '+49', iso: 'DE', length: 11, pattern: /^[0-9]{11}$/ },
        { name: 'Italy', code: '+39', iso: 'IT', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'Spain', code: '+34', iso: 'ES', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Switzerland', code: '+41', iso: 'CH', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Singapore', code: '+65', iso: 'SG', length: 8, pattern: /^[0-9]{8}$/ },
        { name: 'Canada', code: '+1', iso: 'CA', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'Australia', code: '+61', iso: 'AU', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Japan', code: '+81', iso: 'JP', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'South Korea', code: '+82', iso: 'KR', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'China', code: '+86', iso: 'CN', length: 11, pattern: /^[0-9]{11}$/ },
        { name: 'Hong Kong', code: '+852', iso: 'HK', length: 8, pattern: /^[0-9]{8}$/ },
        { name: 'Malaysia', code: '+60', iso: 'MY', length: 9, pattern: /^[0-9]{9,10}$/ },
        { name: 'Thailand', code: '+66', iso: 'TH', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Vietnam', code: '+84', iso: 'VN', length: 9, pattern: /^[0-9]{9,10}$/ },
        { name: 'Indonesia', code: '+62', iso: 'ID', length: 10, pattern: /^[0-9]{10,12}$/ },
        { name: 'Netherlands', code: '+31', iso: 'NL', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Belgium', code: '+32', iso: 'BE', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Sweden', code: '+46', iso: 'SE', length: 9, pattern: /^[0-9]{9,10}$/ },
        { name: 'Norway', code: '+47', iso: 'NO', length: 8, pattern: /^[0-9]{8}$/ },
        { name: 'Denmark', code: '+45', iso: 'DK', length: 8, pattern: /^[0-9]{8}$/ },
        { name: 'Portugal', code: '+351', iso: 'PT', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Austria', code: '+43', iso: 'AT', length: 10, pattern: /^[0-9]{10,11}$/ },
        { name: 'Greece', code: '+30', iso: 'GR', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'Turkey', code: '+90', iso: 'TR', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'Mexico', code: '+52', iso: 'MX', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'Brazil', code: '+55', iso: 'BR', length: 11, pattern: /^[0-9]{11}$/ },
        { name: 'Argentina', code: '+54', iso: 'AR', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'South Africa', code: '+27', iso: 'ZA', length: 9, pattern: /^[0-9]{9}$/ },
        { name: 'Russia', code: '+7', iso: 'RU', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'Israel', code: '+972', iso: 'IL', length: 9, pattern: /^[0-9]{9}$/ }
    ];

    // Form data with the extended fields from the luxury reference
    const [formData, setFormData] = useState({
        email: '',
        title: 'Title',
        firstName: '',
        lastName: '',
        countryCode: '', // Will be set by useEffect
        telephone: '',
        dobDay: 'Day',
        dobMonth: 'Month',
        dobYear: 'Year',
        password: '',
        location: localStorage.getItem('kiks_location_name') || 'India'
    });

    useEffect(() => {
        // Set initial country code based on location
        const loc = localStorage.getItem('kiks_location_name') || 'India';
        const country = countryList.find(c => c.name === loc);
        if (country) {
            setFormData(prev => ({
                ...prev,
                location: loc,
                countryCode: `${country.code} (${country.iso})`
            }));
        }
    }, [countryList]);

    const validatePhone = (code, number) => {
        // Extract code part if it's in format "+91 (IN)"
        const pureCode = code.split(' ')[0];
        const country = countryList.find(c => c.code === pureCode);
        if (!country) return true;
        if (!number) return true; // Optional field
        return country.pattern.test(number);
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            // Phone validation if register
            if (isRegister && formData.telephone) {
                if (!validatePhone(formData.countryCode, formData.telephone)) {
                    const pureCode = formData.countryCode.split(' ')[0];
                    const country = countryList.find(c => c.code === pureCode);
                    setErrorMessage(`Please enter a valid ${country?.name || 'phone'} number.`);
                    setIsLoading(false);
                    return;
                }
            }

            // 1. Submit to the registration/login API
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.reactivateAvailable) {
                setReactivateEmail(formData.email);
                setShowReactivateModal(true);
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                setErrorMessage(data.message || 'Authentication failed. Please try again.');
                setStatus('error');
                setIsLoading(false);
                return;
            }
            
            // 2. Notify the Boutique Admin via Web3Forms (only for registration)
            if (isRegister) {
                try {
                    await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            access_key: '7b09bf9e-5d82-4987-8350-bb836992b949',
                            from_name: 'KIKS USER REGISTRY',
                            subject: `NEW USER: ${formData.firstName} ${formData.lastName}`,
                            message: `A new client has joined the palace.
Registered User Details:
----------------------------
Name: ${formData.title} ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.countryCode} ${formData.telephone}
DOB: ${formData.dobDay}/${formData.dobMonth}/${formData.dobYear}
Residence: ${formData.location}
----------------------------
Marketing Consent: Granted
                            `
                        }),
                    });
                } catch (web3Error) {
                    console.error('Web3Forms notification failed, but user was registered in DB', web3Error);
                }
            }

            // 3. Update local app state with real user data from backend
            dispatch(login({ user: data.user, token: data.token }));
            dispatch(fetchWishlist());
            setStatus('success');
            setTimeout(() => navigate('/'), 2000);
            
        } catch (error) {
            console.error('Auth error:', error);
            setErrorMessage('Connection error. Please ensure the server is running.');
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestReactivation = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/reactivate-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: reactivateEmail })
            });
            const data = await response.json();
            if (data.success) {
                setShowReactivateModal(false);
                setShowOtpModal(true);
                setOtpTimer(180); // Reset to 3 mins
            } else {
                alert(data.message || 'Failed to send verification code.');
            }
        } catch (err) {
            console.error('Reactivation request error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpCode];
        newOtp[index] = value.slice(-1);
        setOtpCode(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerifyOtp = async () => {
        const code = otpCode.join('');
        if (code.length !== 6) {
            setOtpError('Please enter the full 6-digit code.');
            return;
        }

        setIsReactivating(true);
        setOtpError('');

        try {
            const response = await fetch(`${API_URL}/api/users/reactivate-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: reactivateEmail, code })
            });

            const data = await response.json();

            if (data.success) {
                dispatch(login({ user: data.user, token: data.token }));
                dispatch(fetchWishlist());
                setShowOtpModal(false);
                setStatus('success');
                setTimeout(() => navigate('/'), 2000);
            } else {
                setOtpError(data.message || 'Invalid verification code.');
            }
        } catch (err) {
            setOtpError('An error occurred. Please try again.');
        } finally {
            setIsReactivating(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        console.log(`[FRONTEND] Requesting password reset for: ${resetEmail}`);
        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            });
            const data = await res.json();
            console.log(`[FRONTEND] Forgot password response status: ${res.status}`, data);
            
            if (res.ok) {
                setStatus('reset_sent');
            } else {
                setErrorMessage(data.message || 'The vault was unable to process this request. Please verify your details.');
            }
        } catch (err) {
            console.error(`[FRONTEND ERROR] Forgot password:`, err);
            setErrorMessage('Unable to connect to the KIKS sanctuary. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }
        setIsLoading(true);
        setErrorMessage('');
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('reset_success');
                setTimeout(() => {
                    setIsResetPassword(false);
                    setIsRegister(false);
                    setStatus('idle');
                    navigate('/login');
                }, 3000);
            } else {
                setErrorMessage(data.message || 'Reset failed.');
            }
        } catch (err) {
            setErrorMessage('Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                // Fetch user info from Google using the access token
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleUser = await userInfoRes.json();

                // Send to backend to login or create account
                const response = await fetch(`${API_URL}/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: googleUser.email,
                        googleId: googleUser.sub,
                        firstName: googleUser.given_name,
                        lastName: googleUser.family_name,
                        image: googleUser.picture
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    dispatch(login({ user: data.user, token: data.token }));
                    dispatch(fetchWishlist());
                    setStatus('success');
                    setTimeout(() => navigate('/'), 2000);
                } else {
                    setErrorMessage(data.message || 'Google Login failed.');
                }
            } catch (error) {
                setErrorMessage('Google authentication error.');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setErrorMessage('Google Login was cancelled or failed.'),
    });

    const inputClasses = "w-full bg-transparent border-b border-white/10 py-4 text-sm text-white focus:outline-none focus:border-gold-500 transition-all font-light tracking-widest placeholder:text-white/20 appearance-none";
    const labelClasses = "text-[9px] tracking-[0.3em] font-bold text-white/30 uppercase block mb-1 mt-4";

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="bg-dark-900 min-h-screen text-white pt-24 md:pt-40 pb-12 md:pb-20 font-sans selection:bg-gold-500/30 selection:text-white relative z-0">
            
            {/* Ambient Background */}
            <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] bg-gold-500/5 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="container mx-auto px-6 max-w-xl relative z-10">
                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 flex flex-col items-center"
                        >
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="mb-12 relative"
                            >
                                <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full" />
                                <Sparkles size={80} className="text-gold-500 relative z-10" strokeWidth={1} />
                            </motion.div>
                            
                            <motion.h2 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                className="text-4xl font-serif tracking-[0.2em] uppercase mb-6 font-light"
                            >
                                {isRegister ? 'Identity Verified' : 'Welcome Back'}
                            </motion.h2>
                            
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="flex flex-col items-center"
                            >
                                <p className="text-gold-500/40 text-[10px] tracking-[0.5em] uppercase mb-10">
                                    {isRegister ? 'Entry granted to the vault' : 'Accessing your private portal'}
                                </p>
                                <div className="w-12 h-[1px] bg-gold-500/30 animate-pulse" />
                            </motion.div>
                        </motion.div>
                    ) : status === 'reset_sent' ? (
                        <motion.div key="reset_sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <h2 className="text-3xl font-serif tracking-widest uppercase mb-4">Instructions Sent</h2>
                            <p className="text-gray-400 text-[10px] tracking-[0.4em] uppercase mb-8">If the email exists, we have sent reset instructions.</p>
                            <button onClick={() => { setStatus('idle'); setIsForgotPassword(false); }} className="text-gold-500 text-[10px] tracking-widest uppercase border-b border-gold-500/30 pb-1">Return to Login</button>
                        </motion.div>
                    ) : status === 'reset_success' ? (
                        <motion.div key="reset_success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <h2 className="text-3xl font-serif tracking-widest uppercase mb-4">Restoration Complete</h2>
                            <p className="text-gray-400 text-[10px] tracking-[0.4em] uppercase">Your identity has been restored. Redirecting to login...</p>
                        </motion.div>
                    ) : isResetPassword ? (
                        <motion.div key="reset_password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="text-center mb-16">
                                <h1 className="text-4xl font-serif tracking-[0.1em] uppercase font-light">Restore Identity</h1>
                                <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase mt-4">Secure your portal with a new password</p>
                                
                                {errorMessage && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] tracking-widest uppercase"
                                    >
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </div>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="relative">
                                    <label className={labelClasses}>New Password</label>
                                    <input 
                                        type={showNewPassword ? 'text' : 'password'} 
                                        required 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        className={inputClasses} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-0 bottom-5 text-white/30 hover:text-white transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label className={labelClasses}>Confirm New Password</label>
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'} 
                                        required 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        className={inputClasses} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-0 bottom-5 text-white/30 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <button disabled={isLoading} className="w-full h-16 bg-white text-black text-[11px] font-black tracking-[0.5em] uppercase hover:bg-gold-500 transition-all duration-700 mt-12">
                                    {isLoading ? 'Processing' : 'Update Password'}
                                </button>
                            </form>
                        </motion.div>
                    ) : isForgotPassword ? (
                        <motion.div key="forgot_password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="text-center mb-16">
                                <h1 className="text-4xl font-serif tracking-[0.1em] uppercase font-light">Identity Restoration</h1>
                                <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase mt-4">Enter your email to receive recovery link</p>
                                
                                {errorMessage && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] tracking-widest uppercase"
                                    >
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </div>
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Email Address</label>
                                    <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className={inputClasses} />
                                </div>
                                <button disabled={isLoading} className="w-full h-16 bg-white text-black text-[11px] font-black tracking-[0.5em] uppercase hover:bg-gold-500 transition-all duration-700 mt-12">
                                    {isLoading ? 'Sending Link' : 'Send Recovery Link'}
                                </button>
                                <div className="text-center mt-10">
                                    <button type="button" onClick={() => setIsForgotPassword(false)} className="text-[10px] tracking-[0.3em] font-bold text-white/30 hover:text-gold-500 transition-all uppercase">Back to Login</button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={isRegister ? 'register' : 'login'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="text-center mb-6">
                                <h1 className="text-3xl md:text-4xl font-serif tracking-[0.1em] uppercase font-light">
                                    {isRegister ? 'User Registry' : 'User Login'}
                                </h1>
                                <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase mt-2">
                                    {isRegister ? 'Create your account' : ''}
                                </p>
                                
                                {errorMessage && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] tracking-widest uppercase"
                                    >
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                
                                {/* Email Field */}
                                <div>
                                    <label className={labelClasses}>Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className={inputClasses}
                                    />
                                </div>

                                {isRegister && (
                                    <>
                                        {/* Title Selection */}
                                        <div className="relative group">
                                            <label className={labelClasses}>Title</label>
                                            <select 
                                                className={inputClasses}
                                                value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            >
                                                <option className="bg-[#0a0a0a]" value="Title">Title</option>
                                                <option className="bg-[#0a0a0a]" value="Mr">Mr</option>
                                                <option className="bg-[#0a0a0a]" value="Mrs">Mrs</option>
                                                <option className="bg-[#0a0a0a]" value="Miss">Miss</option>
                                                <option className="bg-[#0a0a0a]" value="Mx">Mx</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-0 bottom-5 text-white/30 pointer-events-none" />
                                        </div>

                                        {/* Names Section */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-2">
                                            <div>
                                                <label className={labelClasses}>First name</label>
                                                <input 
                                                    type="text" 
                                                    required={isRegister}
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Last name</label>
                                                <input 
                                                    type="text" 
                                                    required={isRegister}
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Section */}
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-8 gap-y-4 mt-2">
                                            <div className="relative">
                                                <label className={labelClasses}>Country code</label>
                                                <select 
                                                    className={inputClasses}
                                                    value={formData.countryCode}
                                                    onChange={(e) => {
                                                        const selectedValue = e.target.value;
                                                        const country = countryList.find(c => `${c.code} (${c.iso})` === selectedValue);
                                                        
                                                        // Update form state
                                                        setFormData({
                                                            ...formData, 
                                                            countryCode: selectedValue,
                                                            location: country ? country.name : formData.location
                                                        });

                                                        // Auto-apply language and currency based on country
                                                        if (country) {
                                                            applyLocationSettings(country.name, i18n, dispatch, setCurrency);
                                                        }
                                                    }}
                                                >
                                                    {countryList.map(c => (
                                                        <option key={`${c.iso}-${c.code}`} className="bg-[#0a0a0a]" value={`${c.code} (${c.iso})`}>
                                                            {c.code} ({c.iso})
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-0 bottom-5 text-white/30 pointer-events-none" />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Telephone (optional)</label>
                                                <input 
                                                    type="tel" 
                                                    value={formData.telephone}
                                                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>

                                        {/* Date of Birth Section */}
                                        <div>
                                            <div className="flex items-center space-x-2 mt-8 mb-1">
                                                <label className="text-[9px] tracking-[0.3em] font-bold text-white/30 uppercase">Date of birth (optional)</label>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                                                <div className="relative">
                                                    <select className={inputClasses} value={formData.dobDay} onChange={(e) => setFormData({...formData, dobDay: e.target.value})}>
                                                        <option className="bg-[#0a0a0a]">Day</option>
                                                        {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} className="bg-[#0a0a0a]" value={d}>{d}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-0 bottom-5 text-white/30 pointer-events-none" />
                                                </div>
                                                <div className="relative">
                                                    <select className={inputClasses} value={formData.dobMonth} onChange={(e) => setFormData({...formData, dobMonth: e.target.value})}>
                                                        <option className="bg-[#0a0a0a]">Month</option>
                                                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <option key={m} className="bg-[#0a0a0a]" value={m}>{m}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-0 bottom-5 text-white/30 pointer-events-none" />
                                                </div>
                                                <div className="relative">
                                                    <select className={inputClasses} value={formData.dobYear} onChange={(e) => setFormData({...formData, dobYear: e.target.value})}>
                                                        <option className="bg-[#0a0a0a]">Year</option>
                                                        {Array.from({length: 80}, (_, i) => 2024 - i).map(y => <option key={y} className="bg-[#0a0a0a]" value={y}>{y}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-0 bottom-5 text-white/30 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Password Field */}
                                <div className="relative">
                                    <div className="flex justify-between items-end">
                                        <label className={labelClasses}>Password</label>
                                        {!isRegister && (
                                            <button 
                                                type="button"
                                                onClick={() => setIsForgotPassword(true)}
                                                className="text-[8px] tracking-[0.2em] font-bold text-white/20 hover:text-gold-500 transition-all uppercase mb-1"
                                            >
                                                Forgot Password?
                                            </button>
                                        )}
                                    </div>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className={inputClasses}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 bottom-5 text-white/30 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {isRegister && (
                                    <div className="relative mt-4">
                                        <label className={labelClasses}>Location of residence</label>
                                        <select 
                                            className={inputClasses}
                                            value={formData.location}
                                            onChange={(e) => {
                                                const selectedName = e.target.value;
                                                const country = countryList.find(c => c.name === selectedName);
                                                
                                                // Update form state
                                                setFormData({
                                                    ...formData, 
                                                    location: selectedName,
                                                    countryCode: country ? `${country.code} (${country.iso})` : formData.countryCode
                                                });

                                                // Auto-apply language and currency based on location
                                                applyLocationSettings(selectedName, i18n, dispatch, setCurrency);
                                            }}
                                        >
                                            {/* Deduplicate countries for location list */}
                                            {[...new Set(countryList.map(c => c.name))].sort().map(name => (
                                                <option key={name} className="bg-[#0a0a0a]" value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-0 bottom-5 text-white/30 pointer-events-none" />
                                    </div>
                                )}

                                {/* Action Button */}
                                <div className="pt-12">
                                    <button 
                                        disabled={isLoading}
                                        className="w-full h-16 bg-white text-black text-[11px] font-black tracking-[0.5em] uppercase hover:bg-gold-500 transition-all duration-700 shadow-2xl relative overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            {isLoading ? 'Processing' : (isRegister ? 'Complete Registry' : 'Access Profile')}
                                            {!isLoading && <ArrowRight size={18} className="ml-4 transform group-hover:translate-x-2 transition-transform" />}
                                        </span>
                                    </button>
                                </div>

                                <div className="text-center mt-10">
                                    <button 
                                        type="button"
                                        onClick={() => setIsRegister(!isRegister)}
                                        className="text-[10px] tracking-[0.3em] font-bold text-white/30 hover:text-gold-500 transition-all uppercase"
                                    >
                                        {isRegister ? 'I already have a profile' : 'Create account'}
                                    </button>
                                </div>
                            </form>

                                {/* Social Login Separator */}
                                <div className="relative flex items-center justify-center my-12">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/5"></div>
                                    </div>
                                    <span className="relative z-10 px-4 bg-[#0a0a0a] text-[8px] tracking-[0.5em] text-white/20 uppercase font-bold">Or Continue With</span>
                                </div>

                                {/* Social Buttons */}
                                <div className="flex flex-col gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => handleGoogleLogin()}
                                        className="h-14 border border-white/10 flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all duration-500 group w-full"
                                    >
                                        <svg className="w-4 h-4 group-hover:filter group-hover:brightness-0" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span className="text-[9px] tracking-[0.2em] uppercase font-bold">Continue with Google</span>
                                    </button>
                                </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Reactivation Modal */}
                <AnimatePresence>
                    {showReactivateModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowReactivateModal(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-[#0a0a0a] border border-gold-500/20 p-8 md:p-12 max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.1)] text-center"
                            >
                                <Sparkles size={40} className="text-gold-500 mx-auto mb-6" />
                                <h2 className="kiks-title !text-2xl mb-4">Reactivate Account</h2>
                                <p className="kiks-caption !text-white/40 mb-8 leading-relaxed">
                                    Your account was deleted recently. Would you like to reactivate it?
                                </p>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleRequestReactivation}
                                        className="w-full h-14 bg-white text-black text-[10px] font-black tracking-[0.3em] uppercase hover:bg-gold-500 transition-all duration-500"
                                    >
                                        {isLoading ? 'Processing...' : 'Reactivate Now'}
                                    </button>
                                    <button
                                        onClick={() => setShowReactivateModal(false)}
                                        className="w-full h-14 border border-white/10 text-white/40 text-[10px] font-black tracking-[0.3em] uppercase hover:border-white/30 hover:text-white transition-all duration-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* OTP Verification Modal */}
                <AnimatePresence>
                    {showOtpModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-[#0a0a0a] border border-gold-500/20 p-8 md:p-12 max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.1)] text-center"
                            >
                                <Lock size={40} className="text-gold-500 mx-auto mb-6" />
                                <h2 className="kiks-title !text-2xl mb-2">Verify Reactivation</h2>
                                <p className="kiks-caption !text-white/40 mb-8 leading-relaxed text-sm">
                                    We sent a code to your email.<br />
                                    <span className="text-gold-500/60 font-bold">{reactivateEmail}</span>
                                </p>

                                <div className="flex justify-between gap-2 mb-8">
                                    {otpCode.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            className="w-full h-14 bg-white/5 border border-white/10 text-center text-xl font-bold focus:border-gold-500 focus:outline-none transition-all text-white"
                                            maxLength={1}
                                        />
                                    ))}
                                </div>

                                {otpError && (
                                    <p className="text-red-500 text-[10px] tracking-widest uppercase mb-6">{otpError}</p>
                                )}

                                <div className="mb-8">
                                    <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
                                        Code expires in: <span className={otpTimer < 60 ? 'text-red-400' : 'text-gold-500'}>{formatTime(otpTimer)}</span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isReactivating}
                                        className="w-full h-14 bg-white text-black text-[10px] font-black tracking-[0.3em] uppercase hover:bg-gold-500 transition-all duration-500 flex items-center justify-center gap-2"
                                    >
                                        {isReactivating ? <Loader2 className="animate-spin" size={16} /> : null}
                                        {isReactivating ? 'Verifying...' : 'Verify & Reactivate'}
                                    </button>
                                    <button
                                        disabled={otpTimer > 120} // Allow resend after 1 min (180 - 60 = 120)
                                        onClick={handleRequestReactivation}
                                        className="text-[10px] tracking-[0.2em] font-bold text-gold-500/60 hover:text-gold-500 transition-all uppercase"
                                    >
                                        {otpTimer > 120 ? `Resend in ${otpTimer - 120}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


export default Auth;
