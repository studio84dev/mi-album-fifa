import { Pressable, Share } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'
import Svg, { Path, Circle, Line } from 'react-native-svg'

const ShareIcon = ({ color }: { color: string }) => (
  <Svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Svg>
)

interface ShareMenuProps {
  shareText: string
  shareTitle: string
}

export default function ShareMenu({ shareText, shareTitle }: ShareMenuProps) {
  const { theme } = useTheme()

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${shareTitle}\n${shareText}`,
        title: shareTitle,
        url: 'https://mialbumfifa.vercel.app',
      })
    } catch {
      // User cancelled
    }
  }

  return (
    <Pressable
      onPress={handleShare}
      style={{
        width: 40,
        height: 40,
        borderRadius: 9999,
        backgroundColor: theme.bgTertiary,
        borderWidth: 1,
        borderColor: theme.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ShareIcon color={colors.accentBlue} />
    </Pressable>
  )
}
