import { View, Text, Pressable, Linking } from 'react-native'
import { useI18n } from '../hooks/useI18n'
import { useTheme, colors } from '../hooks/useTheme'

const PLAY_STORE_URL = 'https://play.google.com/apps/testing/com.studio84.mialbumfifa'

interface UpdateBannerProps {
  visible?: boolean
}

export default function UpdateBanner({ visible = false }: UpdateBannerProps) {
  const { t } = useI18n()
  const { theme } = useTheme()

  if (!visible) return null

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: `${colors.accentBlue}10`,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor,
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 13,
          color: theme.textSecondary,
          marginBottom: 8,
        }}
      >
        {t('updateAvailableMessage')}
      </Text>
      <Pressable
        onPress={() => Linking.openURL(PLAY_STORE_URL)}
        style={{
          backgroundColor: colors.accentBlue,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 9999,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>
          {t('updateAvailableButton')}
        </Text>
      </Pressable>
    </View>
  )
}
