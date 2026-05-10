'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

export function CountrySelector() {
  const { countries, selectedCountry, setSelectedCountry } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    )
  }, [countries, query])

  const showSearch = countries.length > 10

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="country-selector-trigger"
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-low hover:bg-surface-container transition-colors duration-200"
      >
        <span className="text-2xl">{selectedCountry.flag}</span>
        <span className="text-label-lg text-surface-on-surface hidden sm:inline">
          {selectedCountry.name}
        </span>
        <span className="text-label-lg text-surface-on-surface-variant">
          {selectedCountry.currencySymbol}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-surface-on-surface-variant transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-72 bg-surface-container-lowest rounded-lg shadow-ambient-lg z-50 overflow-hidden"
            data-testid="country-selector-dropdown"
          >
            {showSearch && (
              <div className="p-2 border-b border-surface-container">
                <div className="flex items-center gap-2 px-2 py-1 bg-surface-container-low rounded">
                  <Search className="h-4 w-4 text-surface-on-surface-variant" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search countries..."
                    aria-label="Search countries"
                    className="flex-1 bg-transparent outline-none text-body-md text-surface-on-surface placeholder:text-surface-on-surface-variant"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div
              className="py-2 max-h-96 overflow-y-auto"
              data-testid="country-list"
            >
              {filtered.map((country) => (
                <button
                  key={country.code}
                  data-country-code={country.code}
                  onClick={() => {
                    setSelectedCountry(country)
                    setIsOpen(false)
                    setQuery('')
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-surface-container-low transition-colors duration-150
                    ${
                      selectedCountry.code === country.code
                        ? 'bg-surface-container-low'
                        : ''
                    }
                  `}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="text-body-md text-surface-on-surface">
                      {country.name}
                    </div>
                    <div className="text-label-md text-surface-on-surface-variant">
                      {country.currency}
                    </div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-body-md text-surface-on-surface-variant">
                  No countries match &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
