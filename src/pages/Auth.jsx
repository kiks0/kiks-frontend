import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, LogIn, UserPlus, Phone, Calendar, Globe, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { fetchWishlist, clearWishlist } from '../store/wishlistSlice';
import { useGoogleLogin } from '@react-oauth/google';

const Auth = ({ isRegisterInitial = false }) => {
    const [isRegister, setIsRegister] = useState(isRegisterInitial);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Sync state when navigating between /login and /register
    useEffect(() => {
        setIsRegister(isRegisterInitial);
    }, [isRegisterInitial]);
    
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [errorMessage, setErrorMessage] = useState('');

    // Form data with the extended fields from the luxury reference
    const [formData, setFormData] = useState({
        email: '',
        title: 'Title',
        firstName: '',
        lastName: '',
        countryCode: '+91 (IN)',
        telephone: '',
        dobDay: 'Day',
        dobMonth: 'Month',
        dobYear: 'Year',
        password: '',
        location: 'India'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            // 1. Submit to the registration/login API
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

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
                            from_name: 'KIKS PATRON REGISTRY',
                            subject: `NEW PATRON: ${formData.firstName} ${formData.lastName}`,
                            message: `
新 Registered Patron Details:
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
            setTimeout(() => navigate('/account'), 2000);
            
        } catch (error) {
            console.error('Auth error:', error);
            setErrorMessage('Connection error. Please ensure the server is running.');
            setStatus('error');
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
                    setTimeout(() => navigate('/account'), 2000);
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
    const labelClasses = "text-[9px] tracking-[0.3em] font-bold text-white/30 uppercase block mb-1 mt-6";

    return (
        <div className="bg-dark-900 min-h-screen text-white pt-56 pb-20 font-sans selection:bg-gold-500/30 selection:text-white relative overflow-hidden">
            
            {/* Ambient Background */}
            <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] bg-gold-500/5 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="container mx-auto px-6 max-w-xl relative z-10">
                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-8 mx-auto">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-serif tracking-widest uppercase mb-4">
                                {isRegister ? 'Registry Complete' : 'Identity Authenticated'}
                            </h2>
                            <p className="text-gray-400 text-[10px] tracking-[0.4em] uppercase">
                                {isRegister ? 'Welcome to the world of KIKS' : 'Accessing KIKS Ultra Luxury'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={isRegister ? 'register' : 'login'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="text-center mb-16">
                                <h1 className="text-4xl font-serif tracking-[0.1em] uppercase font-light">
                                    {isRegister ? 'Patron Registry' : 'Patron Login'}
                                </h1>
                                <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase mt-4">
                                    {isRegister ? 'Join the legacy of elite perfumery' : 'Access your curated selections'}
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
                                        <div className="grid grid-cols-2 gap-8 mt-2">
                                            <div>
                                                <label className={labelClasses}>First name</label>
                                                <input 
                                                    type="text" 
                                                    required={isRegister}
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({...formData, firstName: e.target.value.toUpperCase()})}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Last name</label>
                                                <input 
                                                    type="text" 
                                                    required={isRegister}
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({...formData, lastName: e.target.value.toUpperCase()})}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Section */}
                                        <div className="grid grid-cols-[140px_1fr] gap-8 mt-2">
                                            <div className="relative">
                                                <label className={labelClasses}>Country code</label>
                                                <select 
                                                    className={inputClasses}
                                                    value={formData.countryCode}
                                                    onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                                                >
                                                    <option className="bg-[#0a0a0a]" value="+91 (IN)">+91 (IN)</option>
                                                    <option className="bg-[#0a0a0a]" value="+44 (UK)">+44 (UK)</option>
                                                    <option className="bg-[#0a0a0a]" value="+1 (US)">+1 (US)</option>
                                                    <option className="bg-[#0a0a0a]" value="+971 (UE)">+971 (UE)</option>
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
                                            <div className="grid grid-cols-3 gap-6">
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
                                    <label className={labelClasses}>Password</label>
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
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        >
                                            <option className="bg-[#0a0a0a]" value="India">India</option>
                                            <option className="bg-[#0a0a0a]" value="Dubai">Dubai</option>
                                            <option className="bg-[#0a0a0a]" value="United Kingdom">United Kingdom</option>
                                            <option className="bg-[#0a0a0a]" value="United States">United States</option>
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
                                        {isRegister ? 'I already have a profile' : 'Create an elite profile'}
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
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => handleGoogleLogin()}
                                        className="h-14 border border-white/10 flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all duration-500 group"
                                    >
                                        <svg className="w-4 h-4 group-hover:filter group-hover:brightness-0" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span className="text-[9px] tracking-[0.2em] uppercase font-bold">Google</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const comingSoon = document.createElement('div');
                                            comingSoon.className = 'fixed bottom-12 left-1/2 transform -translate-x-1/2 z-[500] bg-white text-black p-8 shadow-2xl border border-black/10 flex items-center space-x-6 animate-fade-in';
                                            comingSoon.innerHTML = `
                                                <div class="w-10 h-10 rounded-full border border-black flex items-center justify-center">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20m10-10H2"/></svg>
                                                </div>
                                                <div>
                                                    <p class="text-[11px] font-bold uppercase tracking-[0.2em]">Apple ID Integration</p>
                                                    <p class="text-[10px] text-black/60 uppercase tracking-widest mt-1">Returning to the vault soon</p>
                                                </div>
                                            `;
                                            document.body.appendChild(comingSoon);
                                            setTimeout(() => {
                                                comingSoon.classList.add('animate-fade-out');
                                                setTimeout(() => comingSoon.remove(), 500);
                                            }, 3000);
                                        }}
                                        className="h-14 border border-white/10 flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all duration-500 group"
                                    >
                                        <svg className="w-4 h-4 group-hover:filter group-hover:brightness-0" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M17.05 20.28c-.96.95-2.18 1.78-3.46 1.78-1.28 0-1.68-.78-3.23-.78-1.55 0-2 .76-3.21.78-1.21.02-2.39-.75-3.41-1.78-2.12-2.14-3.58-6.13-1.39-9.94 1.08-1.88 3.01-3.07 5.12-3.07 1.28 0 2.21.43 3.02.43.81 0 1.93-.53 3.41-.53 1.54 0 3.37.86 4.41 2.31-2.92 1.63-2.45 6.06.49 7.42-.51 1.29-1.29 2.37-1.75 3.32zM12.03 5.3c-.02-2.13 1.76-3.95 3.86-4.3 0 0 .31 2.51-1.63 4.79-1.61 1.88-2.21 1.64-2.23-.49z"/>
                                        </svg>
                                        <span className="text-[9px] tracking-[0.2em] uppercase font-bold">Apple</span>
                                    </button>
                                </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Auth;
