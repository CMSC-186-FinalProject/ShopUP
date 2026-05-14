'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { CreateListingForm } from '@/src/components/create-listing-form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Eye, MessageSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { fetchApi } from '@/src/lib/api'

interface Listing {
  id: string
  title: string
  price: number
  image: string
  category: string
  status: 'active' | 'sold'
  views: number
  inquiries: number
  postedDate: string
}

interface ApiListing {
  id: string
  title: string
  price: number
  status: 'draft' | 'active' | 'sold' | 'archived'
  views_count: number
  inquiries_count: number
  created_at: string
  category: {
    id: string
    name: string
  } | null
  images: Array<{ image_url: string }>
}

export function MyListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadListings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const me = await fetchApi<{ user: { id: string } }>('/api/me')
      const response = await fetchApi<{ data: ApiListing[] }>(
        `/api/listings?sellerId=${encodeURIComponent(me.user.id)}&limit=100&sort=newest`
      )

      setListings(
        response.data.map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          image: listing.images[0]?.image_url ?? '/placeholder.svg',
          category: listing.category?.name ?? 'Uncategorized',
          status: listing.status === 'sold' ? 'sold' : 'active',
          views: listing.views_count,
          inquiries: listing.inquiries_count,
          postedDate: new Date(listing.created_at).toLocaleDateString(),
        }))
      )
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unable to load your listings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadListings()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await fetchApi(`/api/listings/${id}`, { method: 'DELETE' })
      await loadListings()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unable to delete listing')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowCreateForm(true)}
        >
          + New Listing
        </Button>
      </div>

      {error ? (
        <Card className="p-6 mb-6 border-destructive/30 bg-destructive/5 text-destructive">
          {error}
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-80 animate-pulse bg-muted" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-6">
            Start selling by creating your first listing!
          </p>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Listing
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-muted">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
                <Badge
                  className={`absolute top-3 right-3 ${
                    listing.status === 'active'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                >
                  {listing.status === 'active' ? 'Active' : 'Sold'}
                </Badge>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg truncate">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {listing.category}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary">
                    ₱{listing.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Posted {listing.postedDate}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.views} views</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.inquiries} inquiries</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={listing.status === 'sold'}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Mark as Sold</DropdownMenuItem>
                      <DropdownMenuItem>Bump Listing</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(listing.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateListingForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onCreated={() => {
          void loadListings()
        }}
      />
    </div>
  )
}

const Package = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 4v15c0 .55.45 1 1 1h15c.55 0 1-.45 1-1V4M3 4h18m-2 2l-4-2m0 0l-4 2m4-2v10" />
  </svg>
)
