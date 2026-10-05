interface PromoIconProps {
  name:
    | 'album'
    | 'swap'
    | 'qr'
    | 'scan'
    | 'check'
    | 'arrow'
    | 'history'
    | 'signal'
    | 'wifi'
    | 'battery'
  size?: number
}

const paths: Record<PromoIconProps['name'], string> = {
  album: 'M4 3h16v18H4zM4 9h16M10 9v12',
  swap: 'M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4',
  qr: 'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM21 15v3h-3v3h3M14 21h1',
  scan: 'M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M3 12h18',
  check: 'm5 12 4 4L19 6',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  history: 'M3 10a9 9 0 1 1 2 8M3 4v6h6m3-3v5l3 2',
  signal: 'M4 18v2M9 14v6M14 9v11M19 4v16',
  wifi: 'M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 4a4 4 0 0 1 6 0m-3 4h.01',
  battery: 'M3 7h16v10H3zM22 10v4M6 10h10v4H6z',
}

export function PromoIcon({ name, size = 24 }: PromoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
