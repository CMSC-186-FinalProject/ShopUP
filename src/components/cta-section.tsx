import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl text-balance">
            Ready to join the UP marketplace?
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Whether you&apos;re looking to declutter, find great deals, or connect with fellow students, 
            ShopUP is your community marketplace. Sign up now and start trading!
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-base">
              <Link href="/auth/sign-up">Create Free Account</Link>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Learn More
            </Button>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60">
            Free to join • No hidden fees • Only for verified UP students
          </p>
        </div>
      </div>
    </section>
  )
}
