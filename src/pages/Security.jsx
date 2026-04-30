import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../store/authSlice';
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Security = () => {
    const { user, token, isAuthenticated } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Email State
    const [emailForm, setEmailForm] = useState({
        newEmail: user?.email || '',
        currentPassword: ''
    });
    const [emailStatus, setEmailStatus] = useState({ type: '', msg: '' });
    const [showEmailPass, setShowEmailPass] = useState(false);
    const [updatingEmail, setUpdatingEmail] = useState(false);

    // Password State
    const [passForm, setPassForm] = useState({
        currentPassword: '',
        newPassword: ''
    });
    const [passStatus, setPassStatus] = useState({ type: '', msg: '' });
    const [showPass1, setShowPass1] = useState(false);
    const [showPass2, setShowPass2] = useState(false);
    const [updatingPass, setUpdatingPass] = useState(false);

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setUpdatingEmail(true);
        setEmailStatus({ type: '', msg: '' });

        try {
            const res = await fetch(`${API_URL}/api/auth/update-email`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(emailForm)
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                throw new Error("Server returned a non-JSON response.");
            }

            if (res.ok) {
                setEmailStatus({ type: 'success', msg: data.message });
                setEmailForm(prev => ({ ...prev, currentPassword: '' }));
                
                const updatedUser = { ...user, email: data.email };
                dispatch(login({ user: updatedUser, token }));
            } else {
                setEmailStatus({ type: 'error', msg: data.message || data.msg || 'Failed to update email' });
            }
        } catch (err) {
            console.error("Update email error:", err);
            setEmailStatus({ type: 'error', msg: err.message === "Failed to fetch" ? 'Server connection lost. Please try again later.' : 'System error. Please contact support.' });
        } finally {
            setUpdatingEmail(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setUpdatingPass(true);
        setPassStatus({ type: '', msg: '' });

        if (passForm.newPassword.length < 8) {
            setPassStatus({ type: 'error', msg: 'New password must be at least 8 characters.' });
            setUpdatingPass(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passForm)
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                throw new Error("Server returned a non-JSON response.");
            }

            if (res.ok) {
                setPassStatus({ type: 'success', msg: data.message });
                setPassForm({ currentPassword: '', newPassword: '' });
            } else {
                setPassStatus({ type: 'error', msg: data.message || data.msg || 'Failed to update password' });
            }
        } catch (err) {
            console.error("Update password error:", err);
            setPassStatus({ type: 'error', msg: err.message === "Failed to fetch" ? 'Server connection lost. Please try again later.' : 'System error. Please contact support.' });
        } finally {
            setUpdatingPass(false);
        }
    };

    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-40 px-6 font-sans">
            <div className="max-w-2xl mx-auto">
                
                {/* Back Button */}
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link to="/account" className="inline-flex items-center text-[10px] tracking-[0.4em] text-white/30 hover:text-white transition-colors uppercase group">
                        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Back to Account
                    </Link>
                </motion.div>

                {/* Page Title */}
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl md:text-3xl font-serif tracking-[0.2em] uppercase text-center mb-16"
                >
                    Login & Security
                </motion.h1>

                <div className="space-y-20">
                    
                    {/* SECTION: LOGIN EMAIL */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase">Login Email</h2>
                            <div className="w-full h-px bg-white/10"></div>
                        </div>

                        <p className="text-[10px] md:text-[11px] text-white/40 leading-relaxed max-w-lg">
                            Your login email is needed to sign in to your account and to receive notifications such as order updates and verification codes.
                        </p>

                        <form onSubmit={handleUpdateEmail} className="space-y-8">
                            <div className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-1 relative">
                                    <label className="text-[8px] tracking-[0.2em] text-white/30 uppercase block">Email</label>
                                    <input 
                                        type="email"
                                        value={emailForm.newEmail}
                                        onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                                        className="w-full bg-transparent border-b border-white/10 py-2 text-[13px] focus:border-white transition-colors outline-none font-medium"
                                        required
                                    />
                                </div>

                                <p className="text-[10px] text-white/30 italic">To modify your email, please enter your current password.</p>

                                {/* Password Verification */}
                                <div className="space-y-1 relative">
                                    <label className="text-[8px] tracking-[0.2em] text-white/30 uppercase block">Current Password</label>
                                    <input 
                                        type={showEmailPass ? "text" : "password"}
                                        value={emailForm.currentPassword}
                                        onChange={(e) => setEmailForm({...emailForm, currentPassword: e.target.value})}
                                        className="w-full bg-transparent border-b border-white/10 py-2 text-[13px] focus:border-white transition-colors outline-none font-medium tracking-widest"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowEmailPass(!showEmailPass)}
                                        className="absolute right-0 bottom-2 text-white/30 hover:text-white transition-colors"
                                    >
                                        {showEmailPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {emailStatus.msg && (
                                <div className={`flex items-center gap-2 p-3 border ${emailStatus.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-red-500/5 border-red-500/20 text-red-500'} text-[10px] tracking-widest uppercase`}>
                                    {emailStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                    {emailStatus.msg}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={updatingEmail}
                                className="w-full md:w-fit px-12 py-3 border border-white text-[9px] font-bold tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                            >
                                {updatingEmail ? <Loader2 size={12} className="animate-spin" /> : 'Modify Login Email'}
                            </button>
                        </form>
                    </motion.section>

                    {/* SECTION: PASSWORD */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase">Password</h2>
                            <div className="w-full h-px bg-white/10"></div>
                        </div>

                        <p className="text-[10px] md:text-[11px] text-white/40 leading-relaxed max-w-lg">
                            If you wish to modify your password, please use this section. All fields are mandatory.
                        </p>

                        <form onSubmit={handleUpdatePassword} className="space-y-8">
                            <div className="space-y-8">
                                {/* Current Password */}
                                <div className="space-y-1 relative">
                                    <label className="text-[8px] tracking-[0.2em] text-white/30 uppercase block">Current Password</label>
                                    <input 
                                        type={showPass1 ? "text" : "password"}
                                        value={passForm.currentPassword}
                                        onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                                        className="w-full bg-transparent border-b border-white/10 py-2 text-[13px] focus:border-white transition-colors outline-none font-medium tracking-widest"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPass1(!showPass1)}
                                        className="absolute right-0 bottom-2 text-white/30 hover:text-white transition-colors"
                                    >
                                        {showPass1 ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>

                                {/* New Password */}
                                <div className="space-y-3">
                                    <div className="space-y-1 relative">
                                        <label className="text-[8px] tracking-[0.2em] text-white/30 uppercase block">New Password</label>
                                        <input 
                                            type={showPass2 ? "text" : "password"}
                                            value={passForm.newPassword}
                                            onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                                            className="w-full bg-transparent border-b border-white/10 py-2 text-[13px] focus:border-white transition-colors outline-none font-medium tracking-widest"
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPass2(!showPass2)}
                                            className="absolute right-0 bottom-2 text-white/30 hover:text-white transition-colors"
                                        >
                                            {showPass2 ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-white/20 leading-relaxed max-w-xs uppercase tracking-wider">
                                        Min 8 characters • Uppercase • Lowercase • Numbers
                                    </p>
                                </div>
                            </div>

                            {passStatus.msg && (
                                <div className={`flex items-center gap-2 p-3 border ${passStatus.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-red-500/5 border-red-500/20 text-red-500'} text-[10px] tracking-widest uppercase`}>
                                    {passStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                    {passStatus.msg}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={updatingPass}
                                className="w-full md:w-fit px-12 py-3 border border-white text-[9px] font-bold tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                            >
                                {updatingPass ? <Loader2 size={12} className="animate-spin" /> : 'Change Password'}
                            </button>
                        </form>
                    </motion.section>

                </div>
            </div>
        </div>
    );
};

export default Security;
