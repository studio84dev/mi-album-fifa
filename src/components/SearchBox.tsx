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
    <div className="search-container">
      {search && (
        <button
          className="search-back-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBack}
          aria-label={t('searchBackAriaLabel')}
        >
          <svg
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
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {search && (
          <button
            className="search-clear-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
            aria-label={t('searchClearAriaLabel')}
          >
            <svg
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
