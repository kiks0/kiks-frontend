/* eslint-disable */
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

import PageLoader from '../components/PageLoader';

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
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Redirect Guard: Absolute wall for verification screens to prevent homepage bypass
    useEffect(() => {
        // We skip redirect for ALL special statuses including 'error' so we can see what's wrong
        const skipRedirectStatuses = ['success', 'error', 'verification_required', 'verification_success', 'verification_already'];
        
        if (isAuthenticated && !skipRedirectStatuses.includes(status)) {
            // Only redirect if we are authenticated AND we aren't in a special state
            const params = new URLSearchParams(location.search);
            if (!params.get('verified') && status === 'idle') {
                localStorage.removeItem('kiks_token');
                localStorage.removeItem('kiks_user');
                window.location.href = '/';
            }
        }
    }, [isAuthenticated, status, location.search]);

    // Robust Success Navigation with Absolute Redirect
    useEffect(() => {
        if (status === 'success') {
            setIsLoading(true); // Activate cinematic Logo Loader
            const timer = setTimeout(() => {
                // Direct browser redirect - the most forceful way to move
                window.location.href = '/';
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status]);

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

        // Check for reset token or verification status in URL
        const params = new URLSearchParams(location.search);
        const tokenFromUrl = params.get('token');
        const userFromUrl = params.get('user');
        const verified = params.get('verified');

        if (tokenFromUrl && !verified) {
            setResetToken(tokenFromUrl);
            setIsResetPassword(true);
        }

        if (verified === 'true') {
            if (tokenFromUrl && userFromUrl) {
                // AUTOMATIC LOGIN AFTER VERIFICATION
                try {
                    const parsedUser = JSON.parse(decodeURIComponent(userFromUrl));
                    localStorage.setItem('kiks_token', tokenFromUrl);
                    localStorage.setItem('kiks_user', JSON.stringify(parsedUser));
                    dispatch(login({ token: tokenFromUrl, user: parsedUser }));
                    dispatch(fetchWishlist());
                    setStatus('success');
                    
                    // Cinematic sweep to homepage
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } catch (err) {
                    console.error("Auto-login parsing failed:", err);
                    setStatus('verification_success');
                }
            } else {
                setStatus('verification_success');
            }
        } else if (verified === 'already') {
            setStatus('verification_already');
        } else if (path.includes('/register') || path.includes('/login')) {
            // TOTAL SESSION EXORCISM: Clear every ghost key to prevent bypass
            const ghostKeys = ['kiks_token', 'kiks_user', 'currentUser', 'token', 'user'];
            ghostKeys.forEach(key => localStorage.removeItem(key));
            
            if (isAuthenticated && !status.includes('verification')) {
                window.location.reload(); // Hard reset for clean registry
            }
        }
    }, [isRegisterInitial, location.pathname, location.search]);

    // Comprehensive Country data (Synchronized with PersonalDetails)
    const countryList = [
        { name: 'India', code: '+91', iso: 'IN', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'UAE', code: '+971', iso: 'AE', length: 9, pattern: /^[0-9]{9}$/ },
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
        { name: 'Korea', code: '+82', iso: 'KR', length: 10, pattern: /^[0-9]{10}$/ },
        { name: 'Mainland China', code: '+86', iso: 'CN', length: 11, pattern: /^[0-9]{11}$/ },
        { name: 'Hong Kong S.A.R.', code: '+852', iso: 'HK', length: 8, pattern: /^[0-9]{8}$/ },
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
        { name: 'Türkiye', code: '+90', iso: 'TR', length: 10, pattern: /^[0-9]{10}$/ },
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

    const validateForm = () => {
        const errors = {};
        const requiredFields = ['email', 'password'];
        
        if (isRegister) {
            requiredFields.push('firstName', 'lastName');
        }

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                errors[field] = 'Required';
            }
        });

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email';
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            // Auto-scroll to first error
            const firstErrorField = requiredFields.find(f => errors[f]);
            if (firstErrorField) {
                const element = document.getElementsByName(firstErrorField)[0];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setFieldErrors({});

        if (!validateForm()) {
            setErrorMessage('Please complete all required fields.');
            setIsLoading(false);
            return;
        }

        try {
            // Phone validation if register
            if (isRegister && formData.telephone) {
                if (!validatePhone(formData.countryCode, formData.telephone)) {
                    const pureCode = formData.countryCode.split(' ')[0];
                    const country = countryList.find(c => c.code === pureCode);
                    setErrorMessage(`Please enter a valid ${country?.name || 'phone'} number.`);
                    setFieldErrors({ telephone: 'Invalid number' });
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

            // 3. Handle Verification Requirement - THE ABSOLUTE WALL
            if (data.requiresVerification) {
                console.log("[AUTH] Verification required. Locking the gate.");
                setStatus('verification_required');
                setIsLoading(false);
                return; // TERMINATE HERE - Do not proceed to login or success
            }

            // 4. Update local app state ONLY if verification is NOT required (Standard Login)
            if (data.token) {
                localStorage.setItem('kiks_token', data.token);
                localStorage.setItem('kiks_user', JSON.stringify(data.user));
                dispatch(login({ user: data.user, token: data.token }));
                dispatch(fetchWishlist());
                setStatus('success');
                // The useEffect will handle the redirect to homepage
            } else {
                setErrorMessage('Authentication incomplete. Please check your credentials.');
                setStatus('error');
            }

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
                setTimeout(() => { window.location.href = '/'; }, 1000);
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
                    setTimeout(() => { window.location.href = '/'; }, 1000);
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

    const inputClasses = "w-full bg-transparent border-b border-black/10 py-4 text-[15px] text-black focus:outline-none focus:border-black transition-all font-light tracking-widest placeholder:text-black/20 appearance-none";
    const labelClasses = "text-[11px] tracking-[0.2em] font-bold text-black/50 uppercase block mb-1 mt-4";

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="bg-white min-h-screen text-black pt-24 md:pt-40 pb-12 md:pb-20 font-sans selection:bg-black/10 selection:text-black relative z-0">

            {/* Ambient Background */}
            <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] bg-black/5 blur-[150px] rounded-full pointer-events-none" />
            {/* Full Screen Branded Loader Gateway */}
            <AnimatePresence>
                {isLoading && (
                    <PageLoader fullScreen />
                )}
            </AnimatePresence>

            <div className="container mx-auto px-6 max-w-xl relative z-10">
                {!isLoading && (
                    <AnimatePresence mode="wait">
                        {status === 'verification_required' ? (
                            <motion.div
                                key="verification_required"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                            >
                                <div className="w-24 h-24 bg-black/5 text-black rounded-full flex items-center justify-center mb-8 mx-auto relative">
                                    <Mail size={40} strokeWidth={1} />
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="absolute -right-1 -bottom-1 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center border-4 border-white"
                                    >
                                        <Sparkles size={14} />
                                    </motion.div>
                                </div>

                                <h2 className="text-3xl md:text-5xl font-serif tracking-widest uppercase mb-6 text-black">
                                    Verify Your Identity
                                </h2>

                                <p className="text-neutral-500 text-[11px] md:text-xs tracking-[0.4em] uppercase mb-16 leading-relaxed max-w-md mx-auto font-medium">
                                    TO ENSURE THE ABSOLUTE SECURITY OF YOUR ELITE PATRON ACCOUNT, A VERIFICATION LINK HAS BEEN DISPATCHED TO YOUR REGISTERED EMAIL.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-center space-x-3 text-black/40">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-[10px] tracking-[0.3em] uppercase">Awaiting Activation...</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setStatus('idle');
                                            setIsRegister(false);
                                            navigate('/login');
                                        }}
                                        className="text-[10px] tracking-[0.5em] text-black hover:text-black/60 uppercase font-black transition-all border-b-2 border-black pb-2"
                                    >
                                        RETURN TO LOGIN
                                    </button>
                                </div>
                            </motion.div>
                        ) : status === 'verification_success' ? (
                            <motion.div
                                key="verification_success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                            >
                                <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl">
                                    <CheckCircle2 size={40} strokeWidth={1} />
                                </div>

                                <h2 className="text-3xl font-serif tracking-widest uppercase mb-4 text-black">
                                    Identity Verified
                                </h2>

                                <p className="text-neutral-500 text-[10px] tracking-[0.4em] uppercase mb-12">
                                    Your Maison KIKS portal is now fully active.
                                </p>

                                <button
                                    onClick={() => {
                                        setStatus('idle');
                                        setIsRegister(false);
                                        navigate('/login');
                                    }}
                                    className="w-full h-16 bg-black text-white text-[11px] font-black tracking-[0.5em] uppercase hover:bg-black/90 transition-all duration-700"
                                >
                                    Log In to Boutique
                                </button>
                            </motion.div>
                        ) : status === 'verification_already' ? (
                            <motion.div
                                key="verification_already"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                            >
                                <div className="w-24 h-24 bg-black/5 text-black rounded-full flex items-center justify-center mb-8 mx-auto">
                                    <Sparkles size={40} strokeWidth={1} />
                                </div>

                                <h2 className="text-3xl font-serif tracking-widest uppercase mb-4 text-black">
                                    Already Verified
                                </h2>

                                <p className="text-neutral-500 text-[10px] tracking-[0.4em] uppercase mb-12">
                                    Your account is already active and ready for your visit.
                                </p>

                                <button
                                    onClick={() => {
                                        setStatus('idle');
                                        setIsRegister(false);
                                        navigate('/login');
                                    }}
                                    className="w-full h-16 bg-black text-white text-[11px] font-black tracking-[0.5em] uppercase hover:bg-black/90 transition-all duration-700"
                                >
                                    Proceed to Login
                                </button>
                            </motion.div>
                        ) : status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                            >
                                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-8 mx-auto">
                                    <CheckCircle2 size={48} />
                                </div>

                                <h2 className="text-3xl font-serif tracking-widest uppercase mb-4 text-black">
                                    {(isRegister || new URLSearchParams(location.search).get('verified') === 'true') ? 'Welcome to KIKS Ultra Luxury' : 'Welcome back'}
                                </h2>

                                <p className="text-neutral-500 text-[10px] tracking-[0.4em] uppercase mb-8 leading-relaxed">
                                    {(isRegister || new URLSearchParams(location.search).get('verified') === 'true') ? 'Your elite patron account is now active. Preparing your curated journey...' : 'Accessing KIKS Ultra Luxury'}
                                </p>

                                <button
                                    onClick={() => navigate('/', { replace: true })}
                                    className="text-[9px] tracking-[0.4em] text-black/40 hover:text-black uppercase font-bold transition-all border-b border-black/5 pb-1"
                                >
                                    Enter Boutique
                                </button>
                            </motion.div>
                        ) : status === 'reset_sent' ? (
                            <motion.div key="reset_sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                <h2 className="text-3xl font-serif tracking-widest uppercase mb-4 text-black">Instructions Sent</h2>
                                <p className="text-neutral-500 text-[10px] tracking-[0.4em] uppercase mb-8">If the email exists, we have sent reset instructions.</p>
                                <button onClick={() => { setStatus('idle'); setIsForgotPassword(false); }} className="text-black text-[10px] tracking-widest uppercase border-b border-black/30 pb-1">Return to Login</button>
                            </motion.div>
                        ) : status === 'reset_success' ? (
                            <motion.div key="reset_success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                <h2 className="text-3xl font-serif tracking-widest uppercase mb-4 text-black">Restoration Complete</h2>
                                <p className="text-neutral-500 text-[10px] tracking-[0.4em] uppercase">Your identity has been restored. Redirecting to login...</p>
                            </motion.div>
                        ) : isResetPassword ? (
                            <motion.div key="reset_password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className="text-center mb-16">
                                    <h1 className="text-4xl font-serif tracking-[0.1em] uppercase font-light text-black">Restore Identity</h1>
                                    <p className="text-[10px] tracking-[0.5em] text-black/40 uppercase mt-4">Secure your portal with a new password</p>

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
                                            className="absolute right-0 bottom-5 text-black/30 hover:text-black transition-colors"
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
                                            className="absolute right-0 bottom-5 text-black/30 hover:text-black transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <button className="w-full h-16 bg-black text-white text-[11px] font-black tracking-[0.5em] uppercase hover:bg-black/90 transition-all duration-700 mt-12">
                                        Update Password
                                    </button>
                                </form>
                            </motion.div>
                        ) : isForgotPassword ? (
                            <motion.div key="forgot_password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className="text-center mb-16">
                                    <h1 className="text-4xl font-serif tracking-[0.1em] uppercase font-light text-black">Identity Restoration</h1>
                                    <p className="text-[10px] tracking-[0.5em] text-black/40 uppercase mt-4">Enter your email to receive recovery link</p>

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
                                    <button className="w-full h-16 bg-black text-white text-[11px] font-black tracking-[0.5em] uppercase hover:bg-black/90 transition-all duration-700 mt-12">
                                        Send Recovery Link
                                    </button>
                                    <div className="text-center mt-10">
                                        <button type="button" onClick={() => setIsForgotPassword(false)} className="text-[10px] tracking-[0.3em] font-bold text-black/30 hover:text-black transition-all uppercase">Back to Login</button>
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
                                    <h1 className="text-3xl md:text-4xl font-serif tracking-[0.1em] uppercase font-light text-black">
                                        {isRegister ? 'User Registry' : 'User Login'}
                                    </h1>
                                    <p className="text-[10px] tracking-[0.5em] text-black/40 uppercase mt-2">
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
                                    <div className="relative">
                                        <label className={`${labelClasses} ${fieldErrors.email ? 'text-red-500' : ''}`}>Email Address <span className={formData.email ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormData({ ...formData, email: e.target.value });
                                                if (fieldErrors.email) setFieldErrors(prev => { const n = {...prev}; delete n.email; return n; });
                                            }}
                                            className={`${inputClasses} ${fieldErrors.email ? 'border-red-500' : ''}`}
                                        />
                                        {fieldErrors.email && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.email}</p>}
                                    </div>

                                    {isRegister && (
                                        <>
                                            {/* Title Selection */}
                                            <div className="relative group">
                                                <label className={labelClasses}>Title</label>
                                                <select
                                                    className={inputClasses}
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                >
                                                    <option className="bg-white text-black" value="Title">Title</option>
                                                    <option className="bg-white text-black" value="Mr">Mr</option>
                                                    <option className="bg-white text-black" value="Mrs">Mrs</option>
                                                    <option className="bg-white text-black" value="Miss">Miss</option>
                                                    <option className="bg-white text-black" value="Mx">Mx</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-0 bottom-5 text-black/30 pointer-events-none" />
                                            </div>

                                            {/* Names Section */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-2">
                                                <div>
                                                    <label className={`${labelClasses} ${fieldErrors.firstName ? 'text-red-500' : ''}`}>First name <span className={formData.firstName ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                    <input
                                                        name="firstName"
                                                        type="text"
                                                        value={formData.firstName}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, firstName: e.target.value });
                                                            if (fieldErrors.firstName) setFieldErrors(prev => { const n = {...prev}; delete n.firstName; return n; });
                                                        }}
                                                        className={`${inputClasses} ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                                                    />
                                                    {fieldErrors.firstName && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.firstName}</p>}
                                                </div>
                                                <div>
                                                    <label className={`${labelClasses} ${fieldErrors.lastName ? 'text-red-500' : ''}`}>Last name <span className={formData.lastName ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                                    <input
                                                        name="lastName"
                                                        type="text"
                                                        value={formData.lastName}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, lastName: e.target.value });
                                                            if (fieldErrors.lastName) setFieldErrors(prev => { const n = {...prev}; delete n.lastName; return n; });
                                                        }}
                                                        className={`${inputClasses} ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                                                    />
                                                    {fieldErrors.lastName && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.lastName}</p>}
                                                </div>
                                            </div>
                                            {/* Unified Phone Section */}
                                            <div className="mt-4">
                                                <label className={labelClasses}>Telephone (optional)</label>
                                                <div className="flex items-end border-b border-black/10 focus-within:border-black transition-all">
                                                    <div className="relative min-w-[100px]">
                                                        <select
                                                            className="w-full bg-transparent py-4 text-[15px] text-black focus:outline-none appearance-none cursor-pointer font-light tracking-widest"
                                                            value={formData.countryCode}
                                                            onChange={(e) => {
                                                                const selectedValue = e.target.value;
                                                                const pureCode = selectedValue.split(' ')[0];
                                                                const country = countryList.find(c => c.code === pureCode);
                                                                setFormData({
                                                                    ...formData,
                                                                    countryCode: selectedValue,
                                                                    location: country ? country.name : formData.location
                                                                });
                                                                if (country) {
                                                                    applyLocationSettings(country.name, i18n, dispatch, setCurrency);
                                                                }
                                                            }}
                                                        >
                                                            {countryList.map(c => (
                                                                <option key={`${c.iso}-${c.code}`} className="bg-white text-black" value={`${c.code} (${c.iso})`}>
                                                                    {c.code} ({c.iso})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-2 bottom-5 text-black/30 pointer-events-none" />
                                                    </div>
                                                    <div className="w-px h-6 bg-black/10 mx-4 mb-4" />
                                                    <input
                                                        type="tel"
                                                        value={formData.telephone}
                                                        maxLength={countryList.find(c => `${c.code} (${c.iso})` === formData.countryCode)?.length || 15}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                                            setFormData({ ...formData, telephone: value });
                                                        }}
                                                        placeholder={`Enter ${countryList.find(c => `${c.code} (${c.iso})` === formData.countryCode)?.length || ''} digits`}
                                                        className="w-full bg-transparent py-4 text-[15px] text-black focus:outline-none font-light tracking-widest placeholder:text-black/10"
                                                    />
                                                </div>
                                            </div>

                                            {/* Date of Birth Section */}
                                            <div>
                                                <div className="flex items-center space-x-2 mt-8 mb-1">
                                                    <label className="text-[9px] tracking-[0.3em] font-bold text-black/30 uppercase">Date of birth (optional)</label>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                                                    <div className="relative">
                                                        <select className={inputClasses} value={formData.dobDay} onChange={(e) => setFormData({ ...formData, dobDay: e.target.value })}>
                                                            <option className="bg-white text-black">Day</option>
                                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} className="bg-white text-black" value={d}>{d}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-0 bottom-5 text-black/30 pointer-events-none" />
                                                    </div>
                                                    <div className="relative">
                                                        <select className={inputClasses} value={formData.dobMonth} onChange={(e) => setFormData({ ...formData, dobMonth: e.target.value })}>
                                                            <option className="bg-white text-black">Month</option>
                                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} className="bg-white text-black" value={m}>{m}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-0 bottom-5 text-black/30 pointer-events-none" />
                                                    </div>
                                                    <div className="relative">
                                                        <select className={inputClasses} value={formData.dobYear} onChange={(e) => setFormData({ ...formData, dobYear: e.target.value })}>
                                                            <option className="bg-white text-black">Year</option>
                                                            {Array.from({ length: 80 }, (_, i) => 2024 - i).map(y => <option key={y} className="bg-white text-black" value={y}>{y}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-0 bottom-5 text-black/30 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Password Field */}
                                    <div className="relative">
                                        <div className="flex justify-between items-end">
                                            <label className={`${labelClasses} ${fieldErrors.password ? 'text-red-500' : ''}`}>Password <span className={formData.password ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                            {!isRegister && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsForgotPassword(true)}
                                                    className="text-[8px] tracking-[0.2em] font-bold text-black/40 hover:text-black transition-all uppercase mb-1"
                                                >
                                                    Forgot Password?
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => {
                                                setFormData({ ...formData, password: e.target.value });
                                                if (fieldErrors.password) setFieldErrors(prev => { const n = {...prev}; delete n.password; return n; });
                                            }}
                                            className={`${inputClasses} ${fieldErrors.password ? 'border-red-500' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 bottom-5 text-black/30 hover:text-black transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        {fieldErrors.password && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.password}</p>}
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

                                                    setFormData({
                                                        ...formData,
                                                        location: selectedName,
                                                        countryCode: country ? `${country.code} (${country.iso})` : formData.countryCode
                                                    });

                                                    if (selectedName) {
                                                        applyLocationSettings(selectedName, i18n, dispatch, setCurrency);
                                                    }
                                                }}
                                            >
                                                {/* Deduplicate countries for location list */}
                                                {[...new Set(countryList.map(c => c.name))].sort().map(name => (
                                                    <option key={name} className="bg-white text-black" value={name}>{name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-0 bottom-5 text-black/30 pointer-events-none" />
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <div className="pt-12">
                                        <button
                                            className="w-full h-16 bg-black text-white text-[13px] font-black tracking-[0.4em] uppercase hover:bg-black/90 transition-all duration-700 shadow-xl relative overflow-hidden group"
                                        >
                                            <span className="relative z-10 flex items-center justify-center">
                                                {isRegister ? 'Complete Registry' : 'Access Profile'}
                                                <ArrowRight size={18} className="ml-4 transform group-hover:translate-x-2 transition-transform" />
                                            </span>
                                        </button>
                                    </div>

                                    <div className="text-center mt-10">
                                        <button
                                            type="button"
                                            onClick={() => setIsRegister(!isRegister)}
                                            className="text-[11px] tracking-[0.3em] font-bold text-black/40 hover:text-black transition-all uppercase"
                                        >
                                            {isRegister ? 'I already have a profile' : 'Create account'}
                                        </button>
                                    </div>
                                </form>

                                {/* Social Login Separator */}
                                <div className="relative flex items-center justify-center my-12">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-black/5"></div>
                                    </div>
                                    <span className="relative z-10 px-4 bg-white text-[8px] tracking-[0.5em] text-black/20 uppercase font-bold">Or Continue With</span>
                                </div>

                                {/* Social Buttons */}
                                <div className="flex flex-col gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleGoogleLogin()}
                                        className="h-14 border border-black/10 flex items-center justify-center gap-3 hover:bg-black/5 transition-all duration-500 group w-full text-black"
                                    >
                                        <svg className="w-4 h-4 group-hover:filter group-hover:brightness-0" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span className="text-[11px] tracking-[0.2em] uppercase font-bold">Continue with Google</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}


                {/* Reactivation Modal */}
                <AnimatePresence>
                    {showReactivateModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowReactivateModal(false)}
                                className="absolute inset-0 bg-white/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white border border-black/5 p-8 md:p-12 max-w-md w-full shadow-2xl text-center"
                            >
                                <Sparkles size={40} className="text-black mx-auto mb-6" />
                                <h2 className="kiks-title !text-2xl mb-4 text-black">Reactivate Account</h2>
                                <p className="kiks-caption !text-black/40 mb-8 leading-relaxed">
                                    Your account was deleted recently. Would you like to reactivate it?
                                </p>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleRequestReactivation}
                                        className="w-full h-14 bg-black text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-black/90 transition-all duration-500"
                                    >
                                        {isLoading ? 'Processing...' : 'Reactivate Now'}
                                    </button>
                                    <button
                                        onClick={() => setShowReactivateModal(false)}
                                        className="w-full h-14 border border-black/10 text-black/40 text-[10px] font-black tracking-[0.3em] uppercase hover:text-black transition-all duration-500"
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
                                className="absolute inset-0 bg-white/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white border border-black/5 p-8 md:p-12 max-w-md w-full shadow-2xl text-center"
                            >
                                <Lock size={40} className="text-black mx-auto mb-6" />
                                <h2 className="kiks-title !text-2xl mb-2 text-black">Verify Reactivation</h2>
                                <p className="kiks-caption !text-black/40 mb-8 leading-relaxed text-sm">
                                    We sent a code to your email.<br />
                                    <span className="text-black font-bold">{reactivateEmail}</span>
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
                                            className="w-full h-14 bg-black/5 border border-black/10 text-center text-xl font-bold focus:border-black focus:outline-none transition-all text-black"
                                            maxLength={1}
                                        />
                                    ))}
                                </div>

                                {otpError && (
                                    <p className="text-red-600 font-bold text-[10px] tracking-widest uppercase mb-6">{otpError}</p>
                                )}

                                <div className="mb-8">
                                    <p className="text-[10px] tracking-[0.2em] text-black/30 uppercase">
                                        Code expires in: <span className={otpTimer < 60 ? 'text-red-600' : 'text-black font-bold'}>{formatTime(otpTimer)}</span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isReactivating}
                                        className="w-full h-14 bg-black text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-black/90 transition-all duration-500 flex items-center justify-center gap-2"
                                    >
                                        {isReactivating ? <Loader2 className="animate-spin" size={16} /> : null}
                                        {isReactivating ? 'Verifying...' : 'Verify & Reactivate'}
                                    </button>
                                    <button
                                        disabled={otpTimer > 120} // Allow resend after 1 min (180 - 60 = 120)
                                        onClick={handleRequestReactivation}
                                        className="text-[10px] tracking-[0.2em] font-bold text-black/40 hover:text-black transition-all uppercase"
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
