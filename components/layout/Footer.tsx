'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/useLocale'
import { localeHref } from '@/lib/i18n/href'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const locale = useLocale()
  const href = (path: string) => localeHref(locale, path)

  return (
    <footer className="bg-primary-container text-primary-on-container mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-archivo text-title-md mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href={href('/')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  Browse All
                </Link>
              </li>
              <li>
                <Link href={href('/?category=Shopping')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  Shopping
                </Link>
              </li>
              <li>
                <Link href={href('/?category=Media')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  Media
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-archivo text-title-md mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href={href('/help')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href={href('/contact')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href={href('/faq')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-archivo text-title-md mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href={href('/about')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={href('/terms')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href={href('/privacy')} className="text-label-lg hover:text-surface-container-lowest transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-archivo text-title-md mb-4">GIFTED</h3>
            <p className="text-label-md">
              Digital gift cards delivered instantly. Send joy to anyone, anywhere.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-on-container/20">
          <p className="text-center text-label-md">
            © {currentYear} GIFTED. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
