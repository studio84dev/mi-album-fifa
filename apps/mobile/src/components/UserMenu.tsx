import { useState } from 'react'
import { View, Text, Image, Modal, Pressable } from 'react-native'
import type { User } from '@supabase/supabase-js'
import { useTheme, colors } from '../hooks/useTheme'
import GlobalStatsBar from './GlobalStatsBar'
import Svg, { Path } from 'react-native-svg'

const ImportIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <Path d="M7 10l5 5 5-5" />
    <Path d="M12 15V3" />
  </Svg>
)

const QRIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 3h7v7H3z" />
    <Path d="M14 3h7v7h-7z" />
    <Path d="M3 14h7v7H3z" />
    <Path d="M14 14h7v7h-7z" />
  </Svg>
)

interface UserMenuProps {
  user: User | null
  onSignOut: () => void
  onImport: () => void
  onImportQR: () => void
  t: (_key: string) => string
  totals: {
    teamCollected: number
    fwcCollected: number
    ccCollected: number
    paniniCollected: number
    totalRepeated: number
  }
  collectionLoading: boolean
}

export default function UserMenu({
  user,
  onSignOut,
  onImport,
  onImportQR,
  t,
  totals,
  collectionLoading,
}: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { theme } = useTheme()

  if (!user) return null

  const displayName = (user.user_metadata?.full_name as string) || user.email || ''
  const initial = displayName.charAt(0).toUpperCase()
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const showAvatar = avatarUrl && !imgError

  return (
    <>
      {/* Avatar Button */}
      <Pressable
        onPress={() => setShowMenu(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.accentBlue,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            {initial}
          </Text>
          {showAvatar && (
            <Image
              source={{ uri: avatarUrl }}
              style={{
                position: 'absolute',
                width: 32,
                height: 32,
                borderRadius: 16,
              }}
              onError={() => setImgError(true)}
            />
          )}
        </View>
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>▼</Text>
      </Pressable>

      {/* Modal Menu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}
          onPress={() => setShowMenu(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.borderColor,
              padding: 12,
              width: '100%',
              maxWidth: 320,
            }}
          >
            {/* Stats */}
            <GlobalStatsBar totals={totals} loading={collectionLoading} t={t} compact />

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: theme.borderColor,
                marginVertical: 8,
              }}
            />

            {/* Email */}
            <Text
              style={{
                fontSize: 13,
                color: theme.textMuted,
                paddingHorizontal: 8,
                paddingVertical: 8,
              }}
              numberOfLines={1}
            >
              {user.email}
            </Text>

            {/* Import Button */}
            <Pressable
              onPress={() => {
                onImport()
                setShowMenu(false)
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 8,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <ImportIcon color={theme.textMuted} />
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                }}
              >
                {t('importMenuItem')}
              </Text>
            </Pressable>

            {/* Import QR Button */}
            <Pressable
              onPress={() => {
                onImportQR()
                setShowMenu(false)
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 8,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <QRIcon color={theme.textMuted} />
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                }}
              >
                Importar QR Externo
              </Text>
            </Pressable>

            {/* Sign Out Button */}
            <Pressable
              onPress={() => {
                onSignOut()
                setShowMenu(false)
              }}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#ef4444',
                }}
              >
                {t('signOut')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}
