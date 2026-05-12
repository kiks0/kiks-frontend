import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Sparkles, CheckCircle2 } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            // Submit to Web3Forms (A secure, high-end email delivery API)
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: '7b09bf9e-5d82-4987-8350-bb836992b949',
                    from_name: 'KIKS ULTRA LUXURY',
                    subject: 'New Website Inquiry',
                    ...formData
                }),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="bg-white min-h-screen text-black pt-20 md:pt-32 pb-12 md:pb-16 font-sans selection:bg-black/10 selection:text-black overflow-hidden relative">

            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-[1300px] relative z-10">

                {/* Header Section */}
                <div className="max-w-3xl mb-6 md:mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-4 mb-2"
                    >
                        <span className="w-12 h-[1px] bg-black" />
                        <p className="text-black text-[10px] tracking-[0.6em] font-black uppercase">Connect With KIKS</p>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="text-2xl md:text-4xl font-serif text-black tracking-[0.1em] uppercase font-light leading-tight mb-4"
                    >
                        How Can We <br />Help You?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-black/60 text-[10px] md:text-xs font-light tracking-[0.2em] max-w-xl leading-relaxed uppercase"
                    >
                        Whether you have a question about our collections or want to talk about a custom fragrance, our team is here to help you.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Left Side: Contact Information */}
                    <div className="space-y-12 md:space-y-16">
                        <section className="space-y-6 md:space-y-10">
                            <h2 className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] font-black text-black/30 uppercase">Reach out directly</h2>
                            <div className="space-y-6 md:space-y-8">
                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="flex items-center space-x-4 md:space-x-8"
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 bg-black/5 border border-black/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-black">
                                        <Mail size={20} strokeWidth={1} className="md:w-6 md:h-6" />
                                    </div>
                                    <div className="min-w-0 pr-2">
                                        <p className="text-[9px] md:text-[10px] tracking-widest text-black/40 uppercase mb-1 font-bold">Email us</p>
                                        <p className="text-[12px] md:text-xl font-light tracking-widest break-all">kiksultraluxury@gmail.com</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="flex items-center space-x-4 md:space-x-8"
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 bg-black/5 border border-black/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-black">
                                        <Phone size={20} strokeWidth={1} className="md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] md:text-[10px] tracking-widest text-black/40 uppercase mb-1 font-bold">Call Support</p>
                                        <p className="text-[12px] md:text-xl font-light tracking-widest whitespace-nowrap">+91 840 102 0339</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="flex items-center space-x-4 md:space-x-8"
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 bg-black/5 border border-black/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-black">
                                        <MapPin size={20} strokeWidth={1} className="md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] md:text-[10px] tracking-widest text-black/40 uppercase mb-1 font-bold">Location</p>
                                        <p className="text-[12px] md:text-xl font-light tracking-widest">Gujarat, India</p>
                                    </div>
                                </motion.div>
                            </div>
                        </section>

                        <section className="space-y-10">
                            <h2 className="text-[11px] tracking-[0.5em] font-black text-black/30 uppercase">Follow Our Journey</h2>
                            <div className="flex space-x-6 text-black/40">
                                <Globe size={24} className="hover:text-black transition-colors cursor-pointer" />
                                <MessageSquare size={24} className="hover:text-black transition-colors cursor-pointer" />
                            </div>
                        </section>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white border border-black/5 p-6 md:p-14 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative"
                        >
                            <AnimatePresence mode='wait'>
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="py-12 md:py-20 text-center flex flex-col items-center relative overflow-hidden"
                                    >
                                        {/* Decorative Success Glow */}
                                        <div className="absolute inset-0 bg-black/5 blur-[80px] rounded-full animate-pulse pointer-events-none" />

                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
                                            className="w-20 h-20 md:w-28 md:h-28 bg-black/5 text-black rounded-full flex items-center justify-center mb-10 relative z-10"
                                        >
                                            <div className="absolute inset-0 rounded-full border-2 border-black/10 animate-[ping_3s_infinite]" />
                                            <CheckCircle2 size={40} className="md:w-14 md:h-14" strokeWidth={1} />
                                        </motion.div>

                                        <div className="relative z-10">
                                            <h3 className="text-3xl md:text-4xl font-serif text-black uppercase tracking-[0.1em] mb-6 leading-tight">
                                                Inquiry <br className="md:hidden" /> Received
                                            </h3>
                                            <p className="text-black/60 text-[10px] md:text-xs tracking-[0.3em] leading-loose uppercase max-w-sm mx-auto mb-12 px-4">
                                                Your message has been safely delivered to our curators. We will reach out to you through our support team within 24 hours.
                                            </p>
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => (window.location.href = '/')}
                                                className="inline-flex items-center px-10 py-4 bg-black text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-black/80 transition-all duration-500"
                                            >
                                                Return Home
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        onSubmit={handleSubmit}
                                        className="space-y-8 md:space-y-10"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                                            <div className="space-y-4">
                                                <label className="text-[9px] tracking-[0.4em] font-bold text-black/30 uppercase">Your Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-black/5 border-b border-black/10 p-4 text-sm text-black focus:outline-none focus:border-black transition-all font-light tracking-widest"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[9px] tracking-[0.4em] font-bold text-black/30 uppercase">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-black/5 border-b border-black/10 p-4 text-sm text-black focus:outline-none focus:border-black transition-all font-light tracking-widest"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:space-y-4">
                                            <label className="text-[9px] tracking-[0.4em] font-bold text-black/30 uppercase">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full bg-black/5 border-b border-black/10 p-4 text-sm text-black focus:outline-none focus:border-black transition-all font-light tracking-widest"
                                                placeholder="What are you interested in?"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[9px] tracking-[0.4em] font-bold text-black/30 uppercase">Your Message</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full bg-black/5 border-b border-black/10 p-4 text-sm text-black focus:outline-none focus:border-black transition-all font-light tracking-widest resize-none"
                                                placeholder="How can we help you create a legacy?"
                                            />
                                        </div>

                                        <button
                                            disabled={status === 'sending'}
                                            className="w-full h-16 bg-black text-white text-[10px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase hover:bg-black/90 transition-all duration-700 shadow-xl flex items-center justify-center relative overflow-hidden group px-2"
                                        >
                                            {status === 'sending' ? (
                                                <span className="animate-pulse">Entrusting...</span>
                                            ) : (
                                                <span className="relative z-10 flex items-center whitespace-nowrap">
                                                    Send Message <Send size={14} className="ml-2 md:ml-4 flex-shrink-0 transform group-hover:translate-x-2 transition-transform" />
                                                </span>
                                            )}
                                        </button>

                                        {status === 'error' && (
                                            <p className="text-red-600 text-[10px] tracking-widest uppercase text-center font-bold">Something went wrong. Please try again.</p>
                                        )}
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Contact;
