import { View, Text, ActivityIndicator } from 'react-native'
import { useCommunityStats } from '../hooks/useCommunityStats'
import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../hooks/useTheme'

export default function CommunityStats() {
  const { stats, loading } = useCommunityStats()
  const { t } = useI18n()
  const { theme } = useTheme()

  if (loading) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
        }}
      >
        <ActivityIndicator size="small" color={theme.textMuted} />
      </View>
    )
  }

  if (!stats || stats.rawCollectors < 10) return null

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        flexWrap: 'wrap',
      }}
    >
      <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
        <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>{stats.collectors}</Text>
        <Text style={{ color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {' '}
          {t('communityStatCollectors')}
        </Text>
        <Text style={{ color: theme.textMuted }}> · </Text>
        <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>{stats.stickers}</Text>
        <Text style={{ color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {' '}
          {t('communityStatStickers')}
        </Text>
        <Text style={{ color: theme.textMuted }}> · </Text>
        <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>{stats.repeated}</Text>
        <Text style={{ color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {' '}
          {t('communityStatRepeated')}
        </Text>
      </Text>
    </View>
  )
}
