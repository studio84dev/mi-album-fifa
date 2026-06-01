interface ResultsCountProps {
  count: number
  t: (_key: string) => string
}

function ResultsCount({ count, t }: ResultsCountProps) {
  return (
    <div className="results-count">
      {count} {count === 1 ? t('resultsCount') : t('resultsCountPlural')}
    </div>
  )
}

export default ResultsCount
