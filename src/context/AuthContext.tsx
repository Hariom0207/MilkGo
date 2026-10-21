import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword,
  onAuthStateChanged, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile, type User,
} from 'firebase/auth'
import { doc, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'
import { api } from '../lib/api'
import { isAdminEmail, type UserProfile } from '../lib/roles'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Existing profile, else create: admin-email → admin/approved, self-signup → vendor/pending. */
async function loadOrCreateProfile(u: User): Promise<UserProfile> {
  const ref = doc(db, 'users', u.uid)
  const snap = await getDoc(ref)
  const admin = isAdminEmail(u.email)
  if (snap.exists()) {
    const p = { id: u.uid, ...(snap.data() as Omit<UserProfile, 'id'>) }
    if (admin) { p.role = 'admin'; p.status = 'approved'; p.vendorId = null }
    // Record every login/session restore so Admin panel lists all logged-in users.
    await setDoc(ref, { role: p.role, status: p.status, vendorId: p.vendorId, name: p.name || u.displayName || '', email: p.email || u.email || '', lastLoginAt: serverTimestamp(), loginCount: increment(1) }, { merge: true })
    return p
  }
  const p: UserProfile = {
    id: u.uid, name: u.displayName ?? '', email: u.email ?? '', phone: '',
    role: admin ? 'admin' : 'vendor', status: admin ? 'approved' : 'pending',
    vendorId: admin ? null : u.uid, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(), loginCount: 1,
  }
  await setDoc(ref, p)
  return p
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUser(u)
    if (!u) { setProfile(null); setLoading(false); return }
    try {
      // Backend is the RBAC authority: /me creates profile, enforces admin emails, records login.
      const p = await api.get<UserProfile>('/me')
      setProfile({ ...p, role: p.role === ('owner' as never) ? 'admin' : p.role })
    } catch {
      try { setProfile(await loadOrCreateProfile(u)) } catch { setProfile(null) } // backend offline fallback
    }
    setLoading(false)
  }), [])

  const value: AuthContextValue = {
    user, profile, loading,
    login: async (email, password, remember) => {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
      await signInWithEmailAndPassword(auth, email, password)
    },
    signup: async (name, email, password, phone = '') => {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      const admin = isAdminEmail(email)
      const p: UserProfile = {
        id: cred.user.uid, name, email, phone, role: admin ? 'admin' : 'vendor',
        status: admin ? 'approved' : 'pending', vendorId: admin ? null : cred.user.uid,
        createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(), loginCount: 1,
      }
      await setDoc(doc(db, 'users', cred.user.uid), p)
      setProfile(p); setUser(cred.user)
    },
    loginWithGoogle: async () => { await signInWithPopup(auth, googleProvider) },
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
    logout: () => signOut(auth),
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
