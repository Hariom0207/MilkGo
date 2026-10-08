import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react'
import { AuthBanner } from '../components/auth/AuthBanner'
import { AuthInput } from '../components/auth/AuthInput'
import { GoogleButton } from '../components/auth/GoogleButton'

export function SignUpPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setError('Passwords do not match. Please re-check.')
      return
    }

    setError('')
    setIsLoading(true)

    // Save session and redirect to Home screen
    setTimeout(() => {
      setIsLoading(false)
      const displayName = formData.fullName.trim() || 'New User'
      localStorage.setItem(
        'milkgo_user',
        JSON.stringify({
          fullName: displayName,
          email: formData.email.trim() || 'user@milkgo.com',
          mobileNumber: formData.mobileNumber.trim(),
          loggedIn: true,
        })
      )
      navigate('/home')
    }, 250)
  }

  const handleGoogleSignup = () => {
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
        {/* Left Side: Brand Banner & Dairy Illustration */}
        <AuthBanner />

        {/* Right Side: Create Account Form */}
        <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-12 md:px-16 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-[420px]">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create Your Account
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Get started with MilkGo and take your dairy business to the next level.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <AuthInput
                label="Full Name"
                name="fullName"
                type="text"
                icon={User}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />

              <AuthInput
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />

              <AuthInput
                label="Mobile Number"
                name="mobileNumber"
                type="tel"
                icon={Phone}
                placeholder="Enter your mobile number"
                value={formData.mobileNumber}
                onChange={handleChange}
              />

              <AuthInput
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />

              <AuthInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                icon={Lock}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e7490] py-3.5 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#155e75] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                <span>{isLoading ? 'Entering...' : 'Sign Up'}</span>
                <ArrowRight className="size-4" />
              </button>

              {/* Direct Skip Bypass */}
              <div className="text-center pt-1">
                <Link
                  to="/home"
                  className="text-xs font-medium text-slate-400 hover:text-[#0e7490] hover:underline transition"
                >
                  Skip without sign up & Enter Home →
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                OR
              </span>
            </div>

            {/* Google Signup Button */}
            <GoogleButton onClick={handleGoogleSignup} text="Continue with Google" />

            {/* Bottom Link */}
            <div className="mt-6 text-center text-xs sm:text-sm text-slate-500">
              <span>Already have an account? </span>
              <Link
                to="/login"
                className="font-semibold text-[#0e7490] hover:text-[#155e75] hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
