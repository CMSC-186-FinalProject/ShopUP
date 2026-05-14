export interface AuthProfileState {
  fullName: string | null
  username: string | null
  avatarUrl: string | null
  email: string | null
}

const AUTH_STATE_KEY = 'shopup-auth-state'

let isAuthenticated = false
let currentProfile: AuthProfileState | null = null

function readPersistedAuthState() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STATE_KEY)

    if (!raw) {
      return
    }

    const parsed = JSON.parse(raw) as {
      isAuthenticated?: boolean
      profile?: AuthProfileState | null
    }

    isAuthenticated = Boolean(parsed.isAuthenticated)
    currentProfile = parsed.profile ?? null
  } catch {
    window.localStorage.removeItem(AUTH_STATE_KEY)
  }
}

function persistAuthState() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      AUTH_STATE_KEY,
      JSON.stringify({
        isAuthenticated,
        profile: currentProfile,
      })
    )
  } catch {
    // Ignore storage failures.
  }
}

export function getAuthState() {
  return isAuthenticated
}

export function getAuthProfile() {
  return currentProfile
}

export function setAuthState(nextValue: boolean, profile?: AuthProfileState | null) {
  isAuthenticated = nextValue

  if (profile !== undefined) {
    currentProfile = profile
  }

  persistAuthState()
}

export function clearAuthState() {
  isAuthenticated = false
  currentProfile = null
  persistAuthState()
}

export function hydrateAuthStateFromStorage() {
  readPersistedAuthState()
  return {
    isAuthenticated,
    profile: currentProfile,
  }
}