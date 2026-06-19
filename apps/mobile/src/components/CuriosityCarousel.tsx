import React, { useState, useRef } from 'react'
import { View, Text, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { curiositiesEs, curiositiesEn } from '@mi-album-fifa/shared'
import { useTheme, colors } from '../hooks/useTheme'
import { useI18n } from '../hooks/useI18n'

const mapsCache: Record<string, Map<string, string[]>> = {
  es: new Map(curiositiesEs.map((c) => [c.code, c.datos_curiosos])),
  en: new Map(curiositiesEn.map((c) => [c.code, c.datos_curiosos])),
}

interface CuriosityCarouselProps {
  countryCode: string
  locale?: string
}

const CuriosityCarousel = React.memo(function CuriosityCarousel({
  countryCode,
  locale = 'es',
}: CuriosityCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const cardWidth = useRef(280 + 32)
  const scrollRef = useRef<ScrollView>(null)
  const { theme } = useTheme()
  const { t } = useI18n()

  const curiositiesMap = mapsCache[locale] ?? mapsCache.es
  const items = curiositiesMap.get(countryCode) ?? []

  if (items.length === 0) return null

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x
    const index = Math.min(Math.round(x / cardWidth.current), items.length - 1)
    setCurrentIndex(index)
  }

  return (
    <View style={{ marginTop: 16 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={280 + 32}
        snapToAlignment="center"
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={{ paddingHorizontal: 0 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {items.map((text, i) => (
          <View
            key={i}
            onLayout={
              i === 0
                ? (e) => {
                    cardWidth.current = e.nativeEvent.layout.width + 32
                  }
                : undefined
            }
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
              {t('curiosityLabel')
                .replace('{current}', String(i + 1))
                .replace('{total}', String(items.length))}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20 }}>{text}</Text>
          </View>
        ))}
      </ScrollView>
      {items.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 4 }}>
          {items.map((_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === currentIndex ? colors.accentBlue : theme.bgQuaternary,
              }}
            />
          ))}
        </View>
      )}
    </View>
  )
})

export default CuriosityCarousel
