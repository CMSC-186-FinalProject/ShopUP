'use client'

import { ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'

interface ListingsFiltersProps {
  onFiltersChange: (filters: any) => void
}

export function ListingsFilters({ onFiltersChange }: ListingsFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    condition: true,
  })

  const categories = [
    { name: 'Textbooks', count: 234 },
    { name: 'Electronics', count: 156 },
    { name: 'Clothing', count: 312 },
    { name: 'Furniture', count: 89 },
    { name: 'School Supplies', count: 145 },
    { name: 'Sports Equipment', count: 67 },
  ]

  const conditions = [
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ]

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleCondition = (value: string) => {
    setSelectedConditions((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
      onFiltersChange({ conditions: updated, categories: selectedCategories, priceRange })
      return updated
    })
  }

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(name)
        ? prev.filter((c) => c !== name)
        : [...prev, name]
      onFiltersChange({ conditions: selectedConditions, categories: updated, priceRange })
      return updated
    })
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onFiltersChange({ conditions: selectedConditions, categories: selectedCategories, priceRange: value })
  }

  const hasActiveFilters = selectedConditions.length > 0 || selectedCategories.length > 0

  return (
    <div className="w-full md:w-64 bg-card rounded-lg p-6 border border-border h-fit sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedConditions([])
              setSelectedCategories([])
              setPriceRange([0, 50000])
              onFiltersChange({ conditions: [], categories: [], priceRange: [0, 50000] })
            }}
            className="text-xs text-primary hover:text-primary/80"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Categories Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors"
        >
          <h4 className="font-semibold text-sm text-foreground">Category</h4>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              expandedSections.categories ? '' : '-rotate-90'
            }`}
          />
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.name} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => toggleCategory(category.name)}
                  className="rounded border-border text-primary"
                />
                <span className="text-sm text-foreground">{category.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  ({category.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors"
        >
          <h4 className="font-semibold text-sm text-foreground">Price Range</h4>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              expandedSections.price ? '' : '-rotate-90'
            }`}
          />
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="50000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-primary"
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">₱</span>
              <span className="font-semibold text-foreground">0</span>
              <span className="text-muted-foreground">-</span>
              <span className="font-semibold text-foreground">
                ₱{priceRange[1].toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Condition Section */}
      <div>
        <button
          onClick={() => toggleSection('condition')}
          className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors"
        >
          <h4 className="font-semibold text-sm text-foreground">Condition</h4>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              expandedSections.condition ? '' : '-rotate-90'
            }`}
          />
        </button>
        {expandedSections.condition && (
          <div className="space-y-2">
            {conditions.map((condition) => (
              <label key={condition.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(condition.value)}
                  onChange={() => toggleCondition(condition.value)}
                  className="rounded border-border text-primary"
                />
                <span className="text-sm text-foreground">{condition.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
