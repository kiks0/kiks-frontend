import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const AnimatedDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select', 
  hasError = false, 
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Find the label for the current value, or fallback to placeholder
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-transparent border-b flex items-center justify-between py-3 md:py-4 text-[13px] md:text-[14px] transition-all font-light tracking-[0.15em] appearance-none text-left
          ${hasError ? 'border-red-500 text-black' : 'border-black/10 text-black hover:border-black/30'}
          ${!selectedOption && !hasError ? 'text-black/50' : ''}
        `}
      >
        <span className="truncate">{displayLabel}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown size={14} className="text-black/40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1 bg-white border border-black/5 shadow-2xl z-50 max-h-60 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#e5e5e5 transparent'
            }}
            data-lenis-prevent="true"
          >
            <ul className="py-2">
              {/* Optional Placeholder item to clear selection if needed, or just list options */}
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-4 py-3 text-[13px] tracking-widest transition-colors hover:bg-black/5
                      ${value === opt.value ? 'font-medium bg-black/5' : 'font-light'}
                    `}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedDropdown;
