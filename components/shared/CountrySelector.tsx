'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages, t } from '@/lib/i18n/useMessages'
import { localizedCountryName } from '@/lib/i18n/country-name'

export function CountrySelector() {
  const { countries, selectedCountry, setSelectedCountry } = useApp()
  const locale = useLocale()
  const m = getMessages(locale)
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

  // Sort by *localized* display name so the visible UI is alphabetical in
  // the active locale (the underlying `countries` list is sorted by the
  // English catalog name, which doesn't match what we render once
  // Intl.DisplayNames is involved — e.g. "Democratic Republic of the
  // Congo" → "Congo - Kinshasa").
  const sortedCountries = useMemo(() => {
    const collator = new Intl.Collator(locale)
    return [...countries].sort((a, b) => {
      const an = localizedCountryName(locale, a.code) || a.name
      const bn = localizedCountryName(locale, b.code) || b.name
      return collator.compare(an, bn)
    })
  }, [countries, locale])

  // Match against the English catalog name AND the localized name so users
  // can type either "Germany" or "Saksa" / "Niemcy" / "Γερμανία" / etc.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedCountries
    return sortedCountries.filter((c) => {
      const localized = localizedCountryName(locale, c.code).toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        localized.includes(q)
      )
    })
  }, [sortedCountries, query, locale])

  const showSearch = countries.length > 10

  const selectedLocalizedName = localizedCountryName(locale, selectedCountry.code) || selectedCountry.name

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="country-selector-trigger"
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-low hover:bg-surface-container transition-colors duration-200"
      >
        <span className="text-2xl">{selectedCountry.flag}</span>
        <span className="text-label-lg text-surface-on-surface hidden sm:inline">
          {selectedLocalizedName}
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
                    placeholder={m['countrySelector.searchPlaceholder']}
                    aria-label={m['countrySelector.searchAriaLabel']}
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
              {filtered.map((country) => {
                const localizedName = localizedCountryName(locale, country.code) || country.name
                return (
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
                        {localizedName}
                      </div>
                      <div className="text-label-md text-surface-on-surface-variant">
                        {country.currency}
                      </div>
                    </div>
                    {selectedCountry.code === country.code && (
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    )}
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-body-md text-surface-on-surface-variant">
                  {t(m, 'countrySelector.noMatch', { query })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
