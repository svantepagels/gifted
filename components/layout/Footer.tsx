'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/i18n/useLocale'
import { localeHref } from '@/lib/i18n/href'
import { getMessages } from '@/lib/i18n/useMessages'
import { ConsentPreferencesLink } from '@/components/consent/ConsentPreferencesLink'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const locale = useLocale()
  const m = getMessages(locale)
  const href = (path: string) => localeHref(locale, path)
  const copyright = (m['footer.copyright'] as string).replace(
    '{year}',
    String(currentYear)
  )

  return (
    <footer className="bg-primary-container text-primary-on-container mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <Link
            href={href('/')}
            aria-label="Gifted home"
            className="inline-flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/brand/gifted-logo.svg"
              alt="Gifted"
              width={120}
              height={36}
              className="h-8 w-auto invert brightness-0 contrast-200"
            />
          </Link>
          <p className="text-label-md mt-3 opacity-80">
            {m['footer.tagline']}
          </p>
        </div>
        <div>
          <h3 className="font-archivo text-title-md mb-4">
            {m['footer.company.heading']}
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href={href('/terms-conditions')}
                className="text-label-lg hover:text-surface-container-lowest transition-colors"
              >
                {m['footer.company.terms']}
              </Link>
            </li>
            <li>
              <Link
                href={href('/privacy')}
                className="text-label-lg hover:text-surface-container-lowest transition-colors"
              >
                {m['footer.company.privacy']}
              </Link>
            </li>
            <li>
              <Link
                href={href('/cookie-policy')}
                className="text-label-lg hover:text-surface-container-lowest transition-colors"
              >
                {(m['footer.company.cookiePolicy'] as string) ?? 'Cookie Policy'}
              </Link>
            </li>
            <li>
              <ConsentPreferencesLink />
            </li>
          </ul>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-on-container/20">
          <p className="text-center text-label-md">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
