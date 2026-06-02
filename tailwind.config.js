/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['attribute', 'data-theme'],
  theme: {
    extend: {
      colors: {
        'accent-blue': 'var(--accent-blue)',
        'accent-blue-hover': 'var(--accent-blue-hover)',
        'accent-blue-subtle': 'var(--accent-blue-subtle)',
        'accent-blue-border': 'var(--accent-blue-border)',
        'accent-orange': 'var(--accent-orange)',
        'accent-orange-hover': 'var(--accent-orange-hover)',
        'accent-orange-subtle': 'var(--accent-orange-subtle)',
        'accent-orange-border': 'var(--accent-orange-border)',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-quaternary': 'var(--bg-quaternary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-disabled': 'var(--text-disabled)',
        'border-color': 'var(--border-color)',
        'border-strong': 'var(--border-strong)',
        'card-bg': 'var(--card-bg)',
        'modal-bg': 'var(--modal-bg)',
        'overlay-bg': 'var(--overlay-bg)',
        'input-bg': 'var(--input-bg)',
        'x-color': 'var(--x-color)',
        'country-name': 'var(--country-name-color)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        modalFadeIn: {
          from: { opacity: '0', transform: 'translateY(-12px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUpCentered: {
          from: { opacity: '0', transform: 'translateX(-50%) translateY(10px)' },
          to: { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        badgePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' },
        },
        skeletonShimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        importSpin: {
          to: { transform: 'rotate(360deg)' },
        },
        highlightGlow: {
          '0%': {
            boxShadow: '0 0 0 1px var(--text-secondary), 0 0 10px var(--text-secondary)',
            transform: 'scale(1.04)',
          },
          '40%': {
            boxShadow: '0 0 0 1px var(--text-secondary), 0 0 6px var(--text-secondary)',
            transform: 'scale(1.02)',
          },
          '100%': {
            boxShadow: '0 0 0 0px var(--text-secondary), 0 0 0px var(--text-secondary)',
            transform: 'scale(1)',
          },
        },
        panelShimmer: {
          '0%': { borderColor: 'var(--accent-orange-border)' },
          '40%': { borderColor: 'var(--accent-orange)' },
          '100%': { borderColor: 'var(--accent-orange-border)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease',
        'modal-fade-in': 'modalFadeIn 200ms ease',
        'fade-in-up': 'fadeInUp 300ms ease',
        'fade-in-up-centered': 'fadeInUpCentered 300ms ease',
        'fade-in-down': 'fadeInDown 150ms ease',
        'badge-pulse': 'badgePulse 1.5s ease-in-out infinite',
        'skeleton-shimmer': 'skeletonShimmer 1.4s ease-in-out infinite',
        'slide-in': 'slideIn 200ms ease',
        'import-spin': 'importSpin 0.6s linear infinite',
        'highlight-glow': 'highlightGlow 2s ease-out',
        'panel-shimmer': 'panelShimmer 2s ease forwards',
        'panel-just-completed': 'modalFadeIn 0.25s ease, panelShimmer 2s ease forwards',
      },
    },
  },
  plugins: [],
}
