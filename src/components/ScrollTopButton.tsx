interface ScrollTopButtonProps {
  show: boolean
  isRaised: boolean
  onClick: () => void
  t: (_key: string) => string
}

function ScrollTopButton({ show, isRaised, onClick, t }: ScrollTopButtonProps) {
  if (!show) return null

  return (
    <button
      className={`fixed bottom-7 right-7 sm:bottom-5 sm:right-5 w-11 h-11 rounded-full bg-bg-tertiary border border-border-strong text-text-muted cursor-pointer flex items-center justify-center shadow-md transition-[background,border-color,color] duration-base ease z-[1000] animate-fade-in-up hover:bg-bg-quaternary hover:border-accent-blue-border hover:text-accent-blue active:opacity-80 ${isRaised ? 'mb-16' : ''}`}
      onClick={onClick}
      aria-label={t('scrollToTopAriaLabel')}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  )
}

export default ScrollTopButton
