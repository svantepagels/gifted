/**
 * Unit tests for the open-loop / stored-value compliance predicate.
 *
 * WHY: our Stripe application states Gifted sells closed-loop third-party
 * gift cards only. These tests prove open-loop network cards and crypto
 * stored-value products are matched, and — just as important — that
 * legitimate closed-loop brands are NOT (false-positive guards).
 *
 * Any addition to the blocklists in lib/giftcards/compliance.ts MUST come
 * with new negative (allowed) cases here.
 */

import { describe, it, expect } from '@jest/globals'
import { isOpenLoopProduct, filterOpenLoopGiftCards } from '../compliance'
import { BRANDS } from '../../landing-pages/brands'
import type { GiftCardProduct } from '../types'

describe('isOpenLoopProduct — blocked (open-loop / stored-value)', () => {
  const blocked = [
    'Visa Prepaid Card',
    'Prepaid Visa',
    'Vanilla Visa',
    'Mastercard',
    'MasterCard Prepaid',
    'Master Card Gift Card',
    'American Express Gift Card',
    'AMEX',
    'Binance Gift Card',
    'Binance USDT Voucher',
    'Crypto Voucher',
    'CryptoVoucher',
    'Bitcoin Voucher',
    'Ethereum Top-Up',
    'paysafecard',
    'Neosurf',
    'Flexepin',
    'AstroPay',
    'Discover Prepaid',
    'Prepaid Debit Card',
    'Virtual Prepaid Card',
    'Visa® Virtual Account', // symbol normalization
    'Vísa Prepaid', // diacritic normalization
  ]

  it.each(blocked)('blocks brandName %p', (name) => {
    expect(isOpenLoopProduct({ brandName: name })).toBe(true)
  })

  it.each(blocked)('blocks productName %p', (name) => {
    expect(isOpenLoopProduct({ productName: name })).toBe(true)
  })

  it('blocks when only one of the two names matches', () => {
    expect(
      isOpenLoopProduct({ brandName: 'Generic Gift Card', productName: 'Visa Prepaid USD' })
    ).toBe(true)
    expect(
      isOpenLoopProduct({ brandName: 'Binance', productName: 'Gift Card 25 USD' })
    ).toBe(true)
  })
})

describe('isOpenLoopProduct — allowed (closed-loop, false-positive guards)', () => {
  const allowed = [
    'Amazon',
    'Spotify',
    'Apple',
    'App Store & iTunes',
    'Netflix',
    'Google Play',
    'Steam',
    'Televisa', // token is `televisa`, not `visa` — must NOT match
    'Discovery+', // token is `discovery`, not `discover` — must NOT match
    'Starbucks',
    'Nintendo eShop',
    'Spotify Premium Prepaid', // generic standalone `prepaid` is allowed
    'Walmart',
    'Uber',
    'Target',
    'Xbox',
    'PlayStation',
    'Roblox',
  ]

  it.each(allowed)('allows %p', (name) => {
    expect(isOpenLoopProduct({ brandName: name })).toBe(false)
    expect(isOpenLoopProduct({ productName: name })).toBe(false)
  })

  it('handles missing / empty names without matching', () => {
    expect(isOpenLoopProduct({})).toBe(false)
    expect(isOpenLoopProduct({ brandName: null, productName: null })).toBe(false)
    expect(isOpenLoopProduct({ brandName: '', productName: '   ' })).toBe(false)
  })
})

describe('filterOpenLoopGiftCards', () => {
  it('drops open-loop products and keeps closed-loop ones', () => {
    const products = [
      { brandName: 'Amazon' },
      { brandName: 'Visa Prepaid' },
      { brandName: 'Crypto Voucher' },
      { brandName: 'Spotify' },
    ] as GiftCardProduct[]

    const kept = filterOpenLoopGiftCards(products)
    expect(kept.map((p) => p.brandName)).toEqual(['Amazon', 'Spotify'])
  })
})

describe('compliance canary — curated landing-page brands', () => {
  // Fails the build if anyone re-adds a crypto / prepaid open-loop brand
  // to the curated BRANDS list (as crypto-voucher once was).
  it('no curated brand (display name or alias) is open-loop', () => {
    for (const brand of BRANDS) {
      expect(
        isOpenLoopProduct({ brandName: brand.displayName.en })
      ).toBe(false)
      for (const alias of brand.reloadlyBrandAliases) {
        expect(isOpenLoopProduct({ brandName: alias })).toBe(false)
      }
    }
  })
})
