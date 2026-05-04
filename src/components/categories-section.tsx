"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const categories = [
  { name: "Textbooks", emoji: "📚", count: 245, description: "Course materials, reviewers, and reference books" },
  { name: "Electronics", emoji: "💻", count: 189, description: "Laptops, tablets, calculators, and gadgets" },
  { name: "Clothing", emoji: "👕", count: 312, description: "Uniforms, casual wear, and accessories" },
  { name: "Dorm Essentials", emoji: "🛏️", count: 156, description: "Furniture, appliances, and room decor" },
  { name: "School Supplies", emoji: "✏️", count: 278, description: "Notebooks, art materials, and stationery" },
  { name: "Sports & Fitness", emoji: "⚽", count: 98, description: "Sports equipment and workout gear" },
  { name: "Musical Instruments", emoji: "🎸", count: 67, description: "Guitars, keyboards, and accessories" },
  { name: "Tickets & Vouchers", emoji: "🎟️", count: 45, description: "Event tickets, gift cards, and coupons" }
]

export function CategoriesSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300",
                activeCategory === category.name
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{category.emoji}</span>
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
                {category.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
