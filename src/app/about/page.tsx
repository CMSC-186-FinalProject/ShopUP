import { Header } from "@/src/components/header"
import { Footer } from "@/src/components/footer"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import Link from "next/link"
import { Heart, MapPin, ShieldCheck, MessageCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-20 lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
          <div className="container relative mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground" />
                </span>
                Our Story
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance mb-6">
                Building the Future of Campus Commerce
              </h1>
              <p className="text-lg leading-relaxed text-primary-foreground/80 max-w-2xl mx-auto">
                ShopUP was born from the simple idea that students should be able to buy
                and sell within their community safely, conveniently, and affordably.
                We serve as a dedicated ecosystem for trust and mutual support,
                streamlining the way students exchange goods and services.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Mission</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Empowering Student Entrepreneurs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                We believe that every student has something valuable to offer. Whether it's selling
                unused gadgets, handmade crafts, or pre-loved clothing, ShopUP provides the
                platform to turn campus needs and wants into opportunities.
              </p>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Our mission is to create a thriving marketplace where UP students can build their
                entrepreneurial skills, earn extra income, and contribute to a sustainable campus economy.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" className="text-base">
                  <Link href="/listings">Start Trading</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 lg:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Meet the Team</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Passionate Students Building for Students
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ShopUP was founded by UP Mindanao students who experienced the challenges of campus trading personally.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">👨‍💻</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Gilean Cyrus Alanza</h3>
                  <Badge variant="secondary" className="mb-3">Project Lead</Badge>
                  <p className="text-muted-foreground text-sm">
                    Computer Science student. Built the platform from scratch
                    to solve the lack of a centralized campus trading platform.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">👨‍💻</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Andrew Mante</h3>
                  <Badge variant="secondary" className="mb-3">UI/UX Designer</Badge>
                  <p className="text-muted-foreground text-sm">
                    Computer Science student. Designed the interface
                    that makes trading with other students seamless.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">👨‍💻</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Reigh Sean Veras</h3>
                  <Badge variant="secondary" className="mb-3">Backend Developer</Badge>
                  <p className="text-muted-foreground text-sm">
                    Computer Science student. Implemented the secure infrastructure
                    that ensures every transaction is safe and reliable.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance mb-6">
                Ready to Join the UP Trading Community?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Start buying, selling, or just browsing. Every great journey begins with a single step.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-base">
                  <Link href="/auth/sign-up">Get Started Today</Link>
                  <Heart className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link href="/listings">Browse Listings</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}