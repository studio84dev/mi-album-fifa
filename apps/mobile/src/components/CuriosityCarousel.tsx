import { useState, useRef } from 'react'
import { View, Text, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { curiositiesEs, curiositiesEn } from '@mi-album-fifa/shared'
import { useTheme } from '../hooks/useTheme'

const mapsCache: Record<string, Map<string, string[]>> = {
  es: new Map(curiositiesEs.map((c) => [c.code, c.datos_curiosos])),
  en: new Map(curiositiesEn.map((c) => [c.code, c.datos_curiosos])),
}

interface CuriosityCarouselProps {
  countryCode: string
  locale?: string
}

export default function CuriosityCarousel({ countryCode, locale = 'es' }: CuriosityCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)
  const { theme } = useTheme()

  const curiositiesMap = mapsCache[locale] ?? mapsCache.es
  const items = curiositiesMap.get(countryCode) ?? []

  if (items.length === 0) return null

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x
    const width = e.nativeEvent.layoutMeasurement.width
    const index = Math.round(x / width)
    setCurrentIndex(index)
  }

  return (
    <View className="mt-4">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {items.map((text, i) => (
          <View
            key={i}
            style={{
              width: 280,
              backgroundColor: theme.bgTertiary,
              borderWidth: 1,
              borderColor: theme.borderColor,
              borderRadius: 12,
              marginHorizontal: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: theme.textMuted,
                fontSize: 11,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Curiosidad {i + 1}/{items.length}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20 }}>{text}</Text>
          </View>
        ))}
      </ScrollView>
      {items.length > 1 && (
        <View className="flex-row justify-center mt-2" style={{ gap: 4, marginTop: 16 }}>
          {items.map((_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === currentIndex ? '#3b82f6' : theme.bgQuaternary,
              }}
            />
          ))}
        </View>
      )}
    </View>
  )
}
