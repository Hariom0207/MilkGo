import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { AuthBanner } from '../components/auth/AuthBanner'
import { AuthInput } from '../components/auth/AuthInput'
import { GoogleButton } from '../components/auth/GoogleButton'

export function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Save session and navigate to Home screen
    setTimeout(() => {
      setIsLoading(false)
      const userToSave = identifier.trim() || 'Ramesh Kumar'
      const displayName = userToSave.includes('@') ? userToSave.split('@')[0] : userToSave
      localStorage.setItem(
        'milkgo_user',
        JSON.stringify({ fullName: displayName, identifier: userToSave, loggedIn: true })
      )
      navigate('/home')
    }, 250)
  }

  const handleGoogleLogin = () => {
    localStorage.setItem(
      'milkgo_user',
      JSON.stringify({ fullName: 'Google User', loggedIn: true })
    )
    navigate('/home')
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <div className="grid w-full grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Brand Banner & Dairy Illustration */}
        <AuthBanner />

        {/* Right Side: Login Form */}
        <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-12 md:px-16 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-[420px]">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome Back!
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Log in to your MilkGo account
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthInput
                label="Email or Mobile Number"
                name="identifier"
                type="text"
                icon={Mail}
                placeholder="Enter your email or mobile number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />

              <AuthInput
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-[#0e7490] focus:ring-[#0e7490] accent-[#0e7490] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Password reset link has been sent to your registered contact.')
                  }}
                  className="text-xs sm:text-sm font-medium text-[#0e7490] hover:text-[#155e75] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e7490] py-3.5 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#155e75] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                <span>{isLoading ? 'Entering...' : 'Login'}</span>
                <ArrowRight className="size-4" />
              </button>

              {/* Direct Skip Bypass */}
              <div className="text-center pt-1">
                <Link
                  to="/home"
                  className="text-xs font-medium text-slate-400 hover:text-[#0e7490] hover:underline transition"
                >
                  Skip without login & Enter Home →
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                OR
              </span>
            </div>

            {/* Google Login Button */}
            <GoogleButton onClick={handleGoogleLogin} text="Continue with Google" />

            {/* Bottom Link */}
            <div className="mt-8 text-center text-xs sm:text-sm text-slate-500">
              <span>Don't have an account? </span>
              <Link
                to="/signup"
                className="font-semibold text-[#0e7490] hover:text-[#155e75] hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
