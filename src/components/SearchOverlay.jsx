import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Mock Searchable Data
  const searchItems = [
    { id: 1, title: 'Home', type: 'Perspective', link: '/', category: 'NAV' },
    { id: 2, title: 'Collection', type: 'Curation', link: '/collection', category: 'NAV' },
    { id: 3, title: 'Arambh Collection', type: 'Legacy', link: '/collection?category=arambh', category: 'COLLECTION' },
    { id: 4, title: 'Blog', type: 'Editorial', link: '/blog', category: 'NAV' },
    { id: 5, title: 'Contact Us', type: 'Concierge', link: '/contact', category: 'SUPPORT' },
    { id: 6, title: 'Elite', type: 'Extrait', link: '/collection', category: 'SCENT' },
    { id: 7, title: 'La Reina', type: 'Extrait', link: '/collection', category: 'SCENT' },
    { id: 8, title: 'El Rey', type: 'Extrait', link: '/collection', category: 'SCENT' },
    { id: 9, title: 'Amber', type: 'Rare Note', link: '/collection', category: 'NOTE' },
    { id: 10, title: 'Oudh', type: 'Rare Note', link: '/collection', category: 'NOTE' },
    { id: 11, title: 'Sandalwood', type: 'Rare Note', link: '/collection', category: 'NOTE' },
    { id: 12, title: 'Musk', type: 'Rare Note', link: '/collection', category: 'NOTE' },
    { id: 13, title: 'Jasmine', type: 'Rare Note', link: '/collection', category: 'NOTE' }
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 400);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = searchItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleLinkClick(results[0].link);
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
          className="fixed inset-0 z-[100] bg-dark-900/98 backdrop-blur-3xl overflow-hidden font-sans"
        >
          {/* Subtle Background Mark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
             <h1 className="text-[40vw] font-serif select-none">KIKS</h1>
          </div>

          <div className="h-full w-full flex flex-col md:flex-row">
            
            {/* Left Column: Discover / Suggested (Static but elegant) */}
            <div className="hidden md:flex md:w-[35%] h-full bg-white/[0.02] border-r border-white/5 p-10 lg:p-16 flex-col justify-between">
               <motion.div variants={itemVariants}>
                 <p className="text-gold-500 text-[10px] tracking-[0.5em] font-bold uppercase mb-8">Search curated for you</p>
                 <div className="space-y-8">
                    <div>
                       <h4 className="text-white/40 text-[9px] tracking-[0.3em] uppercase mb-3 font-black">Trending Now</h4>
                       <ul className="space-y-3">
                          {['Arambh Extrait', 'Rare Oudh', 'Summer 2026 Collection'].map(t => (
                            <li key={t} className="flex items-center text-white/70 hover:text-white transition-colors cursor-pointer group">
                               <TrendingUp size={12} className="mr-3 opacity-30" />
                               <span onClick={() => setQuery(t)} className="text-sm font-light tracking-widest">{t}</span>
                            </li>
                          ))}
                        </ul>
                    </div>
                    <div>
                       <h4 className="text-white/40 text-[9px] tracking-[0.3em] uppercase mb-3 font-black">Explore Fragrances</h4>
                       <ul className="space-y-3">
                          {['Floral Notes', 'Woody Notes', 'Amber Gold'].map(t => (
                            <li key={t} className="flex items-center text-white/70 hover:text-white transition-colors cursor-pointer group">
                               <Sparkles size={12} className="mr-3 opacity-30" />
                               <span onClick={() => setQuery(t)} className="text-sm font-light tracking-widest">{t}</span>
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="pt-12">
                 <Link to="/contact" onClick={onClose} className="text-[10px] tracking-[0.4em] text-white/30 hover:text-white transition-all uppercase border-b border-transparent hover:border-white/20 pb-1">
                    Request a Private Viewing
                 </Link>
              </motion.div>
            </div>

            {/* Right Column: Search Interface */}
            <div className="flex-grow h-full flex flex-col p-8 md:p-14 lg:p-20 relative">
               
                {/* Close Header */}
               <div className="flex justify-between items-center mb-10 md:mb-16">
                  <span className="text-gold-500/50 text-[10px] tracking-[0.6em] font-bold uppercase animate-pulse">KIKS Digital Boutique</span>
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
                      placeholder="Explore KIKS..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div className="absolute right-0 bottom-5 md:bottom-8 opacity-20 group-hover:opacity-100 transition-opacity">
                       <SearchIcon size={24} strokeWidth={1} />
                    </div>
                  </div>
               </motion.div>

               {/* Results Container */}
               <div className="mt-12 flex-grow overflow-y-auto pr-4 custom-scrollbar">
                  {results.length > 0 ? (
                    <div className="space-y-0">
                      {results.map((item, idx) => (
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
                       <p className="text-gold-500/50 text-[10px] tracking-[0.1em] mt-4 uppercase">Try "Collection" or "Amber"</p>
                    </motion.div>
                  ) : (
                    <div className="py-20 flex flex-col items-center md:items-start opacity-20">
                    </div>
                  )}
               </div>

            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
