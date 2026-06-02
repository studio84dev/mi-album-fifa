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
}

function StickerCard({ sticker, collection, onClick }: StickerCardProps) {
  const { collected, repeated } = getCardStatus(collection, sticker.country_code, sticker.number)
  return (
    <div
      className="sticker-card sticker-card--player"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <div className="player-card-main">
        <span className="player-card-code">{sticker.code}</span>
        <span className="player-card-name">{sticker.description}</span>
      </div>
      <div className="player-card-meta">
        {collected ? (
          repeated > 0 ? (
            <span className="player-card-status repeated">+{repeated}</span>
          ) : (
            <span className="player-card-status collected">{/* check or dot */}</span>
          )
        ) : (
          <span className="player-card-status missing" />
        )}
      </div>
    </div>
  )
}

export default StickerCard
