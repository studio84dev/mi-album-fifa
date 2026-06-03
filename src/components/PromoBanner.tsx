import { useState } from 'react'

const GOOGLE_SVG = (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

interface PromoBannerProps {
  title: string
  body: string
  icon?: string
  onLogin: () => void
  onDismiss?: () => void
  storageKey?: string
  className?: string
}

export function PromoBanner({
  title,
  body,
  icon = '✨',
  onLogin,
  onDismiss,
  storageKey,
  className,
}: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(() =>
    storageKey ? !!localStorage.getItem(storageKey) : false
  )

  if (dismissed) return null

  const handleDismiss = () => {
    if (storageKey) localStorage.setItem(storageKey, '1')
    setDismissed(true)
    onDismiss?.()
  }
  return (
    <div
      className={`relative w-full bg-bg-tertiary rounded-xl px-5 pt-5 pb-4 mb-6 text-center border border-border-color${className ? ` ${className}` : ''}`}
    >
      {onDismiss && (
        <button
          className="absolute top-[0.6rem] right-3 bg-transparent border-none text-text-muted text-[1rem] cursor-pointer leading-none p-1 rounded-sm transition-[color] duration-fast hover:text-text-primary"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
      <div className="text-[1.5rem] mb-2">{icon}</div>
      <h3 className="text-base font-semibold text-text-primary m-0 mb-2 leading-[1.4]">{title}</h3>
      <p className="text-sm text-text-muted leading-[1.55] m-0 mb-4 max-w-[440px] mx-auto">
        {body}
      </p>
      <button
        className="inline-flex items-center gap-2 bg-bg-secondary text-text-primary border border-border-strong rounded-md px-5 py-[0.55rem] text-sm font-semibold cursor-pointer transition-[background,border-color] duration-base mb-2 font-[inherit] hover:bg-bg-quaternary hover:border-accent-orange-border"
        onClick={onLogin}
      >
        {GOOGLE_SVG}
        Iniciar sesión con Google
      </button>
    </div>
  )
}
