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

function isUpEmailAddress(email: string) {
  return email.trim().toLowerCase().endsWith('@up.edu.ph')
}

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!isUpEmailAddress(normalizedEmail)) {
      setError('Please use your official @up.edu.ph email address')
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    const redirectTo =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
      `${window.location.origin}/auth/callback?next=/auth/confirmation-success&email=${encodeURIComponent(normalizedEmail)}`

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        const alreadyRegistered =
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists')

        if (alreadyRegistered) {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: normalizedEmail,
            options: {
              emailRedirectTo: redirectTo,
            },
          })

          if (resendError) throw resendError

          router.push(`/auth/sign-up-success?email=${encodeURIComponent(normalizedEmail)}`)
          return
        }

        throw error
      }

      router.push(`/auth/sign-up-success?email=${encodeURIComponent(normalizedEmail)}`)
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
          <p className="text-muted-foreground">Join the UP student marketplace</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-primary">Create Account</CardTitle>
            <CardDescription>
              Sign up for ShopUP in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">University Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@up.edu.ph"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border focus-visible:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Use your official UP email for verification</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border focus-visible:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">At least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Already have an account?</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/5"
              >
                <Link href="/auth/login">
                  Log In
                </Link>
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
              <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
              <p className="text-primary font-medium">Only UP students can create accounts</p>
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
