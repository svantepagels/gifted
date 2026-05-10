'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { giftDetailsSchema } from '@/lib/utils/validation'
import { Input } from '@/components/shared/Input'
import { z } from 'zod'
import { useEffect } from 'react'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages, type MessageKey } from '@/lib/i18n/useMessages'

type GiftDetailsFormData = z.infer<typeof giftDetailsSchema>

interface GiftDetailsFormProps {
  onChange: (data: Partial<GiftDetailsFormData>) => void
}

/**
 * Translate a Zod error message that may be an i18n key.
 * Schemas in `lib/utils/validation.ts` set their messages to keys
 * (e.g. 'pdp.gift.recipientEmailInvalid') so we can localize at
 * render time.
 */
function localizeError(
  msg: string | undefined,
  m: ReturnType<typeof getMessages>
): string | undefined {
  if (!msg) return undefined
  return (m as Record<string, string>)[msg] ?? msg
}

export function GiftDetailsForm({ onChange }: GiftDetailsFormProps) {
  const locale = useLocale()
  const m = getMessages(locale)

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
        <label className="block text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-2">
          {m['pdp.gift.recipientHeading']}
        </label>
        <p className="text-label-sm text-surface-on-surface-variant mb-3">
          {m['pdp.gift.recipientHelp']}
        </p>
        <Input
          type="email"
          placeholder={m['pdp.gift.recipientPlaceholder']}
          error={localizeError(errors.recipientEmail?.message, m)}
          helperText={m['pdp.gift.recipientHelperText']}
          {...register('recipientEmail')}
        />
      </div>

      <div>
        <label className="block text-label-md text-surface-on-surface mb-2">
          {m['pdp.gift.messageLabel']}
        </label>
        <textarea
          placeholder={m['pdp.gift.messagePlaceholder']}
          className="w-full px-4 py-3 rounded-md border border-outline-variant bg-surface-container-lowest text-surface-on-surface text-body-md placeholder:text-surface-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 resize-none"
          rows={4}
          maxLength={200}
          {...register('giftMessage')}
        />
        {errors.giftMessage && (
          <p className="mt-1 text-label-md text-error-on-container">
            {localizeError(errors.giftMessage.message, m)}
          </p>
        )}
      </div>
    </div>
  )
}
