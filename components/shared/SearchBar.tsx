'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n/useLocale';
import { getMessages } from '@/lib/i18n/useMessages';

interface SearchBarProps {
  /** When true, drops the centered max-width wrapper and shrinks height — for embedding in a control bar. */
  compact?: boolean;
}

export function SearchBar({ compact = false }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const m = getMessages(locale);
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

    router.push(`/${locale}/?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/${locale}/?${params.toString()}`);
  };

  const wrapperClass = compact
    ? 'w-full max-w-[480px]'
    : 'w-full max-w-[540px] mx-auto px-4';
  const fieldHeight = compact ? 'h-11' : 'h-[52px]';
  const buttonHeight = compact ? 'h-9' : 'h-[44px]';
  const buttonPadding = compact ? 'px-5' : 'px-6';

  // All visual feedback below is CSS-only — framer-motion was removed to
  // shrink the homepage critical-path JS chunk.
  return (
    <div className={wrapperClass}>
      <div
        className={`relative flex items-center bg-white border rounded-full ${fieldHeight} pr-1 transition-all duration-200 ${
          isFocused
            ? 'border-secondary scale-[1.02] shadow-[0_0_0_4px_rgba(0,81,213,0.12),0_4px_12px_rgba(15,23,42,0.08)]'
            : 'border-outline-variant shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
        }`}
      >
        <div
          className={`absolute left-5 rtl:left-auto rtl:right-5 transition-all duration-200 ${
            isFocused ? 'scale-110 text-secondary' : 'scale-100 text-[#9CA3AF]'
          }`}
        >
          <Search className="h-5 w-5 pointer-events-none" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={m['search.placeholder']}
          className="flex-1 pl-12 pr-2 rtl:pl-2 rtl:pr-12 bg-transparent text-[15px] text-surface-on-surface placeholder:text-[#9CA3AF] focus:outline-none"
        />

        {query && (
          <button
            onClick={handleClear}
            className="mr-2 p-1.5 rounded-full hover:bg-surface-container-low transition-colors animate-fade-in-up"
            aria-label={m['search.clearAriaLabel']}
          >
            <X className="h-4 w-4 text-surface-on-surface-variant" />
          </button>
        )}

        <button
          onClick={() => query && handleSearch(query)}
          className={`${buttonPadding} ${buttonHeight} bg-secondary text-white rounded-full text-[13px] font-medium uppercase tracking-[0.5px] hover:bg-secondary-hover active:scale-[0.98] hover:scale-[1.02] transition-all duration-200 shadow-sm`}
        >
          {m['search.submit']}
        </button>
      </div>
    </div>
  );
}
