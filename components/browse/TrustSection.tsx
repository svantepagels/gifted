import { Shield, Zap, Gift } from 'lucide-react'

export function TrustSection() {
  const features = [
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Gift cards delivered to your inbox within minutes',
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Bank-level encryption and fraud protection',
    },
    {
      icon: Gift,
      title: 'Perfect Every Time',
      description: 'No expiration dates on our digital gift cards',
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
