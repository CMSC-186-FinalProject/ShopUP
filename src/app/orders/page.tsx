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
import { Badge } from '@/src/components/ui/badge'
import { Skeleton } from '@/src/components/ui/skeleton'
import { fetchApi } from '@/src/lib/api'
import { getFriendlyErrorMessage } from '@/src/lib/error-messages'
import { Package, MapPin, Star } from 'lucide-react'

interface ListingRow {
  id: string
  title: string
  price: number
  images: Array<{ image_url: string }>
}

interface ProfileInfo {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  campus: string | null
}

interface OrderRow {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  price: number
  quantity: number
  created_at: string
  completed_at: string | null
  listing: ListingRow | null
  buyer: ProfileInfo | null
  seller: ProfileInfo | null
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      try {
        // Get current user ID
        const meResponse = await fetchApi<{ user: { id: string } }>('/api/me')
        if (isMounted) {
          setCurrentUserId(meResponse.user.id)
        }

        // Get orders
        const response = await fetchApi<{ data: OrderRow[] }>('/api/orders')
        if (isMounted) {
          setOrders(response.data)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = getFriendlyErrorMessage(err) || 'Unable to load orders'
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

    loadOrders()
    return () => {
      isMounted = false
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const getStatusColor = (status: OrderRow['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
    }
    return colors[status]
  }

  const getStatusLabel = (status: OrderRow['status']) => {
    const labels = {
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    }
    return labels[status]
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Orders</h1>
          <p className="text-muted-foreground">
            {orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start buying or selling items to see your orders here.
            </p>
            <Button onClick={() => router.push('/listings')}>
              Browse Listings
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isBuyer = order.buyer_id === currentUserId
              const totalPrice = order.price * order.quantity

              return (
                <Card key={order.id} className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Listing Image */}
                    {order.listing && (
                      <Link
                        href={`/listings/${order.listing.id}`}
                        className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src={order.listing.images[0]?.image_url ?? '/placeholder.svg'}
                          alt={order.listing.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </Link>
                    )}

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      {order.listing && (
                        <>
                          <Link href={`/listings/${order.listing.id}`}>
                            <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                              {order.listing.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-primary font-medium mb-2">
                            ₱{order.listing.price.toLocaleString()} × {order.quantity}
                          </p>
                        </>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3 items-center">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Other Party Info */}
                      <div className="text-xs text-muted-foreground">
                        <p>
                          {isBuyer ? 'Seller' : 'Buyer'}:{' '}
                          <span className="text-foreground font-medium">
                            {isBuyer
                              ? order.seller?.full_name ?? order.seller?.username ?? 'Unknown'
                              : order.buyer?.full_name ?? order.buyer?.username ?? 'Unknown'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Total & Actions */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-foreground mb-3">
                        ₱{totalPrice.toLocaleString()}
                      </p>
                      <div className="space-y-2">
                        {order.status === 'completed' && isBuyer && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/reviews?orderId=${order.id}`)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
