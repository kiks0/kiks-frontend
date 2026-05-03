import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [dbResults, setDbResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchCache = useRef({});

  // Core Site Pages
  // Core Site Pages with Keywords for better searchability
  const sitePages = [
    { id: 'p1', title: 'Home', type: 'Experience', link: '/', category: 'PAGE', keywords: ['main', 'landing', 'start'] },
    { id: 'p2', title: 'The Journal', type: 'Stories', link: '/blog', category: 'PAGE', keywords: ['blog', 'news', 'articles', 'updates'] },
    { id: 'p3', title: 'Concierge', type: 'Support', link: '/contact', category: 'PAGE', keywords: ['contact', 'help', 'email', 'support', 'reach out'] },
    { id: 'p4', title: 'Personal Details', type: 'Account', link: '/account/personal-details', category: 'ACCOUNT', keywords: ['profile', 'settings', 'user', 'info', 'me'] },
    { id: 'p5', title: 'My Orders', type: 'History', link: '/orders', category: 'ACCOUNT', keywords: ['purchases', 'tracking', 'list', 'bought'] },
    { id: 'p6', title: 'The House of KIKS', type: 'About', link: '/essence', category: 'PAGE', keywords: ['story', 'brand', 'history', 'mission', 'about'] },
    { id: 'p7', title: 'Login', type: 'Private Entrance', link: '/login', category: 'AUTH', keywords: ['signin', 'login', 'access', 'enter', 'profile'] },
    { id: 'p8', title: 'Register', type: 'Join the Club', link: '/register', category: 'AUTH', keywords: ['signup', 'register', 'join', 'create account'] },
    { id: 'p9', title: 'Privacy Policy', type: 'Legal', link: '/privacy-policy', category: 'POLICY', keywords: ['data', 'security', 'gdpr', 'privacy'] },
    { id: 'p10', title: 'Terms & Conditions', type: 'Legal', link: '/terms-conditions', category: 'POLICY', keywords: ['agreement', 'rules', 'tos', 'conditions'] },
    { id: 'p11', title: 'Refund Policy', type: 'Service', link: '/refund-policy', category: 'POLICY', keywords: ['money back', 'refund', 'cancellation'] },
    { id: 'p12', title: 'Return Policy', type: 'Service', link: '/return-policy', category: 'POLICY', keywords: ['returns', 'shipping', 'delivery', 'exchange'] },
    { id: 'p13', title: 'Disclaimer', type: 'Legal', link: '/disclaimer', category: 'POLICY', keywords: ['legal', 'notice', 'warning'] },
    { id: 'p14', title: 'About Us', type: 'Story', link: '/about', category: 'PAGE', keywords: ['brand', 'who we are', 'team', 'company'] }
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDbResults([]);
      setTimeout(() => inputRef.current?.focus(), 400);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      const trimmedQuery = query.trim().toLowerCase();
      if (trimmedQuery.length < 2) {
        setDbResults([]);
        return;
      }

      // Check Cache
      if (searchCache.current[trimmedQuery]) {
        setDbResults(searchCache.current[trimmedQuery]);
        return;
      }

      // 1. Local Search (Pages) - Instant & Reliable
      const filteredPages = sitePages.filter(p => 
        p.title.toLowerCase().includes(trimmedQuery) ||
        p.type.toLowerCase().includes(trimmedQuery) ||
        p.keywords.some(k => k.toLowerCase().includes(trimmedQuery)) ||
        (trimmedQuery.startsWith('₹') || !isNaN(trimmedQuery)) // Price hint
      );

      setLoading(true);
      try {
        const [prodRes, colRes] = await Promise.all([
          fetch(`${API_URL}/api/products?search=${encodeURIComponent(query)}`),
          fetch(`${API_URL}/api/collections`)
        ]);

        let products = [];
        if (prodRes.ok) products = await prodRes.json();

        let collections = [];
        if (colRes.ok) collections = await colRes.json();

        const formattedProducts = products.map(p => ({
          id: p.id,
          title: p.name,
          type: p.product_type || 'Extrait de Parfum',
          link: `/product/${p.slug}`,
          category: 'PRODUCT',
          price: p.price
        }));

        const formattedCollections = collections
          .filter(c => c.name.toLowerCase().includes(trimmedQuery))
          .map(c => ({
            id: `c-${c.id}`,
            title: c.name,
            type: 'Curation',
            link: `/collection/${c.slug}`,
            category: 'COLLECTION'
          }));

        // 2. Price Filtering (Client-side refinement)
        const priceMatches = !isNaN(trimmedQuery) ? formattedProducts.filter(p => 
          Math.abs(parseFloat(p.price) - parseFloat(trimmedQuery)) < 500
        ) : [];

        // 3. Combine & Prioritize
        const allResults = [...filteredPages, ...formattedCollections, ...formattedProducts, ...priceMatches];
        
        // Remove duplicates by ID
        const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values())
          .sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            const aStarts = aTitle.startsWith(trimmedQuery);
            const bStarts = bTitle.startsWith(trimmedQuery);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return 0;
          });

        searchCache.current[trimmedQuery] = uniqueResults;
        setDbResults(uniqueResults);
      } catch (err) {
        console.error("Search error:", err);
        // Fallback to local results only if network fails
        setDbResults(filteredPages);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 200); // Faster debounce
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && dbResults.length > 0) {
      handleLinkClick(dbResults[0].link);
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleLinkClick = (link) => {
    onClose();
    navigate(link);
  };

  // Variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.05 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.4, ease: "easeInOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-3xl overflow-hidden font-sans"
        >
          {/* Subtle Background Mark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
             <h1 className="text-[40vw] font-serif select-none">KIKS</h1>
          </div>

          <div className="h-full w-full flex flex-col items-center justify-center p-8 md:p-14 lg:p-20 relative">
            {/* Background Mark is already there */}
               
                {/* Close Header */}
               <div className="flex justify-between items-center mb-10 md:mb-16 w-full max-w-4xl">
                  <div />
                  <button onClick={onClose} className="group flex items-center space-x-4 text-white/40 hover:text-white transition-all duration-500">
                    <span className="text-[9px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-all">Close</span>
                    <X size={24} strokeWidth={1} />
                  </button>
               </div>

               {/* Search Input Box */}
               <motion.div variants={itemVariants} className="w-full max-w-4xl">
                  <div className="relative group">
                     <input
                      ref={inputRef}
                      type="text"
                      className="w-full bg-transparent border-b border-white/10 py-5 md:py-8 text-2xl md:text-3xl lg:text-4xl font-serif text-white placeholder:text-white/10 focus:outline-none focus:border-gold-500 transition-all duration-700 font-light"
                      placeholder="FIND YOUR ESSENCE..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div 
                      className="absolute right-0 bottom-5 md:bottom-8 opacity-20 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => dbResults.length > 0 && handleLinkClick(dbResults[0].link)}
                    >
                       <SearchIcon size={24} strokeWidth={1} />
                    </div>
                  </div>
               </motion.div>

               {/* Results Container */}
               <div className="mt-12 flex-grow overflow-y-auto pr-4 custom-scrollbar w-full max-w-4xl">
                  {loading && (
                    <div className="py-10 text-center">
                       <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase animate-pulse">Searching the vault...</p>
                    </div>
                  )}

                  {!loading && dbResults.length > 0 ? (
                    <div className="space-y-0">
                      {dbResults.map((item, idx) => (
                        <motion.div
                          key={item.id}
                           initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 + 0.2 }}
                          className="group py-6 md:py-8 border-b border-white/5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all duration-500"
                          onClick={() => handleLinkClick(item.link)}
                        >
                          <div className="flex flex-col">
                             <div className="flex items-center mb-2">
                                <span className="text-gold-500 text-[8px] md:text-[9px] tracking-[0.4em] font-black uppercase bg-gold-500/10 px-2 py-0.5 rounded-sm line-clamp-1">{item.category}</span>
                                 <span className="text-white/20 text-[9px] tracking-[0.2em] uppercase ml-4">{item.type}</span>
                             </div>
                             <h3 className="text-lg md:text-2xl text-white/80 group-hover:text-white font-light tracking-[0.1em] transition-all duration-500 group-hover:pl-4 uppercase">{item.title}</h3>
                          </div>
                          <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden">
                             <ArrowRight className="text-white/20 transform -translate-x-full group-hover:translate-x-0 transition-all duration-500" size={24} strokeWidth={1} />
                             <ArrowRight className="text-white/20 absolute transform translate-x-0 group-hover:translate-x-full transition-all duration-500 opacity-20" size={24} strokeWidth={1} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : query.length > 1 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center md:text-left">
                       <p className="text-white/20 text-sm tracking-[0.3em] font-light uppercase">No essence matches your search</p>
                    </motion.div>
                  ) : (
                    <div className="py-20 flex flex-col items-center md:items-start opacity-20">
                    </div>
                  )}
               </div>

            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
