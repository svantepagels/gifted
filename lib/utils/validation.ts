import { z } from 'zod'

/**
 * Schemas use i18n keys (not English strings) as Zod messages so that
 * consumers can render them in the active locale at form-render time.
 *
 * Pattern:
 *   const errMsg = errors.foo?.message
 *   const localized = errMsg && m[errMsg as MessageKey] ? m[errMsg as MessageKey] : errMsg
 *
 * Existing English fallbacks remain intact: if a consumer forgets to
 * map an error to messages, the displayed text is the i18n key string,
 * which is at least non-empty and unambiguous in logs.
 */

export const emailSchema = z
  .string()
  .min(1, 'checkoutForm.email.errorInvalid')
  .email('checkoutForm.email.errorInvalid')

export const giftDetailsSchema = z.object({
  recipientEmail: z
    .string()
    .email('pdp.gift.recipientEmailInvalid')
    .optional()
    .or(z.literal('')),
  giftMessage: z
    .string()
    .max(200, 'pdp.gift.messageTooLong')
    .optional(),
})

export const checkoutSchema = z.object({
  email: z
    .string()
    .min(1, 'checkoutForm.email.errorInvalid')
    .email('checkoutForm.email.errorInvalid'),
  confirmEmail: z
    .string()
    .min(1, 'checkoutForm.email.errorInvalid')
    .email('checkoutForm.email.errorInvalid'),
}).refine((data) => data.email === data.confirmEmail, {
  message: 'checkoutForm.email.errorInvalid',
  path: ['confirmEmail'],
})

export const customAmountSchema = z
  .number()
  .min(1, 'pdp.amount.errorMin')
  .max(10000, 'pdp.amount.errorMax')
