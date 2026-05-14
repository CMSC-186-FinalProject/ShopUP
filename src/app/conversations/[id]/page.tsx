'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Skeleton } from '@/src/components/ui/skeleton'
import { fetchApi } from '@/src/lib/api'
import { getFriendlyErrorMessage } from '@/src/lib/error-messages'
import { Send, ChevronLeft, MapPin } from 'lucide-react'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  read_at: string | null
  created_at: string
}

interface ProfileInfo {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  campus: string | null
}

interface ListingRow {
  id: string
  title: string
  price: number
  images: Array<{ image_url: string }>
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

export default function ConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const [conversation, setConversation] = useState<ConversationRow | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const latestMessageSignatureRef = useRef('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getMessageSignature = (items: Message[]) =>
    items.map((message) => `${message.id}:${message.created_at}`).join('|')

  useEffect(() => {
    let isMounted = true
    let isTabVisible = document.visibilityState === 'visible'

    const loadConversation = async () => {
      try {
        // Get current user ID from auth
        const meResponse = await fetchApi<{ user: { id: string } }>('/api/me')
        if (isMounted) {
          setCurrentUserId(meResponse.user.id)
        }

        // Load conversation and messages
        const [convResponse, messagesResponse] = await Promise.all([
          fetchApi<{ data: ConversationRow }>(`/api/conversations/${conversationId}`),
          fetchApi<{ data: Message[] }>(`/api/conversations/${conversationId}/messages`),
        ])

        if (isMounted) {
          setConversation(convResponse.data)
          setMessages(messagesResponse.data)
          latestMessageSignatureRef.current = getMessageSignature(messagesResponse.data)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = getFriendlyErrorMessage(err) || 'Unable to load conversation'
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

    loadConversation()

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible'

      if (!isTabVisible) {
        return
      }

      void (async () => {
        if (!isMounted) return

        try {
          const response = await fetchApi<{ data: Message[] }>(
            `/api/conversations/${conversationId}/messages`
          )
          const nextSignature = getMessageSignature(response.data)

          if (isMounted && nextSignature !== latestMessageSignatureRef.current) {
            latestMessageSignatureRef.current = nextSignature
            setMessages(response.data)
          }
        } catch {
          // Silent fail when refetching after tab becomes visible.
        }
      })()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const interval = setInterval(async () => {
      if (!isMounted || !isTabVisible) return
      try {
        const response = await fetchApi<{ data: Message[] }>(
          `/api/conversations/${conversationId}/messages`
        )
        const nextSignature = getMessageSignature(response.data)
        if (isMounted && nextSignature !== latestMessageSignatureRef.current) {
          latestMessageSignatureRef.current = nextSignature
          setMessages(response.data)
        }
      } catch {
        // Silent fail on polling errors
      }
    }, 3000)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [conversationId, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || isSending || !conversation) return

    try {
      setIsSending(true)
      const response = await fetchApi<{ data: Message }>(
        `/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: messageInput.trim() }),
        }
      )

      setMessages((currentMessages) => {
        if (currentMessages.some((message) => message.id === response.data.id)) {
          return currentMessages
        }

        return [...currentMessages, response.data]
      })
      latestMessageSignatureRef.current = getMessageSignature([...messages, response.data])
      setMessageInput('')
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err) || 'Unable to send message')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-24 w-full mb-6 rounded-lg" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <div className="p-6 text-center">
              <p className="text-destructive mb-4">{error || 'Conversation not found'}</p>
              <Button onClick={() => router.push('/conversations')}>Back to Messages</Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const otherParticipant =
    conversation.buyer_id === currentUserId ? conversation.seller : conversation.buyer
  const isSellerView = conversation.seller_id === currentUserId

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Listing Info Card */}
          {conversation.listing && (
            <Link href={`/listings/${conversation.listing.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={(conversation.listing.images && conversation.listing.images[0]?.image_url) ?? '/placeholder.svg'}
                      alt={conversation.listing.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                      {conversation.listing.title}
                    </h3>
                    <p className="text-sm text-primary font-medium">
                      ₱{conversation.listing.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* Conversation Info */}
        {otherParticipant && (
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={otherParticipant.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {(otherParticipant.full_name ?? otherParticipant.username ?? 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {otherParticipant.full_name ?? otherParticipant.username ?? 'Unknown'}
                  </p>
                  {otherParticipant.campus && (
                    <p className="text-xs text-muted-foreground">
                      {otherParticipant.campus}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                {isSellerView ? 'Buyer' : 'Seller'}
              </span>
            </div>
          </Card>
        )}

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="bg-card rounded-lg mb-4 p-4 h-96 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isCurrentUser = message.sender_id === currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm wrap-break-word">{message.body}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isSending || !messageInput.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  )
}
