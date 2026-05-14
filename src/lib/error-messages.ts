import { ApiError } from './api'
import { formatValidationIssues } from './validation-format'

export function getFriendlyErrorMessage(err: unknown): string {
  // ApiError: try to extract structured payload
  if (err instanceof ApiError) {
    const payload = err.payload as any

    if (payload) {
      // Common pattern: { error: ... }
      const serverError = payload.error ?? payload.message ?? payload

      if (Array.isArray(serverError)) {
        // Likely an array of zod issues
        return formatValidationIssues(serverError)
      }

      if (typeof serverError === 'string') {
        return serverError
      }

      if (typeof serverError === 'object' && serverError !== null) {
        // If it's a zod error shape with issues
        if (Array.isArray((serverError as any).issues)) {
          return formatValidationIssues((serverError as any).issues)
        }

        if ('message' in serverError && typeof serverError.message === 'string') {
          return serverError.message
        }
      }
    }

    return String(err.message ?? 'Request failed')
  }

  if (err instanceof Error) {
    return err.message
  }

  try {
    return JSON.stringify(err) || 'An unknown error occurred'
  } catch (e) {
    return 'An unknown error occurred'
  }
}

export default getFriendlyErrorMessage
