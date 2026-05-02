import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Layers, FileText, Settings, LogOut, Search,
    Plus, Trash2, Edit3, Save, X, Eye, EyeOff, CheckCircle, Package, Truck, AlertCircle,
    User, Mail, Phone, MapPin, Calendar, Clock, ArrowRight, Download, Filter, Star, Loader2, Users, Smartphone,
    FileSpreadsheet, ClipboardCheck, Layout, ArrowLeft, Sparkles, CheckCircle2, Upload, ImageIcon,
    TrendingUp, DollarSign, ClipboardList, PackageCheck, ReceiptText, Ticket, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { generateInvoice } from '../utils/generateInvoice';
import { getFullImageUrl } from '../utils/url';
import PageLoader from '../components/PageLoader';
import { formatCurrency } from '../utils/currency';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Admin = () => {
    const { user, isAuthenticated, token } = useSelector((state) => state.auth);
    const { activeCurrency, rates, symbols } = useSelector(state => state.currency);
    const navigate = useNavigate();

    // Standardized Auth Headers for the Palace Vault
    const getAdminHeaders = () => ({
        'Content-Type': 'application/json',
        'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET,
        'Authorization': `Bearer ${token}`
    });
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, collections, products, blogs, marketing
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [collections, setCollections] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderSubTab, setOrderSubTab] = useState('onhold'); // onhold, processing, delivered, rto, returned
    const [reportType, setReportType] = useState('selling'); // selling, return
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [userSubTab, setUserSubTab] = useState('users'); // users, admins
    const [waitlist, setWaitlist] = useState([]);
    const [promoCodes, setPromoCodes] = useState([]);
    const [analytics, setAnalytics] = useState({ totalOrders: 0, totalRevenue: 0, bestSeller: 'N/A' });
    const [selectedWaitlistIds, setSelectedWaitlistIds] = useState([]);
    const [downloadedHistory, setDownloadedHistory] = useState({ invoices: [], labels: [] });
    const [carts, setCarts] = useState([]);

    // Marketing States
    const [popupSettings, setPopupSettings] = useState({ is_active: true, title: '', offer_text: '', image_url: '', delay_seconds: 5, redirect_url: '' });
    const [communityGallery, setCommunityGallery] = useState([]);
    const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);

    // Section Loading States for Lazy Loading
    const [tabsLoading, setTabsLoading] = useState({
        dashboard: false,
        orders: false,
        collections: false,
        products: false,
        blogs: false,
        reviews: false,
        users: false,
        waitlist: false,
        'promo-codes': false,
        marketing: false,
        admins: false,
        carts: false
    });

    // Form states
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null); // Tracks if we are editing an existing item

    const [colFormData, setColFormData] = useState({ name: '', slug: '', banner_url: '', description: '' });
    const [prodFormData, setProdFormData] = useState({
        collection_id: '', name: '', slug: '', price: '', image_url: '', gallery_urls: [],
        description: '', top_notes: '', heart_notes: '', base_notes: '', stock_count: 50,
        size: '100ml', variants: [],
        muse_story: '', muse_image: '', story_banner: '',
        top_note_icon: '', heart_note_icon: '', base_note_icon: '',
        top_note_label: '', heart_note_label: '', base_note_label: '',
        product_type: 'EXTRAIT DE PARFUM SPRAY'
    });
    const [blogFormData, setBlogFormData] = useState({ title: '', slug: '', content: '', image_url: '', keywords: '', author: 'Kiks Artisan' });
    const [promoFormData, setPromoFormData] = useState({
        code: '', discount_type: 'percentage', discount_value: '',
        min_order_amount: '', max_discount: '', expiry_date: '', usage_limit: ''
    });
    const [adminFormData, setAdminFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
    const [userSearch, setUserSearch] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const fileInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const formRef = useRef(null);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    useEffect(() => {
        const isAdmin = user && (
            user.role === 'admin' ||
            user.email === 'hit.goyani1010@gmail.com' ||
            user.email.endsWith('@kiksultraluxury.com') ||
            user.email === 'admin@kiks.com'
        );

        if (!isAuthenticated || !isAdmin) {
            navigate('/');
            return;
        }

        // Initial Data needed for baseline
        fetchBaseData();
        fetchWaitlistData();
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Fetch specific data based on active tab
        switch (activeTab) {
            case 'dashboard': fetchDashboardData(); break;
            case 'orders': fetchOrdersData(); break;
            case 'collections': fetchCollectionsData(); break;
            case 'products': fetchProductsData(); break;
            case 'blogs': fetchBlogsData(); break;
            case 'reviews': fetchReviewsData(); break;
            case 'users': fetchUsersData(); break;
            case 'waitlist': fetchWaitlistData(); break;
            case 'promo-codes': fetchPromoCodesData(); break;
            case 'marketing': fetchMarketingData(); break;
            case 'carts': fetchCartsData(); break;
            default: fetchDashboardData();
        }
    }, [activeTab, isAuthenticated]);

    const setTabLoading = (tab, val) => {
        setTabsLoading(prev => ({ ...prev, [tab]: val }));
    };

    const showSuccessToast = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const showErrorToast = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(''), 5000);
    };

    const fetchBaseData = async () => {
        setLoading(true);
        try {
            const [colRes, prodRes] = await Promise.all([
                fetch(`${API_URL}/api/collections`),
                fetch(`${API_URL}/api/products`)
            ]);
            if (colRes.ok) setCollections(await colRes.json());
            if (prodRes.ok) setProducts(await prodRes.json());
        } catch (e) {
            console.error("Base fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        setTabLoading('dashboard', true);
        try {
            const [anRes, prodRes] = await Promise.all([
                fetch(`${API_URL}/api/orders/analytics`, { headers: getAdminHeaders() }),
                fetch(`${API_URL}/api/products`)
            ]);
            if (anRes.ok) setAnalytics(await anRes.json());
            if (prodRes.ok) setProducts(await prodRes.json());
        } catch (e) { console.error("Dashboard fetch failed", e); }
        finally { setTabLoading('dashboard', false); }
    };

    const fetchOrdersData = async () => {
        setTabLoading('orders', true);
        try {
            const res = await fetch(`${API_URL}/api/orders`, { headers: getAdminHeaders() });
            if (res.ok) {
                setOrders(await res.json());
                setSelectedOrders([]); // Clear selection when data reloads
            }
        } catch (e) { console.error("Orders fetch failed", e); }
        finally { setTabLoading('orders', false); }
    };

    const fetchCollectionsData = async () => {
        setTabLoading('collections', true);
        try {
            const res = await fetch(`${API_URL}/api/collections`);
            if (res.ok) setCollections(await res.json());
        } catch (e) { console.error("Collections fetch failed", e); }
        finally { setTabLoading('collections', false); }
    };

    const fetchProductsData = async () => {
        setTabLoading('products', true);
        try {
            const res = await fetch(`${API_URL}/api/products`);
            if (res.ok) setProducts(await res.json());
        } catch (e) { console.error("Products fetch failed", e); }
        finally { setTabLoading('products', false); }
    };

    const fetchBlogsData = async () => {
        setTabLoading('blogs', true);
        try {
            const res = await fetch(`${API_URL}/api/blogs`);
            if (res.ok) setBlogs(await res.json());
        } catch (e) { console.error("Blogs fetch failed", e); }
        finally { setTabLoading('blogs', false); }
    };

    const fetchReviewsData = async () => {
        setTabLoading('reviews', true);
        try {
            const res = await fetch(`${API_URL}/api/reviews/admin`, { headers: getAdminHeaders() });
            if (res.ok) setReviews(await res.json());
        } catch (e) { console.error("Reviews fetch failed", e); }
        finally { setTabLoading('reviews', false); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to remove this user from the registry? This action is permanent.')) return;
        try {
            const res = await fetch(`${API_URL}/api/users/${id}`, {
                method: 'DELETE',
                headers: getAdminHeaders()
            });
            if (res.ok) {
                showSuccessToast('User removed successfully.');
                fetchUsersData();
            } else {
                const data = await res.json();
                showErrorToast(data.msg || 'User deletion failed.');
            }
        } catch (e) {
            console.error("User delete failed", e);
            showErrorToast('System error during deletion.');
        }
    };

    const fetchCartsData = async () => {
        setTabLoading('carts', true);
        try {
            const res = await fetch(`${API_URL}/api/carts/all`, { headers: getAdminHeaders() });
            if (res.ok) setCarts(await res.json());
        } catch (e) { console.error("Carts fetch failed", e); }
        finally { setTabLoading('carts', false); }
    };

    const fetchWaitlistData = async () => {
        setTabsLoading(prev => ({ ...prev, waitlist: true }));
        try {
            const res = await fetch(`${API_URL}/api/waitlist`, {
                headers: getAdminHeaders()
            });
            if (res.ok) {
                setWaitlist(await res.json());
            } else {
                showErrorToast('Waitlist vault access denied.');
            }
        } catch (e) {
            console.error("Waitlist fetch failed", e);
            showErrorToast('Failed to retrieve waitlist manifest.');
        } finally {
            setTabsLoading(prev => ({ ...prev, waitlist: false }));
        }
        setSelectedWaitlistIds([]);
    };

    const fetchPromoCodesData = async () => {
        setTabLoading('promo-codes', true);
        try {
            const res = await fetch(`${API_URL}/api/promo-codes`, { headers: getAdminHeaders() });
            if (res.ok) setPromoCodes(await res.json());
        } catch (e) { console.error("Promo codes fetch failed", e); }
        finally { setTabLoading('promo-codes', false); }
    };

    const handleDownloadMonthlyReport = (selectedMonth, selectedYear, type = 'selling') => {
        const now = new Date();
        const targetMonth = selectedMonth !== undefined ? selectedMonth : now.getMonth();
        const targetYear = selectedYear !== undefined ? selectedYear : now.getFullYear();

        let filteredOrders = orders.filter(o => {
            const date = new Date(o.created_at);
            return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
        });

        if (type === 'return') {
            filteredOrders = filteredOrders.filter(o => o.status === 'RTO Returned' || o.status === 'Customer Returned');
        } else {
            // Selling report: basically all except those marked as returned? 
            // Or just all orders? Usually selling report includes all orders placed.
            // The user said "selling monthly report and return monthly report".
            // Let's make selling report include all except returns, or keep it as is.
            // I'll keep selling as all orders, and return as only returned ones.
            filteredOrders = filteredOrders.filter(o => o.status !== 'RTO Returned' && o.status !== 'Customer Returned');
        }

        if (filteredOrders.length === 0) {
            return showErrorToast(`No ${type} records detected in the selected registry month.`);
        }

        const data = filteredOrders.map(o => ({
            "Order ID": `#${o.id.toString().padStart(4, '0')}`,
            "Date": new Date(o.created_at).toLocaleDateString(),
            "Customer": o.customer_name,
            "Email": o.customer_email,
            "Phone": o.customer_phone || 'N/A',
            "Items": o.items?.map(it => `${it.product_name} (x${it.quantity})`).join(', '),
            "Total Price": o.total_amount,
            "Status": o.status || 'Pending',
            "Payment": o.payment_method
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, type === 'selling' ? "Monthly Sales" : "Monthly Returns");
        const monthName = new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long' });
        const fileName = `KIKS_Monthly_${type === 'selling' ? 'Sales' : 'Returns'}_${monthName}_${targetYear}.xlsx`;
        XLSX.writeFile(wb, fileName);
        showSuccessToast(`${monthName} ${type === 'selling' ? 'Sales' : 'Returns'} Manifest exported to Excel.`);
    };

    const fetchMarketingData = async () => {
        setTabLoading('marketing', true);
        try {
            const [popupRes, galleryRes, subRes] = await Promise.all([
                fetch(`${API_URL}/api/marketing/popup`),
                fetch(`${API_URL}/api/marketing/gallery`),
                fetch(`${API_URL}/api/newsletter/admin/list`, { headers: getAdminHeaders() })
            ]);
            if (popupRes.ok) setPopupSettings(await popupRes.json());
            if (galleryRes.ok) setCommunityGallery(await galleryRes.json());
            if (subRes.ok) setNewsletterSubscribers(await subRes.json());
        } catch (e) { console.error("Marketing fetch failed", e); }
        finally { setTabLoading('marketing', false); }
    };

    const handleUpdatePopup = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/marketing/popup`, {
                method: 'PUT',
                headers: getAdminHeaders(),
                body: JSON.stringify(popupSettings)
            });
            if (res.ok) showSuccessToast('Popup settings updated.');
            else showErrorToast('Failed to update popup.');
        } catch (e) { showErrorToast('Network error.'); }
    };

    const handleAddGalleryImage = async (url) => {
        try {
            const res = await fetch(`${API_URL}/api/marketing/gallery`, {
                method: 'POST',
                headers: getAdminHeaders(),
                body: JSON.stringify({ image_url: url, display_order: communityGallery.length })
            });
            if (res.ok) {
                showSuccessToast('Image added to gallery.');
                fetchMarketingData();
            }
        } catch (e) { showErrorToast('Failed to add image.'); }
    };

    const handleDeleteGalleryImage = async (id) => {
        if (!window.confirm('Remove this image from community gallery?')) return;
        try {
            const res = await fetch(`${API_URL}/api/marketing/gallery/${id}`, {
                method: 'DELETE',
                headers: getAdminHeaders()
            });
            if (res.ok) {
                showSuccessToast('Image removed.');
                fetchMarketingData();
            }
        } catch (e) { showErrorToast('Delete failed.'); }
    };

    const handleDownloadExcel = (productName, entries) => {
        const selectedEntries = entries.filter(e => selectedWaitlistIds.includes(e.id));
        if (selectedEntries.length === 0) {
            alert('Please select at least one client to export.');
            return;
        }

        const data = selectedEntries.map(e => ({
            'Full Name': e.customer_name,
            'Email Address': e.email,
            'Mobile Number': e.phone,
            'Requested Date': new Date(e.created_at).toLocaleDateString(),
            'Product': productName
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Waitlist");

        const fileName = `${productName.replace(/\s+/g, '_')}_Waitlist_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const fetchUsersData = async () => {
        setTabLoading('users', true);
        try {
            const res = await fetch(`${API_URL}/api/users`, { headers: getAdminHeaders() });
            if (res.ok) {
                setUsers(await res.json());
            } else {
                const data = await res.json();
                showErrorToast(data.msg || 'Unauthorized profile access.');
            }
        } catch (e) {
            console.error("Users fetch failed", e);
            showErrorToast('Registry synchronization fault.');
        } finally {
            setTabLoading('users', false);
        }
    };

    const fetchAdminsData = async () => {
        setTabLoading('admins', true);
        try {
            const res = await fetch(`${API_URL}/api/users/admins`, { headers: getAdminHeaders() });
            if (res.ok) setAdmins(await res.json());
        } catch (e) { console.error("Admins fetch failed", e); }
        finally { setTabLoading('admins', false); }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/users/admins`, {
                method: 'POST',
                headers: getAdminHeaders(),
                body: JSON.stringify(adminFormData)
            });
            if (res.ok) {
                showSuccessToast('New Administrator Registered Successfully.');
                setAdminFormData({ email: '', password: '', firstName: '', lastName: '' });
                setIsAdding(false);
                fetchAdminsData();
            } else {
                const data = await res.json();
                showErrorToast(data.msg || 'Failed to register administrator.');
            }
        } catch (e) { showErrorToast('Server communication fault.'); }
    };

    // Keep legacy fetchData for backward compatibility in actions if needed, or point them to specific ones
    const fetchData = () => {
        const tab = activeTab;
        if (tab === 'dashboard') fetchDashboardData();
        else if (tab === 'orders') fetchOrdersData();
        else if (tab === 'users') { fetchUsersData(); fetchAdminsData(); }
        else if (tab === 'collections') fetchCollectionsData();
        else if (tab === 'products') fetchProductsData();
        else if (tab === 'blogs') fetchBlogsData();
        else if (tab === 'reviews') fetchReviewsData();
        else if (tab === 'waitlist') fetchWaitlistData();
        else if (tab === 'promo-codes') fetchPromoCodesData();
    };

    const handleImageUpload = async (e, targetField = null) => {
        const file = e.target.files[0] || (e.dataTransfer && e.dataTransfer.files[0]);
        if (!file) return;

        setUploading(true);
        setErrorMessage('');
        const formData = new FormData();
        formData.append('image', file);

        try {
            // Use environment secret for authentication
            const secret = import.meta.env.VITE_ADMIN_SECRET;

            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'x-admin-secret': secret },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                showErrorToast(errorData.msg || 'Palace vault rejected the asset.');
                return;
            }

            const data = await res.json();
            showSuccessToast('Visual Architecture Manifested.');
            if (targetField === 'popup') {
                setPopupSettings(prev => ({ ...prev, image_url: data.url }));
            } else if (targetField) {
                setProdFormData(prev => ({ ...prev, [targetField]: data.url }));
            } else if (activeTab === 'collections') {
                setColFormData(prev => ({ ...prev, banner_url: data.url }));
            } else if (activeTab === 'products') {
                setProdFormData(prev => ({ ...prev, image_url: data.url }));
            } else if (activeTab === 'blogs') {
                setBlogFormData(prev => ({ ...prev, image_url: data.url }));
            }
        } catch (error) {
            console.error("Critical Visual Sync Fault:", error);
            showErrorToast('Network Fault: Ensure the Palace Vault (Backend) is active.');
        } finally {
            setUploading(false);
        }
    };

    const isVideo = (url) => {
        if (!url) return false;
        return url.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/);
    };

    const ImageUploadZone = ({ label, value, onUpload, height = "h-40" }) => (
        <div className="w-full">
            <label className="text-[9px] tracking-[0.3em] font-black uppercase text-white/40 mb-3 block">{label}</label>
            <div
                onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg';
                    input.onchange = onUpload;
                    input.click();
                }}
                className={`relative w-full ${height} border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold-500/50 transition-all cursor-pointer group overflow-hidden flex flex-col items-center justify-center`}
            >
                {value ? (
                    <>
                        {isVideo(value) ? (
                            <video src={getFullImageUrl(value)} className="w-full h-full object-cover opacity-60" muted loop autoPlay />
                        ) : (
                            <img src={getFullImageUrl(value)} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <span className="bg-white text-black px-4 py-1 text-[8px] font-black tracking-widest uppercase">Replace Asset</span>
                        </div>
                    </>
                ) : (
                    <>
                        <Upload size={24} className="text-white/10 group-hover:text-gold-500 transition-colors mb-2" />
                        <span className="text-[8px] tracking-[0.2em] uppercase text-white/20 group-hover:text-white/40">Direct Upload</span>
                    </>
                )}
            </div>
            {value && <p className="text-[7px] text-white/20 mt-2 truncate max-w-full italic">{value}</p>}
        </div>
    );

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingGallery(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET },
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                showSuccessToast('Gallery Asset Appended.');
                setProdFormData(prev => ({ ...prev, gallery_urls: [...(prev.gallery_urls || []), data.url] }));
            } else {
                showErrorToast('Upload failed.');
            }
        } catch (error) {
            showErrorToast('Network error during upload.');
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleAddCollection = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!colFormData.banner_url) {
            return showErrorToast('Please upload a visual banner first.');
        }

        setUploading(true);
        try {
            const url = editingId
                ? `${API_URL}/api/collections/${editingId}`
                : `${API_URL}/api/collections`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: getAdminHeaders(),
                body: JSON.stringify(colFormData)
            });

            const data = await res.json();
            if (res.ok) {
                showSuccessToast(`Mansion Collection ${editingId ? 'Updated' : 'Registered'} Successfully.`);
                setIsAdding(false);
                setEditingId(null);
                setColFormData({ name: '', slug: '', banner_url: '', description: '' });
                fetchData();
            } else {
                showErrorToast(data.msg || 'Registry update failed.');
            }
        } catch (error) {
            showErrorToast('Operation failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!prodFormData.image_url) {
            return showErrorToast('Please upload a product visual first.');
        }

        setUploading(true);
        try {
            const url = editingId
                ? `${API_URL}/api/products/${editingId}`
                : `${API_URL}/api/products`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: getAdminHeaders(),
                body: JSON.stringify(prodFormData)
            });
            const data = await res.json();
            if (res.ok) {
                showSuccessToast(`Product ${editingId ? 'Modified in' : 'Manifested into'} the Vault.`);
                setIsAdding(false);
                setEditingId(null);
                setProdFormData({
                    collection_id: '', name: '', slug: '', price: '', image_url: '', gallery_urls: [],
                    description: '', top_notes: '', heart_notes: '', base_notes: '', stock_count: 50,
                    size: '100ml', variants: [],
                    muse_story: '', muse_image: '', story_banner: '',
                    top_note_icon: '', heart_note_icon: '', base_note_icon: '',
                    top_note_label: '', heart_note_label: '', base_note_label: '',
                    product_type: 'EXTRAIT DE PARFUM SPRAY'
                });
                fetchData();
            } else {
                showErrorToast(data.msg || 'Product manifestation failed.');
            }
        } catch (error) {
            showErrorToast('Operation failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleAddBlog = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        setUploading(true);
        try {
            const url = editingId
                ? `${API_URL}/api/blogs/${editingId}`
                : `${API_URL}/api/blogs`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: getAdminHeaders(),
                body: JSON.stringify(blogFormData)
            });
            const data = await res.json();
            if (res.ok) {
                showSuccessToast(`Blog ${editingId ? 'Modified' : 'Published'} in the Journal.`);
                setIsAdding(false);
                setEditingId(null);
                setBlogFormData({ title: '', slug: '', content: '', image_url: '', keywords: '', author: 'Kiks Artisan' });
                fetchData();
            } else {
                showErrorToast(data.msg || 'Blog publication failed.');
            }
        } catch (error) {
            showErrorToast('Operation failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleAddPromoCode = async (e) => {
        e.preventDefault();
        try {
            const url = editingId ? `${API_URL}/api/promo-codes/${editingId}` : `${API_URL}/api/promo-codes`;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: getAdminHeaders(),
                body: JSON.stringify(promoFormData)
            });
            const data = await res.json();
            if (res.ok) {
                showSuccessToast(`Promo Code ${editingId ? 'Modified' : 'Created'} Successfully.`);
                setIsAdding(false);
                setEditingId(null);
                setPromoFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', expiry_date: '', usage_limit: '' });
                fetchPromoCodesData();
            } else {
                showErrorToast(data.msg || 'Action failed.');
            }
        } catch (error) {
            console.error('Promo Code Error:', error);
            showErrorToast('Operation failed.');
        }
    };


    const handleOrderStatusUpdate = async (orderId, newStatus) => {
        try {
            let trackingUrl = null;
            if (newStatus === 'Dispatched') {
                trackingUrl = window.prompt("Enter the Courier Tracking Link for Order #" + orderId + "\n(Leave blank if you don't have one yet):");
                if (trackingUrl === null) return; // Admin cancelled the status update
            }

            const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: getAdminHeaders(),
                body: JSON.stringify({ status: newStatus, tracking_url: trackingUrl })
            });

            if (res.ok) {
                showSuccessToast(`Order #${orderId} status updated to ${newStatus}.`);
                if (newStatus === 'Dispatched') {
                    showSuccessToast(`Automated Dispatch Email sent to Customer!`);
                }
                fetchData();
            } else {
                showErrorToast('Failed to update order status.');
            }
        } catch (error) {
            showErrorToast('Network error updating status.');
        }
    };

    const handleBulkStatusUpdate = async (idsToUpdate, newStatus) => {
        const targetIds = Array.isArray(idsToUpdate) ? idsToUpdate : selectedOrders;
        if (!targetIds || targetIds.length === 0) return;

        try {
            const res = await fetch(`${API_URL}/api/orders/bulk-status`, {
                method: 'POST',
                headers: getAdminHeaders(),
                body: JSON.stringify({ ids: targetIds, status: newStatus })
            });

            if (res.ok) {
                showSuccessToast(`${targetIds.length} orders updated to ${newStatus}.`);
                setSelectedOrders(selectedOrders.filter(id => !targetIds.includes(id)));
                fetchOrdersData();
            } else {
                showErrorToast('Failed to update orders in bulk.');
            }
        } catch (error) {
            showErrorToast('Network error during bulk update.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to permanently delete this order? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: getAdminHeaders()
            });
            if (res.ok) {
                showSuccessToast('Order deleted in real time.');
                fetchOrdersData();
            } else {
                showErrorToast('Failed to delete order.');
            }
        } catch (error) {
            showErrorToast('Network error during deletion.');
        }
    };

    const handleBulkInvoice = (idsToInvoice) => {
        const targetIds = Array.isArray(idsToInvoice) ? idsToInvoice : selectedOrders;
        // Only invoice accepted/dispatched/delivered orders
        const selected = orders.filter(o => targetIds.includes(o.id) && o.status !== 'On Hold');
        if (selected.length === 0) return showErrorToast('No accepted orders selected for invoice.');

        const alreadyDownloaded = selected.filter(o => downloadedHistory.invoices.includes(o.id));
        if (alreadyDownloaded.length > 0) {
            if (!window.confirm(`${alreadyDownloaded.length} of your selected orders have already had their invoices downloaded. Download again?`)) return;
        }

        generateInvoice(selected);
        setDownloadedHistory(prev => ({
            ...prev,
            invoices: [...new Set([...prev.invoices, ...selected.map(o => o.id)])]
        }));
    };

    const handleBulkLabel = (idsToLabel) => {
        const targetIds = Array.isArray(idsToLabel) ? idsToLabel : selectedOrders;
        const selected = orders.filter(o => targetIds.includes(o.id) && o.status !== 'On Hold');
        if (selected.length === 0) return showErrorToast('No accepted orders selected for shipping labels.');

        const alreadyDownloaded = selected.filter(o => downloadedHistory.labels.includes(o.id));
        if (alreadyDownloaded.length > 0) {
            if (!window.confirm(`${alreadyDownloaded.length} of your selected orders already have their shipping labels downloaded. Download again?`)) return;
        }

        generateShippingLabel(selected);
        setDownloadedHistory(prev => ({
            ...prev,
            labels: [...new Set([...prev.labels, ...selected.map(o => o.id)])]
        }));
    };

    const handleOrderInvoiceDownload = (order) => {
        if (downloadedHistory.invoices.includes(order.id)) {
            if (!window.confirm(`Invoice for #${order.id.toString().padStart(4, '0')} already downloaded. Download again?`)) return;
        }
        generateInvoice(order);
        setDownloadedHistory(prev => ({
            ...prev,
            invoices: [...new Set([...prev.invoices, order.id])]
        }));
    };

    const handleOrderLabelDownload = (order) => {
        if (downloadedHistory.labels.includes(order.id)) {
            if (!window.confirm(`Shipping Label for #${order.id.toString().padStart(4, '0')} already downloaded. Download again?`)) return;
        }
        generateShippingLabel(order);
        setDownloadedHistory(prev => ({
            ...prev,
            labels: [...new Set([...prev.labels, order.id])]
        }));
    };

    const handleBulkDelete = async (idsToDelete) => {
        const targetIds = Array.isArray(idsToDelete) ? idsToDelete : selectedOrders;
        if (!targetIds || targetIds.length === 0) return;

        if (!window.confirm(`Permanently delete ${targetIds.length} selected order(s)? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_URL}/api/orders/bulk-delete`, {
                method: 'POST', // Changed to POST for safety with bodies in some environments, though DELETE works too. Backend is currently POST for bulk-delete.
                headers: getAdminHeaders(),
                body: JSON.stringify({ ids: targetIds })
            });
            if (res.ok) {
                showSuccessToast(`${targetIds.length} order(s) deleted successfully.`);
                setSelectedOrders(selectedOrders.filter(id => !targetIds.includes(id)));
                fetchOrdersData();
            } else {
                showErrorToast('Bulk deletion failed.');
            }
        } catch (e) {
            showErrorToast('Network error during bulk deletion.');
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await fetch(`${API_URL}/api/reviews/${id}`, {
                method: 'DELETE',
                headers: getAdminHeaders()
            });
            if (res.ok) {
                showSuccessToast('Review removed from history.');
                fetchReviewsData();
            } else {
                showErrorToast('Review deletion failed.');
            }
        } catch (e) {
            showErrorToast('Network error during review deletion.');
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        if (isNaN(newStock)) return;

        try {
            const res = await fetch(`${API_URL}/api/products/${id}/stock`, {
                method: 'PATCH',
                headers: getAdminHeaders(),
                body: JSON.stringify({ stock_count: newStock })
            });

            if (res.ok) {
                showSuccessToast('Inventory updated!');
                fetchData();
            } else {
                const data = await res.json();
                showErrorToast(data.msg || 'Vault update rejected.');
            }
        } catch (error) {
            console.error("Stock update network error:", error);
            showErrorToast('Network Fault: Unable to reach the vault.');
        }
    };

    const handleEdit = (type, item) => {
        setIsAdding(true);
        setEditingId(item.id);

        if (type === 'collections') {
            setColFormData({
                name: item.name,
                slug: item.slug,
                banner_url: item.banner_url,
                description: item.description
            });
        } else if (type === 'products') {
            setProdFormData({
                collection_id: item.collection_id,
                name: item.name,
                slug: item.slug,
                price: item.price,
                image_url: item.image_url,
                gallery_urls: item.gallery_urls || [],
                description: item.description,
                top_notes: item.top_notes || '',
                heart_notes: item.heart_notes || '',
                base_notes: item.base_notes || '',
                stock_count: item.stock_count !== undefined ? item.stock_count : 50,
                size: item.size || '100ml',
                variants: item.variants || [],
                muse_story: item.muse_story || '',
                muse_image: item.muse_image || '',
                story_banner: item.story_banner || '',
                top_note_icon: item.top_note_icon || '',
                heart_note_icon: item.heart_note_icon || '',
                base_note_icon: item.base_note_icon || '',
                top_note_label: item.top_note_label || '',
                heart_note_label: item.heart_note_label || '',
                base_note_label: item.base_note_label || '',
                product_type: item.product_type || 'EXTRAIT DE PARFUM SPRAY'
            });
        } else if (type === 'blogs') {
            setBlogFormData({
                title: item.title,
                content: item.content,
                image_url: item.image_url,
                keywords: item.keywords || '',
                slug: item.slug || '',
                author: item.author || 'Kiks Artisan'
            });
        } else if (type === 'promo-codes') {
            setPromoFormData({
                code: item.code,
                discount_type: item.discount_type,
                discount_value: item.discount_value,
                min_order_amount: item.min_order_amount || '',
                max_discount: item.max_discount || '',
                expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : '',
                usage_limit: item.usage_limit || ''
            });
        }

        // Scroll smoothly to form smoothly
        setTimeout(() => {
            if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to remove this ${type}?`)) return;

        try {
            const res = await fetch(`${API_URL}/api/${type}/${id}`, {
                method: 'DELETE',
                headers: getAdminHeaders()
            });
            if (res.ok) {
                showSuccessToast('Item removed.');
                fetchData();
            }
        } catch (error) {
            showErrorToast('Deletion failed.');
        }
    };

    const handleAddVariantField = () => {
        setProdFormData(prev => ({
            ...prev,
            variants: [...(prev.variants || []), { size: '', price: '', stock: '' }]
        }));
    };

    const handleUpdateVariant = (index, field, value) => {
        const updated = [...prodFormData.variants];
        updated[index] = { ...updated[index], [field]: value };
        setProdFormData(prev => ({ ...prev, variants: updated }));
    };

    const handleRemoveVariant = (index) => {
        setProdFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    if (loading && collections.length === 0) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    const inputClasses = "w-full bg-white/5 border border-white/10 p-3 md:p-4 text-[10px] md:text-xs text-white focus:outline-none focus:border-gold-500 transition-all font-light tracking-[0.1em] md:tracking-[0.2em] mb-4";
    const labelClasses = "text-[9px] tracking-[0.3em] font-bold text-white/30 uppercase block mb-1 mt-2";

    return (
        <div className="bg-black min-h-screen text-white pt-40 pb-20 px-6 lg:px-20 overflow-x-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/5 blur-[150px] rounded-full pointer-events-none" />

            {/* NOTIFICATIONS */}
            <div className="fixed bottom-10 right-10 z-[100] flex flex-col space-y-4">
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className="bg-zinc-900 border border-gold-500/50 p-6 flex items-center space-x-4 shadow-2xl backdrop-blur-xl"
                        >
                            <CheckCircle2 className="text-gold-500" size={20} />
                            <span className="text-[10px] tracking-[0.2em] text-white uppercase font-bold">{successMessage}</span>
                        </motion.div>
                    )}
                    {errorMessage && (
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className="bg-red-900/20 border border-red-500/50 p-6 flex items-center space-x-4 shadow-2xl backdrop-blur-xl"
                        >
                            <AlertCircle className="text-red-500" size={20} />
                            <span className="text-[10px] tracking-[0.2em] text-white uppercase font-bold">{errorMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10" ref={formRef}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-16 gap-6">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-serif tracking-[0.2em] md:tracking-[0.3em] uppercase mb-2 text-white">Registry Control</h1>
                        <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.5em] mb-4 md:mb-12 flex flex-wrap items-center gap-2 md:gap-4">
                            <span>Administrative Management Panel</span>
                            {waitlist.filter(e => e.request_type === 'callback').length > 0 && (
                                <span className="text-gold-500 animate-pulse border-l border-white/10 pl-2 md:pl-4 font-black">
                                    {waitlist.filter(e => e.request_type === 'callback').length} Callbacks Manifested
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Responsive Tab Navigation */}
                <div className="mb-16 border-b border-white/10 pb-4">
                    {/* Mobile Tab Dropdown */}
                    <div className="md:hidden relative mb-4">
                        <select
                            value={activeTab}
                            onChange={(e) => { setActiveTab(e.target.value); setIsAdding(false); setEditingId(null); }}
                            className="w-full bg-zinc-900 border border-white/20 p-4 text-[10px] tracking-[0.3em] uppercase text-gold-400 focus:outline-none appearance-none"
                        >
                            {['dashboard', 'orders', 'users', 'collections', 'products', 'blogs', 'reviews', 'waitlist', 'promo-codes', 'marketing', 'carts'].map(tab => {
                                const callbackCount = tab === 'waitlist' ? waitlist.filter(e => e.request_type === 'callback').length : 0;
                                return (
                                    <option key={tab} value={tab}>
                                        {tab.toUpperCase()} {callbackCount > 0 ? `(${callbackCount})` : ''}
                                    </option>
                                );
                            })}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown size={14} className="text-gold-500" />
                        </div>
                    </div>

                    {/* Desktop Tab Links */}
                    <div className="hidden md:flex space-x-8 overflow-x-auto scrollbar-hide">
                        {['dashboard', 'orders', 'users', 'collections', 'products', 'blogs', 'reviews', 'waitlist', 'promo-codes', 'marketing', 'carts'].map(tab => {
                            const callbackCount = tab === 'waitlist' ? waitlist.filter(e => e.request_type === 'callback').length : 0;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setIsAdding(false); setEditingId(null); }}
                                    className={`text-[10px] tracking-[0.3em] uppercase pb-2 transition-all whitespace-nowrap relative flex items-center ${activeTab === tab ? 'text-gold-400' : 'text-white/20 hover:text-white/50'}`}
                                >
                                    {tab}
                                    {callbackCount > 0 && (
                                        <span className="ml-2 bg-gold-500 text-black px-1.5 py-0.5 rounded-full text-[8px] font-black animate-pulse">
                                            {callbackCount}
                                        </span>
                                    )}
                                    {activeTab === tab && (
                                        <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-gold-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* TAB CONTENT: DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {tabsLoading.dashboard ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-gold-500" size={32} />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                    {/* Analytics Cards */}
                                    <div className="bg-white/5 border border-white/10 p-8 hover:border-gold-500/50 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] tracking-[0.3em] uppercase text-white/50">Total Revenue</h3>
                                            <DollarSign className="text-gold-500" size={18} />
                                        </div>
                                        <p className="text-4xl font-serif tracking-widest text-gold-400">
                                            {formatCurrency(analytics.totalRevenue, activeCurrency, rates, symbols)}
                                        </p>
                                        <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mt-4">REAL-TIME VAULT TOTAL</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-8 hover:border-gold-500/50 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] tracking-[0.3em] uppercase text-white/50">Total Orders</h3>
                                            <Package className="text-gold-500" size={18} />
                                        </div>
                                        <p className="text-4xl font-serif tracking-widest text-white">{analytics.totalOrders}</p>
                                        <p className="text-[9px] tracking-[0.2em] uppercase text-gold-500 mt-4">VERIFIED CUSTOMER MANIFESTS</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-8 hover:border-gold-500/50 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] tracking-[0.3em] uppercase text-white/50">Best Seller</h3>
                                            <TrendingUp className="text-gold-500" size={18} />
                                        </div>
                                        <p className="text-2xl font-serif tracking-widest text-white truncate">{analytics.bestSeller}</p>
                                        <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mt-4">PEAK OLFACTORY DEMAND</p>
                                    </div>
                                </div>

                                <h2 className="text-xl font-serif tracking-[0.2em] uppercase mb-8 mt-12 text-gold-500">Fast Inventory Restock</h2>
                                <p className="text-[10px] uppercase text-white/40 tracking-widest mb-6">Quickly adjust available physical bottles for each fragrance.</p>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {products.map(p => (
                                        <div key={p.id} className="bg-white/5 border border-white/10 p-6 flex justify-between items-center group hover:border-gold-500/30 transition-all">
                                            <div className="flex items-center space-x-6">
                                                <img src={getFullImageUrl(p.image_url)} alt="" className="w-12 h-12 object-cover border border-white/10 transition-all" />
                                                <div>
                                                    <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-white group-hover:text-gold-400">{p.name}</h4>
                                                    <p className="text-[8px] text-white/30 tracking-[0.1em] uppercase">{p.collection_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="relative group/input">
                                                    <input
                                                        type="number"
                                                        defaultValue={p.stock_count || 0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleUpdateStock(p.id, parseInt(e.target.value) || 0);
                                                                e.target.blur();
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== p.stock_count.toString()) {
                                                                handleUpdateStock(p.id, parseInt(e.target.value) || 0);
                                                            }
                                                        }}
                                                        className={`w-24 bg-black border border-white/10 text-center text-[11px] font-black py-2 focus:outline-none focus:border-gold-500 transition-colors ${p.stock_count <= 10 ? 'text-red-500' : 'text-green-500'}`}
                                                    />
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity whitespace-nowrap">
                                                        <span className="text-[7px] tracking-widest text-gold-500 uppercase">Press Enter to Vault</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* TAB CONTENT: ORDERS */}
                {activeTab === 'orders' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {tabsLoading.orders ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-gold-500" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Registry Intelligence & Reporting */}
                                <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-10">
                                    <div className="max-w-md">
                                        <h3 className="text-[11px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] font-black uppercase text-white mb-2 md:mb-3">Registry Intelligence</h3>
                                        <p className="text-[9px] md:text-[10px] tracking-widest text-white/30 uppercase leading-relaxed italic">Generate monthly sales manifests for accounting and inventory audit.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 w-full lg:w-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                                            <select
                                                value={reportType}
                                                onChange={(e) => setReportType(e.target.value)}
                                                className="bg-black border border-white/10 text-[9px] md:text-[10px] tracking-widest uppercase text-white px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
                                            >
                                                <option value="selling">Selling Report</option>
                                                <option value="return">Return Report</option>
                                            </select>
                                            <select
                                                id="reportMonth"
                                                defaultValue={new Date().getMonth()}
                                                className="bg-black border border-white/10 text-[9px] md:text-[10px] tracking-widest uppercase text-white px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
                                            >
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <option key={i} value={i}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
                                                ))}
                                            </select>
                                            <select
                                                id="reportYear"
                                                defaultValue={new Date().getFullYear()}
                                                className="bg-black border border-white/10 text-[9px] md:text-[10px] tracking-widest uppercase text-white px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
                                            >
                                                {[2024, 2025, 2026].map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const m = parseInt(document.getElementById('reportMonth').value);
                                                const y = parseInt(document.getElementById('reportYear').value);
                                                handleDownloadMonthlyReport(m, y, reportType);
                                            }}
                                            className="bg-white text-black px-8 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-gold-500 transition-all flex items-center justify-center gap-3 shadow-xl"
                                        >
                                            <FileSpreadsheet size={16} /> Export {reportType === 'selling' ? 'Sales' : 'Returns'}
                                        </button>
                                    </div>
                                </div>
                                {/* Order Sub-Tabs */}
                                <div className="flex items-center space-x-6 mb-8 border-b border-white/5 pb-2 overflow-x-auto scrollbar-hide">
                                    {[
                                        { id: 'pending', label: 'Pending', count: orders.filter(o => !o.status || o.status === 'On Hold' || o.status === 'Pending').length },
                                        { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'Accepted' || o.status === 'Processing').length },
                                        { id: 'dispatch', label: 'Dispatch', count: orders.filter(o => o.status === 'Dispatch' || o.status === 'Dispatched' || o.status === 'Delivered').length },
                                        { id: 'returns', label: 'Returns', count: orders.filter(o => o.status === 'RTO Returned' || o.status === 'Customer Returned').length }
                                    ].map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => { setOrderSubTab(sub.id); setSelectedOrders([]); }}
                                            className={`text-[9px] md:text-[10px] tracking-[0.2em] uppercase pb-3 transition-all relative flex items-center gap-3 whitespace-nowrap ${orderSubTab === sub.id ? 'text-white' : 'text-white/20 hover:text-white/50'}`}
                                        >
                                            {sub.label}
                                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black ${orderSubTab === sub.id ? 'bg-gold-500 text-black' : 'bg-white/5 text-white/20'}`}>
                                                {sub.count}
                                            </span>
                                            {orderSubTab === sub.id && (
                                                <motion.div layoutId="orderSubTabIndicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gold-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {(() => {
                                    const filteredOrders = orders.filter(o => {
                                        if (orderSubTab === 'pending') return !o.status || o.status === 'On Hold' || o.status === 'Pending';
                                        if (orderSubTab === 'processing') return o.status === 'Accepted' || o.status === 'Processing';
                                        if (orderSubTab === 'dispatch') return o.status === 'Dispatch' || o.status === 'Dispatched' || o.status === 'Delivered';
                                        if (orderSubTab === 'returns') return o.status === 'RTO Returned' || o.status === 'Customer Returned';
                                        return true;
                                    });
                                    const visibleSelected = selectedOrders.filter(id => filteredOrders.some(o => o.id === id));
                                    const hasAccepted = orderSubTab !== 'onhold' && filteredOrders.some(o => visibleSelected.includes(o.id) && (o.status === 'Accepted' || o.status === 'Dispatched' || o.status === 'Delivered'));
                                    const hasOnHold = filteredOrders.some(o => visibleSelected.includes(o.id) && (!o.status || o.status === 'On Hold' || o.status === 'Pending'));

                                    if (visibleSelected.length === 0) return null;

                                    return (
                                        <div className="bg-zinc-900 border border-white/20 p-4 flex flex-wrap items-center justify-between gap-4 mb-4">
                                            <span className="text-[10px] text-gold-400 uppercase font-bold tracking-widest">
                                                {visibleSelected.length} Order{visibleSelected.length > 1 ? 's' : ''} Selected in {orderSubTab.split('pending').join('Pending')}
                                            </span>
                                            <div className="flex flex-wrap gap-3">
                                                {hasOnHold && (
                                                    <button
                                                        onClick={() => handleBulkStatusUpdate(visibleSelected.filter(id => {
                                                            const o = filteredOrders.find(ord => ord.id === id);
                                                            return !o.status || o.status === 'On Hold' || o.status === 'Pending';
                                                        }), 'Processing')}
                                                        className="bg-green-600 border border-green-500 text-white px-5 py-2 text-[10px] tracking-widest uppercase hover:bg-green-500 transition-all font-bold flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 size={12} /> Accept Selection
                                                    </button>
                                                )}
                                                {hasAccepted && (
                                                    <>
                                                        <button onClick={() => handleBulkInvoice(visibleSelected)} className="bg-black border border-white/20 text-white px-5 py-2 text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all font-bold flex items-center gap-2">
                                                            <FileText size={12} /> Bulk Invoices
                                                        </button>
                                                        <button onClick={() => handleBulkLabel(visibleSelected)} className="bg-gold-500 border border-gold-500 text-black px-5 py-2 text-[10px] tracking-widest uppercase hover:bg-gold-400 transition-all font-bold flex items-center gap-2">
                                                            <Package size={12} /> Bulk Packing Slips
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleBulkDelete(visibleSelected)} className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-2 text-[10px] tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all font-bold flex items-center gap-2">
                                                    <Trash2 size={12} /> Delete Selected
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {/* Desktop Table View */}
                                <div className="hidden md:block bg-white/5 border border-white/10 overflow-x-auto scrollbar-hide">
                                    <table className="w-full text-left text-[11px] tracking-[0.1em] text-white/80 min-w-[1000px]">
                                        <thead className="bg-black text-[9px] uppercase tracking-[0.3em] font-bold text-white/50 border-b border-white/10">
                                            <tr>
                                                <th className="p-6 w-10">
                                                    {(() => {
                                                        const filteredItems = orders.filter(o => {
                                                            if (orderSubTab === 'onhold') return !o.status || o.status === 'On Hold' || o.status === 'Pending';
                                                            if (orderSubTab === 'processing') return o.status === 'Accepted';
                                                            if (orderSubTab === 'delivered') return o.status === 'Dispatched' || o.status === 'Delivered';
                                                            if (orderSubTab === 'rto') return o.status === 'RTO Returned';
                                                            if (orderSubTab === 'returned') return o.status === 'Customer Returned';
                                                            return true;
                                                        });
                                                        const visibleSelected = selectedOrders.filter(id => filteredItems.some(f => f.id === id));
                                                        return (
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 cursor-pointer accent-gold-500"
                                                                checked={filteredItems.length > 0 && visibleSelected.length === filteredItems.length}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        const newSelected = [...new Set([...selectedOrders, ...filteredItems.map(o => o.id)])];
                                                                        setSelectedOrders(newSelected);
                                                                    } else {
                                                                        setSelectedOrders(selectedOrders.filter(id => !filteredItems.some(f => f.id === id)));
                                                                    }
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                </th>
                                                <th className="p-6">Order ID</th>
                                                <th className="p-6">Customer</th>
                                                <th className="p-6">Items</th>
                                                <th className="p-6">Financials</th>
                                                <th className="p-6">Status / Dispatch</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const filteredOrders = orders.filter(o => {
                                                    if (orderSubTab === 'onhold') return !o.status || o.status === 'On Hold' || o.status === 'Pending';
                                                    if (orderSubTab === 'processing') return o.status === 'Accepted';
                                                    if (orderSubTab === 'delivered') return o.status === 'Dispatched' || o.status === 'Delivered';
                                                    if (orderSubTab === 'rto') return o.status === 'RTO Returned';
                                                    if (orderSubTab === 'returned') return o.status === 'Customer Returned';
                                                    return true;
                                                });

                                                if (filteredOrders.length === 0) {
                                                    return <tr><td colSpan="6" className="p-12 text-center text-white/30 uppercase tracking-widest">No Orders in {orderSubTab.toUpperCase()}</td></tr>;
                                                }

                                                return filteredOrders.map(order => (
                                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                        <td className="p-6">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 cursor-pointer accent-gold-500"
                                                                checked={selectedOrders.includes(order.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setSelectedOrders(prev => [...prev, order.id]);
                                                                    else setSelectedOrders(prev => prev.filter(id => id !== order.id));
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-6 font-serif text-gold-400">#{order.id.toString().padStart(4, '0')}</td>
                                                        <td className="p-6">
                                                            <p className="font-bold uppercase tracking-widest">{order.customer_name}</p>
                                                            <p className="text-[9px] text-white/40 mt-1 lowercase">{order.customer_email}</p>
                                                            <p className="text-[9px] text-white/40 mt-1 pb-2 border-b border-white/5 mb-2">{order.customer_phone || 'N/A'}</p>
                                                            <p className="text-[9px] text-white/30 truncate max-w-[200px] uppercase">{order.shipping_address}</p>
                                                        </td>
                                                        <td className="p-6">
                                                            {order.items?.map(it => (
                                                                <p key={it.id} className="text-[10px]"><span className="text-gold-500">{it.quantity}x</span> {it.product_name}</p>
                                                            ))}
                                                            {order.customer_note && (
                                                                <div className="mt-4 pt-2 border-t border-white/10">
                                                                    <p className="text-[9px] text-white/40 uppercase font-black mb-1 italic">Customer Note:</p>
                                                                    <p className="text-[10px] text-white/80 leading-relaxed font-serif italic">"{order.customer_note}"</p>
                                                                </div>
                                                            )}
                                                        </td>                                                        <td className="p-6">
                                                            <div className="flex flex-col space-y-1">
                                                                <span className="font-bold text-white uppercase text-xs">
                                                                    {formatCurrency(order.total_amount, activeCurrency, rates, symbols)}
                                                                </span>
                                                                <span className="text-[8px] tracking-[0.2em] uppercase text-white/30">{order.payment_method}</span>

                                                                {order.payment_method?.toLowerCase().includes('partial') && (
                                                                    <div className="mt-3 pt-2 border-t border-white/5 space-y-1">
                                                                        <div className="flex justify-between text-[8px] tracking-[0.1em] uppercase">
                                                                            <span className="text-white/40 italic">Partial Paid (30%)</span>
                                                                            <span className="text-green-500 font-bold">
                                                                                {formatCurrency(order.amount_paid, activeCurrency, rates, symbols)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between text-[8px] tracking-[0.1em] uppercase">
                                                                            <span className="text-white/40 italic">Pending (70%)</span>
                                                                            <span className="text-gold-500 font-bold underline">
                                                                                {formatCurrency(order.amount_pending, activeCurrency, rates, symbols)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex flex-col gap-2">
                                                                {/* Status Badge */}
                                                                <div className={`text-center px-2 py-1 text-[8px] font-black tracking-widest uppercase border ${order.status === 'On Hold' ? 'border-yellow-500/40 text-yellow-400 bg-yellow-500/5' :
                                                                    order.status === 'Accepted' ? 'border-blue-500/40 text-blue-400 bg-blue-500/5' :
                                                                        order.status === 'Dispatched' ? 'border-gold-500/40 text-gold-400 bg-gold-500/5' :
                                                                            order.status === 'Delivered' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                                                                                order.status === 'RTO Returned' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                                                                                    order.status === 'Customer Returned' ? 'border-orange-500/40 text-orange-400 bg-orange-500/5' :
                                                                                        'border-white/20 text-white/40'
                                                                    }`}>
                                                                    {order.status || 'On Hold'}
                                                                </div>
                                                                {/* Action Buttons by status */}
                                                                {(order.status === 'On Hold' || order.status === 'Pending' || !order.status) && (
                                                                    <button onClick={() => handleOrderStatusUpdate(order.id, 'Processing')} className="bg-gold-500 text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all">
                                                                        Accept Order
                                                                    </button>
                                                                )}
                                                                {(order.status === 'Accepted' || order.status === 'Processing') && (
                                                                    <button onClick={() => handleOrderStatusUpdate(order.id, 'Dispatch')} className="bg-blue-500 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                                                                        Mark as Dispatch
                                                                    </button>
                                                                )}
                                                                {order.status === 'Dispatch' && (
                                                                    <button onClick={() => handleOrderStatusUpdate(order.id, 'Dispatched')} className="bg-gold-500 text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all">
                                                                        Mark as Dispatched
                                                                    </button>
                                                                )}
                                                                {order.status === 'Dispatched' && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <button onClick={() => handleOrderStatusUpdate(order.id, 'Delivered')} className="bg-green-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all">
                                                                            Mark Delivered
                                                                        </button>
                                                                        <div className="grid grid-cols-2 gap-1 mt-1">
                                                                            <button
                                                                                onClick={() => handleOrderStatusUpdate(order.id, 'RTO Returned')}
                                                                                className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1.5 text-[8px] font-black uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all"
                                                                            >
                                                                                RTO Return
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleOrderStatusUpdate(order.id, 'Customer Returned')}
                                                                                className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2 py-1.5 text-[8px] font-black uppercase tracking-tighter hover:bg-orange-500 hover:text-white transition-all"
                                                                            >
                                                                                Cust. Return
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {order.status === 'Delivered' && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-center text-[8px] text-green-400 uppercase tracking-widest font-bold py-1">✓ Fulfilled</span>
                                                                        <div className="grid grid-cols-2 gap-1 mt-1">
                                                                            <button
                                                                                onClick={() => handleOrderStatusUpdate(order.id, 'RTO Returned')}
                                                                                className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1.5 text-[8px] font-black uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all"
                                                                            >
                                                                                RTO Return
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleOrderStatusUpdate(order.id, 'Customer Returned')}
                                                                                className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2 py-1.5 text-[8px] font-black uppercase tracking-tighter hover:bg-orange-500 hover:text-white transition-all"
                                                                            >
                                                                                Cust. Return
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="flex gap-2">
                                                                    {(order.status === 'Accepted' || order.status === 'Dispatched' || order.status === 'Delivered') && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleOrderInvoiceDownload(order)}
                                                                                className={`flex-1 flex items-center justify-center gap-1 border px-2 py-2 text-[8px] font-black tracking-widest uppercase transition-all ${downloadedHistory.invoices.includes(order.id) ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'border-white/20 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                                                            >
                                                                                <FileText size={11} /> {downloadedHistory.invoices.includes(order.id) ? 'RE-INV' : 'Invoice'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleOrderLabelDownload(order)}
                                                                                className={`flex-1 flex items-center justify-center gap-1 border px-2 py-2 text-[8px] font-black tracking-widest uppercase transition-all ${downloadedHistory.labels.includes(order.id) ? 'bg-blue-500/10 border-blue-500 text-blue-300' : 'border-white/20 text-white/50 hover:bg-gold-500 hover:border-gold-500 hover:text-black'}`}
                                                                            >
                                                                                <Package size={11} /> {downloadedHistory.labels.includes(order.id) ? 'RE-LABEL' : 'Label'}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    <button onClick={() => handleDeleteOrder(order.id)} className="flex items-center justify-center gap-1 border border-red-500/20 px-2 py-2 text-[8px] font-black tracking-widest uppercase hover:bg-red-500/20 hover:text-red-500 transition-all text-white/20">
                                                                        <Trash2 size={11} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {(() => {
                                        const filteredOrders = orders.filter(o => {
                                            if (orderSubTab === 'pending') return !o.status || o.status === 'On Hold' || o.status === 'Pending';
                                            if (orderSubTab === 'processing') return o.status === 'Accepted' || o.status === 'Processing';
                                            if (orderSubTab === 'dispatch') return o.status === 'Dispatch' || o.status === 'Dispatched' || o.status === 'Delivered';
                                            if (orderSubTab === 'returns') return o.status === 'RTO Returned' || o.status === 'Customer Returned';
                                            return true;
                                        });

                                        if (filteredOrders.length === 0) {
                                            return <div className="p-12 text-center text-white/30 uppercase tracking-widest bg-white/5 border border-white/10">No Orders</div>;
                                        }

                                        return filteredOrders.map(order => (
                                            <div key={order.id} className="bg-white/5 border border-white/10 p-6 space-y-4">
                                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 cursor-pointer accent-gold-500"
                                                            checked={selectedOrders.includes(order.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedOrders(prev => [...prev, order.id]);
                                                                else setSelectedOrders(prev => prev.filter(id => id !== order.id));
                                                            }}
                                                        />
                                                        <span className="font-serif text-gold-400">#{order.id.toString().padStart(4, '0')}</span>
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold text-white/50">{new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Customer</p>
                                                    <p className="font-bold uppercase tracking-widest text-white">{order.customer_name}</p>
                                                    <p className="text-[9px] lowercase text-white/40">{order.customer_email}</p>
                                                    <p className="text-[9px] text-gold-500 mt-1 font-bold">{order.customer_phone || 'N/A'}</p>
                                                </div>
                                                <div className="bg-black/40 p-5 border border-white/5 space-y-4">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">Order Summary</p>
                                                        <span className="text-[11px] font-black text-gold-400">
                                                            {formatCurrency(order.total_amount, activeCurrency, rates, symbols)}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {order.items?.map(it => (
                                                            <p key={it.id} className="text-[10px] flex justify-between items-center">
                                                                <span className="text-white/70 font-medium">{it.product_name}</span>
                                                                <span className="text-white/30 text-[9px]">x{it.quantity}</span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                    {order.customer_note && (
                                                        <div className="mt-4 pt-4 border-t border-white/5">
                                                            <p className="text-[8px] text-white/20 uppercase font-black mb-2 tracking-widest italic">Note from Client</p>
                                                            <p className="text-[10px] text-white/60 leading-relaxed font-serif italic">"{order.customer_note}"</p>
                                                        </div>
                                                    )}
                                                    <div className="mt-2 pt-3 border-t border-white/5 flex justify-between items-center text-[8px] tracking-[0.2em] uppercase text-white/30">
                                                        <span>Payment Method</span>
                                                        <span className="text-white/50">{order.payment_method}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Management</p>
                                                    <div className="flex flex-col gap-2">
                                                        {/* Status Badge */}
                                                        <div className={`text-center px-3 py-2 text-[9px] font-black tracking-widest uppercase border ${order.status === 'On Hold' ? 'border-yellow-500/40 text-yellow-400 bg-yellow-500/5' :
                                                            order.status === 'Accepted' ? 'border-blue-500/40 text-blue-400 bg-blue-500/5' :
                                                                order.status === 'Dispatched' ? 'border-gold-500/40 text-gold-400 bg-gold-500/5' :
                                                                    order.status === 'Delivered' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                                                                        order.status === 'RTO Returned' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                                                                            order.status === 'Customer Returned' ? 'border-orange-500/40 text-orange-400 bg-orange-500/5' :
                                                                                'border-white/20 text-white/40'
                                                            }`}>
                                                            {order.status || 'On Hold'}
                                                        </div>
                                                        {/* Action Buttons */}
                                                        {(order.status === 'On Hold' || order.status === 'Pending' || !order.status) && (
                                                            <button onClick={() => handleOrderStatusUpdate(order.id, 'Processing')} className="w-full bg-gold-500 text-black py-3 font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all">
                                                                ✓ Accept Order
                                                            </button>
                                                        )}
                                                        {(order.status === 'Accepted' || order.status === 'Processing') && (
                                                            <button onClick={() => handleOrderStatusUpdate(order.id, 'Dispatch')} className="w-full bg-blue-500 text-white py-3 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                                                                → Mark as Dispatch
                                                            </button>
                                                        )}
                                                        {order.status === 'Dispatch' && (
                                                            <button onClick={() => handleOrderStatusUpdate(order.id, 'Dispatched')} className="w-full bg-gold-500 text-black py-3 font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all">
                                                                → Mark as Dispatched
                                                            </button>
                                                        )}
                                                        {order.status === 'Dispatched' && (
                                                            <div className="space-y-2">
                                                                <button onClick={() => handleOrderStatusUpdate(order.id, 'Delivered')} className="w-full bg-green-500/20 border border-green-500/50 text-green-300 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">
                                                                    ✓ Mark Delivered
                                                                </button>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <button
                                                                        onClick={() => handleOrderStatusUpdate(order.id, 'RTO Returned')}
                                                                        className="bg-red-500/10 border border-red-500/30 text-red-400 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                                    >
                                                                        RTO Return
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOrderStatusUpdate(order.id, 'Customer Returned')}
                                                                        className="bg-orange-500/10 border border-orange-500/30 text-orange-400 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
                                                                    >
                                                                        Cust. Return
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {order.status === 'Delivered' && (
                                                            <div className="space-y-2">
                                                                <span className="text-center text-[9px] text-green-400 uppercase tracking-widest font-bold py-2 block border border-green-500/20 bg-green-500/5">✓ Order Fulfilled</span>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <button
                                                                        onClick={() => handleOrderStatusUpdate(order.id, 'RTO Returned')}
                                                                        className="bg-red-500/10 border border-red-500/30 text-red-400 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                                    >
                                                                        RTO Return
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOrderStatusUpdate(order.id, 'Customer Returned')}
                                                                        className="bg-orange-500/10 border border-orange-500/30 text-orange-400 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
                                                                    >
                                                                        Cust. Return
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2 w-full">
                                                            {(order.status === 'Accepted' || order.status === 'Dispatched' || order.status === 'Delivered') && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleOrderInvoiceDownload(order)}
                                                                        className={`flex-1 flex items-center justify-center gap-1 border p-3 text-[10px] font-black tracking-widest uppercase transition-all ${downloadedHistory.invoices.includes(order.id) ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'border-white/20 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                                                    >
                                                                        <FileText size={14} /> {downloadedHistory.invoices.includes(order.id) ? 'RE-INV' : 'Invoice'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOrderLabelDownload(order)}
                                                                        className={`flex-1 flex items-center justify-center gap-1 border p-3 text-[10px] font-black tracking-widest uppercase transition-all ${downloadedHistory.labels.includes(order.id) ? 'bg-blue-500/10 border-blue-500 text-blue-300' : 'border-white/20 text-white/50 hover:bg-gold-500 hover:border-gold-500 hover:text-black'}`}
                                                                    >
                                                                        <Package size={14} /> {downloadedHistory.labels.includes(order.id) ? 'RE-LABEL' : 'Label'}
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button onClick={() => handleDeleteOrder(order.id)} className="flex items-center justify-center gap-2 border border-red-500/20 p-3 text-[10px] font-black tracking-widest uppercase hover:bg-red-500/20 hover:text-red-500 transition-all text-white/20">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB CONTENT: USERS */}
                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {tabsLoading.users ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-gold-500" size={32} />
                            </div>
                        ) : (
                            <>
                                <div className="flex space-x-8 mb-12 border-b border-white/5 pb-2">
                                    <button
                                        onClick={() => setUserSubTab('users')}
                                        className={`pb-4 px-2 uppercase tracking-[0.3em] text-[10px] transition-all border-b-2 ${userSubTab === 'users' ? 'border-gold-500 text-gold-500 font-bold' : 'border-transparent text-white/30'}`}
                                    >
                                        Users
                                    </button>
                                    <button
                                        onClick={() => setUserSubTab('admins')}
                                        className={`pb-4 px-2 uppercase tracking-[0.3em] text-[10px] transition-all border-b-2 ${userSubTab === 'admins' ? 'border-gold-500 text-gold-500 font-bold' : 'border-transparent text-white/30'}`}
                                    >
                                        Admins
                                    </button>
                                </div>

                                {userSubTab === 'users' ? (
                                    <>
                                        <div className="mb-8 flex items-center bg-white/[0.03] border border-white/10 px-5 md:px-8 py-4 md:py-6 group focus-within:border-gold-500/50 transition-all">
                                            <Search size={18} className="text-white/20 group-focus-within:text-gold-500 transition-colors mr-6" />
                                            <input
                                                type="text"
                                                placeholder="Search users..."
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                className="bg-transparent border-none text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white placeholder:text-white/10 focus:outline-none w-full"
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            {/* Desktop Table View */}
                                            <div className="hidden md:block bg-white/5 border border-white/10 overflow-x-auto scrollbar-hide">
                                                <table className="w-full text-left text-[11px] tracking-[0.1em] text-white/80 min-w-[900px]">
                                                    <thead className="bg-black text-[9px] uppercase tracking-[0.3em] font-bold text-white/50 border-b border-white/10">
                                                        <tr>
                                                            <th className="p-6">User ID</th>
                                                            <th className="p-6">User Details</th>
                                                            <th className="p-6">Contact</th>
                                                            <th className="p-6">Status / Role</th>
                                                            <th className="p-6">Joined Date</th>
                                                            <th className="p-6 text-right">Management</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {users.filter(u =>
                                                            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                            `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
                                                        ).length === 0 ? (
                                                            <tr><td colSpan="6" className="p-12 text-center text-white/30 uppercase tracking-widest">No matching users found</td></tr>
                                                        ) : (
                                                            users.filter(u =>
                                                                u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                                `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
                                                            ).map(u => (
                                                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                                    <td className="p-6 font-serif text-gold-400">#{u.id.toString().padStart(4, '0')}</td>
                                                                    <td className="p-6">
                                                                        <p className="font-bold uppercase tracking-widest text-white">{u.first_name} {u.last_name}</p>
                                                                        <p className="text-[9px] text-white/40 mt-1 flex items-center space-x-2 lowercase font-sans">
                                                                            <span>{u.email}</span>
                                                                        </p>
                                                                    </td>
                                                                    <td className="p-6">
                                                                        <p className="text-[10px] text-white/70 uppercase tracking-widest flex items-center space-x-2">
                                                                            <Phone size={10} className="text-gold-500" />
                                                                            <span>{u.telephone || 'Not Provided'}</span>
                                                                        </p>
                                                                    </td>
                                                                    <td className="p-6">
                                                                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'border-gold-500/50 text-gold-500 bg-gold-400/5' : 'border-white/10 text-white/40'}`}>
                                                                            {u.role || 'user'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-6">
                                                                        <p className="text-[9px] text-white/30 uppercase tracking-widest">
                                                                            {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </p>
                                                                    </td>
                                                                    <td className="p-6 text-right">
                                                                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-500/30 hover:text-red-500 transition-colors p-2">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Card View */}
                                            <div className="md:hidden space-y-4">
                                                {users.filter(u =>
                                                    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                    `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
                                                ).map(u => (
                                                    <div key={u.id} className="bg-white/[0.03] border border-white/10 p-6 space-y-6 relative group overflow-hidden">
                                                        <div className="flex justify-between items-start border-b border-white/5 pb-5">
                                                            <div className="flex items-center space-x-5">
                                                                <div className="w-14 h-14 rounded bg-gold-400/5 border border-gold-500/10 flex items-center justify-center text-gold-500 font-serif text-2xl">
                                                                    {u.first_name[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black uppercase tracking-[0.15em] text-white text-[14px] leading-tight mb-1">{u.first_name} {u.last_name}</p>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-serif text-gold-500/50 text-[10px]">#{u.id.toString().padStart(4, '0')}</span>
                                                                        <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 border ${u.role === 'admin' ? 'border-gold-500/30 text-gold-500' : 'border-white/10 text-white/20'}`}>
                                                                            {u.role || 'User'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-500/40 hover:text-red-500 transition-colors p-2 mt-1">
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="bg-black/40 p-4 border border-white/5">
                                                                <p className="text-[8px] uppercase tracking-[0.3em] text-white/20 mb-2">Communication</p>
                                                                <p className="text-[10px] lowercase text-white/80 mb-1">{u.email}</p>
                                                                <p className="text-[10px] text-gold-500/80 font-bold">{u.telephone || 'Contact Restricted'}</p>
                                                            </div>
                                                            <div className="bg-black/40 p-4 border border-white/5">
                                                                <p className="text-[8px] uppercase tracking-[0.3em] text-white/20 mb-2">Acquisition History</p>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[9px] uppercase tracking-widest text-white/40">Joined Registry</span>
                                                                    <span className="text-[10px] text-white font-serif">{new Date(u.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-8 md:space-y-12">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-white/10 p-6 md:p-8 gap-6">
                                            <div>
                                                <h2 className="text-lg md:text-xl font-serif tracking-[0.1em] md:tracking-widest uppercase italic text-gold-500">Administration Team</h2>
                                                <p className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-white/40 uppercase mt-1 md:mt-2">Managing platform access controls</p>
                                            </div>
                                            <button
                                                onClick={() => setIsAdding(!isAdding)}
                                                className="w-full sm:w-auto bg-white text-black px-6 md:px-8 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isAdding ? <X size={14} /> : <Plus size={14} />}
                                                {isAdding ? 'Discard Draft' : 'Appoint New Admin'}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {isAdding && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-zinc-900/80 border border-gold-500/20 p-8 md:p-12 mb-10"
                                                >
                                                    <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="md:col-span-2 border-b border-white/10 pb-4 mb-4">
                                                            <h3 className="text-gold-500 font-serif tracking-widest uppercase">Admin Identity & Credentials</h3>
                                                        </div>
                                                        <div>
                                                            <label className={labelClasses}>First Name</label>
                                                            <input required className={inputClasses} value={adminFormData.firstName} onChange={e => setAdminFormData({ ...adminFormData, firstName: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <label className={labelClasses}>Last Name</label>
                                                            <input required className={inputClasses} value={adminFormData.lastName} onChange={e => setAdminFormData({ ...adminFormData, lastName: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <label className={labelClasses}>Email Address</label>
                                                            <input required type="email" className={inputClasses} value={adminFormData.email} onChange={e => setAdminFormData({ ...adminFormData, email: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <label className={labelClasses}>Access Password</label>
                                                            <div className="relative">
                                                                <input
                                                                    required
                                                                    type={showPassword ? "text" : "password"}
                                                                    className={`${inputClasses} pr-12`}
                                                                    value={adminFormData.password}
                                                                    onChange={e => setAdminFormData({ ...adminFormData, password: e.target.value })}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold-500 transition-colors"
                                                                >
                                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 pt-4">
                                                            <button type="submit" className="w-full bg-gold-500 text-black py-5 text-[11px] font-black tracking-[0.5em] uppercase hover:bg-white transition-all">
                                                                Confirm Appointment
                                                            </button>
                                                        </div>
                                                    </form>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="bg-white/5 border border-white/10 overflow-hidden">
                                            <table className="w-full text-left text-[11px] tracking-[0.1em] text-white/80">
                                                <thead className="bg-black text-[9px] uppercase tracking-[0.3em] font-bold text-white/50 border-b border-white/10">
                                                    <tr>
                                                        <th className="p-6">Admin Identity</th>
                                                        <th className="p-6">Permissions</th>
                                                        <th className="p-6">Joined Date</th>
                                                        <th className="p-6 text-right">Management</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {admins.map(adm => (
                                                        <tr key={adm.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                            <td className="p-6">
                                                                <div className="flex items-center space-x-4">
                                                                    <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 font-serif text-lg">
                                                                        {adm.first_name?.[0] || 'A'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-white uppercase tracking-widest">{adm.first_name} {adm.last_name}</p>
                                                                        <p className="text-[9px] text-white/40 lowercase">{adm.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-6">
                                                                <span className="px-3 py-1 bg-gold-500/5 border border-gold-500/30 text-gold-500 text-[8px] font-black uppercase tracking-widest">Administrator</span>
                                                            </td>
                                                            <td className="p-6 text-white/30 uppercase">
                                                                {new Date(adm.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-6 text-right">
                                                                {adm.id !== 1 && (
                                                                    <button onClick={() => handleDeleteUser(adm.id)} className="text-red-500/30 hover:text-red-500 transition-colors p-2">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}

                {/* TAB CONTENT: REVIEWS */}
                {activeTab === 'reviews' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {tabsLoading.reviews ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-gold-500" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Desktop Table View */}
                                <div className="hidden md:block bg-white/5 border border-white/10 overflow-x-auto scrollbar-hide">
                                    <table className="w-full text-left text-[11px] tracking-[0.1em] text-white/80 min-w-[900px]">
                                        <thead className="bg-black text-[9px] uppercase tracking-[0.3em] font-bold text-white/50 border-b border-white/10">
                                            <tr>
                                                <th className="p-6">User</th>
                                                <th className="p-6">Essence</th>
                                                <th className="p-6">Review</th>
                                                <th className="p-6 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reviews.length === 0 ? (
                                                <tr><td colSpan="4" className="p-12 text-center text-white/30 uppercase tracking-widest">No Reviews Shared Yet</td></tr>
                                            ) : (
                                                reviews.map(rev => (
                                                    <tr key={rev.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                        <td className="p-6">
                                                            <p className="font-bold uppercase tracking-widest text-white">{rev.first_name} {rev.last_name}</p>
                                                            <p className="text-[9px] text-white/40 mt-1 lowercase">{rev.email}</p>
                                                        </td>
                                                        <td className="p-6">
                                                            <p className="tracking-widest uppercase text-gold-400">{rev.product_name}</p>
                                                            <div className="flex text-gold-500 mt-2">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "opacity-20"} />
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <p className="font-bold text-white mb-1 uppercase tracking-widest">{rev.title}</p>
                                                            <p className="text-white/50 max-w-sm line-clamp-2 italic">{rev.comment}</p>
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <button onClick={() => handleDeleteReview(rev.id)} className="text-red-500/30 hover:text-red-500 transition-colors p-2">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {reviews.length === 0 ? (
                                        <div className="p-12 text-center text-white/30 uppercase tracking-widest bg-white/5 border border-white/10">No Reviews</div>
                                    ) : (
                                        reviews.map(rev => (
                                            <div key={rev.id} className="bg-white/5 border border-white/10 p-6 space-y-4">
                                                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                                                    <div>
                                                        <p className="text-[8px] uppercase tracking-widest text-gold-500 mb-1">Product</p>
                                                        <p className="font-black uppercase tracking-widest text-white text-[10px]">{rev.product_name}</p>
                                                    </div>
                                                    <button onClick={() => handleDeleteReview(rev.id)} className="text-red-500 bg-red-500/10 p-2 uppercase text-[8px] font-black tracking-widest">
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex text-gold-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "opacity-20"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[8px] uppercase text-white/30">{new Date(rev.created_at || Date.now()).toLocaleDateString()}</span>
                                                </div>
                                                <div className="bg-black/20 p-4 border border-white/5">
                                                    <p className="font-bold text-white text-[10px] uppercase tracking-widest mb-2 border-b border-white/10 pb-2">{rev.title}</p>
                                                    <p className="text-[10px] text-white/50 italic leading-relaxed">"{rev.comment}"</p>
                                                </div>
                                                <div className="flex items-center space-x-3 pt-2">
                                                    <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-serif text-white/40">
                                                        {rev.first_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-white/80">{rev.first_name} {rev.last_name}</p>
                                                        <p className="text-[8px] lowercase text-white/30">{rev.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB CONTENT: WAITLIST */}
                {activeTab === 'waitlist' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {tabsLoading.waitlist ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-gold-500" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-6 md:space-y-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 bg-white/5 border border-white/10 p-6 md:p-8 gap-6">
                                    <div>
                                        <h2 className="text-lg md:text-xl font-serif tracking-[0.1em] md:tracking-[0.2em] uppercase italic">Waitlist Manifest</h2>
                                        <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1 md:mt-2">
                                            <p className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-white/40 uppercase">Managing prospective acquisitions</p>
                                            {waitlist.filter(e => e.request_type === 'callback').length > 0 && (
                                                <span className="bg-gold-500 text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest animate-pulse">
                                                    {waitlist.filter(e => e.request_type === 'callback').length} Priority Callbacks
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest">Total Manifest Entries</p>
                                        <p className="text-xl md:text-2xl font-serif text-gold-500">{waitlist.length}</p>
                                    </div>
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden md:block bg-white/5 border border-white/10 overflow-x-auto scrollbar-hide">
                                    <table className="w-full text-left text-[11px] tracking-[0.1em] text-white/80 min-w-[1100px]">
                                        <thead className="bg-black text-[9px] uppercase tracking-[0.3em] font-bold text-white/50 border-b border-white/10">
                                            <tr>
                                                <th className="p-6">Type</th>
                                                <th className="p-6">Client Identity</th>
                                                <th className="p-6">Contact Details</th>
                                                <th className="p-6">Request Interest</th>
                                                <th className="p-6">Status</th>
                                                <th className="p-6 text-right">Management</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {waitlist.length === 0 ? (
                                                <tr><td colSpan="6" className="p-12 text-center text-white/30 uppercase tracking-widest">The manifest is currently empty</td></tr>
                                            ) : (
                                                waitlist.map(entry => (
                                                    <tr key={entry.id} className={`border-b border-white/5 transition-colors ${entry.request_type === 'callback' ? 'bg-gold-500/[0.03] border-l-2 border-l-gold-500' : 'hover:bg-white/[0.02]'}`}>
                                                        <td className="p-6">
                                                            {entry.request_type === 'callback' ? (
                                                                <span className="flex items-center gap-2 text-gold-500 text-[8px] font-black tracking-widest uppercase">
                                                                    <Smartphone size={12} strokeWidth={2} /> Callback
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-2 text-white/40 text-[8px] font-black tracking-widest uppercase">
                                                                    <Layers size={12} strokeWidth={2} /> Waitlist
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-6">
                                                            <p className="font-bold uppercase tracking-widest text-white">{entry.customer_name}</p>
                                                            <p className="text-[9px] text-white/30 uppercase mt-1">ID: #{entry.id.toString().padStart(4, '0')}</p>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-2 mb-1 lowercase">
                                                                <Mail size={10} className="text-gold-500/50" />
                                                                <span>{entry.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Phone size={10} className="text-gold-500/50" />
                                                                <span className="text-white font-bold">{entry.phone || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            {entry.request_type === 'callback' ? (
                                                                <p className="text-white/60 italic text-[10px]">Private Concierge Inquiry</p>
                                                            ) : (
                                                                <>
                                                                    <p className="text-gold-500 font-bold uppercase tracking-widest">{entry.product_name || 'Restock Request'}</p>
                                                                    <p className="text-[9px] text-white/40 italic font-serif">{entry.product_slug}</p>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="px-3 py-1 border border-gold-500/30 text-gold-500 text-[8px] font-black uppercase tracking-widest bg-gold-500/5 w-fit">
                                                                    {entry.status || 'Pending'}
                                                                </span>
                                                                <span className="text-[8px] text-white/20 uppercase">
                                                                    {new Date(entry.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <button
                                                                onClick={async () => {
                                                                    if (!window.confirm('Remove from waitlist?')) return;
                                                                    try {
                                                                        const res = await fetch(`${API_URL}/api/waitlist/${entry.id}`, {
                                                                            method: 'DELETE',
                                                                            headers: getAdminHeaders()
                                                                        });
                                                                        if (res.ok) {
                                                                            showSuccessToast('Prospect removed.');
                                                                            fetchWaitlistData();
                                                                        }
                                                                    } catch (e) { showErrorToast('Update failed.'); }
                                                                }}
                                                                className="text-red-500/40 hover:text-red-500 transition-colors p-2"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {waitlist.length === 0 ? (
                                        <div className="p-12 text-center text-white/30 uppercase tracking-widest bg-white/5 border border-white/10">No Prospects</div>
                                    ) : (
                                        waitlist.map(entry => (
                                            <div key={entry.id} className={`bg-white/5 border border-white/10 p-6 space-y-4 ${entry.request_type === 'callback' ? 'border-l-2 border-l-gold-500' : ''}`}>
                                                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                                                    <div>
                                                        <p className="text-[8px] uppercase tracking-widest text-gold-500 mb-1">ID: #{entry.id.toString().padStart(4, '0')}</p>
                                                        <p className="font-black uppercase tracking-widest text-white text-[10px]">{entry.customer_name}</p>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            if (!window.confirm('Remove from waitlist?')) return;
                                                            try {
                                                                const res = await fetch(`${API_URL}/api/waitlist/${entry.id}`, {
                                                                    method: 'DELETE',
                                                                    headers: getAdminHeaders()
                                                                });
                                                                if (res.ok) {
                                                                    showSuccessToast('Prospect removed.');
                                                                    fetchWaitlistData();
                                                                }
                                                            } catch (e) { showErrorToast('Update failed.'); }
                                                        }}
                                                        className="text-red-500 bg-red-500/10 p-2 uppercase text-[8px] font-black tracking-widest"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="bg-black/20 p-3 border border-white/5">
                                                        <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">Contact</p>
                                                        <p className="text-[10px] lowercase text-white/70">{entry.email}</p>
                                                        <p className="text-[10px] text-white/70 mt-1 font-bold">{entry.phone || 'N/A'}</p>
                                                    </div>
                                                    <div className="bg-black/20 p-3 border border-white/5">
                                                        <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">Interest</p>
                                                        {entry.request_type === 'callback' ? (
                                                            <p className="text-white/60 italic text-[10px]">Concierge Callback</p>
                                                        ) : (
                                                            <p className="text-gold-500 font-bold uppercase tracking-widest text-[10px]">{entry.product_name || 'Restock'}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center bg-black/20 p-3 border border-white/5">
                                                        <span className="text-[8px] uppercase tracking-widest text-white/20">Status</span>
                                                        <span className="px-2 py-0.5 border border-gold-500/30 text-gold-500 text-[8px] font-black uppercase tracking-widest bg-gold-500/5">
                                                            {entry.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB CONTENT: MARKETING */}
                {activeTab === 'marketing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                        {tabsLoading.marketing ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-gold-500" size={32} />
                            </div>
                        ) : (
                            <>
                                {/* POPUP MANAGEMENT */}
                                <section className="bg-white/5 border border-white/10 p-6 md:p-12">
                                    <div className="flex items-center space-x-4 mb-10">
                                        <Sparkles className="text-gold-500" size={24} />
                                        <h2 className="text-2xl font-serif tracking-widest uppercase italic">"The Inner Circle" Popup</h2>
                                    </div>

                                    <form onSubmit={handleUpdatePopup} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between bg-zinc-900/80 p-6 md:p-8 border border-white/10 shadow-2xl">
                                                <div>
                                                    <p className="text-[11px] tracking-[0.3em] font-black uppercase text-white mb-2">Engagement Status</p>
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-2 h-2 rounded-full animate-pulse ${popupSettings.is_active ? 'bg-gold-500' : 'bg-red-500'}`} />
                                                        <p className={`text-[10px] tracking-[0.2em] uppercase font-bold ${popupSettings.is_active ? 'text-gold-500' : 'text-white/30'}`}>
                                                            {popupSettings.is_active ? 'Registry Active' : 'Registry Paused'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setPopupSettings(prev => ({ ...prev, is_active: !prev.is_active }))}
                                                    className={`w-20 h-10 rounded-full relative transition-all duration-700 shadow-inner overflow-hidden ${popupSettings.is_active ? 'bg-gold-500' : 'bg-white/5 border border-white/10'}`}
                                                >
                                                    <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all duration-700 shadow-xl flex items-center justify-center ${popupSettings.is_active ? 'left-11' : 'left-1.5'}`}>
                                                        {popupSettings.is_active ? <Sparkles size={12} className="text-gold-500" /> : <X size={12} className="text-zinc-400" />}
                                                    </div>
                                                </button>
                                            </div>

                                            <div>
                                                <label className={labelClasses}>Editorial Title</label>
                                                <input
                                                    className={inputClasses}
                                                    value={popupSettings.title}
                                                    onChange={e => setPopupSettings({ ...popupSettings, title: e.target.value })}
                                                    placeholder="Join The Inner Circle"
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClasses}>Promotion Narrative</label>
                                                <textarea
                                                    className={`${inputClasses} h-24`}
                                                    value={popupSettings.offer_text}
                                                    onChange={e => setPopupSettings({ ...popupSettings, offer_text: e.target.value })}
                                                    placeholder="Describe the exclusive privilege..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClasses}>Delay (Seconds)</label>
                                                    <input
                                                        type="number"
                                                        className={inputClasses}
                                                        value={popupSettings.delay_seconds}
                                                        onChange={e => setPopupSettings({ ...popupSettings, delay_seconds: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Redirect URL (Optional)</label>
                                                    <input
                                                        className={inputClasses}
                                                        value={popupSettings.redirect_url || ''}
                                                        onChange={e => setPopupSettings({ ...popupSettings, redirect_url: e.target.value })}
                                                        placeholder="/collection or https://..."
                                                    />
                                                </div>
                                                <div className="flex items-end pb-4 col-span-2">
                                                    <button type="submit" className="w-full bg-gold-500 text-black py-4 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-all flex items-center justify-center gap-2">
                                                        <Save size={14} /> Commit Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className={labelClasses}>Cinematic Visual</label>
                                            <div
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.onchange = (e) => handleImageUpload(e, 'popup');
                                                    input.click();
                                                }}
                                                className="h-48 border border-dashed border-white/10 bg-zinc-900/50 flex flex-col items-center justify-center cursor-pointer group overflow-hidden relative"
                                            >
                                                {popupSettings.image_url ? (
                                                    <img src={getFullImageUrl(popupSettings.image_url)} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                                                ) : (
                                                    <div className="text-center">
                                                        <ImageIcon size={32} className="mx-auto mb-4 text-white/20 group-hover:text-gold-500" />
                                                        <p className="text-[9px] tracking-widest text-white/40 uppercase">Upload Lifestyle Visual</p>
                                                    </div>
                                                )}

                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                                        <Loader2 className="animate-spin text-gold-500" size={32} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </section>

                                {/* COMMUNITY GALLERY */}
                                <section className="space-y-8">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-serif tracking-widest uppercase">Seen In KIKS</h2>
                                            <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-2">Community Gallery & Social Proof</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg';
                                                input.onchange = async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    setUploading(true);
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    try {
                                                        const res = await fetch(`${API_URL}/api/upload`, {
                                                            method: 'POST',
                                                            headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET },
                                                            body: formData
                                                        });
                                                        const data = await res.json();
                                                        if (res.ok) handleAddGalleryImage(data.url);
                                                    } finally { setUploading(false); }
                                                };
                                                input.click();
                                            }}
                                            className="bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all flex items-center gap-3"
                                        >
                                            <Plus size={16} /> Append Lifestyle Visual
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {communityGallery.map((img) => (
                                            <div key={img.id} className="aspect-square relative group bg-zinc-900 overflow-hidden">
                                                <img src={getFullImageUrl(img.image_url)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleDeleteGalleryImage(img.id)}
                                                        className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {communityGallery.length === 0 && (
                                            <div className="col-span-full py-20 text-center border border-dashed border-white/10 bg-white/5">
                                                <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">The gallery remains uncurated.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* NEWSLETTER REGISTRY */}
                                <section className="space-y-8 bg-black/40 p-6 md:p-12 border border-white/5">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-serif tracking-widest uppercase italic">The Inner Circle Registry</h2>
                                            <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-2">Newsletter Subscriber Manifest</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[10px] text-white/40 uppercase tracking-widest">Total Members</p>
                                                <p className="text-xl font-serif text-gold-500">{newsletterSubscribers.length}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const ws = XLSX.utils.json_to_sheet(newsletterSubscribers.map(s => ({
                                                        'Email Address': s.email,
                                                        'Source': s.source,
                                                        'Subscribed At': new Date(s.subscribed_at).toLocaleString()
                                                    })));
                                                    const wb = XLSX.utils.book_new();
                                                    XLSX.utils.book_append_sheet(wb, ws, "Subscribers");
                                                    XLSX.writeFile(wb, `Kiks_Subscribers_${new Date().toISOString().split('T')[0]}.xlsx`);
                                                }}
                                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 text-[9px] uppercase tracking-[0.3em] transition-all border border-white/10 flex items-center gap-2"
                                            >
                                                <Download size={14} /> Export Manifest
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="py-6 text-[10px] uppercase tracking-[0.2em] font-black text-white/40">Email Identity</th>
                                                    <th className="py-6 text-[10px] uppercase tracking-[0.2em] font-black text-white/40">Acquisition Source</th>
                                                    <th className="py-6 text-[10px] uppercase tracking-[0.2em] font-black text-white/40">Date of Entry</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {newsletterSubscribers.map((sub) => (
                                                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-6">
                                                            <div className="flex items-center gap-3">
                                                                <Mail size={14} className="text-gold-500/50" />
                                                                <span className="text-[12px] text-white tracking-wider">{sub.email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6">
                                                            <span className={`text-[9px] px-3 py-1 border ${sub.source === 'popup' ? 'border-gold-500/30 text-gold-500' : 'border-white/20 text-white/60'} uppercase tracking-widest`}>
                                                                {sub.source}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 text-[11px] text-white/40 font-mono">
                                                            {new Date(sub.subscribed_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {newsletterSubscribers.length === 0 && (
                                                    <tr>
                                                        <td colSpan="3" className="py-20 text-center">
                                                            <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 italic">No members have joined the Inner Circle yet.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </>
                        )}
                    </motion.div>
                )}


                {(activeTab === 'collections' || activeTab === 'products' || activeTab === 'blogs' || activeTab === 'promo-codes') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* ADD NEW SECTION TOGGLE */}
                        <div className="flex justify-center mb-8 md:mb-16 px-4">
                            <button
                                onClick={() => {
                                    setIsAdding(!isAdding);
                                    setEditingId(null);
                                    setColFormData({ name: '', slug: '', banner_url: '', description: '' });
                                    setProdFormData({ collection_id: '', name: '', slug: '', price: '', image_url: '', gallery_urls: [], description: '', top_notes: '', heart_notes: '', base_notes: '', stock_count: 50, size: '100ml', product_type: 'EXTRAIT DE PARFUM SPRAY' });
                                    setBlogFormData({ title: '', slug: '', content: '', image_url: '', keywords: '', author: 'Kiks Artisan' });
                                    setPromoFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', expiry_date: '', usage_limit: '' });
                                }}
                                className="w-full md:w-auto flex items-center justify-center space-x-4 bg-white/5 border border-white/10 px-8 md:px-10 py-4 md:py-5 hover:bg-gold-500 hover:text-black transition-all group"
                            >
                                {isAdding ? <X size={18} /> : <Plus size={18} />}
                                <span className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] font-black uppercase">
                                    {isAdding ? 'Discard Draft' : `Add New ${activeTab === 'collections' ? 'Collection' : activeTab === 'products' ? 'Product' : activeTab === 'blogs' ? 'Blog' : 'Promo Code'}`}
                                </span>
                            </button>
                        </div>

                        {/* ADD FORM */}
                        <AnimatePresence>
                            {isAdding && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-4 sm:p-6 md:p-12 mb-10 md:mb-20 overflow-hidden"
                                >
                                    <form onSubmit={activeTab === 'collections' ? handleAddCollection : activeTab === 'products' ? handleAddProduct : activeTab === 'blogs' ? handleAddBlog : handleAddPromoCode} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-10">

                                        <div className="md:col-span-2 text-center pb-4 md:pb-6 border-b border-white/10 mb-2 md:mb-4">
                                            <h3 className="text-base md:text-lg tracking-[0.3em] md:tracking-[0.4em] text-gold-500 font-serif uppercase italic">
                                                {editingId ? `Editing ${activeTab === 'collections' ? 'Collection' : activeTab === 'products' ? 'Product' : activeTab === 'blogs' ? 'Blog' : 'Promo Code'}` : `New ${activeTab === 'collections' ? 'Collection' : activeTab === 'products' ? 'Product' : activeTab === 'blogs' ? 'Blog' : 'Promo Code'}`}
                                            </h3>
                                        </div>

                                        {activeTab !== 'promo-codes' && (
                                            <div className="md:col-span-2">
                                                <label className={labelClasses}>Visual Essence (Image)</label>
                                                <div
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="relative w-full h-40 sm:h-56 md:h-72 bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 hover:bg-white/[0.03] transition-all group overflow-hidden"
                                                >
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg"
                                                    />

                                                    {(activeTab === 'collections' ? colFormData.banner_url : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url) ? (
                                                        <div className="relative w-full h-full">
                                                            {isVideo(activeTab === 'collections' ? colFormData.banner_url : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url) ? (
                                                                <video src={getFullImageUrl(activeTab === 'collections' ? colFormData.banner_url : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url)} className="w-full h-full object-cover opacity-60" muted loop autoPlay />
                                                            ) : (
                                                                <img
                                                                    src={getFullImageUrl(activeTab === 'collections' ? colFormData.banner_url : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url)}
                                                                    className="w-full h-full object-cover opacity-60 transition-all group-hover:opacity-100"
                                                                />
                                                            )}
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.4em] font-black uppercase text-white bg-black/80 px-4 sm:px-6 py-2 sm:py-3 border border-white/10 text-center mx-2">Replace Content</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center p-8">
                                                            {uploading ? (
                                                                <Loader2 className="animate-spin text-gold-500 mb-6" size={32} />
                                                            ) : (
                                                                <Upload className="text-white/10 group-hover:text-gold-500 mb-6 transition-colors" size={32} />
                                                            )}
                                                            <span className="text-[11px] tracking-[0.4em] uppercase text-white/30 text-center">{uploading ? 'Analyzing Structure...' : 'Upload Cinematic Visual'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'collections' ? (
                                            <>
                                                <div><label className={labelClasses}>Collection Name</label><input required className={inputClasses} value={colFormData.name} onChange={e => setColFormData({ ...colFormData, name: e.target.value })} /></div>
                                                <div><label className={labelClasses}>Slug (URL part)</label><input required className={inputClasses} value={colFormData.slug} onChange={e => setColFormData({ ...colFormData, slug: e.target.value })} /></div>
                                                <div className="md:col-span-2"><label className={labelClasses}>Description</label><textarea required className={`${inputClasses} h-32`} value={colFormData.description} onChange={e => setColFormData({ ...colFormData, description: e.target.value })} /></div>
                                            </>
                                        ) : activeTab === 'blogs' ? (
                                            <>
                                                <div className="md:col-span-2"><label className={labelClasses}>Blog Title</label><input required className={inputClasses} value={blogFormData.title} onChange={e => setBlogFormData({ ...blogFormData, title: e.target.value })} /></div>
                                                <div><label className={labelClasses}>SEO Slug (URL)</label><input required className={inputClasses} value={blogFormData.slug} onChange={e => setBlogFormData({ ...blogFormData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} /></div>
                                                <div><label className={labelClasses}>Keywords (Comma separated)</label><input className={inputClasses} value={blogFormData.keywords} onChange={e => setBlogFormData({ ...blogFormData, keywords: e.target.value })} /></div>
                                                <div><label className={labelClasses}>Author</label><input className={inputClasses} value={blogFormData.author} onChange={e => setBlogFormData({ ...blogFormData, author: e.target.value })} /></div>
                                                <div className="md:col-span-2"><label className={labelClasses}>Journal Content</label><textarea required className={`${inputClasses} h-64 font-sans !normal-case tracking-normal`} value={blogFormData.content} onChange={e => setBlogFormData({ ...blogFormData, content: e.target.value })} /></div>
                                            </>
                                        ) : activeTab === 'promo-codes' ? (
                                            <>
                                                <div><label className={labelClasses}>Promo Code</label><input required className={inputClasses} value={promoFormData.code} onChange={e => setPromoFormData({ ...promoFormData, code: e.target.value })} placeholder="Summer2026" /></div>
                                                <div>
                                                    <label className={labelClasses}>Discount Type</label>
                                                    <select required className={inputClasses} value={promoFormData.discount_type} onChange={e => setPromoFormData({ ...promoFormData, discount_type: e.target.value })}>
                                                        <option value="percentage" className="bg-black">Percentage (%)</option>
                                                        <option value="fixed" className="bg-black">Fixed Amount (₹)</option>
                                                    </select>
                                                </div>
                                                <div><label className={labelClasses}>Discount Value</label><input required type="number" className={inputClasses} value={promoFormData.discount_value} onChange={e => setPromoFormData({ ...promoFormData, discount_value: e.target.value })} /></div>
                                                <div><label className={labelClasses}>Min Order Amount (₹)</label><input type="number" className={inputClasses} value={promoFormData.min_order_amount} onChange={e => setPromoFormData({ ...promoFormData, min_order_amount: e.target.value })} /></div>
                                                <div><label className={labelClasses}>Max Discount (₹ - for % type)</label><input type="number" className={inputClasses} value={promoFormData.max_discount} onChange={e => setPromoFormData({ ...promoFormData, max_discount: e.target.value })} /></div>
                                                <div><label className={labelClasses}>Expiry Date</label><input type="date" className={inputClasses} value={promoFormData.expiry_date} onChange={e => setPromoFormData({ ...promoFormData, expiry_date: e.target.value })} /></div>
                                                <div><label className={labelClasses}>Usage Limit (Total)</label><input type="number" className={inputClasses} value={promoFormData.usage_limit} onChange={e => setPromoFormData({ ...promoFormData, usage_limit: e.target.value })} /></div>
                                            </>
                                        ) : (
                                            <>

                                                <div className="md:col-span-1">
                                                    <label className={labelClasses}>Collection Registry</label>
                                                    <select required className={inputClasses} value={prodFormData.collection_id} onChange={e => setProdFormData({ ...prodFormData, collection_id: e.target.value })}>
                                                        <option value="" className="bg-black">Select Collection</option>
                                                        {collections.map(c => <option className="bg-black" key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className={labelClasses}>Essence Name</label>
                                                    <input required className={inputClasses} value={prodFormData.name} onChange={e => {
                                                        const name = e.target.value;
                                                        setProdFormData({ ...prodFormData, name, slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') });
                                                    }} placeholder="Noble Oud..." />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className={labelClasses}>Price (₹)</label>
                                                    <input required className={inputClasses} value={prodFormData.price} onChange={e => setProdFormData({ ...prodFormData, price: e.target.value })} placeholder="18,500" />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className={labelClasses}>Stock Registry</label>
                                                    <input type="number" className={inputClasses} value={prodFormData.stock_count} onChange={e => setProdFormData({ ...prodFormData, stock_count: e.target.value })} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Concentration Type (e.g. EXTRAIT DE PARFUM SPRAY)</label>
                                                    <input className={inputClasses} value={prodFormData.product_type} onChange={e => setProdFormData({ ...prodFormData, product_type: e.target.value })} placeholder="EXTRAIT DE PARFUM SPRAY" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Slug (URL Architecture)</label>
                                                    <input required className={inputClasses} value={prodFormData.slug} onChange={e => setProdFormData({ ...prodFormData, slug: e.target.value })} />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Narrative Description</label>
                                                    <textarea required className={`${inputClasses} h-24 md:h-32 text-xs md:text-sm`} value={prodFormData.description} onChange={e => setProdFormData({ ...prodFormData, description: e.target.value })} />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                                                    <div><label className={labelClasses}>Top Notes</label><input className={inputClasses} value={prodFormData.top_notes} onChange={e => setProdFormData({ ...prodFormData, top_notes: e.target.value })} /></div>
                                                    <div><label className={labelClasses}>Heart Notes</label><input className={inputClasses} value={prodFormData.heart_notes} onChange={e => setProdFormData({ ...prodFormData, heart_notes: e.target.value })} /></div>
                                                    <div><label className={labelClasses}>Base Notes</label><input className={inputClasses} value={prodFormData.base_notes} onChange={e => setProdFormData({ ...prodFormData, base_notes: e.target.value })} /></div>
                                                </div>

                                                <div className="md:col-span-2 mt-8 border-t border-white/5 pt-8">
                                                    <h4 className="text-[10px] tracking-[0.3em] font-black uppercase text-gold-500 mb-8 italic">Product Gallery & Assets</h4>

                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                        <div className="md:col-span-2">
                                                            <ImageUploadZone
                                                                label="Section Banner (Widescreen)"
                                                                value={prodFormData.story_banner}
                                                                onUpload={(e) => handleImageUpload(e, 'story_banner')}
                                                                height="h-40 md:h-56"
                                                            />
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <label className={labelClasses}>Product Story</label>
                                                            <textarea className={`${inputClasses} h-32 text-xs`} value={prodFormData.muse_story} onChange={e => setProdFormData({ ...prodFormData, muse_story: e.target.value })} placeholder="Describe the soul of the fragrance..." />
                                                        </div>

                                                        <ImageUploadZone
                                                            label="Side Portrait (Arched)"
                                                            value={prodFormData.muse_image}
                                                            onUpload={(e) => handleImageUpload(e, 'muse_image')}
                                                            height="h-[250px] md:h-[400px]"
                                                        />

                                                        <div className="flex flex-col space-y-10">
                                                            <div className="bg-white/5 p-6 border border-white/5">
                                                                <label className={labelClasses}>Detailed Ingredient Labels</label>
                                                                <div className="grid grid-cols-1 gap-6 mt-4">
                                                                    <div className="flex items-center space-x-4">
                                                                        <span className="text-[8px] text-white/20 w-12 tracking-widest uppercase">Top</span>
                                                                        <input className={inputClasses + " mb-0 bg-transparent"} value={prodFormData.top_note_label} placeholder="e.g. Sicilian Lemon" onChange={e => setProdFormData({ ...prodFormData, top_note_label: e.target.value })} />
                                                                    </div>
                                                                    <div className="flex items-center space-x-4">
                                                                        <span className="text-[8px] text-white/20 w-12 tracking-widest uppercase">Heart</span>
                                                                        <input className={inputClasses + " mb-0 bg-transparent"} value={prodFormData.heart_note_label} placeholder="e.g. Bulgarian Rose" onChange={e => setProdFormData({ ...prodFormData, heart_note_label: e.target.value })} />
                                                                    </div>
                                                                    <div className="flex items-center space-x-4">
                                                                        <span className="text-[8px] text-white/20 w-12 tracking-widest uppercase">Base</span>
                                                                        <input className={inputClasses + " mb-0 bg-transparent"} value={prodFormData.base_note_label} placeholder="e.g. Indian Oud" onChange={e => setProdFormData({ ...prodFormData, base_note_label: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white/[0.02] p-8 border border-white/5 flex-grow">
                                                                <label className={labelClasses + " mb-8"}>Note Icons (PNG/SVG)</label>
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                                                                    {['top_note_icon', 'heart_note_icon', 'base_note_icon'].map((field) => (
                                                                        <div key={field} className="flex flex-col items-center">
                                                                            <div
                                                                                onClick={() => {
                                                                                    const input = document.createElement('input');
                                                                                    input.type = 'file';
                                                                                    input.accept = 'image/*';
                                                                                    input.onchange = (e) => handleImageUpload(e, field);
                                                                                    input.click();
                                                                                }}
                                                                                className="w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center cursor-pointer hover:border-gold-500 group relative"
                                                                            >
                                                                                {prodFormData[field] ? (
                                                                                    <img src={getFullImageUrl(prodFormData[field])} className="w-8 h-8 object-contain" />
                                                                                ) : (
                                                                                    <Plus className="text-white/20 group-hover:text-gold-500" size={16} />
                                                                                )}
                                                                            </div>
                                                                            <p className="text-[7px] text-white/30 mt-3 uppercase tracking-tighter">{field.split('_')[0]}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 mt-8 border-t border-white/5 pt-8">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                                        <h4 className="text-[10px] tracking-[0.3em] font-black uppercase text-gold-500 italic">Volume Variations (Optional)</h4>
                                                        <button
                                                            type="button"
                                                            onClick={handleAddVariantField}
                                                            className="w-full sm:w-auto text-[9px] tracking-[0.2em] uppercase font-bold border border-gold-500/30 px-6 py-3 hover:bg-gold-500 hover:text-black transition-all flex items-center justify-center gap-3"
                                                        >
                                                            <Plus size={14} /> Add Variant
                                                        </button>
                                                    </div>

                                                    <div className="space-y-6">
                                                        {(prodFormData.variants || []).map((v, idx) => (
                                                            <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end bg-white/[0.02] p-5 md:p-6 border border-white/5 relative">
                                                                <div>
                                                                    <label className={labelClasses}>Size</label>
                                                                    <input
                                                                        placeholder="50ML"
                                                                        className={inputClasses + " mb-0 text-[10px]"}
                                                                        value={v.size}
                                                                        onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className={labelClasses}>Price</label>
                                                                    <input
                                                                        placeholder="12,500"
                                                                        className={inputClasses + " mb-0 text-[10px]"}
                                                                        value={v.price}
                                                                        onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className={labelClasses}>Stock</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="20"
                                                                        className={inputClasses + " mb-0 text-[10px]"}
                                                                        value={v.stock}
                                                                        onChange={(e) => handleUpdateVariant(idx, 'stock', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2 md:col-span-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveVariant(idx)}
                                                                        className="w-full bg-red-500/5 border border-red-500/10 text-red-500/60 py-3 md:py-4 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {(!prodFormData.variants || prodFormData.variants.length === 0) && (
                                                            <div className="py-10 text-center border border-dashed border-white/10 bg-white/[0.01]">
                                                                <p className="text-[10px] tracking-[0.3em] text-white/10 uppercase font-light italic">Standard 100ML baseline defined. No additional variants.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 mt-4 border-t border-white/5 pt-8">
                                                    <label className={labelClasses}>Supplementary Gallery Images</label>
                                                    <div className="flex flex-wrap gap-4 mb-4">
                                                        {(prodFormData.gallery_urls || []).map((url, i) => (
                                                            <div key={i} className="relative w-24 h-24 border border-white/10 group bg-zinc-900">
                                                                {isVideo(url) ? (
                                                                    <video src={getFullImageUrl(url)} className="w-full h-full object-cover opacity-60" muted />
                                                                ) : (
                                                                    <img src={getFullImageUrl(url)} className="w-full h-full object-cover opacity-60" />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setProdFormData(prev => ({ ...prev, gallery_urls: prev.gallery_urls.filter((_, idx) => idx !== i) }))}
                                                                    className="absolute top-1 right-1 bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                ><X size={12} /></button>
                                                            </div>
                                                        ))}

                                                        <div
                                                            onClick={() => galleryInputRef.current.click()}
                                                            className="w-24 h-24 border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 hover:text-gold-500 text-white/30 transition-colors"
                                                        >
                                                            <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} className="hidden" accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg" />
                                                            {uploadingGallery ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div className="md:col-span-2 pt-8">
                                            <button
                                                disabled={uploading}
                                                type="submit"
                                                className={`w-full py-6 text-[11px] font-black tracking-[0.5em] uppercase transition-all flex items-center justify-center ${uploading ? 'bg-zinc-800 text-white/20 cursor-wait' : 'bg-white text-black hover:bg-gold-500'}`}
                                            >
                                                {uploading ? 'Processing Architecture...' : (
                                                    <><Save size={18} className="mr-4" /> {editingId ? 'Save Modifications' : 'Finalize Selection'}</>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* LIST SECTION */}
                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                            {tabsLoading[activeTab] ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="animate-spin text-gold-500" size={32} />
                                </div>
                            ) : (
                                (activeTab === 'collections' ? collections : activeTab === 'products' ? products : activeTab === 'promo-codes' ? promoCodes : blogs).length === 0 ? (
                                    <div className="text-center py-20 text-white/20 tracking-widest uppercase text-xs">No records found</div>
                                ) : (
                                    (activeTab === 'collections' ? collections : activeTab === 'products' ? products : activeTab === 'promo-codes' ? promoCodes : blogs).map(item => (
                                        <div key={item.id} className="bg-white/[0.03] border border-white/5 p-5 md:p-8 hover:border-gold-500/30 transition-all">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                                <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded bg-zinc-900 flex-shrink-0 border border-white/10 flex items-center justify-center group relative">
                                                    {activeTab === 'promo-codes' ? (
                                                        <Ticket size={24} className="text-gold-500/50" />
                                                    ) : (
                                                        <img src={getFullImageUrl(item.banner_url || item.image_url)} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                                                    )}
                                                </div>
                                                <div className="flex-grow space-y-2">
                                                    <h3 className="text-sm md:text-base tracking-[0.2em] font-bold text-white uppercase line-clamp-1">{item.name || item.title || item.code}</h3>
                                                    <p className="text-[9px] md:text-[10px] tracking-[0.15em] text-white/40 uppercase italic leading-relaxed">
                                                        {activeTab === 'collections' ? item.slug :
                                                            activeTab === 'products' ? `${item.collection_name} | ${item.price} | Stock: ${item.stock_count || 0}` :
                                                                activeTab === 'promo-codes' ? `${item.discount_type === 'percentage' ? item.discount_value + '%' : '₹' + item.discount_value} OFF | Used: ${item.usage_count}/${item.usage_limit || '∞'}` :
                                                                    `BY ${item.author} | ${new Date(item.created_at).toLocaleDateString()}`}
                                                    </p>
                                                    <div className="flex items-center space-x-6 pt-4 border-t border-white/5 sm:border-none sm:pt-0">
                                                        <button onClick={() => handleEdit(activeTab, item)} className="text-white/30 hover:text-gold-500 transition-all flex items-center gap-2 uppercase text-[9px] font-black tracking-widest group">
                                                            <Edit3 size={14} className="group-hover:scale-110 transition-transform" /> <span>Edit</span>
                                                        </button>
                                                        <button onClick={() => handleDelete(activeTab === 'blogs' ? 'blogs' : activeTab, item.id)} className="text-white/30 hover:text-red-500 transition-all flex items-center gap-2 uppercase text-[9px] font-black tracking-widest group">
                                                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> <span>Remove</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </motion.div>
                )}

                {/* TAB CONTENT: CARTS (VAULT MANIFEST) */}
                {activeTab === 'carts' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {tabsLoading.carts ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-gold-500" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-white/10 p-6 md:p-10 gap-6">
                                    <div>
                                        <h2 className="text-xl font-serif tracking-[0.2em] uppercase italic">Vault Manifest</h2>
                                        <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-2">Monitoring active acquisitions & abandoned intent</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Active Vaults</p>
                                        <p className="text-2xl font-serif text-gold-500">{carts.length}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {carts.length === 0 ? (
                                        <div className="p-20 text-center text-white/20 uppercase tracking-[0.3em] border border-white/5">The manifest is currently clear</div>
                                    ) : (
                                        carts.map(cart => (
                                            <div key={cart.id} className="bg-white/5 border border-white/10 p-6 md:p-8 hover:border-gold-500/30 transition-all group">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="space-y-4 flex-1">
                                                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                                            <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 font-serif">
                                                                {(cart.user_email || cart.email)?.[0]?.toUpperCase() || 'G'}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black uppercase tracking-widest text-white">
                                                                    {cart.first_name ? `${cart.first_name} ${cart.last_name}` : 'Anonymous Guest'}
                                                                </p>
                                                                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
                                                                    {cart.user_email || cart.email || 'Restricted Identity'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                                                            {cart.items?.map((item, i) => (
                                                                <div key={i} className="flex items-center gap-4 bg-black/40 p-3 border border-white/5 group-hover:border-white/10 transition-colors">
                                                                    <div className="w-12 h-16 bg-zinc-900 flex-shrink-0">
                                                                        <img src={item.image_url || item.product_image} alt="" className="w-full h-full object-cover opacity-60" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] font-bold uppercase truncate text-white/80">{item.name || item.product_name}</p>
                                                                        <p className="text-[9px] text-gold-500/60 mt-1 uppercase tracking-widest">{item.quantity} Unit(s)</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="md:w-64 flex flex-col justify-between items-end text-right border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-[8px] uppercase tracking-[0.3em] text-white/20 mb-1">Status</p>
                                                                <span className="px-3 py-1 bg-gold-500/5 border border-gold-500/20 text-gold-500 text-[8px] font-black uppercase tracking-widest">Active</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-[8px] uppercase tracking-[0.3em] text-white/20 mb-1">Last Intelligence Sync</p>
                                                                <p className="text-[10px] text-white/60 font-sans">{new Date(cart.last_sync).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-6">
                                                            <p className="text-[8px] uppercase tracking-[0.3em] text-white/20 mb-1">Approx. Value</p>
                                                            <p className="text-lg font-serif text-white">
                                                                {formatCurrency(
                                                                    cart.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0,
                                                                    activeCurrency, rates, symbols
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
};

export default Admin;
