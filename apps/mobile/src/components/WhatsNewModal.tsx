import { View, Text } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import ScrollableModal from './ScrollableModal'
import { FEATURES } from '../data/whatsNewFeatures'

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
