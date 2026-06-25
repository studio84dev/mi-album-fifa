import { View, Pressable } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'
import Svg, { Path } from 'react-native-svg'

interface IconProps {
  color: string
}

const SunIcon = ({ color }: IconProps) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    <Path d="M12 7a5 5 0 100 10 5 5 0 000-10z" />
  </Svg>
)

const MoonIcon = ({ color }: IconProps) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill={color} stroke="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
)

interface ThemeToggleProps {
  themeMode: 'light' | 'dark'
  onToggle: () => void
}

export default function ThemeToggle({ themeMode: _themeMode, onToggle }: ThemeToggleProps) {
  const { theme, isDark } = useTheme()
  const isLight = !isDark

  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.bgTertiary,
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 9999,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <SunIcon color={isLight ? colors.accentBlue : theme.textMuted} />
      <View
        style={{
          width: 36,
          height: 20,
          backgroundColor: theme.bgQuaternary,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: theme.borderStrong,
          position: 'relative',
        }}
      >
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 9999,
            backgroundColor: isLight ? colors.accentBlue : theme.textMuted,
            position: 'absolute',
            top: 2,
            left: isLight ? 18 : 2,
          }}
        />
      </View>
      <MoonIcon color={isLight ? theme.textMuted : colors.accentBlue} />
    </Pressable>
  )
}
