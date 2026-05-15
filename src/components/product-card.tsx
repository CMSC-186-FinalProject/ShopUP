'use client'

import { Heart, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { fetchApi } from '@/src/lib/api'

interface ProductCardProps {
  id: string
  title: string
  price: number
  image: string
  seller: string
  sellerRating: number
  condition: 'like-new' | 'good' | 'fair' | 'for-parts'
  category: string
  location: string
  initiallyFavorited?: boolean
}

export function ProductCard({
  id,
  title,
  price,
  image,
  seller,
  sellerRating,
  condition,
  category,
  location,
  initiallyFavorited = false,
}: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(initiallyFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const conditionColors = {
    'like-new': 'bg-green-100 text-green-800',
    'good': 'bg-blue-100 text-blue-800',
    'fair': 'bg-yellow-100 text-yellow-800',
    'for-parts': 'bg-red-100 text-red-800',
  }

  const conditionLabels = {
    'like-new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'for-parts': 'For Parts',
  }

  const handleToggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const previousState = isFavorited
    try {
      setIsLoading(true)
      if (isFavorited) {
        await fetchApi(`/api/favorites/${id}`, { method: 'DELETE' })
      } else {
        await fetchApi('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: id }),
        })
      }
      setIsFavorited(!previousState)
    } catch (err) {
      // Revert to previous state on error
      setIsFavorited(previousState)
      try {
        const message = err instanceof Error ? err.message : JSON.stringify(err)
        if (typeof message === 'string' && message.toLowerCase().includes('unauthorized')) {
          window.dispatchEvent(new CustomEvent('shopup:unauthorized'))
          return
        }
      } catch {}
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Condition Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${conditionColors[condition]}`}>
          {conditionLabels[condition]}
        </div>
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full h-8 w-8"
          onClick={handleToggleFavorite}
          disabled={isLoading}
        >
          <Heart
            className={`h-4 w-4 ${isFavorited ? 'fill-primary text-primary' : 'text-gray-600'}`}
          />
        </Button>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 text-foreground mb-2">
          {title}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <p className="text-lg font-bold text-primary">
            ₱{price.toLocaleString()}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {seller.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {seller}
            </p>
            <p className="text-xs text-muted-foreground">
              ⭐ {sellerRating.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
