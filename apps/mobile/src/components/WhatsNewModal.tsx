import { View, Text } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'
import ScrollableModal from './ScrollableModal'

export const FEATURES = [
  { id: 'sticker-panel-page', date: '2026-05-30', icon: '📄' },
  { id: 'player-search', date: '2026-05-30', icon: '🔍' },
  { id: 'avatar-refresh', date: '2026-05-28', icon: '👤' },
  { id: 'design-refresh-may28', date: '2026-05-28', icon: '🎨' },
  { id: 'release-may27', date: '2026-05-27', icon: '📖' },
  { id: 'site-redesign', date: '2026-05-27', icon: '🎨' },
  { id: 'card-collection-stats', date: '2026-05-27', icon: '📈' },
  { id: 'sticker-card-feedback', date: '2026-05-26', icon: '✅' },
  { id: 'theme-consistency', date: '2026-05-25', icon: '🎨' },
  { id: 'import-collection', date: '2026-05-25', icon: '📥' },
  { id: 'i18n-support', date: '2026-05-25', icon: '🌐' },
  { id: 'ux-improvements', date: '2026-05-25', icon: '✨' },
  { id: 'last-touched', date: '2026-05-25', icon: '🟡' },
  { id: 'global-stats', date: '2026-05-24', icon: '📊' },
  { id: 'fwc-cc-cards', date: '2026-05-24', icon: '🃏' },
  { id: 'nav-redesign', date: '2026-05-24', icon: '🎨' },
]

export const STORAGE_KEY = 'whats-new-read'

function formatDate(isoDate: string, locale: string) {
  const [y, m, d] = isoDate.split('-')
  const yy = y.slice(2)
  return locale === 'en' ? `${m}/${d}/${yy}` : `${d}/${m}/${yy}`
}

interface WhatsNewModalProps {
  visible: boolean
  onClose: () => void
  t: (_key: string) => string
  locale?: string
}

export default function WhatsNewModal({ visible, onClose, t, locale = 'es' }: WhatsNewModalProps) {
  const { theme } = useTheme()

  return (
    <ScrollableModal visible={visible} onClose={onClose} title={`✨ ${t('whatsNewTitle')}`}>
      <View style={{ gap: 12 }}>
        {FEATURES.map((f) => (
          <View
            key={f.id}
            style={{
              flexDirection: 'row',
              gap: 12,
              padding: 12,
              backgroundColor: theme.bgTertiary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}
          >
            <Text style={{ fontSize: 20 }}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.textPrimary,
                    flex: 1,
                  }}
                >
                  {t(`feature.${f.id}.title`)}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.textMuted,
                  }}
                >
                  {formatDate(f.date, locale)}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.textMuted,
                  lineHeight: 20,
                }}
              >
                {t(`feature.${f.id}.description`)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollableModal>
  )
}
