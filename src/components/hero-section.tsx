"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { ArrowRight, Users, ShieldCheck, Zap } from "lucide-react"
import { fetchApi } from "@/src/lib/api"

interface HomeStats {
  activeUsers: number
  verifiedStudents: number
  itemsTraded: number
  activeListings: number
}

interface FeaturedListing {
  id: string
  title: string
  price: number
  images: Array<{ image_url: string }>
}

export function HeroSection() {
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([])

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      try {
        const [statsResponse, listingsResponse] = await Promise.all([
          fetchApi<{ data: HomeStats }>('/api/home-stats'),
          fetchApi<{ data: FeaturedListing[] }>('/api/listings?status=active&limit=4&sort=popular'),
        ])

        if (isMounted) {
          setStats(statsResponse.data)
          setFeaturedListings(listingsResponse.data)
        }
      } catch {
        if (isMounted) {
          setStats({
            activeUsers: 0,
            verifiedStudents: 0,
            itemsTraded: 0,
            activeListings: 0,
          })
          setFeaturedListings([])
        }
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  const activeUsers = stats?.activeUsers ?? '—'
  const activeListings = stats?.activeListings ?? '—'
  const itemsTraded = stats?.itemsTraded ?? '—'

  return (
    <section className="relative overflow-hidden bg-primary py-20 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
      <div className="container relative mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground" />
              </span>
              Now serving UP Mindanao students
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance">
              Your Campus Marketplace for Isko &amp; Iska
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/80">
              Buy and sell items within the UP community. From textbooks to dorm essentials, 
              connect with fellow students in a trusted, secure marketplace built for Iskolars ng Bayan.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" className="text-base">
                <Link href="/seller/dashboard">Start Selling</Link>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="/listings">Browse Listings</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold">{activeUsers}</span>
                </div>
                <span className="text-sm text-primary-foreground/70">Active Users</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <ShieldCheck className="h-5 w-5" />
                    <span className="text-2xl font-bold">{activeListings}</span>
                </div>
                  <span className="text-sm text-primary-foreground/70">Active Listings</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <Zap className="h-5 w-5" />
                  <span className="text-2xl font-bold">{itemsTraded}</span>
                </div>
                <span className="text-sm text-primary-foreground/70">Items Traded</span>
              </div>
            </div>
          </div>
          <div className="relative lg:pl-8">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-4 bg-primary-foreground/5 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {featuredListings.length > 0 ? (
                  featuredListings.map((listing, index) => (
                    <div key={listing.id} className={`overflow-hidden rounded-2xl bg-card shadow-xl ${index % 2 === 1 ? 'pt-8' : ''}`}>
                      <div className={`relative bg-muted ${index % 2 === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}>
                        <Image
                          src={listing.images[0]?.image_url ?? '/placeholder.svg'}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-medium text-card-foreground line-clamp-1">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">₱{listing.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="h-48 rounded-2xl bg-card shadow-xl animate-pulse" />
                      <div className="h-40 rounded-2xl bg-card shadow-xl animate-pulse" />
                    </div>
                    <div className="space-y-4 pt-8">
                      <div className="h-40 rounded-2xl bg-card shadow-xl animate-pulse" />
                      <div className="h-48 rounded-2xl bg-card shadow-xl animate-pulse" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
