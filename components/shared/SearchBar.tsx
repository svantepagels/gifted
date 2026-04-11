'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set('q', value);
    } else {
      params.delete('q');
    }

    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-[540px] mx-auto px-4">
      <motion.div
        initial={false}
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused
            ? '0 0 0 4px rgba(0, 81, 213, 0.12), 0 4px 12px rgba(15, 23, 42, 0.08)'
            : '0 1px 2px rgba(15, 23, 42, 0.05)',
        }}
        transition={{ duration: 0.2 }}
        className={`relative flex items-center bg-white border rounded-full h-[52px] pr-1 transition-colors duration-200 ${
          isFocused ? 'border-secondary' : 'border-outline-variant'
        }`}
      >
        {/* Search Icon */}
        <motion.div
          initial={false}
          animate={{
            scale: isFocused ? 1.1 : 1,
            color: isFocused ? '#0051D5' : '#9CA3AF',
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-5"
        >
          <Search className="h-5 w-5 pointer-events-none" />
        </motion.div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search brands..."
          className="flex-1 pl-12 pr-2 bg-transparent text-[15px] text-surface-on-surface placeholder:text-[#9CA3AF] focus:outline-none"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              className="mr-2 p-1.5 rounded-full hover:bg-surface-container-low transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-surface-on-surface-variant" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => query && handleSearch(query)}
          className="px-6 h-[44px] bg-secondary text-white rounded-full text-[13px] font-medium uppercase tracking-[0.5px] hover:bg-secondary-hover transition-colors duration-200 shadow-sm"
        >
          SEARCH
        </motion.button>
      </motion.div>
    </div>
  );
}
