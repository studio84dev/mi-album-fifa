import { useEffect, useRef, useState } from 'react'
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

  const complete = total !== undefined && collected >= total
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
    paniniCollected: number
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
  const { teamCollected, fwcCollected, ccCollected, paniniCollected, totalRepeated } = totals

  const TEAM_TOTAL = 960
  const FWC_TOTAL = 19
  const CC_TOTAL = 14
  const PANINI_TOTAL = 1

  const overallCollected = teamCollected + fwcCollected + ccCollected + paniniCollected
  const overallTotal = TEAM_TOTAL + FWC_TOTAL + CC_TOTAL + PANINI_TOTAL
  const pct = Math.round((overallCollected / overallTotal) * 100)

  const progressAnim = useRef(new Animated.Value(0)).current
  const [displayPct, setDisplayPct] = useState(0)

  useEffect(() => {
    if (loading) {
      progressAnim.setValue(0)
      setDisplayPct(0)
      return
    }
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 800,
      useNativeDriver: false,
    }).start()
    const timer = setTimeout(() => setDisplayPct(pct), 50)
    return () => clearTimeout(timer)
  }, [loading, pct])

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
  const gridCols = compact ? 3 : 4

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
        {/* Teams */}
        <View
          style={{
            flex: 1,
            minWidth: `${100 / gridCols}%`,
            alignItems: 'center',
            paddingVertical: compact ? 4 : 8,
            paddingHorizontal: compact ? 2 : 4,
          }}
        >
          <StatValue
            collected={teamCollected}
            total={TEAM_TOTAL}
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
            {t('statTeams')}
          </Text>
        </View>

        {/* FWC */}
        <View
          style={{
            flex: 1,
            minWidth: `${100 / gridCols}%`,
            alignItems: 'center',
            paddingVertical: compact ? 4 : 8,
            paddingHorizontal: compact ? 2 : 4,
          }}
        >
          <StatValue
            collected={fwcCollected}
            total={FWC_TOTAL}
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
            FWC
          </Text>
        </View>

        {/* CC */}
        <View
          style={{
            flex: 1,
            minWidth: `${100 / gridCols}%`,
            alignItems: 'center',
            paddingVertical: compact ? 4 : 8,
            paddingHorizontal: compact ? 2 : 4,
          }}
        >
          <StatValue
            collected={ccCollected}
            total={CC_TOTAL}
            loading={loading}
            compact={compact}
            ccColor
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
            CC
          </Text>
        </View>

        {/* 00 PANINI - only in full mode */}
        {!compact && (
          <View
            style={{
              flex: 1,
              minWidth: `${100 / gridCols}%`,
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 4,
            }}
          >
            <StatValue
              collected={paniniCollected}
              total={PANINI_TOTAL}
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
              00 PANINI
            </Text>
          </View>
        )}

        {/* Repeated */}
        <View
          style={{
            flex: 1,
            minWidth: `${100 / gridCols}%`,
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
