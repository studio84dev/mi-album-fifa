function getCardStatus(
  collection: Record<string, Record<string, { collected: boolean; repeated: number }>>,
  countryCode: string,
  number: number
) {
  const entry = collection?.[countryCode]?.[number]
  if (!entry) return { collected: false, repeated: 0 }
  return { collected: entry.collected, repeated: entry.repeated ?? 0 }
}

interface StickerCardProps {
  sticker: {
    country_code: string
    number: number
    code: string
    description: string
  }
  collection: Record<string, Record<string, { collected: boolean; repeated: number }>>
  onClick: () => void
  single?: boolean
}

function StickerCard({ sticker, collection, onClick, single }: StickerCardProps) {
  const { collected, repeated } = getCardStatus(collection, sticker.country_code, sticker.number)
  return (
    <div
      className={`bg-card-bg rounded-lg px-4 py-[0.625rem] flex items-center gap-2 border border-border-color cursor-pointer transition-[background,border-color,box-shadow] duration-base hover:bg-bg-tertiary hover:border-border-strong hover:shadow-sm${single ? ' max-w-[400px] w-full' : ''}`}
      onClick={onClick}
    >
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-[0.08em] flex-shrink-0">
          {sticker.code}
        </span>
        <span className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
          {sticker.description}
        </span>
      </div>
      <div className="flex-shrink-0">
        {collected ? (
          repeated > 0 ? (
            <span className="inline-flex items-center justify-center h-5 bg-accent-orange text-white text-[0.65rem] font-bold rounded-full px-[6px]">
              +{repeated}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-blue" />
          )
        ) : (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-border-color" />
        )}
      </div>
    </div>
  )
}

export default StickerCard
