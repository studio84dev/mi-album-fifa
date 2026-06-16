import { View, Text, Pressable, Linking } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'
import ShareMenu from './ShareMenu'
import ThemeToggle from './ThemeToggle'
import Svg, { Path } from 'react-native-svg'

const GitHubIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </Svg>
)

interface FooterProps {
  t: (_key: string) => string
  locale: string
  toggleLocale: () => void
  onShowAbout: () => void
  onShowSuggestion: () => void
  themeMode: 'light' | 'dark'
  onToggleTheme: () => void
  user: { id?: string } | null
  totalCollected: number
}

export default function Footer({
  t,
  locale,
  toggleLocale,
  onShowAbout,
  onShowSuggestion,
  themeMode,
  onToggleTheme,
  user,
  totalCollected,
}: FooterProps) {
  const { theme } = useTheme()
  const showKofi = user && totalCollected >= 20

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
      {/* Donation Section */}
      {showKofi && (
        <View
          style={{
            backgroundColor: theme.bgTertiary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.borderColor,
            padding: 20,
            marginBottom: 24,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: theme.textSecondary,
              textAlign: 'center',
              marginBottom: 8,
              lineHeight: 22,
            }}
          >
            {t('kofiMessage')}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: theme.textMuted,
              textAlign: 'center',
              marginBottom: 16,
              lineHeight: 20,
            }}
          >
            {t('kofiSubMessage')}
          </Text>
          <Pressable
            onPress={() => Linking.openURL('https://link.mercadopago.cl/mialbumfifa')}
            style={{
              backgroundColor: colors.kofiRed,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>
              {t('kofiButton')}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Links */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 4,
          marginBottom: 16,
        }}
      >
        <Pressable onPress={onShowAbout} hitSlop={8}>
          <Text style={{ fontSize: 12, color: theme.textMuted }}>{t('aboutButton')}</Text>
        </Pressable>
        <Text style={{ color: theme.borderStrong, fontSize: 12 }}>·</Text>
        <Pressable onPress={onShowSuggestion} hitSlop={8}>
          <Text style={{ fontSize: 12, color: theme.textMuted }}>{t('suggestionButton')}</Text>
        </Pressable>
        <Text style={{ color: theme.borderStrong, fontSize: 12 }}>·</Text>
        <Pressable
          onPress={() => Linking.openURL('https://github.com/studio84dev/mi-album-fifa')}
          style={{
            width: 28,
            height: 28,
            borderRadius: 9999,
            backgroundColor: theme.bgTertiary,
            borderWidth: 1,
            borderColor: theme.borderColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GitHubIcon color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Theme Toggle */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <ThemeToggle themeMode={themeMode} onToggle={onToggleTheme} />
      </View>

      {/* Language Selector */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 12, color: theme.textMuted }}>{t('langToggleLabel')}:</Text>
        <Pressable
          onPress={() => locale !== 'es' && toggleLocale()}
          style={{
            borderWidth: 1,
            borderColor: locale === 'es' ? colors.accentBlue : theme.borderColor,
            backgroundColor: locale === 'es' ? `${colors.accentBlue}15` : theme.bgSecondary,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: locale === 'es' ? colors.accentBlue : theme.textSecondary,
            }}
          >
            ES
          </Text>
        </Pressable>
        <Pressable
          onPress={() => locale !== 'en' && toggleLocale()}
          style={{
            borderWidth: 1,
            borderColor: locale === 'en' ? colors.accentBlue : theme.borderColor,
            backgroundColor: locale === 'en' ? `${colors.accentBlue}15` : theme.bgSecondary,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: locale === 'en' ? colors.accentBlue : theme.textSecondary,
            }}
          >
            EN
          </Text>
        </Pressable>
      </View>

      {/* Share */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <ShareMenu shareTitle={t('shareTitle')} shareText={t('shareText')} />
      </View>

      {/* Disclaimer */}
      <Text
        style={{
          fontSize: 11,
          color: theme.textMuted,
          textAlign: 'center',
          lineHeight: 18,
          opacity: 0.7,
        }}
      >
        {t('footerDisclaimer')}
      </Text>
    </View>
  )
}
