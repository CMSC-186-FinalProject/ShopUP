"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/src/components/ui/hover-card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { Menu, X, ShoppingBag } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { getAuthProfile, getAuthState, setAuthState, clearAuthState, hydrateAuthStateFromStorage } from "@/src/lib/auth-state"
import { fetchApi } from "@/src/lib/api"

interface MeResponse {
  user: {
    id: string
    email: string | null
  }
  profile: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAuthState())
  const [profile, setProfile] = useState(getAuthProfile())
  const [isProfileHydrating, setIsProfileHydrating] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const syncAuthState = async () => {
      if (isMounted) {
        setIsProfileHydrating(true)
      }

      const hydratedState = hydrateAuthStateFromStorage()

      if (isMounted && hydratedState.profile) {
        setProfile(hydratedState.profile)
      }

      const { data } = await supabase.auth.getUser()
      const nextIsAuthenticated = Boolean(data.user)

      if (isMounted) {
        setIsAuthenticated(nextIsAuthenticated)
      }

      if (nextIsAuthenticated) {
        const cachedProfile = getAuthProfile()

        if (isMounted && cachedProfile) {
          setProfile(cachedProfile)
        }

        try {
          const response = await fetchApi<MeResponse>('/api/me')

          if (isMounted) {
            const nextProfile = {
              fullName: response.profile?.full_name ?? null,
              username: response.profile?.username ?? null,
              avatarUrl: response.profile?.avatar_url ?? null,
              email: response.user.email,
            }

            setProfile(nextProfile)
            setAuthState(true, nextProfile)
          }
        } catch {
          if (isMounted) {
            setProfile(cachedProfile ?? null)
            if (cachedProfile) {
              setAuthState(true, cachedProfile)
            }
          }
        }
      } else if (isMounted) {
        setProfile(null)
        clearAuthState()
      }

      if (isMounted) {
        setIsProfileHydrating(false)
      }
    }

    syncAuthState()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextIsAuthenticated = Boolean(session?.user)
      setIsAuthenticated(nextIsAuthenticated)

      if (!nextIsAuthenticated) {
        clearAuthState()
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearAuthState()
    setIsAuthenticated(false)
    setProfile(null)
    setIsMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const profileLabel = profile?.fullName ?? profile?.username ?? profile?.email ?? 'Profile'

  const profileInitials = profileLabel
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ShopUP</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/#categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </Link>
            <Link href="/listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Listings
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isProfileHydrating ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
              </div>
            ) : isAuthenticated ? (
              <HoverCard openDelay={120} closeDelay={80}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Open profile menu"
                  >
                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                      <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profileLabel} />
                      <AvatarFallback className="font-semibold">
                        {profileInitials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent align="end" className="w-56 p-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profileLabel} />
                        <AvatarFallback className="font-semibold">{profileInitials || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{profileLabel}</p>
                        {profile?.email ? (
                          <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-border pt-3">
                      <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/profile">Profile</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/favorites">Favorites</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/conversations">Messages</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/orders">Orders</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/reviews">Reviews</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/seller/dashboard">Dashboard</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start text-destructive hover:text-white" onClick={handleSignOut}>
                        Sign out
                      </Button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#categories"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              ) : null}
              {isAuthenticated ? (
                <Link
                  href="/seller/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : null}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <Button variant="outline" size="sm" className="justify-start" onClick={handleSignOut}>
                    Sign out
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="justify-start">
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/auth/sign-up" onClick={() => setIsMenuOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
