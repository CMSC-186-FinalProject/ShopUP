import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { ArrowRight, Users, ShieldCheck, Zap } from "lucide-react"

export function HeroSection() {
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
                  <span className="text-2xl font-bold">500+</span>
                </div>
                <span className="text-sm text-primary-foreground/70">Active Users</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-2xl font-bold">100%</span>
                </div>
                <span className="text-sm text-primary-foreground/70">Verified Students</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <Zap className="h-5 w-5" />
                  <span className="text-2xl font-bold">1,000+</span>
                </div>
                <span className="text-sm text-primary-foreground/70">Items Traded</span>
              </div>
            </div>
          </div>
          <div className="relative lg:pl-8">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-4 bg-primary-foreground/5 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl bg-card shadow-xl">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <span className="text-6xl">📚</span>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-card-foreground">Engineering Textbooks</p>
                      <p className="text-sm text-muted-foreground">₱350</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl bg-card shadow-xl">
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <span className="text-5xl">🎧</span>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-card-foreground">Wireless Earbuds</p>
                      <p className="text-sm text-muted-foreground">₱800</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="overflow-hidden rounded-2xl bg-card shadow-xl">
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <span className="text-5xl">💻</span>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-card-foreground">Laptop Stand</p>
                      <p className="text-sm text-muted-foreground">₱450</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl bg-card shadow-xl">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <span className="text-6xl">🎒</span>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-card-foreground">School Backpack</p>
                      <p className="text-sm text-muted-foreground">₱600</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
