'use client'

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { SellerDashboardStats } from '@/src/components/seller-dashboard-stats'
import { MyListings } from '@/src/components/my-listings'
import { Card } from '@/src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Star,
} from 'lucide-react'
import { fetchApi } from '@/src/lib/api'

interface SellerProfile {
  full_name: string | null
  username: string | null
  avatar_url: string | null
  campus: string | null
}

interface DashboardListing {
  id: string
  title: string
  price: number
  status: 'draft' | 'active' | 'sold' | 'archived'
  views_count: number
  inquiries_count: number
  created_at: string
}

interface DashboardOrder {
  id: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  listing: {
    id: string
    title: string
  } | null
  buyer: {
    full_name: string | null
    username: string | null
  } | null
}

interface DashboardReview {
  id: string
  rating: number
  comment: string
  created_at: string
  reviewer: {
    full_name: string | null
    username: string | null
  } | null
}

interface ConversationSummary {
  id: string
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

function formatStatus(status: DashboardOrder['status']) {
  if (status === 'completed') return 'Completed'
  if (status === 'cancelled') return 'Cancelled'
  if (status === 'refunded') return 'Refunded'
  return 'Pending'
}

export default function SellerDashboard() {
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [listings, setListings] = useState<DashboardListing[]>([])
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [reviews, setReviews] = useState<DashboardReview[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        const me = await fetchApi<{ user: { id: string }; profile: SellerProfile | null }>('/api/me')

        const [listingsResponse, ordersResponse, reviewsResponse, conversationsResponse] = await Promise.all([
          fetchApi<{ data: DashboardListing[] }>(`/api/listings?sellerId=${encodeURIComponent(me.user.id)}&limit=100&sort=newest`),
          fetchApi<{ data: DashboardOrder[] }>('/api/orders'),
          fetchApi<{ data: DashboardReview[] }>(`/api/reviews?revieweeId=${encodeURIComponent(me.user.id)}`),
          fetchApi<{ data: ConversationSummary[] }>('/api/conversations'),
        ])

        if (!isMounted) {
          return
        }

        setProfile(me.profile)
        setListings(listingsResponse.data)
        setOrders(ordersResponse.data)
        setReviews(reviewsResponse.data)
        setConversations(conversationsResponse.data)
      } catch (error: unknown) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unable to load dashboard data')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const activeListings = listings.filter((listing) => listing.status === 'active').length
    const totalViews = listings.reduce((total, listing) => total + listing.views_count, 0)
    const totalInquiries = listings.reduce((total, listing) => total + listing.inquiries_count, 0)
    const totalSales = orders.filter((order) => order.status === 'completed').length

    return {
      activeListings,
      totalViews,
      totalInquiries,
      totalSales,
    }
  }, [listings, orders])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0
    }

    return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
  }, [reviews])

  const pendingReviews = Math.max(0, orders.filter((order) => order.status === 'completed').length - reviews.length)

  const displayName = profile?.full_name ?? profile?.username ?? 'Seller'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 space-y-8">
          {error ? (
            <Card className="p-4 border-destructive/30 bg-destructive/5 text-destructive">
              {error}
            </Card>
          ) : null}

          {isLoading ? (
            <Card className="p-4 text-muted-foreground">
              Loading dashboard data...
            </Card>
          ) : null}

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}!</h1>
            <p className="text-primary-foreground/90">
              {reviews.length > 0
                ? `You're doing great! Your rating is ${averageRating.toFixed(1)}★ with ${stats.totalSales} successful sales.`
                : 'Your dashboard is ready. Start by creating a new listing or checking recent activity.'}
            </p>
          </div>

          {/* Dashboard Stats */}
          <SellerDashboardStats
            activeListings={stats.activeListings}
            totalViews={stats.totalViews}
            totalInquiries={stats.totalInquiries}
            totalSales={stats.totalSales}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{conversations.length} Conversation Threads</h3>
                  <p className="text-sm text-muted-foreground">
                    Active buyer and seller discussions
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{pendingReviews} Pending Reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    Awaiting feedback from completed orders
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{reviews.length} Customer Reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    Real feedback from completed orders
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="listings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Listings Tab */}
            <TabsContent value="listings" className="space-y-6">
              <MyListings />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="p-6 md:p-8">
                <h3 className="text-lg font-semibold mb-2">Your recent orders</h3>
                <p className="text-muted-foreground">
                  You have {orders.length} order{orders.length === 1 ? '' : 's'} in your account.
                </p>
                <div className="mt-6 space-y-3">
                  {orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => (
                      <OrderCard
                        key={order.id}
                        buyer={order.buyer?.full_name ?? order.buyer?.username ?? 'Unknown buyer'}
                        item={order.listing?.title ?? 'Listing'}
                        date={formatRelativeTime(order.created_at)}
                        status={formatStatus(order.status)}
                      />
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                      No orders yet.
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="h-12 w-12 text-yellow-500" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {reviews.length > 0 ? `${averageRating.toFixed(1)}★ average rating` : 'No reviews yet'}
                    </h3>
                    <p className="text-muted-foreground">
                      {reviews.length > 0
                        ? `Based on ${reviews.length} buyer review${reviews.length === 1 ? '' : 's'}`
                        : 'Reviews will appear here once completed orders are rated.'}
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {reviews.length > 0 ? (
                    reviews.slice(0, 5).map((review) => (
                      <ReviewCard
                        key={review.id}
                        reviewer={review.reviewer?.full_name ?? review.reviewer?.username ?? 'Anonymous'}
                        rating={review.rating}
                        comment={review.comment || 'No comment provided.'}
                        date={formatRelativeTime(review.created_at)}
                      />
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                      No reviews yet.
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function OrderCard({
  buyer,
  item,
  date,
  status,
}: {
  buyer: string
  item: string
  date: string
  status: string
}) {
  const statusColor =
    status === 'Completed' ? 'text-green-600' : 'text-amber-600'

  return (
    <Card className="p-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{buyer}</p>
          <p className="text-sm text-muted-foreground">
            {item} • {date}
          </p>
        </div>
        <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
      </div>
    </Card>
  )
}

function ReviewCard({
  reviewer,
  rating,
  comment,
  date,
}: {
  reviewer: string
  rating: number
  comment: string
  date: string
}) {
  return (
    <Card className="p-4 text-left">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold">{reviewer}</p>
          <div className="flex gap-1">
            {Array(rating)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-yellow-500 text-yellow-500"
                />
              ))}
            {Array(5 - rating)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i + rating}
                  className="h-4 w-4 text-gray-300"
                />
              ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <p className="text-sm">{comment}</p>
    </Card>
  )
}
