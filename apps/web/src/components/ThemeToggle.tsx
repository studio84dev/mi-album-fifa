import { useTheme } from '../hooks/useTheme.ts'

interface ThemeToggleProps {
  t: (_key: string) => string
}

function ThemeToggle({ t }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className="flex items-center gap-1.5 bg-bg-tertiary border border-border-color rounded-full py-[0.2rem] pr-2 pl-[0.3rem] cursor-pointer transition-[background,border-color] duration-base hover:bg-bg-quaternary hover:border-border-strong"
      onClick={toggleTheme}
      aria-label={t('themeToggleLabel')}
    >
      <svg
        className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity duration-base ${theme === 'light' ? 'opacity-100' : 'opacity-60'}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative w-9 h-5 bg-bg-quaternary rounded-full border border-border-strong transition-[background] duration-base">
        <div
          className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full transition-[transform,background] duration-base ${theme === 'light' ? 'translate-x-4 bg-accent-blue' : 'translate-x-0 bg-text-muted'}`}
        />
      </div>

      <svg
        className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity duration-base ${theme === 'dark' ? 'opacity-100' : 'opacity-60'}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
      </svg>
    </button>
  )
}

export default ThemeToggle
