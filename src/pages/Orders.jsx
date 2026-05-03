import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Loader2, Package, Truck, CheckCircle, ChevronDown, ChevronUp, MapPin, Calendar, CreditCard, FileText } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import { generateInvoice } from '../utils/generateInvoice';
import { formatCurrency } from '../utils/currency';

const Orders = () => {
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useSelector(state => state.auth);
    const { activeCurrency, rates, symbols } = useSelector(state => state.currency);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, navigate]);

    const fetchOrders = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/orders/myorders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s.includes('deliver')) return <CheckCircle size={14} className="text-green-500" />;
        if (s.includes('transit') || s.includes('ship')) return <Truck size={14} className="text-gold-500" />;
        return <Package size={14} className="text-neutral-500" />;
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s.includes('deliver')) return 'text-green-500 border-green-500/20 bg-green-500/5';
        if (s.includes('transit') || s.includes('ship')) return 'text-gold-500 border-gold-500/20 bg-gold-500/5';
        return 'text-white/40 border-white/10 bg-white/5';
    };

    if (loading) {
        return (
            <div className="bg-black min-h-[60vh] flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="bg-[#050505] min-h-screen text-white pt-10 md:pt-48 pb-10 md:pb-40 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8 md:mb-24 text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <Link to="/account" className="inline-flex items-center text-[10px] tracking-[0.4em] text-white/30 hover:text-white transition-colors uppercase mb-12 group">
                            <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> BACK TO ACCOUNT
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-serif tracking-[0.2em] uppercase mb-4">Your Orders</h1>
                        <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase font-black italic">History of your perfume purchases</p>
                    </motion.div>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 md:py-32 border border-white/5 bg-white/[0.01] backdrop-blur-sm"
                    >
                        <Package className="mx-auto text-white/10 mb-8" size={64} strokeWidth={1} />
                        <p className="text-[11px] tracking-[0.3em] uppercase text-white/40 mb-10 max-w-xs mx-auto leading-loose">You haven't placed any orders yet.</p>
                        <Link to="/collection" className="inline-block border border-white/20 px-12 py-5 text-[10px] font-bold tracking-[0.5em] uppercase hover:bg-white hover:text-black transition-all">
                            Explore Collections
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-6 md:space-y-8">
                        {orders.map((order, idx) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-black border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-500"
                            >
                                {/* Order Summary Header */}
                                <div
                                    className="p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 cursor-pointer select-none"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                                        <div className="space-y-1">
                                            <p className="text-[9px] tracking-[0.4em] font-black text-white/20 uppercase">Order ID</p>
                                            <p className="text-[13px] font-serif tracking-widest uppercase">#{order.id.toString().padStart(6, '0')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] tracking-[0.4em] font-black text-white/20 uppercase">Ordered on</p>
                                            <p className="text-[11px] tracking-widest uppercase font-sans text-white/80">
                                                {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] tracking-[0.4em] font-black text-white/20 uppercase">Total Amount</p>
                                            <p className="text-[13px] font-bold tracking-widest text-gold-500">
                                                {formatCurrency(order.total_amount, activeCurrency, rates, symbols)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <div className={`flex items-center gap-2 px-4 py-2 border text-[9px] font-black tracking-[0.2em] uppercase ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status || 'Verified'}
                                        </div>
                                        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                                            {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="border-t border-white/5 bg-white/[0.01] overflow-hidden"
                                        >
                                            <div className="p-5 md:p-12 space-y-8 md:space-y-12">
                                                {/* Pieces Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 md:gap-y-12">
                                                    <div>
                                                        <h3 className="text-[10px] tracking-[0.5em] font-black text-white/30 uppercase mb-6 md:mb-8 flex items-center gap-2">
                                                            <ShoppingBag size={12} /> Items Ordered
                                                        </h3>
                                                        <div className="space-y-6 md:space-y-8">
                                                            {order.items?.map((item, idx) => (
                                                                <div key={idx} className="flex gap-6 items-center group/item">
                                                                    <div className="w-16 h-20 bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 relative">
                                                                        <img
                                                                            src={item.product_image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'}
                                                                            alt={item.product_name}
                                                                            className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition-opacity"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <h4 className="text-[12px] font-serif tracking-[0.1em] uppercase mb-1">{item.product_name}</h4>
                                                                        <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase font-black">Quantity {item.quantity}</p>
                                                                        <p className="text-[11px] font-bold tracking-widest text-gold-500 mt-2">
                                                                            {formatCurrency(item.price, activeCurrency, rates, symbols)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-12">
                                                        {/* Delivery Info */}
                                                        <div>
                                                            <h3 className="text-[10px] tracking-[0.5em] font-black text-white/30 uppercase mb-6 md:mb-8 flex items-center gap-2">
                                                                <MapPin size={12} /> Delivery Address
                                                            </h3>
                                                            <div className="p-6 md:p-8 border border-white/5 bg-black/40 space-y-4">
                                                                <p className="text-[11px] font-bold tracking-widest uppercase">{order.customer_name}</p>
                                                                <p className="text-[11px] tracking-[0.1em] text-white/50 leading-loose uppercase italic">
                                                                    {order.shipping_address}
                                                                </p>
                                                            </div>
                                                        </div>


                                                        {/* Optional Gifting Details */}
                                                        {order.is_gift && (
                                                            <div className="border border-gold-500/20 bg-gold-500/5 p-6 space-y-4">
                                                                <h3 className="text-[9px] tracking-[0.5em] font-black text-gold-500 uppercase flex items-center gap-2">
                                                                    <CheckCircle size={12} /> Complimentary Gifting
                                                                </h3>
                                                                <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase leading-loose">
                                                                    Wrapped in premium gift packaging.
                                                                </p>
                                                                {order.gift_note && (
                                                                    <div className="pt-4 border-t border-gold-500/10">
                                                                        <p className="text-[8px] tracking-[0.4em] font-black text-white/30 uppercase mb-2">Personalized Note</p>
                                                                        <p className="text-[11px] tracking-widest font-serif text-white/80 italic">"{order.gift_note}"</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Tracking / Footer Link */}
                                                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                                                    <div className="flex items-center gap-6 opacity-30">
                                                        <CreditCard size={16} />
                                                        <span className="text-[9px] tracking-[0.4em] uppercase font-black">Secure Payment</span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                                                        <div className="flex items-center gap-2 border border-white/20 px-8 py-4 text-[10px] font-black tracking-[0.4em] uppercase text-white/60">
                                                            <span>Payment:</span>
                                                            <span className="text-white">{order.payment_method || 'Prepaid'}</span>
                                                        </div>
                                                        {order.tracking_url && (
                                                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="bg-white text-black px-12 py-4 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-gold-500 transition-all text-center">
                                                                Track Order
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
