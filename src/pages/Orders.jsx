import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Loader2, Package, Truck, CheckCircle, ChevronDown, ChevronUp, MapPin, Calendar, CreditCard, FileText, XCircle, AlertCircle } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import ActionLoader from '../components/ActionLoader';
import { generateInvoice } from '../utils/generateInvoice';
import { formatCurrency } from '../utils/currency';

const Orders = () => {
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useSelector(state => state.auth);
    const { activeCurrency, rates, symbols } = useSelector(state => state.currency);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = '/';
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

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you certain you wish to cancel this order? This action cannot be undone.')) return;
        
        setCancellingId(orderId);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                alert('Order cancelled successfully. Your refund (if applicable) will be processed shortly.');
                fetchOrders();
            } else {
                const data = await res.json();
                alert(data.msg || 'Failed to cancel order.');
            }
        } catch (err) {
            console.error("Cancellation error:", err);
            alert('A network error occurred. Please try again.');
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusIcon = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s.includes('deliver')) return <CheckCircle size={14} className="text-green-500" />;
        if (s.includes('transit') || s.includes('ship')) return <Truck size={14} className="text-gold-500" />;
        if (s.includes('cancel')) return <XCircle size={14} className="text-red-500" />;
        return <Package size={14} className="text-neutral-500" />;
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s.includes('deliver')) return 'text-green-500 border-green-500/20 bg-green-500/5';
        if (s.includes('transit') || s.includes('ship')) return 'text-gold-500 border-gold-500/20 bg-gold-500/5';
        if (s.includes('cancel')) return 'text-red-500 border-red-500/20 bg-red-500/5';
        return 'text-black/40 border-black/10 bg-black/5';
    };

    return (
        <div className="bg-white min-h-screen text-black pt-20 md:pt-36 pb-10 md:pb-40 font-sans">
            <ActionLoader isLoading={!!cancellingId} message="Preparing the Cancellation" />
            
            <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1400px]">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-8 md:mb-12">
                    <Link to="/account" className="inline-flex items-center text-[10px] tracking-[0.4em] text-black/30 hover:text-black transition-colors uppercase group">
                        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> BACK TO ACCOUNT
                    </Link>
                </motion.div>
            </div>

            <div className="max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="mb-8 md:mb-24 text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl md:text-5xl font-serif tracking-[0.2em] uppercase mb-4">Your Orders</h1>
                        <p className="text-[10px] tracking-[0.5em] text-black/20 uppercase font-black">History of your perfume purchases</p>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 className="w-6 h-6 animate-spin text-black/30" />
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 md:py-32 border border-black/5 bg-black/[0.01] backdrop-blur-sm"
                    >
                        <Package className="mx-auto text-black/10 mb-8" size={64} strokeWidth={1} />
                        <p className="text-[11px] tracking-[0.3em] uppercase text-black/40 mb-10 max-w-xs mx-auto leading-loose">You haven't placed any orders yet.</p>
                        <Link to="/collection" className="inline-block border border-black/20 px-12 py-5 text-[10px] font-bold tracking-[0.5em] uppercase hover:bg-black hover:text-white transition-all">
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
                                className="bg-white border border-neutral-200/80 rounded-sm overflow-hidden group hover:border-black/30 transition-all duration-300 shadow-sm"
                            >
                                {/* Order Summary Header - Optimized for Mobile */}
                                <div
                                    className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 cursor-pointer select-none bg-neutral-50/60 hover:bg-neutral-100/50 transition-colors"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    <div className="grid grid-cols-3 md:flex md:flex-row md:items-center gap-2 sm:gap-6 md:gap-12">
                                        <div className="space-y-1">
                                            <p className="text-[8px] md:text-[9px] tracking-widest font-bold text-neutral-400 uppercase">Order ID</p>
                                            <p className="text-[12px] sm:text-[13px] font-serif font-semibold text-black tracking-wider">#{order.id.toString().padStart(6, '0')}</p>
                                        </div>
                                        <div className="space-y-1 text-center md:text-left">
                                            <p className="text-[8px] md:text-[9px] tracking-widest font-bold text-neutral-400 uppercase">Ordered on</p>
                                            <p className="text-[11px] sm:text-xs font-sans text-neutral-700 font-medium tracking-wider">
                                                {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right md:text-left">
                                            <p className="text-[8px] md:text-[9px] tracking-widest font-bold text-neutral-400 uppercase">Total Amount</p>
                                            <p className="text-[12px] sm:text-[13px] font-bold tracking-wider text-black">
                                                {formatCurrency(order.total_amount, activeCurrency, rates, symbols)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-none border-neutral-200/60">
                                        <div className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border text-[9px] md:text-[10px] font-bold tracking-wider uppercase rounded-sm ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="truncate">
                                                {order.status === 'Payment Pending' ? 'Payment Not Completed' : (order.status || 'Verified')}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-neutral-300/80 flex items-center justify-center text-black bg-white group-hover:bg-black group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-xs">
                                            {expandedOrder === order.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-neutral-200/80 bg-white overflow-hidden"
                                        >
                                            <div className="p-4 sm:p-6 md:p-12 space-y-8 md:space-y-12">
                                                {/* Pieces Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                                                    <div className="w-full">
                                                        <h3 className="text-[10px] tracking-widest font-bold text-neutral-400 uppercase mb-5 flex items-center gap-2">
                                                            <ShoppingBag size={13} className="text-black" /> Items Ordered
                                                        </h3>
                                                        <div className="space-y-4 md:space-y-6">
                                                            {order.items?.map((item, idx) => {
                                                                const variantQuery = item.size || item.variantName || '';
                                                                const linkUrl = `/product/${item.slug || item.product_id}${variantQuery ? `?variant=${encodeURIComponent(variantQuery)}` : ''}`;
                                                                return (
                                                                <div key={idx} className="flex gap-4 items-start group/item p-3 rounded-sm border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                                                                    <Link 
                                                                        to={linkUrl}
                                                                        className="w-14 h-18 sm:w-16 sm:h-20 bg-neutral-200 rounded-xs overflow-hidden flex-shrink-0 relative cursor-pointer"
                                                                    >
                                                                        <img
                                                                            src={item.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'}
                                                                            alt={item.product_name}
                                                                            className="w-full h-full object-cover opacity-90 group-hover/item:scale-105 transition-all duration-300"
                                                                        />
                                                                    </Link>
                                                                    <div className="flex-grow min-w-0 py-1">
                                                                        <Link 
                                                                            to={linkUrl}
                                                                            className="block hover:text-neutral-600 transition-colors"
                                                                        >
                                                                            <h4 className="text-[12px] sm:text-[13px] font-serif font-bold tracking-wider uppercase mb-1 truncate cursor-pointer">{item.product_name}</h4>
                                                                        </Link>
                                                                        <p className="text-[10px] text-neutral-500 font-medium">Quantity: {item.quantity}</p>
                                                                        <p className="text-[11px] font-bold text-black mt-1.5">
                                                                            {formatCurrency(item.price, activeCurrency, rates, symbols)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );})}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-8">
                                                        {/* Delivery Info */}
                                                        <div>
                                                            <h3 className="text-[10px] tracking-widest font-bold text-neutral-400 uppercase mb-4 flex items-center gap-2">
                                                                <MapPin size={13} className="text-black" /> Delivery Address
                                                            </h3>
                                                            <div className="p-4 sm:p-6 border border-neutral-200 bg-neutral-50/60 rounded-sm space-y-2">
                                                                <p className="text-xs sm:text-sm font-bold text-black uppercase tracking-wide">{order.customer_name}</p>
                                                                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                                                                    {order.shipping_address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tracking / Footer Link */}
                                                <div className="pt-6 md:pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                                                    <div className="flex items-center justify-center md:justify-start gap-2 text-neutral-400 text-[10px] tracking-wider uppercase font-bold">
                                                        <CreditCard size={15} className="text-black" />
                                                        <span>Secure Payment Verification</span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center w-full md:w-auto">
                                                        {(order.status === 'Pending' || order.status === 'Processing' || !order.status || order.status === 'On Hold') && (
                                                            <button
                                                                disabled={cancellingId === order.id}
                                                                onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                                                                className="flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/5 px-6 py-3 text-[11px] sm:text-xs font-bold tracking-wider uppercase text-red-600 hover:bg-red-500/10 transition-all disabled:opacity-50 rounded-sm w-full sm:w-auto"
                                                            >
                                                                {cancellingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                                                <span>Cancel Order</span>
                                                            </button>
                                                        )}
                                                        <div className="flex items-center justify-center gap-2 bg-neutral-100 border border-neutral-200/80 px-5 py-3 text-[11px] sm:text-xs font-medium text-neutral-700 rounded-sm w-full sm:w-auto text-center">
                                                            <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider">Method:</span>
                                                            <span className="text-black font-semibold truncate">{order.payment_method || 'Prepaid'}</span>
                                                        </div>
                                                        {order.tracking_url && (
                                                            <a 
                                                                href={order.tracking_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="bg-black text-white px-8 py-3.5 text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-all text-center rounded-sm shadow-md w-full sm:w-auto flex items-center justify-center gap-2"
                                                            >
                                                                <Truck size={14} className="text-white" />
                                                                <span>Track Order</span>
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
