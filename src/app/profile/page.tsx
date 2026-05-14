'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Badge } from '@/src/components/ui/badge'
import { fetchApi } from '@/src/lib/api'
import { getFriendlyErrorMessage } from '@/src/lib/error-messages'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { AvatarCropDialog } from '@/src/components/avatar-crop-dialog'
import { Edit3, MapPin, Mail, User, Package, MessageSquare, Star } from 'lucide-react'
import { uploadToCloudinary } from '@/src/lib/cloudinary-upload'
import { setAuthState } from '@/src/lib/auth-state'

interface MeProfile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  campus: string | null
  bio: string | null
}

interface MeResponse {
  user: {
    id: string
    email: string | null
  }
  profile: MeProfile | null
}

interface ProfileFormState {
  fullName: string
  username: string
  avatarUrl: string
  campus: string
  bio: string
}

export default function ProfilePage() {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null)
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileFormState>({
    fullName: '',
    username: '',
    avatarUrl: '',
    campus: '',
    bio: '',
  })
  const [originalProfile, setOriginalProfile] = useState<MeProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const response = await fetchApi<MeResponse>('/api/me')

        if (!isMounted) {
          return
        }

        setUserEmail(response.user.email)
        setProfileId(response.user.id)
        setOriginalProfile(response.profile)
        setForm({
          fullName: response.profile?.full_name ?? '',
          username: response.profile?.username ?? '',
          avatarUrl: response.profile?.avatar_url ?? '',
          campus: response.profile?.campus ?? '',
          bio: response.profile?.bio ?? '',
        })
      } catch (error: unknown) {
        if (isMounted) {
          setError(getFriendlyErrorMessage(error) || 'Unable to load categories')
        }

        const message = error instanceof Error ? error.message : 'Unable to load profile'

        if (message.toLowerCase().includes('unauthorized')) {
          router.push('/auth/login')
          return
        }

        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [router])

  const initials = useMemo(() => {
    const source = form.fullName || form.username || userEmail || 'U'
    return source
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [form.fullName, form.username, userEmail])

  useEffect(() => {
    return () => {
      if (avatarCropSrc) {
        URL.revokeObjectURL(avatarCropSrc)
      }
    }
  }, [avatarCropSrc])

  const hasChanges = useMemo(() => {
    if (!originalProfile) {
      return Boolean(form.fullName || form.username || form.avatarUrl || form.campus || form.bio)
    }

    return (
      form.fullName !== (originalProfile.full_name ?? '') ||
      form.username !== (originalProfile.username ?? '') ||
      form.avatarUrl !== (originalProfile.avatar_url ?? '') ||
      form.campus !== (originalProfile.campus ?? '') ||
      form.bio !== (originalProfile.bio ?? '')
    )
  }, [form, originalProfile])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError(null)
    setSuccess(null)

    if (avatarCropSrc) {
      URL.revokeObjectURL(avatarCropSrc)
    }

    setSelectedAvatarFile(file)
    setAvatarCropSrc(URL.createObjectURL(file))
    setIsAvatarCropOpen(true)
    event.target.value = ''
  }

  const handleAvatarCropComplete = async (croppedFile: File) => {
    setIsUploadingAvatar(true)
    setError(null)
    setSuccess(null)

    try {
      const uploaded = await uploadToCloudinary(croppedFile, 'shopup/avatars')
      setForm((current) => ({ ...current, avatarUrl: uploaded.secureUrl }))
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error) || 'Unable to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
      setSelectedAvatarFile(null)
      if (avatarCropSrc) {
        URL.revokeObjectURL(avatarCropSrc)
      }
      setAvatarCropSrc(null)
    }
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await fetchApi('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: form.fullName,
          username: form.username,
          avatarUrl: form.avatarUrl || null,
          campus: form.campus,
          bio: form.bio || null,
        }),
      })

      const refreshed = await fetchApi<MeResponse>('/api/me')

      setOriginalProfile(refreshed.profile)
      setUserEmail(refreshed.user.email)
      setProfileId(refreshed.user.id)
      setForm({
        fullName: refreshed.profile?.full_name ?? '',
        username: refreshed.profile?.username ?? '',
        avatarUrl: refreshed.profile?.avatar_url ?? '',
        campus: refreshed.profile?.campus ?? '',
        bio: refreshed.profile?.bio ?? '',
      })
      setAuthState(true, {
        fullName: refreshed.profile?.full_name ?? null,
        username: refreshed.profile?.username ?? null,
        avatarUrl: refreshed.profile?.avatar_url ?? null,
        email: refreshed.user.email,
      })
      setSuccess('Profile updated successfully.')
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error) || 'Unable to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="p-6 md:p-10 animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-24 rounded-2xl bg-muted" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-12 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
              <div className="h-24 rounded bg-muted md:col-span-2" />
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">Profile</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your account details</h1>
              <p className="text-muted-foreground max-w-2xl">
                Keep your public profile up to date so buyers and sellers know who they&apos;re dealing with.
              </p>
            </div>

            <Card className="p-6 md:p-8 border-border/70 shadow-sm">
              {error ? (
                <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              ) : null}

              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col gap-6 rounded-2xl border border-border bg-muted/30 p-5 md:flex-row md:items-center">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                    <AvatarImage src={form.avatarUrl || undefined} alt={form.fullName || 'Profile avatar'} />
                    <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">{form.fullName || 'Your name'}</h2>
                    <p className="text-sm text-muted-foreground">{userEmail ?? 'No email available'}</p>
                    <p className="text-sm text-muted-foreground">{profileId ? `Profile ID: ${profileId}` : ''}</p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarSelect}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? 'Uploading...' : 'Upload avatar'}
                      </Button>
                    </div>
                  </div>
                </div>

                <AvatarCropDialog
                  open={isAvatarCropOpen}
                  imageSrc={avatarCropSrc}
                  fileName={selectedAvatarFile?.name ?? 'avatar.jpg'}
                  onOpenChange={(open) => {
                    setIsAvatarCropOpen(open)

                    if (!open) {
                      setSelectedAvatarFile(null)
                      if (avatarCropSrc) {
                        URL.revokeObjectURL(avatarCropSrc)
                      }
                      setAvatarCropSrc(null)
                    }
                  }}
                  onCropComplete={handleAvatarCropComplete}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full name
                    </label>
                    <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Juan Dela Cruz" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Username
                    </label>
                    <Input name="username" value={form.username} onChange={handleChange} placeholder="juan.dela.cruz" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Avatar URL
                    </label>
                    <Input name="avatarUrl" value={form.avatarUrl} onChange={handleChange} placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Campus
                    </label>
                    <Input name="campus" value={form.campus} onChange={handleChange} placeholder="UP Mindanao" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Bio
                    </label>
                    <Textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell people a little about what you sell or what you're looking for."
                      rows={5}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    This profile is used across your listings, messages, and reviews.
                  </p>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" asChild>
                      <Link href="/seller/dashboard">Go to dashboard</Link>
                    </Button>
                    <Button type="submit" disabled={isSaving || !hasChanges}>
                      {isSaving ? 'Saving...' : 'Save profile'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Profile visibility</p>
                    <p className="text-muted-foreground">Your name, campus, and bio appear to other users in marketplace interactions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Reputation</p>
                    <p className="text-muted-foreground">Reviews attached to completed orders will keep building your seller profile.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Next steps</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>1. Update your name and username so buyers can recognize you.</p>
                <p>2. Add a campus and bio to make your profile feel complete.</p>
                <p>3. Set an avatar URL if you want a visible profile image right away.</p>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}