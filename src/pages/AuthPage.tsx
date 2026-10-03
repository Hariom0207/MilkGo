import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react'
import { AuthBanner } from '../components/auth/AuthBanner'
import { AuthInput } from '../components/auth/AuthInput'
import { GoogleButton } from '../components/auth/GoogleButton'

interface AuthPageProps {
  defaultMode?: 'login' | 'signup'
}

export function AuthPage({ defaultMode = 'signup' }: AuthPageProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const initialMode = tabParam === 'login' || tabParam === 'signup' ? tabParam : defaultMode
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Sign up form state
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTabSwitch = (newMode: 'login' | 'signup') => {
    setMode(newMode)
    setError('')
    setSearchParams({ tab: newMode }, { replace: true })
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter your email or mobile number and password.')
      return
    }

    setError('')
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      const displayName = loginIdentifier.includes('@')
        ? loginIdentifier.split('@')[0]
        : loginIdentifier
      localStorage.setItem(
        'milkgo_user',
        JSON.stringify({
          fullName: displayName,
          identifier: loginIdentifier,
          loggedIn: true,
        })
      )
      navigate('/home')
    }, 500)
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !signupData.fullName.trim() ||
      !signupData.email.trim() ||
      !signupData.mobileNumber.trim() ||
      !signupData.password.trim() ||
      !signupData.confirmPassword.trim()
    ) {
      setError('Please fill in all the required fields.')
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    setError('')
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      localStorage.setItem(
        'milkgo_user',
        JSON.stringify({
          fullName: signupData.fullName,
          email: signupData.email,
          mobileNumber: signupData.mobileNumber,
          loggedIn: true,
        })
      )
      navigate('/home')
    }, 500)
  }

  const handleGoogleAuth = () => {
    localStorage.setItem(
      'milkgo_user',
      JSON.stringify({
        fullName: 'Google User',
        email: 'user@google.com',
        loggedIn: true,
      })
    )
    navigate('/home')
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <div className="grid w-full grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Brand Visual & Illustration */}
        <AuthBanner />

        {/* Right Side: Auth Forms */}
        <div className="flex flex-col justify-center bg-white px-6 py-8 sm:px-12 md:px-16 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[440px]">
            {/* Mode Switcher Tabs */}
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#0e7490] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#0e7490] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Login
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              /* LOGIN FORM */
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Welcome Back!
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Log in to your MilkGo account
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <AuthInput
                    label="Email or Mobile Number"
                    name="identifier"
                    type="text"
                    icon={Mail}
                    placeholder="Enter your email or mobile number"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />

                  <AuthInput
                    label="Password"
                    name="password"
                    type="password"
                    icon={Lock}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="size-4 rounded border-slate-300 text-[#0e7490] focus:ring-[#0e7490] accent-[#0e7490] cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to your registered contact!')}
                      className="text-xs sm:text-sm font-medium text-[#0e7490] hover:text-[#155e75] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e7490] py-3 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#155e75] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    <span>{isLoading ? 'Logging in...' : 'Login'}</span>
                    <ArrowRight className="size-4" />
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-5 flex items-center justify-center">
                  <div className="w-full border-t border-slate-200" />
                  <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                    OR
                  </span>
                </div>

                {/* Google Button */}
                <GoogleButton onClick={handleGoogleAuth} text="Continue with Google" />

                {/* Bottom Link */}
                <div className="mt-6 text-center text-xs sm:text-sm text-slate-500">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('signup')}
                    className="font-semibold text-[#0e7490] hover:text-[#155e75] hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            ) : (
              /* SIGN UP FORM */
              <div>
                <div className="mb-5">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Create Your Account
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Get started with MilkGo and take your dairy business to the next level.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <AuthInput
                    label="Full Name"
                    name="fullName"
                    type="text"
                    icon={User}
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={(e) =>
                      setSignupData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    required
                  />

                  <AuthInput
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={Mail}
                    placeholder="Enter your email address"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />

                  <AuthInput
                    label="Mobile Number"
                    name="mobileNumber"
                    type="tel"
                    icon={Phone}
                    placeholder="Enter your mobile number"
                    value={signupData.mobileNumber}
                    onChange={(e) =>
                      setSignupData((prev) => ({ ...prev, mobileNumber: e.target.value }))
                    }
                    required
                  />

                  <AuthInput
                    label="Password"
                    name="password"
                    type="password"
                    icon={Lock}
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />

                  <AuthInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    icon={Lock}
                    placeholder="Re-enter your password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    required
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e7490] py-3 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#155e75] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    <span>{isLoading ? 'Creating account...' : 'Sign Up'}</span>
                    <ArrowRight className="size-4" />
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-full border-t border-slate-200" />
                  <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                    OR
                  </span>
                </div>

                {/* Google Button */}
                <GoogleButton onClick={handleGoogleAuth} text="Continue with Google" />

                {/* Bottom Link */}
                <div className="mt-5 text-center text-xs sm:text-sm text-slate-500">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="font-semibold text-[#0e7490] hover:text-[#155e75] hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
