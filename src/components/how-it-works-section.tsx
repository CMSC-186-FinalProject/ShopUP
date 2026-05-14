import { UserPlus, Camera, Handshake, Star } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description: "Sign up with your UP email address to verify you' re part of the Isko/Iska community."
  },
  {
    icon: Camera,
    step: "02",
    title: "List Your Items",
    description: "Take photos, set your price, and write a description. Your listing goes live instantly."
  },
  {
    icon: Handshake,
    step: "03",
    title: "Connect & Trade",
    description: "Chat with interested buyers, arrange a meetup on campus, and complete the transaction."
  },
  {
    icon: Star,
    step: "04",
    title: "Rate & Review",
    description: "Leave feedback after each transaction to help build trust in the community."
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Start trading in minutes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting started is easy. Follow these simple steps to join the UP student marketplace.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card text-sm font-bold text-primary border-2 border-primary">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
