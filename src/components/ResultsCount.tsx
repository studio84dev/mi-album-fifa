interface ResultsCountProps {
  count: number
  t: (_key: string) => string
}

function ResultsCount({ count, t }: ResultsCountProps) {
  return (
    <div className="text-center text-text-muted mb-3.5 text-sm">
      {count} {count === 1 ? t('resultsCount') : t('resultsCountPlural')}
    </div>
  )
}

export default ResultsCount
