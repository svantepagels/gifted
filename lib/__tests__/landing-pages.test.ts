/**
 * Unit tests for the landing-page generator's pure helpers.
 *
 * Doesn't touch Reloadly, Next runtime, or filesystem — these tests
 * exercise the matching logic, copy resolver, and slug helpers in
 * isolation so they catch regressions during PR review.
 */

import { describe, it, expect } from '@jest/globals'
import { BRANDS, getBrandBySlug, brandDisplayName } from '../landing-pages/brands'
import {
  normaliseBrandName,
  productMatchesBrand,
  findProductsForBrand,
} from '../landing-pages/slug'
import { resolveCopy, COPY } from '../landing-pages/copy'
import type { GiftCardProduct } from '../giftcards/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProduct(
  partial: Partial<GiftCardProduct> & { brandName: string }
): GiftCardProduct {
  return {
    slug: partial.slug ?? partial.brandName.toLowerCase().replace(/\s+/g, '-'),
    brandName: partial.brandName,
    logoUrl: partial.logoUrl ?? '',
    countryCodes: partial.countryCodes ?? [],
    denominationType: partial.denominationType ?? 'FIXED',
    currency: partial.currency ?? 'EUR',
    fixedDenominations: partial.fixedDenominations,
    denominationRange: partial.denominationRange,
    _meta: partial._meta,
  } as GiftCardProduct
}

// ---------------------------------------------------------------------------
// Brand registry
// ---------------------------------------------------------------------------

describe('BRANDS registry', () => {
  it('has the documented number of brands', () => {
    // 19 after crypto-voucher was removed for compliance
    // (closed-loop gift cards only — see lib/giftcards/compliance.ts)
    expect(BRANDS.length).toBeGreaterThanOrEqual(19)
  })

  it('has unique slugs', () => {
    const slugs = BRANDS.map((b) => b.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it('every brand has at least one alias', () => {
    for (const b of BRANDS) {
      expect(b.reloadlyBrandAliases.length).toBeGreaterThan(0)
    }
  })

  it('every brand has an English display name', () => {
    for (const b of BRANDS) {
      expect(b.displayName.en).toBeTruthy()
    }
  })
})

describe('getBrandBySlug', () => {
  it('finds a known brand', () => {
    expect(getBrandBySlug('netflix')?.slug).toBe('netflix')
  })
  it('returns undefined for an unknown brand', () => {
    expect(getBrandBySlug('not-a-brand')).toBeUndefined()
  })
})

describe('brandDisplayName', () => {
  it('falls back to English for unknown locales', () => {
    const brand = getBrandBySlug('netflix')!
    // @ts-expect-error — intentional bad locale
    expect(brandDisplayName(brand, 'xx-XX')).toBe('Netflix')
  })
  it('uses localised name when present', () => {
    const brand = getBrandBySlug('app-store-itunes')!
    expect(brandDisplayName(brand, 'ar-AE')).toBe('آب ستور وآيتيونز')
  })
  it('uses English for en-* locale variants', () => {
    const brand = getBrandBySlug('netflix')!
    expect(brandDisplayName(brand, 'en-IE')).toBe('Netflix')
    expect(brandDisplayName(brand, 'en-AU')).toBe('Netflix')
  })
})

// ---------------------------------------------------------------------------
// Slug / matching
// ---------------------------------------------------------------------------

describe('normaliseBrandName', () => {
  it('lowercases', () => {
    expect(normaliseBrandName('NetFlix')).toBe('netflix')
  })
  it('strips diacritics', () => {
    expect(normaliseBrandName('Café')).toBe('cafe')
  })
  it('collapses non-alphanumerics', () => {
    expect(normaliseBrandName('App Store & iTunes')).toBe('app store itunes')
  })
  it('handles empty input', () => {
    expect(normaliseBrandName('')).toBe('')
    expect(normaliseBrandName('   ')).toBe('')
  })
})

describe('productMatchesBrand', () => {
  const netflix = getBrandBySlug('netflix')!
  const apple = getBrandBySlug('app-store-itunes')!
  const playstation = getBrandBySlug('playstation')!

  it('matches exact brand name', () => {
    const p = makeProduct({ brandName: 'Netflix' })
    expect(productMatchesBrand(p, netflix)).toBe(true)
  })

  it('matches case-different brand name (NetFlix)', () => {
    const p = makeProduct({ brandName: 'NetFlix' })
    expect(productMatchesBrand(p, netflix)).toBe(true)
  })

  it('matches brand renamed by transform.ts (App Store & iTunes → Apple)', () => {
    const p = makeProduct({ brandName: 'Apple' })
    expect(productMatchesBrand(p, apple)).toBe(true)
  })

  it('matches raw Reloadly name (App Store & iTunes)', () => {
    const p = makeProduct({ brandName: 'App Store & iTunes' })
    expect(productMatchesBrand(p, apple)).toBe(true)
  })

  it('matches PlayStation regardless of casing (Playstation)', () => {
    const p = makeProduct({ brandName: 'Playstation' })
    expect(productMatchesBrand(p, playstation)).toBe(true)
  })

  it('does not match unrelated brand', () => {
    const p = makeProduct({ brandName: 'Spotify' })
    expect(productMatchesBrand(p, netflix)).toBe(false)
  })

  it('does not crash on missing brand name', () => {
    const p = makeProduct({ brandName: '' })
    expect(productMatchesBrand(p, netflix)).toBe(false)
  })
})

describe('findProductsForBrand', () => {
  const netflix = getBrandBySlug('netflix')!

  it('returns empty when no products match', () => {
    const products = [makeProduct({ brandName: 'Spotify', countryCodes: ['FI'] })]
    expect(findProductsForBrand(products, netflix, 'FI')).toEqual([])
  })

  it('prefers products matching the target country', () => {
    const fi = makeProduct({
      brandName: 'Netflix',
      countryCodes: ['FI'],
      slug: 'netflix-fi',
    })
    const us = makeProduct({
      brandName: 'Netflix',
      countryCodes: ['US'],
      slug: 'netflix-us',
    })
    const out = findProductsForBrand([fi, us], netflix, 'FI')
    expect(out).toHaveLength(1)
    expect(out[0].slug).toBe('netflix-fi')
  })

  it('falls back to global products when no per-country match', () => {
    const global = makeProduct({
      brandName: 'Netflix',
      countryCodes: [],
      _meta: { global: true } as any,
      slug: 'netflix-global',
    })
    const out = findProductsForBrand([global], netflix, 'FI')
    expect(out).toHaveLength(1)
    expect(out[0].slug).toBe('netflix-global')
  })
})

// ---------------------------------------------------------------------------
// Copy resolver
// ---------------------------------------------------------------------------

describe('resolveCopy', () => {
  it('returns localised copy when present', () => {
    const { copy, isFallback } = resolveCopy('fi-FI', 'netflix')
    expect(isFallback).toBe(false)
    expect(copy.heroTitle).toContain('Netflix')
    expect(copy.faq.length).toBeGreaterThanOrEqual(4)
  })

  it('falls back to English baseline when locale missing brand', () => {
    // pl-PL has Netflix hand-authored but not Steam — should fall back.
    const { copy, isFallback } = resolveCopy('pl-PL', 'steam')
    expect(isFallback).toBe(true)
    expect(copy.heroTitle).toMatch(/Steam/i)
  })

  it('does NOT mark en-* locales as fallback when using the EN baseline', () => {
    const { isFallback } = resolveCopy('en-IE', 'netflix')
    expect(isFallback).toBe(false)
  })

  it('marks non-English locales as fallback when no localised copy exists', () => {
    const { isFallback } = resolveCopy('el-GR', 'netflix')
    expect(isFallback).toBe(true)
  })

  it('every brand has an English baseline entry', () => {
    for (const brand of BRANDS) {
      const en = COPY.en?.[brand.slug]
      if (!en) {
        throw new Error(`EN copy missing for ${brand.slug}`)
      }
      expect(en.heroTitle).toBeTruthy()
      expect(en.heroSubtitle).toBeTruthy()
      expect(en.description).toBeTruthy()
      expect(en.keywords.length).toBeGreaterThan(0)
      expect(en.faq.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('every English description is at least 50 chars (SEO floor)', () => {
    for (const brand of BRANDS) {
      const en = COPY.en![brand.slug]!
      if (en.description.length < 50) {
        throw new Error(
          `description for ${brand.slug} is too short (${en.description.length} chars)`
        )
      }
    }
  })

  it('Arabic AE copy renders RTL-safe content (no leading LTR markers)', () => {
    const { copy } = resolveCopy('ar-AE', 'amazon')
    // Title should start with an Arabic letter, not Latin.
    expect(copy.heroTitle.charCodeAt(0)).toBeGreaterThan(0x0600)
  })
})
