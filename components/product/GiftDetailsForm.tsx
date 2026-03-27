'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { giftDetailsSchema } from '@/lib/utils/validation'
import { Input } from '@/components/shared/Input'
import { z } from 'zod'
import { useEffect } from 'react'

type GiftDetailsFormData = z.infer<typeof giftDetailsSchema>

interface GiftDetailsFormProps {
  onChange: (data: Partial<GiftDetailsFormData>) => void
}

export function GiftDetailsForm({ onChange }: GiftDetailsFormProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<GiftDetailsFormData>({
    resolver: zodResolver(giftDetailsSchema),
    mode: 'onChange',
  })
  
  const formData = watch()
  
  useEffect(() => {
    onChange(formData)
  }, [formData, onChange])
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
          RECIPIENT EMAIL
        </label>
        <Input
          type="email"
          placeholder="friend@example.com"
          error={errors.recipientEmail?.message}
          {...register('recipientEmail')}
        />
      </div>
      
      <div>
        <label className="block text-label-md text-surface-on-surface mb-2">
          Personal Message (Optional)
        </label>
        <textarea
          placeholder="Add a personal message..."
          className="w-full px-4 py-3 rounded-md border border-outline-variant bg-surface-container-lowest text-surface-on-surface text-body-md placeholder:text-surface-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 resize-none"
          rows={4}
          maxLength={200}
          {...register('giftMessage')}
        />
        {errors.giftMessage && (
          <p className="mt-1 text-label-md text-error-on-container">
            {errors.giftMessage.message}
          </p>
        )}
      </div>
    </div>
  )
}
