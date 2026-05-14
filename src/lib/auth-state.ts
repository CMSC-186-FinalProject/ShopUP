let isAuthenticated = false

export function getAuthState() {
  return isAuthenticated
}

export function setAuthState(nextValue: boolean) {
  isAuthenticated = nextValue
}