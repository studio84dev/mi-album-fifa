import { View, Pressable, type ViewStyle } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'
import Svg, { Rect } from 'react-native-svg'

interface IconProps {
  color: string
  size?: number
}

const CardsIcon = ({ color, size = 20 }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Rect x="3" y="4" width="18" height="6" rx="2" />
    <Rect x="3" y="14" width="18" height="6" rx="2" />
  </Svg>
)

const PanelsIcon = ({ color, size = 20 }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Rect x="3" y="3" width="7" height="7" rx="1.5" />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" />
    <Rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Svg>
)

export type ViewMode = 'cards' | 'panels'

interface ViewToggleProps {
  mode: ViewMode
  onChange: (_mode: ViewMode) => void
  cardsLabel: string
  panelsLabel: string
  style?: ViewStyle
}

export default function ViewToggle({
  mode,
  onChange,
  cardsLabel,
  panelsLabel,
  style,
}: ViewToggleProps) {
  const { theme } = useTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: theme.bgTertiary,
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 10,
        padding: 4,
        gap: 4,
        ...style,
      }}
    >
      <Pressable
        onPress={() => onChange('cards')}
        accessibilityLabel={cardsLabel}
        accessibilityRole="button"
        accessibilityState={{ selected: mode === 'cards' }}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 6,
          backgroundColor: mode === 'cards' ? theme.cardBg : 'transparent',
          borderWidth: mode === 'cards' ? 1 : 0,
          borderColor: mode === 'cards' ? theme.borderStrong : 'transparent',
        }}
      >
        <CardsIcon color={mode === 'cards' ? colors.accentBlue : theme.textMuted} />
      </Pressable>
      <Pressable
        onPress={() => onChange('panels')}
        accessibilityLabel={panelsLabel}
        accessibilityRole="button"
        accessibilityState={{ selected: mode === 'panels' }}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 6,
          backgroundColor: mode === 'panels' ? theme.cardBg : 'transparent',
          borderWidth: mode === 'panels' ? 1 : 0,
          borderColor: mode === 'panels' ? theme.borderStrong : 'transparent',
        }}
      >
        <PanelsIcon color={mode === 'panels' ? colors.accentBlue : theme.textMuted} />
      </Pressable>
    </View>
  )
}
