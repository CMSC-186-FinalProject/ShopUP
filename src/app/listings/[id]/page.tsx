'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Skeleton } from '@/src/components/ui/skeleton'
import { CompleteProfileDialog } from '@/src/components/complete-profile-dialog'
import { fetchApi } from '@/src/lib/api'
import { getFriendlyErrorMessage } from '@/src/lib/error-messages'
import { useProfileValidation } from '@/src/hooks/use-profile-validation'
import { Heart, MessageSquare, MapPin, Star, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'

interface ListingRow {
  id: string
  title: string
  price: number
  description: string | null
  condition: 'like_new' | 'good' | 'fair' | 'for_parts'
  location: string | null
  campus: string | null
  status: string
  created_at: string
  seller_rating: number | null
  seller: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  images: Array<{ id: string; image_url: string }>
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params.id as string

  const { fetchCurrentUser, isProfileComplete } = useProfileValidation()

  const [listing, setListing] = useState<ListingRow | null>(null)
  const [relatedListings, setRelatedListings] = useState<ListingRow[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingAction, setIsLoadingAction] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [profileAction, setProfileAction] = useState<'contact' | 'order'>('contact')

  useEffect(() => {
    let isMounted = true

    const loadListing = async () => {
      try {
        const response = await fetchApi<{ data: ListingRow }>(`/api/listings/${listingId}`)
        if (!isMounted) return

        setListing(response.data)

        try {
          const favoritesRes = await fetchApi<{ data: ListingRow[] }>('/api/favorites')
          if (isMounted) {
            setIsFavorited(favoritesRes.data.some((fav) => fav.id === listingId))
          }
        } catch {
          // Ignore if user is not authenticated or cannot fetch favorites
        }

        // Load related listings from same category
        if (response.data.category?.slug) {
          const relatedRes = await fetchApi<{ data: ListingRow[] }>(
            `/api/listings?category=${response.data.category.slug}&limit=4`
          )
          if (isMounted) {
            setRelatedListings(
              relatedRes.data.filter((listing) => listing.id !== listingId).slice(0, 3)
            )
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = getFriendlyErrorMessage(err) || 'Unable to load listing'
          setError(message)
          if (message.toLowerCase().includes('not found')) {
            router.push('/listings')
          }
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadListing()
    return () => {
      isMounted = false
    }
  }, [listingId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-lg" />
              <div className="mt-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <div className="p-6 text-center">
              <p className="text-destructive mb-4">{error || 'Listing not found'}</p>
              <Button onClick={() => router.push('/listings')}>Back to Listings</Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const conditionLabels = {
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'for_parts': 'For Parts',
  }

  const conditionColors = {
    'like_new': 'bg-green-100 text-green-800',
    'good': 'bg-blue-100 text-blue-800',
    'fair': 'bg-yellow-100 text-yellow-800',
    'for_parts': 'bg-red-100 text-red-800',
  }

  const images = listing.images.length > 0 ? listing.images : [{ id: '0', image_url: '/placeholder.svg' }]
  const currentImage = images[currentImageIndex]

  const handleContactSeller = async () => {
    try {
      // Validate profile first
      const user = await fetchCurrentUser()
      if (!isProfileComplete(user.profile)) {
        setProfileAction('contact')
        setShowProfileDialog(true)
        return
      }

      setIsLoadingAction(true)
      const response = await fetchApi<{ data: { id: string } }>('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      router.push(`/conversations/${response.data.id}`)
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err) || 'Unable to start conversation')
    } finally {
      setIsLoadingAction(false)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      // Validate profile first
      const user = await fetchCurrentUser()
      if (!isProfileComplete(user.profile)) {
        setProfileAction('order')
        setShowProfileDialog(true)
        return
      }

      setIsLoadingAction(true)
      const response = await fetchApi<{ data: { id: string } }>('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      router.push(`/orders`)
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err) || 'Unable to place order')
    } finally {
      setIsLoadingAction(false)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await fetchApi(`/api/favorites/${listing.id}`, { method: 'DELETE' })
      } else {
        await fetchApi('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: listing.id }),
        })
      }
      setIsFavorited(!isFavorited)
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err) || 'Unable to update favorite')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative bg-muted rounded-lg overflow-hidden mb-6 h-96">
              <Image
                src={currentImage.image_url}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${listing.title} ${idx + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Listing Details */}
            <Card className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-foreground">{listing.title}</h1>
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <Badge className={conditionColors[listing.condition]}>
                    {conditionLabels[listing.condition]}
                  </Badge>
                  {listing.category && (
                    <Badge variant="outline">{listing.category.name}</Badge>
                  )}
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-4xl font-bold text-primary mb-4">
                  ₱{listing.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {listing.location || listing.campus || 'UP Mindanao'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Listed {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </Card>
          </div>

          {/* Right: Seller Card & Actions */}
          <div className="lg:col-span-1">
            {/* Seller Card */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Seller</h3>

              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={listing.seller?.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {(listing.seller?.full_name ?? listing.seller?.username ?? 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {listing.seller?.full_name ?? listing.seller?.username ?? 'Unknown'}
                  </p>
                  {listing.seller?.campus && (
                    <p className="text-sm text-muted-foreground truncate">
                      {listing.seller.campus}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">
                      {listing.seller_rating?.toFixed(1) ?? 'No ratings'}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full gap-2 mb-3"
                onClick={handlePlaceOrder}
                disabled={isLoadingAction}
              >
                <ShoppingCart className="h-4 w-4" />
                {isLoadingAction ? 'Placing...' : 'Place Order'}
              </Button>

              <Button
                className="w-full gap-2 mb-3"
                variant="secondary"
                onClick={handleContactSeller}
                disabled={isLoadingAction}
              >
                <MessageSquare className="h-4 w-4" />
                {isLoadingAction ? 'Starting...' : 'Contact Seller'}
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleToggleFavorite}
                disabled={isLoadingAction}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorited ? 'fill-primary text-primary' : ''
                  }`}
                />
                {isFavorited ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </Card>

            {/* Quick Info */}
            <Card className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="font-medium text-foreground">
                    {conditionLabels[listing.condition]}
                  </p>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground">
                    {listing.category?.name ?? 'Uncategorized'}
                  </p>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground capitalize">
                    {listing.status === 'active' ? '✓ Available' : listing.status}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedListings.map((item) => (
                <Link key={item.id} href={`/listings/${item.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="relative h-48 bg-muted">
                      <Image
                        src={item.images[0]?.image_url ?? '/placeholder.svg'}
                        alt={item.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-lg font-bold text-primary mb-3">
                        ₱{item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{item.category?.name ?? 'Uncategorized'}</span>
                        {item.seller_rating && (
                          <span>⭐ {item.seller_rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
      <CompleteProfileDialog
        isOpen={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        action={profileAction}
      />
    </div>
  )
}
