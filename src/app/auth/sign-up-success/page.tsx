'use client'

import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'

const RESEND_COOLDOWN_MS = 60_000
const RESEND_COOLDOWN_STORAGE_PREFIX = 'shopup:resend-cooldown:'

function getCooldownStorageKey(email: string) {
  return `${RESEND_COOLDOWN_STORAGE_PREFIX}${email.toLowerCase()}`
}

function SignUpSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') ?? ''
  const [isResending, setIsResending] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)

  useEffect(() => {
    if (!email || typeof window === 'undefined') {
      return
    }

    const storedCooldown = window.localStorage.getItem(getCooldownStorageKey(email))
    const nextAllowedAt = storedCooldown ? Number(storedCooldown) : null

    if (nextAllowedAt && nextAllowedAt > Date.now()) {
      setCooldownUntil(nextAllowedAt)
      return
    }

    if (storedCooldown) {
      window.localStorage.removeItem(getCooldownStorageKey(email))
    }
  }, [email])

  useEffect(() => {
    if (!cooldownUntil) {
      return
    }

    const interval = window.setInterval(() => {
      if (Date.now() >= cooldownUntil) {
        setCooldownUntil(null)
        if (email && typeof window !== 'undefined') {
          window.localStorage.removeItem(getCooldownStorageKey(email))
        }
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [cooldownUntil, email])

  const cooldownRemainingSeconds = cooldownUntil
    ? Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
    : 0

  const handleResend = async () => {
    if (!email) {
      setStatusMessage('No email was found for this request. Please sign up again.')
      return
    }

    if (cooldownUntil && cooldownUntil > Date.now()) {
      setStatusMessage(`Please wait ${cooldownRemainingSeconds}s before requesting another email.`)
      return
    }

    setIsResending(true)
    setStatusMessage(null)

    try {
      const supabase = createClient()
      const redirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback?next=/auth/confirmation-success&email=${encodeURIComponent(email)}`

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) throw error

      const nextAllowedAt = Date.now() + RESEND_COOLDOWN_MS
      setCooldownUntil(nextAllowedAt)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(getCooldownStorageKey(email), nextAllowedAt.toString())
      }

      setStatusMessage(`A new verification email was sent to ${email}.`)
      router.refresh()
    } catch (error: unknown) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Welcoming Isko/Iska!</h1>
          <p className="text-muted-foreground">Your account is almost ready</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-primary text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We&apos;ve sent a verification link to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                Please click the verification link in your email to confirm your account and get started on UPTrade.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Check your spam folder</p>
                  <p className="text-xs text-muted-foreground">If you don&apos;t see the email, check your spam folder</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Verify your email</p>
                  <p className="text-xs text-muted-foreground">Click the link to activate your account</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Start trading</p>
                  <p className="text-xs text-muted-foreground">Once verified, you can buy and sell items</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full bg-primary hover:bg-accent text-white font-semibold">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground mb-2">Didn&apos;t receive an email?</p>
          {email ? (
            <Button
              variant="link"
              className="h-auto p-0 text-primary hover:text-accent font-medium"
              onClick={handleResend}
              disabled={isResending || (cooldownUntil !== null && cooldownUntil > Date.now())}
            >
              {isResending
                ? 'Resending...'
                : cooldownUntil && cooldownUntil > Date.now()
                  ? `Resend available in ${cooldownRemainingSeconds}s`
                  : 'Resend verification email'}
            </Button>
          ) : (
            <Link href="/auth/sign-up" className="text-primary hover:text-accent font-medium">
              Try signing up again
            </Link>
          )}
          {statusMessage && (
            <p className="mt-3 text-xs text-muted-foreground">{statusMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SignUpSuccessLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={<SignUpSuccessLoading />}>
      <SignUpSuccessContent />
    </Suspense>
  )
}
