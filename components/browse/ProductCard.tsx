'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GiftCardProduct } from '@/lib/giftcards/types';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/utils/currency';
import { cardHover } from '@/lib/animations/variants';
import {
  Zap,
  ShoppingBag,
  Film,
  Utensils,
  Plane,
  Gamepad2,
  Heart,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n/useLocale';
import { getMessages, t, type Messages } from '@/lib/i18n/useMessages';
import { localeHref } from '@/lib/i18n/href';

interface ProductCardProps {
  product: GiftCardProduct;
  index?: number;
}

// Category Icon Mapping
const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  media: Film,
  food: Utensils,
  travel: Plane,
  gaming: Gamepad2,
  lifestyle: Heart,
};

// Category Color Mapping (Tailwind classes)
const categoryColors: Record<
  string,
  { bg: string; text: string; gradient: string }
> = {
  shopping: {
    bg: 'bg-category-shopping/10',
    text: 'text-category-shopping',
    gradient: 'from-category-shopping to-blue-400',
  },
  media: {
    bg: 'bg-category-entertainment/10',
    text: 'text-category-entertainment',
    gradient: 'from-category-entertainment to-purple-400',
  },
  food: {
    bg: 'bg-category-food/10',
    text: 'text-category-food',
    gradient: 'from-category-food to-orange-400',
  },
  travel: {
    bg: 'bg-category-travel/10',
    text: 'text-category-travel',
    gradient: 'from-category-travel to-cyan-400',
  },
  gaming: {
    bg: 'bg-category-gaming/10',
    text: 'text-category-gaming',
    gradient: 'from-category-gaming to-pink-400',
  },
  lifestyle: {
    bg: 'bg-category-lifestyle/10',
    text: 'text-category-lifestyle',
    gradient: 'from-category-lifestyle to-green-400',
  },
};

function categoryDisplayLabel(category: string, m: Messages): string {
  const key = category.toLowerCase();
  switch (key) {
    case 'shopping':
      return m['categories.shopping'];
    case 'media':
      return m['categories.media'];
    case 'food':
      return m['categories.food'];
    case 'travel':
      return m['categories.travel'];
    case 'gaming':
      return m['categories.gaming'];
    case 'lifestyle':
      return m['categories.lifestyle'];
    default:
      return category;
  }
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { selectedCountry } = useApp();
  const locale = useLocale();
  const m = getMessages(locale);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(product.logoUrl) && !logoFailed;

  // Get the first available denomination or range minimum
  const priceDisplay =
    product.denominationType === 'FIXED' && product.fixedDenominations
      ? `${m['product.from']} ${formatCurrency(
          product.fixedDenominations[0].value,
          selectedCountry.currency
        )}`
      : product.denominationRange
      ? t(m, 'product.range', {
          min: formatCurrency(
            product.denominationRange.min,
            selectedCountry.currency
          ),
          max: formatCurrency(
            product.denominationRange.max,
            selectedCountry.currency
          ),
        })
      : '';

  // Get category styling
  const category = product.category.toLowerCase();
  const categoryStyle = categoryColors[category] || categoryColors.shopping;
  const CategoryIcon = categoryIcons[category] || ShoppingBag;

  return (
    <Link href={localeHref(locale, `/gift-card/${product.slug}`)}>
      <motion.div
        variants={cardHover}
        initial="initial"
        whileHover="hover"
        className="group h-full"
      >
        <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-all duration-300 h-full flex flex-col">
          {/* Category Gradient Accent Bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryStyle.gradient}`}
          />

          {/* Instant Delivery Badge */}
          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
              <Zap className="w-3.5 h-3.5 text-accent-purple fill-accent-purple" />
              <span className="text-[11px] font-medium text-primary">
                Instant
              </span>
            </div>
          </div>

          {/* Logo Container */}
          <div className="aspect-video bg-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Subtle gradient overlay on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${categoryStyle.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <div className="relative w-full h-full flex items-center justify-center">
              {showLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.logoUrl}
                  alt={`${product.brandName} logo`}
                  loading="lazy"
                  onError={() => setLogoFailed(true)}
                  className="max-w-[88px] max-h-[88px] object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                /* Fallback: gradient chip with the brand initial */
                <div
                  className={`w-24 h-24 rounded-lg bg-gradient-to-br ${categoryStyle.gradient} flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-ambient`}
                >
                  <span className="font-archivo font-black text-3xl text-white">
                    {product.brandName[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Category Badge with Icon */}
            <div className="mb-2 flex items-start">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${categoryStyle.bg} whitespace-nowrap`}
              >
                <CategoryIcon
                  className={`w-3.5 h-3.5 ${categoryStyle.text} flex-shrink-0`}
                />
                <span
                  className={`text-[11px] font-medium ${categoryStyle.text}`}
                >
                  {categoryDisplayLabel(product.category, m)}
                </span>
              </div>
            </div>

            {/* Brand Name */}
            <h3 className="font-archivo text-title-lg text-surface-on-surface group-hover:text-secondary transition-colors duration-300 font-semibold mb-3">
              {product.brandName}
            </h3>

            {/* Price Display */}
            <p className="text-headline-sm font-archivo text-primary mb-3">
              {priceDisplay}
            </p>

            {/* Delivery Info */}
            <div className="mt-auto flex items-center gap-3 text-label-md text-surface-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${categoryStyle.text}`}
                />
                <span>Digital delivery</span>
              </div>
              <span className="text-surface-on-surface-variant/40">•</span>
              <span>~5 min</span>
            </div>
          </div>

          {/* Hover Border Effect */}
          <div
            className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-current ${categoryStyle.text} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}
          />
        </div>
      </motion.div>
    </Link>
  );
}
