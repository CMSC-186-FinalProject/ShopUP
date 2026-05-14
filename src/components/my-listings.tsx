'use client'

import { useState } from 'react'
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

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Advanced Calculus Textbook',
    price: 450,
    image:
      'https://images.unsplash.com/photo-150784272343-583f20270319?w=400&h=300&fit=crop',
    category: 'Textbooks',
    status: 'active',
    views: 24,
    inquiries: 3,
    postedDate: '2 days ago',
  },
  {
    id: '2',
    title: 'Gaming Laptop - Dell G15',
    price: 28000,
    image:
      'https://images.unsplash.com/photo-1588872657840-218e412ee5ff?w=400&h=300&fit=crop',
    category: 'Electronics',
    status: 'active',
    views: 156,
    inquiries: 12,
    postedDate: '1 week ago',
  },
  {
    id: '3',
    title: 'Vintage Denim Jacket',
    price: 650,
    image:
      'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=300&fit=crop',
    category: 'Clothing',
    status: 'sold',
    views: 87,
    inquiries: 8,
    postedDate: '3 weeks ago',
  },
  {
    id: '4',
    title: 'Mechanical Keyboard RGB',
    price: 2500,
    image:
      'https://images.unsplash.com/photo-1587829191301-55ec7d9e9c01?w=400&h=300&fit=crop',
    category: 'Electronics',
    status: 'active',
    views: 45,
    inquiries: 2,
    postedDate: '5 days ago',
  },
]

export function MyListings() {
  const [listings, setListings] = useState<Listing[]>(SAMPLE_LISTINGS)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleDelete = (id: string) => {
    setListings(listings.filter((l) => l.id !== id))
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

      {listings.length === 0 ? (
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
