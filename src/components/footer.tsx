import Link from "next/link"
import { ShoppingBag, Facebook, Instagram, Twitter } from "lucide-react"

const footerLinks = {
  marketplace: [
    { name: "Browse Listings", href: "#" },
    { name: "Sell an Item", href: "#" },
    { name: "Categories", href: "#categories" },
    { name: "How It Works", href: "#how-it-works" }
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Safety Tips", href: "#" },
    { name: "Community Guidelines", href: "#" },
    { name: "Report an Issue", href: "#" }
  ],
  company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" }
  ]
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-card-foreground">UPTrade</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The trusted marketplace for University of the Philippines students. 
              Buy and sell within your campus community.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Marketplace</h3>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 UPTrade. Made with ❤️ for the Isko/Iska community.
          </p>
          <p className="text-sm text-muted-foreground">
            Not affiliated with the University of the Philippines
          </p>
        </div>
      </div>
    </footer>
  )
}
