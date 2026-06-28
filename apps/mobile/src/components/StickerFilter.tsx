import { View, Text, Pressable } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'

export type StickerFilterMode = 'all' | 'missing' | 'repeated'

interface StickerFilterProps {
  mode: StickerFilterMode
  onChange: (_mode: StickerFilterMode) => void
  allLabel: string
  missingLabel: string
  repeatedLabel: string
}

const options: { key: StickerFilterMode; i18nKey: 'all' | 'missing' | 'repeated' }[] = [
  { key: 'all', i18nKey: 'all' },
  { key: 'missing', i18nKey: 'missing' },
  { key: 'repeated', i18nKey: 'repeated' },
]

export default function StickerFilter({
  mode,
  onChange,
  allLabel,
  missingLabel,
  repeatedLabel,
}: StickerFilterProps) {
  const { theme } = useTheme()
  const labels = { all: allLabel, missing: missingLabel, repeated: repeatedLabel }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.bgTertiary,
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 10,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map(({ key }) => {
        const selected = mode === key
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: selected ? colors.accentBlue : 'transparent',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: selected ? '#ffffff' : theme.textSecondary,
                fontSize: 12,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {labels[key]}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
