import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Truck, ShieldCheck, Clock, CreditCard, ShoppingBag } from 'lucide-react';
import SEO from '../components/SEO';
import { logClientActivity } from '../utils/clientLogger';

const Contact = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        logClientActivity('Opened contact page');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: '7b09bf9e-5d82-4987-8350-bb836992b949',
                    from_name: 'KIKS ULTRA LUXURY',
                    subject: 'New Website Inquiry',
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message
                }),
            });
            if (response.ok) {
                setStatus('success');
                setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="bg-white min-h-screen text-black font-sans selection:bg-black/10 selection:text-black overflow-hidden pt-20 md:pt-32">
            <SEO
                title="Contact Us | KIKS Ultra Luxury"
                description="Get in touch with KIKS Ultra Luxury. Contact our team for inquiries, custom orders, or customer support."
                keywords="Contact KIKS, Perfume Support, Luxury Fragrances Support"
            />

            {/* HERO BANNER */}
            <section className="relative w-full h-[300px] md:h-[400px] bg-neutral-50 flex items-center justify-center overflow-hidden">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    src="https://res.cloudinary.com/vl2wprzs/image/upload/v1785420133/arambh_colelction_coblfi.png"
                    alt="Contact Banner"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="relative z-10 text-center space-y-4"
                >
                    <h1 className="text-4xl md:text-5xl font-serif text-black">Contact Us</h1>
                    <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold text-black/60">
                        Home <span className="mx-2">/</span> Contact Us
                    </p>
                </motion.div>
            </section>

            {/* MAIN CONTACT SECTION */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                    {/* Left: Speak With Us */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="space-y-12"
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-black">Speak With Us</h2>
                            <p className="text-xs md:text-sm text-black/60 leading-relaxed font-light max-w-md">
                                Whether you have a question about our collections or want to inquire about a custom fragrance, we are here to assist you. Connect with KIKS Ultra Luxury.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
                            <div className="flex gap-4 items-start group cursor-default hover:-translate-y-1 transition-transform duration-300">
                                <MapPin className="w-5 h-5 text-black mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                                <div>
                                    <h3 className="text-sm font-bold text-black mb-2">Store Address</h3>
                                    <p className="text-[11px] text-black/60 leading-relaxed font-light group-hover:text-black transition-colors duration-300">
                                        Bhavnagar, Gujarat<br />
                                        India
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start group cursor-default hover:-translate-y-1 transition-transform duration-300">
                                <Phone className="w-5 h-5 text-black mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                                <div>
                                    <h3 className="text-sm font-bold text-black mb-2">Call Us</h3>
                                    <p className="text-[11px] text-black/60 leading-relaxed font-light group-hover:text-black transition-colors duration-300">
                                        +91 840 102 0339
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start group cursor-default hover:-translate-y-1 transition-transform duration-300">
                                <Mail className="w-5 h-5 text-black mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                                <div>
                                    <h3 className="text-sm font-bold text-black mb-2">Mail Us</h3>
                                    <p className="text-[11px] text-black/60 leading-relaxed font-light group-hover:text-black transition-colors duration-300">
                                        kiksultraluxury@gmail.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                <div>
                                    <h3 className="text-sm font-bold text-black mb-2">Instagram</h3>
                                    <p className="text-[11px] text-black/60 leading-relaxed font-light">
                                        <a href="https://www.instagram.com/kiksultraluxury?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="hover:text-black hover:underline transition-all">
                                            @kiksultraluxury
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-neutral-50 p-8 md:p-12 border border-black/5 hover:shadow-2xl transition-shadow duration-700"
                    >
                        <h2 className="text-2xl md:text-3xl font-serif mb-4 text-black">24/7 Support</h2>
                        <p className="text-xs text-black/60 leading-relaxed font-light mb-10">
                            Drop us a line and we will get back to you as soon as possible. Our team is dedicated to providing you with the best service.
                        </p>

                        <AnimatePresence mode="wait">
                            {status === 'success' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="py-12"
                                >
                                    <h3 className="text-2xl font-serif mb-4 text-black">Message Sent</h3>
                                    <p className="text-black/60 text-xs font-light leading-relaxed">
                                        Thank you for reaching out. We will respond shortly.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    onSubmit={handleSubmit}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full bg-white border border-black/10 px-6 py-4 text-xs text-black focus:outline-none focus:border-black transition-colors font-light placeholder:text-black/30"
                                            placeholder="First name"
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full bg-white border border-black/10 px-6 py-4 text-xs text-black focus:outline-none focus:border-black transition-colors font-light placeholder:text-black/30"
                                            placeholder="Last name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white border border-black/10 px-6 py-4 text-xs text-black focus:outline-none focus:border-black transition-colors font-light placeholder:text-black/30"
                                            placeholder="Email here"
                                        />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-white border border-black/10 px-6 py-4 text-xs text-black focus:outline-none focus:border-black transition-colors font-light placeholder:text-black/30"
                                            placeholder="Phone number"
                                        />
                                    </div>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-white border border-black/10 px-6 py-4 text-xs text-black focus:outline-none focus:border-black transition-colors font-light resize-none placeholder:text-black/30"
                                        placeholder="Additional message"
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="bg-black text-white px-10 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                                    >
                                        {status === 'sending' ? 'Sending...' : 'Send Message'}
                                    </button>
                                    {status === 'error' && (
                                        <p className="text-red-600 text-[10px] tracking-widest mt-4">Failed to send message. Try again.</p>
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="border-t border-black/5 bg-white py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col items-center group cursor-default hover:-translate-y-2 transition-transform duration-500">
                        <Truck className="w-8 h-8 text-black mb-4 stroke-[1] group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-sm font-serif mb-2 text-black">Timely Delivery</h4>
                        <p className="text-[10px] text-black/40 font-light max-w-[150px] group-hover:text-black/60 transition-colors duration-500">Ensuring your luxury reaches you perfectly on time.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center group cursor-default hover:-translate-y-2 transition-transform duration-500">
                        <ShoppingBag className="w-8 h-8 text-black mb-4 stroke-[1] group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-sm font-serif mb-2 text-black">Free Shipping</h4>
                        <p className="text-[10px] text-black/40 font-light max-w-[150px] group-hover:text-black/60 transition-colors duration-500">Complimentary shipping on all exclusive orders.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col items-center group cursor-default hover:-translate-y-2 transition-transform duration-500">
                        <Clock className="w-8 h-8 text-black mb-4 stroke-[1] group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-sm font-serif mb-2 text-black">24/7 Support</h4>
                        <p className="text-[10px] text-black/40 font-light max-w-[150px] group-hover:text-black/60 transition-colors duration-500">Dedicated concierge service available around the clock.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-col items-center group cursor-default hover:-translate-y-2 transition-transform duration-500">
                        <ShieldCheck className="w-8 h-8 text-black mb-4 stroke-[1] group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-sm font-serif mb-2 text-black">Secured Payment</h4>
                        <p className="text-[10px] text-black/40 font-light max-w-[150px] group-hover:text-black/60 transition-colors duration-500">Enterprise-grade encryption for all transactions.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex flex-col items-center group cursor-default hover:-translate-y-2 transition-transform duration-500">
                        <CreditCard className="w-8 h-8 text-black mb-4 stroke-[1] group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-sm font-serif mb-2 text-black">Safe Check Out</h4>
                        <p className="text-[10px] text-black/40 font-light max-w-[150px] group-hover:text-black/60 transition-colors duration-500">Your privacy and payment details are fully protected.</p>
                    </motion.div>
                </div>
            </section>

            {/* MAP SECTION */}
            <section className="w-full h-[400px] md:h-[500px] bg-neutral-100 border-t border-black/5">
                <iframe
                    src="https://maps.google.com/maps?q=Bhavnagar,Gujarat,India&t=&z=12&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </section>

        </div>
    );
};

export default Contact;
