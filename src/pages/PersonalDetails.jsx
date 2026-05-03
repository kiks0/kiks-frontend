import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const COUNTRIES = [
    { name: 'India', code: '+91 (IN)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'United Arab Emirates', code: '+971 (AE)', length: 9, pattern: /^[0-9]{9}$/ },
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
    { name: 'South Korea', code: '+82 (KR)', length: 10, pattern: /^[0-9]{10}$/ },
    { name: 'China', code: '+86 (CN)', length: 11, pattern: /^[0-9]{11}$/ },
    { name: 'Hong Kong', code: '+852 (HK)', length: 8, pattern: /^[0-9]{8}$/ },
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
    { name: 'Turkey', code: '+90 (TR)', length: 10, pattern: /^[0-9]{10}$/ },
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
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: user?.title || 'Mr',
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        dobDay: user?.dob_day?.toString() || '',
        dobMonth: user?.dob_month?.toString() || '',
        dobYear: user?.dob_year?.toString() || '',
        location: user?.location || localStorage.getItem('kiks_location_name') || 'India',
        telephone: user?.telephone || '',
        countryCode: user?.country_code || '+91 (IN)'
    });

    useEffect(() => {
        // If user doesn't have a country code but we have a location, set the default code
        if (!user?.country_code) {
            const loc = user?.location || localStorage.getItem('kiks_location_name') || 'India';
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
        code: user?.country_code || '+91 (IN)',
        number: user?.telephone || ''
    });

    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
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
                        title: data.title || 'Mr',
                        firstName: data.first_name || '',
                        lastName: data.last_name || '',
                        dobDay: data.dob_day?.toString() || '',
                        dobMonth: data.dob_month?.toString() || '',
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

    const handlePhoneSave = () => {
        if (!validatePhone(tempPhone.code, tempPhone.number)) {
            const country = COUNTRIES.find(c => c.code === tempPhone.code);
            setPhoneError(`Please enter a valid ${country.name} number (${country.length} digits).`);
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
        setPhoneError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

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
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-8 md:pb-32 pt-28 md:pt-40 relative">
            
            {/* Phone Edit Modal */}
            {isPhoneModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsPhoneModalOpen(false)}></div>
                    <div className="bg-[#0a0a0a] border border-white/10 text-white w-full max-w-lg p-8 md:p-12 relative animate-in fade-in zoom-in duration-300 shadow-2xl">
                        <button 
                            onClick={() => setIsPhoneModalOpen(false)}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-10">
                            <h2 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase mb-4 text-gold-500">Edit Phone Number</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Phone Number Type</label>
                                <select className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent cursor-pointer text-white appearance-none">
                                    <option className="bg-black" value="MOBILE">MOBILE</option>
                                    <option className="bg-black" value="LANDLINE">LANDLINE</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Location code</label>
                                    <select 
                                        className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent cursor-pointer text-white appearance-none"
                                        value={tempPhone.code}
                                        onChange={(e) => {
                                            setTempPhone({...tempPhone, code: e.target.value});
                                            setPhoneError('');
                                        }}
                                    >
                                        {COUNTRIES.map(c => (
                                            <option className="bg-black" key={c.code} value={c.code}>{c.code}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Phone number</label>
                                    <input 
                                        type="tel"
                                        className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent text-white"
                                        value={tempPhone.number}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setTempPhone({...tempPhone, number: val});
                                            setPhoneError('');
                                        }}
                                        placeholder="Enter number"
                                    />
                                </div>
                            </div>

                            {phoneError && (
                                <p className="text-[10px] text-red-500 tracking-widest uppercase text-center border border-red-500/20 py-2 bg-red-500/5">{phoneError}</p>
                            )}

                            <p className="text-[11px] text-white/40 text-center leading-relaxed">
                                Please note: Adding a new MOBILE phone number for this location will replace previously saved informations.
                            </p>

                            <div className="space-y-6 pt-4">
                                <button 
                                    onClick={handlePhoneSave}
                                    className="w-full py-5 bg-gold-500 text-black text-[11px] font-black tracking-[0.4em] uppercase hover:bg-gold-600 transition-colors"
                                >
                                    Save Modifications
                                </button>
                                <button 
                                    onClick={() => setIsPhoneModalOpen(false)}
                                    className="w-full text-center text-[11px] font-black tracking-[0.4em] uppercase underline underline-offset-8 text-white/60 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto px-6">
                
                {/* Back Link */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-12">
                    <Link to="/account" className="inline-flex items-center text-[10px] tracking-[0.4em] text-white/30 hover:text-white transition-colors uppercase group">
                        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> BACK TO ACCOUNT
                    </Link>
                </motion.div>

                <div className="text-center mb-6 md:mb-12">
                    <h1 className="text-2xl md:text-4xl font-serif tracking-[0.2em] uppercase mb-4 md:mb-8 text-gold-500">Personal Details</h1>
                    <p className="text-[10px] md:text-[11px] text-white/40 tracking-wider">Updates made to your information will be reflected across your KIKS profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-16">
                    
                    {/* PROFILE SECTION */}
                    <section>
                        <div className="border-b border-white/10 pb-2 mb-6 md:mb-10 flex justify-between items-end">
                            <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-white/80">Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Title Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Title</label>
                                <select 
                                    className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent cursor-pointer text-white appearance-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                >
                                    <option className="bg-black" value="Mr">Mr</option>
                                    <option className="bg-black" value="Ms">Ms</option>
                                    <option className="bg-black" value="Mrs">Mrs</option>
                                    <option className="bg-black" value="Mx">Mx</option>
                                </select>
                            </div>

                            <div className="hidden md:block"></div>

                            {/* First Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold">First name</label>
                                <input 
                                    type="text"
                                    className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent text-white"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    required
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Last name</label>
                                <input 
                                    type="text"
                                    className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent text-white"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    required
                                />
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-4 md:col-span-2 mt-4">
                                <div className="flex items-center">
                                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Date of birth (optional)</label>
                                    <HelpCircle size={14} className="ml-2 text-white/10 cursor-help" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="sm:col-span-1">
                                        <label className="text-[9px] text-white/20 uppercase tracking-widest block mb-1">Day</label>
                                        <select 
                                            className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent text-white appearance-none"
                                            value={formData.dobDay}
                                            onChange={(e) => setFormData({...formData, dobDay: e.target.value})}
                                        >
                                            <option className="bg-black" value="">Day</option>
                                            {[...Array(31)].map((_, i) => (
                                                <option className="bg-black" key={i+1} value={i+1}>{i+1}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-white/20 uppercase tracking-widest block mb-1">Month</label>
                                        <select 
                                            className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent text-white"
                                            value={formData.dobMonth}
                                            onChange={(e) => setFormData({...formData, dobMonth: e.target.value})}
                                        >
                                            <option className="bg-black" value="">Month</option>
                                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                                <option className="bg-black" key={i+1} value={i+1}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-white/20 uppercase tracking-widest block mb-1">Year</label>
                                        <select 
                                            className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent text-white"
                                            value={formData.dobYear}
                                            onChange={(e) => setFormData({...formData, dobYear: e.target.value})}
                                        >
                                            <option className="bg-black" value="">Year</option>
                                            {[...Array(100)].map((_, i) => (
                                                <option className="bg-black" key={2026-i} value={2026-i}>{2026-i}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Location of residence</label>
                                <select 
                                    className="w-full border-b border-white/10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-transparent cursor-pointer text-white appearance-none"
                                    value={formData.location}
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const country = COUNTRIES.find(c => c.name === selectedName);
                                        setFormData({
                                            ...formData, 
                                            location: selectedName,
                                            countryCode: country ? country.code : formData.countryCode
                                        });
                                    }}
                                >
                                    {COUNTRIES.map(c => (
                                        <option className="bg-black text-white" key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* CONTACT NUMBERS SECTION */}
                    <section>
                        <div className="border-b border-white/10 pb-2 mb-6">
                            <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-white/80">Contact Numbers</h2>
                        </div>
                        <p className="text-[11px] text-white/40 mb-10">Add a phone number so KIKS can contact you, wherever you are.</p>

                        <div className="space-y-10">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-sm relative group">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gold-400">Default Phone</h3>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setTempPhone({ code: formData.countryCode, number: formData.telephone });
                                            setIsPhoneModalOpen(true);
                                        }}
                                        className="text-[10px] font-black tracking-[0.2em] uppercase underline underline-offset-4 hover:text-gold-500 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className="text-[11px] text-white/40 mb-8 max-w-md">Your default phone number will be pre-filled in the checkout and will be used to receive SMS notifications.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 md:gap-10">
                                    <div className="space-y-2">
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Location code</p>
                                        <p className="text-xs text-white/80 py-2 border-b border-white/5">{formData.countryCode}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Phone number</p>
                                        <p className="text-xs text-white/80 py-2 border-b border-white/5">{formData.telephone || 'Not set'}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <span className="inline-block bg-white/10 text-white/60 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm">Mobile</span>
                                </div>
                            </div>

                            <button 
                                type="button" 
                                onClick={() => {
                                    setTempPhone({ code: '+91 (IN)', number: '' });
                                    setIsPhoneModalOpen(true);
                                }}
                                className="w-full py-4 border border-white/10 text-[10px] font-black tracking-[0.4em] uppercase hover:border-gold-500 hover:text-gold-500 transition-all text-white/60"
                            >
                                Add a new number
                            </button>
                        </div>
                    </section>

                    {/* Messages */}
                    {message.text && (
                        <div className={`p-4 text-[11px] tracking-widest uppercase text-center border ${message.type === 'success' ? 'border-gold-500/30 bg-gold-500/5 text-gold-500' : 'border-red-500/30 bg-red-500/5 text-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-4 pt-6 md:pt-10">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="w-full py-5 bg-gold-500 text-black text-[11px] font-black tracking-[0.5em] uppercase hover:bg-gold-600 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Processing...' : 'Save Changes'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/account')}
                            className="w-full py-5 text-white/40 text-[11px] font-black tracking-[0.5em] uppercase border border-white/5 hover:border-white/20 transition-all"
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
