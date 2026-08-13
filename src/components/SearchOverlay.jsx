import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector(state => state.auth);
  const [searchData, setSearchData] = useState({ hasResults: false, totalCount: 0, results: {}, emptyState: null });
  const [loading, setLoading] = useState(false);
  const searchCache = useRef({});

  const filteredPages = (searchData.results?.pages || []).filter(item => {
    if (isAuthenticated) {
      return item.id !== 'pg-login' && item.id !== 'pg-register' && item.link !== '/login' && item.link !== '/register';
    } else {
      return item.id !== 'pg-logout' && item.link !== '#logout';
    }
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSearchData({ hasResults: false, totalCount: 0, results: {}, emptyState: null });
      setTimeout(() => inputRef.current?.focus(), 400);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        setSearchData({ hasResults: false, totalCount: 0, results: {}, emptyState: null });
        setLoading(false);
        return;
      }

      const cacheKey = trimmedQuery.toLowerCase();
      // Check Client Memory Cache for instant sub-10ms rendering
      if (searchCache.current[cacheKey]) {
        setSearchData(searchCache.current[cacheKey]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(trimmedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          searchCache.current[cacheKey] = data;
          setSearchData(data);
        }
      } catch (err) {
        console.error("Search API fault:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce requests precisely (275 ms) to avoid spamming backend while keeping UI responsive
    const timer = setTimeout(fetchResults, 275);
    return () => clearTimeout(timer);
  }, [query]);

  // Highlight matched words inside search results without breaking font styling
  const renderHighlightedText = (text, q) => {
    if (!q || !text || typeof text !== 'string') return text;
    const words = q.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return text;
    
    try {
      const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="font-bold underline text-black bg-neutral-200/60 px-0.5 rounded-xs transition-colors">
            {part}
          </span>
        ) : (
          part
        )
      );
    } catch (e) {
      return text;
    }
  };

  const handleLinkClick = async (link) => {
    onClose();
    if (link === '#logout') {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Backend logout failed:", err);
      }
      dispatch(logout());
      navigate('/');
      return;
    }
    navigate(link);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const allItems = [
        ...(searchData.results?.products || []),
        ...(searchData.results?.collections || []),
        ...(searchData.results?.blogs || []),
        ...filteredPages,
        ...(searchData.emptyState?.trendingSearches || []),
        ...(searchData.emptyState?.popularProducts || [])
      ];
      if (allItems.length > 0) {
        handleLinkClick(allItems[0].link);
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Render standardized search result sections with identical luxury UI structure & animations
  const renderSection = (title, items, viewAllLink = null, maxLimit = 12) => {
    if (!items || items.length === 0) return null;
    const displayItems = items.slice(0, maxLimit);

    return (
      <div key={title} className="mb-8">
        <div className="py-2 mb-1 border-b border-black/10 flex items-center justify-between">
          <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-black text-black/70">{title}</span>
          <span className="text-[9px] tracking-[0.2em] uppercase text-black/40">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
        </div>
        <div className="space-y-0">
          {displayItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 + 0.1 }}
              className="group py-6 md:py-8 border-b border-black/5 flex items-center justify-between cursor-pointer hover:border-black/20 transition-all duration-500"
              onClick={() => handleLinkClick(item.link)}
            >
              <div className="flex flex-col">
                 <div className="flex items-center mb-2">
                    <span className="text-black text-[8px] md:text-[9px] tracking-[0.4em] font-black uppercase bg-black/5 px-2 py-0.5 rounded-sm line-clamp-1">
                      {item.category}
                    </span>
                    <span className="text-black/20 text-[9px] tracking-[0.2em] uppercase ml-4">
                      {item.type}
                    </span>
                    {item.price && (
                      <span className="text-black text-[10px] tracking-[0.2em] font-medium ml-4">
                        {item.price}
                      </span>
                    )}
                 </div>
                 <h3 className="text-lg md:text-2xl text-black/80 group-hover:text-black font-light tracking-[0.1em] transition-all duration-500 group-hover:pl-4 uppercase">
                    {renderHighlightedText(item.title, query)}
                 </h3>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden">
                 <ArrowRight className="text-black/20 transform -translate-x-full group-hover:translate-x-0 transition-all duration-500" size={24} strokeWidth={1} />
                 <ArrowRight className="text-black/20 absolute transform translate-x-0 group-hover:translate-x-full transition-all duration-500 opacity-20" size={24} strokeWidth={1} />
              </div>
            </motion.div>
          ))}
        </div>
        {viewAllLink && items.length > 5 && (
          <div className="mt-3 text-right">
            <button
              onClick={() => handleLinkClick(viewAllLink)}
              className="text-[10px] tracking-[0.3em] uppercase font-bold text-black hover:underline transition-all py-2 inline-block"
            >
              View All {title} →
            </button>
          </div>
        )}
      </div>
    );
  };

  // Variants for staggered entrance (Preserved exactly as original)
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
          className="fixed inset-0 z-[200001] bg-white/98 backdrop-blur-3xl overflow-hidden font-sans"
        >
          {/* Subtle Background Mark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
              <h1 className="text-[40vw] font-serif select-none text-black">KIKS</h1>
          </div>

          <div className="h-full w-full flex flex-col items-center justify-center p-8 md:p-14 lg:p-20 relative">
                
                {/* Close Header */}
               <div className="flex justify-between items-center mb-10 md:mb-16 w-full max-w-4xl">
                  <div />
                  <button onClick={onClose} className="group flex items-center space-x-4 text-black/40 hover:text-black transition-all duration-500">
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
                      className="w-full bg-transparent border-b border-black/10 py-5 md:py-8 pr-12 text-2xl md:text-3xl lg:text-4xl font-serif text-black placeholder:text-black/10 focus:outline-none focus:border-black transition-all duration-700 font-light"
                      placeholder="FIND YOUR ESSENCE..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div 
                      className="absolute right-0 bottom-5 md:bottom-8 opacity-20 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => {
                        const allItems = [
                          ...(searchData.results?.products || []),
                          ...(searchData.results?.collections || []),
                          ...(searchData.results?.blogs || []),
                          ...filteredPages
                        ];
                        if (allItems.length > 0) handleLinkClick(allItems[0].link);
                      }}
                    >
                       <SearchIcon className="text-black" size={24} strokeWidth={1} />
                    </div>
                  </div>
               </motion.div>

               {/* Results Container */}
               <div className="mt-12 flex-grow overflow-y-auto pr-4 custom-scrollbar w-full max-w-4xl">
                  {loading && (
                    <div className="py-10 text-center">
                       <p className="text-black text-[10px] tracking-[0.4em] uppercase animate-pulse">Searching...</p>
                    </div>
                  )}

                  {!loading && query.trim().length >= 2 && !searchData.hasResults && (
                    <div className="py-6">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center mb-6 border-b border-black/10">
                         <p className="text-black/70 text-[11px] md:text-[13px] tracking-[0.4em] uppercase font-bold">No results found</p>
                         <p className="text-black/40 text-[9px] tracking-[0.2em] uppercase mt-2">Explore popular products and trending searches below</p>
                      </motion.div>
                      {searchData.emptyState && (
                        <div className="space-y-6">
                           {renderSection('Trending Searches', searchData.emptyState.trendingSearches, null, 5)}
                           {renderSection('Popular Products', searchData.emptyState.popularProducts, '/collection/arambh', 4)}
                           {renderSection('Recommended Blogs', searchData.emptyState.recommendedBlogs, '/blog', 3)}
                        </div>
                      )}
                    </div>
                  )}

                  {!loading && searchData.hasResults && (
                    <div className="space-y-4">
                       {renderSection('Products', searchData.results?.products, '/collection/arambh', 12)}
                       {renderSection('Collections', searchData.results?.collections, '/collection/arambh', 6)}
                       {renderSection('Blogs', searchData.results?.blogs, '/blog', 10)}
                       {renderSection('Pages', filteredPages, '/', 10)}
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
