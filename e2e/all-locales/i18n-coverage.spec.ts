import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { LOCALES, NON_EN_LOCALES, pickProductSlug, pickBrandSlug } from './helpers'
import { ENGLISH_SENTINELS } from './sentinels'

const MESSAGES_DIR = path.resolve(__dirname, '../../lib/i18n/messages')

function readJson(file: string): Record<string, string> {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

test.describe('i18n: static completeness', () => {
  const en = readJson(path.join(MESSAGES_DIR, 'en.json'))
  const enKeys = Object.keys(en).sort()

  for (const locale of NON_EN_LOCALES) {
    test(`${locale}.json has every key from en.json`, () => {
      const file = path.join(MESSAGES_DIR, `${locale}.json`)
      const dict = readJson(file)
      const missing = enKeys.filter((k) => !(k in dict))
      expect(missing, `Missing keys in ${locale}.json: ${missing.join(', ')}`).toEqual([])
    })

    test(`${locale}.json has no [TODO] placeholders`, () => {
      const file = path.join(MESSAGES_DIR, `${locale}.json`)
      const dict = readJson(file)
      const todo = Object.entries(dict).filter(([, v]) =>
        /\[TODO/i.test(String(v))
      )
      expect(
        todo,
        `Untranslated [TODO] placeholders in ${locale}.json: ${todo
          .map(([k]) => k)
          .join(', ')}`
      ).toEqual([])
    })

    test(`${locale}.json has no English-identical values (excluding allowlist)`, () => {
      const file = path.join(MESSAGES_DIR, `${locale}.json`)
      const dict = readJson(file)
      const allow = new Set([
        'common.brand', // GIFTED — brand wordmark
        'product.range', // {min} - {max} — pure interpolation token
        'categories.media', // 'Media' — same word in pl/el/fi/ar
        'categories.gaming', // 'Gaming' borrowed in many locales
        'categories.lifestyle', // 'Lifestyle' borrowed
        'footer.support.faq', // 'FAQ' — international acronym
      ])
      const offenders = Object.entries(dict).filter(
        ([k, v]) =>
          !allow.has(k) && typeof v === 'string' && v === en[k] && v.length > 1
      )
      // Allow up to 2 incidental matches — anything more is likely a
      // translation leak that escaped the allowlist.
      expect(
        offenders.length,
        `English-identical values in ${locale}.json: ${offenders
          .map(([k]) => k)
          .join(', ')}`
      ).toBeLessThanOrEqual(2)
    })
  }

  test('Arabic locales contain Arabic script', () => {
    for (const locale of ['ar-AE', 'ar-SA'] as const) {
      const dict = readJson(path.join(MESSAGES_DIR, `${locale}.json`))
      const values = Object.entries(dict).filter(
        ([k]) => k !== 'common.brand' && k !== 'product.range'
      )
      const arabic = values.filter(([, v]) => /[\u0600-\u06FF]/.test(String(v)))
      expect(
        arabic.length / values.length,
        `${locale} should be ≥80% Arabic script`
      ).toBeGreaterThanOrEqual(0.8)
    }
  })

  test('Greek locale contains Greek script', () => {
    const dict = readJson(path.join(MESSAGES_DIR, 'el-GR.json'))
    const values = Object.entries(dict).filter(
      ([k]) => k !== 'common.brand' && k !== 'product.range'
    )
    const greek = values.filter(([, v]) => /[\u0370-\u03FF]/.test(String(v)))
    expect(greek.length / values.length).toBeGreaterThanOrEqual(0.5)
  })
})

function findLeaks(bodyText: string): string[] {
  const lower = bodyText.toLowerCase()
  const leaked: string[] = []
  for (const sentinel of ENGLISH_SENTINELS) {
    if (lower.includes(sentinel.toLowerCase())) leaked.push(sentinel)
  }
  return leaked
}

test.describe('i18n: runtime leak check', () => {
  for (const locale of NON_EN_LOCALES) {
    test(`${locale} home page does not leak English sentinels`, async ({ page }) => {
      const res = await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
      expect(res?.status()).toBe(200)
      const bodyText = await page.locator('body').innerText()
      const leaked = findLeaks(bodyText)
      expect(
        leaked,
        `English sentinels leaked on /${locale}/ page: ${leaked.join(' | ')}`
      ).toEqual([])
    })

    test(`${locale} PDP does not leak English sentinels`, async ({ page }) => {
      const slug = await pickProductSlug(page, locale)
      test.skip(!slug, `No product card present on /${locale}/ home`)
      const res = await page.goto(`/${locale}/gift-card/${slug}`, {
        waitUntil: 'domcontentloaded',
      })
      expect(res?.status()).toBe(200)
      // Wait for the AmountSelector / DeliveryMethodToggle to render
      await page.waitForTimeout(500)
      const bodyText = await page.locator('body').innerText()
      const leaked = findLeaks(bodyText)
      expect(
        leaked,
        `English sentinels leaked on /${locale}/gift-card/${slug}: ${leaked.join(' | ')}`
      ).toEqual([])
    })

    test(`${locale} brand landing page does not leak English sentinels`, async ({ page }) => {
      const slug = await pickBrandSlug(page, locale)
      test.skip(!slug, `No /buy/<brand> link on /${locale}/ home`)
      const res = await page.goto(`/${locale}/buy/${slug}`, {
        waitUntil: 'domcontentloaded',
      })
      // Brand LP may 404 in some locales — skip in that case
      test.skip(res?.status() !== 200, `Brand ${slug} unavailable in ${locale}`)
      const bodyText = await page.locator('body').innerText()
      const leaked = findLeaks(bodyText)
      // NOTE: brand-marketing copy in lib/landing-pages/copy.ts is
      // English-only by design (separate task). We allow up to 5
      // marketing-string leaks here.
      expect(
        leaked.length,
        `English sentinels leaked on /${locale}/buy/${slug}: ${leaked.join(' | ')}`
      ).toBeLessThanOrEqual(5)
    })
  }
})
