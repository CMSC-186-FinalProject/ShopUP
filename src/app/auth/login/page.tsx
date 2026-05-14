'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">ShopUP</h1>
          <p className="text-muted-foreground">Welcome back, Isko/Iska!</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-primary">Log In</CardTitle>
            <CardDescription>
              Sign in to your ShopUP account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@up.edu.ph"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border focus-visible:ring-primary"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-accent text-white font-semibold py-2"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">New to UPTrade?</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/5"
              >
                <Link href="/auth/sign-up">
                  Create Account
                </Link>
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-primary hover:text-accent text-sm font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
