import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: LucideIcon
  error?: string
}

export function AuthInput({
  label,
  icon: Icon,
  type = 'text',
  error,
  id,
  className = '',
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const computedType = isPassword ? (showPassword ? 'text' : 'password') : type
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={inputId} className="text-xs sm:text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 text-slate-400">
          <Icon className="size-4 sm:size-5" />
        </div>

        <input
          id={inputId}
          type={computedType}
          className={`w-full rounded-xl border bg-white py-2.5 sm:py-3 pl-10 sm:pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-[#0e7490]/25 focus:border-[#0e7490] ${
            error ? 'border-red-400 focus:ring-red-400/25 focus:border-red-500' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="size-4 sm:size-5" />
            ) : (
              <Eye className="size-4 sm:size-5" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
