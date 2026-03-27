'use client'

import { forwardRef, useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-label-md text-surface-on-surface mb-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full px-4 py-3 rounded-md border
            bg-surface-container-lowest
            text-surface-on-surface text-body-md
            placeholder:text-surface-on-surface-variant
            focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-error ring-1 ring-error' : 'border-outline-variant'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-label-md text-error-on-container">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-label-sm text-surface-on-surface-variant">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
