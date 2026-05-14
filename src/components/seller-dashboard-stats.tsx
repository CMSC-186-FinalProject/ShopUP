'use client'

import { Card } from '@/src/components/ui/card'
import { Eye, MessageSquare, Package, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  activeListings: number
  totalViews: number
  totalInquiries: number
  totalSales: number
}

export function SellerDashboardStats({
  activeListings,
  totalViews,
  totalInquiries,
  totalSales,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Active Listings',
      value: activeListings,
      icon: Package,
      color: 'bg-primary',
    },
    {
      label: 'Total Views',
      value: totalViews,
      icon: Eye,
      color: 'bg-blue-600',
    },
    {
      label: 'Inquiries',
      value: totalInquiries,
      icon: MessageSquare,
      color: 'bg-amber-600',
    },
    {
      label: 'Completed Sales',
      value: totalSales,
      icon: TrendingUp,
      color: 'bg-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
