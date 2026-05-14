'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { ListingsHeader } from '@/src/components/listings-header'
import { ListingsFilters } from '@/src/components/listings-filters'
import { ProductCard } from '@/src/components/product-card'

// Sample data - in a real app, this would come from a database
const SAMPLE_ITEMS = [
  {
    id: '1',
    title: 'Advanced Algorithm Design Textbook',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=400&h=300&fit=crop',
    seller: 'Maria Santos',
    sellerRating: 4.8,
    condition: 'like-new' as const,
    category: 'Textbooks',
    location: 'UP Mindanao Davao',
  },
  {
    id: '2',
    title: 'Gaming Laptop - RTX 3060',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1588872657840-790ff3bde4c5?w=400&h=300&fit=crop',
    seller: 'Juan dela Cruz',
    sellerRating: 4.9,
    condition: 'good' as const,
    category: 'Electronics',
    location: 'UP Mindanao Davao',
  },
  {
    id: '3',
    title: 'University PE Jacket',
    price: 800,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=300&fit=crop',
    seller: 'Ana Reyes',
    sellerRating: 4.6,
    condition: 'like-new' as const,
    category: 'Clothing',
    location: 'UP Mindanao Davao',
  },
  {
    id: '4',
    title: 'Wood Desk for Studying',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop',
    seller: 'Carlos Wong',
    sellerRating: 4.7,
    condition: 'good' as const,
    category: 'Furniture',
    location: 'UP Mindanao Davao',
  },
  {
    id: '5',
    title: 'Calculus I & II Workbook Bundle',
    price: 900,
    image: 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=400&h=300&fit=crop',
    seller: 'Diana Lopez',
    sellerRating: 4.5,
    condition: 'fair' as const,
    category: 'Textbooks',
    location: 'UP Mindanao Davao',
  },
  {
    id: '6',
    title: 'Sony Headphones - Noise Cancelling',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    seller: 'Pedro Santos',
    sellerRating: 4.8,
    condition: 'like-new' as const,
    category: 'Electronics',
    location: 'UP Mindanao Davao',
  },
  {
    id: '7',
    title: 'Winter Sweater - Beige',
    price: 450,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    seller: 'Sofia Reyes',
    sellerRating: 4.7,
    condition: 'good' as const,
    category: 'Clothing',
    location: 'UP Mindanao Davao',
  },
  {
    id: '8',
    title: 'Writing Desk Lamp - LED',
    price: 600,
    image: 'https://cdn.shopify.com/s/files/1/0674/6796/8799/files/Honeywell-H9-Smart-Sensing-Desk-Lamp-Honeywell-18605069.png',
    seller: 'Michael Cruz',
    sellerRating: 4.6,
    condition: 'like-new' as const,
    category: 'School Supplies',
    location: 'UP Mindanao Davao',
  },
  {
    id: '9',
    title: 'Organic Chemistry Textbook',
    price: 1500,
    image: 'https://cbpbook.com/wp-content/uploads/2023/03/a-textbook-of-organic-chemistry-by-myounas.jpg',
    seller: 'Lucia Fernandez',
    sellerRating: 4.9,
    condition: 'good' as const,
    category: 'Textbooks',
    location: 'UP Mindanao Davao',
  },
  {
    id: '10',
    title: 'Logitech Mouse & Keyboard Set',
    price: 2200,
    image: 'https://cdn.bdstall.com/product-image/388165_600X600.webp',
    seller: 'Ramon Gutierrez',
    sellerRating: 4.8,
    condition: 'like-new' as const,
    category: 'Electronics',
    location: 'UP Mindanao Davao',
  },
  {
    id: '11',
    title: 'Basketball Shoes - Nike',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    seller: 'Antonio Flores',
    sellerRating: 4.7,
    condition: 'good' as const,
    category: 'Sports Equipment',
    location: 'UP Mindanao Davao',
  },
  {
    id: '12',
    title: 'Desk Chair - Ergonomic',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    seller: 'Nina Morales',
    sellerRating: 4.6,
    condition: 'fair' as const,
    category: 'Furniture',
    location: 'UP Mindanao Davao',
  },
]

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filters, setFilters] = useState({
    conditions: [],
    categories: [],
    priceRange: [0, 50000],
  })
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const filteredItems = useMemo(() => {
    let items = SAMPLE_ITEMS

    // Filter by search query
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.seller.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by condition
    if (filters.conditions.length > 0) {
      items = items.filter((item) => filters.conditions.includes(item.condition))
    }

    // Filter by category
    if (filters.categories.length > 0) {
      items = items.filter((item) => filters.categories.includes(item.category))
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
        items.sort((a, b) => b.sellerRating - a.sellerRating)
        break
      case 'newest':
      default:
        // Keep original order
        break
    }

    return items
  }, [searchQuery, sortBy, filters])

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
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <ProductCard key={item.id} {...item} />
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
