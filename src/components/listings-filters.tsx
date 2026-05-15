'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { fetchApi } from '@/src/lib/api'

interface ListingsFiltersProps {
  onFiltersChange: (filters: any) => void
  initialCategorySlugs?: string[]
  activeFilters?: {
    conditions: string[]
    categories: string[]
    priceRange: [number, number]
  }
}

interface CategoryItem {
  id: number
  name: string
  count: number
}

type FilterSection = 'categories' | 'price' | 'condition'

function normalizeCategorySlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function ListingsFilters({ onFiltersChange, initialCategorySlugs = [], activeFilters }: ListingsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    condition: true,
  })

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const response = await fetchApi<{ data: Array<{ id: number; name: string; count: number }> }>('/api/categories')

        if (isMounted) {
          setCategories(response.data)

          if (initialCategorySlugs.length > 0) {
            const matchedCategoryNames = response.data
              .filter((category) =>
                initialCategorySlugs.includes(
                  category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                )
              )
              .map((category) => category.name)

            if (matchedCategoryNames.length > 0) {
              setSelectedCategories(matchedCategoryNames)
            }
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [initialCategorySlugs])

  // Sync local UI when parent updates filters (e.g., Clear all filters)
  useEffect(() => {
    if (!activeFilters) return

    setSelectedConditions(activeFilters.conditions ?? [])
    setSelectedCategories(activeFilters.categories ?? [])
    setPriceRange(activeFilters.priceRange ?? [0, 50000])
  }, [activeFilters])

  const conditions = [
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'for-parts', label: 'For Parts' },
  ]

  const toggleSection = (section: FilterSection) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleCondition = (value: string) => {
    const updated = selectedConditions.includes(value)
      ? selectedConditions.filter((c) => c !== value)
      : [...selectedConditions, value]

    setSelectedConditions(updated)
    onFiltersChange({ conditions: updated, categories: selectedCategories, priceRange })
  }

  const updateCategoryQuery = (categorySlug?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }

    const queryString = params.toString()
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }

  const toggleCategory = (name: string) => {
    const updated = selectedCategories.includes(name)
      ? selectedCategories.filter((c) => c !== name)
      : [...selectedCategories, name]

    setSelectedCategories(updated)
    onFiltersChange({ conditions: selectedConditions, categories: updated, priceRange })

    if (selectedCategories.includes(name)) {
      const nextCategory = updated[0]
      updateCategoryQuery(nextCategory ? normalizeCategorySlug(nextCategory) : undefined)
    } else {
      updateCategoryQuery(normalizeCategorySlug(name))
    }
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onFiltersChange({ conditions: selectedConditions, categories: selectedCategories, priceRange: value as [number, number] })
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
              updateCategoryQuery(undefined)
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
          isLoadingCategories ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
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
          )
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
