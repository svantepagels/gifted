'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

interface CategoryChipsProps {
  categories: string[]
}

export function CategoryChips({ categories }: CategoryChipsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category') || 'All'
  
  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (category === 'All') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    
    router.push(`/?${params.toString()}`)
  }
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isActive = category === activeCategory
        
        return (
          <motion.button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`
              px-6 py-2 rounded-full text-label-lg whitespace-nowrap
              transition-colors duration-200
              ${isActive
                ? 'bg-primary text-surface-container-lowest'
                : 'bg-surface-container-low text-surface-on-surface hover:bg-surface-container'
              }
            `}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        )
      })}
    </div>
  )
}
