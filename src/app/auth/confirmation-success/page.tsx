'use client'

import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ConfirmationSuccessPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Email Confirmed</h1>
          <p className="text-muted-foreground">Your account verification was successful</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center text-primary">Welcome to ShopUP</CardTitle>
            <CardDescription className="text-center">
              {email
                ? `Your email ${email} has been verified and your account is ready.`
                : 'Your email has been verified and your account is ready.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
              <p className="text-sm text-foreground">
                You can now log in, browse listings, and start trading with other UP students.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Verification complete</p>
                  <p className="text-xs text-muted-foreground">Your email address is now confirmed.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Account activated</p>
                  <p className="text-xs text-muted-foreground">You can sign in and use all core features.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ready to trade</p>
                  <p className="text-xs text-muted-foreground">Start buying and selling in the UP community.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <Button asChild className="w-full bg-primary hover:bg-accent text-white font-semibold">
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
