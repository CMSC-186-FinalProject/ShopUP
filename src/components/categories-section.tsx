"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { fetchApi } from "@/src/lib/api"

interface CategoryCard {
  id: number
  name: string
  slug: string
  description: string | null
  count: number
}

const categoryEmojis: Record<string, string> = {
  Textbooks: '📚',
  Electronics: '💻',
  Clothing: '👕',
  Furniture: '🛏️',
  'Dorm Essentials': '🛏️',
  'School Supplies': '✏️',
  'Sports Equipment': '⚽',
  Sports: '⚽',
  'Sports & Fitness': '⚽',
  Books: '📖',
  Notes: '📝',
  Other: '🎒',
  'Musical Instruments': '🎸',
  'Tickets & Vouchers': '🎟️',
}

export function CategoriesSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const response = await fetchApi<{ data: CategoryCard[] }>('/api/categories')

        if (isMounted) {
          setCategories(response.data)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unable to load categories')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="categories" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Categories</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Find what you need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse through popular categories or search for specific items. There&apos;s something for every Isko and Iska.
          </p>
        </div>

        {error ? (
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-44 rounded-2xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300",
                activeCategory === category.name
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{categoryEmojis[category.name] ?? '📦'}</span>
                <span className={cn(
                  "text-sm font-medium px-2.5 py-1 rounded-full",
                  activeCategory === category.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {category.count} items
                </span>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.description ?? 'Browse items in this category.'}
              </p>
            </button>
          ))}
          </div>
        )}
      </div>
    </section>
  )
}
