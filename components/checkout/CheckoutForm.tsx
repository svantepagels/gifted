'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Mail } from 'lucide-react'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages } from '@/lib/i18n/useMessages'

// Schema messages are i18n keys — translated at render time below.
const buyerEmailSchema = z.object({
  email: z.string().email('checkoutForm.email.errorInvalid'),
})

type BuyerEmailFormData = z.infer<typeof buyerEmailSchema>

interface CheckoutFormProps {
  onSubmit: (email: string) => Promise<void>
  isGift?: boolean
  recipientEmail?: string
}

export function CheckoutForm({ onSubmit, isGift = false, recipientEmail }: CheckoutFormProps) {
  const locale = useLocale()
  const m = getMessages(locale)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerEmailFormData>({
    resolver: zodResolver(buyerEmailSchema),
  })

  const localizeError = (msg: string | undefined): string | undefined => {
    if (!msg) return undefined
    return (m as Record<string, string>)[msg] ?? msg
  }

  const handleFormSubmit = async (data: BuyerEmailFormData) => {
    try {
      setError(null)
      setIsSubmitting(true)
      await onSubmit(data.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : m['checkoutForm.error.generic'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-surface-container-lowest rounded-lg p-6 space-y-4">
        <h2 className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
          {m['checkoutForm.heading']}
        </h2>

        {/* Show recipient email reminder if this is a gift */}
        {isGift && recipientEmail && (
          <div className="p-4 rounded-md bg-secondary/5 border border-secondary/20 mb-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-label-md font-medium text-surface-on-surface mb-1">
                  {m['checkoutForm.giftBanner.label']}
                </p>
                <p className="text-body-md text-secondary">
                  {recipientEmail}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Input
            label={isGift ? m['checkoutForm.email.labelGift'] : m['checkoutForm.email.label']}
            type="email"
            placeholder={m['checkoutForm.email.placeholder']}
            error={localizeError(errors.email?.message)}
            helperText={isGift ? m['checkoutForm.email.helperGift'] : m['checkoutForm.email.helper']}
            {...register('email')}
          />
        </div>

        {error && (
          <div className="p-4 rounded-md bg-error-container text-error-on-container text-body-md">
            {error}
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? m['checkoutForm.submitProcessing'] : m['checkoutForm.submit']}
      </Button>

      <p className="text-center text-label-md text-surface-on-surface-variant">
        {m['checkoutForm.legal']}
      </p>
    </form>
  )
}
