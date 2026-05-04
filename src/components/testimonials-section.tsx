import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Maria Santos",
    role: "BS Computer Science, 3rd Year",
    content: "Finally, a platform made just for us! I sold my old textbooks within a day. No more awkward FB posts or random messages from non-UP people.",
    rating: 5
  },
  {
    name: "Juan dela Cruz",
    role: "BS Agribusiness, 2nd Year",
    content: "The campus meetup feature is genius. I can schedule trades between my classes. Super convenient and I feel safe knowing everyone is a verified student.",
    rating: 5
  },
  {
    name: "Ana Reyes",
    role: "BA Communication Arts, 4th Year",
    content: "Saved so much money buying second-hand items from fellow students. The community here is so helpful and transactions are always smooth.",
    rating: 5
  }
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Testimonials</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Loved by Iskolars ng Bayan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from students who have made UPTrade their go-to marketplace.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-card-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
