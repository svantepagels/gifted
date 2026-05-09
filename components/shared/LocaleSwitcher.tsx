'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Globe } from 'lucide-react'
import {
  locales,
  localeMeta,
  isLocale,
  defaultLocale,
  type Locale,
} from '@/lib/i18n/config'

function extractLocale(pathname: string): Locale | null {
  const seg = pathname.split('/')[1] ?? ''
  return isLocale(seg) ? seg : null
}

/**
 * Replace (or prepend) the locale segment in `pathname` with `newLocale`.
 * Preserves any sub-path. Used by the dropdown to push a same-page URL
 * with the new locale.
 */
function swapLocaleInPath(pathname: string, newLocale: Locale): string {
  const segments = pathname.split('/')
  // pathname always starts with '/', so segments[0] === ''
  if (segments.length >= 2 && isLocale(segments[1])) {
    segments[1] = newLocale
    return segments.join('/') || '/'
  }
  // No locale in path — prepend
  return `/${newLocale}${pathname === '/' ? '' : pathname}`
}

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  const current: Locale = extractLocale(pathname) ?? defaultLocale
  const currentMeta = localeMeta[current]

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleSelect = (next: Locale) => {
    setIsOpen(false)
    if (next === current) return
    const target = swapLocaleInPath(pathname, next)
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
        aria-label={`Language: ${currentMeta.displayName}`}
      >
        <Globe className="h-4 w-4 text-surface-on-surface-variant" />
        <span className="text-label-md text-surface-on-surface hidden sm:inline">
          {current}
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
            className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-60 bg-surface-container-lowest rounded-lg shadow-ambient-lg z-50 overflow-hidden"
          >
            <div className="py-2 max-h-96 overflow-y-auto">
              {locales.map((loc) => {
                const meta = localeMeta[loc]
                const active = loc === current
                return (
                  <li key={loc}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={isPending}
                      onClick={() => handleSelect(loc)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-surface-container-low transition-colors duration-150 ${
                        active ? 'bg-surface-container-low' : ''
                      } ${isPending ? 'opacity-60' : ''}`}
                    >
                      <span className="text-label-md text-surface-on-surface-variant w-12">
                        {loc}
                      </span>
                      <span
                        className="text-body-md text-surface-on-surface flex-1"
                        dir={meta.direction}
                      >
                        {meta.displayName}
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
