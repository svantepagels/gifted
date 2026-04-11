# GIFTED Enhancement Architecture Specification
## Version 2.0 - UI Modernization + Reloadly Integration

**Project:** Gifted Site Enhancement & Reloadly Integration  
**Location:** `/Users/administrator/.openclaw/workspace/gifted-project`  
**Date:** 2026-04-11  
**Status:** Architecture Complete - Ready for Implementation

---

## Executive Summary

This specification defines the complete technical architecture for transforming the Gifted marketplace into a visually stunning, modern e-commerce experience with full Reloadly API integration.

**Core Objectives:**
1. Elevate the UI to award-winning marketplace standards (majority.com inspiration)
2. Implement production-ready Reloadly gift card API integration
3. Maintain mobile-first approach with desktop excellence
4. Ensure all changes are testable and deployable to Vercel

**Key Changes:**
- Enhanced typography system with variable fonts and dynamic type scales
- Expanded color palette with vibrant accent colors and gradient support
- Comprehensive animation system using Framer Motion
- Full Reloadly OAuth2 + product catalog + order placement integration
- Environment variable security for all credentials

---

## Part 1: UI Enhancement Architecture

### 1.1 Typography System Upgrade

**Current State:**
- Archivo Black (single weight)
- Inter (standard weights)
- Basic type scale

**Enhanced State:**
- Archivo variable font (100-900 weights)
- Inter variable font (100-900 weights)
- Display Playfair (for editorial moments)
- Expanded type scale with optical sizing

#### 1.1.1 Font Loading Configuration

**File:** `app/layout.tsx`

```typescript
import { Archivo, Inter } from 'next/font/google'
import localFont from 'next/font/local'

// Archivo Variable (for headlines, editorial)
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

// Inter Variable (for body, UI)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Optional: Playfair Display for hero moments
const playfair = localFont({
  src: [
    {
      path: '../public/fonts/PlayfairDisplay-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/PlayfairDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-playfair',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

#### 1.1.2 Tailwind Typography Extensions

**File:** `tailwind.config.ts`

Add to `theme.extend`:

```typescript
fontFamily: {
  archivo: ['var(--font-archivo)', 'sans-serif'],
  inter: ['var(--font-inter)', 'sans-serif'],
  playfair: ['var(--font-playfair)', 'serif'],
},
fontWeight: {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
},
fontSize: {
  // Hero Display (for landing hero only)
  'hero': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '900' }],
  
  // Display (major sections)
  'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '800' }],
  'display-lg': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '800' }],
  'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
  'display-sm': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
  
  // Headline (page/section titles)
  'headline-xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
  'headline-lg': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }],
  'headline-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
  'headline-sm': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
  
  // Title (card/component titles)
  'title-lg': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
  'title-md': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
  'title-sm': ['0.875rem', { lineHeight: '1.45', fontWeight: '600' }],
  
  // Body (paragraphs, descriptions)
  'body-xl': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
  'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
  'body-md': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
  'body-sm': ['0.875rem', { lineHeight: '1.55', fontWeight: '400' }],
  
  // Label (buttons, chips, metadata)
  'label-lg': ['0.9375rem', { lineHeight: '1.45', fontWeight: '600' }],
  'label-md': ['0.875rem', { lineHeight: '1.45', fontWeight: '600' }],
  'label-sm': ['0.75rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.05em' }],
},
```

### 1.2 Enhanced Color System

**Current State:**
- Minimal palette (navy, blue CTA, green, basic grays)
- No gradient support
- Limited accent colors

**Enhanced State:**
- Vibrant accent colors
- Gradient definitions
- Category-specific colors
- Enhanced state colors

#### 1.2.1 Color Palette Extension

**File:** `tailwind.config.ts`

Add to `theme.extend.colors`:

```typescript
colors: {
  // Keep existing colors, add these enhancements:
  
  // Vibrant Accents (for visual excitement)
  accent: {
    purple: '#8B5CF6',
    'purple-light': '#A78BFA',
    pink: '#EC4899',
    'pink-light': '#F472B6',
    orange: '#F97316',
    'orange-light': '#FB923C',
    cyan: '#06B6D4',
    'cyan-light': '#22D3EE',
  },
  
  // Category Colors (for visual diversity)
  category: {
    shopping: '#0051D5',
    entertainment: '#8B5CF6',
    food: '#F97316',
    travel: '#06B6D4',
    gaming: '#EC4899',
    lifestyle: '#10B981',
  },
  
  // Enhanced State Colors
  state: {
    hover: 'rgba(15, 23, 42, 0.04)',
    pressed: 'rgba(15, 23, 42, 0.08)',
    focus: 'rgba(0, 81, 213, 0.12)',
    'focus-ring': 'rgba(0, 81, 213, 0.3)',
  },
  
  // Gradient Stops (for backgrounds)
  gradient: {
    from: {
      purple: '#8B5CF6',
      pink: '#EC4899',
      orange: '#F97316',
      cyan: '#06B6D4',
      blue: '#0051D5',
    },
    to: {
      purple: '#6D28D9',
      pink: '#BE185D',
      orange: '#EA580C',
      cyan: '#0891B2',
      blue: '#003BA3',
    },
  },
},
```

#### 1.2.2 Gradient Utilities

Add to `tailwind.config.ts` in `theme.extend`:

```typescript
backgroundImage: {
  // Subtle gradients for sections
  'gradient-purple': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  'gradient-pink': 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
  'gradient-orange': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
  'gradient-cyan': 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
  'gradient-blue': 'linear-gradient(135deg, #0051D5 0%, #003BA3 100%)',
  
  // Mesh gradients for hero
  'mesh-purple': 'radial-gradient(at 40% 20%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(236, 72, 153, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)',
  
  // Shimmer effect for loading states
  'shimmer': 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%)',
},
```

### 1.3 Animation System

**Current State:**
- Basic Framer Motion hover effects
- Minimal page transitions

**Enhanced State:**
- Comprehensive animation variants library
- Page transition system
- Micro-interactions
- Loading states
- Scroll-triggered animations

#### 1.3.1 Animation Variants Library

**File:** `lib/animations/variants.ts` (NEW)

```typescript
import { Variants } from 'framer-motion'

/**
 * Fade In Variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } // Custom easing
  },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
}

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
}

/**
 * Stagger Children Variants
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
}

/**
 * Hover/Tap Variants
 */
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { scale: 0.98 },
}

export const buttonHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.15, ease: 'easeOut' }
  },
  tap: { scale: 0.98 },
}

export const chipHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { scale: 0.95 },
}

/**
 * Slide Variants
 */
export const slideInLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
}

export const slideInRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
}

/**
 * Page Transition Variants
 */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1],
      when: 'beforeChildren',
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: 'easeIn' }
  },
}

/**
 * Loading Shimmer
 */
export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
}

/**
 * Pulse (for badges, notifications)
 */
export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'easeInOut',
    },
  },
}
```

#### 1.3.2 Scroll Animation Hook

**File:** `lib/animations/useScrollAnimation.ts` (NEW)

```typescript
import { useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

/**
 * Hook to trigger animations when element enters viewport
 */
export function useScrollAnimation(threshold = 0.1) {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return { ref, controls }
}
```

#### 1.3.3 Page Transition Wrapper

**File:** `components/shared/PageTransition.tsx` (NEW)

```typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageTransition } from '@/lib/animations/variants'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 1.4 Component Enhancements

#### 1.4.1 Hero Section Redesign

**File:** `components/browse/HeroSection.tsx`

**Changes:**
- Implement mesh gradient background
- Add animated badge/tag line above headline
- Implement hero headline with clamp sizing
- Add scroll indicator animation
- Subtle parallax effect on scroll

```typescript
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants'
import { ChevronDown } from 'lucide-react'

export function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 50])
  const opacity = useTransform(scrollY, [0, 200], [1, 0])

  return (
    <motion.section 
      className="relative py-20 sm:py-24 lg:py-32 px-4 overflow-hidden"
      style={{ y, opacity }}
    >
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-mesh-purple pointer-events-none" />
      
      {/* Content */}
      <motion.div 
        className="relative text-center max-w-5xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/80 backdrop-blur-sm border border-surface-container-high"
          variants={staggerItem}
        >
          <div className="w-2 h-2 rounded-full bg-gradient-purple animate-pulse" />
          <span className="text-label-md text-primary">Instant Digital Delivery</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1 
          className="font-archivo font-black text-hero leading-none tracking-tighter text-primary mb-6"
          variants={staggerItem}
        >
          Gift Cards,
          <br />
          <span className="bg-gradient-blue bg-clip-text text-transparent">
            Delivered Instantly
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          className="text-body-xl text-surface-on-surface-variant max-w-2xl mx-auto mb-12"
          variants={staggerItem}
        >
          Thousands of brands. Worldwide delivery. No shipping, no waiting.
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          className="flex justify-center"
          variants={staggerItem}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="text-surface-on-surface-variant"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
```

#### 1.4.2 ProductCard Enhancement

**File:** `components/browse/ProductCard.tsx`

**Changes:**
- Add category-specific gradient accents
- Enhanced hover state with subtle tilt
- Loading skeleton with shimmer
- Category badge with category color
- Improved image container

```typescript
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils/currency'
import { Zap } from 'lucide-react'

interface ProductCardProps {
  product: GiftCardProduct
}

// Category color mapping
const categoryColors: Record<string, string> = {
  'Shopping': 'bg-category-shopping',
  'Entertainment': 'bg-category-entertainment',
  'Food & Dining': 'bg-category-food',
  'Travel': 'bg-category-travel',
  'Gaming': 'bg-category-gaming',
  'Lifestyle': 'bg-category-lifestyle',
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectedCountry } = useApp()
  
  const priceDisplay = product.denominationType === 'FIXED' && product.fixedDenominations
    ? `From ${formatCurrency(product.fixedDenominations[0].value, selectedCountry.currency)}`
    : product.denominationRange
    ? `${formatCurrency(product.denominationRange.min, selectedCountry.currency)} - ${formatCurrency(product.denominationRange.max, selectedCountry.currency)}`
    : ''
  
  const categoryColor = categoryColors[product.category] || 'bg-surface-container-high'
  
  return (
    <Link href={`/gift-card/${product.slug}`}>
      <motion.div
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={{
          rest: { scale: 1, y: 0 },
          hover: { 
            scale: 1.02, 
            y: -6,
            rotateX: 2,
            rotateY: 2,
            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
          },
          tap: { scale: 0.98 },
        }}
        className="group relative"
      >
        <div className="bg-white rounded-xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-shadow duration-300 border border-surface-container">
          {/* Category Accent Bar */}
          <div className={`h-1 ${categoryColor}`} />
          
          {/* Logo Container */}
          <div className="aspect-video bg-surface-container-low/30 flex items-center justify-center p-8 relative">
            {/* TODO: Replace with actual product logo */}
            <div className="w-32 h-32 rounded-2xl bg-white shadow-md flex items-center justify-center">
              <span className="text-headline-lg font-archivo font-extrabold text-primary">
                {product.brandName[0]}
              </span>
            </div>
            
            {/* Instant Delivery Badge */}
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-tertiary-fixed-dim/90 backdrop-blur-sm">
                <Zap className="w-3 h-3 text-tertiary-container" fill="currentColor" />
                <span className="text-label-sm text-tertiary-container">Instant</span>
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-archivo font-bold text-title-lg text-primary group-hover:text-secondary transition-colors">
                {product.brandName}
              </h3>
              <span className={`px-2.5 py-1 rounded-md text-label-sm ${categoryColor} text-white whitespace-nowrap`}>
                {product.category}
              </span>
            </div>
            
            <p className="text-body-md font-semibold text-surface-on-surface mb-2">
              {priceDisplay}
            </p>
            
            <div className="flex items-center gap-2 text-label-sm text-surface-on-surface-variant">
              <span>Digital delivery</span>
              <span>•</span>
              <span>~{product.estimatedDeliveryMinutes} min</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
```

#### 1.4.3 SearchBar Enhancement

**File:** `components/shared/SearchBar.tsx`

**Changes:**
- Add search icon animation
- Focus state with glowing ring
- Clear button with animation
- Search suggestions dropdown (structure only, no API)

```typescript
'use client'

import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search for brands...' }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className="relative">
      <div className={`
        relative flex items-center transition-all duration-300
        ${isFocused ? 'ring-2 ring-state-focus-ring ring-offset-2' : ''}
      `}>
        {/* Search Icon */}
        <div className="absolute left-4 pointer-events-none">
          <motion.div
            animate={isFocused ? { scale: 1.1, rotate: 90 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="w-5 h-5 text-surface-on-surface-variant" />
          </motion.div>
        </div>
        
        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-12 py-4 rounded-xl
            bg-white border border-surface-container
            text-body-lg text-primary placeholder:text-surface-on-surface-variant
            focus:outline-none focus:border-secondary
            transition-colors duration-200
          "
        />
        
        {/* Clear Button */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange('')}
              className="absolute right-4 p-1 rounded-full hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4 text-surface-on-surface-variant" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

#### 1.4.4 CategoryChips Enhancement

**File:** `components/shared/CategoryChips.tsx`

**Changes:**
- Add category-specific colors
- Icon support for each category
- Enhanced active state
- Horizontal scroll with gradient fade

```typescript
'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Film, Utensils, Plane, Gamepad2, Sparkles, Tag } from 'lucide-react'
import { chipHover } from '@/lib/animations/variants'

const categories = [
  { id: 'all', label: 'All Cards', icon: Tag, color: 'bg-primary' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'bg-category-shopping' },
  { id: 'entertainment', label: 'Entertainment', icon: Film, color: 'bg-category-entertainment' },
  { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'bg-category-food' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'bg-category-travel' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'bg-category-gaming' },
  { id: 'lifestyle', label: 'Lifestyle', icon: Sparkles, color: 'bg-category-lifestyle' },
]

interface CategoryChipsProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="relative">
      {/* Gradient Fade Left */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent pointer-events-none z-10" />
      
      {/* Scrollable Container */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 -mx-4">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = selected === category.id
          
          return (
            <motion.button
              key={category.id}
              onClick={() => onSelect(category.id)}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              variants={chipHover}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap
                transition-all duration-200 border
                ${isActive 
                  ? `${category.color} text-white border-transparent shadow-md` 
                  : 'bg-white text-primary border-surface-container hover:border-surface-container-high'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-label-md font-semibold">{category.label}</span>
            </motion.button>
          )
        })}
      </div>
      
      {/* Gradient Fade Right */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none z-10" />
    </div>
  )
}
```

---

## Part 2: Reloadly Integration Architecture

### 2.1 Authentication System

#### 2.1.1 Environment Configuration

**File:** `.env.local` (user creates from .env.example)

```bash
# Reloadly Credentials (from task)
RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV

# API Configuration
RELOADLY_API_URL=https://giftcards.reloadly.com
RELOADLY_AUTH_URL=https://auth.reloadly.com
RELOADLY_SANDBOX=false

# Token caching (optional, for development)
RELOADLY_TOKEN_CACHE_ENABLED=true
```

#### 2.1.2 OAuth2 Client Implementation

**File:** `lib/reloadly/auth.ts` (NEW)

```typescript
/**
 * Reloadly OAuth2 Authentication
 * 
 * Implements token lifecycle management:
 * - Token request
 * - Token caching
 * - Automatic refresh before expiry
 * - Error handling
 */

interface ReloadlyAuthResponse {
  access_token: string
  token_type: string
  expires_in: number // seconds
  scope: string
}

interface CachedToken {
  accessToken: string
  expiresAt: number // timestamp
}

class ReloadlyAuth {
  private static instance: ReloadlyAuth
  private cachedToken: CachedToken | null = null
  
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly authUrl: string
  private readonly audience: string
  
  private constructor() {
    this.clientId = process.env.RELOADLY_CLIENT_ID!
    this.clientSecret = process.env.RELOADLY_CLIENT_SECRET!
    this.authUrl = process.env.RELOADLY_AUTH_URL || 'https://auth.reloadly.com'
    this.audience = process.env.RELOADLY_API_URL || 'https://giftcards.reloadly.com'
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Reloadly credentials not configured. Set RELOADLY_CLIENT_ID and RELOADLY_CLIENT_SECRET in .env.local')
    }
  }
  
  static getInstance(): ReloadlyAuth {
    if (!ReloadlyAuth.instance) {
      ReloadlyAuth.instance = new ReloadlyAuth()
    }
    return ReloadlyAuth.instance
  }
  
  /**
   * Get valid access token (from cache or request new)
   */
  async getAccessToken(): Promise<string> {
    // Check if cached token is still valid (with 5 min buffer)
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 300000) {
      return this.cachedToken.accessToken
    }
    
    // Request new token
    return this.requestNewToken()
  }
  
  /**
   * Request new OAuth2 token from Reloadly
   */
  private async requestNewToken(): Promise<string> {
    try {
      const response = await fetch(`${this.authUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          audience: this.audience,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Reloadly auth failed: ${response.status} - ${errorData}`)
      }
      
      const data: ReloadlyAuthResponse = await response.json()
      
      // Cache token
      this.cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
      }
      
      return data.access_token
    } catch (error) {
      console.error('Reloadly authentication error:', error)
      throw new Error('Failed to authenticate with Reloadly API')
    }
  }
  
  /**
   * Force token refresh (useful for testing or after errors)
   */
  async refreshToken(): Promise<string> {
    this.cachedToken = null
    return this.requestNewToken()
  }
  
  /**
   * Clear cached token (logout)
   */
  clearToken(): void {
    this.cachedToken = null
  }
}

export const reloadlyAuth = ReloadlyAuth.getInstance()
```

### 2.2 API Client Implementation

#### 2.2.1 Base API Client

**File:** `lib/reloadly/client.ts` (NEW)

```typescript
import { reloadlyAuth } from './auth'

/**
 * Reloadly API Client
 * 
 * Handles all HTTP communication with Reloadly API:
 * - Automatic token injection
 * - Error handling
 * - Rate limiting
 * - Response parsing
 */

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  params?: Record<string, string | number | boolean>
}

class ReloadlyClient {
  private readonly baseUrl: string
  
  constructor() {
    this.baseUrl = process.env.RELOADLY_API_URL || 'https://giftcards.reloadly.com'
  }
  
  /**
   * Make authenticated request to Reloadly API
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params } = options
    
    // Get access token
    const accessToken = await reloadlyAuth.getAccessToken()
    
    // Build URL with query params
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }
    
    // Make request
    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      
      // Handle errors
      if (!response.ok) {
        await this.handleErrorResponse(response)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Reloadly API error [${method} ${endpoint}]:`, error)
      throw error
    }
  }
  
  /**
   * Handle API error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status
    let errorMessage = 'Reloadly API error'
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      errorMessage = await response.text()
    }
    
    // Handle specific error codes
    switch (status) {
      case 401:
        // Token invalid, refresh and retry
        await reloadlyAuth.refreshToken()
        throw new Error('Authentication failed. Please try again.')
        
      case 429:
        throw new Error('Rate limit exceeded. Please wait a moment.')
        
      case 400:
        throw new Error(`Invalid request: ${errorMessage}`)
        
      case 404:
        throw new Error('Resource not found')
        
      case 503:
        throw new Error('Service temporarily unavailable. Please try again later.')
        
      default:
        throw new Error(`${errorMessage} (Status: ${status})`)
    }
  }
  
  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }
  
  /**
   * POST request
   */
  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }
}

export const reloadlyClient = new ReloadlyClient()
```

### 2.3 Product Catalog Integration

#### 2.3.1 Reloadly Type Definitions

**File:** `lib/reloadly/types.ts` (NEW)

```typescript
/**
 * Reloadly API Response Types
 * Based on: https://developers.reloadly.com/#gift-cards-api
 */

export interface ReloadlyCountry {
  isoName: string
  name: string
  flagUrl: string
  currencyCode: string
  currencyName: string
  currencySymbol: string
}

export interface ReloadlyProduct {
  productId: number
  productName: string
  countryCode: string
  denominationType: 'FIXED' | 'RANGE'
  recipientCurrencyCode: string
  minRecipientDenomination: number | null
  maxRecipientDenomination: number | null
  senderFee: number
  discountPercentage: number
  fixedRecipientDenominations: number[] | null
  logoUrls: string[]
  brand: {
    brandId: number
    brandName: string
  }
  category: {
    id: number
    name: string
  }
  redeemInstruction: {
    concise: string
    verbose: string
  }
  global: boolean
}

export interface ReloadlyProductsResponse {
  content: ReloadlyProduct[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
}

export interface ReloadlyOrderRequest {
  productId: number
  countryCode: string
  quantity: number
  unitPrice: number
  customIdentifier: string
  senderName?: string
  recipientEmail?: string
  recipientPhoneDetails?: {
    countryCode: string
    phoneNumber: string
  }
}

export interface ReloadlyOrderResponse {
  transactionId: number
  amount: number
  discount: number
  currencyCode: string
  fee: number
  recipientEmail: string
  customIdentifier: string
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REFUNDED'
  product: {
    productId: number
    productName: string
    countryCode: string
    logoUrls: string[]
  }
  smsFee: number
  transactionCreatedTime: string
  pinDetail: {
    serial: string
    info1: string
    info2: string
    info3: string
    validity: string
  } | null
}
```

#### 2.3.2 Updated Reloadly Adapter

**File:** `lib/giftcards/reloadly-adapter.ts` (REPLACE EXISTING)

```typescript
import { reloadlyClient } from '@/lib/reloadly/client'
import { 
  ReloadlyProduct, 
  ReloadlyProductsResponse, 
  ReloadlyCountry,
  ReloadlyOrderRequest,
  ReloadlyOrderResponse,
} from '@/lib/reloadly/types'
import { GiftCardProduct, GiftCardFilters } from './types'

/**
 * Reloadly Gift Card API Adapter
 * 
 * Transforms Reloadly API data into our internal data models
 */

export class ReloadlyAdapter {
  
  /**
   * Fetch available countries from Reloadly
   */
  async getCountries(): Promise<ReloadlyCountry[]> {
    try {
      const countries = await reloadlyClient.get<ReloadlyCountry[]>('/countries')
      return countries
    } catch (error) {
      console.error('Failed to fetch Reloadly countries:', error)
      throw error
    }
  }
  
  /**
   * Fetch products by country
   */
  async getProductsByCountry(countryCode: string, page = 0, size = 200): Promise<GiftCardProduct[]> {
    try {
      const response = await reloadlyClient.get<ReloadlyProductsResponse>(
        `/countries/${countryCode}/products`,
        { page, size }
      )
      
      return response.content.map(this.mapToGiftCardProduct)
    } catch (error) {
      console.error(`Failed to fetch products for ${countryCode}:`, error)
      throw error
    }
  }
  
  /**
   * Fetch all products (use with caution, paginate for production)
   */
  async getAllProducts(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
    try {
      // If country filter is provided, use country-specific endpoint
      if (filters?.countryCode) {
        return this.getProductsByCountry(filters.countryCode)
      }
      
      // Otherwise fetch from general products endpoint
      const response = await reloadlyClient.get<ReloadlyProductsResponse>('/products', {
        page: 0,
        size: 200, // Adjust based on needs, implement pagination for large catalogs
      })
      
      let products = response.content.map(this.mapToGiftCardProduct)
      
      // Apply filters
      if (filters) {
        products = this.applyFilters(products, filters)
      }
      
      return products
    } catch (error) {
      console.error('Failed to fetch all products:', error)
      throw error
    }
  }
  
  /**
   * Fetch single product by ID
   */
  async getProductById(productId: number): Promise<GiftCardProduct> {
    try {
      const product = await reloadlyClient.get<ReloadlyProduct>(`/products/${productId}`)
      return this.mapToGiftCardProduct(product)
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error)
      throw error
    }
  }
  
  /**
   * Place an order (purchase gift card)
   */
  async placeOrder(orderData: ReloadlyOrderRequest): Promise<ReloadlyOrderResponse> {
    try {
      const order = await reloadlyClient.post<ReloadlyOrderResponse>('/orders', orderData)
      return order
    } catch (error) {
      console.error('Failed to place Reloadly order:', error)
      throw error
    }
  }
  
  /**
   * Get order details by transaction ID
   */
  async getOrderById(transactionId: number): Promise<ReloadlyOrderResponse> {
    try {
      const order = await reloadlyClient.get<ReloadlyOrderResponse>(`/orders/transactions/${transactionId}`)
      return order
    } catch (error) {
      console.error(`Failed to fetch order ${transactionId}:`, error)
      throw error
    }
  }
  
  /**
   * Map Reloadly product to internal GiftCardProduct model
   */
  private mapToGiftCardProduct(reloadlyProduct: ReloadlyProduct): GiftCardProduct {
    return {
      id: String(reloadlyProduct.productId),
      slug: this.generateSlug(reloadlyProduct.productName, reloadlyProduct.productId),
      brandName: reloadlyProduct.productName,
      category: this.mapCategory(reloadlyProduct.category?.name),
      logoUrl: reloadlyProduct.logoUrls?.[0] || '',
      countryCodes: [reloadlyProduct.countryCode],
      denominationType: reloadlyProduct.denominationType,
      fixedDenominations: reloadlyProduct.fixedRecipientDenominations?.map(value => ({
        value,
        label: `${reloadlyProduct.recipientCurrencyCode} ${value}`,
      })) || [],
      denominationRange: reloadlyProduct.minRecipientDenomination !== null ? {
        min: reloadlyProduct.minRecipientDenomination,
        max: reloadlyProduct.maxRecipientDenomination!,
        currency: reloadlyProduct.recipientCurrencyCode,
      } : undefined,
      currency: reloadlyProduct.recipientCurrencyCode,
      supportsCustomMessage: true,
      redemptionInstructions: reloadlyProduct.redeemInstruction?.concise || '',
      isDigital: true,
      estimatedDeliveryMinutes: 5,
      
      // Reloadly-specific fields
      reloadlyProductId: reloadlyProduct.productId,
      reloadlyFee: reloadlyProduct.senderFee,
      reloadlyDiscount: reloadlyProduct.discountPercentage,
    }
  }
  
  /**
   * Generate URL-safe slug from product name
   */
  private generateSlug(name: string, id: number): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    return `${slug}-${id}`
  }
  
  /**
   * Map Reloadly categories to internal categories
   */
  private mapCategory(reloadlyCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Retail': 'Shopping',
      'Entertainment': 'Entertainment',
      'Restaurant': 'Food & Dining',
      'Travel': 'Travel',
      'Gaming': 'Gaming',
      'Lifestyle': 'Lifestyle',
    }
    
    return categoryMap[reloadlyCategory] || 'Shopping'
  }
  
  /**
   * Apply client-side filters to products
   */
  private applyFilters(products: GiftCardProduct[], filters: GiftCardFilters): GiftCardProduct[] {
    let filtered = products
    
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase())
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.brandName.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }
}

// Export singleton instance
export const reloadlyAdapter = new ReloadlyAdapter()
```

### 2.4 Service Layer Updates

#### 2.4.1 Updated Gift Card Service

**File:** `lib/giftcards/service.ts` (UPDATE)

```typescript
import { GiftCardProduct, GiftCardFilters } from './types'
import { reloadlyAdapter } from './reloadly-adapter'
import { mockGiftCards } from './mock-data'

/**
 * Gift Card Service
 * 
 * Abstracts data source (Reloadly vs Mock)
 * Use environment variable to toggle
 */

const USE_RELOADLY = process.env.RELOADLY_CLIENT_ID && process.env.RELOADLY_CLIENT_SECRET

export class GiftCardService {
  
  /**
   * Get all gift cards with optional filters
   */
  async getGiftCards(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
    if (USE_RELOADLY) {
      return reloadlyAdapter.getAllProducts(filters)
    } else {
      // Fallback to mock data for development/testing
      console.warn('Using mock gift card data. Set RELOADLY_CLIENT_ID and RELOADLY_CLIENT_SECRET to use real data.')
      return this.getMockGiftCards(filters)
    }
  }
  
  /**
   * Get gift card by slug
   */
  async getGiftCardBySlug(slug: string): Promise<GiftCardProduct | null> {
    if (USE_RELOADLY) {
      // Extract product ID from slug (format: brand-name-123)
      const idMatch = slug.match(/-(\d+)$/)
      if (!idMatch) {
        throw new Error('Invalid product slug format')
      }
      
      const productId = parseInt(idMatch[1], 10)
      return reloadlyAdapter.getProductById(productId)
    } else {
      const cards = await this.getMockGiftCards()
      return cards.find(card => card.slug === slug) || null
    }
  }
  
  /**
   * Get available categories
   */
  async getCategories(): Promise<string[]> {
    const cards = await this.getGiftCards()
    const categories = new Set(cards.map(card => card.category))
    return Array.from(categories).sort()
  }
  
  /**
   * Mock data with client-side filtering
   */
  private async getMockGiftCards(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
    let cards = mockGiftCards
    
    if (filters) {
      if (filters.countryCode) {
        cards = cards.filter(card => card.countryCodes.includes(filters.countryCode!))
      }
      
      if (filters.category && filters.category !== 'all') {
        cards = cards.filter(card => card.category.toLowerCase() === filters.category!.toLowerCase())
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        cards = cards.filter(card => 
          card.brandName.toLowerCase().includes(term)
        )
      }
    }
    
    return cards
  }
}

export const giftCardService = new GiftCardService()
```

### 2.5 Order Placement Integration

#### 2.5.1 Order Service with Reloadly

**File:** `lib/orders/service.ts` (UPDATE)

```typescript
import { CreateOrderData, Order, OrderStatus } from './types'
import { reloadlyAdapter } from '@/lib/giftcards/reloadly-adapter'
import { ReloadlyOrderRequest } from '@/lib/reloadly/types'
import { mockOrderRepository } from './mock-repository'

const USE_RELOADLY = process.env.RELOADLY_CLIENT_ID && process.env.RELOADLY_CLIENT_SECRET

export class OrderService {
  
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    if (USE_RELOADLY) {
      return this.createReloadlyOrder(data)
    } else {
      console.warn('Using mock order system. Set RELOADLY credentials for real orders.')
      return this.createMockOrder(data)
    }
  }
  
  /**
   * Create order via Reloadly API
   */
  private async createReloadlyOrder(data: CreateOrderData): Promise<Order> {
    try {
      // Prepare Reloadly order request
      const reloadlyRequest: ReloadlyOrderRequest = {
        productId: parseInt(data.productId, 10),
        countryCode: data.countryCode,
        quantity: 1,
        unitPrice: data.amount,
        customIdentifier: `GIFTED-${Date.now()}`, // Our internal order ID
        recipientEmail: data.deliveryMethod === 'gift' ? data.recipientEmail! : data.customerEmail,
        senderName: data.deliveryMethod === 'gift' ? data.customerEmail : undefined,
      }
      
      // Place order with Reloadly
      const reloadlyOrder = await reloadlyAdapter.placeOrder(reloadlyRequest)
      
      // Map to our Order model
      const order: Order = {
        id: reloadlyOrder.customIdentifier,
        reloadlyTransactionId: reloadlyOrder.transactionId,
        productId: data.productId,
        productName: reloadlyOrder.product.productName,
        amount: data.amount,
        currency: reloadlyOrder.currencyCode,
        serviceFee: reloadlyOrder.fee,
        totalAmount: reloadlyOrder.amount + reloadlyOrder.fee,
        customerEmail: data.customerEmail,
        recipientEmail: data.deliveryMethod === 'gift' ? data.recipientEmail! : data.customerEmail,
        deliveryMethod: data.deliveryMethod,
        giftMessage: data.giftMessage,
        status: this.mapReloadlyStatus(reloadlyOrder.status),
        createdAt: new Date(reloadlyOrder.transactionCreatedTime),
        
        // Gift card details (if available)
        giftCardCode: reloadlyOrder.pinDetail?.info1,
        giftCardPin: reloadlyOrder.pinDetail?.info2,
        giftCardSerial: reloadlyOrder.pinDetail?.serial,
        redemptionInstructions: reloadlyOrder.pinDetail?.validity,
      }
      
      return order
    } catch (error) {
      console.error('Failed to create Reloadly order:', error)
      throw new Error('Order placement failed. Please try again or contact support.')
    }
  }
  
  /**
   * Map Reloadly order status to our status
   */
  private mapReloadlyStatus(reloadlyStatus: string): OrderStatus {
    switch (reloadlyStatus) {
      case 'SUCCESSFUL':
        return 'completed'
      case 'PENDING':
        return 'processing'
      case 'FAILED':
        return 'failed'
      case 'REFUNDED':
        return 'refunded'
      default:
        return 'processing'
    }
  }
  
  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    if (USE_RELOADLY) {
      // For Reloadly, we need to store orders in a database
      // This is a simplified version - in production, fetch from DB
      // and sync status from Reloadly if needed
      throw new Error('Order retrieval not implemented - requires database')
    } else {
      return mockOrderRepository.getById(orderId)
    }
  }
  
  /**
   * Fallback mock order creation
   */
  private async createMockOrder(data: CreateOrderData): Promise<Order> {
    return mockOrderRepository.create(data)
  }
}

export const orderService = new OrderService()
```

### 2.6 Frontend Integration

#### 2.6.1 Updated Home Page

**File:** `app/page.tsx` (UPDATE SERVER COMPONENT)

```typescript
import { Header } from '@/components/layout/Header'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/browse/HeroSection'
import { SearchAndFilters } from '@/components/browse/SearchAndFilters'
import { ProductGridWrapper } from '@/components/browse/ProductGridWrapper'
import { TrustSection } from '@/components/browse/TrustSection'
import { giftCardService } from '@/lib/giftcards/service'

export default async function HomePage() {
  // Fetch products server-side (uses Reloadly if configured)
  const products = await giftCardService.getGiftCards()
  
  return (
    <>
      <Header />
      
      <main className="min-h-screen pb-20 lg:pb-0">
        <HeroSection />
        
        <div className="container mx-auto px-4">
          <SearchAndFilters />
          <ProductGridWrapper initialProducts={products} />
          <TrustSection />
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </>
  )
}

// Enable ISR (revalidate every hour for product catalog)
export const revalidate = 3600
```

#### 2.6.2 Product Grid Client Component

**File:** `components/browse/ProductGridWrapper.tsx` (NEW CLIENT COMPONENT)

```typescript
'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { ProductCard } from './ProductCard'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { useApp } from '@/contexts/AppContext'

interface ProductGridWrapperProps {
  initialProducts: GiftCardProduct[]
}

export function ProductGridWrapper({ initialProducts }: ProductGridWrapperProps) {
  const { selectedCountry, searchTerm, selectedCategory } = useApp()
  
  // Client-side filtering
  const filteredProducts = useMemo(() => {
    let products = initialProducts
    
    // Filter by country
    products = products.filter(p => p.countryCodes.includes(selectedCountry.code))
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase())
    }
    
    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      products = products.filter(p => p.brandName.toLowerCase().includes(term))
    }
    
    return products
  }, [initialProducts, selectedCountry, selectedCategory, searchTerm])
  
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16"
    >
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <motion.div key={product.id} variants={staggerItem}>
            <ProductCard product={product} />
          </motion.div>
        ))
      ) : (
        <div className="col-span-full text-center py-16">
          <p className="text-headline-sm text-surface-on-surface-variant">
            No gift cards found for your selection
          </p>
          <p className="text-body-md text-surface-on-surface-variant mt-2">
            Try adjusting your filters or search term
          </p>
        </div>
      )}
    </motion.div>
  )
}
```

---

## Part 3: Testing & Validation

### 3.1 Playwright Visual Tests

**File:** `e2e/visual-enhancements.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Visual Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })
  
  test('Hero section has mesh gradient background', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toHaveCSS('background-image', /radial-gradient/)
  })
  
  test('Hero headline uses hero font size', async ({ page }) => {
    const headline = page.locator('h1').first()
    const fontSize = await headline.evaluate(el => window.getComputedStyle(el).fontSize)
    
    // Should use clamp() sizing (responsive)
    expect(parseInt(fontSize)).toBeGreaterThan(48) // At least 3rem on desktop
  })
  
  test('Product cards have hover animation', async ({ page }) => {
    const firstCard = page.locator('[href^="/gift-card/"]').first()
    const initialTransform = await firstCard.evaluate(el => window.getComputedStyle(el).transform)
    
    await firstCard.hover()
    await page.waitForTimeout(300) // Wait for animation
    
    const hoverTransform = await firstCard.evaluate(el => window.getComputedStyle(el).transform)
    expect(hoverTransform).not.toBe(initialTransform)
  })
  
  test('Category chips have category colors', async ({ page }) => {
    const shoppingChip = page.getByRole('button', { name: /shopping/i })
    await shoppingChip.click()
    
    await expect(shoppingChip).toHaveCSS('background-color', /rgb\(0, 81, 213\)/) // category-shopping color
  })
  
  test('Search bar has focus ring animation', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.focus()
    
    const parentDiv = searchInput.locator('..')
    await expect(parentDiv).toHaveCSS('ring-width', '2px')
  })
})
```

### 3.2 Reloadly Integration Tests

**File:** `e2e/reloadly-integration.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Reloadly Integration', () => {
  
  test.skip(!process.env.RELOADLY_CLIENT_ID, 'Reloadly credentials not configured')
  
  test('Products load from Reloadly API', async ({ page }) => {
    await page.goto('/')
    
    // Wait for products to load
    await page.waitForSelector('[href^="/gift-card/"]')
    
    const productCards = page.locator('[href^="/gift-card/"]')
    const count = await productCards.count()
    
    expect(count).toBeGreaterThan(0)
  })
  
  test('Product detail shows Reloadly data', async ({ page }) => {
    await page.goto('/')
    
    // Click first product
    const firstProduct = page.locator('[href^="/gift-card/"]').first()
    await firstProduct.click()
    
    // Should navigate to product detail
    await expect(page).toHaveURL(/\/gift-card\//)
    
    // Should show denomination options
    const amountSelector = page.locator('[data-testid="amount-selector"]')
    await expect(amountSelector).toBeVisible()
  })
  
  test('Country selector filters Reloadly products', async ({ page }) => {
    await page.goto('/')
    
    // Open country selector
    const countrySelector = page.getByRole('button', { name: /country/i }).first()
    await countrySelector.click()
    
    // Select a different country (e.g., UK)
    await page.getByRole('option', { name: /united kingdom/i }).click()
    
    // Products should reload
    await page.waitForTimeout(1000)
    
    // Verify products changed
    const productCards = page.locator('[href^="/gift-card/"]')
    const count = await productCards.count()
    
    expect(count).toBeGreaterThan(0)
  })
})
```

---

## Part 4: Deployment Configuration

### 4.1 Vercel Environment Variables

**Setup in Vercel Dashboard:**

```bash
# Production Environment Variables
RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV
RELOADLY_API_URL=https://giftcards.reloadly.com
RELOADLY_AUTH_URL=https://auth.reloadly.com
RELOADLY_SANDBOX=false

# Lemon Squeezy (existing)
LEMON_SQUEEZY_API_KEY=<from_dashboard>
# ... other existing vars
```

### 4.2 Next.js Build Optimization

**File:** `next.config.mjs` (UPDATE)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.reloadly.com',
        pathname: '/**',
      },
    ],
  },
  
  // Enable Incremental Static Regeneration
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
```

---

## Part 5: Documentation & Handoff

### 5.1 README Update

**File:** `README.md` (ADD SECTION)

```markdown
## Reloadly Integration

This project integrates with Reloadly's Gift Card API for product catalog and order fulfillment.

### Setup

1. **Get Reloadly Credentials**
   - Sign up at https://www.reloadly.com/
   - Create an application in the dashboard
   - Copy Client ID and Client Secret

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Reloadly credentials:
   ```bash
   RELOADLY_CLIENT_ID=your_client_id_here
   RELOADLY_CLIENT_SECRET=your_client_secret_here
   RELOADLY_SANDBOX=false # Use 'true' for testing
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   The app will automatically use Reloadly API if credentials are configured. Otherwise, it falls back to mock data.

### API Endpoints Used

- **Authentication:** `POST https://auth.reloadly.com/oauth/token`
- **Countries:** `GET https://giftcards.reloadly.com/countries`
- **Products:** `GET https://giftcards.reloadly.com/countries/{code}/products`
- **Product Detail:** `GET https://giftcards.reloadly.com/products/{id}`
- **Place Order:** `POST https://giftcards.reloadly.com/orders`
- **Order Status:** `GET https://giftcards.reloadly.com/orders/transactions/{id}`

### Architecture

- **Authentication:** Token-based OAuth2 with automatic refresh (`lib/reloadly/auth.ts`)
- **API Client:** Centralized HTTP client with error handling (`lib/reloadly/client.ts`)
- **Adapter:** Maps Reloadly data to internal models (`lib/giftcards/reloadly-adapter.ts`)
- **Service Layer:** Abstracts data source, toggled by environment variables (`lib/giftcards/service.ts`)

### Testing

Run E2E tests:
```bash
npm run test:e2e
```

Visual tests:
```bash
npm run test:e2e:ui
```

### Deployment

Deploy to Vercel:
```bash
vercel --prod
```

**Important:** Set environment variables in Vercel dashboard before deploying.
```

---

## Part 6: Implementation Checklist

### 6.1 UI Enhancement Tasks

- [ ] **Typography**
  - [ ] Update `app/layout.tsx` with Archivo + Inter variable fonts
  - [ ] Download Playfair Display fonts to `public/fonts/`
  - [ ] Update `tailwind.config.ts` with new font families and sizes
  - [ ] Test responsive type scaling on mobile/desktop

- [ ] **Colors**
  - [ ] Add accent colors to `tailwind.config.ts`
  - [ ] Add category colors
  - [ ] Add gradient utilities
  - [ ] Add state colors (hover, focus, etc.)

- [ ] **Animations**
  - [ ] Create `lib/animations/variants.ts` with all variants
  - [ ] Create `lib/animations/useScrollAnimation.ts` hook
  - [ ] Create `components/shared/PageTransition.tsx`
  - [ ] Update `app/layout.tsx` to wrap children with PageTransition

- [ ] **Component Updates**
  - [ ] Update `HeroSection.tsx` with mesh gradient + animations
  - [ ] Update `ProductCard.tsx` with enhanced hover + category colors
  - [ ] Update `SearchBar.tsx` with focus animations
  - [ ] Update `CategoryChips.tsx` with icons + colors + scroll fade

### 6.2 Reloadly Integration Tasks

- [ ] **Authentication**
  - [ ] Create `lib/reloadly/auth.ts` with OAuth2 client
  - [ ] Test token request/refresh/caching
  - [ ] Add error handling for auth failures

- [ ] **API Client**
  - [ ] Create `lib/reloadly/client.ts` with base HTTP client
  - [ ] Implement GET/POST methods
  - [ ] Implement error handling (401, 429, 400, 503)
  - [ ] Test rate limiting behavior

- [ ] **Type Definitions**
  - [ ] Create `lib/reloadly/types.ts` with all Reloadly response types
  - [ ] Update `lib/giftcards/types.ts` with Reloadly-specific fields

- [ ] **Adapter**
  - [ ] Update `lib/giftcards/reloadly-adapter.ts` with full implementation
  - [ ] Implement `getCountries()`
  - [ ] Implement `getProductsByCountry()`
  - [ ] Implement `getAllProducts()`
  - [ ] Implement `getProductById()`
  - [ ] Implement `placeOrder()`
  - [ ] Implement `getOrderById()`
  - [ ] Test data mapping

- [ ] **Service Layer**
  - [ ] Update `lib/giftcards/service.ts` to use Reloadly adapter
  - [ ] Update `lib/orders/service.ts` with Reloadly order placement
  - [ ] Add environment variable toggle
  - [ ] Test fallback to mock data

- [ ] **Frontend**
  - [ ] Update `app/page.tsx` for server-side product fetching
  - [ ] Create `ProductGridWrapper.tsx` for client-side filtering
  - [ ] Add ISR revalidation
  - [ ] Test product loading from Reloadly

### 6.3 Testing Tasks

- [ ] **E2E Tests**
  - [ ] Create `e2e/visual-enhancements.spec.ts`
  - [ ] Create `e2e/reloadly-integration.spec.ts`
  - [ ] Test all major user flows
  - [ ] Test mobile + desktop viewports

- [ ] **Manual Testing**
  - [ ] Test hero animations
  - [ ] Test product card hovers
  - [ ] Test category filtering
  - [ ] Test search functionality
  - [ ] Test Reloadly product loading
  - [ ] Test order placement (sandbox mode)

### 6.4 Deployment Tasks

- [ ] **Environment Setup**
  - [ ] Copy `.env.example` to `.env.local`
  - [ ] Add Reloadly credentials
  - [ ] Test local development

- [ ] **Vercel Configuration**
  - [ ] Set environment variables in Vercel dashboard
  - [ ] Configure domain (if needed)
  - [ ] Test production build locally
  - [ ] Deploy to production

- [ ] **Documentation**
  - [ ] Update README.md with Reloadly setup instructions
  - [ ] Document environment variables
  - [ ] Document API architecture
  - [ ] Document testing procedures

---

## Part 7: Success Criteria

### 7.1 Visual Quality

✅ **Typography**
- [ ] Hero uses clamp() sizing (48px-112px range)
- [ ] Headlines use Archivo with proper weights (600-900)
- [ ] Body text uses Inter with good readability
- [ ] Type scale is consistent across breakpoints

✅ **Color**
- [ ] Category chips show category-specific colors
- [ ] Gradients are subtle and tasteful
- [ ] Hover states are clear and responsive
- [ ] Contrast meets WCAG AA standards

✅ **Animation**
- [ ] Page transitions are smooth (400ms)
- [ ] Card hovers feel responsive (200ms)
- [ ] Scroll animations trigger at correct threshold
- [ ] No janky or stuttering animations

✅ **Components**
- [ ] Hero section is visually stunning
- [ ] Product cards have depth and interactivity
- [ ] Search bar has clear focus state
- [ ] Category chips are easy to use on mobile

### 7.2 Functional Requirements

✅ **Reloadly Integration**
- [ ] Products load from Reloadly API
- [ ] Country selector filters products correctly
- [ ] Product detail shows accurate Reloadly data
- [ ] Order placement creates Reloadly order
- [ ] Error handling works for all failure cases

✅ **Performance**
- [ ] Initial page load < 2s (measured in Vercel)
- [ ] ISR caching works (products cached for 1 hour)
- [ ] Animations run at 60fps
- [ ] Mobile performance is smooth

✅ **Testing**
- [ ] All Playwright tests pass
- [ ] Visual regression tests pass (if using)
- [ ] Manual testing checklist completed
- [ ] No console errors in production

### 7.3 User Experience

✅ **Desktop**
- [ ] Hero is impactful and engaging
- [ ] Product grid is well-spaced
- [ ] Hover states are clear
- [ ] Navigation is intuitive

✅ **Mobile**
- [ ] Hero fits viewport without scrolling
- [ ] Category chips scroll smoothly
- [ ] Product cards are thumb-friendly
- [ ] Bottom nav is accessible

---

## Conclusion

This architecture provides:

1. **Comprehensive UI Enhancement** - Modern typography, vibrant colors, smooth animations
2. **Full Reloadly Integration** - OAuth2 auth, product catalog, order placement
3. **Maintainable Code** - Clear separation of concerns, type safety, error handling
4. **Production Ready** - ISR caching, environment variable management, testing suite

**Next Steps:**
1. CODER implements all components and integrations
2. TESTER validates against this specification
3. REVIEWER performs final UX/visual QA
4. Deploy to Vercel production

---

**End of Architecture Specification**
