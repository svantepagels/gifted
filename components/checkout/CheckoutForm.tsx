'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Mail } from 'lucide-react'

// Simplified schema - no confirm email needed
const buyerEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type BuyerEmailFormData = z.infer<typeof buyerEmailSchema>

interface CheckoutFormProps {
  onSubmit: (email: string) => Promise<void>
  isGift?: boolean
  recipientEmail?: string
}

export function CheckoutForm({ onSubmit, isGift = false, recipientEmail }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerEmailFormData>({
    resolver: zodResolver(buyerEmailSchema),
  })
  
  const handleFormSubmit = async (data: BuyerEmailFormData) => {
    try {
      setError(null)
      setIsSubmitting(true)
      await onSubmit(data.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-surface-container-lowest rounded-lg p-6 space-y-4">
        <h2 className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
          YOUR INFORMATION
        </h2>
        
        {/* Show recipient email reminder if this is a gift */}
        {isGift && recipientEmail && (
          <div className="p-4 rounded-md bg-secondary/5 border border-secondary/20 mb-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-label-md font-medium text-surface-on-surface mb-1">
                  Sending gift to:
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
            label={isGift ? "Your Email (for order confirmation)" : "Your Email"}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            helperText={isGift ? "We'll send the receipt to this address" : "We'll send your gift card to this address"}
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
        {isSubmitting ? 'Processing...' : 'Complete Purchase'}
      </Button>
      
      <p className="text-center text-label-md text-surface-on-surface-variant">
        By completing this purchase, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}
