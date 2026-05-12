/* eslint-disable */
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
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { generateInvoice } from '../utils/generateInvoice';
import { generateShippingLabel } from '../utils/generateShippingLabel';
import { getFullImageUrl } from '../utils/url';
import PageLoader from '../components/PageLoader';
import { formatCurrency } from '../utils/currency';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Admin = () => {
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const { activeCurrency, rates, symbols } = useSelector(state => state.currency);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Standardized Auth Headers for the Palace Vault
  const getAdminHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET,
    'Authorization': `Bearer ${token}`
  });
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard'); // dashboard, orders, collections, products, blogs, marketing

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setIsAdding(false);
    setEditingId(null);
  };

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderSubTab, setOrderSubTab] = useState('pending'); // pending, processing, dispatch, returns, abandoned, cancelled
  const [reportType, setReportType] = useState('selling'); // selling, return
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [trashData, setTrashData] = useState({ orders: [], products: [], reviews: [], blogs: [], gallery: [] });
  const [reviews, setReviews] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [userSubTab, setUserSubTab] = useState('users'); // users, admins, requests
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [callbackFilter, setCallbackFilter] = useState('Pending');
  const [promoCodes, setPromoCodes] = useState([]);
  const [analytics, setAnalytics] = useState({ totalOrders: 0, totalRevenue: 0, bestSeller: 'N/A' });
  const [selectedWaitlistIds, setSelectedWaitlistIds] = useState([]);
  const [downloadedHistory, setDownloadedHistory] = useState({ invoices: [], labels: [] });
  const [carts, setCarts] = useState([]);
  const [selectedCarts, setSelectedCarts] = useState([]);

  // Marketing States
  const [popupSettings, setPopupSettings] = useState({ is_active: true, title: '', offer_text: '', image_url: '', delay_seconds: 5, redirect_url: '' });
  const [communityGallery, setCommunityGallery] = useState([]);
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [isAddingShowcase, setIsAddingShowcase] = useState(false);
  const [showcaseFormData, setShowcaseFormData] = useState({ name: '', description: '', image_url: '', product_link: '', display_order: 0 });

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
    carts: false,
    trash: false
  });

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing an existing item

  const [colFormData, setColFormData] = useState({ name: '', slug: '', banner_url: '', description: '', video_url: '' });
  const [mediaSourceTab, setMediaSourceTab] = useState('upload'); // 'upload' or 'link'
  const [prodFormData, setProdFormData] = useState({
    collection_id: '', name: '', slug: '', price: '', sale_price: '', image_url: '', gallery_urls: [],
    description: '', top_notes: '', heart_notes: '', base_notes: '', stock_count: 50,
    size: '100ml', variants: [],
    muse_story: '', muse_image: '', story_banner: '',
    top_note_icon: '', heart_note_icon: '', base_note_icon: '',
    top_note_label: '', heart_note_label: '', base_note_label: '',
    product_type: 'EXTRAIT DE PARFUM SPRAY',
    additional_info: '',
    top_notes_icons: [],
    heart_notes_icons: [],
    base_notes_icons: []
  });
  const [blogFormData, setBlogFormData] = useState({ title: '', slug: '', content: '', image_url: '', keywords: '', author: 'Kiks Artisan' });
  const [promoFormData, setPromoFormData] = useState({
    code: '', discount_type: 'percentage', discount_value: '',
    min_order_amount: '', max_discount: '', expiry_date: '', usage_limit: ''
  });
  const [adminFormData, setAdminFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [userSearch, setUserSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [productFormTab, setProductFormTab] = useState('general'); // general, olfactory, cinematic, additional

  const galleryInputRef = useRef(null);
  const formRef = useRef(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  
  // Signature Product (Elite Section) States
  const [signatureProduct, setSignatureProduct] = useState({
    image_url: '',
    name: '',
    description: '',
    strength: '',
    notes: '',
    link: ''
  });

  useEffect(() => {
    const isAdmin = user && (
      user.role === 'admin' ||
      user.email === 'kiksultraluxury@gmail.com' ||
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
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
      case 'users':
        fetchUsersData();
        fetchAdminsData();
        fetchDeletionRequests();
        break;
      case 'waitlist': fetchWaitlistData(); break;
      case 'promo-codes': fetchPromoCodesData(); break;
      case 'marketing': fetchMarketingData(); break;
      case 'homepage': setTimeout(() => fetchHomepageData(), 1000); break;
      case 'carts': fetchCartsData(); break;
      case 'trash': fetchTrashData(); break;
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

  const fetchTrashData = async () => {
    setTabsLoading(prev => ({ ...prev, trash: true }));
    try {
      const res = await fetch(`${API_URL}/api/trash`, { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTrashData(data);
      }
    } catch (e) {
      console.error("Trash retrieval failure:", e);
    } finally {
      setTabsLoading(prev => ({ ...prev, trash: false }));
    }
  };

  const handleRestoreItem = async (entity, id) => {
    try {
      const res = await fetch(`${API_URL}/api/trash/restore/${entity}/${id}`, {
        method: 'POST',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        showSuccessToast('Item restored to active registry.');
        fetchTrashData();
        fetchData(); // Refresh main data too
      }
    } catch (e) {
      showErrorToast('Restoration failed.');
    }
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

  const fetchShowcaseData = async () => {
    setTabLoading('marketing', true);
    try {
      const res = await fetch(`${API_URL}/api/marketing/showcase`);
      if (res.ok) setShowcaseProducts(await res.json());
    } catch (e) { console.error("Showcase fetch failed", e); }
    finally { setTabLoading('marketing', false); }
  };

  const handleSaveShowcase = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const url = editingId ? `${API_URL}/api/marketing/showcase/${editingId}` : `${API_URL}/api/marketing/showcase`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(showcaseFormData)
      });
      if (res.ok) {
        showSuccessToast('Showcase Manifest Updated.');
        setIsAddingShowcase(false);
        setEditingId(null);
        setShowcaseFormData({ name: '', description: '', image_url: '', product_link: '', display_order: 0 });
        setTimeout(() => fetchHomepageData(), 1000);
      } else {
        showErrorToast('Failed to save showcase entry.');
      }
    } catch (err) { showErrorToast('Critical network fault.'); }
    finally { setIsProcessing(false); }
  };

  const handleDeleteShowcase = async (id) => {
    if (!window.confirm('Remove this product from the luxury showcase?')) return;
    try {
      const res = await fetch(`${API_URL}/api/marketing/showcase/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        showSuccessToast('Showcase item removed.');
        setShowcaseProducts(showcaseProducts.filter(p => p.id !== id));
      }
    } catch (err) { showErrorToast('Deletion failed.'); }
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

  const fetchCartsData = async () => {
    setTabLoading('carts', true);
    try {
      const res = await fetch(`${API_URL}/api/carts/all`, { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Only show carts that have items
        const activeCarts = data.filter(cart => cart.items && cart.items.length > 0);
        setCarts(activeCarts);
      }
    } catch (e) { console.error("Carts fetch failed", e); }
    finally { setTabLoading('carts', false); }
  };

  const handleRemoveCart = async (cartId) => {
    if (!window.confirm('Are you certain you want to permanently clear this user\'s entire vault session? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/api/carts/${cartId}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        showSuccessToast('Vault session cleared.');
        fetchCartsData();
      } else {
        showErrorToast('Failed to clear vault.');
      }
    } catch (e) { showErrorToast('Network error during removal.'); }
  };

  const handleRemoveCartItem = async (cartId, productId) => {
    if (!window.confirm('Surgically remove this specific item from the user\'s vault?')) return;
    try {
      const res = await fetch(`${API_URL}/api/carts/${cartId}/remove-item`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        showSuccessToast('Item removed from user cart.');
        fetchCartsData();
      } else {
        showErrorToast('Failed to remove item.');
      }
    } catch (e) { showErrorToast('Network error.'); }
  };

  const handleBulkRemoveCarts = async () => {
    if (!selectedCarts.length) return;
    if (!window.confirm(`Permanently clear ${selectedCarts.length} selected vault sessions?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/carts/bulk-delete`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ ids: selectedCarts })
      });
      if (res.ok) {
        showSuccessToast(`${selectedCarts.length} vaults cleared.`);
        setSelectedCarts([]);
        fetchCartsData();
      } else {
        showErrorToast('Bulk removal failed.');
      }
    } catch (e) { showErrorToast('Network error.'); }
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

  const updateWaitlistStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/waitlist/${id}/status`, {
        method: 'PUT',
        headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showSuccessToast('Status updated.');
        fetchWaitlistData();
      } else {
        showErrorToast('Failed to update status.');
      }
    } catch (e) {
      showErrorToast('Network error.');
    }
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
      const [popupRes, subRes] = await Promise.all([
        fetch(`${API_URL}/api/marketing/popup`),
        fetch(`${API_URL}/api/newsletter/admin/list`, { headers: getAdminHeaders() })
      ]);
      if (popupRes.ok) setPopupSettings(await popupRes.json());
      if (subRes.ok) setNewsletterSubscribers(await subRes.json());
    } catch (e) { console.error("Marketing fetch failed", e); }
    finally { setTabLoading('marketing', false); }
  };

  const fetchHomepageData = async () => {
    setTabLoading('homepage', true);
    try {
      const [settingsRes, showcaseRes, galleryRes] = await Promise.all([
        fetch(`${API_URL}/api/settings`),
        fetch(`${API_URL}/api/marketing/showcase`),
        fetch(`${API_URL}/api/marketing/gallery`)
      ]);
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setHeroVideoUrl(data.hero_video_url || '');
        // Ensure we handle nulls from DB and provide defaults for the form
        setSignatureProduct({
          image_url: data.signature_product_image_url || '',
          name: data.signature_product_name || '',
          description: data.signature_product_desc || '',
          strength: data.signature_product_strength || '',
          notes: data.signature_product_notes || '',
          link: data.signature_product_link || ''
        });
      }
      if (showcaseRes.ok) setShowcaseProducts(await showcaseRes.json());
      if (galleryRes.ok) setCommunityGallery(await galleryRes.json());
    } catch (e) { console.error("Homepage fetch failed", e); }
    finally { setTabLoading('homepage', false); }
  };

  const handleSaveHeroVideo = async () => {
    // Validation: If any signature field is filled, all must be filled
    const fields = ['image_url', 'name', 'description', 'strength', 'notes', 'link'];
    const filledFields = fields.filter(f => signatureProduct[f] && signatureProduct[f].trim() !== '');
    
    if (filledFields.length > 0 && filledFields.length < fields.length) {
      showErrorToast('Luxury Alert: Signature Manifesto must be complete. Please fill all starred fields.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hero_video_url: heroVideoUrl,
          signature_product_image_url: signatureProduct.image_url,
          signature_product_name: signatureProduct.name,
          signature_product_desc: signatureProduct.description,
          signature_product_strength: signatureProduct.strength,
          signature_product_notes: signatureProduct.notes,
          signature_product_link: signatureProduct.link
        })
      });
      if (res.ok) {
        showSuccessToast('Homepage settings updated.');
        // Refresh local data to confirm persistence
        fetchHomepageData();
      } else {
        const errData = await res.json();
        showErrorToast(errData.error || 'Failed to update homepage settings.');
      }
    } catch (e) { showErrorToast('Network error.'); }
    finally { setIsProcessing(false); }
  };

  const handleUpdatePopup = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/marketing/popup`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(popupSettings)
      });
      if (res.ok) showSuccessToast('Popup settings updated.');
      else showErrorToast('Failed to update popup.');
    } catch (e) { showErrorToast('Network error.'); }
    finally { setIsProcessing(false); }
  };

  const handleBulkGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', 'kiks_lifestyle');

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET || 'KIKS-ELITE-SECRET-2026' },
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();

          const saveRes = await fetch(`${API_URL}/api/marketing/gallery`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({
              image_url: uploadData.url,
              display_order: communityGallery.length + successCount
            })
          });

          if (saveRes.ok) {
            const savedImage = await saveRes.json();
            setCommunityGallery(prev => [...prev, savedImage]);
            successCount++;
          }
        }
      }

      if (successCount > 0) {
        showSuccessToast(`${successCount} Visuals Manifested Successfully.`);
        setTimeout(() => fetchHomepageData(), 2000);
      }
    } catch (error) {
      console.error("Bulk Upload Error:", error);
      showErrorToast("Gallery Manifestation Fault.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddGalleryImage = async (url) => {
    try {
      const res = await fetch(`${API_URL}/api/marketing/gallery`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ image_url: url, display_order: communityGallery.length })
      });
      if (res.ok) {
        const savedImage = await res.json();
        setCommunityGallery(prev => [...prev, savedImage]);
        showSuccessToast('Image added to gallery.');
        setTimeout(() => fetchHomepageData(), 2000);
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
        setCommunityGallery(prev => prev.filter(img => img.id !== id));
        setTimeout(() => fetchHomepageData(), 2000);
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

  const fetchDeletionRequests = async () => {
    setTabLoading('users', true);
    try {
      const res = await fetch(`${API_URL}/api/users/deletion-requests`, { headers: getAdminHeaders() });
      if (res.ok) setDeletionRequests(await res.json());
    } catch (e) { console.error("Deletion requests fetch failed", e); }
    finally { setTabLoading('users', false); }
  };

  const handleApproveDeletion = async (id) => {
    if (!window.confirm('Are you absolutely certain? This will soft-delete the account, log the user out immediately, and hide them from the registry. This is a professional-grade administrative action.')) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/users/approve-deletion/${id}`, {
        method: 'POST',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        showSuccessToast('Account deletion approved and processed.');
        fetchUsersData();
        fetchDeletionRequests();
      } else {
        const data = await res.json();
        showErrorToast(data.msg || 'Approval failed.');
      }
    } catch (e) {
      showErrorToast('System fault during approval.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineDeletion = async (id) => {
    if (!window.confirm('Decline this deletion request? The patron will be notified that their account remains active and the request button will return to their dashboard.')) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/users/decline-deletion/${id}`, {
        method: 'POST',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        showSuccessToast('Deletion request declined. Patron notified.');
        fetchUsersData();
        fetchDeletionRequests();
      } else {
        const data = await res.json();
        showErrorToast(data.msg || 'Action failed.');
      }
    } catch (e) {
      showErrorToast('System fault during action.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
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
    finally { setIsProcessing(false); }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(data.msg);
        fetchUsersData();
        fetchAdminsData();
      } else {
        showErrorToast(data.msg || 'Role update failed.');
      }
    } catch (e) {
      showErrorToast('Registry communication fault.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user? They will be hidden from the registry immediately but can be reactivated if requested within the grace period.')) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        showSuccessToast('User removed from the registry.');
        fetchUsersData();
      } else {
        const data = await res.json();
        showErrorToast(data.msg || 'Deactivation failed.');
      }
    } catch (e) {
      showErrorToast('Registry communication fault.');
    }
  };

  const handleBulkDeleteUsers = async (idsToDelete) => {
    const targetIds = Array.isArray(idsToDelete) ? idsToDelete : selectedUsers;
    if (!targetIds || targetIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to deactivate ${targetIds.length} selected user(s)? They will no longer appear in the registry.`)) return;

    try {
      const res = await fetch(`${API_URL}/api/users/bulk-delete`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ ids: targetIds })
      });

      if (res.ok) {
        showSuccessToast(`${targetIds.length} users deactivated successfully.`);
        setSelectedUsers(selectedUsers.filter(id => !targetIds.includes(id)));
        fetchUsersData();
      } else {
        const data = await res.json();
        showErrorToast(data.msg || 'Bulk deactivation failed.');
      }
    } catch (e) {
      showErrorToast('Registry synchronization fault.');
    }
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
    else if (tab === 'trash') fetchTrashData();
  };

  const handleImageUpload = async (e, targetField = null) => {
    const file = e.target.files[0] || (e.dataTransfer && e.dataTransfer.files[0]);
    if (!file) return;

    setUploading(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const folderMap = {
        'collections': 'kiks_collections',
        'products': 'kiks_products',
        'blogs': 'kiks_blogs',
        'marketing': 'kiks_marketing'
      };
      
      let folder = targetField === 'popup' ? 'kiks_marketing' : (folderMap[activeTab] || 'kiks_general');
      
      // Dynamic product-specific subfolder logic
      if (activeTab === 'products' && prodFormData.slug) {
        folder = `kiks_products/${prodFormData.slug}`;
      } else if (activeTab === 'collections' && colFormData.slug) {
        folder = `kiks_collections/${colFormData.slug}`;
      }
      
      formData.append('folder', folder);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET || 'KIKS-ELITE-SECRET-2026',
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
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
      } else if (targetField === 'showcase') {
        setShowcaseFormData(prev => ({ ...prev, image_url: data.url }));
      } else if (targetField) {
        setProdFormData(prev => ({ ...prev, [targetField]: data.url }));
      } else if (activeTab === 'collections') {
        if (isVideo(data.url)) {
          setColFormData(prev => ({ ...prev, video_url: data.url, banner_url: '' }));
        } else {
          setColFormData(prev => ({ ...prev, banner_url: data.url, video_url: '' }));
        }
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
      <label className="text-[10px] tracking-[0.2em] uppercase text-black/60 mb-3 block">{label}</label>
      <div
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg';
          input.onchange = onUpload;
          input.click();
        }}
        className={`relative w-full ${height} border-2 border-dashed border-black/10 bg-white hover:bg-neutral-50 hover:border-black/30 transition-all cursor-pointer group overflow-hidden flex flex-col items-center justify-center shadow-sm`}
      >
        {value ? (
          <>
            {isVideo(value) ? (
              <video src={getFullImageUrl(value)} className="w-full h-full object-cover opacity-90" muted loop autoPlay />
            ) : (
              <img src={getFullImageUrl(value)} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/20 transition-all">
              <span className="bg-black text-white px-6 py-3 text-[9px] tracking-[0.3em] uppercase border border-white/10 shadow-xl transform group-hover:scale-105 transition-transform font-black">Replace Asset</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-neutral-50 rounded-full p-6 mb-4 group-hover:bg-white transition-colors">
              {uploading ? (
                <Loader2 className="animate-spin text-black" size={28} />
              ) : (
                <Upload size={28} className="text-black/20 group-hover:text-black transition-colors" />
              )}
            </div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-black/40 group-hover:text-black  font-black">Upload Content</span>
          </>
        )}
      </div>
      {value && <p className="text-[8px] text-black/40 mt-3 truncate max-w-full font-mono uppercase tracking-tighter font-black">{value}</p>}
    </div>
  );

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingGallery(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const folder = prodFormData.slug ? `kiks_products/${prodFormData.slug}` : 'kiks_products';
      formData.append('folder', folder);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET || 'KIKS-ELITE-SECRET-2026',
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
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

    if (!colFormData.banner_url && !colFormData.video_url) {
      return showErrorToast('Please upload a visual banner first.');
    }

    setIsProcessing(true);
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
        setColFormData({ name: '', slug: '', banner_url: '', description: '', video_url: '' });
        fetchData();
      } else {
        showErrorToast(data.msg || 'Registry update failed.');
      }
    } catch (error) {
      showErrorToast('Operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!prodFormData.image_url) {
      return showErrorToast('Please upload a product visual first.');
    }

    setIsProcessing(true);
    try {
      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;
      const method = editingId ? 'PUT' : 'POST';

      // Stringify complex arrays for database JSON columns, keep native arrays for DB array columns
      const payload = {
        ...prodFormData,
        top_notes_icons: JSON.stringify(prodFormData.top_notes_icons || []),
        heart_notes_icons: JSON.stringify(prodFormData.heart_notes_icons || []),
        base_notes_icons: JSON.stringify(prodFormData.base_notes_icons || []),
        gallery_urls: prodFormData.gallery_urls || [], // Keep as native array for PG TEXT[]
        variants: JSON.stringify(prodFormData.variants || [])
      };

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(`Product ${editingId ? 'Modified in' : 'Manifested into'} the Vault.`);
        setIsAdding(false);
        setEditingId(null);
        setProdFormData({
          collection_id: '', name: '', slug: '', price: '', sale_price: '', image_url: '', gallery_urls: [],
          description: '', top_notes: '', heart_notes: '', base_notes: '', stock_count: 50,
          size: '100ml', variants: [],
          muse_story: '', muse_image: '', story_banner: '',
          top_note_icon: '', heart_note_icon: '', base_note_icon: '',
          top_note_label: '', heart_note_label: '', base_note_label: '',
          product_type: 'EXTRAIT DE PARFUM SPRAY',
          additional_info: '',
          top_notes_icons: [],
          heart_notes_icons: [],
          base_notes_icons: []
        });
        fetchData();
      } else {
        showErrorToast(data.msg || 'Product manifestation failed.');
      }
    } catch (error) {
      showErrorToast('Operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    setIsProcessing(true);
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
      setIsProcessing(false);
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
        video_url: item.video_url || '',
        description: item.description
      });
    } else if (type === 'products') {
      setProdFormData({
        collection_id: item.collection_id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        sale_price: item.sale_price || '',
        image_url: item.image_url,
        gallery_urls: item.gallery_urls || [],
        description: item.description,
        top_notes: item.top_notes || '',
        heart_notes: item.heart_notes || '',
        base_notes: item.base_notes || '',
        stock_count: item.stock_count !== undefined ? item.stock_count : 50,
        size: item.size || '100ml',
        variants: typeof item.variants === 'string' ? JSON.parse(item.variants) : (item.variants || []),
        muse_story: item.muse_story || '',
        muse_image: item.muse_image || '',
        story_banner: item.story_banner || '',
        top_note_icon: item.top_note_icon || '',
        heart_note_icon: item.heart_note_icon || '',
        base_note_icon: item.base_note_icon || '',
        top_note_label: item.top_note_label || '',
        heart_note_label: item.heart_note_label || '',
        base_note_label: item.base_note_label || '',
        product_type: item.product_type || 'EXTRAIT DE PARFUM SPRAY',
        additional_info: item.additional_info || '',
        top_notes_icons: typeof item.top_notes_icons === 'string' ? JSON.parse(item.top_notes_icons) : (item.top_notes_icons || []),
        heart_notes_icons: typeof item.heart_notes_icons === 'string' ? JSON.parse(item.heart_notes_icons) : (item.heart_notes_icons || []),
        base_notes_icons: typeof item.base_notes_icons === 'string' ? JSON.parse(item.base_notes_icons) : (item.base_notes_icons || [])
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
      variants: [...(prev.variants || []), { size: '', price: '', stock: '', color: '' }]
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
      <div className="bg-white min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  const inputClasses = "w-full bg-neutral-50 border border-black/5 p-3 md:p-4 text-[11px] md:text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-all font-medium tracking-[0.1em] md:tracking-[0.2em] mb-4";
  const labelClasses = "text-[11px] md:text-xs tracking-[0.3em] text-black/60 uppercase block mb-2 mt-4";

  return (
    <div className="bg-white min-h-screen text-black pt-24 md:pt-40 pb-20 px-4 md:px-10 lg:px-20 overflow-x-hidden relative">
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-black/[0.02] blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />

      {/* NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex flex-col space-y-4 max-w-[calc(100vw-3rem)]">
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-white border border-black/10 p-4 md:p-6 flex items-center space-x-4 shadow-2xl backdrop-blur-xl"
            >
              <CheckCircle2 className="text-black flex-shrink-0" size={18} />
              <span className="text-[9px] md:text-[10px] tracking-[0.2em] text-black uppercase font-bold font-black">{successMessage}</span>
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-white border border-red-600/20 p-4 md:p-6 flex items-center space-x-4 shadow-2xl backdrop-blur-xl"
            >
              <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
              <span className="text-[9px] md:text-[10px] tracking-[0.2em] text-black uppercase font-bold font-black">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10" ref={formRef}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-16 gap-6">
          <div>
            <h1 className="text-2xl md:text-5xl font-serif tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 text-black">Admin Panel</h1>
            <p className="text-black text-[10px] md:text-[12px] uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4 md:mb-14 flex flex-wrap items-center gap-3 md:gap-6 font-bold">
              <span>Management Console</span>
              {waitlist.filter(e => e.request_type === "callback").length > 0 && (
                <span className="border-l border-black/20 pl-3 md:pl-6">
                  {waitlist.filter(e => e.request_type === "callback").length} Pending Callbacks
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Responsive Tab Navigation */}
        <div className="mb-16 border-b border-black/5 pb-4">
          {/* Mobile Tab Dropdown */}
          <div className="md:hidden relative mb-4">
            <select
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value)}
              className="w-full bg-white border border-black/10 p-4 text-[10px] tracking-[0.3em] uppercase text-black focus:outline-none appearance-none"
            >
              {['dashboard', 'orders', 'users', 'collections', 'products', 'blogs', 'reviews', 'waitlist', 'promo-codes', 'marketing', 'homepage', 'carts', 'trash'].map(tab => {
                const callbackCount = tab === 'waitlist' ? waitlist.filter(e => e.request_type === 'callback').length : 0;
                return (
                  <option key={tab} value={tab}>
                    {tab.toUpperCase()} {callbackCount > 0 ? `(${callbackCount})` : ''}
                  </option>
                );
              })}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={18} className="text-black/40" />
            </div>
          </div>

          {/* Desktop Tab Links */}
          <div className="hidden md:flex flex-wrap gap-x-8 gap-y-6">
            {['dashboard', 'orders', 'users', 'collections', 'products', 'blogs', 'reviews', 'waitlist', 'promo-codes', 'marketing', 'homepage', 'carts', 'trash'].map(tab => {
              const callbackCount = tab === 'waitlist' ? waitlist.filter(e => e.request_type === 'callback').length : 0;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`text-[10px] tracking-[0.3em] uppercase pb-2 transition-all whitespace-nowrap relative flex items-center ${activeTab === tab ? 'text-black ' : 'text-black/40 hover:text-black'} font-black`}
                >
                  {tab}
                  {callbackCount > 0 && (
                    <span className="ml-2 bg-black text-white px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">
                      {callbackCount}
                    </span>
                  )}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-black" />
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
                <Loader2 className="animate-spin text-black" size={32} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {/* Analytics Cards */}
                  <div className="bg-neutral-50 border border-black/5 p-8 hover:border-black/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[11px] tracking-widest text-black/40 font-light">Total Revenue</h3>
                      <DollarSign className="text-black" size={18} />
                    </div>
                    <p className="text-4xl font-serif tracking-widest text-black">
                      {formatCurrency(analytics.totalRevenue, activeCurrency, rates, symbols)}
                    </p>
                    <p className="text-[12px] tracking-wider text-black/50 mt-4 font-medium">Real-time Vault Total</p>
                  </div>
                  <div className="bg-neutral-50 border border-black/5 p-8 hover:border-black/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[11px] tracking-widest text-black/40 font-light">Total Orders</h3>
                      <Package className="text-black" size={18} />
                    </div>
                    <p className="text-4xl font-serif tracking-widest text-black">{analytics.totalOrders}</p>
                    <p className="text-[12px] tracking-wider text-black/50 mt-4 font-medium">Verified Customer Manifests</p>
                  </div>
                  <div className="bg-neutral-50 border border-black/5 p-8 hover:border-black/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[11px] tracking-widest text-black/40 font-light">Best Seller</h3>
                      <TrendingUp className="text-black" size={18} />
                    </div>
                    <p className="text-2xl font-serif tracking-widest text-black truncate capitalize">{analytics.bestSeller}</p>
                    <p className="text-[12px] tracking-wider text-black/50 mt-4 font-medium">Peak Olfactory Demand</p>
                  </div>
                </div>

                <h2 className="text-xl font-serif tracking-[0.2em] uppercase mb-8 mt-12 text-black">Fast Inventory Restock</h2>
                <p className="text-[13px] text-black/60 tracking-wider mb-6 font-medium">Quickly adjust available physical bottles for each fragrance.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-neutral-50 border border-black/5 p-6 flex justify-between items-center group hover:border-black/20 transition-all">
                      <div className="flex items-center space-x-6">
                        <img src={getFullImageUrl(p.image_url)} alt="" className="w-12 h-12 object-cover border border-black/5 transition-all" />
                        <div>
                          <h4 className="text-[11px] tracking-wider text-black group-hover:text-black/80 capitalize font-medium">{p.name}</h4>
                          <p className="text-[10px] text-black/30 tracking-wider capitalize font-light">{p.collection_name}</p>
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
                            className={`w-24 bg-white border border-black/10 text-center text-[11px] py-2 focus:outline-none focus:border-black transition-colors ${p.stock_count <= 10 ? 'text-red-600' : 'text-black'}`}
                          />
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity whitespace-nowrap">
                            <span className="text-[7px] tracking-widest text-black/40 uppercase font-black">Press Enter to Vault</span>
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
                <Loader2 className="animate-spin text-black" size={32} />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Registry Intelligence & Reporting */}
                <div className="bg-neutral-50 border border-black/5 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-10">
                  <div className="max-w-md">
                    <h3 className="text-[11px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] uppercase text-black mb-2 md:mb-3">Monthly Reports</h3>
                    <p className="text-[9px] md:text-[10px] tracking-widest text-black/40 uppercase leading-relaxed  font-black">Generate monthly sales manifests for accounting and inventory audit.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="bg-white border border-black/10 text-[9px] md:text-[10px] tracking-widest uppercase text-black px-4 py-3 focus:outline-none focus:border-black transition-colors"
                      >
                        <option value="selling">Selling Report</option>
                        <option value="return">Return Report</option>
                      </select>
                      <select
                        id="reportMonth"
                        defaultValue={new Date().getMonth()}
                        className="bg-white border border-black/10 text-[9px] md:text-[10px] tracking-widest uppercase text-black px-4 py-3 focus:outline-none focus:border-black transition-colors"
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i} value={i}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                      </select>
                      <select
                        id="reportYear"
                        defaultValue={new Date().getFullYear()}
                        className="bg-white border border-black/10 text-[9px] md:text-[10px] tracking-widest uppercase text-black px-4 py-3 focus:outline-none focus:border-black transition-colors"
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
                      className="bg-black text-white px-8 py-3 text-[10px] tracking-widest uppercase hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                      <FileSpreadsheet size={16} /> Export {reportType === 'selling' ? 'Sales' : 'Returns'}
                    </button>
                  </div>
                </div>
                {/* Order Sub-Tabs */}
                <div className="flex items-center space-x-6 mb-8 border-b border-black/5 pb-2 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'pending', label: 'Pending', count: orders.filter(o => !o.status || o.status === 'On Hold' || o.status === 'Pending').length },
                    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'Accepted' || o.status === 'Processing').length },
                    { id: 'dispatch', label: 'Dispatch', count: orders.filter(o => o.status === 'Dispatch' || o.status === 'Dispatched' || o.status === 'Delivered').length },
                    { id: 'returns', label: 'Returns', count: orders.filter(o => o.status === 'RTO Returned' || o.status === 'Customer Returned').length },
                    { id: 'abandoned', label: 'Payment Not Completed', count: orders.filter(o => o.status === 'Payment Pending' || o.status === 'Abandoned').length },
                    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled' || o.status === 'CANCELLED - PARTIAL COD').length }
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setOrderSubTab(sub.id); setSelectedOrders([]); }}
                      className={`text-[9px] md:text-[10px] tracking-[0.2em] uppercase pb-3 transition-all relative flex items-center gap-3 whitespace-nowrap ${orderSubTab === sub.id ? 'text-black ' : 'text-black/40 hover:text-black'} font-black`}
                    >
                      {sub.label}
                      <span className={`px-2 py-0.5 rounded-full text-[7px] ${orderSubTab === sub.id ? 'bg-black text-white' : 'bg-neutral-100 text-black/40'}`}>
                        {sub.count}
                      </span>
                      {orderSubTab === sub.id && (
                        <motion.div layoutId="orderSubTabIndicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black" />
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
                    if (orderSubTab === 'abandoned') return o.status === 'Payment Pending' || o.status === 'Abandoned';
                    if (orderSubTab === 'cancelled') return o.status === 'Cancelled' || o.status === 'CANCELLED - PARTIAL COD';
                    return false; // Professional safety: Show nothing if tab is unrecognized
                  });
                  const visibleSelected = selectedOrders.filter(id => filteredOrders.some(o => o.id === id));
                  const hasAccepted = (orderSubTab === 'processing' || orderSubTab === 'dispatch') && filteredOrders.some(o => visibleSelected.includes(o.id) && (o.status === 'Accepted' || o.status === 'Dispatched' || o.status === 'Delivered'));
                  const hasOnHold = (orderSubTab === 'pending') && filteredOrders.some(o => visibleSelected.includes(o.id) && (!o.status || o.status === 'On Hold' || o.status === 'Pending'));

                  if (visibleSelected.length === 0) return null;

                  return (
                    <div className="bg-black border border-black/10 p-4 flex flex-wrap items-center justify-between gap-4 mb-4">
                      <span className="text-[10px] text-white uppercase font-bold tracking-widest font-black">
                        {visibleSelected.length} Order{visibleSelected.length > 1 ? 's' : ''} Selected
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
                            <button onClick={() => handleBulkInvoice(visibleSelected)} className="bg-neutral-50 border border-black/10 text-black px-5 py-2 text-[10px] tracking-widest uppercase hover:bg-black hover:text-white transition-all font-bold flex items-center gap-2">
                              <FileText size={12} /> Bulk Invoices
                            </button>
                            <button onClick={() => handleBulkLabel(visibleSelected)} className="bg-black border border-black text-white px-5 py-2 text-[10px] tracking-widest uppercase hover:bg-neutral-800 transition-all font-bold flex items-center gap-2">
                              <Package size={12} /> Bulk Packing Slips
                            </button>
                          </>
                        )}
                        <button onClick={() => handleBulkDelete(visibleSelected)} className="bg-red-600/5 border border-red-600/10 text-red-600 px-5 py-2 text-[10px] tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all font-bold flex items-center gap-2">
                          <Trash2 size={12} /> Delete Selected
                        </button>
                      </div>
                    </div>
                  );
                })()}
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white border border-black/10 overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left text-[11px] tracking-[0.1em] text-black min-w-[1000px]">
                    <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.4em] text-black border-b border-black/10">
                      <tr>
                        <th className="p-6 w-10">
                          {(() => {
                            const filteredItems = orders.filter(o => {
                              if (orderSubTab === 'pending') return !o.status || o.status === 'On Hold' || o.status === 'Pending';
                              if (orderSubTab === 'processing') return o.status === 'Accepted' || o.status === 'Processing';
                              if (orderSubTab === 'dispatch') return o.status === 'Dispatch' || o.status === 'Dispatched' || o.status === 'Delivered';
                              if (orderSubTab === 'returns') return o.status === 'RTO Returned' || o.status === 'Customer Returned';
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
                          if (orderSubTab === 'pending') return !o.status || o.status === 'On Hold' || o.status === 'Pending';
                          if (orderSubTab === 'processing') return o.status === 'Accepted' || o.status === 'Processing';
                          if (orderSubTab === 'dispatch') return o.status === 'Dispatch' || o.status === 'Dispatched' || o.status === 'Delivered';
                          if (orderSubTab === 'returns') return o.status === 'RTO Returned' || o.status === 'Customer Returned';
                          if (orderSubTab === 'abandoned') return o.status === 'Payment Pending' || o.status === 'Abandoned';
                          if (orderSubTab === 'cancelled') return o.status === 'Cancelled' || o.status === 'CANCELLED - PARTIAL COD';
                          return false;
                        });

                        if (filteredOrders.length === 0) {
                          return <tr><td colSpan="6" className="p-12 text-center text-black/40 uppercase tracking-widest bg-neutral-50/50 font-black">No Orders in {orderSubTab.toUpperCase()}</td></tr>;
                        }

                        return filteredOrders.map(order => (
                          <tr key={order.id} className="border-b border-black/5 hover:bg-neutral-50 transition-colors">
                            <td className="p-6">
                              <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer accent-black"
                                checked={selectedOrders.includes(order.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedOrders(prev => [...prev, order.id]);
                                  else setSelectedOrders(prev => prev.filter(id => id !== order.id));
                                }}
                              />
                            </td>
                            <td className="p-6 font-serif text-black text-sm">#{order.id.toString().padStart(4, '0')}</td>
                            <td className="p-6">
                              <p className=" uppercase tracking-widest text-black text-sm font-black">{order.customer_name}</p>
                              <p className="text-[11px] text-black/80 mt-1.5 lowercase font-sans font-medium">{order.customer_email}</p>
                              <p className="text-[11px] text-black/80 mt-1 pb-2 border-b border-black/5 mb-2 font-mono font-bold">{order.customer_phone || 'N/A'}</p>
                              <p className="text-[10px] text-black/60 truncate max-w-[250px] uppercase tracking-normal leading-relaxed font-black">{order.shipping_address}</p>
                            </td>
                            <td className="p-6">
                              {order.items?.map(it => (
                                <p key={it.id} className="text-xs uppercase tracking-wide mb-2 font-black"><span className="text-black ">{it.quantity}x</span> <span className="text-black/80">{it.product_name}</span></p>
                              ))}
                              {order.customer_note && (
                                <div className="mt-4 pt-3 border-t border-black/10">
                                  <p className="text-[9px] text-black uppercase mb-1 tracking-widest font-black">Client Note:</p>
                                  <p className="text-[10px] text-black/60 leading-relaxed font-serif ">"{order.customer_note}"</p>
                                </div>
                              )}
                            </td>
                            <td className="p-6">
                              <div className="flex flex-col space-y-2">
                                <span className=" text-black uppercase text-sm">
                                  {formatCurrency(order.total_amount, activeCurrency, rates, symbols)}
                                </span>
                                <span className="text-[10px] tracking-[0.2em] uppercase text-black/60 font-bold font-black">{order.payment_method}</span>

                                {(order.payment_method?.toLowerCase().includes('partial') || order.status === 'CANCELLED - PARTIAL COD') && (
                                  <div className="mt-3 pt-2 border-t border-black/5 space-y-1">
                                    <div className="flex justify-between text-[10px] tracking-[0.05em] uppercase">
                                      <span className="text-black/80 font-medium">Partial Paid (30%)</span>
                                      <span className="text-green-700 ">
                                        {formatCurrency(order.amount_paid, activeCurrency, rates, symbols)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-[10px] tracking-[0.05em] uppercase">
                                      <span className="text-black/80 font-medium">Pending (70%)</span>
                                      <span className="text-black underline">
                                        {formatCurrency(order.amount_pending, activeCurrency, rates, symbols)}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {order.razorpay_payment_id && (
                                  <div className="mt-3 pt-2 border-t border-black/5">
                                    <p className="text-[8px] text-black/40 uppercase tracking-widest mb-1 font-black">Razorpay ID</p>
                                    <p className="text-[9px] text-black font-mono font-bold select-all cursor-copy hover:text-blue-600 transition-colors" title="Click to select">{order.razorpay_payment_id}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="flex flex-col gap-2">
                                {/* Status Badge */}
                                <div className={`text-center px-2 py-1.5 text-[10px] tracking-widest uppercase border ${order.status === 'On Hold' ? 'border-yellow-600/40 text-yellow-600 bg-yellow-600/5' :
                                  order.status === 'Accepted' ? 'border-black/40 text-black bg-black/5' :
                                    order.status === 'Dispatched' ? 'border-black text-white bg-black' :
                                      order.status === 'Delivered' ? 'border-green-600/40 text-green-600 bg-green-600/5' :
                                        order.status === 'RTO Returned' ? 'border-red-600/40 text-red-600 bg-red-600/5' :
                                          order.status === 'Customer Returned' ? 'border-orange-600/40 text-orange-600 bg-orange-600/5' :
                                            order.status === 'Payment Pending' || order.status === 'Abandoned' ? 'border-neutral-400 text-neutral-400 bg-neutral-50' :
                                              order.status === 'Cancelled' ? 'border-red-600 text-red-600 bg-red-50' :
                                                order.status === 'CANCELLED - PARTIAL COD' ? 'border-red-600 text-red-600 animate-pulse bg-red-50' :
                                                  'border-black/20 text-black/60'
                                  } font-black`}>
                                  {order.status === 'Payment Pending' || order.status === 'Abandoned' ? 'PAYMENT NOT COMPLETED' : (order.status || 'On Hold')}
                                </div>
                                {/* Action Buttons by status */}
                                {(order.status === 'On Hold' || order.status === 'Pending' || !order.status) && (
                                  <button onClick={() => handleOrderStatusUpdate(order.id, 'Processing')} className="bg-black text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-black/80 transition-all">
                                    Accept Order
                                  </button>
                                )}
                                {(order.status === 'Accepted' || order.status === 'Processing') && (
                                  <button onClick={() => handleOrderStatusUpdate(order.id, 'Dispatch')} className="bg-black text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md">
                                    Mark as Dispatch
                                  </button>
                                )}
                                {order.status === 'Dispatch' && (
                                  <button onClick={() => handleOrderStatusUpdate(order.id, 'Dispatched')} className="bg-black text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-black/80 transition-all">
                                    Mark as Dispatched
                                  </button>
                                )}
                                {order.status === 'Dispatched' && (
                                  <div className="flex flex-col gap-2">
                                    <div className="text-center bg-black text-white px-4 py-2 text-[10px] uppercase tracking-widest opacity-60">
                                      ✓ DISPATCHED
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 mt-1">
                                      <button
                                        onClick={() => handleOrderStatusUpdate(order.id, 'RTO Returned')}
                                        className="bg-red-500/10 border border-red-500/30 text-red-600 px-2 py-1.5 text-[8px] uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all"
                                      >
                                        RTO Return
                                      </button>
                                      <button
                                        onClick={() => handleOrderStatusUpdate(order.id, 'Customer Returned')}
                                        className="bg-orange-500/10 border border-orange-500/30 text-orange-600 px-2 py-1.5 text-[8px] uppercase tracking-tighter hover:bg-orange-500 hover:text-white transition-all"
                                      >
                                        Cust. Return
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {order.status === 'Delivered' && (
                                  <div className="flex flex-col gap-2">
                                    <span className="text-center text-[8px] text-green-600 uppercase tracking-widest font-bold py-1 font-black">✓ Fulfilled</span>
                                    <div className="grid grid-cols-2 gap-1 mt-1">
                                      <button
                                        onClick={() => handleOrderStatusUpdate(order.id, 'RTO Returned')}
                                        className="bg-red-500/10 border border-red-500/30 text-red-600 px-2 py-1.5 text-[8px] uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all"
                                      >
                                        RTO Return
                                      </button>
                                      <button
                                        onClick={() => handleOrderStatusUpdate(order.id, 'Customer Returned')}
                                        className="bg-orange-500/10 border border-orange-500/30 text-orange-600 px-2 py-1.5 text-[8px] uppercase tracking-tighter hover:bg-orange-500 hover:text-white transition-all"
                                      >
                                        Cust. Return
                                      </button>
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-2 mt-2">
                                  {(['Accepted', 'Processing', 'Dispatch', 'Dispatched', 'Delivered'].includes(order.status)) && (
                                    <>
                                      <button
                                        onClick={() => handleOrderInvoiceDownload(order)}
                                        className={`flex-1 flex items-center justify-center gap-1 border px-2 py-2 text-[8px] tracking-widest uppercase transition-all ${downloadedHistory.invoices.includes(order.id) ? 'bg-black text-white border-black' : 'border-black/10 text-black/40 hover:bg-black/5 hover:text-black'} font-black`}
                                      >
                                        <FileText size={11} /> {downloadedHistory.invoices.includes(order.id) ? 'RE-INV' : 'Invoice'}
                                      </button>
                                      <button
                                        onClick={() => handleOrderLabelDownload(order)}
                                        className={`flex-1 flex items-center justify-center gap-1 border px-2 py-2 text-[8px] tracking-widest uppercase transition-all ${downloadedHistory.labels.includes(order.id) ? 'bg-black/5 border-black/20 text-black' : 'border-black/10 text-black/40 hover:bg-black hover:border-black hover:text-white'} font-black`}
                                      >
                                        <Package size={11} /> {downloadedHistory.labels.includes(order.id) ? 'RE-LABEL' : 'Label'}
                                      </button>
                                    </>
                                  )}
                                  <button onClick={() => handleDeleteOrder(order.id)} className="flex items-center justify-center gap-1 border border-red-500/20 px-2 py-2 text-[8px] tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all text-red-500">
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
                      if (orderSubTab === 'abandoned') return o.status === 'Payment Pending' || o.status === 'Abandoned';
                      if (orderSubTab === 'cancelled') return o.status === 'Cancelled' || o.status === 'CANCELLED - PARTIAL COD';
                      return false;
                    });

                    if (filteredOrders.length === 0) {
                      return <div className="p-12 text-center text-black/20 uppercase tracking-[0.4em] bg-neutral-50 border border-black/5 ">No Orders Found</div>;
                    }

                    return filteredOrders.map(order => (
                      <div key={order.id} className="bg-neutral-50 border border-black/5 p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-black/5 pb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="w-4 h-4 cursor-pointer accent-black"
                              checked={selectedOrders.includes(order.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedOrders(prev => [...prev, order.id]);
                                else setSelectedOrders(prev => prev.filter(id => id !== order.id));
                              }}
                            />
                            <span className="font-serif text-black ">#{order.id.toString().padStart(4, '0')}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-black/40">{new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-black/40 mb-1 font-black">Customer</p>
                          <p className="font-bold uppercase tracking-widest text-black font-black">{order.customer_name}</p>
                          <p className="text-[9px] lowercase text-black/60">{order.customer_email}</p>
                          <p className="text-[9px] text-black/80 mt-1 font-bold">{order.customer_phone || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-5 border border-black/5 space-y-4">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-black/40 font-black">Order Summary</p>
                            <span className="text-[11px] text-black">
                              {formatCurrency(order.total_amount, activeCurrency, rates, symbols)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {order.items?.map(it => (
                              <p key={it.id} className="text-[10px] flex justify-between items-center">
                                <span className="text-black/60 font-medium">{it.product_name}</span>
                                <span className="text-black/60 text-[9px]">x{it.quantity}</span>
                              </p>
                            ))}
                          </div>
                          {order.customer_note && (
                            <div className="mt-4 pt-4 border-t border-black/5">
                              <p className="text-[8px] text-black/40 uppercase mb-2 tracking-widest  font-black">Note from Client</p>
                              <p className="text-[10px] text-black/60 leading-relaxed font-serif ">"{order.customer_note}"</p>
                            </div>
                          )}
                          <div className="mt-2 pt-3 border-t border-black/5 flex justify-between items-center text-[8px] tracking-[0.2em] uppercase text-black/40">
                            <span>Payment Method</span>
                            <span className="text-black/60">{order.payment_method}</span>
                          </div>
                          {order.razorpay_payment_id && (
                            <div className="mt-2 pt-3 border-t border-black/5 flex justify-between items-center">
                              <span className="text-[8px] tracking-[0.2em] uppercase text-black/40 font-black">Razorpay ID</span>
                              <span className="text-[9px] text-black font-mono font-bold">{order.razorpay_payment_id}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-black/40 mb-2 font-black">Management</p>
                          <div className="flex flex-col gap-2">
                            {/* Status Badge * <div className={`text-center px-3 py-2 text-[9px] tracking-widest uppercase border ${order.status === 'On Hold' ? 'border-yellow-600/40 text-yellow-600 bg-yellow-600/5' :
 order.status === 'Accepted' ? 'border-black/40 text-black bg-black/5' :
 order.status === 'Dispatched' ? 'border-black text-white bg-black' :
 order.status === 'Delivered' ? 'border-green-600/40 text-green-600 bg-green-600/5' :
 order.status === 'RTO Returned' ? 'border-red-600/40 text-red-600 bg-red-600/5' :
 order.status === 'Customer Returned' ? 'border-orange-600/40 text-orange-600 bg-orange-600/5' :
 'border-black/10 text-black/40'
 } font-black`}>
 {order.status || 'On Hold'}
 </div>
v>
 {/* Action Buttons */}
                            {(order.status === 'On Hold' || order.status === 'Pending' || !order.status) && (
                              <button onClick={() => handleOrderStatusUpdate(order.id, 'Processing')} className="w-full bg-black text-white py-3 text-[10px] uppercase tracking-widest hover:bg-black/80 transition-all">
                                ✓ Accept Order
                              </button>
                            )}
                            {(order.status === 'Accepted' || order.status === 'Processing') && (
                              <button onClick={() => handleOrderStatusUpdate(order.id, 'Dispatch')} className="w-full bg-black text-white py-3 text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md">
                                → Mark as Dispatch
                              </button>
                            )}
                            {order.status === 'Dispatch' && (
                              <button onClick={() => handleOrderStatusUpdate(order.id, 'Dispatched')} className="w-full bg-black text-white py-3 text-[10px] uppercase tracking-widest hover:bg-black/80 transition-all">
                                → Mark as Dispatched
                              </button>
                            )}
                            {order.status === 'Dispatched' && (
                              <div className="space-y-2">
                                <button onClick={() => handleOrderStatusUpdate(order.id, 'Delivered')} className="w-full bg-green-600 text-white py-3 text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all">
                                  ✓ Mark Delivered
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, 'RTO Returned')}
                                    className="bg-red-500/10 border border-red-500/30 text-red-600 py-3 text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    RTO Return
                                  </button>
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, 'Customer Returned')}
                                    className="bg-orange-500/10 border border-orange-500/30 text-orange-600 py-3 text-[9px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
                                  >
                                    Cust. Return
                                  </button>
                                </div>
                              </div>
                            )}
                            {order.status === 'Delivered' && (
                              <div className="space-y-2">
                                <span className="text-center text-[9px] text-green-600 uppercase tracking-widest font-bold py-2 block border border-green-600/20 bg-green-600/5 font-black">✓ Order Fulfilled</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, 'RTO Returned')}
                                    className="bg-red-500/10 border border-red-500/30 text-red-600 py-3 text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    RTO Return
                                  </button>
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, 'Customer Returned')}
                                    className="bg-orange-500/10 border border-orange-500/30 text-orange-600 py-3 text-[9px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
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
                                    className={`flex-1 flex items-center justify-center gap-1 border p-3 text-[10px] tracking-widest uppercase transition-all ${downloadedHistory.invoices.includes(order.id) ? 'bg-black text-white border-black' : 'border-black/10 text-black/40 hover:bg-black/5 hover:text-black'} font-black`}
                                  >
                                    <FileText size={14} /> {downloadedHistory.invoices.includes(order.id) ? 'RE-INV' : 'Invoice'}
                                  </button>
                                  <button
                                    onClick={() => handleOrderLabelDownload(order)}
                                    className={`flex-1 flex items-center justify-center gap-1 border p-3 text-[10px] tracking-widest uppercase transition-all ${downloadedHistory.labels.includes(order.id) ? 'bg-black/5 border-black/20 text-black' : 'border-black/10 text-black/40 hover:bg-black hover:border-black hover:text-white'} font-black`}
                                  >
                                    <Package size={14} /> {downloadedHistory.labels.includes(order.id) ? 'RE-LABEL' : 'Label'}
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleDeleteOrder(order.id)} className="flex items-center justify-center gap-2 border border-red-500/20 p-3 text-[10px] tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all text-red-500">
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

        {/* TAB CONTENT: TRASH (ARCHIVE) */}
        {activeTab === 'trash' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-12">
              <h2 className="text-2xl font-serif tracking-widest uppercase text-red-600 mb-4">Decommissioned Assets</h2>
              <p className="text-[10px] tracking-[0.3em] text-black/40 uppercase  font-black">Restore previously removed items to the active registry.</p>
            </div>

            {tabsLoading.trash ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-gold-500" size={32} />
              </div>
            ) : (
              <div className="space-y-16">
                {/* Deleted Orders */}
                {trashData.orders.length > 0 && (
                  <section>
                    <h3 className="text-[11px] tracking-[0.4em] text-black uppercase mb-8 flex items-center gap-4">
                      <Package size={14} className="text-red-600" /> Deleted Orders
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trashData.orders.map(order => (
                        <div key={order.id} className="bg-neutral-50 border border-black/5 p-6 flex justify-between items-center group">
                          <div>
                            <p className="text-black font-serif">#{order.id.toString().padStart(4, '0')}</p>
                            <p className="text-[10px] uppercase font-bold text-black/80">{order.customer_name}</p>
                            <p className="text-[8px] text-black/40 uppercase">Deleted on {new Date(order.deleted_at).toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => handleRestoreItem('orders', order.id)} className="bg-black text-white px-4 py-2 text-[9px] uppercase tracking-widest transition-all">
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Deleted Products */}
                {trashData.products.length > 0 && (
                  <section>
                    <h3 className="text-[11px] tracking-[0.4em] text-black uppercase mb-8 flex items-center gap-4">
                      <Layers size={14} className="text-red-600" /> Deleted Products
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trashData.products.map(p => (
                        <div key={p.id} className="bg-white border border-black/5 p-6 flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                            <img src={getFullImageUrl(p.image_url)} alt="" className="w-10 h-10 object-cover opacity-80" />
                            <div>
                              <p className="text-[10px] uppercase font-bold text-black">{p.name}</p>
                              <p className="text-[8px] text-black/40 uppercase tracking-widest font-black">{p.collection_name}</p>
                            </div>
                          </div>
                          <button onClick={() => handleRestoreItem('products', p.id)} className="bg-black text-white px-4 py-2 text-[9px] uppercase tracking-widest transition-all hover:bg-neutral-800">
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Deleted Blogs */}
                {trashData.blogs.length > 0 && (
                  <section>
                    <h3 className="text-[11px] tracking-[0.4em] text-black uppercase mb-8 flex items-center gap-4">
                      <FileText size={14} className="text-red-600" /> Deleted Blogs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trashData.blogs.map(blog => (
                        <div key={blog.id} className="bg-white border border-black/5 p-6 flex justify-between items-center group">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-black truncate max-w-[150px]">{blog.title}</p>
                            <p className="text-[8px] text-black/40 uppercase tracking-widest font-black">By {blog.author}</p>
                          </div>
                          <button onClick={() => handleRestoreItem('blogs', blog.id)} className="bg-black text-white px-4 py-2 text-[9px] uppercase tracking-widest transition-all hover:bg-neutral-800">
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Deleted Reviews */}
                {trashData.reviews.length > 0 && (
                  <section>
                    <h3 className="text-[11px] tracking-[0.4em] text-black uppercase mb-8 flex items-center gap-4">
                      <Star size={14} className="text-red-600" /> Deleted Reviews
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trashData.reviews.map(rev => (
                        <div key={rev.id} className="bg-white border border-black/5 p-6 flex justify-between items-center group">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-black">{rev.first_name} {rev.last_name}</p>
                            <p className="text-[8px] text-black/60 uppercase tracking-widest mb-1 font-serif font-black">{rev.product_name}</p>
                            <p className="text-[8px] text-black/40 uppercase mb-3 tracking-widest font-black">Deleted on {new Date(rev.deleted_at).toLocaleDateString()}</p>
                            {rev.image_urls && (Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)).length > 0 && (
                              <div className="flex gap-2">
                                {(Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)).map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={getFullImageUrl(url)}
                                    alt=""
                                    className="w-8 h-8 object-cover border border-black/10"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleRestoreItem('reviews', rev.id)} className="bg-black text-white px-4 py-2 text-[9px] uppercase tracking-widest transition-all hover:bg-neutral-800">
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Deleted Gallery Images */}
                {trashData.gallery.length > 0 && (
                  <section>
                    <h3 className="text-[11px] tracking-[0.4em] text-black uppercase mb-8 flex items-center gap-4">
                      <ImageIcon size={14} className="text-red-600" /> Deleted Gallery Assets
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {trashData.gallery.map(img => (
                        <div key={img.id} className="relative aspect-square group overflow-hidden border border-black/10 bg-neutral-50">
                          <img src={getFullImageUrl(img.image_url)} alt="" className="w-full h-full object-cover opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleRestoreItem('community_gallery', img.id)} className="bg-black text-white px-3 py-1.5 text-[8px] uppercase tracking-widest">
                              Restore
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty State */}
                {trashData.orders.length === 0 && trashData.products.length === 0 && trashData.blogs.length === 0 && trashData.reviews.length === 0 && trashData.gallery.length === 0 && (
                  <div className="text-center py-32 border border-dashed border-black/10">
                    <Trash2 className="mx-auto text-black/10 mb-8" size={64} strokeWidth={0.5} />
                    <p className="text-[11px] tracking-[0.4em] text-black/20 uppercase  font-black">The Archive is currently empty.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB CONTENT: USERS */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {tabsLoading.users ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-black" size={32} />
              </div>
            ) : (
              <>
                <div className="flex space-x-8 mb-12 border-b border-black/5 pb-2">
                  <button
                    onClick={() => setUserSubTab('users')}
                    className={`pb-4 px-2 uppercase tracking-[0.3em] text-[10px] transition-all border-b-2 ${userSubTab === 'users' ? 'border-black text-black ' : 'border-transparent text-black/40'} font-black`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setUserSubTab('admins')}
                    className={`pb-4 px-2 uppercase tracking-[0.3em] text-[10px] transition-all border-b-2 ${userSubTab === 'admins' ? 'border-black text-black ' : 'border-transparent text-black/40'} font-black`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => setUserSubTab('requests')}
                    className={`pb-4 px-2 uppercase tracking-[0.3em] text-[10px] transition-all border-b-2 ${userSubTab === 'requests' ? 'border-black text-black ' : 'border-transparent text-black/40'} font-black`}
                  >
                    Requests {deletionRequests.length > 0 && <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-[8px] animate-pulse">{deletionRequests.length}</span>}
                  </button>
                </div>

                {userSubTab === 'users' ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                      <div className="flex-grow flex items-center bg-neutral-50 border border-black/10 px-5 md:px-8 py-4 md:py-6 group focus-within:border-black transition-all">
                        <Search size={18} className="text-black/40 group-focus-within:text-black transition-colors mr-6" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="bg-transparent border-none text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-black placeholder:text-black/40 focus:outline-none w-full"
                        />
                      </div>
                      {selectedUsers.length > 0 && (
                        <button
                          onClick={() => handleBulkDeleteUsers()}
                          className="bg-red-600 text-white px-8 py-4 text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                        >
                          <Trash2 size={14} />
                          Deactivate {selectedUsers.length} Selected
                        </button>
                      )}
                    </div>
                    <div className="space-y-6">
                      <div className="hidden md:block bg-white border border-black/10 overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left text-[11px] tracking-[0.1em] text-black min-w-[900px]">
                          <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.4em] text-black border-b border-black/10">
                            <tr>
                              <th className="p-6 w-12">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 cursor-pointer accent-gold-500"
                                  checked={users.length > 0 && users.every(u => selectedUsers.includes(u.id))}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUsers(users.map(u => u.id));
                                    } else {
                                      setSelectedUsers([]);
                                    }
                                  }}
                                />
                              </th>
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
                              <tr><td colSpan="6" className="p-12 text-center text-white/70 uppercase tracking-widest font-black">No matching users found</td></tr>
                            ) : (
                              users.filter(u =>
                                u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
                              ).map(u => (
                                <tr key={u.id} className="border-b border-black/5 hover:bg-neutral-50">
                                  <td className="p-6">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 cursor-pointer accent-black"
                                      checked={selectedUsers.includes(u.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                                        else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                                      }}
                                    />
                                  </td>
                                  <td className="p-6 font-serif text-black text-sm">#{u.id.toString().padStart(4, '0')}</td>
                                  <td className="p-6">
                                    <p className=" uppercase tracking-widest text-black text-sm font-black">{u.first_name} {u.last_name}</p>
                                    <p className="text-[11px] text-black/80 mt-1.5 flex items-center space-x-2 lowercase font-sans font-medium">
                                      <span>{u.email}</span>
                                    </p>
                                  </td>
                                  <td className="p-6">
                                    <p className="text-xs text-black uppercase tracking-widest flex items-center space-x-2 font-bold font-black">
                                      <Phone size={12} className="text-black/60" />
                                      <span>{u.telephone || 'Not Provided'}</span>
                                    </p>
                                  </td>
                                  <td className="p-6">
                                    <select
                                      value={u.role || 'user'}
                                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                      disabled={u.id === 1}
                                      className={`bg-transparent border-none text-[10px] uppercase tracking-widest cursor-pointer focus:outline-none ${u.role === 'admin' ? 'text-black' : 'text-black/40'} font-black`}
                                    >
                                      <option value="user">Customer</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  </td>
                                  <td className="p-6">
                                    <p className="text-[11px] text-black/80 uppercase tracking-widest font-bold font-black">
                                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                  </td>
                                  <td className="p-6 text-right">
                                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-600/40 hover:text-red-600 transition-colors p-2">
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="md:hidden space-y-4">
                        {users.filter(u =>
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
                        ).map(u => (
                          <div key={u.id} className="bg-neutral-50 border border-black/5 p-6 space-y-6 relative group overflow-hidden">
                            <div className="flex justify-between items-start border-b border-black/5 pb-5">
                              <div className="flex items-center gap-5">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 cursor-pointer accent-black"
                                  checked={selectedUsers.includes(u.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                                    else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                                  }}
                                />
                                <div className="w-14 h-14 rounded bg-black text-white flex items-center justify-center font-serif text-2xl">
                                  {u.first_name[0]}
                                </div>
                                <div>
                                  <p className=" uppercase tracking-[0.15em] text-black text-[14px] leading-tight mb-1 font-black">{u.first_name} {u.last_name}</p>
                                  <div className="flex items-center gap-3">
                                    <span className="font-serif text-black/40 text-[10px]">#{u.id.toString().padStart(4, '0')}</span>
                                    <select
                                      value={u.role || 'user'}
                                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                      disabled={u.id === 1}
                                      className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border bg-transparent focus:outline-none ${u.role === 'admin' ? 'border-black text-black' : 'border-black/10 text-black/40'} font-black`}
                                    >
                                      <option value="user">Customer</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-600/40 hover:text-red-600 transition-colors p-2 mt-1">
                                <Trash2 size={20} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white p-4 border border-black/5">
                                <p className="text-[8px] uppercase tracking-[0.3em] text-black/40 mb-2 font-black">Communication</p>
                                <p className="text-[10px] lowercase text-black/80 mb-1">{u.email}</p>
                                <p className="text-[10px] text-black font-bold">{u.telephone || 'Contact Restricted'}</p>
                              </div>
                              <div className="bg-white p-4 border border-black/5">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-black/60 font-bold mb-2 font-black">Account Timeline</p>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] uppercase tracking-widest text-black/60 font-black">Joined Registry</span>
                                  <span className="text-[10px] text-black font-serif">{new Date(u.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : userSubTab === 'admins' ? (
                  <>
                    <div className="space-y-8 md:space-y-12">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-50 border border-black/5 p-6 md:p-8 gap-6">
                        <div>
                          <h2 className="text-lg md:text-xl font-serif tracking-[0.1em] md:tracking-widest uppercase text-black">Administration Team</h2>
                          <p className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-black/40 uppercase mt-1 md:mt-2 font-black">Managing platform access controls</p>
                        </div>
                        <button
                          onClick={() => setIsAdding(!isAdding)}
                          className="w-full sm:w-auto bg-black text-white px-6 md:px-8 py-3 md:py-4 text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-3"
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
                            className="bg-neutral-50 border border-black/10 p-8 md:p-12 mb-10"
                          >
                            <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="md:col-span-2 border-b border-black/5 pb-4 mb-4">
                                <h3 className="text-black font-serif tracking-widest uppercase">Admin Identity & Credentials</h3>
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
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                                  >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>
                              <div className="md:col-span-2 pt-4">
                                <button
                                  type="submit"
                                  disabled={isProcessing}
                                  className="w-full bg-black text-white py-5 text-[11px] tracking-[0.5em] uppercase hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 font-black"
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 className="animate-spin" size={16} />
                                      Processing Appointment...
                                    </>
                                  ) : (
                                    'Confirm Appointment'
                                  )}
                                </button>
                              </div>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="bg-white border border-black/10 overflow-hidden">
                        {/* Desktop Table */}
                        <table className="hidden md:table w-full text-left text-[11px] tracking-[0.1em] text-black">
                          <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] font-bold text-black/60 border-b border-black/10">
                            <tr>
                              <th className="p-6">Admin Identity</th>
                              <th className="p-6">Permissions</th>
                              <th className="p-6">Joined Date</th>
                              <th className="p-6 text-right">Management</th>
                            </tr>
                          </thead>
                          <tbody>
                            {admins.map(adm => (
                              <tr key={adm.id} className="border-b border-black/5 hover:bg-neutral-50">
                                <td className="p-6">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-serif text-lg">
                                      {adm.first_name?.[0] || 'A'}
                                    </div>
                                    <div>
                                      <p className="font-bold text-black uppercase tracking-widest font-black">{adm.first_name} {adm.last_name}</p>
                                      <p className="text-[9px] text-black/60 lowercase">{adm.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-6">
                                  <span className="px-3 py-1 bg-black text-white text-[8px] uppercase tracking-widest font-black">Administrator</span>
                                </td>
                                <td className="p-6 text-black/60 uppercase">
                                  {new Date(adm.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-6 text-right">
                                  {adm.id !== 1 && (
                                    <button onClick={() => handleDeleteUser(adm.id)} className="text-red-600/40 hover:text-red-600 transition-colors p-2">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Mobile Card List */}
                        <div className="md:hidden divide-y divide-black/5">
                          {admins.map(adm => (
                            <div key={adm.id} className="p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-serif text-lg">
                                    {adm.first_name?.[0] || 'A'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-black uppercase tracking-widest text-[11px] font-black">{adm.first_name} {adm.last_name}</p>
                                    <p className="text-[9px] text-black/60 lowercase font-sans">{adm.email}</p>
                                  </div>
                                </div>
                                {adm.id !== 1 && (
                                  <button onClick={() => handleDeleteUser(adm.id)} className="text-red-600/40 hover:text-red-600 transition-colors p-2">
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                              <div className="flex justify-between items-center bg-neutral-50 p-4 border border-black/5">
                                <span className="text-[8px] uppercase tracking-widest text-black  font-black">Full Access Admin</span>
                                <span className="text-[9px] text-black/40">{new Date(adm.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-red-600/5 border border-red-600/10 p-6 md:p-8">
                      <h2 className="text-lg md:text-xl font-serif tracking-widest uppercase text-red-600">Account Deletion Requests</h2>
                      <p className="text-[9px] md:text-[10px] tracking-widest text-black/40 uppercase mt-2  font-black">Pending formal profile removals from the KIKS registry</p>
                    </div>
                    <div className="bg-white border border-black/10 overflow-hidden">
                      {/* Desktop View */}
                      <table className="hidden md:table w-full text-left text-[11px] tracking-[0.1em] text-black">
                        <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] font-bold text-black/60 border-b border-black/10">
                          <tr>
                            <th className="p-6">Client</th>
                            <th className="p-6">Contact Details</th>
                            <th className="p-6">Requested On</th>
                            <th className="p-6 text-right">Administrative Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deletionRequests.length === 0 ? (
                            <tr><td colSpan="4" className="p-12 text-center text-black/40 uppercase tracking-widest bg-neutral-50/50  font-black">No pending deletion requests</td></tr>
                          ) : deletionRequests.map(req => (
                            <tr key={req.id} className="border-b border-black/5 hover:bg-red-50/30">
                              <td className="p-6">
                                <p className="font-bold uppercase tracking-widest text-black font-black">{req.first_name} {req.last_name}</p>
                                <p className="text-[8px] text-black/40 mt-1 uppercase">ID: #{req.id.toString().padStart(4, '0')}</p>
                              </td>
                              <td className="p-6">
                                <p className="lowercase mb-1 text-black">{req.email}</p>
                                <p className="text-[10px] font-bold text-black/60">{req.telephone || 'N/A'}</p>
                              </td>
                              <td className="p-6">
                                <p className="text-black/70 uppercase">{new Date(req.deletion_requested_at).toLocaleDateString()}</p>
                                <p className="text-[8px] text-black/40 uppercase mt-1">{new Date(req.deletion_requested_at).toLocaleTimeString()}</p>
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex items-center justify-end gap-4">
                                  <button
                                    onClick={() => handleDeclineDeletion(req.id)}
                                    disabled={isProcessing}
                                    className="border border-black/10 text-black/60 px-4 py-2 text-[8px] uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                                  >
                                    Decline Request
                                  </button>
                                  <button
                                    onClick={() => handleApproveDeletion(req.id)}
                                    disabled={isProcessing}
                                    className="bg-red-600 text-white px-4 py-2 text-[8px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
                                  >
                                    {isProcessing ? (
                                      <Loader2 className="animate-spin" size={10} />
                                    ) : null}
                                    {isProcessing ? 'Processing...' : 'Approve Deletion'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                          }
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-black/5">
                      {deletionRequests.length === 0 ? (
                        <div className="p-12 text-center text-black/40 uppercase tracking-widest text-[9px]">The manifest is currently clear</div>
                      ) : deletionRequests.map(req => (
                        <div key={req.id} className="p-6 space-y-4 bg-neutral-50 border border-black/5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-black mb-1 font-black">{req.first_name} {req.last_name}</p>
                              <p className="text-[9px] text-black/60 lowercase font-sans">{req.email}</p>
                              <p className="text-[8px] text-black/40 mt-1 font-bold">ID: #{req.id.toString().padStart(4, '0')}</p>
                            </div>
                            <span className="text-[9px] text-black/40 uppercase font-sans">{new Date(req.deletion_requested_at).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-white p-4 border border-black/5 flex flex-col space-y-3">
                            <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-black/60">
                              <span>Telephone</span>
                              <span className="text-black font-bold">{req.telephone || 'RESTRICTED'}</span>
                            </div>
                            <div className="flex flex-col gap-3">
                              <button
                                onClick={() => handleApproveDeletion(req.id)}
                                disabled={isProcessing}
                                className="w-full bg-red-600 text-white py-4 text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                              >
                                {isProcessing && <Loader2 className="animate-spin" size={14} />}
                                {isProcessing ? 'Processing...' : 'Approve Deletion'}
                              </button>
                              <button
                                onClick={() => handleDeclineDeletion(req.id)}
                                disabled={isProcessing}
                                className="w-full border border-black/10 text-black/40 py-3 text-[9px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
                              >
                                Decline Request
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                <Loader2 className="animate-spin text-black" size={32} />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white border border-black/10 overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left text-[11px] tracking-[0.1em] text-black min-w-[900px]">
                    <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] font-bold text-black/60 border-b border-black/10">
                      <tr>
                        <th className="p-6">User</th>
                        <th className="p-6">Essence</th>
                        <th className="p-6">Review</th>
                        <th className="p-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.length === 0 ? (
                        <tr><td colSpan="4" className="p-12 text-center text-black/40 uppercase tracking-widest bg-neutral-50/50 font-black">No Reviews Shared Yet</td></tr>
                      ) : (
                        reviews.map(rev => (
                          <tr key={rev.id} className="border-b border-black/5 hover:bg-neutral-50 transition-all">
                            <td className="p-6">
                              <p className="font-bold uppercase tracking-widest text-black font-black">{rev.first_name} {rev.last_name}</p>
                              <p className="text-[9px] text-black/60 mt-1 lowercase font-sans">{rev.email}</p>
                            </td>
                            <td className="p-6">
                              <p className="tracking-widest uppercase text-black font-bold font-black">{rev.product_name}</p>
                              <div className="flex text-black mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "opacity-20"} />
                                ))}
                              </div>
                            </td>
                            <td className="p-6">
                              <p className="font-bold text-black mb-1 uppercase tracking-widest text-[10px] font-black">{rev.title}</p>
                              <p className="text-black/50 max-w-sm line-clamp-2 mb-3 text-[11px] font-serif leading-relaxed">"{rev.comment}"</p>
                              {rev.image_urls && (Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)).length > 0 && (
                                <div className="flex gap-2">
                                  {(Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)).map((url, idx) => (
                                    <img
                                      key={idx}
                                      src={getFullImageUrl(url)}
                                      alt=""
                                      className="w-10 h-10 object-cover border border-black/5 cursor-zoom-in"
                                      onClick={() => window.open(getFullImageUrl(url), '_blank')}
                                    />
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="p-6 text-right">
                              <button onClick={() => handleDeleteReview(rev.id)} className="text-red-600/40 hover:text-red-600 transition-colors p-2">
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
                    <div className="p-12 text-center text-black/40 uppercase tracking-widest bg-neutral-50 border border-black/5 ">No Reviews Shared Yet</div>
                  ) : (
                    reviews.map(rev => (
                      <div key={rev.id} className="bg-neutral-50 border border-black/5 p-6 space-y-4">
                        <div className="flex justify-between items-start border-b border-black/5 pb-4">
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-black/40 mb-1 font-black">Product</p>
                            <p className=" uppercase tracking-widest text-black text-[10px] font-black">{rev.product_name}</p>
                          </div>
                          <button onClick={() => handleDeleteReview(rev.id)} className="text-red-600 bg-red-600/5 border border-red-600/10 p-2 uppercase text-[8px] tracking-widest hover:bg-red-600 hover:text-white transition-all">
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex text-black">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "opacity-20"} />
                            ))}
                          </div>
                          <span className="text-[8px] uppercase text-black/40 font-bold">{new Date(rev.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-white p-4 border border-black/5">
                          <p className="font-bold text-black text-[10px] uppercase tracking-widest mb-2 border-b border-black/5 pb-2 font-black">{rev.title}</p>
                          <p className="text-[10px] text-black/50 leading-relaxed mb-4 font-serif">"{rev.comment}"</p>
                          {rev.image_urls && (Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(rev.image_urls) ? rev.image_urls : JSON.parse(rev.image_urls)).map((url, idx) => (
                                <img
                                  key={idx}
                                  src={getFullImageUrl(url)}
                                  alt=""
                                  className="w-12 h-12 object-cover border border-black/5"
                                  onClick={() => window.open(getFullImageUrl(url), '_blank')}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 pt-2">
                          <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[10px] font-serif">
                            {rev.first_name[0]}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-black">{rev.first_name} {rev.last_name}</p>
                            <p className="text-[8px] lowercase text-black/60 font-sans">{rev.email}</p>
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
                <Loader2 className="animate-spin text-black" size={32} />
              </div>
            ) : (
              (() => {
                const productWaitlists = waitlist.filter(e => e.request_type !== 'callback').sort((a, b) => b.id - a.id);
                const callbackRequests = waitlist.filter(e => e.request_type === 'callback');
                const filteredCallbacks = callbackRequests.filter(e => (e.status || 'Pending').toLowerCase() === callbackFilter.toLowerCase()).sort((a, b) => b.id - a.id);

                return (
                  <div className="space-y-12">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-50 border border-black/5 p-6 md:p-8 gap-6">
                      <div>
                        <h2 className="text-base md:text-lg tracking-[0.2em] uppercase text-black">Waitlist Manifest</h2>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1 md:mt-2">
                          <p className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-black/40 uppercase font-black">Managing prospective acquisitions</p>
                          {callbackRequests.filter(e => (e.status || 'Pending').toLowerCase() === 'pending').length > 0 && (
                            <span className="bg-black text-white px-2 py-0.5 text-[8px] uppercase tracking-widest animate-pulse font-black">
                              {callbackRequests.filter(e => (e.status || 'Pending').toLowerCase() === 'pending').length} Priority Callbacks
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] md:text-[10px] text-black/40 uppercase tracking-widest font-black">Total Manifest Entries</p>
                        <p className="text-xl md:text-2xl font-serif text-black">{waitlist.length}</p>
                      </div>
                    </div>

                    {/* SECTION 1: PRODUCT WAITLIST */}
                    <div className="space-y-4">
                      <h3 className="text-xs md:text-sm tracking-[0.2em] uppercase text-black border-b border-black/5 pb-4">Product Waitlist</h3>

                      {/* Desktop Table: Product Waitlist */}
                      <div className="hidden md:block bg-white border border-black/10 overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left text-[11px] tracking-[0.1em] text-black min-w-[1100px]">
                          <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] font-bold text-black/60 border-b border-black/10">
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
                            {productWaitlists.length === 0 ? (
                              <tr><td colSpan="6" className="p-12 text-center text-black/40 uppercase tracking-widest bg-neutral-50/50 text-xs  font-black">No Product Waitlists</td></tr>
                            ) : (
                              productWaitlists.map(entry => (
                                <tr key={entry.id} className="border-b border-black/5 transition-colors hover:bg-neutral-50/80">
                                  <td className="p-6">
                                    <span className="flex items-center gap-2 text-black/60 text-[8px] tracking-widest uppercase font-black">
                                      <Layers size={12} strokeWidth={2} /> Waitlist
                                    </span>
                                  </td>
                                  <td className="p-6">
                                    <p className="font-bold uppercase tracking-widest text-black font-black">{entry.customer_name}</p>
                                    <p className="text-[9px] uppercase mt-1 text-black/40">ID: #{entry.id.toString().padStart(4, '0')}</p>
                                  </td>
                                  <td className="p-6">
                                    <div className="flex items-center gap-2 mb-1 lowercase text-black">
                                      <Mail size={10} className="text-black/20" />
                                      <span>{entry.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-black">
                                      <Phone size={10} className="text-black/20" />
                                      <span className="font-bold">{entry.phone || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="p-6">
                                    <p className="text-black font-bold uppercase tracking-widest font-black">{entry.product_name || 'Restock Request'}</p>
                                    <p className="text-[9px] text-black/40 font-serif">{entry.product_slug}</p>
                                  </td>
                                  <td className="p-6">
                                    <div className="flex flex-col gap-1">
                                      <span className="px-3 py-1 border border-black/10 bg-black/5 text-black text-[8px] uppercase tracking-widest w-fit font-black">
                                        {entry.status || 'Pending'}
                                      </span>
                                      <span className="text-[8px] uppercase text-black/40">
                                        {new Date(entry.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-6 text-right">
                                    <button
                                      onClick={async () => {
                                        if (!window.confirm('Remove from waitlist?')) return;
                                        try {
                                          const res = await fetch(`${API_URL}/api/waitlist/${entry.id}`, { method: 'DELETE', headers: getAdminHeaders() });
                                          if (res.ok) { showSuccessToast('Prospect removed.'); fetchWaitlistData(); }
                                        } catch (e) { showErrorToast('Update failed.'); }
                                      }}
                                      className="transition-colors p-2 text-red-600/40 hover:text-red-600"
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

                      {/* Mobile Cards: Product Waitlist */}
                      <div className="md:hidden space-y-4">
                        {productWaitlists.length === 0 ? (
                          <div className="p-12 text-center text-black/40 uppercase tracking-widest bg-neutral-50 border border-black/10 text-xs ">No Product Waitlists</div>
                        ) : (
                          productWaitlists.map(entry => (
                            <div key={entry.id} className="bg-white border border-black/10 p-6 space-y-4">
                              <div className="flex justify-between items-start border-b border-black/5 pb-4">
                                <div>
                                  <p className="text-[8px] uppercase tracking-widest mb-1 text-black/40 font-black">ID: #{entry.id.toString().padStart(4, '0')}</p>
                                  <p className=" uppercase tracking-widest text-[10px] text-black font-black">{entry.customer_name}</p>
                                </div>
                                <button
                                  onClick={async () => {
                                    if (!window.confirm('Remove from waitlist?')) return;
                                    try {
                                      const res = await fetch(`${API_URL}/api/waitlist/${entry.id}`, { method: 'DELETE', headers: getAdminHeaders() });
                                      if (res.ok) { showSuccessToast('Prospect removed.'); fetchWaitlistData(); }
                                    } catch (e) { showErrorToast('Update failed.'); }
                                  }}
                                  className="p-2 uppercase text-[8px] tracking-widest bg-red-600/5 text-red-600 border border-red-600/10"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="p-3 border bg-neutral-50 border-black/5">
                                  <p className="text-[9px] uppercase tracking-widest mb-2 text-black/60  font-black">Contact</p>
                                  <p className="text-[10px] lowercase text-black/60">{entry.email}</p>
                                  <p className="text-[10px] mt-1 font-bold text-black">{entry.phone || 'N/A'}</p>
                                </div>
                                <div className="p-3 border bg-neutral-50 border-black/5">
                                  <p className="text-[9px] uppercase tracking-widest mb-2 text-black/60  font-black">Interest</p>
                                  <p className="text-black font-bold uppercase tracking-widest text-[10px] font-black">{entry.product_name || 'Restock'}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* SECTION 2: CALLBACK REQUESTS */}
                    <div className="space-y-6 pt-8 border-t border-black/10 mt-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-xs md:text-sm tracking-[0.2em] uppercase text-black">Callback Requests</h3>
                        <div className="flex border border-black/10">
                          <button
                            onClick={() => setCallbackFilter('Pending')}
                            className={`px-6 py-2 text-[9px] uppercase tracking-[0.2em] transition-colors ${callbackFilter === 'Pending' ? 'bg-black text-white' : 'bg-transparent text-black/40 hover:bg-black/5'} font-black`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => setCallbackFilter('Completed')}
                            className={`px-6 py-2 text-[9px] uppercase tracking-[0.2em] transition-colors ${callbackFilter === 'Completed' ? 'bg-black text-white' : 'bg-transparent text-black/40 hover:bg-black/5'} font-black`}
                          >
                            Completed
                          </button>
                        </div>
                      </div>

                      {/* Desktop Table: Callback Requests */}
                      <div className="hidden md:block bg-white border border-black/10 overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left text-[11px] tracking-[0.1em] text-black min-w-[1100px]">
                          <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] font-bold text-black/60 border-b border-black/10">
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
                            {filteredCallbacks.length === 0 ? (
                              <tr><td colSpan="6" className="p-12 text-center text-black/40 uppercase tracking-widest bg-neutral-50/50 font-black">No {callbackFilter} Callbacks</td></tr>
                            ) : (
                              filteredCallbacks.map(entry => (
                                <tr key={entry.id} className="border-b border-black/5 transition-colors hover:bg-neutral-50/80 bg-neutral-50/30">
                                  <td className="p-6">
                                    <span className="flex items-center gap-2 text-black text-[8px] tracking-widest uppercase font-black">
                                      <Smartphone size={12} strokeWidth={2} /> Callback
                                    </span>
                                  </td>
                                  <td className="p-6">
                                    <p className="font-bold uppercase tracking-widest text-black font-black">{entry.customer_name}</p>
                                    <p className="text-[9px] uppercase mt-1 text-black/40">ID: #{entry.id.toString().padStart(4, '0')}</p>
                                  </td>
                                  <td className="p-6">
                                    <div className="flex items-center gap-2 mb-1 lowercase text-black">
                                      <Mail size={10} className="text-black/20" />
                                      <span>{entry.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-black">
                                      <Phone size={10} className="text-black/20" />
                                      <span className="font-bold">{entry.phone || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="p-6">
                                    <p className="text-black/60 text-[10px]">Private Concierge Inquiry</p>
                                  </td>
                                  <td className="p-6">
                                    <div className="flex flex-col gap-1">
                                      <span className={`px-3 py-1 border border-black/10 text-[8px] uppercase tracking-widest w-fit ${entry.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-black/5 text-black'} font-black`}>
                                        {entry.status || 'Pending'}
                                      </span>
                                      <span className="text-[8px] uppercase text-black/40">
                                        {new Date(entry.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-6 text-right">
                                    {callbackFilter === 'Pending' ? (
                                      <button
                                        onClick={() => updateWaitlistStatus(entry.id, 'Completed')}
                                        className="px-4 py-2 border border-black text-[9px] uppercase tracking-widest bg-black text-white hover:bg-black/80 transition-colors"
                                      >
                                        Mark Completed
                                      </button>
                                    ) : (
                                      <span className="text-[9px] text-black/40 uppercase tracking-widest  font-black">Resolved</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards: Callback Requests */}
                      <div className="md:hidden space-y-4">
                        {filteredCallbacks.length === 0 ? (
                          <div className="p-12 text-center text-black/40 uppercase tracking-widest bg-neutral-50 border border-black/10 ">No {callbackFilter} Callbacks</div>
                        ) : (
                          filteredCallbacks.map(entry => (
                            <div key={entry.id} className="bg-white border border-black/10 p-6 space-y-4 border-l-4 border-black">
                              <div className="flex justify-between items-start border-b border-black/5 pb-4">
                                <div>
                                  <p className="text-[8px] uppercase tracking-widest mb-1 text-black/40 font-black">ID: #{entry.id.toString().padStart(4, '0')}</p>
                                  <p className=" uppercase tracking-widest text-[10px] text-black font-black">{entry.customer_name}</p>
                                </div>
                                {callbackFilter === 'Pending' ? (
                                  <button
                                    onClick={() => updateWaitlistStatus(entry.id, 'Completed')}
                                    className="p-2 uppercase text-[8px] tracking-widest bg-black text-white"
                                  >
                                    Complete
                                  </button>
                                ) : (
                                  <span className="text-[8px] text-black/40 uppercase tracking-widest  font-black">Resolved</span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="p-3 border bg-neutral-50 border-black/5">
                                  <p className="text-[9px] uppercase tracking-widest mb-2 text-black/60  font-black">Contact</p>
                                  <p className="text-[10px] lowercase text-black/60">{entry.email}</p>
                                  <p className="text-[10px] mt-1 font-bold text-black">{entry.phone || 'N/A'}</p>
                                </div>
                                <div className="p-3 border bg-neutral-50 border-black/5">
                                  <p className="text-[9px] uppercase tracking-widest mb-2 text-black/60  font-black">Interest</p>
                                  <p className="text-black font-bold uppercase tracking-widest text-[11px] font-black">Callback Request</p>
                                </div>
                                <div className="flex justify-between items-center p-3 border bg-neutral-50 border-black/5">
                                  <span className="text-[9px] uppercase tracking-widest text-black/60  font-black">Status</span>
                                  <span className={`px-2 py-0.5 border border-black/10 text-[8px] uppercase tracking-widest ${entry.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-black/5 text-black'} font-black`}>
                                    {entry.status || 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </motion.div>
        )}

        {/* TAB CONTENT: MARKETING */}
        {activeTab === 'marketing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
            {tabsLoading.marketing ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-black" size={32} />
              </div>
            ) : (
              <>
                {/* POPUP MANAGEMENT */}
                <section className="space-y-8 bg-neutral-50 p-5 sm:p-8 md:p-12 border border-black/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 blur-[80px] rounded-full pointer-events-none" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase text-black">Offer of the Day</h2>
                      <p className="text-[10px] tracking-[0.3em] text-black/40 uppercase font-black">Strategic Acquisition Popup</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 border border-black/10">
                      <span className="text-[9px] uppercase tracking-widest text-black/40 ml-3 font-black">Popup Status</span>
                      <button
                        type="button"
                        onClick={() => setPopupSettings({ ...popupSettings, is_active: !popupSettings.is_active })}
                        className={`px-8 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border ${popupSettings.is_active ? 'bg-black border-black text-white' : 'bg-transparent border-black/10 text-black/20'} font-black`}
                      >
                        {popupSettings.is_active ? 'LIVE' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePopup} className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
                    <div className="space-y-8">
                      <div>
                        <label className={labelClasses}>Primary Headline</label>
                        <input
                          className={`${inputClasses} !text-base md:!text-lg !font-serif !tracking-widest font-black`}
                          value={popupSettings.headline}
                          onChange={e => setPopupSettings({ ...popupSettings, headline: e.target.value })}
                          placeholder="e.g. EXCLUSIVE PRIVILEGE"
                        />
                      </div>

                      <div>
                        <label className={labelClasses}>Promotion Narrative</label>
                        <textarea
                          className={`${inputClasses} h-32 md:h-40 !text-sm leading-relaxed`}
                          value={popupSettings.offer_text}
                          onChange={e => setPopupSettings({ ...popupSettings, offer_text: e.target.value })}
                          placeholder="Describe the exclusive privilege..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClasses}>Deployment Delay (s)</label>
                          <input
                            type="number"
                            className={inputClasses}
                            value={popupSettings.delay_seconds}
                            onChange={e => setPopupSettings({ ...popupSettings, delay_seconds: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Redirection URL</label>
                          <input
                            className={inputClasses}
                            value={popupSettings.redirect_url || ''}
                            onChange={e => setPopupSettings({ ...popupSettings, redirect_url: e.target.value })}
                            placeholder="/collection"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className={labelClasses}>Cinematic Lifestyle Visual</label>
                      <div
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.onchange = (e) => handleImageUpload(e, 'popup');
                          input.click();
                        }}
                        className="aspect-[4/5] lg:aspect-auto lg:h-[450px] border border-dashed border-black/10 bg-white flex flex-col items-center justify-center cursor-pointer group overflow-hidden relative"
                      >
                        {popupSettings.image_url ? (
                          <>
                            <img src={getFullImageUrl(popupSettings.image_url)} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-black px-6 py-3 border border-black/20 text-[9px] uppercase tracking-widest text-white font-black">Replace Visual</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-10">
                            <ImageIcon size={40} className="mx-auto mb-6 text-black/20 group-hover:text-black transition-colors" />
                            <p className="text-[10px] tracking-[0.4em] text-black/40 uppercase group-hover:text-black transition-colors font-black">Upload Portrait Visual</p>
                            <p className="text-[8px] text-black/20 uppercase mt-4 tracking-widest font-black">Recommended: 800 x 1200px</p>
                          </div>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={24} />
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={uploading}
                        className={`w-full py-5 text-[10px] tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 ${uploading ? 'bg-neutral-100 text-black/20' : 'bg-black text-white hover:bg-neutral-800'} font-black`}
                      >
                        <Save size={16} /> Save Cinematic Popup Settings
                      </button>
                    </div>
                  </form>
                </section>


                {/* NEWSLETTER REGISTRY */}
                <section className="space-y-10 bg-neutral-50 p-5 sm:p-8 md:p-12 border border-black/5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase text-black">Inner Circle Registry</h2>
                      <p className="text-[10px] tracking-[0.3em] text-black/40 uppercase font-black">Newsletter Subscriber Manifest</p>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <div className="text-right flex-grow sm:flex-grow-0">
                        <p className="text-[9px] text-black/40 uppercase tracking-widest mb-1 font-black">Total Members</p>
                        <p className="text-2xl font-serif text-black">{newsletterSubscribers.length}</p>
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
                        className="bg-black text-white p-5 md:px-8 md:py-4 text-[9px] uppercase tracking-[0.3em] transition-all hover:bg-neutral-800 flex items-center justify-center gap-3 shadow-lg"
                        title="Export Manifest"
                      >
                        <Download size={16} /> <span className="hidden sm:inline">Export Manifest</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black/10">
                            <th className="py-6 text-[11px] tracking-widest text-black/40 font-light">Email Identity</th>
                            <th className="py-6 text-[11px] tracking-widest text-black/40 font-light">Signed Up From</th>
                            <th className="py-6 text-[11px] tracking-widest text-black/40 font-light">Date of Entry</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newsletterSubscribers.map((sub) => (
                            <tr key={sub.id} className="border-b border-black/5 hover:bg-neutral-50 transition-colors">
                              <td className="py-6">
                                <div className="flex items-center gap-3">
                                  <Mail size={14} className="text-black/20" />
                                  <span className="text-[12px] text-black tracking-wider">{sub.email}</span>
                                </div>
                              </td>
                              <td className="py-6">
                                <span className={`text-[10px] px-3 py-1 border ${sub.source === 'popup' ? 'border-black bg-black text-white' : 'border-black/10 text-black/30'} tracking-wider capitalize font-light`}>
                                  {sub.source.replace("_", " ").replace("modal", "form")}
                                </span>
                              </td>
                              <td className="py-6 text-[11px] text-black/60 font-mono">
                                {new Date(sub.subscribed_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                          {newsletterSubscribers.length === 0 && (
                            <tr>
                              <td colSpan="3" className="py-20 text-center bg-neutral-50/50 ">
                                <p className="text-[10px] uppercase tracking-[0.5em] text-black/20  font-black">No members have joined the Inner Circle yet.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                      {newsletterSubscribers.map((sub) => (
                        <div key={sub.id} className="bg-neutral-50 border border-black/5 p-5 space-y-4">
                          <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                            <Mail size={16} className="text-black" />
                            <span className="text-[11px] text-black font-bold tracking-wider truncate">{sub.email}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-[8px] px-2 py-1 border ${sub.source === 'popup' ? 'bg-black text-white border-black' : 'border-black/10 text-black/60'} uppercase tracking-[0.2em]  font-black`}>
                              {sub.source.replace("_", " ").replace("modal", "form")}
                            </span>
                            <span className="text-[9px] text-black/40 uppercase font-sans">{new Date(sub.subscribed_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                      {newsletterSubscribers.length === 0 && (
                        <div className="py-12 text-center text-black/20 uppercase tracking-widest text-[9px] bg-neutral-50 border border-dashed border-black/10 ">No Members Found</div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'homepage' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
            {tabsLoading.homepage ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-black" size={32} />
              </div>
            ) : (
              <>
                {/* HERO VIDEO MANAGEMENT */}
                <section className="space-y-8 bg-neutral-50 p-5 sm:p-8 md:p-12 border border-black/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 blur-[80px] rounded-full pointer-events-none" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase text-black">Hero Video</h2>
                      <p className="text-[10px] tracking-[0.3em] text-black/40 uppercase font-black">Main Homepage Cinematic Visual</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <label className={labelClasses}>Direct Video URL</label>
                      <input
                        className={inputClasses}
                        value={heroVideoUrl}
                        onChange={e => setHeroVideoUrl(e.target.value)}
                        placeholder="/assets/hero.mp4 or https://..."
                      />
                      <p className="text-[9px] text-black/40 uppercase tracking-[0.2em]  font-black">Leave empty to use default video.</p>
                      <button
                        onClick={handleSaveHeroVideo}
                        disabled={isProcessing}
                        className={`w-full py-5 text-[10px] tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 ${isProcessing ? 'bg-neutral-100 text-black/20' : 'bg-black text-white hover:bg-neutral-800'} font-black`}
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Hero & Signature Settings
                      </button>
                    </div>
                    <div className="space-y-6">
                      <label className={labelClasses}>Upload Custom Video</label>
                      <div
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'video/*';
                          input.onchange = async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setIsProcessing(true);
                            const formData = new FormData();
                            formData.append('image', file);
                            formData.append('folder', 'kiks_lifestyle');
                            try {
                              const res = await fetch(`${API_URL}/api/upload`, {
                                method: 'POST',
                                headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET },
                                body: formData
                              });
                              const data = await res.json();
                              if (res.ok) setHeroVideoUrl(data.url);
                            } finally { setIsProcessing(false); }
                          };
                          input.click();
                        }}
                        className="h-48 border border-dashed border-black/10 bg-white flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
                      >
                        <div className="text-center p-6">
                          <Upload className="mx-auto mb-4 text-black/20 group-hover:text-black transition-colors" size={32} />
                          <p className="text-[9px] uppercase tracking-[0.3em] text-black/40 group-hover:text-black transition-colors font-black">Select Video File</p>
                        </div>
                        {isProcessing && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={24} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {heroVideoUrl && (
                    <div className="mt-8 border border-black/5 bg-white p-2">
                      <video src={heroVideoUrl.startsWith('http') || heroVideoUrl.startsWith('/assets') ? heroVideoUrl : `${API_URL}${heroVideoUrl}`} className="w-full h-auto max-h-96 object-cover" muted loop autoPlay playsInline />
                    </div>
                  )}
                </section>

                {/* SIGNATURE PRODUCT (ELITE) MANAGEMENT */}
                <section className="space-y-8 bg-neutral-50 p-5 sm:p-8 md:p-12 border border-black/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-black/5 blur-[80px] rounded-full pointer-events-none" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase text-black">Signature Masterpiece Showcase</h2>
                      <p className="text-[10px] tracking-[0.3em] text-black/40 uppercase font-black">Curated Homepage Section II Management</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you certain you want to wipe the entire Signature Manifesto? This will hide the section from the homepage.')) {
                          setSignatureProduct({
                            image_url: '',
                            name: '',
                            description: '',
                            strength: '',
                            notes: '',
                            link: ''
                          });
                        }
                      }}
                      className="text-[9px] tracking-[0.3em] uppercase text-red-500 hover:text-red-700 font-black flex items-center gap-2 border border-red-100 hover:border-red-200 px-4 py-2 bg-red-50/30 transition-all"
                    >
                      <Trash2 size={12} /> Reset Section
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Product Visual */}
                    <div className="space-y-6">
                      <label className={labelClasses}>Signature Visual (Section 2 Asset)</label>
                      <div
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg';
                          input.onchange = async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setIsProcessing(true);
                            const formData = new FormData();
                            formData.append('image', file);
                            formData.append('folder', 'kiks_general');
                            try {
                              const res = await fetch(`${API_URL}/api/upload`, {
                                method: 'POST',
                                headers: { 
                                  'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET,
                                  'Authorization': `Bearer ${token}`
                                },
                                body: formData
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setSignatureProduct({ ...signatureProduct, image_url: data.url });
                                showSuccessToast('Signature Visual Uploaded.');
                              } else {
                                showErrorToast(data.msg || 'Upload failed.');
                              }
                            } catch (err) {
                              showErrorToast('Network fault during upload.');
                            } finally { setIsProcessing(false); }
                          };
                          input.click();
                        }}
                        className="aspect-[3/4] border border-dashed border-black/10 bg-white flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
                      >
                        {signatureProduct.image_url ? (
                          <>
                            {isVideo(signatureProduct.image_url) ? (
                              <video 
                                src={getFullImageUrl(signatureProduct.image_url)} 
                                className="w-full h-full object-cover" 
                                autoPlay 
                                muted 
                                loop 
                              />
                            ) : (
                              <img 
                                src={getFullImageUrl(signatureProduct.image_url)} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                alt="Signature Preview" 
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                              <span className="text-white text-[10px] tracking-widest uppercase border border-white/20 px-6 py-3 font-black">Replace Asset</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSignatureProduct({ ...signatureProduct, image_url: '' });
                                }}
                                className="bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full transition-all hover:scale-110"
                                title="Clear Asset"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-8">
                            <ImageIcon size={40} className="mx-auto mb-4 text-black/20 group-hover:text-black transition-colors" />
                            <p className="text-[10px] tracking-[0.3em] text-black/40 uppercase font-black">Upload Section 2 Asset</p>
                          </div>
                        )}
                        {isProcessing && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={labelClasses}>Or Paste Asset URL (Image/Video)</label>
                        <input
                          className={inputClasses}
                          value={signatureProduct.image_url}
                          onChange={e => setSignatureProduct({ ...signatureProduct, image_url: e.target.value })}
                          placeholder="https://cloudinary.com/..."
                        />
                      </div>
                    </div>

                    {/* Right: Product Narrative */}
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Signature Name *</label>
                          <input
                            className={`${inputClasses} !text-lg !font-serif !tracking-widest font-black`}
                            value={signatureProduct.name}
                            onChange={e => setSignatureProduct({ ...signatureProduct, name: e.target.value })}
                            placeholder=""
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Fragrance Strength *</label>
                          <input
                            className={inputClasses}
                            value={signatureProduct.strength}
                            onChange={e => setSignatureProduct({ ...signatureProduct, strength: e.target.value })}
                            placeholder=""
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Action Link *</label>
                          <input
                            className={inputClasses}
                            value={signatureProduct.link}
                            onChange={e => setSignatureProduct({ ...signatureProduct, link: e.target.value })}
                            placeholder=""
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClasses}>Olfactory Composition (Notes) *</label>
                        <input
                          className={inputClasses}
                          value={signatureProduct.notes}
                          onChange={e => setSignatureProduct({ ...signatureProduct, notes: e.target.value })}
                          placeholder=""
                        />
                      </div>

                      <div>
                        <label className={labelClasses}>Narrative Description *</label>
                        <textarea
                          className={`${inputClasses} h-48 !text-sm leading-relaxed`}
                          value={signatureProduct.description}
                          onChange={e => setSignatureProduct({ ...signatureProduct, description: e.target.value })}
                          placeholder=""
                        />
                      </div>

                      <button
                        onClick={handleSaveHeroVideo}
                        disabled={isProcessing}
                        className={`w-full py-5 text-[10px] tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 ${isProcessing ? 'bg-neutral-100 text-black/20' : 'bg-black text-white hover:bg-neutral-800'} font-black shadow-lg shadow-black/10`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Synchronizing Manifesto...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Confirm Signature Manifesto</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </section>

                {/* LUXURY SHOWCASE MANAGEMENT */}
                <section className="bg-white border border-black/5 p-5 md:p-12 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 blur-[80px] rounded-full pointer-events-none" />
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                      <h2 className="text-base md:text-lg tracking-[0.2em] uppercase text-black">Luxury Showcase</h2>
                      <p className="text-[10px] tracking-[0.2em] text-black/40 uppercase font-black">Homepage Cinematic Scroller Manifest</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setShowcaseFormData({ name: '', description: '', image_url: '', product_link: '', display_order: 0 });
                        setIsAddingShowcase(true);
                      }}
                      className="w-full md:w-auto bg-black text-white px-10 py-5 text-[10px] uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3"
                    >
                      <Plus size={16} /> Manifest New Showcase
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {showcaseProducts.map((product) => (
                      <div key={product.id} className="group border border-black/5 bg-neutral-50 p-6 flex items-center gap-6 hover:border-black/20 transition-all">
                        <div className="w-20 h-20 bg-white border border-black/5 flex-shrink-0">
                          <img src={getFullImageUrl(product.image_url)} className="w-full h-full object-contain p-2" alt="" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-[11px] font-bold tracking-widest uppercase mb-1 truncate">{product.name}</h4>
                          <p className="text-[9px] text-black/40 tracking-widest uppercase truncate font-black">{product.product_link}</p>
                          <div className="flex gap-4 mt-4">
                            <button
                              onClick={() => {
                                setEditingId(product.id);
                                setShowcaseFormData({ ...product });
                                setIsAddingShowcase(true);
                              }}
                              className="text-[9px] uppercase tracking-widest text-black/40 hover:text-black"
                            >Edit</button>
                            <button onClick={() => handleDeleteShowcase(product.id)} className="text-[9px] uppercase tracking-widest text-red-600/40 hover:text-red-600">Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {showcaseProducts.length === 0 && !tabsLoading.homepage && (
                      <div className="col-span-full py-16 text-center border border-dashed border-black/10 bg-neutral-50/50">
                        <p className="text-[10px] tracking-[0.4em] text-black/20 uppercase font-black">No Cinematic Manifests Registered</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* COMMUNITY GALLERY */}
                <section className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <h2 className="text-base md:text-lg tracking-[0.2em] uppercase text-black">Seen In KIKS</h2>
                      <p className="text-[10px] tracking-[0.3em] text-black/40 uppercase font-black">Community Gallery & Social Proof</p>
                    </div>
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = 'image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg';
                        input.onchange = handleBulkGalleryUpload;
                        input.click();
                      }}
                      className="w-full md:w-auto bg-black text-white px-10 py-5 text-[10px] uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3"
                    >
                      <Plus size={18} /> Append Lifestyle Visual
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                    {communityGallery.map((img) => (
                      <div key={img.id} className="aspect-square relative group bg-neutral-100 overflow-hidden border border-black/5">
                        <img src={getFullImageUrl(img.image_url)} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteGalleryImage(img.id)}
                            className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {communityGallery.length === 0 && (
                      <div className="col-span-full py-20 text-center border border-dashed border-black/10 bg-neutral-50">
                        <p className="text-[10px] uppercase tracking-[0.5em] text-black/20 font-black">The gallery remains uncurated.</p>
                      </div>
                    )}
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
                  setProductFormTab('general');
                  setColFormData({ name: '', slug: '', banner_url: '', description: '', video_url: '' });
                  setProdFormData({ collection_id: '', name: '', slug: '', price: '', image_url: '', gallery_urls: [], description: '', top_notes: '', heart_notes: '', base_notes: '', stock_count: 50, size: '100ml', product_type: 'EXTRAIT DE PARFUM SPRAY', additional_info: '' });
                  setBlogFormData({ title: '', slug: '', content: '', image_url: '', keywords: '', author: 'Kiks Artisan' });
                  setPromoFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', expiry_date: '', usage_limit: '' });
                }}
                className="w-full md:w-auto flex items-center justify-center space-x-4 bg-black text-white px-8 md:px-10 py-4 md:py-5 hover:bg-neutral-800 transition-all group"
              >
                {isAdding ? <X size={18} /> : <Plus size={18} />}
                <span className="text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.4em] uppercase font-black">
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
                  className="bg-neutral-50 border border-black/10 p-4 sm:p-6 md:p-12 mb-10 md:mb-20 overflow-hidden"
                >
                  <form onSubmit={activeTab === 'collections' ? handleAddCollection : activeTab === 'products' ? handleAddProduct : activeTab === 'blogs' ? handleAddBlog : handleAddPromoCode} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-10">

                    <div className="md:col-span-2 text-center pb-4 md:pb-6 border-b border-black/10 mb-2 md:mb-4">
                      <h3 className="text-base md:text-lg tracking-[0.3em] md:tracking-[0.4em] text-black font-serif uppercase ">
                        {editingId ? `Editing ${activeTab === 'collections' ? 'Collection' : activeTab === 'products' ? 'Product' : activeTab === 'blogs' ? 'Blog' : 'Promo Code'}` : `New ${activeTab === 'collections' ? 'Collection' : activeTab === 'products' ? 'Product' : activeTab === 'blogs' ? 'Blog' : 'Promo Code'}`}
                      </h3>
                    </div>

                    {activeTab !== 'promo-codes' && activeTab !== 'products' && (
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <label className={labelClasses}>Visual Essence</label>
                          <div className="flex bg-neutral-100 p-1 rounded-sm border border-black/5">
                            <button
                              type="button"
                              onClick={() => setMediaSourceTab('upload')}
                              className={`px-4 py-1.5 text-[9px] uppercase tracking-widest transition-all ${mediaSourceTab === 'upload' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black'} font-black`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => setMediaSourceTab('link')}
                              className={`px-4 py-1.5 text-[9px] uppercase tracking-widest transition-all ${mediaSourceTab === 'link' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black'} font-black`}
                            >
                              Paste Link
                            </button>
                          </div>
                        </div>

                        {mediaSourceTab === 'upload' ? (
                          <div
                            onClick={() => fileInputRef.current.click()}
                            className="relative w-full h-40 sm:h-56 md:h-72 bg-white border border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-neutral-50 transition-all group overflow-hidden"
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              className="hidden"
                              accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg"
                            />

                            {(activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url) ? (
                              <div className="relative w-full h-full">
                                {isVideo(activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url) ? (
                                  <video src={getFullImageUrl(activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url)} className="w-full h-full object-cover opacity-90" muted loop autoPlay />
                                ) : (
                                  <img
                                    src={getFullImageUrl(activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url)}
                                    className="w-full h-full object-cover opacity-90 transition-all group-hover:opacity-100"
                                  />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white bg-black px-4 sm:px-6 py-2 sm:py-3 border border-black/10 text-center mx-2 font-black">Replace Content</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center p-8">
                                {uploading ? (
                                  <Loader2 className="animate-spin text-black mb-6" size={32} />
                                ) : (
                                  <Upload className="text-black/10 group-hover:text-black mb-6 transition-colors" size={32} />
                                )}
                                <span className="text-[11px] tracking-[0.4em] uppercase text-black/40 text-center font-black">{uploading ? 'Analyzing Structure...' : 'Upload Cinematic Visual'}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6 bg-white p-6 border border-black/10">
                            <div>
                              <label className="text-[9px] tracking-[0.2em] uppercase text-black/60 mb-2 block font-black">Image or Video URL</label>
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  className={`${inputClasses} flex-grow`}
                                  placeholder="https://cloudinary.com/v12345/video.mp4 or image.jpg"
                                  value={activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : (activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url)}
                                  onChange={(e) => {
                                    const url = e.target.value;
                                    if (activeTab === 'collections') {
                                      if (isVideo(url)) {
                                        setColFormData({ ...colFormData, video_url: url, banner_url: '' });
                                      } else {
                                        setColFormData({ ...colFormData, banner_url: url, video_url: '' });
                                      }
                                    } else if (activeTab === 'products') {
                                      setProdFormData({ ...prodFormData, image_url: url });
                                    } else if (activeTab === 'blogs') {
                                      setBlogFormData({ ...blogFormData, image_url: url });
                                    }
                                  }}
                                />
                              </div>
                              <p className="text-[8px] text-black/40 mt-2 uppercase tracking-widest font-black italic">The system automatically detects if it's an image or a video.</p>
                            </div>

                            {/* Preview for Link */}
                            {(activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url) && (
                              <div className="aspect-video w-full border border-black/5 overflow-hidden">
                                {isVideo(activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url) ? (
                                  <video src={getFullImageUrl(activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url)} className="w-full h-full object-cover" muted loop autoPlay />
                                ) : (
                                  <img src={getFullImageUrl(activeTab === 'collections' ? (colFormData.video_url || colFormData.banner_url) : activeTab === 'products' ? prodFormData.image_url : blogFormData.image_url)} className="w-full h-full object-cover" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'collections' ? (
                      <>
                        <div><label className={labelClasses}>Collection Name</label><input required className={inputClasses} value={colFormData.name} onChange={e => setColFormData({ ...colFormData, name: e.target.value })} /></div>
                        <div><label className={labelClasses}>Slug (URL part)</label><input required className={inputClasses} value={colFormData.slug} onChange={e => setColFormData({ ...colFormData, slug: e.target.value })} /></div>
                      </>
                    ) : activeTab === 'blogs' ? (
                      <>
                        <div className="md:col-span-2"><label className={labelClasses}>Blog Title</label><input required className={inputClasses} value={blogFormData.title} onChange={e => setBlogFormData({ ...blogFormData, title: e.target.value })} placeholder="e.g. The Art of Oud" /></div>
                        <div><label className={labelClasses}>SEO Slug (URL)</label><input required className={inputClasses} value={blogFormData.slug} onChange={e => setBlogFormData({ ...blogFormData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} placeholder="the-art-of-oud" /></div>
                        <div><label className={labelClasses}>Keywords (Comma separated)</label><input className={inputClasses} value={blogFormData.keywords} onChange={e => setBlogFormData({ ...blogFormData, keywords: e.target.value })} placeholder="luxury, perfume, oud" /></div>
                        <div><label className={labelClasses}>Author</label><input className={inputClasses} value={blogFormData.author} onChange={e => setBlogFormData({ ...blogFormData, author: e.target.value })} /></div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Journal Content</label>
                          <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3 ">Rich text narrative support enabled</div>
                          <textarea required className={`${inputClasses} h-80 md:h-[500px] font-sans !normal-case tracking-normal !leading-relaxed p-6 md:p-8 bg-white/[0.03] text-sm md:text-base font-black`} value={blogFormData.content} onChange={e => setBlogFormData({ ...blogFormData, content: e.target.value })} />
                        </div>
                      </>
                    ) : activeTab === 'promo-codes' ? (
                      <>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Promo Code Identity</label>
                          <input required className={`${inputClasses} !text-lg !font-serif !tracking-[0.2em] uppercase text-black font-black`} value={promoFormData.code} onChange={e => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })} placeholder="e.g. KIKS2026" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:col-span-2">
                          <div>
                            <label className={labelClasses}>Discount Type</label>
                            <select required className={inputClasses} value={promoFormData.discount_type} onChange={e => setPromoFormData({ ...promoFormData, discount_type: e.target.value })}>
                              <option value="percentage" className="bg-white">Percentage (%)</option>
                              <option value="fixed" className="bg-white">Fixed Amount (₹)</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClasses}>Discount Value {promoFormData.discount_type === 'percentage' ? '(%)' : '(₹)'}</label>
                            <div className="relative">
                              <input required type="number" className={inputClasses} value={promoFormData.discount_value} onChange={e => setPromoFormData({ ...promoFormData, discount_value: e.target.value })} placeholder={promoFormData.discount_type === 'percentage' ? 'e.g. 10' : 'e.g. 500'} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 text-[10px] font-bold">
                                {promoFormData.discount_type === 'percentage' ? '%' : '₹'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:col-span-2">
                          <div>
                            <label className={labelClasses}>Min Order Amount (₹ Required)</label>
                            <input type="number" className={inputClasses} value={promoFormData.min_order_amount} onChange={e => setPromoFormData({ ...promoFormData, min_order_amount: e.target.value })} placeholder="e.g. 1000" />
                          </div>
                          <div>
                            <label className={labelClasses}>Max Discount Cap {promoFormData.discount_type === 'percentage' ? '(₹)' : '(N/A)'}</label>
                            <input
                              type="number"
                              disabled={promoFormData.discount_type === 'fixed'}
                              className={`${inputClasses} ${promoFormData.discount_type === 'fixed' ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}
                              value={promoFormData.max_discount}
                              onChange={e => setPromoFormData({ ...promoFormData, max_discount: e.target.value })}
                              placeholder={promoFormData.discount_type === 'percentage' ? 'Max rupee limit' : 'Only for % type'}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2 bg-white border border-black/5 p-6 md:p-10 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
                              <Ticket size={18} className="text-black" />
                            </div>
                            <div>
                              <p className="text-[10px] tracking-[0.3em] uppercase text-black  font-black">Calculation Logic Manifest</p>
                              <p className="text-[8px] text-black/40 uppercase tracking-widest mt-1 font-black">Real-time discount application strategy</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] tracking-widest text-black/60 leading-relaxed">
                            <div className={`p-4 border border-black/5 bg-neutral-50 ${promoFormData.discount_type === 'percentage' ? 'border-black' : ''}`}>
                              <p className={` mb-2 uppercase ${promoFormData.discount_type === 'percentage' ? 'text-black' : 'text-black/40'}`}>Percentage Mode:</p>
                              <p>Reduces total by {promoFormData.discount_value || '0'}%. {promoFormData.max_discount ? `Discount capped at ₹${promoFormData.max_discount}.` : 'No upper limit cap.'}</p>
                            </div>
                            <div className={`p-4 border border-black/5 bg-neutral-50 ${promoFormData.discount_type === 'fixed' ? 'border-black' : ''}`}>
                              <p className={` mb-2 uppercase ${promoFormData.discount_type === 'fixed' ? 'text-black' : 'text-black/40'}`}>Fixed Amount Mode:</p>
                              <p>Subtracts flat ₹{promoFormData.discount_value || '0'} from Subtotal. Requires minimum purchase of ₹{promoFormData.min_order_amount || '0'}.</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:col-span-2">
                          <div><label className={labelClasses}>Expiry Date</label><input type="date" className={inputClasses} value={promoFormData.expiry_date} onChange={e => setPromoFormData({ ...promoFormData, expiry_date: e.target.value })} /></div>
                          <div><label className={labelClasses}>Usage Limit (Total)</label><input type="number" className={inputClasses} value={promoFormData.usage_limit} onChange={e => setPromoFormData({ ...promoFormData, usage_limit: e.target.value })} placeholder="e.g. 100" /></div>
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="md:col-span-2 mb-8">
                          <ImageUploadZone
                            label="Primary Product Essence (Main Image)"
                            value={prodFormData.image_url}
                            onUpload={(e) => handleImageUpload(e)}
                            height="h-80 md:h-[500px]"
                          />
                        </div>

                        <div className="md:col-span-2 mb-8 border-b border-black/5 pb-8">
                          <label className={labelClasses + " mb-6"}>Cinematic Gallery (Supplementary Visuals)</label>
                          <div className="flex flex-wrap gap-6 mb-8">
                            {(prodFormData.gallery_urls || []).map((url, i) => (
                              <div key={i} className="relative w-32 h-32 border-2 border-black/10 group bg-white shadow-sm overflow-hidden">
                                {isVideo(url) ? (
                                  <video src={getFullImageUrl(url)} className="w-full h-full object-cover opacity-90" muted />
                                ) : (
                                  <img src={getFullImageUrl(url)} className="w-full h-full object-cover opacity-90" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => setProdFormData(prev => ({ ...prev, gallery_urls: prev.gallery_urls.filter((_, idx) => idx !== i) }))}
                                  className="absolute top-2 right-2 bg-black text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                                ><X size={14} /></button>
                              </div>
                            ))}

                            <div
                              onClick={() => galleryInputRef.current.click()}
                              className="w-32 h-32 border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-neutral-50 transition-all group"
                            >
                              <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} className="hidden" accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg" />
                              {uploadingGallery ? <Loader2 size={28} className="animate-spin text-black" /> : <Plus size={28} className="text-black/20 group-hover:text-black transition-colors" />}
                              <span className="text-[8px] tracking-widest uppercase text-black/20 group-hover:text-black mt-2 font-black">Add Asset</span>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-1">
                          <label className={labelClasses}>Collection Registry</label>
                          <select required className={inputClasses} value={prodFormData.collection_id} onChange={e => setProdFormData({ ...prodFormData, collection_id: e.target.value })}>
                            <option value="" className="bg-white">Select Collection</option>
                            {collections.map(c => <option className="bg-white" key={c.id} value={c.id}>{c.name}</option>)}
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
                          <label className={labelClasses}>Boutique Sale Price (₹ - Optional)</label>
                          <input className={`${inputClasses} !border-black/20 text-black placeholder:text-black/20`} value={prodFormData.sale_price} onChange={e => setProdFormData({ ...prodFormData, sale_price: e.target.value })} placeholder="15,000" />
                        </div>
                        <div className="md:col-span-1">
                          <label className={labelClasses}>Stock Registry</label>
                          <input type="number" className={inputClasses} value={prodFormData.stock_count} onChange={e => setProdFormData({ ...prodFormData, stock_count: e.target.value })} />
                        </div>
                        <div className="md:col-span-1">
                          <label className={labelClasses}>Concentration Type</label>
                          <input className={inputClasses} value={prodFormData.product_type} onChange={e => setProdFormData({ ...prodFormData, product_type: e.target.value })} placeholder="EXTRAIT DE PARFUM SPRAY" />
                        </div>
                        <div className="md:col-span-1">
                          <label className={labelClasses}>Physical Size (e.g. 100ml)</label>
                          <input required className={`${inputClasses} border-red-600/20`} value={prodFormData.size} onChange={e => setProdFormData({ ...prodFormData, size: e.target.value })} placeholder="100ml" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Slug (URL Architecture)</label>
                          <input required className={inputClasses} value={prodFormData.slug} onChange={e => setProdFormData({ ...prodFormData, slug: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Narrative Description</label>
                          <textarea required className={`${inputClasses} h-32 text-xs md:text-sm p-4`} value={prodFormData.description} onChange={e => setProdFormData({ ...prodFormData, description: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Additional Information (Product Details Tab)</label>
                          <textarea className={`${inputClasses} h-32 text-xs md:text-sm p-4`} value={prodFormData.additional_info} onChange={e => setProdFormData({ ...prodFormData, additional_info: e.target.value })} placeholder="Enter detailed boutique information, care guidelines, or technical specifications..." />
                        </div>

                        <div className="md:col-span-2 mt-8 border-t border-black/10 pt-8">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <h4 className="text-[10px] tracking-[0.3em] uppercase text-black ">Volume Variations (Optional)</h4>
                            <button
                              type="button"
                              onClick={handleAddVariantField}
                              className="w-full sm:w-auto text-[9px] tracking-[0.2em] uppercase font-bold border border-black/30 px-6 py-3 hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 font-black"
                            >
                              <Plus size={14} /> Add Variant
                            </button>
                          </div>

                          <div className="space-y-6">
                            {(prodFormData.variants || []).map((v, idx) => (
                              <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end bg-white p-5 md:p-6 border border-black/5 relative">
                                <div>
                                  <label className={labelClasses}>Size</label>
                                  <input placeholder="50ML" className={inputClasses + " mb-0 text-[10px]"} value={v.size} onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)} />
                                </div>
                                <div>
                                  <label className={labelClasses}>Color/Type</label>
                                  <input placeholder="Gold/Wax" className={inputClasses + " mb-0 text-[10px]"} value={v.color} onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)} />
                                </div>
                                <div>
                                  <label className={labelClasses}>Price</label>
                                  <input placeholder="12,500" className={inputClasses + " mb-0 text-[10px]"} value={v.price} onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)} />
                                </div>
                                <div>
                                  <label className={labelClasses}>Stock</label>
                                  <input type="number" placeholder="20" className={inputClasses + " mb-0 text-[10px]"} value={v.stock} onChange={(e) => handleUpdateVariant(idx, 'stock', e.target.value)} />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                  <button type="button" onClick={() => handleRemoveVariant(idx)} className="w-full bg-red-600/5 border border-red-600/10 text-red-600 py-3 md:py-4 hover:bg-red-600 hover:text-white transition-all text-[9px] uppercase tracking-widest">Remove</button>
                                </div>
                              </div>
                            ))}
                            {(!prodFormData.variants || prodFormData.variants.length === 0) && (
                              <div className="py-10 text-center border border-dashed border-black/10 bg-neutral-50">
                                <p className="text-[10px] tracking-[0.3em] text-black/20 uppercase  font-black">Standard baseline defined. No additional variants.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2 mt-12 border-t border-black/10 pt-12">
                          <div className="md:col-span-2 mb-8">
                            <h4 className="text-[10px] tracking-[0.3em] uppercase text-black mb-8 border-b border-black/5 pb-4">Olfactory Composition</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                              <div><label className={labelClasses}>Top Notes (Registry)</label><input className={inputClasses} value={prodFormData.top_notes} onChange={e => setProdFormData({ ...prodFormData, top_notes: e.target.value })} placeholder="e.g. Bergamot, Saffron" /></div>
                              <div><label className={labelClasses}>Heart Notes (Registry)</label><input className={inputClasses} value={prodFormData.heart_notes} onChange={e => setProdFormData({ ...prodFormData, heart_notes: e.target.value })} placeholder="e.g. Oud, Rose" /></div>
                              <div><label className={labelClasses}>Base Notes (Registry)</label><input className={inputClasses} value={prodFormData.base_notes} onChange={e => setProdFormData({ ...prodFormData, base_notes: e.target.value })} placeholder="e.g. Amber, Musk" /></div>
                            </div>
                          </div>

                          <div className="md:col-span-2 bg-white p-8 border border-black/5 mb-8">
                            <label className={labelClasses}>Detailed Ingredient Narrative</label>
                            <div className="grid grid-cols-1 gap-8 mt-6">
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <span className="text-[10px] text-black w-24 tracking-[0.2em] uppercase bg-neutral-50 p-2 text-center font-black">Top</span>
                                <input className={inputClasses + " !mb-0 flex-1"} value={prodFormData.top_note_label} placeholder="Cinematic description for Top Notes" onChange={e => setProdFormData({ ...prodFormData, top_note_label: e.target.value })} />
                              </div>
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <span className="text-[10px] text-black w-24 tracking-[0.2em] uppercase bg-neutral-50 p-2 text-center font-black">Heart</span>
                                <input className={inputClasses + " !mb-0 flex-1"} value={prodFormData.heart_note_label} placeholder="Cinematic description for Heart Notes" onChange={e => setProdFormData({ ...prodFormData, heart_note_label: e.target.value })} />
                              </div>
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <span className="text-[10px] text-black w-24 tracking-[0.2em] uppercase bg-neutral-50 p-2 text-center font-black">Base</span>
                                <input className={inputClasses + " !mb-0 flex-1"} value={prodFormData.base_note_label} placeholder="Cinematic description for Base Notes" onChange={e => setProdFormData({ ...prodFormData, base_note_label: e.target.value })} />
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-12 bg-neutral-50 p-6 md:p-12 border border-black/5">
                            <div className="flex items-center gap-4 border-b border-black/5 pb-6">
                              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-lg">
                                <Layers size={18} />
                              </div>
                              <div>
                                <h4 className="text-[11px] tracking-[0.3em] uppercase text-black font-black">Fragrantica Visual Architecture</h4>
                                <p className="text-[8px] text-black/40 uppercase tracking-widest mt-1 font-black">Compose multi-layered olfactory profiles with custom iconography</p>
                              </div>
                            </div>

                            {['top', 'heart', 'base'].map((type) => (
                              <div key={type} className="space-y-6">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[10px] tracking-[0.2em] uppercase text-black font-black border-l-4 border-black pl-4">{type} Notes Profile</h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const key = `${type}_notes_icons`;
                                      setProdFormData({
                                        ...prodFormData,
                                        [key]: [...(prodFormData[key] || []), { name: '', url: '' }]
                                      });
                                    }}
                                    className="text-[9px] tracking-widest uppercase bg-black text-white px-4 py-2 hover:bg-neutral-800 transition-all flex items-center gap-2"
                                  >
                                    <Plus size={12} /> Add {type} Note
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                  {(prodFormData[`${type}_notes_icons`] || []).map((note, idx) => (
                                    <div key={idx} className="relative bg-white p-4 border border-black/5 group shadow-sm hover:shadow-md transition-all">
                                      <div 
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.onchange = async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            setIsProcessing(true);
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            const folder = prodFormData.slug ? `kiks_products/${prodFormData.slug}` : 'kiks_products';
                                            formData.append('folder', folder);
                                            try {
                                              const res = await fetch(`${API_URL}/api/upload`, {
                                                method: 'POST',
                                                headers: { 
                                                  'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET,
                                                  'Authorization': `Bearer ${token}`
                                                },
                                                body: formData
                                              });
                                              const data = await res.json();
                                              if (res.ok) {
                                                const key = `${type}_notes_icons`;
                                                const newList = [...prodFormData[key]];
                                                newList[idx] = { ...newList[idx], url: data.url };
                                                setProdFormData({ ...prodFormData, [key]: newList });
                                                showSuccessToast('Note Visual Updated.');
                                              }
                                            } catch (err) { showErrorToast('Upload failed.'); }
                                            finally { setIsProcessing(false); }
                                          };
                                          input.click();
                                        }}
                                        className="aspect-square rounded-full border border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all group overflow-hidden mb-3"
                                      >
                                        {note.url ? (
                                          <img src={getFullImageUrl(note.url)} className="w-full h-full object-cover" />
                                        ) : (
                                          <ImageIcon className="text-black/10 group-hover:text-black transition-colors" size={24} />
                                        )}
                                      </div>
                                      <input 
                                        className="w-full text-center text-[9px] uppercase tracking-widest font-black bg-transparent border-none focus:ring-0 p-0"
                                        placeholder="Note Name"
                                        value={note.name}
                                        onChange={(e) => {
                                          const key = `${type}_notes_icons`;
                                          const newList = [...prodFormData[key]];
                                          newList[idx] = { ...newList[idx], name: e.target.value };
                                          setProdFormData({ ...prodFormData, [key]: newList });
                                        }}
                                      />
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const key = `${type}_notes_icons`;
                                          setProdFormData({
                                            ...prodFormData,
                                            [key]: prodFormData[key].filter((_, i) => i !== idx)
                                          });
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  ))}
                                  {(prodFormData[`${type}_notes_icons`] || []).length === 0 && (
                                    <div className="col-span-full py-8 text-center border border-dashed border-black/10 text-[9px] uppercase tracking-widest text-black/20 font-black">
                                      Empty Scent Profile
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-2 mt-12 border-t border-black/10 pt-12">
                          <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="lg:col-span-2">
                              <ImageUploadZone
                                label="Cinematic Banner (Narrative Header)"
                                value={prodFormData.story_banner}
                                onUpload={(e) => handleImageUpload(e, 'story_banner')}
                                height="h-56 md:h-80"
                              />
                            </div>
                            <div className="lg:col-span-1">
                              <ImageUploadZone
                                label="The Muse (Vertical Narrative)"
                                value={prodFormData.muse_image}
                                onUpload={(e) => handleImageUpload(e, 'muse_image')}
                                height="h-[400px] md:h-[600px]"
                              />
                            </div>
                            <div className="lg:col-span-1">
                              <label className={labelClasses}>The Cinematic Muse Story</label>
                              <textarea className={`${inputClasses} h-full min-h-[400px] text-xs leading-relaxed p-8`} value={prodFormData.muse_story} onChange={e => setProdFormData({ ...prodFormData, muse_story: e.target.value })} placeholder="Compose the narrative soul of this essence..." />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2 pt-8">
                      <button
                        disabled={isProcessing}
                        type="submit"
                        className={`w-full py-6 text-[11px] tracking-[0.5em] uppercase transition-all flex items-center justify-center ${isProcessing ? 'bg-neutral-100 text-black/40 cursor-wait' : 'bg-black text-white hover:bg-neutral-800'} font-black`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin mr-4" size={18} />
                            Processing Architecture...
                          </>
                        ) : (
                          <><Save size={18} className="mr-4" /> {editingId ? 'Save Modifications' : 'Finalize Selection'}</>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {['collections', 'products', 'promo-codes', 'blogs'].includes(activeTab) ? (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {tabsLoading[activeTab] ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-black" size={32} />
                  </div>
                ) : (
                  (activeTab === 'collections' ? collections : activeTab === 'products' ? products : activeTab === 'promo-codes' ? promoCodes : blogs).length === 0 ? (
                    <div className="text-center py-20 text-black/40 tracking-widest uppercase text-xs bg-neutral-50 border border-black/5">No records found</div>
                  ) : (
                    (activeTab === 'collections' ? collections : activeTab === 'products' ? products : activeTab === 'promo-codes' ? promoCodes : blogs).map(item => (
                      <div key={item.id} className="bg-white border border-black/5 p-6 md:p-8 hover:border-black/20 transition-all group">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                          <div className="w-full md:w-32 h-48 md:h-32 overflow-hidden bg-neutral-50 flex-shrink-0 border border-black/5 flex items-center justify-center group relative">
                            {activeTab === 'promo-codes' ? (
                              <Ticket size={32} className="text-black/10" />
                            ) : (
                              <img src={getFullImageUrl(item.banner_url || item.image_url)} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                            )}
                          </div>

                          <div className="flex-grow space-y-4 w-full">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div>
                                <h3 className="text-sm md:text-base tracking-[0.15em] text-black uppercase mb-1">{item.name || item.title || item.code}</h3>
                                <div className="flex flex-col">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <p className="text-[10px] tracking-[0.15em] text-black uppercase font-black">
                                      {activeTab === 'collections' ? item.slug :
                                        activeTab === 'products' ? `${item.collection_name}` :
                                          activeTab === 'promo-codes' ? (new Date(item.expiry_date) < new Date() ? 'Expired' : 'Active') :
                                            `BY ${item.author || 'Artisan'}`}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-black/10" />
                                    <p className="text-[10px] tracking-[0.15em] text-black/40 uppercase font-black">
                                      {activeTab === 'collections' ? 'Primary Collection' :
                                        activeTab === 'products' ? `₹${item.price} | Stock: ${item.stock_count || 0}` :
                                          activeTab === 'promo-codes' ? `${item.discount_type === 'percentage' ? item.discount_value + '%' : '₹' + item.discount_value} OFF | Used: ${item.usage_count}/${item.usage_limit || '∞'}` :
                                            `${new Date(item.created_at).toLocaleDateString()}`}
                                    </p>
                                  </div>
                                  {activeTab === 'promo-codes' && (
                                    <div className="flex gap-4 mt-3">
                                      <p className="text-[8px] text-black/40 uppercase tracking-widest font-black">Expires: {new Date(item.expiry_date).toLocaleDateString()}</p>
                                      <p className="text-[8px] text-black/40 uppercase tracking-widest font-black">Min Order: ₹{item.min_order_amount || 0}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t border-black/5 sm:border-none">
                                <button onClick={() => handleEdit(activeTab, item)} className="flex-1 sm:flex-none bg-neutral-50 border border-black/10 px-5 py-3 text-[9px] uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2">
                                  <Edit3 size={14} /> Edit
                                </button>
                                <button onClick={() => handleDelete(activeTab === 'blogs' ? 'blogs' : activeTab, item.id)} className="flex-1 sm:flex-none bg-red-600/5 border border-red-600/10 px-5 py-3 text-[9px] uppercase tracking-widest text-red-600/70 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            </div>
                            {activeTab === 'blogs' && (
                              <p className="text-[11px] text-black/40 line-clamp-2 font-serif leading-relaxed max-w-3xl">
                                {item.content?.replace(/<[^>]*>/g, '').substring(0, 180)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            ) : null}
          </motion.div>
        )}

        {activeTab === "carts" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {tabsLoading.carts ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-black" size={32} />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-50 border border-black/5 p-6 md:p-8 gap-6">
                  <div className="flex items-center gap-6">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-black cursor-pointer border-black/20"
                      checked={carts.length > 0 && carts.every(c => selectedCarts.includes(c.id))}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCarts(carts.map(c => c.id));
                        else setSelectedCarts([]);
                      }}
                    />
                    <div>
                      <h2 className="text-xl md:text-2xl font-serif tracking-[0.1em] uppercase text-black">Vault Manifest</h2>
                      <p className="text-xs tracking-[0.2em] text-black/50 uppercase mt-1">Monitoring active acquisitions & abandoned intent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    {selectedCarts.length > 0 && (
                      <button
                        onClick={handleBulkRemoveCarts}
                        className="bg-red-600 text-white px-4 py-2 text-[8px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 font-bold shadow-lg"
                      >
                        <Trash2 size={12} /> Clear Selected ({selectedCarts.length})
                      </button>
                    )}
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-black/40 uppercase tracking-widest mb-1 font-bold">Active Vaults</p>
                      <p className="text-3xl font-serif text-black">{carts.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {carts.length === 0 ? (
                    <div className="p-24 text-center text-black/20 uppercase tracking-[0.4em] border border-black/5 bg-neutral-50/50">
                      The manifest is currently clear
                    </div>
                  ) : (
                    carts.map(cart => (
                      <div key={cart.id} className={`bg-white border transition-all group relative ${selectedCarts.includes(cart.id) ? 'border-red-600/50 bg-red-600/[0.01]' : 'border-black/5 hover:border-black/20'}`}>
                        <div className="flex flex-col lg:flex-row justify-between gap-8 p-6 md:p-10">
                          <div className="flex-grow space-y-8">
                            <div className="flex items-start gap-6 border-b border-black/5 pb-8">
                              <div className="pt-1">
                                <input type="checkbox" className="w-5 h-5 accent-black cursor-pointer" checked={selectedCarts.includes(cart.id)} onChange={(e) => { if (e.target.checked) setSelectedCarts([...selectedCarts, cart.id]); else setSelectedCarts(selectedCarts.filter(id => id !== cart.id)); }} />
                              </div>
                              <div className="w-10 h-10 md:w-14 md:h-14 bg-black text-white flex items-center justify-center font-serif text-base md:text-xl flex-shrink-0">{(cart.user_email || cart.email)?.[0]?.toUpperCase() || 'G'}</div>
                              <div className="min-w-0">
                                <p className="text-sm md:text-base uppercase tracking-widest text-black font-bold mb-1">{cart.first_name ? `${cart.first_name} ${cart.last_name}` : 'Anonymous Guest'}</p>
                                <p className="text-xs text-black/40 tracking-wider font-medium lowercase">{cart.user_email || cart.email || 'Restricted Identity'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.3em] text-black/30 mb-6 font-bold">User Carts</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {cart.items?.map((item, i) => (
                                  <div key={i} className="flex items-center gap-5 bg-neutral-50 p-4 border border-black/5 group-hover:border-black/10 transition-all relative group/item">
                                    <div className="w-16 h-20 bg-white flex-shrink-0 border border-black/5 overflow-hidden"><img src={getFullImageUrl(item.image_url || item.product_image)} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" /></div>
                                    <div className="min-w-0 pr-10">
                                      <p className="text-xs uppercase truncate text-black font-medium leading-tight mb-2">{item.name || item.product_name}</p>
                                      <p className="text-[10px] text-black/50 uppercase tracking-widest font-bold">{item.quantity} Unit(s)</p>
                                      <p className="text-[10px] text-black/30 mt-1">{formatCurrency(item.price, activeCurrency, rates, symbols)} / unit</p>
                                    </div>
                                    <button onClick={() => handleRemoveCartItem(cart.id, item.id || item.product_id)} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600/30 hover:text-red-600 transition-all p-2 opacity-0 group-hover/item:opacity-100"><Trash2 size={14} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-black/5 pt-8 lg:pt-0 lg:pl-10">
                            <div className="space-y-6">
                              <div className="flex justify-between lg:block"><p className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-2 font-bold">Status</p><span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-black text-[9px] uppercase tracking-widest font-bold"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>Active Vault</span></div>
                              <div className="flex justify-between lg:block"><p className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-2 font-bold">Last Synchronized</p><p className="text-[11px] text-black/60 tracking-wider">{new Date(cart.last_sync).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
                            </div>
                            <div className="mt-10 md:mt-12 space-y-8 md:space-y-10"><div><p className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-2 font-bold">Total Valuation</p><p className="text-2xl md:text-3xl font-serif text-black leading-none">{formatCurrency(cart.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0, activeCurrency, rates, symbols)}</p></div>
                              <button onClick={() => handleRemoveCart(cart.id)} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2.5 text-[8px] uppercase tracking-widest hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-600/10 mt-2"><LogOut size={12} />Clear Vault</button>
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
        <AnimatePresence>
          {isAddingShowcase && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 md:p-12">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingShowcase(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">
                <div className="p-5 md:p-10 border-b border-black/5 flex justify-between items-center bg-neutral-50"><div><h3 className="text-xl md:text-2xl font-serif tracking-widest uppercase ">{editingId ? 'Modify' : 'Manifest'} Showcase</h3><p className="text-[10px] tracking-[0.3em] text-black/40 uppercase mt-1 font-black">Cinematic Product Presentation</p></div><button onClick={() => setIsAddingShowcase(false)} className="hover:rotate-90 transition-transform duration-500"><X size={20} className="md:w-[24px] md:h-[24px]" /></button></div>
                <form onSubmit={handleSaveShowcase} className="flex-grow overflow-y-auto p-5 md:p-10 space-y-6 md:space-y-8 scrollbar-hide text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-6 text-left"><div><label className={labelClasses}>Product Identity (Name)</label><input className={inputClasses} value={showcaseFormData.name} onChange={e => setShowcaseFormData({ ...showcaseFormData, name: e.target.value })} placeholder="e.g. ELITE" required /></div><div><label className={labelClasses}>Registry Link (URL)</label><input className={inputClasses} value={showcaseFormData.product_link} onChange={e => setShowcaseFormData({ ...showcaseFormData, product_link: e.target.value })} placeholder="/collection/arambh/elite" required /><p className="text-[8px] tracking-widest text-black/30 uppercase mt-2 leading-relaxed font-black">Points to the product detail page. If the product isn't added yet, use <span className="text-black font-bold">/collection/arambh</span> and update later.</p></div><div><label className={labelClasses}>Display Priority (Order)</label><input type="number" className={inputClasses} value={showcaseFormData.display_order} onChange={e => setShowcaseFormData({ ...showcaseFormData, display_order: parseInt(e.target.value) || 0 })} /></div></div>
                    <div className="space-y-6 text-left"><label className={labelClasses}>Cinematic Visual</label><div onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.onchange = (e) => handleImageUpload(e, 'showcase'); input.click(); }} className="aspect-[3/4] border border-dashed border-black/10 bg-neutral-50 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden">{showcaseFormData.image_url ? (<><img src={getFullImageUrl(showcaseFormData.image_url)} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-1000" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-[9px] text-white uppercase tracking-[0.3em] border border-white/20 px-6 py-3 backdrop-blur-sm font-black">Replace Visual</span></div></>) : (<div className="text-center p-6"><Upload className="mx-auto mb-4 text-black/20 group-hover:text-black transition-colors" size={32} /><p className="text-[9px] uppercase tracking-[0.3em] text-black/40 group-hover:text-black transition-colors font-black">Upload Portrait Visual</p></div>)}{uploading && (<div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-black" size={24} /></div>)}</div></div></div>
                  <div className="text-left"><label className={labelClasses}>Cinematic Narrative (Description)</label><textarea className={`${inputClasses} h-32 md:h-40 leading-relaxed`} value={showcaseFormData.description} onChange={e => setShowcaseFormData({ ...showcaseFormData, description: e.target.value })} placeholder="Describe the essence of this luxury creation..." required /></div>
                  <button type="submit" disabled={isProcessing} className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 font-black">{isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}{editingId ? 'Modify Registry' : 'Confirm Manifestation'}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default Admin;
