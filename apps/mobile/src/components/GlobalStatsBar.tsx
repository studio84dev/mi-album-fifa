import { useEffect, useMemo } from 'react'
import { View, Text, Animated } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'

interface StatValueProps {
  collected: number
  total?: number
  isRepeated?: boolean
  loading: boolean
  compact?: boolean
  ccColor?: boolean
}

function StatValue({ collected, total, isRepeated, loading, compact, ccColor }: StatValueProps) {
  const { theme } = useTheme()
  const fontSize = compact ? 14 : 18

  if (loading) {
    return (
      <View
        style={{
          width: 32,
          height: 20,
          backgroundColor: theme.bgQuaternary,
          borderRadius: 4,
        }}
      />
    )
  }

  if (isRepeated) {
    return (
      <Text
        style={{
          fontSize,
          fontWeight: '700',
          color: colors.accentOrange,
        }}
      >
        {collected}
      </Text>
    )
  }

  if (total === undefined) {
    return (
      <Text
        style={{
          fontSize,
          fontWeight: '700',
          color: colors.accentBlue,
        }}
      >
        {collected}
      </Text>
    )
  }

  const complete = collected >= total
  const accentColor = ccColor ? colors.ccRed : colors.accentBlue

  return (
    <Text style={{ fontSize, fontWeight: '700' }}>
      <Text style={{ color: complete ? accentColor : accentColor }}>{collected}</Text>
      <Text style={{ color: theme.textMuted, fontWeight: '500' }}>/{total}</Text>
    </Text>
  )
}

interface GlobalStatsBarProps {
  totals: {
    teamCollected: number
    fwcCollected: number
    ccCollected: number
    totalRepeated: number
  }
  loading: boolean
  t: (_key: string) => string
  compact?: boolean
}

export default function GlobalStatsBar({
  totals,
  loading,
  t,
  compact = false,
}: GlobalStatsBarProps) {
  const { theme } = useTheme()
  const { teamCollected, fwcCollected, ccCollected, totalRepeated } = totals

  const TEAM_TOTAL = 960
  const FWC_TOTAL = 20
  const CC_TOTAL = 14

  const overallCollected = teamCollected + fwcCollected + ccCollected
  const overallTotal = TEAM_TOTAL + FWC_TOTAL + CC_TOTAL
  const pct = Math.round((overallCollected / overallTotal) * 100)

  const progressAnim = useMemo(() => new Animated.Value(0), [])
  useEffect(() => {
    if (loading) {
      progressAnim.setValue(0)
      return
    }
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 800,
      useNativeDriver: false,
    }).start()
  }, [loading, pct, progressAnim])

  const containerStyle = compact
    ? { backgroundColor: 'transparent', borderWidth: 0, padding: 4 }
    : {
        backgroundColor: theme.cardBg,
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 18,
        marginBottom: 20,
      }

  const labelSize = compact ? 10 : 12

  return (
    <View style={containerStyle}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary }}>
          {t('myAlbumTitle')}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: colors.accentBlue,
          }}
        >
          {loading ? '...' : `${pct}%`}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          width: '100%',
          height: 4,
          backgroundColor: theme.bgQuaternary,
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <Animated.View
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            height: '100%',
            backgroundColor: colors.accentBlue,
            borderRadius: 2,
          }}
        />
        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.bgTertiary,
            }}
          />
        )}
      </View>

      {/* Stats grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: compact ? 2 : 8,
        }}
      >
        {/* Collected */}
        <View
          style={{
            flex: 1,
            minWidth: `${100 / 3}%`,
            alignItems: 'center',
            paddingVertical: compact ? 4 : 8,
            paddingHorizontal: compact ? 2 : 4,
          }}
        >
          <StatValue
            collected={overallCollected}
            total={overallTotal}
            loading={loading}
            compact={compact}
          />
          <Text
            style={{
              fontSize: labelSize,
              color: theme.textMuted,
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            {t('statCollected')}
          </Text>
        </View>

        {/* Missing */}
        <View
          style={{
            flex: 1,
            minWidth: `${100 / 3}%`,
            alignItems: 'center',
            paddingVertical: compact ? 4 : 8,
            paddingHorizontal: compact ? 2 : 4,
          }}
        >
          <StatValue
            collected={overallTotal - overallCollected}
            loading={loading}
            compact={compact}
          />
          <Text
            style={{
              fontSize: labelSize,
              color: theme.textMuted,
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            {t('statMissing')}
          </Text>
        </View>

        {/* Repeated */}
        <View
          style={{
            flex: 1,
            minWidth: `${100 / 3}%`,
            alignItems: 'center',
            paddingVertical: compact ? 4 : 8,
            paddingHorizontal: compact ? 2 : 4,
          }}
        >
          <StatValue collected={totalRepeated} isRepeated loading={loading} compact={compact} />
          <Text
            style={{
              fontSize: labelSize,
              color: theme.textMuted,
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            {t('statRepeated')}
          </Text>
        </View>
      </View>
    </View>
  )
}
