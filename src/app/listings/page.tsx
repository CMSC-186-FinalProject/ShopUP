'use client'

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { ListingsHeader } from '@/src/components/listings-header'
import { ListingsFilters } from '@/src/components/listings-filters'
import { ProductCard } from '@/src/components/product-card'
import { fetchApi } from '@/src/lib/api'

interface ListingRow {
  id: string
  title: string
  price: number
  description: string | null
  condition: 'like_new' | 'good' | 'fair' | 'for_parts'
  location: string | null
  campus: string | null
  seller_rating: number | null
  seller: {
    id: string
    full_name: string | null
    username: string | null
  } | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  images: Array<{ image_url: string }>
  created_at: string
}

function formatCondition(condition: ListingRow['condition']) {
  if (condition === 'for_parts') {
    return 'for-parts' as const
  }

  if (condition === 'like_new') {
    return 'like-new' as const
  }

  return condition
}

function getFirstImage(listing: ListingRow) {
  return listing.images[0]?.image_url ?? '/placeholder.svg'
}

function getSellerName(listing: ListingRow) {
  return listing.seller?.full_name ?? listing.seller?.username ?? 'Unknown seller'
}

function getLocation(listing: ListingRow) {
  return listing.location ?? listing.campus ?? 'UP Mindanao'
}

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filters, setFilters] = useState<{
    conditions: string[]
    categories: string[]
    priceRange: [number, number]
  }>({
    conditions: [],
    categories: [],
    priceRange: [0, 50000],
  })
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [listings, setListings] = useState<ListingRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadListings = async () => {
      try {
        const response = await fetchApi<{ data: ListingRow[] }>('/api/listings?status=active&limit=100')

        if (isMounted) {
          setListings(response.data)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unable to load listings')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadListings()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    let items = listings

    // Filter by search query
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getSellerName(item).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by condition
    if (filters.conditions.length > 0) {
      items = items.filter((item) => filters.conditions.includes(formatCondition(item.condition)))
    }

    // Filter by category
    if (filters.categories.length > 0) {
      items = items.filter((item) => filters.categories.includes(item.category?.name ?? ''))
    }

    // Filter by price range
    items = items.filter(
      (item) => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
    )

    // Sort items
    switch (sortBy) {
      case 'price-low':
        items.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        items.sort((a, b) => b.price - a.price)
        break
      case 'popular':
        items.sort((a, b) => (b.seller_rating ?? 0) - (a.seller_rating ?? 0))
        break
      case 'newest':
      default:
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    return items
  }, [searchQuery, sortBy, filters, listings])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <ListingsHeader
        onSearch={setSearchQuery}
        onSortChange={setSortBy}
        itemCount={filteredItems.length}
        mobileFilterOpen={mobileFilterOpen}
        onMobileFilterToggle={() => setMobileFilterOpen(!mobileFilterOpen)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Sidebar Filters - Hidden on mobile, visible on larger screens */}
          <aside className="hidden md:block">
            <ListingsFilters onFiltersChange={setFilters} />
          </aside>

          {/* Mobile Filters - Visible when opened */}
          {mobileFilterOpen && (
            <aside className="md:hidden mb-6 border-t border-border pt-6">
              <ListingsFilters onFiltersChange={setFilters} />
            </aside>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {error ? (
              <div className="py-20 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Unable to load listings
                </h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-80 rounded-lg border border-border bg-card animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    image={getFirstImage(item)}
                    seller={getSellerName(item)}
                    sellerRating={item.seller_rating ?? 0}
                    condition={formatCondition(item.condition)}
                    category={item.category?.name ?? 'Uncategorized'}
                    location={getLocation(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No items found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({ conditions: [], categories: [], priceRange: [0, 50000] })
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
