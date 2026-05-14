  import { Header } from "@/src/components/header"
import { HeroSection } from "@/src/components/hero-section"
import { FeaturesSection } from "@/src/components/features-section"
import { HowItWorksSection } from "@/src/components/how-it-works-section"
import { CategoriesSection } from "@/src/components/categories-section"
import { TestimonialsSection } from "@/src/components/testimonials-section"
import { CTASection } from "@/src/components/cta-section"
import { Footer } from "@/src/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CategoriesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
