'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { GiftCardProduct } from '@/lib/giftcards/types';
import { useApp } from '@/contexts/AppContext';
import { formatCurrencyForLocale } from '@/lib/i18n/format-currency';
import {
  ShoppingBag,
  Film,
  Utensils,
  Plane,
  Gamepad2,
  Heart,
  Sparkles,
  Cpu,
  MoreHorizontal,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n/useLocale';
import { getMessages, t } from '@/lib/i18n/useMessages';
import { localeHref } from '@/lib/i18n/href';
import { categoryDisplayLabel } from '@/lib/i18n/category-label';

interface ProductCardProps {
  product: GiftCardProduct;
  index?: number;
  /** When true, render the logo with `priority` and `loading=eager`. Used for the first ~6 above-the-fold cards. */
  priority?: boolean;
}

// Category Icon Mapping
const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  media: Film,
  entertainment: Film,
  food: Utensils,
  travel: Plane,
  gaming: Gamepad2,
  lifestyle: Heart,
  beauty: Sparkles,
  tech: Cpu,
  other: MoreHorizontal,
};

// Category Color Mapping (Tailwind classes). Falls back to "shopping" for unknown.
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
  entertainment: {
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
  beauty: {
    bg: 'bg-category-lifestyle/10',
    text: 'text-category-lifestyle',
    gradient: 'from-category-lifestyle to-pink-400',
  },
  tech: {
    bg: 'bg-category-shopping/10',
    text: 'text-category-shopping',
    gradient: 'from-category-shopping to-indigo-400',
  },
  other: {
    bg: 'bg-category-shopping/10',
    text: 'text-category-shopping',
    gradient: 'from-category-shopping to-slate-400',
  },
};

export function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const { selectedCountry } = useApp();
  const locale = useLocale();
  const m = getMessages(locale);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(product.logoUrl) && !logoFailed;

  const fmt = (n: number) =>
    formatCurrencyForLocale(n, selectedCountry.currency, locale);

  // Get the first available denomination or range minimum
  const priceDisplay =
    product.denominationType === 'FIXED' && product.fixedDenominations
      ? `${m['product.from']} ${fmt(product.fixedDenominations[0].value)}`
      : product.denominationRange
      ? t(m, 'product.range', {
          min: fmt(product.denominationRange.min),
          max: fmt(product.denominationRange.max),
        })
      : '';

  // Get category styling
  const category = product.category.toLowerCase();
  const categoryStyle = categoryColors[category] || categoryColors.shopping;
  const CategoryIcon = categoryIcons[category] || ShoppingBag;

  return (
    <Link href={localeHref(locale, `/gift-card/${product.slug}`)}>
      <div
        className="group h-full animate-card-in"
        style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
      >
        <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-all duration-300 h-full flex flex-col">
          {/* Category Gradient Accent Bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryStyle.gradient}`}
          />

          {/* Logo Container */}
          <div className="aspect-video bg-white flex items-center justify-center p-6 relative overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${categoryStyle.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <div className="relative w-full h-full flex items-center justify-center">
              {showLogo ? (
                <Image
                  src={product.logoUrl as string}
                  alt={`${product.brandName} logo`}
                  width={88}
                  height={88}
                  sizes="(min-width: 1280px) 96px, (min-width: 768px) 128px, 30vw"
                  priority={priority}
                  loading={priority ? 'eager' : 'lazy'}
                  onError={() => setLogoFailed(true)}
                  className="max-w-[88px] max-h-[88px] w-auto h-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
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
                <span>{m['browse.productCard.digitalDelivery']}</span>
              </div>
              <span className="text-surface-on-surface-variant/40">•</span>
              <span>{m['browse.productCard.instant']}</span>
            </div>
          </div>

          {/* Hover Border Effect */}
          <div
            className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-current ${categoryStyle.text} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}
          />
        </div>
      </div>
    </Link>
  );
}
