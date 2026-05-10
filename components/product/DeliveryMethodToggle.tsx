'use client'

import { motion } from 'framer-motion'
import { User, Gift } from 'lucide-react'
import { DeliveryMethod } from '@/lib/orders/types'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages } from '@/lib/i18n/useMessages'

interface DeliveryMethodToggleProps {
  value: DeliveryMethod
  onChange: (method: DeliveryMethod) => void
}

export function DeliveryMethodToggle({ value, onChange }: DeliveryMethodToggleProps) {
  const locale = useLocale()
  const m = getMessages(locale)

  const options: { value: DeliveryMethod; label: string; icon: typeof User }[] = [
    { value: 'self', label: m['pdp.delivery.self'], icon: User },
    { value: 'gift', label: m['pdp.delivery.gift'], icon: Gift },
  ]

  return (
    <div>
      <label className="block text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
        {m['pdp.delivery.heading']}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = value === option.value
          const Icon = option.icon

          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              aria-label={option.label}
              aria-pressed={isSelected}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'border-secondary bg-secondary/5'
                  : 'border-outline-variant hover:border-surface-on-surface-variant'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? 'text-secondary' : 'text-surface-on-surface-variant'}`} />
              <div className="text-body-md font-medium text-surface-on-surface">
                {option.label}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
