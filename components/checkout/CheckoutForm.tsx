'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema } from '@/lib/utils/validation'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { z } from 'zod'

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  onSubmit: (email: string) => Promise<void>
}

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })
  
  const handleFormSubmit = async (data: CheckoutFormData) => {
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
        <h2 className="font-archivo text-title-lg text-surface-on-surface mb-4">
          Your Information
        </h2>
        
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Input
          label="Confirm Email"
          type="email"
          placeholder="your@email.com"
          error={errors.confirmEmail?.message}
          {...register('confirmEmail')}
        />
        
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
        Complete Purchase
      </Button>
      
      <p className="text-center text-label-md text-surface-on-surface-variant">
        By completing this purchase, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}
