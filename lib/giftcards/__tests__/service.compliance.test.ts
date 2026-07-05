/**
 * Layer-1 tests: GiftCardService must never surface open-loop /
 * stored-value products, regardless of which accessor is used
 * (browse list, country list, PDP slug lookup, reloadlyId lookup,
 * category list). See lib/giftcards/compliance.ts for the rationale.
 *
 * The Reloadly client is mocked BEFORE import — the real module throws
 * at load time without credentials.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import type { Product as ReloadlyProduct } from '../../reloadly/types'

const mockGetAllProductsPaginatedWithMeta = jest.fn<any>()
const mockGetProducts = jest.fn<any>()

jest.mock('@/lib/reloadly/client', () => ({
  reloadlyClient: {
    getAllProductsPaginatedWithMeta: (...args: unknown[]) =>
      mockGetAllProductsPaginatedWithMeta(...args),
    getProducts: (...args: unknown[]) => mockGetProducts(...args),
  },
}))

// Import AFTER the mock so the throwing singleton constructor never runs.
import { giftCardService } from '../service'
import { productCache, CacheKeys } from '../cache'
import { transformReloadlyProduct } from '../transform'

function rawProduct(
  productId: number,
  brandName: string,
  productName: string
): ReloadlyProduct {
  return {
    productId,
    productName,
    global: false,
    senderFee: 0,
    discountPercentage: 0,
    denominationType: 'FIXED',
    recipientCurrencyCode: 'USD',
    minRecipientDenomination: null,
    maxRecipientDenomination: null,
    senderCurrencyCode: 'USD',
    minSenderDenomination: null,
    maxSenderDenomination: null,
    fixedRecipientDenominations: [10, 25],
    fixedSenderDenominations: [10, 25],
    fixedRecipientToSenderDenominationsMap: { '10': 10, '25': 25 },
    logoUrls: [],
    brand: { brandId: productId, brandName },
    country: { isoName: 'US', name: 'United States', flagUrl: '' },
    redeemInstruction: { concise: 'Redeem online', verbose: 'Redeem online' },
  }
}

const VISA_ID = 101
const CRYPTO_ID = 102
const AMAZON_ID = 103

const RAW_PAGE: ReloadlyProduct[] = [
  rawProduct(VISA_ID, 'Visa Prepaid', 'Visa Prepaid Card USD'),
  rawProduct(CRYPTO_ID, 'Crypto Voucher', 'Crypto Voucher EUR'),
  rawProduct(AMAZON_ID, 'Amazon', 'Amazon US'),
]

// Slugs follow transform.ts createSlug: <brand>-<country>-<productId>
const VISA_SLUG = `visa-prepaid-us-${VISA_ID}`
const CRYPTO_SLUG = `crypto-voucher-us-${CRYPTO_ID}`
const AMAZON_SLUG = `amazon-us-${AMAZON_ID}`

beforeEach(() => {
  // The singleton's in-memory cache persists across tests — reset it.
  giftCardService.clearCache()
  mockGetAllProductsPaginatedWithMeta.mockReset()
  mockGetProducts.mockReset()
  mockGetAllProductsPaginatedWithMeta.mockResolvedValue({
    content: RAW_PAGE,
    last: true,
    totalElements: RAW_PAGE.length,
    totalPages: 1,
    number: 0,
    size: RAW_PAGE.length,
  })
  mockGetProducts.mockResolvedValue(RAW_PAGE)
})

describe('GiftCardService compliance filtering (Layer 1)', () => {
  it('getProducts() excludes open-loop products (all-countries path)', async () => {
    const products = await giftCardService.getProducts()
    expect(products.map((p) => p.brandName)).toEqual(['Amazon'])
  })

  it('getProducts({ countryCode }) excludes open-loop products (country path)', async () => {
    const products = await giftCardService.getProducts({ countryCode: 'US' })
    expect(mockGetProducts).toHaveBeenCalledWith('US')
    expect(products.map((p) => p.brandName)).toEqual(['Amazon'])
  })

  it('search cannot resurface an excluded product', async () => {
    const products = await giftCardService.getProducts({
      countryCode: 'US',
      search: 'visa',
    })
    expect(products).toEqual([])
  })

  it('getProductBySlug() returns null for open-loop slugs (PDP 404s)', async () => {
    expect(await giftCardService.getProductBySlug(VISA_SLUG)).toBeNull()
    expect(await giftCardService.getProductBySlug(CRYPTO_SLUG)).toBeNull()
    // Closed-loop control: Amazon still resolves.
    const amazon = await giftCardService.getProductBySlug(AMAZON_SLUG)
    expect(amazon?.brandName).toBe('Amazon')
  })

  it('getProductByReloadlyId() returns null for open-loop ids (order route gets 400)', async () => {
    expect(await giftCardService.getProductByReloadlyId(VISA_ID)).toBeNull()
    expect(await giftCardService.getProductByReloadlyId(CRYPTO_ID)).toBeNull()
    // Closed-loop control: Amazon still resolves.
    const amazon = await giftCardService.getProductByReloadlyId(AMAZON_ID)
    expect(amazon?._meta?.reloadlyProductId).toBe(AMAZON_ID)
  })

  it('getCategories() contains no category sourced solely from excluded products', async () => {
    // Fixture categories: Amazon → Shopping; Visa Prepaid / Crypto Voucher
    // would land in Other. With the open-loop products excluded, only
    // Shopping (plus the unconditional 'All') remains.
    const categories = await giftCardService.getCategories()
    expect(categories).toEqual(['All', 'Shopping'])
  })
})

describe('cache-poisoning defense (read-path re-filter)', () => {
  // Regression: build-countries.ts used to write UNFILTERED products to
  // CacheKeys.allProducts() — the exact key GiftCardService trusts —
  // letting open-loop products resurface on every display surface via a
  // '[Cache] Hit'. The service must re-filter cache reads so ANY future
  // unfiltered writer is neutralized, not just today's known one.
  beforeEach(() => {
    // Prime the shared cache with unfiltered transformed products,
    // simulating a writer that skips the compliance filter.
    productCache.set(CacheKeys.allProducts(), RAW_PAGE.map(transformReloadlyProduct))
  })

  it('getProducts() excludes open-loop products served from a poisoned cache', async () => {
    const brands = (await giftCardService.getProducts()).map((p) => p.brandName)
    expect(brands).toContain('Amazon')
    expect(brands).not.toContain('Visa Prepaid')
    expect(brands).not.toContain('Crypto Voucher')
    // Proves the poisoned cache entry was actually served (no refetch).
    expect(mockGetAllProductsPaginatedWithMeta).not.toHaveBeenCalled()
  })

  it('getProductBySlug() returns null for poisoned open-loop entries', async () => {
    expect(await giftCardService.getProductBySlug(VISA_SLUG)).toBeNull()
    expect(await giftCardService.getProductBySlug(CRYPTO_SLUG)).toBeNull()
    // Closed-loop control: Amazon still resolves from the same cache.
    const amazon = await giftCardService.getProductBySlug(AMAZON_SLUG)
    expect(amazon?.brandName).toBe('Amazon')
    expect(mockGetAllProductsPaginatedWithMeta).not.toHaveBeenCalled()
  })

  it('getProductByReloadlyId() returns null for poisoned open-loop entries', async () => {
    expect(await giftCardService.getProductByReloadlyId(VISA_ID)).toBeNull()
    expect(await giftCardService.getProductByReloadlyId(CRYPTO_ID)).toBeNull()
    const amazon = await giftCardService.getProductByReloadlyId(AMAZON_ID)
    expect(amazon?._meta?.reloadlyProductId).toBe(AMAZON_ID)
    expect(mockGetAllProductsPaginatedWithMeta).not.toHaveBeenCalled()
  })

  it('getProducts({ countryCode }) excludes open-loop products from a poisoned country cache', async () => {
    productCache.set(
      CacheKeys.countryProducts('US'),
      RAW_PAGE.map(transformReloadlyProduct)
    )
    const brands = (await giftCardService.getProducts({ countryCode: 'US' })).map(
      (p) => p.brandName
    )
    expect(brands).toEqual(['Amazon'])
    expect(mockGetProducts).not.toHaveBeenCalled()
  })
})
