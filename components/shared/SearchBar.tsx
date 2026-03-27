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
    <div className="w-full max-w-[540px] mx-auto px-4">
      <div className="relative flex items-center bg-white border border-[#D0D5DD] rounded-full h-[52px] pr-1">
        <Search className="absolute left-5 h-5 w-5 text-[#9CA3AF] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search brands..."
          className="flex-1 pl-12 pr-2 bg-transparent text-[15px] text-surface-on-surface placeholder:text-[#9CA3AF] focus:outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="mr-2 p-1 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <X className="h-4 w-4 text-surface-on-surface-variant" />
          </button>
        )}
        <button
          onClick={() => query && handleSearch(query)}
          className="px-6 h-[44px] bg-primary text-white rounded-full text-[13px] font-medium uppercase tracking-[0.5px] hover:bg-primary/90 transition-colors"
        >
          SEARCH
        </button>
      </div>
    </div>
  )
}
