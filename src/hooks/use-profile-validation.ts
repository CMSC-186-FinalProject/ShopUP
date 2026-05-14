import { useCallback, useState } from 'react'
import { fetchApi } from '@/src/lib/api'

export interface UserProfile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  campus: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface CurrentUser {
  user: {
    id: string
    email: string
  }
  profile: UserProfile | null
}

export function useProfileValidation() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchApi<CurrentUser>('/api/me')
      setCurrentUser(response)
      return response
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load profile'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const isProfileComplete = useCallback((profile: UserProfile | null | undefined): boolean => {
    if (!profile) return false
    return !!(profile.full_name && profile.username && profile.campus)
  }, [])

  const validateProfile = useCallback(async (): Promise<{ isComplete: boolean; profile: UserProfile | null }> => {
    const user = currentUser || (await fetchCurrentUser())
    const isComplete = isProfileComplete(user.profile)
    return { isComplete, profile: user.profile }
  }, [currentUser, fetchCurrentUser, isProfileComplete])

  return {
    currentUser,
    setCurrentUser,
    isLoading,
    error,
    fetchCurrentUser,
    isProfileComplete,
    validateProfile,
  }
}
