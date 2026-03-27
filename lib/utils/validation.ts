import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const giftDetailsSchema = z.object({
  recipientEmail: emailSchema,
  giftMessage: z
    .string()
    .max(200, 'Message must be 200 characters or less')
    .optional(),
})

export const checkoutSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  confirmEmail: z
    .string()
    .min(1, 'Please confirm your email address')
    .email('Please enter a valid email address'),
}).refine((data) => data.email === data.confirmEmail, {
  message: 'Email addresses do not match',
  path: ['confirmEmail'],
})

export const customAmountSchema = z
  .number()
  .min(1, 'Amount must be at least 1')
  .max(10000, 'Amount cannot exceed 10,000')
