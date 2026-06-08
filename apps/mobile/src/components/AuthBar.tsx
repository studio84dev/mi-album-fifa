import { View, Text, TouchableOpacity, Image } from 'react-native'
import type { User } from '@supabase/supabase-js'
import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../hooks/useTheme'
import Svg, { Path } from 'react-native-svg'

const GoogleIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
)

interface AuthBarProps {
  user: User | null
  loading: boolean
  onSignIn: () => void
  onSignOut: () => void
}

export default function AuthBar({ user, loading, onSignIn, onSignOut }: AuthBarProps) {
  const { t } = useI18n()
  const { theme } = useTheme()

  if (user) {
    const avatar = user.user_metadata?.avatar_url as string | undefined
    const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? ''
    const firstName = name.split(' ')[0]

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          backgroundColor: theme.bgSecondary,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 28, height: 28, borderRadius: 14 }} />
          ) : (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#3b82f6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{firstName}</Text>
        </View>
        <TouchableOpacity
          onPress={onSignOut}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.borderStrong,
          }}
        >
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>{t('signOut')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor,
        backgroundColor: theme.bgSecondary,
      }}
    >
      <TouchableOpacity
        onPress={onSignIn}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: theme.bgTertiary,
          borderWidth: 1,
          borderColor: theme.borderStrong,
          borderRadius: 9999,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        activeOpacity={0.75}
      >
        <GoogleIcon />
        <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '600' }}>
          {t('loginBarCta')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
