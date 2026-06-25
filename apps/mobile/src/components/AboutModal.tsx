import { View, Text, Pressable, Linking } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'
import Svg, { Path } from 'react-native-svg'
import ScrollableModal from './ScrollableModal'

const StarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill={colors.starYellow}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
)

const _GitHubIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
    <Path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </Svg>
)

const IssueIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <Path d="M12 8v4" />
    <Path d="M12 16h.01" />
  </Svg>
)

const ContributeIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <Path d="M16 18l6-6-6-6" />
    <Path d="M8 6l-6 6 6 6" />
  </Svg>
)

interface AboutModalProps {
  visible: boolean
  onClose: () => void
  t: (_key: string) => string
}

export default function AboutModal({ visible, onClose, t }: AboutModalProps) {
  const { theme } = useTheme()

  return (
    <ScrollableModal visible={visible} onClose={onClose} title={t('aboutTitle')}>
      {/* Paragraphs */}
      <Text
        style={{
          fontSize: 14,
          color: theme.textSecondary,
          lineHeight: 22,
          marginBottom: 12,
        }}
      >
        {t('aboutParagraph1')}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.textSecondary,
          lineHeight: 22,
          marginBottom: 12,
        }}
      >
        {t('aboutParagraph2')}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.textSecondary,
          lineHeight: 22,
          marginBottom: 12,
        }}
      >
        {t('aboutParagraph2b')}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.textSecondary,
          lineHeight: 22,
          marginBottom: 12,
        }}
      >
        {t('aboutParagraph3')}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.textSecondary,
          lineHeight: 22,
          marginBottom: 16,
        }}
      >
        {t('aboutParagraph4a')}{' '}
        <Text
          style={{ color: colors.kofiRed, fontWeight: '600' }}
          onPress={() => Linking.openURL('https://link.mercadopago.cl/mialbumfifa')}
        >
          {t('aboutParagraph4b')}
        </Text>{' '}
        {t('aboutParagraph4c')}
      </Text>

      {/* Open Source Card */}
      <View
        style={{
          backgroundColor: theme.bgTertiary,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.borderColor,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <View
            style={{
              backgroundColor: `${colors.accentBlue}15`,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: `${colors.accentBlue}30`,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.accentBlue }}>
              {t('aboutOpenSourceBadge')}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: theme.textPrimary,
            }}
          >
            {t('aboutOpenSourceTitle')}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 13,
            color: theme.textSecondary,
            lineHeight: 20,
            marginBottom: 12,
          }}
        >
          {t('aboutOpenSourceDesc')}
        </Text>

        {/* Tech badges */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {['React', 'Expo', 'Supabase'].map((tech) => (
            <View
              key={tech}
              style={{
                backgroundColor: theme.bgQuaternary,
                borderWidth: 1,
                borderColor: theme.borderColor,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.textSecondary }}>
                {tech}
              </Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable
            onPress={() => Linking.openURL('https://github.com/studio84dev/mi-album-fifa')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: theme.bgSecondary,
              borderWidth: 1,
              borderColor: theme.borderColor,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
            }}
          >
            <StarIcon />
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary }}>
              {t('aboutActionStar')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('https://github.com/studio84dev/mi-album-fifa/issues')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: theme.bgSecondary,
              borderWidth: 1,
              borderColor: theme.borderColor,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
            }}
          >
            <IssueIcon />
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary }}>
              {t('aboutActionIssue')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Linking.openURL(
                'https://github.com/studio84dev/mi-album-fifa/blob/master/CONTRIBUTING.md'
              )
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: theme.bgSecondary,
              borderWidth: 1,
              borderColor: theme.borderColor,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
            }}
          >
            <ContributeIcon />
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary }}>
              {t('aboutActionContribute')}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollableModal>
  )
}
