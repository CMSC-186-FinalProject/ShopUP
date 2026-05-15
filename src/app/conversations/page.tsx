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
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Skeleton } from '@/src/components/ui/skeleton'
import { fetchApi } from '@/src/lib/api'
import { getFriendlyErrorMessage } from '@/src/lib/error-messages'
import { MessageSquare, ChevronRight, MapPin } from 'lucide-react'

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

interface ConversationRow {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  last_message_at: string | null
  created_at: string
  listing: ListingRow | null
  buyer: ProfileInfo | null
  seller: ProfileInfo | null
}

export default function ConversationsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadConversations = async () => {
      try {
        const response = await fetchApi<{ data: ConversationRow[] }>('/api/conversations')
        if (isMounted) {
          setConversations(response.data)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = getFriendlyErrorMessage(err) || 'Unable to load conversations'
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

    loadConversations()
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            {conversations.length === 0 ? 'No conversations yet' : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">No conversations yet</h2>
            <p className="text-muted-foreground mb-6">
              Start a conversation by contacting a seller about their listing.
            </p>
            <Button onClick={() => router.push('/listings')}>
              Browse Listings
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const otherUser =
                conversation.buyer_id === conversation.seller_id
                  ? conversation.buyer
                  : conversation.buyer_id === conversation.seller_id
                    ? conversation.seller
                    : conversation.buyer_id === conversation.seller_id
                      ? conversation.seller
                      : conversation.buyer // Default to buyer, will be changed by context
              
              // Determine who "other" user is by checking current user context
              // For now, we'll show both options and let the API determine
              const lastMessageDate = conversation.last_message_at
                ? new Date(conversation.last_message_at).toLocaleDateString()
                : new Date(conversation.created_at).toLocaleDateString()

              return (
                <Link
                  key={conversation.id}
                  href={`/conversations/${conversation.id}`}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Listing Image */}
                      {conversation.listing && (
                        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={conversation.listing.images[0]?.image_url ?? '/placeholder.svg'}
                            alt={conversation.listing.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {conversation.listing && (
                          <>
                            <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                              {conversation.listing.title}
                            </h3>
                            <p className="text-sm text-primary font-medium mb-2">
                              ₱{conversation.listing.price.toLocaleString()}
                            </p>
                          </>
                        )}

                        {/* Seller/Buyer Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={conversation.seller?.avatar_url ?? undefined}
                            />
                            <AvatarFallback className="text-xs">
                              {(conversation.seller?.full_name ?? conversation.seller?.username ?? 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-muted-foreground">
                            {conversation.seller?.full_name ?? conversation.seller?.username ?? 'Unknown'}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Last message: {lastMessageDate}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-2" />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
