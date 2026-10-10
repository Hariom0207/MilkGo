import { FirebaseError } from 'firebase/app'

const messages: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Allow popups and retry.',
}

/** Returns null when the user simply closed the Google popup (not an error worth showing). */
export function authErrorMessage(err: unknown): string | null {
  if (err instanceof FirebaseError) {
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      return null
    }
    return messages[err.code] ?? 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}
