'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])
  
  const handleSearch = (value: string) => {
    setQuery(value)
    const params = new URLSearchParams(searchParams.toString())
    
    if (value.trim()) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    
    router.push(`/?${params.toString()}`)
  }
  
  const handleClear = () => {
    setQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`/?${params.toString()}`)
  }
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-on-surface-variant" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search gift cards..."
        className="w-full pl-12 pr-12 py-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-surface-on-surface text-body-lg placeholder:text-surface-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-container-low transition-colors"
        >
          <X className="h-4 w-4 text-surface-on-surface-variant" />
        </button>
      )}
    </div>
  )
}
