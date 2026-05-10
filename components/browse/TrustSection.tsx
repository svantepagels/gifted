'use client'

import { Shield, Zap, Gift } from 'lucide-react'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages } from '@/lib/i18n/useMessages'

export function TrustSection() {
  const locale = useLocale()
  const m = getMessages(locale)
  const features = [
    {
      icon: Zap,
      title: m['trust.instant.title'],
      description: m['trust.instant.description'],
    },
    {
      icon: Shield,
      title: m['trust.secure.title'],
      description: m['trust.secure.description'],
    },
    {
      icon: Gift,
      title: m['trust.perfect.title'],
      description: m['trust.perfect.description'],
    },
  ]

  return (
    <section className="py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                <Icon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-archivo text-title-lg text-surface-on-surface mb-2">
                {feature.title}
              </h3>
              <p className="text-body-md text-surface-on-surface-variant">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
