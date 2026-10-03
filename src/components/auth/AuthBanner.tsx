import logoHeader from '../../assets/logo-header.png'
import { DairyIllustration } from './DairyIllustration'

export function AuthBanner() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#f0f9fa] via-[#e8f6f9] to-[#dff3f7] p-8 sm:p-12 lg:p-14">
      {/* Decorative organic background shapes matching the mockup */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cyan-100/50 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl"
        aria-hidden="true"
      />

      {/* Top: MilkGo Logo & Tagline */}
      <div className="relative z-10 flex flex-col items-start">
        <img
          src={logoHeader}
          alt="MilkGo"
          className="h-12 sm:h-14 w-auto object-contain object-left"
        />
        <p className="mt-2 text-sm font-medium tracking-wide text-cyan-800/80">
          Smarter Dairy. Healthier Tomorrow.
        </p>
      </div>

      {/* Center: Dairy Illustration */}
      <div className="relative z-10 my-auto py-6">
        <DairyIllustration />
      </div>

      {/* Bottom: Feature Pillars & Mission statement */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3 text-sm font-bold tracking-wider text-cyan-900 sm:text-base">
          <span>Track</span>
          <span className="size-1.5 rounded-full bg-cyan-600" />
          <span>Manage</span>
          <span className="size-1.5 rounded-full bg-cyan-600" />
          <span>Grow</span>
        </div>
        <p className="max-w-md text-xs sm:text-sm leading-relaxed text-slate-500">
          From farm to future, MilkGo helps you manage your dairy business efficiently and effortlessly.
        </p>
      </div>
    </div>
  )
}
