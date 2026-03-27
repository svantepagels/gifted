'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-secondary text-secondary-on-secondary hover:bg-secondary-hover focus:ring-secondary',
    secondary: 'bg-surface-container-high text-surface-on-surface hover:bg-surface-container-highest focus:ring-surface-container-highest',
    ghost: 'text-surface-on-surface hover:bg-surface-container-low focus:ring-surface-container',
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-label-md',
    md: 'px-8 py-4 text-body-md',
    lg: 'px-10 py-5 text-title-md',
  }
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
}
