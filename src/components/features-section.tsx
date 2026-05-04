import { ShieldCheck, MessageCircle, MapPin, CreditCard, Bell, Users } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Students Only",
    description: "All users are verified UP students with their official university email, ensuring a safe and trusted community."
  },
  {
    icon: MessageCircle,
    title: "In-App Messaging",
    description: "Chat directly with buyers and sellers within the platform. No need to share personal contact details."
  },
  {
    icon: MapPin,
    title: "Campus Meetups",
    description: "Arrange safe meetup spots around campus. Trade items conveniently between classes."
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Support for GCash, bank transfers, and cash on meetup. Choose what works best for you."
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get notified when items you&apos;re looking for are listed, or when someone is interested in your items."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Rate and review transactions. Build your reputation as a trusted member of the UP trading community."
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Features</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything you need to trade safely
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built specifically for the UP community, with features that make buying and selling items easy, safe, and convenient.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
