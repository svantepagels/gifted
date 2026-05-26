import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ConsentPreferencesLink } from '@/components/consent/ConsentPreferencesLink'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { localeHref } from '@/lib/i18n/href'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How Gifted uses cookies and similar technologies, and how you can manage your preferences.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '2026-05-26'

interface CookiePolicyProps {
  params: { locale: string }
}

export default function CookiePolicyPage({ params }: CookiePolicyProps) {
  if (!isLocale(params.locale)) notFound()
  const locale: Locale = params.locale
  const href = (path: string) => localeHref(locale, path)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <article className="prose prose-slate max-w-none">
          <h1 className="font-archivo text-3xl sm:text-4xl font-bold mb-2">
            Cookie Policy
          </h1>
          <p className="text-body-sm text-surface-on-surface-variant mb-8">
            Last updated: {LAST_UPDATED}
          </p>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              1. What are cookies?
            </h2>
            <p className="text-body-md">
              Cookies are small text files placed on your device when you visit
              a website. They are widely used to make websites work more
              efficiently and to provide information to the site owners. Some
              technologies that aren&rsquo;t strictly cookies&mdash;like
              localStorage and pixels&mdash;serve similar purposes and are
              covered by this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              2. How we use cookies
            </h2>
            <p className="text-body-md">
              We use cookies and similar technologies to operate Gifted, to
              understand how visitors use the site, and (with your consent) to
              measure the effectiveness of any marketing campaigns we run. We
              do not use cookies to identify you personally for advertising
              outside of Gifted unless you have explicitly accepted marketing
              cookies.
            </p>
            <p className="text-body-md mt-3">
              On your first visit you will see a banner asking you to accept
              all, reject non-essential, or manage your preferences. You can
              change your choice at any time by clicking{' '}
              <ConsentPreferencesLink className="underline text-secondary hover:text-secondary-hover bg-transparent p-0" />
              {' '}in the footer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              3. Categories of cookies we use
            </h2>

            <h3 className="font-archivo text-title-md font-semibold mt-5 mb-2">
              Strictly necessary
            </h3>
            <p className="text-body-md">
              These cookies and storage entries are required for the site to
              function. They cannot be disabled.
            </p>
            <ul className="list-disc pl-6 text-body-md mt-2 space-y-1">
              <li>
                <code>gifted_country</code> &mdash; remembers the country/region
                you selected so prices and gift card availability are correct.
              </li>
              <li>
                <code>gifted_cookie_consent_v1</code> (localStorage) &mdash;
                stores your consent choice so we do not ask you again on every
                page.
              </li>
              <li>
                Session/CSRF/checkout cookies &mdash; set during checkout to
                protect against fraud and to complete your order.
              </li>
            </ul>

            <h3 className="font-archivo text-title-md font-semibold mt-5 mb-2">
              Analytics
            </h3>
            <p className="text-body-md">
              Help us understand how visitors use the site (which pages they
              view, where they came from) so we can improve it. No personally
              identifying information is associated with these analytics.
              Analytics scripts are <strong>not loaded</strong> until you
              accept analytics cookies.
            </p>
            <ul className="list-disc pl-6 text-body-md mt-2 space-y-1">
              <li>
                Vercel Analytics &mdash; aggregated, anonymous page-view data.
                See{' '}
                <a
                  href="https://vercel.com/docs/analytics"
                  className="underline text-secondary hover:text-secondary-hover"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel Analytics documentation
                </a>
                .
              </li>
            </ul>

            <h3 className="font-archivo text-title-md font-semibold mt-5 mb-2">
              Marketing
            </h3>
            <p className="text-body-md">
              Used to measure the performance of marketing campaigns we run
              (e.g. paid search) and to show relevant promotions. Marketing
              scripts are <strong>not loaded</strong> until you accept
              marketing cookies. We do not currently use third-party
              retargeting or social-media pixels; if we add any, they will be
              listed here.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              4. Managing your preferences
            </h2>
            <p className="text-body-md">
              You can change your consent at any time:
            </p>
            <ul className="list-disc pl-6 text-body-md mt-2 space-y-1">
              <li>
                Click <ConsentPreferencesLink className="underline text-secondary hover:text-secondary-hover bg-transparent p-0" /> in the page footer.
              </li>
              <li>
                Clear cookies and site data for{' '}
                <code>gifted-project-blue.vercel.app</code> in your browser
                settings &mdash; you will be asked again on your next visit.
              </li>
              <li>
                Most browsers also let you block cookies entirely. Doing so
                may break checkout and the country selector.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              5. Your rights
            </h2>
            <p className="text-body-md">
              Under the EU General Data Protection Regulation (GDPR) and the
              UK GDPR you have the right to refuse non-essential cookies and
              to withdraw your consent at any time. Refusing analytics or
              marketing cookies will not stop you from using the site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              6. Changes to this policy
            </h2>
            <p className="text-body-md">
              We may update this Cookie Policy from time to time. Material
              changes (new vendors, new categories) will trigger the banner
              again so you can review your choices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              7. Contact
            </h2>
            <p className="text-body-md">
              Questions about this policy can be sent to the email address
              listed on our{' '}
              <Link
                href={href('/privacy')}
                className="underline text-secondary hover:text-secondary-hover"
              >
                Privacy Policy
              </Link>{' '}
              page.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
