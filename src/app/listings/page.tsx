'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { ListingsHeader } from '@/src/components/listings-header'
import { ListingsFilters } from '@/src/components/listings-filters'
import { ProductCard } from '@/src/components/product-card'
import { fetchApi } from '@/src/lib/api'
import { Suspense } from 'react'
import { CompleteAuthDialog } from '@/src/components/complete-auth-dialog'

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

function ListingsContent() {
  const searchParams = useSearchParams()
  const initialCategorySlugs = useMemo(() => {
    const value = searchParams.get('category')?.trim()
    return value ? [value.toLowerCase()] : []
  }, [searchParams])

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filters, setFilters] = useState<{
    conditions: string[]
    categories: string[]
    priceRange: [number, number]
  }>(() => ({
    conditions: [],
    categories: initialCategorySlugs,
    priceRange: [0, 50000],
  }))
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [listings, setListings] = useState<ListingRow[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadListings = async () => {
      try {
        const [listingsResponse, favoritesResponse] = await Promise.all([
          fetchApi<{ data: ListingRow[] }>('/api/listings?status=active&limit=100'),
          fetchApi<{ data: ListingRow[] }>('/api/favorites').catch(() => ({ data: [] })),
        ])

        if (isMounted) {
          setListings(listingsResponse.data)
          const favoriteListingIds = new Set(favoritesResponse.data.map((fav) => fav.id))
          setFavoriteIds(favoriteListingIds)
        }
      } catch (loadError: unknown) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load listings')
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

  const handleFavoriteToggle = (listingId: string, isFavorited: boolean) => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev)
      if (isFavorited) {
        newSet.add(listingId)
      } else {
        newSet.delete(listingId)
      }
      return newSet
    })
  }

  const filteredItems = useMemo(() => {
    let items = listings

    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getSellerName(item).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filters.conditions.length > 0) {
      items = items.filter((item) => filters.conditions.includes(formatCondition(item.condition)))
    }

    if (filters.categories.length > 0) {
      items = items.filter((item) => {
        const categoryName = item.category?.name?.toLowerCase() ?? ''
        const categorySlug = item.category?.slug?.toLowerCase() ?? ''
        const selectedCategories = filters.categories.map((category) => category.toLowerCase())

        return selectedCategories.includes(categoryName) || selectedCategories.includes(categorySlug)
      })
    }

    items = items.filter(
      (item) => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
    )

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
          <aside className="hidden md:block">
            <ListingsFilters onFiltersChange={setFilters} initialCategorySlugs={initialCategorySlugs} activeFilters={filters} />
          </aside>

          {mobileFilterOpen && (
            <aside className="md:hidden mb-6 border-t border-border pt-6">
              <ListingsFilters onFiltersChange={setFilters} initialCategorySlugs={initialCategorySlugs} activeFilters={filters} />
            </aside>
          )}

          <div className="flex-1">
            {error ? (
              <div className="py-20 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Unable to load listings</h3>
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
                  <Link key={item.id} href={`/listings/${item.id}`}>
                    <ProductCard
                      id={item.id}
                      title={item.title}
                      price={item.price}
                      image={getFirstImage(item)}
                      seller={getSellerName(item)}
                      sellerRating={item.seller_rating ?? 0}
                      condition={formatCondition(item.condition)}
                      category={item.category?.name ?? 'Uncategorized'}
                      location={getLocation(item)}
                      initiallyFavorited={favoriteIds.has(item.id)}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
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

function ListingsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ListingsPage() {
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    const handler = () => setShowAuthDialog(true)
    window.addEventListener('shopup:unauthorized', handler as EventListener)
    return () => window.removeEventListener('shopup:unauthorized', handler as EventListener)
  }, [])

  return (
    <>
      <Suspense fallback={<ListingsLoading />}>
        <ListingsContent />
      </Suspense>
      <CompleteAuthDialog isOpen={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  )
}
