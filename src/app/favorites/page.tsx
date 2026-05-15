'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Force this page to be dynamic to ensure middleware runs on every request
export const dynamic = 'force-dynamic'
import Image from 'next/image'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Skeleton } from '@/src/components/ui/skeleton'
import { fetchApi } from '@/src/lib/api'
import { getFriendlyErrorMessage } from '@/src/lib/error-messages'
import { Heart, MapPin, Star } from 'lucide-react'

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
}

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<ListingRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      try {
        const response = await fetchApi<{ data: ListingRow[] }>('/api/favorites')
        if (isMounted) {
          setFavorites(response.data)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = getFriendlyErrorMessage(err) || 'Unable to load favorites'
          if (message.toLowerCase().includes('unauthorized')) {
            router.push('/auth/login')
          } else {
            setError(message)
          }
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadFavorites()
    return () => {
      isMounted = false
    }
  }, [router])

  const handleRemoveFavorite = async (
    e: React.MouseEvent<HTMLButtonElement>,
    listingId: string
  ) => {
    e.preventDefault()
    try {
      setRemovingId(listingId)
      await fetchApi(`/api/favorites/${listingId}`, { method: 'DELETE' })
      setFavorites((prev) => prev.filter((item) => item.id !== listingId))
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err) || 'Unable to remove favorite')
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const conditionColors = {
    'like_new': 'bg-green-100 text-green-800',
    'good': 'bg-blue-100 text-blue-800',
    'fair': 'bg-yellow-100 text-yellow-800',
    'for_parts': 'bg-red-100 text-red-800',
  }

  const conditionLabels = {
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'for_parts': 'For Parts',
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length === 0
              ? 'You haven\'t favorited any items yet'
              : `${favorites.length} item${favorites.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              No favorites yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start adding items to your favorites list by clicking the heart icon.
            </p>
            <Button onClick={() => router.push('/listings')}>
              Browse Listings
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
                  {/* Image Container */}
                  <div className="relative w-full h-48 bg-muted overflow-hidden">
                    <Image
                      src={listing.images[0]?.image_url ?? '/placeholder.svg'}
                      alt={listing.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Condition Badge */}
                    <div
                      className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
                        conditionColors[listing.condition]
                      }`}
                    >
                      {conditionLabels[listing.condition]}
                    </div>
                    {/* Favorite Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full h-8 w-8"
                      onClick={(e) => handleRemoveFavorite(e, listing.id)}
                      disabled={removingId === listing.id}
                    >
                      <Heart className="h-4 w-4 fill-primary text-primary" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground mb-2">
                      {listing.title}
                    </h3>

                    <div className="mb-3">
                      <p className="text-lg font-bold text-primary">
                        ₱{listing.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">
                        {listing.location ?? listing.campus ?? 'UP Mindanao'}
                      </span>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {(listing.seller?.full_name ?? listing.seller?.username ?? 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {listing.seller?.full_name ?? listing.seller?.username ?? 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ⭐ {listing.seller_rating?.toFixed(1) ?? 'New'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
