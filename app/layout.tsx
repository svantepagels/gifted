import type { ReactNode } from 'react'

/**
 * Root layout — passthrough.
 *
 * In an i18n-routed App Router app, the locale layout
 * (`app/[locale]/layout.tsx`) owns `<html>` and `<body>` so it can emit
 * the correct `lang` and `dir` at SSR time. `app/not-found.tsx` and
 * `app/global-error.tsx` emit their own `<html>`/`<body>` because they
 * bypass the layout chain.
 *
 * This pattern matches the official Next.js `app-dir-i18n-routing`
 * example. If a future Next.js version refuses a passthrough root
 * layout, fall back to setting default `<html lang dir>` here and
 * overriding via a client-side `<LocaleAttrSetter>` from the locale
 * layout.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children as JSX.Element
}
