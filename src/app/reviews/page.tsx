'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Skeleton } from '@/src/components/ui/skeleton'
import { CompleteProfileDialog } from '@/src/components/complete-profile-dialog'
import { fetchApi } from '@/src/lib/api'
import { getFriendlyErrorMessage } from '@/src/lib/error-messages'
import { useProfileValidation } from '@/src/hooks/use-profile-validation'
import { Star, ChevronLeft } from 'lucide-react'

interface ReviewRow {
  id: string
  order_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
  reviewee: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
  order: {
    id: string
    status: string
    price: number
    quantity: number
    completed_at: string | null
  } | null
}

interface OrderRow {
  id: string
  status: string
  price: number
  seller_id: string
  buyer_id: string
}

function ReviewsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const { fetchCurrentUser, isProfileComplete } = useProfileValidation()

  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  // Create review form state
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null)
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        // Get current user ID
        const meResponse = await fetchApi<{ user: { id: string } }>('/api/me')
        if (isMounted) {
          setCurrentUserId(meResponse.user.id)
        }

        // Load reviews
        const reviewsResponse = await fetchApi<{ data: ReviewRow[] }>('/api/reviews')
        if (isMounted) {
          setReviews(reviewsResponse.data)
        }

        // If orderId is provided, load the order details
        if (orderId) {
          try {
            const orderResponse = await fetchApi<{ data: OrderRow }>(
              `/api/orders/${orderId}`
            )
            if (isMounted) {
              setSelectedOrder(orderResponse.data)
            }
          } catch (err) {
            // Order not found or other error, ignore
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = getFriendlyErrorMessage(err) || 'Unable to load reviews'
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

    load()
    return () => {
      isMounted = false
    }
  }, [orderId, router])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !rating) {
      setError('Please select a rating and order')
      return
    }

    try {
      // Validate profile first
      const user = await fetchCurrentUser()
      if (!isProfileComplete(user.profile)) {
        setShowProfileDialog(true)
        return
      }

      setIsCreating(true)
      const response = await fetchApi<{ data: ReviewRow }>('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          rating,
          comment: comment.trim(),
        }),
      })

      setReviews([response.data, ...reviews])
      setSelectedOrder(null)
      setRating(5)
      setComment('')
      setError(null)
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err) || 'Unable to submit review')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Reviews</h1>
          <p className="text-muted-foreground">
            Share your experience with other buyers and sellers
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Create Review Form */}
        {selectedOrder && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Leave a Review
            </h2>

            <form onSubmit={handleSubmitReview}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          value <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Comment (optional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  maxLength={2000}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {comment.length} / 2000 characters
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isCreating || !rating}
                >
                  {isCreating ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(null)
                    setRating(5)
                    setComment('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Reviews List */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            All Reviews
          </h2>

          {reviews.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                No reviews yet
              </h3>
              <p className="text-muted-foreground">
                Reviews will appear here once you complete orders.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer?.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {(review.reviewer?.full_name ?? review.reviewer?.username ?? 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {review.reviewer?.full_name ?? review.reviewer?.username ?? 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {review.order && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                      Order: ₱{review.order.price.toLocaleString()} ×{review.order.quantity}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CompleteProfileDialog
        isOpen={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        action="review"
      />
    </div>
  )
}

function ReviewsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<ReviewsLoading />}>
      <ReviewsContent />
    </Suspense>
  )
}
