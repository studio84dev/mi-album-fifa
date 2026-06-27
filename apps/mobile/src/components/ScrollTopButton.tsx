import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Svg, { Polyline } from 'react-native-svg'
import { useTheme } from '../hooks/useTheme'
import { useI18n } from '../hooks/useI18n'

interface ScrollTopButtonProps {
  visible: boolean
  onPress: () => void
}

export default function ScrollTopButton({ visible, onPress }: ScrollTopButtonProps) {
  const { theme } = useTheme()
  const { t } = useI18n()

  if (!visible) return null

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        accessibilityLabel={t('scrollToTopAriaLabel')}
        accessibilityRole="button"
        style={[
          styles.button,
          {
            backgroundColor: theme.bgTertiary,
            borderColor: theme.borderStrong,
          },
        ]}
      >
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.textSecondary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Polyline points="18 15 12 9 6 15" />
        </Svg>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 24,
    paddingRight: 20,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
})
