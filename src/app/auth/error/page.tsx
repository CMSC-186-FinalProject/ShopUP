import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-destructive mb-2">Authentication Error</h1>
          <p className="text-muted-foreground">Something went wrong with your authentication</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">Unable to Complete Sign In</CardTitle>
            <CardDescription className="text-center">
              The authentication link may have expired or is invalid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                Please try signing up again or contact support if the issue persists.
              </p>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full bg-primary hover:bg-accent text-white font-semibold">
                <Link href="/auth/sign-up">Sign Up Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                <Link href="/auth/login">Try Logging In</Link>
              </Button>
            </div>

            <div className="pt-2">
              <Button asChild variant="ghost" className="w-full text-primary hover:text-accent">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">Need help? Contact our support team</p>
          <p className="text-primary font-medium mt-1">support@uptrade.ph</p>
        </div>
      </div>
    </div>
  )
}
