'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { COUNTRIES } from '@/lib/countries/data'
import { useApp } from '@/contexts/AppContext'

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-low hover:bg-surface-container transition-colors duration-200"
      >
        <span className="text-2xl">{selectedCountry.flag}</span>
        <span className="text-label-lg text-surface-on-surface hidden sm:inline">
          {selectedCountry.name}
        </span>
        <span className="text-label-lg text-surface-on-surface-variant">
          {selectedCountry.currencySymbol}
        </span>
        <ChevronDown className={`h-4 w-4 text-surface-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-ambient-lg z-50 overflow-hidden"
          >
            <div className="py-2 max-h-96 overflow-y-auto">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-surface-container-low transition-colors duration-150
                    ${selectedCountry.code === country.code ? 'bg-surface-container-low' : ''}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
