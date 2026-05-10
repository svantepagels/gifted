import { test, expect } from '@playwright/test'

/**
 * Root-level metadata routes — these MUST NOT be locale-redirected
 * (regression guard for commit 455d425) and MUST serve the right
 * content type with non-zero body.
 */

const PNG_ROUTES = [
  '/icon',
  '/apple-icon',
  '/opengraph-image',
  '/twitter-image',
] as const

test.describe('metadata routes', () => {
  for (const route of PNG_ROUTES) {
    test(`${route} returns 200 PNG (no locale redirect)`, async ({ request }) => {
      const res = await request.get(route, { maxRedirects: 0 })
      expect(res.status(), `${route} should be 200, not redirected`).toBe(200)
      expect(res.headers()['content-type']).toContain('image/png')
      const body = await res.body()
      expect(body.length, `${route} body should be non-empty`).toBeGreaterThan(0)
    })
  }

  test('/manifest.webmanifest returns valid JSON', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest', { maxRedirects: 0 })
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.name || json.short_name).toBeTruthy()
    expect(Array.isArray(json.icons)).toBe(true)
    expect(json.icons.length).toBeGreaterThan(0)
  })

  test('/favicon.ico is reachable', async ({ request }) => {
    const res = await request.get('/favicon.ico', { maxRedirects: 0 })
    expect([200, 204, 304]).toContain(res.status())
  })

  test('/brand/gifted-logo.svg is reachable and is SVG', async ({ request }) => {
    const res = await request.get('/brand/gifted-logo.svg')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/svg/)
  })
})

test.describe('robots / sitemap', () => {
  test('/robots.txt either serves valid content or returns a clean 404', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt', { maxRedirects: 0 })
    expect([200, 404]).toContain(res.status())
    if (res.status() === 200) {
      const body = await res.text()
      expect(body.toLowerCase()).toContain('user-agent')
    }
  })

  test('/sitemap.xml either serves valid XML or returns a clean 404', async ({
    request,
  }) => {
    const res = await request.get('/sitemap.xml', { maxRedirects: 0 })
    expect([200, 404]).toContain(res.status())
    if (res.status() === 200) {
      const body = await res.text()
      expect(body.trim().startsWith('<')).toBe(true)
    }
  })
})
