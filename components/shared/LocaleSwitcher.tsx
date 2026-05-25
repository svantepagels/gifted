'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Globe } from 'lucide-react'
import {
  languages,
  localeMeta,
  isLocale,
  defaultLocale,
  localeForLanguageChange,
  type Locale,
  type LanguageCode,
} from '@/lib/i18n/config'

function extractLocale(pathname: string): Locale | null {
  const seg = pathname.split('/')[1] ?? ''
  return isLocale(seg) ? seg : null
}

/**
 * Replace (or prepend) the locale segment in `pathname` with `newLocale`.
 * Preserves any sub-path.
 */
function swapLocaleInPath(pathname: string, newLocale: Locale): string {
  const segments = pathname.split('/')
  if (segments.length >= 2 && isLocale(segments[1])) {
    segments[1] = newLocale
    return segments.join('/') || '/'
  }
  return `/${newLocale}${pathname === '/' ? '' : pathname}`
}

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  const current: Locale = extractLocale(pathname) ?? defaultLocale
  const currentLanguage = localeMeta[current].language as LanguageCode
  const currentLanguageDisplayName =
    languages.find((l) => l.code === currentLanguage)?.displayName ??
    currentLanguage

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleSelect = (nextLang: LanguageCode) => {
    setIsOpen(false)
    if (nextLang === currentLanguage) return
    const nextLocale = localeForLanguageChange(current, nextLang)
    const target = swapLocaleInPath(pathname, nextLocale)
    startTransition(() => router.push(target))
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-container-low hover:bg-surface-container transition-colors duration-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Language: ${currentLanguageDisplayName}`}
      >
        <Globe className="h-4 w-4 text-surface-on-surface-variant" />
        <span className="text-label-md text-surface-on-surface hidden sm:inline uppercase">
          {currentLanguage}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-surface-on-surface-variant transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-ambient-lg z-50 overflow-hidden"
          >
            <div className="py-2 max-h-96 overflow-y-auto">
              {languages.map((lang) => {
                const active = lang.code === currentLanguage
                const isArabic = lang.code === 'ar'
                return (
                  <li key={lang.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={isPending}
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-surface-container-low transition-colors duration-150 ${
                        active ? 'bg-surface-container-low' : ''
                      } ${isPending ? 'opacity-60' : ''}`}
                    >
                      <span className="text-label-md text-surface-on-surface-variant w-10 uppercase">
                        {lang.code}
                      </span>
                      <span
                        className="text-body-md text-surface-on-surface flex-1"
                        dir={isArabic ? 'rtl' : 'ltr'}
                      >
                        {lang.displayName}
                      </span>
                      {active && (
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                      )}
                    </button>
                  </li>
                )
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
