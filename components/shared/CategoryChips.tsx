'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Film, Utensils, Plane, Gamepad2, Heart, Grid3x3 } from 'lucide-react';

interface CategoryChipsProps {
  categories: string[];
}

// Category Icon & Color Mapping
const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  all: {
    icon: Grid3x3,
    color: 'text-primary',
    bg: 'bg-primary hover:bg-primary/90',
  },
  shopping: {
    icon: ShoppingBag,
    color: 'text-category-shopping',
    bg: 'bg-category-shopping hover:bg-category-shopping/90',
  },
  entertainment: {
    icon: Film,
    color: 'text-category-entertainment',
    bg: 'bg-category-entertainment hover:bg-category-entertainment/90',
  },
  food: {
    icon: Utensils,
    color: 'text-category-food',
    bg: 'bg-category-food hover:bg-category-food/90',
  },
  travel: {
    icon: Plane,
    color: 'text-category-travel',
    bg: 'bg-category-travel hover:bg-category-travel/90',
  },
  gaming: {
    icon: Gamepad2,
    color: 'text-category-gaming',
    bg: 'bg-category-gaming hover:bg-category-gaming/90',
  },
  lifestyle: {
    icon: Heart,
    color: 'text-category-lifestyle',
    bg: 'bg-category-lifestyle hover:bg-category-lifestyle/90',
  },
};

export function CategoryChips({ categories }: CategoryChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* Gradient Fade Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Scrollable Container */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide px-4 sm:px-6">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          const categoryKey = category.toLowerCase();
          const config = categoryConfig[categoryKey] || categoryConfig.all;
          const Icon = config.icon;

          return (
            <motion.button
              key={category}
              onClick={() => handleCategoryClick(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium uppercase tracking-[0.5px] whitespace-nowrap
                transition-all duration-200 shadow-sm
                ${
                  isActive
                    ? `${config.bg} text-white`
                    : `bg-white border border-outline-variant text-surface-on-surface hover:bg-surface-container-low hover:border-outline-variant`
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : config.color}`} />
              {category}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
