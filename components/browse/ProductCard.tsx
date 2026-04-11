'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GiftCardProduct } from '@/lib/giftcards/types';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/utils/currency';
import { cardHover } from '@/lib/animations/variants';
import { Zap, ShoppingBag, Film, Utensils, Plane, Gamepad2, Heart } from 'lucide-react';

interface ProductCardProps {
  product: GiftCardProduct;
  index?: number;
}

// Category Icon Mapping
const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  entertainment: Film,
  food: Utensils,
  travel: Plane,
  gaming: Gamepad2,
  lifestyle: Heart,
};

// Category Color Mapping (Tailwind classes)
const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  shopping: {
    bg: 'bg-category-shopping/10',
    text: 'text-category-shopping',
    gradient: 'from-category-shopping to-blue-400',
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
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { selectedCountry } = useApp();

  // Get the first available denomination or range minimum
  const priceDisplay =
    product.denominationType === 'FIXED' && product.fixedDenominations
      ? `From ${formatCurrency(product.fixedDenominations[0].value, selectedCountry.currency)}`
      : product.denominationRange
      ? `${formatCurrency(product.denominationRange.min, selectedCountry.currency)} - ${formatCurrency(product.denominationRange.max, selectedCountry.currency)}`
      : '';

  // Get category styling
  const category = product.category.toLowerCase();
  const categoryStyle = categoryColors[category] || categoryColors.shopping;
  const CategoryIcon = categoryIcons[category] || ShoppingBag;

  return (
    <Link href={`/gift-card/${product.slug}`}>
      <motion.div
        variants={cardHover}
        initial="initial"
        whileHover="hover"
        className="group h-full"
      >
        <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-all duration-300 h-full flex flex-col">
          {/* Category Gradient Accent Bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryStyle.gradient}`} />

          {/* Instant Delivery Badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
              <Zap className="w-3.5 h-3.5 text-accent-purple fill-accent-purple" />
              <span className="text-[11px] font-medium text-primary">Instant</span>
            </div>
          </div>

          {/* Logo Container */}
          <div className="aspect-video bg-surface-container flex items-center justify-center p-8 relative overflow-hidden">
            {/* Subtle gradient overlay on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${categoryStyle.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />
            
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Placeholder for logo - in production would use Next Image */}
              <div className="w-24 h-24 rounded-lg bg-surface-container-low flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <span className="text-headline-sm font-archivo text-surface-on-surface-variant">
                  {product.brandName[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Brand Name & Category */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-archivo text-title-lg text-surface-on-surface group-hover:text-secondary transition-colors duration-300 font-semibold">
                {product.brandName}
              </h3>
              
              {/* Category Badge with Icon */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${categoryStyle.bg}`}>
                <CategoryIcon className={`w-3.5 h-3.5 ${categoryStyle.text}`} />
                <span className={`text-[11px] font-medium ${categoryStyle.text} capitalize`}>
                  {product.category}
                </span>
              </div>
            </div>

            {/* Price Display */}
            <p className="text-headline-sm font-archivo text-primary mb-3">
              {priceDisplay}
            </p>

            {/* Delivery Info */}
            <div className="mt-auto flex items-center gap-3 text-label-md text-surface-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${categoryStyle.text}`} />
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
