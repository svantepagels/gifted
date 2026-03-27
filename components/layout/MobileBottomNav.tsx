'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, User } from 'lucide-react'
import { motion } from 'framer-motion'

export function MobileBottomNav() {
  const pathname = usePathname()
  
  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/?q=' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart' },
    { icon: User, label: 'Account', href: '/account' },
  ]
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full ${isActive ? 'bg-secondary/10' : ''}`}
              >
                <Icon 
                  className={`h-5 w-5 ${isActive ? 'text-secondary' : 'text-surface-on-surface-variant'}`} 
                />
              </motion.div>
              <span className={`text-label-sm ${isActive ? 'text-secondary' : 'text-surface-on-surface-variant'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
