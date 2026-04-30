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
        <div className="bg-black min-h-screen text-white pt-32 pb-40">
            <div className="kiks-chanel-container">
                
                <div className="mb-12 text-center">
                    <Link to="/account" className="inline-flex items-center text-[9px] tracking-[0.4em] text-white/30 hover:text-white transition-colors uppercase mb-8">
                        <ArrowLeft size={14} className="mr-2" /> Back to Account
                    </Link>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Combine all address slots into one list */}
                                {[
                                    addresses.billing ? { ...addresses.billing, slot: 'billing' } : null,
                                    addresses.shipping ? { ...addresses.shipping, slot: 'shipping' } : null,
                                    ...(addresses.additional || []).map((a, i) => ({ ...a, slot: 'additional', index: i }))
                                ]
                                .filter(addr => addr && (addr.first_name || addr.house_no)) // Ensure it's a valid address object
                                .map((addr, idx) => (
                                    <div key={idx} className="kiks-addr-col bg-white/[0.02] border border-white/5 p-8 relative group hover:border-gold-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[7px] tracking-[0.3em] uppercase text-gold-500 font-black border border-gold-500/20 px-2 py-0.5">
                                                {addr.slot === 'billing' ? 'Billing Address' : addr.slot === 'shipping' ? 'Shipping Address' : `Address Blueprint ${idx + 1}`}
                                            </span>
                                            <div className="flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startAction(addr.slot === 'additional' ? 'edit_additional' : addr.slot, addr.index)} className="text-white/40 hover:text-white"><Edit2 size={12} /></button>
                                                <button onClick={() => removeAddress(addr.slot, addr.index)} className="text-red-500/40 hover:text-red-500"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                        <strong className="text-xs tracking-widest uppercase block mb-3">{addr.first_name} {addr.last_name}</strong>
                                        <p className="text-[10px] tracking-widest text-white/60 mb-1">{addr.house_no}, {addr.area}</p>
                                        {addr.landmark && <p className="text-[10px] tracking-widest text-white/40 italic mb-1">Near {addr.landmark}</p>}
                                        <p className="text-[10px] tracking-widest text-white/60 mb-1">{addr.city}, {addr.state} - {addr.pincode}</p>
                                        <p className="text-[10px] tracking-widest text-white/60 uppercase">{addr.country}</p>
                                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-[9px] tracking-[0.2em] text-white/30 truncate">
                                            <Phone size={10} className="mr-2" /> {addr.phone}
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Address Button */}
                                <button 
                                    onClick={() => startAction('add_additional')}
                                    className="bg-transparent border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center space-y-4 hover:border-white/20 hover:bg-white/[0.01] transition-all group min-h-[220px]"
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

                            <form onSubmit={saveAddress} className="kiks-pure-form">
                                <div className="kiks-f-row">
                                    <div>
                                        <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">First Name</label>
                                        <input 
                                            name="first_name" 
                                            value={formData.first_name} 
                                            onChange={handleFormChange} 
                                            placeholder="FIRST NAME" 
                                            required 
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
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">House No / Apt / Suite</label>
                                    <input 
                                        name="house_no" 
                                        value={formData.house_no} 
                                        onChange={handleFormChange} 
                                        placeholder="E.G. VILLA 402, 4TH FLOOR" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Area / Street</label>
                                    <input 
                                        name="area" 
                                        value={formData.area} 
                                        onChange={handleFormChange} 
                                        placeholder="E.G. EMERALD HILLS" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Landmark (Near you)</label>
                                    <input 
                                        name="landmark" 
                                        value={formData.landmark} 
                                        onChange={handleFormChange} 
                                        placeholder="E.G. NEAR MARINA TOWER" 
                                        required 
                                    />
                                </div>

                                <div className="kiks-f-row">
                                    <div>
                                        <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">City</label>
                                        <input 
                                            name="city" 
                                            value={formData.city} 
                                            onChange={handleFormChange} 
                                            placeholder="CITY" 
                                            required 
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
                                        />
                                    </div>
                                </div>

                                <div className="kiks-f-row">
                                    <div>
                                        <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Pincode</label>
                                        <input 
                                            name="pincode" 
                                            value={formData.pincode} 
                                            onChange={handleFormChange} 
                                            placeholder="PINCODE" 
                                            required 
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
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[8px] tracking-[0.4em] text-white/40 uppercase mb-2 block">Phone Number</label>
                                    <input 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleFormChange} 
                                        placeholder="PHONE" 
                                        required 
                                    />
                                </div>

                                <div className="kiks-f-btns">
                                    <button type="submit" className="kiks-btn-black flex items-center" disabled={formLoading}>
                                        {formLoading ? <Loader2 className="animate-spin mr-2" size={12} /> : null}
                                        SAVE ADDRESS
                                    </button>
                                    <button type="button" onClick={cancelAction} className="kiks-cancel">CANCEL</button>
                                </div>
                            </form>
                        </motion.div>
                    )
                }</AnimatePresence>
            </div>
        </div>
    );
};

export default Addresses;
