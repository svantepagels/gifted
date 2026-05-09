/**
 * Unit tests for the i18n config + helpers.
 */

import { describe, test, expect } from '@jest/globals'
import {
  defaultLocale,
  isLocale,
  locales,
  localeMeta,
  messagesFileForLocale,
} from '../i18n/config'
import { localeHref } from '../i18n/href'
import { getMessages, t } from '../i18n/useMessages'

describe('locale config', () => {
  test('defaultLocale is en-IE', () => {
    expect(defaultLocale).toBe('en-IE')
  })

  test('every locale has full metadata', () => {
    for (const loc of locales) {
      const meta = localeMeta[loc]
      expect(meta).toBeDefined()
      expect(meta.language).toMatch(/^[a-z]{2}$/)
      expect(meta.country).toMatch(/^[A-Z]{2}$/)
      expect(meta.currency).toMatch(/^[A-Z]{3}$/)
      expect(['ltr', 'rtl']).toContain(meta.direction)
      expect(meta.displayName.length).toBeGreaterThan(0)
      expect(meta.hreflang).toBe(loc)
    }
  })

  test('Arabic locales are RTL', () => {
    expect(localeMeta['ar-AE'].direction).toBe('rtl')
    expect(localeMeta['ar-SA'].direction).toBe('rtl')
  })

  test('all non-Arabic locales are LTR', () => {
    for (const loc of locales) {
      if (loc.startsWith('ar-')) continue
      expect(localeMeta[loc].direction).toBe('ltr')
    }
  })

  test('isLocale narrows correctly', () => {
    expect(isLocale('fi-FI')).toBe(true)
    expect(isLocale('en-IE')).toBe(true)
    expect(isLocale('zz-ZZ')).toBe(false)
    expect(isLocale('en')).toBe(false)
    expect(isLocale('')).toBe(false)
  })

  test('messagesFileForLocale collapses en-* to en', () => {
    expect(messagesFileForLocale('en-IE')).toBe('en')
    expect(messagesFileForLocale('en-AU')).toBe('en')
    expect(messagesFileForLocale('en-MT')).toBe('en')
    expect(messagesFileForLocale('en-NZ')).toBe('en')
  })

  test('messagesFileForLocale leaves non-en locales alone', () => {
    expect(messagesFileForLocale('fi-FI')).toBe('fi-FI')
    expect(messagesFileForLocale('ar-AE')).toBe('ar-AE')
    expect(messagesFileForLocale('ar-SA')).toBe('ar-SA')
    expect(messagesFileForLocale('pl-PL')).toBe('pl-PL')
    expect(messagesFileForLocale('el-GR')).toBe('el-GR')
  })
})

describe('localeHref', () => {
  test('prefixes absolute paths with locale', () => {
    expect(localeHref('fi-FI', '/gift-card/foo')).toBe('/fi-FI/gift-card/foo')
    expect(localeHref('en-IE', '/checkout')).toBe('/en-IE/checkout')
  })

  test('rewrites root to /<locale>', () => {
    expect(localeHref('fi-FI', '/')).toBe('/fi-FI')
    expect(localeHref('en-IE', '/')).toBe('/en-IE')
  })

  test('handles paths starting with /?', () => {
    expect(localeHref('fi-FI', '/?category=Shopping')).toBe(
      '/fi-FI/?category=Shopping'
    )
  })

  test('returns query/hash fragments unchanged', () => {
    expect(localeHref('fi-FI', '?q=x')).toBe('?q=x')
    expect(localeHref('fi-FI', '#section')).toBe('#section')
  })

  test('leaves external URLs untouched', () => {
    expect(localeHref('fi-FI', 'https://example.com')).toBe('https://example.com')
    expect(localeHref('fi-FI', 'http://example.com')).toBe('http://example.com')
    expect(localeHref('fi-FI', 'mailto:a@b.com')).toBe('mailto:a@b.com')
    expect(localeHref('fi-FI', 'tel:+12345')).toBe('tel:+12345')
  })

  test('falls back to defaultLocale when locale is undefined', () => {
    expect(localeHref(undefined, '/foo')).toBe(`/${defaultLocale}/foo`)
  })

  test('handles empty path', () => {
    expect(localeHref('fi-FI', '')).toBe('/fi-FI')
  })
})

describe('getMessages', () => {
  test('en-IE returns the canonical English strings', () => {
    const m = getMessages('en-IE')
    expect(m['hero.badge']).toBe('Instant Digital Delivery')
    expect(m['hero.title.line1']).toBe('Buy Digital')
    expect(m['hero.title.line2']).toBe('Gift Cards')
    expect(m['search.placeholder']).toBe('Search brands...')
  })

  test('all en-* locales share the English file', () => {
    for (const loc of ['en-AU', 'en-MT', 'en-NZ'] as const) {
      const m = getMessages(loc)
      expect(m['hero.badge']).toBe('Instant Digital Delivery')
    }
  })

  test('fi-FI returns hand-translated Finnish copy', () => {
    const m = getMessages('fi-FI')
    expect(m['hero.badge']).toBe('Välitön digitaalinen toimitus')
    expect(m['hero.title.line2']).toBe('Lahjakortteja')
    expect(m['search.placeholder']).toBe('Hae brändejä...')
    expect(m['categories.all']).toBe('Kaikki')
  })

  test('ar-AE returns TODO-prefixed placeholder strings', () => {
    const m = getMessages('ar-AE')
    expect(m['hero.badge']).toBe('[TODO ar-AE] Instant Digital Delivery')
    expect(m['notFound.title']).toBe('[TODO ar-AE] Product Not Found')
  })

  test('ar-SA, pl-PL, el-GR also return TODO placeholders', () => {
    expect(getMessages('ar-SA')['hero.badge']).toBe(
      '[TODO ar-SA] Instant Digital Delivery'
    )
    expect(getMessages('pl-PL')['hero.badge']).toBe(
      '[TODO pl-PL] Instant Digital Delivery'
    )
    expect(getMessages('el-GR')['hero.badge']).toBe(
      '[TODO el-GR] Instant Digital Delivery'
    )
  })

  test('every locale has a non-empty value for every key', () => {
    const enKeys = Object.keys(getMessages('en-IE'))
    for (const loc of locales) {
      const m = getMessages(loc) as Record<string, string>
      for (const key of enKeys) {
        expect(typeof m[key]).toBe('string')
        expect((m[key] as string).length).toBeGreaterThan(0)
      }
    }
  })
})

describe('t() — placeholder substitution', () => {
  test('returns the string unchanged when there are no vars', () => {
    const m = getMessages('en-IE')
    expect(t(m, 'hero.badge')).toBe('Instant Digital Delivery')
  })

  test('substitutes {min} and {max} in product.range', () => {
    const m = getMessages('en-IE')
    expect(t(m, 'product.range', { min: '€10', max: '€100' })).toBe(
      '€10 - €100'
    )
  })

  test('substitution works in non-English locales', () => {
    const m = getMessages('fi-FI')
    expect(t(m, 'product.range', { min: '€10', max: '€100' })).toBe(
      '€10 - €100'
    )
  })
})
