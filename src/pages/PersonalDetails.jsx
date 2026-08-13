import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, X, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/authSlice';
import AnimatedDropdown from '../components/AnimatedDropdown';

const monthMap = {
    '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun',
    '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
    'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr', 'May': 'May', 'June': 'Jun',
    'July': 'Jul', 'August': 'Aug', 'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec'
};
const normalizeMonth = (m) => m ? (monthMap[m] || m) : '';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const COUNTRIES = [
    { name: 'India', code: '+91 (IN)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'UAE', code: '+971 (AE)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Saudi Arabia', code: '+966 (SA)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Qatar', code: '+974 (QA)', length: 8, pattern: /^[0-9]{8}$/ },
    { name: 'Kuwait', code: '+965 (KW)', length: 8, pattern: /^[0-9]{8}$/ },
    { name: 'Oman', code: '+968 (OM)', length: 8, pattern: /^[0-9]{8}$/ },
    { name: 'Bahrain', code: '+973 (BH)', length: 8, pattern: /^[0-9]{8}$/ },
    { name: 'United Kingdom', code: '+44 (GB)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'United States', code: '+1 (US)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'France', code: '+33 (FR)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Germany', code: '+49 (DE)', length: 11, pattern: /^[0-9]{11}$/ },
    { name: 'Italy', code: '+39 (IT)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'Spain', code: '+34 (ES)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Switzerland', code: '+41 (CH)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Singapore', code: '+65 (SG)', length: 8, pattern: /^[0-9]{8}$/ },
    { name: 'Canada', code: '+1 (CA)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'Australia', code: '+61 (AU)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Japan', code: '+81 (JP)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'Korea', code: '+82 (KR)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'Mainland China', code: '+86 (CN)', length: 11, pattern: /^[0-9]{11}$/ },
    { name: 'Hong Kong S.A.R.', code: '+852 (HK)', length: 8, pattern: /^[0-9]{8}$/ },
    { name: 'Malaysia', code: '+60 (MY)', length: 9, pattern: /^[0-9]{9,10}$/ },
    { name: 'Thailand', code: '+66 (TH)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Vietnam', code: '+84 (VN)', length: 9, pattern: /^[0-9]{9,10}$/ },
    { name: 'Indonesia', code: '+62 (ID)', length: 10, pattern: /^[0-9]{10,12}$/ },
    { name: 'Netherlands', code: '+31 (NL)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Belgium', code: '+32 (BE)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Sweden', code: '+46 (SE)', length: 9, pattern: /^[0-9]{9,10}$/ },
    { name: 'Norway', code: '+47 (NO)', length: 8, pattern: /^[0-9]{8}$/ },
    { name: 'Denmark', code: '+45 (DK)', length: 8, pattern: /^[0-9]{8}$/ },
    { name: 'Portugal', code: '+351 (PT)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Austria', code: '+43 (AT)', length: 10, pattern: /^[0-9]{10,11}$/ },
    { name: 'Greece', code: '+30 (GR)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'Türkiye', code: '+90 (TR)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'Mexico', code: '+52 (MX)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'Brazil', code: '+55 (BR)', length: 11, pattern: /^[0-9]{11}$/ },
    { name: 'Argentina', code: '+54 (AR)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'South Africa', code: '+27 (ZA)', length: 9, pattern: /^[0-9]{9}$/ },
    { name: 'Russia', code: '+7 (RU)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'Israel', code: '+972 (IL)', length: 9, pattern: /^[0-9]{9}$/ },
];

const PersonalDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token } = useSelector(state => state.auth);
    
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: user?.title || '',
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        dobDay: user?.dob_day?.toString() || '',
        dobMonth: normalizeMonth(user?.dob_month?.toString() || ''),
        dobYear: user?.dob_year?.toString() || '',
        location: user?.location || localStorage.getItem('location_name') || 'India',
        telephone: user?.telephone || '',
        countryCode: user?.country_code || '+91 (IN)'
    });

    useEffect(() => {
        // If user doesn't have a country code but we have a location, set the default code
        if (!user?.country_code) {
            const loc = user?.location || localStorage.getItem('location_name') || 'India';
            const country = COUNTRIES.find(c => c.name === loc);
            if (country) {
                setFormData(prev => ({
                    ...prev,
                    location: loc,
                    countryCode: country.code
                }));
                setTempPhone(prev => ({
                    ...prev,
                    code: country.code
                }));
            }
        }
    }, [user]);

    const [tempPhone, setTempPhone] = useState({
        type: 'MOBILE',
        code: user?.country_code || '+91 (IN)',
        number: user?.telephone || ''
    });

    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        if (!token) {
            window.location.href = '/';
            return;
        }

        const fetchUserData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        title: data.title || '',
                        firstName: data.first_name || '',
                        lastName: data.last_name || '',
                        dobDay: data.dob_day?.toString() || '',
                        dobMonth: normalizeMonth(data.dob_month?.toString() || ''),
                        dobYear: data.dob_year?.toString() || '',
                        location: data.location || 'India',
                        telephone: data.telephone || '',
                        countryCode: data.country_code || '+91 (IN)'
                    });
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        fetchUserData();
    }, [token, navigate]);

    const validatePhone = (code, number) => {
        const country = COUNTRIES.find(c => c.code === code);
        if (!country) return true;
        if (!number) return false;
        return country.pattern.test(number);
    };

    const handlePhoneSave = async () => {
        if (!validatePhone(tempPhone.code, tempPhone.number)) {
            const country = COUNTRIES.find(c => c.code === tempPhone.code);
            setPhoneError(`Please enter a valid ${country.name} number (${country.length} digits).`);
            return;
        }

        setSaving(true);
        setPhoneError('');
        
        try {
            const res = await fetch(`${API_URL}/api/auth/check-phone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: tempPhone.number,
                    userId: user?.id 
                })
            });
            
            const data = await res.json();
            if (data.exists) {
                setPhoneError(data.message || 'This number is already registered to another patron.');
                setSaving(false);
                return;
            }

            const selectedCountry = COUNTRIES.find(c => c.code === tempPhone.code);
            
            setFormData({
                ...formData,
                countryCode: tempPhone.code,
                telephone: tempPhone.number,
                location: selectedCountry ? selectedCountry.name : formData.location
            });
            setIsPhoneModalOpen(false);
        } catch (err) {
            console.error("Phone check error:", err);
            // Fallback: allow saving if check fails, backend will catch it anyway
            const selectedCountry = COUNTRIES.find(c => c.code === tempPhone.code);
            setFormData({
                ...formData,
                countryCode: tempPhone.code,
                telephone: tempPhone.number,
                location: selectedCountry ? selectedCountry.name : formData.location
            });
            setIsPhoneModalOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        const requiredFields = ['title', 'firstName', 'lastName'];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                errors[field] = 'Required';
            }
        });

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
        setSaving(true);
        setMessage({ type: '', text: '' });
        setFieldErrors({});

        if (!validateForm()) {
            setMessage({ type: 'error', text: 'Please complete all required fields.' });
            setSaving(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (res.ok) {
                    setMessage({ type: 'success', text: 'Profile updated successfully.' });
                    dispatch(updateProfile(data.user));
                } else {
                    setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
                }
            } else {
                const text = await res.text();
                console.error('Non-JSON response:', text);
                setMessage({ type: 'error', text: 'The server returned an unexpected response. Please check if the backend is running correctly.' });
            }
        } catch (err) {
            console.error('Update Profile Error:', err);
            setMessage({ 
                type: 'error', 
                text: `Connection Error: ${err.message || 'The server could not be reached. Please ensure the backend is running.'}` 
            });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    return (
        <div className="bg-white min-h-screen text-black pt-20 md:pt-36 pb-16 md:pb-32 font-sans">
            
            {/* Smooth Phone Edit Modal */}
            <AnimatePresence>
                {isPhoneModalOpen && (
                    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-3 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                            onClick={() => setIsPhoneModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.3 }}
                            className="bg-white border border-black/10 text-black w-[94%] max-w-md p-6 md:p-12 relative shadow-2xl max-h-[85vh] overflow-y-auto z-10 scrollbar-hide my-auto"
                        >
                            <button 
                                type="button"
                                onClick={() => setIsPhoneModalOpen(false)}
                                className="absolute top-4 right-4 md:top-6 md:right-6 text-black/40 hover:text-black transition-colors z-10"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>

                            <div className="text-center mb-6 md:mb-12 pt-4 md:pt-0">
                                <h2 className="text-base md:text-2xl font-serif tracking-[0.2em] uppercase mb-2 md:mb-4 text-black leading-relaxed px-4 md:px-10">Edit Phone Number</h2>
                            </div>

                            <div className="space-y-6 md:space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-black/30 uppercase tracking-widest font-bold">Phone Number Type</label>
                                    <AnimatedDropdown 
                                        options={[
                                            { label: 'MOBILE', value: 'MOBILE' },
                                            { label: 'LANDLINE', value: 'LANDLINE' }
                                        ]}
                                        value={tempPhone.type || 'MOBILE'}
                                        onChange={(val) => setTempPhone({...tempPhone, type: val})}
                                        placeholder="MOBILE"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-black/30 uppercase tracking-widest font-bold">Phone number</label>
                                    <div className="flex flex-col sm:flex-row sm:items-center border border-black/10 bg-white/50 focus-within:border-gold-500 transition-all">
                                        <div className="relative w-full sm:w-auto sm:min-w-[130px] border-b sm:border-b-0 sm:border-r border-black/10">
                                            <AnimatedDropdown
                                                options={COUNTRIES.map(c => ({ label: c.code, value: c.code }))}
                                                value={tempPhone.code}
                                                onChange={(val) => {
                                                    setTempPhone({...tempPhone, code: val});
                                                    setPhoneError('');
                                                }}
                                                placeholder="Code"
                                                className="border-none text-xs sm:text-sm w-full"
                                            />
                                        </div>
                                        <input 
                                            type="tel"
                                            className="w-full bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm focus:outline-none text-black placeholder:text-black/20 font-light"
                                            value={tempPhone.number}
                                            maxLength={COUNTRIES.find(c => c.code === tempPhone.code)?.length || 15}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setTempPhone({...tempPhone, number: val});
                                                setPhoneError('');
                                            }}
                                            placeholder={`Enter ${COUNTRIES.find(c => c.code === tempPhone.code)?.length || ''} digits`}
                                        />
                                    </div>
                                </div>

                                {phoneError && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-red-600 text-white text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase text-center shadow-lg border-2 border-red-700"
                                    >
                                        <div className="flex items-center justify-center space-x-3">
                                            <X className="w-4 h-4 border-2 border-white rounded-full p-0.5" />
                                            <span>{phoneError}</span>
                                        </div>
                                    </motion.div>
                                )}

                                 <p className="text-[11px] text-black/40 text-center leading-relaxed">
                                    Please note: Adding a new MOBILE phone number for this location will replace previously saved informations.
                                </p>

                                <div className="space-y-6 pt-4">
                                    <button 
                                        type="button"
                                        onClick={handlePhoneSave}
                                        disabled={saving}
                                        className="w-full py-5 bg-black text-white text-[13px] font-black tracking-[0.4em] uppercase hover:bg-gold-500 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Verifying...' : 'Save Modifications'}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setIsPhoneModalOpen(false)}
                                        className="w-full text-center text-[13px] font-black tracking-[0.4em] uppercase underline underline-offset-8 text-black/60 hover:text-black transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1400px]">
                {/* Back Link */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-8 md:mb-12">
                    <Link to="/account" className="inline-flex items-center text-[10px] tracking-[0.4em] text-black/30 hover:text-black transition-colors uppercase group">
                        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> BACK TO ACCOUNT
                    </Link>
                </motion.div>
            </div>

            <div className="max-w-3xl mx-auto px-6">

                <div className="text-center mb-6 md:mb-12">
                    <h1 className="text-2xl md:text-4xl font-serif tracking-[0.2em] uppercase mb-4 md:mb-8 text-black">Personal Details</h1>
                    <p className="text-[10px] md:text-[11px] text-black/40 tracking-wider">Updates made to your information will be reflected across your profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-16">
                    
                    {/* PROFILE SECTION */}
                     <section>
                        <div className="border-b border-black/10 pb-2 mb-6 md:mb-10 flex justify-between items-end">
                            <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-black/80">Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Title Dropdown */}
                            <div className="space-y-2">
                                <label className={`text-[11px] uppercase tracking-widest font-bold ${fieldErrors.title ? 'text-red-500' : 'text-black/50'}`}>Title <span className={formData.title ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                <AnimatedDropdown
                                    options={[
                                        { label: 'Mr', value: 'Mr' },
                                        { label: 'Ms', value: 'Ms' },
                                        { label: 'Mrs', value: 'Mrs' },
                                        { label: 'Mx', value: 'Mx' }
                                    ]}
                                    value={formData.title}
                                    onChange={(val) => {
                                        setFormData({...formData, title: val});
                                        if (fieldErrors.title) setFieldErrors(prev => { const n = {...prev}; delete n.title; return n; });
                                    }}
                                    placeholder="Select Title"
                                    hasError={!!fieldErrors.title}
                                />
                            </div>

                            <div className="hidden md:block"></div>

                             {/* First Name */}
                            <div className="space-y-2">
                                <label className={`text-[11px] uppercase tracking-widest font-bold ${fieldErrors.firstName ? 'text-red-500' : 'text-black/50'}`}>First name <span className={formData.firstName ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                <input 
                                    name="firstName"
                                    type="text"
                                    className={`w-full border-b py-3 text-[15px] focus:border-gold-500 outline-none transition-colors bg-transparent text-black ${fieldErrors.firstName ? 'border-red-500' : 'border-black/10'}`}
                                    value={formData.firstName}
                                    onChange={(e) => {
                                        setFormData({...formData, firstName: e.target.value});
                                        if (fieldErrors.firstName) setFieldErrors(prev => { const n = {...prev}; delete n.firstName; return n; });
                                    }}
                                />
                                {fieldErrors.firstName && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.firstName}</p>}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <label className={`text-[11px] uppercase tracking-widest font-bold ${fieldErrors.lastName ? 'text-red-500' : 'text-black/50'}`}>Last name <span className={formData.lastName ? 'text-green-600' : 'text-red-500'}>*</span></label>
                                <input 
                                    name="lastName"
                                    type="text"
                                    className={`w-full border-b py-3 text-[15px] focus:border-gold-500 outline-none transition-colors bg-transparent text-black ${fieldErrors.lastName ? 'border-red-500' : 'border-black/10'}`}
                                    value={formData.lastName}
                                    onChange={(e) => {
                                        setFormData({...formData, lastName: e.target.value});
                                        if (fieldErrors.lastName) setFieldErrors(prev => { const n = {...prev}; delete n.lastName; return n; });
                                    }}
                                />
                                {fieldErrors.lastName && <p className="text-[7px] text-red-500 tracking-widest mt-1 uppercase font-bold">{fieldErrors.lastName}</p>}
                            </div>

                             {/* Date of Birth */}
                            <div className="space-y-4 md:col-span-2 mt-4">
                                <div className="flex items-center">
                                    <label className="text-[11px] text-black/50 uppercase tracking-widest font-bold">Date of birth (optional)</label>
                                    <HelpCircle size={14} className="ml-2 text-black/10 cursor-help" />
                                </div>
                                <div className="grid grid-cols-3 gap-3 md:gap-6">
                                    <div>
                                        <label className="text-[9px] text-black/20 uppercase tracking-widest block mb-1">Day</label>
                                        <AnimatedDropdown 
                                            options={[...Array(31)].map((_, i) => ({ label: String(i + 1), value: String(i + 1) }))}
                                            value={String(formData.dobDay || '')}
                                            onChange={(val) => setFormData({...formData, dobDay: val})}
                                            placeholder="Day"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-black/20 uppercase tracking-widest block mb-1">Month</label>
                                        <AnimatedDropdown 
                                            options={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({ label: m, value: m }))}
                                            value={formData.dobMonth || ''}
                                            onChange={(val) => setFormData({...formData, dobMonth: val})}
                                            placeholder="Month"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-black/20 uppercase tracking-widest block mb-1">Year</label>
                                        <AnimatedDropdown 
                                            options={[...Array(100)].map((_, i) => ({ label: String(2026 - i), value: String(2026 - i) }))}
                                            value={String(formData.dobYear || '')}
                                            onChange={(val) => setFormData({...formData, dobYear: val})}
                                            placeholder="Year"
                                        />
                                    </div>
                                </div>
                            </div>

                             {/* Location */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] text-black/50 uppercase tracking-widest font-bold">Location of residence</label>
                                <AnimatedDropdown 
                                    options={COUNTRIES.map(c => ({ label: c.name, value: c.name }))}
                                    value={formData.location}
                                    onChange={(selectedName) => {
                                        const country = COUNTRIES.find(c => c.name === selectedName);
                                        setFormData({
                                            ...formData, 
                                            location: selectedName,
                                            countryCode: country ? country.code : formData.countryCode
                                        });
                                    }}
                                    placeholder="Select Location"
                                />
                            </div>
                        </div>
                    </section>

                     {/* CONTACT NUMBERS SECTION */}
                    <section>
                        <div className="border-b border-black/10 pb-2 mb-6">
                            <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-black/80">Contact Numbers</h2>
                        </div>
                        <p className="text-[11px] text-black/40 mb-10">Add a phone number so KIKS can contact you, wherever you are.</p>

                        <div className="space-y-10">
                            <div className="bg-black/5 border border-black/10 p-8 rounded-sm relative group">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gold-500">Default Phone</h3>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setTempPhone({ type: 'MOBILE', code: formData.countryCode, number: formData.telephone });
                                            setIsPhoneModalOpen(true);
                                        }}
                                        className="text-[10px] font-black tracking-[0.2em] uppercase underline underline-offset-4 hover:text-gold-500 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className="text-[11px] text-black/40 mb-8 max-w-md">Your default phone number will be pre-filled in the checkout and will be used to receive SMS notifications.</p>
                                
                                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 md:gap-10">
                                    <div className="space-y-2">
                                        <p className="text-[9px] text-black/20 uppercase tracking-widest font-bold">Location code</p>
                                        <p className="text-xs text-black/80 py-2 border-b border-black/5">{formData.countryCode}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] text-black/20 uppercase tracking-widest font-bold">Phone number</p>
                                        <p className="text-xs text-black/80 py-2 border-b border-black/5">{formData.telephone || 'Not set'}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <span className="inline-block bg-black/10 text-black/60 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm">Mobile</span>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Messages */}
                    {message.text && (
                        <div className={`p-4 text-[11px] tracking-widest uppercase text-center border font-bold ${message.type === 'success' ? 'border-gold-500/30 bg-gold-500/5 text-gold-500' : 'border-red-600/30 bg-red-600/5 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-4 pt-6 md:pt-10">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="w-full py-5 bg-black text-white text-[13px] font-black tracking-[0.5em] uppercase hover:bg-gold-500 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Processing...' : 'Save Changes'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/account')}
                            className="w-full py-5 text-black/40 text-[13px] font-black tracking-[0.5em] uppercase border border-black/5 hover:border-black/20 transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PersonalDetails;
