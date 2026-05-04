import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, ArrowLeft, Loader2, Check, Phone } from 'lucide-react';
import PageLoader from '../components/PageLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Addresses = () => {
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useSelector(state => state.auth);
    
    const [addresses, setAddresses] = useState({ billing: null, shipping: null, additional: [] });
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState(null); // 'billing', 'shipping', 'add_additional', 'edit_additional'
    const [editIndex, setEditIndex] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [pincodeError, setPincodeError] = useState(false);
    const [isVerifyingPincode, setIsVerifyingPincode] = useState(false);
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        house_no: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        phone: ''
    });

    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/login');
            return;
        }
        fetchAddresses();
    }, [isAuthenticated, token, navigate]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            } else {
                console.error("Failed to fetch addresses:", res.status);
                if (res.status === 401) {
                    navigate('/login');
                }
            }
        } catch (err) {
            console.error("Error fetching addresses:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Auto-detect City and State based on Pincode with strict verification
    useEffect(() => {
        const detectLocation = async () => {
            if (formData.pincode.length === 6 && /^\d+$/.test(formData.pincode)) {
                setIsVerifyingPincode(true);
                setPincodeError(false);
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
                    const data = await res.json();
                    
                    if (data[0].Status === "Success" && data[0].PostOffice) {
                        const { District, State } = data[0].PostOffice[0];
                        setFormData(prev => ({
                            ...prev,
                            city: District,
                            state: State
                        }));
                        setPincodeError(false);
                    } else {
                        setPincodeError(true);
                    }
                } catch (err) {
                    console.error("Pincode detection failed:", err);
                    setPincodeError(true);
                } finally {
                    setIsVerifyingPincode(false);
                }
            } else if (formData.pincode.length > 0 && formData.pincode.length < 6) {
                setPincodeError(false); // Still typing
            } else if (formData.pincode.length > 6) {
                setPincodeError(true);
            }
        };

        const timer = setTimeout(detectLocation, 500);
        return () => clearTimeout(timer);
    }, [formData.pincode]);

    const startAction = (type, index = null) => {
        setAction(type);
        setEditIndex(index);
        
        if (type === 'billing' && addresses.billing) {
            setFormData({ ...addresses.billing });
        } else if (type === 'shipping' && addresses.shipping) {
            setFormData({ ...addresses.shipping });
        } else if (type === 'edit_additional' && index !== null) {
            setFormData({ ...addresses.additional[index] });
        } else {
            setFormData({ first_name: '', last_name: '', house_no: '', area: '', landmark: '', city: '', state: '', country: 'India', pincode: '', phone: '' });
        }
    };

    const cancelAction = () => {
        setAction(null);
        setEditIndex(null);
        setPincodeError(false);
        setIsVerifyingPincode(false);
    };

    const saveAddress = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        
        const typeInApi = (action === 'billing' || action === 'shipping') ? action : 'additional';
        
        try {
            const res = await fetch(`${API_URL}/api/addresses`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: typeInApi,
                    addressData: formData,
                    index: editIndex
                })
            });
            
            if (res.ok) {
                const updated = await res.json();
                setAddresses(updated);
                setSuccessMsg('Blueprint Securely Stored');
                setTimeout(() => {
                    setSuccessMsg('');
                    setAction(null);
                }, 1500);
            }
        } catch (err) {
            console.error("Error saving address:", err);
        } finally {
            setFormLoading(false);
        }
    };

    const removeAddress = async (type, index = null) => {
        if (!window.confirm("Are you sure you want to remove this address?")) return;
        
        try {
            const url = index !== null ? `${API_URL}/api/addresses/${type}/${index}` : `${API_URL}/api/addresses/${type}`;
            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const updated = await res.json();
                setAddresses(updated);
            }
        } catch (err) {
            console.error("Error removing address:", err);
        }
    };

    if (loading) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-white pt-28 md:pt-32 pb-8 md:pb-32">
            <div className="kiks-chanel-container">
                
                <div className="mb-4 md:mb-12 text-center">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-12">
                        <Link to="/account" className="inline-flex items-center text-[10px] tracking-[0.4em] text-white/30 hover:text-white transition-colors uppercase group">
                            <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> BACK TO ACCOUNT
                        </Link>
                    </motion.div>
                    <h1 className="kiks-main-title">Addresses</h1>
                </div>

                <AnimatePresence mode="wait">
                    {!action ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                {/* Combine all address slots into one list */}
                                {[
                                    addresses.billing ? { ...addresses.billing, slot: 'billing' } : null,
                                    addresses.shipping ? { ...addresses.shipping, slot: 'shipping' } : null,
                                    ...(addresses.additional || []).map((a, i) => ({ ...a, slot: 'additional', index: i }))
                                ]
                                .filter(addr => addr && (addr.first_name || addr.house_no)) // Ensure it's a valid address object
                                .map((addr, idx) => (
                                    <div key={idx} className="kiks-addr-col bg-white/[0.02] border border-white/5 p-5 md:p-8 relative group hover:border-gold-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[7px] tracking-[0.3em] uppercase text-gold-500 font-black border border-gold-500/20 px-2 py-0.5">
                                                {addr.slot === 'billing' ? 'Billing Address' : addr.slot === 'shipping' ? 'Shipping Address' : `Address Blueprint ${idx + 1}`}
                                            </span>
                                            <div className="flex space-x-6 md:space-x-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startAction(addr.slot === 'additional' ? 'edit_additional' : addr.slot, addr.index)} className="text-white/60 md:text-white/40 hover:text-white p-1">
                                                    <Edit2 className="w-4 h-4 md:w-3 md:h-3" />
                                                </button>
                                                <button onClick={() => removeAddress(addr.slot, addr.index)} className="text-red-500/60 md:text-red-500/40 hover:text-red-500 p-1">
                                                    <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <strong className="text-xs tracking-widest uppercase block mb-3">{addr.first_name} {addr.last_name}</strong>
                                        <p className="text-[10px] tracking-widest text-white/60 mb-1">{addr.house_no}, {addr.area}</p>
                                        {addr.landmark && <p className="text-[10px] tracking-widest text-white/40 italic mb-1">Near {addr.landmark}</p>}
                                        <p className="text-[10px] tracking-widest text-white/60 mb-1">{addr.city}, {addr.state} - {addr.pincode}</p>
                                        <p className="text-[10px] tracking-widest text-white/60 uppercase">{addr.country}</p>
                                        <div className="mt-4 md:mt-6 pt-4 border-t border-white/5 flex items-center text-[9px] tracking-[0.2em] text-white/30 truncate">
                                            <Phone size={10} className="mr-2" /> {addr.phone}
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Address Button */}
                                <button 
                                    onClick={() => startAction('add_additional')}
                                    className="bg-transparent border-2 border-dashed border-white/5 p-5 md:p-8 flex flex-col items-center justify-center space-y-4 hover:border-white/20 hover:bg-white/[0.01] transition-all group min-h-[160px] md:min-h-[220px]"
                                >
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold-500 transition-all">
                                        <Plus size={20} className="text-white/20 group-hover:text-gold-500" />
                                    </div>
                                    <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 group-hover:text-white">Add New Identity</span>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <h2 className="kiks-section-line">
                                {successMsg ? (
                                    <span className="text-gold-500 font-black">{successMsg}</span>
                                ) : (
                                    <>{action.replace('_', ' ').toUpperCase()} ADDRESS</>
                                )}
                            </h2>

                            <form onSubmit={saveAddress} className="kiks-pure-form px-4 sm:px-0">
                                <div className="kiks-f-row gap-6 md:gap-[30px]">
                                    <div>
                                        <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">First Name</label>
                                        <input 
                                            name="first_name" 
                                            value={formData.first_name} 
                                            onChange={handleFormChange} 
                                            placeholder="FIRST NAME" 
                                            required 
                                            className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] tracking-widest outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Last Name</label>
                                        <input 
                                            name="last_name" 
                                            value={formData.last_name} 
                                            onChange={handleFormChange} 
                                            placeholder="LAST NAME" 
                                            required 
                                            className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] tracking-widest outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">House No / Apt / Suite</label>
                                    <input 
                                        name="house_no" 
                                        value={formData.house_no} 
                                        onChange={handleFormChange} 
                                        placeholder="E.G. VILLA 402, 4TH FLOOR" 
                                        required 
                                        className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] tracking-widest outline-none focus:border-white transition-colors"
                                    />
                                </div>
                                <div className="mt-6">
                                    <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Area / Street</label>
                                    <input 
                                        name="area" 
                                        value={formData.area} 
                                        onChange={handleFormChange} 
                                        placeholder="E.G. EMERALD HILLS" 
                                        required 
                                        className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] tracking-widest outline-none focus:border-white transition-colors"
                                    />
                                </div>
                                <div className="mt-6">
                                    <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Landmark (Near you)</label>
                                    <input 
                                        name="landmark" 
                                        value={formData.landmark} 
                                        onChange={handleFormChange} 
                                        placeholder="E.G. NEAR MARINA TOWER" 
                                        required 
                                        className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] tracking-widest outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div className="kiks-f-row mt-6 gap-6 md:gap-[30px]">
                                    <div>
                                        <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">City</label>
                                        <input 
                                            name="city" 
                                            value={formData.city} 
                                            onChange={handleFormChange} 
                                            placeholder="CITY" 
                                            required 
                                            className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] tracking-widest outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">State</label>
                                        <input 
                                            name="state" 
                                            value={formData.state} 
                                            onChange={handleFormChange} 
                                            placeholder="STATE" 
                                            required 
                                            className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] tracking-widest outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="kiks-f-row mt-6 gap-6 md:gap-[30px]">
                                    <div className="relative">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase block">Pincode</label>
                                            {pincodeError && <span className="text-[8px] text-red-500 font-black tracking-widest uppercase animate-pulse">Invalid Pincode</span>}
                                            {isVerifyingPincode && <span className="text-[8px] text-gold-500/50 font-black tracking-widest uppercase">Verifying...</span>}
                                        </div>
                                        <input 
                                            name="pincode" 
                                            value={formData.pincode} 
                                            onChange={handleFormChange} 
                                            placeholder="PINCODE" 
                                            required 
                                            className={`w-full bg-transparent border-b py-4 text-[12px] tracking-widest outline-none transition-colors ${pincodeError ? 'border-red-500 text-red-500' : 'border-white/10 focus:border-white'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Country</label>
                                        <input 
                                            name="country" 
                                            value={formData.country} 
                                            onChange={handleFormChange} 
                                            placeholder="COUNTRY" 
                                            required 
                                            readOnly
                                            className="w-full bg-transparent border-b border-white/5 py-4 text-[12px] tracking-widest outline-none text-white/30 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Phone Number</label>
                                    <input 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleFormChange} 
                                        placeholder="PHONE" 
                                        required 
                                        className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] tracking-widest outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div className="kiks-f-btns mt-10 md:mt-12 flex flex-col md:flex-row gap-6 md:gap-0">
                                    <button 
                                        type="submit" 
                                        className={`kiks-btn-black w-full md:w-auto flex items-center justify-center transition-all ${formLoading || pincodeError || isVerifyingPincode || !formData.first_name || !formData.last_name || !formData.house_no || !formData.area || !formData.landmark || !formData.city || !formData.state || !formData.pincode || !formData.phone ? 'opacity-50 cursor-not-allowed grayscale' : ''}`} 
                                        disabled={formLoading || pincodeError || isVerifyingPincode || !formData.first_name || !formData.last_name || !formData.house_no || !formData.area || !formData.landmark || !formData.city || !formData.state || !formData.pincode || !formData.phone}
                                    >
                                        {formLoading ? <Loader2 className="animate-spin mr-2" size={12} /> : null}
                                        {isVerifyingPincode ? 'VERIFYING...' : 'SAVE ADDRESS'}
                                    </button>
                                    <button type="button" onClick={cancelAction} className="kiks-cancel text-[10px] tracking-[0.3em] font-black uppercase underline underline-offset-8 text-white/40 hover:text-white transition-colors">CANCEL</button>
                                </div>
                                {(!formData.first_name || !formData.last_name || !formData.house_no || !formData.area || !formData.landmark || !formData.city || !formData.state || !formData.pincode || !formData.phone) && (
                                    <p className="mt-6 text-[8px] tracking-[0.2em] text-red-500/60 uppercase italic">All fields must be completed to securely store this blueprint</p>
                                )}
                            </form>
                        </motion.div>
                    )
                }</AnimatePresence>
            </div>
        </div>
    );
};

export default Addresses;
