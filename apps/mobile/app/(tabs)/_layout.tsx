import { useEffect } from 'react'
import { Tabs } from 'expo-router'
import { Platform, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as NavigationBar from 'expo-navigation-bar'
import Svg, { Path, Rect } from 'react-native-svg'

const LIGHT = { bg: '#ffffff', border: '#e2e8f0', active: '#3b82f6', inactive: '#94a3b8' }
const DARK = { bg: '#111827', border: '#1e293b', active: '#3b82f6', inactive: '#64748b' }

function AlbumIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M3 9h18M9 9v12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  )
}

function QrTabIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
      <Rect x={14} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
      <Rect x={3} y={14} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
      <Path
        d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M14 21h3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}

const TAB_BAR_BASE_HEIGHT = 60

export default function TabLayout() {
  const scheme = useColorScheme()
  const c = scheme === 'dark' ? DARK : LIGHT
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (Platform.OS !== 'android') return
    void NavigationBar.setStyle('light')
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: c.bg,
            borderTopColor: c.border,
            borderTopWidth: 1,
            height: TAB_BAR_BASE_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom + 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: c.active,
          tabBarInactiveTintColor: c.inactive,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Álbum',
            tabBarIcon: ({ color }) => <AlbumIcon color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="exchange"
          options={{
            title: 'Intercambio',
            tabBarIcon: ({ color }) => <QrTabIcon color={color as string} />,
          }}
        />
      </Tabs>
      {Platform.OS === 'android' && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: insets.bottom,
            backgroundColor: '#000000',
          }}
        />
      )}
    </View>
  )
}
