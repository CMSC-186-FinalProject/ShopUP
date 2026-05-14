'use client'

import { useState } from 'react'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { SellerDashboardStats } from '@/src/components/seller-dashboard-stats'
import { MyListings } from '@/src/components/my-listings'
import { CreateListingForm } from '@/src/components/create-listing-form'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Settings,
  Star,
} from 'lucide-react'

export default function SellerDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome back, Maria!</h1>
            <p className="text-primary-foreground/90">
              You&apos;re doing great! Your rating is 4.8★ with 24 successful
              sales.
            </p>
          </div>

          {/* Dashboard Stats */}
          <SellerDashboardStats
            activeListings={4}
            totalViews={312}
            totalInquiries={23}
            totalSales={24}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">4 New Messages</h3>
                  <p className="text-sm text-muted-foreground">
                    From interested buyers
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
                  <h3 className="font-semibold">2 Pending Reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    From recent transactions
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
                  <h3 className="font-semibold">98% Response Rate</h3>
                  <p className="text-sm text-muted-foreground">
                    Great job staying responsive!
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
              <Card className="p-12 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Your recent orders
                </h3>
                <p className="text-muted-foreground">
                  You have 3 active orders and 24 completed sales.
                </p>
                <div className="mt-6 space-y-3">
                  <OrderCard
                    buyer="Juan Dela Cruz"
                    item="Gaming Laptop"
                    date="2 days ago"
                    status="Completed"
                  />
                  <OrderCard
                    buyer="Maria Garcia"
                    item="Calculus Textbook"
                    date="5 days ago"
                    status="Pending Review"
                  />
                  <OrderCard
                    buyer="Roberto Santos"
                    item="Mechanical Keyboard"
                    date="1 week ago"
                    status="Completed"
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card className="p-12 text-center">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  You have a 4.8★ rating
                </h3>
                <p className="text-muted-foreground mb-6">
                  Based on 24 buyer reviews
                </p>
                <div className="mt-6 space-y-3">
                  <ReviewCard
                    reviewer="Ana Reyes"
                    rating={5}
                    comment="Great seller! Item arrived quickly and in perfect condition."
                    date="2 days ago"
                  />
                  <ReviewCard
                    reviewer="Carlos Mendoza"
                    rating={5}
                    comment="Very responsive and honest about the condition. Highly recommended!"
                    date="1 week ago"
                  />
                  <ReviewCard
                    reviewer="Rosa Fernandez"
                    rating={4}
                    comment="Good seller, slight delay in shipping but otherwise excellent."
                    date="2 weeks ago"
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Listing Form Modal */}
      <CreateListingForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
      />

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
