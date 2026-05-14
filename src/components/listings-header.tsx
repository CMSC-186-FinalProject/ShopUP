'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'

interface ListingsHeaderProps {
  onSearch: (query: string) => void
  onSortChange: (sort: string) => void
  itemCount: number
  mobileFilterOpen?: boolean
  onMobileFilterToggle?: () => void
}

export function ListingsHeader({
  onSearch,
  onSortChange,
  itemCount,
  mobileFilterOpen,
  onMobileFilterToggle,
}: ListingsHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  return (
    <div className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Browse Items
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {itemCount} items available for sale
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for textbooks, electronics, clothing..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            onChange={(e) => onSortChange(e.target.value)}
            defaultValue="newest"
            className="px-4 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>

          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={onMobileFilterToggle}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
