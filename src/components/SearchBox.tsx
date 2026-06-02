interface SearchBoxProps {
  search: string
  onChange: (_value: string) => void
  onClear: () => void
  onBack: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onFocus?: () => void
  onBlur?: () => void
  placeholder: string
  t: (_key: string) => string
}

function SearchBox({
  search,
  onChange,
  onClear,
  onBack,
  inputRef,
  onFocus,
  onBlur,
  placeholder,
  t,
}: SearchBoxProps) {
  return (
    <div className="w-full mb-6 flex items-center gap-2">
      {search && (
        <button
          className="flex-shrink-0 w-10 h-10 rounded-full border border-border-color bg-bg-tertiary text-text-muted cursor-pointer flex items-center justify-center transition-[background,border-color,color] duration-base hover:bg-bg-quaternary hover:border-border-strong hover:text-text-primary"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBack}
          aria-label={t('searchBackAriaLabel')}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          className="w-full py-3 px-5 text-base border border-border-color rounded-full bg-input-bg text-text-primary outline-none transition-[border-color,box-shadow] duration-base text-center uppercase font-medium tracking-[0.04em] placeholder:text-text-muted placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:border-accent-blue-border focus:shadow-[0_0_0_3px_var(--accent-blue-subtle)] sm:text-[1rem] sm:py-[0.875rem]"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {search && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-none bg-bg-tertiary text-text-muted leading-none cursor-pointer flex items-center justify-center p-0 transition-[background,color] duration-fast hover:bg-bg-quaternary hover:text-text-primary hover:-translate-y-1/2 active:-translate-y-1/2 active:scale-95 sm:w-11 sm:h-11 sm:right-1"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
            aria-label={t('searchClearAriaLabel')}
          >
            <svg
              className="w-3.5 h-3.5 block sm:w-[18px] sm:h-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBox
