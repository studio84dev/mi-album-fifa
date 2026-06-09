import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import type { CardType } from '@mi-album-fifa/shared'
import flags from '../data/flags'
import { useTheme } from '../hooks/useTheme'

const GROUP_COLORS: Record<string, string> = {
  a: '#2d7a35',
  b: '#c53030',
  c: '#b7791f',
  d: '#2b6cb0',
  e: '#c05621',
  f: '#276749',
  g: '#6b46c1',
  h: '#086f83',
  i: '#553c9a',
  j: '#b7445a',
  k: '#97266d',
  l: '#744210',
}

export interface TeamItem {
  code: string
  team_name: string | null
  group: string | null
  iso: string | null
  page: number
  card_type: CardType
  count: number
}

interface TeamCardProps {
  item: TeamItem
  collectedCount?: number
  repeatedCount?: number
  onPress?: (code: string) => void
}

export default function TeamCard({
  item,
  collectedCount = 0,
  repeatedCount = 0,
  onPress,
}: TeamCardProps) {
  const { theme } = useTheme()
  const rawFlag = item.iso ? flags[item.iso] : null
  const FlagSvg = rawFlag
    ? (((rawFlag as { default?: unknown }).default ?? rawFlag) as React.FC<{
        width: number
        height: number
      }>)
    : null
  const groupKey = item.group?.toLowerCase() ?? ''
  const groupColor = GROUP_COLORS[groupKey] ?? theme.textMuted

  const isComplete = item.count > 0 && collectedCount >= item.count

  const cardStyle = {
    backgroundColor: isComplete ? 'rgba(232,116,42,0.08)' : theme.cardBg,
    borderWidth: 1,
    borderColor: isComplete ? 'rgba(232,116,42,0.45)' : theme.borderColor,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
  }

  return (
    <TouchableOpacity style={cardStyle} activeOpacity={0.7} onPress={() => onPress?.(item.code)}>
      <Text
        style={{
          fontSize: 15,
          width: 44,
          fontWeight: '700',
          color: theme.textMuted,
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {item.page}
      </Text>

      <View
        style={{
          width: 32,
          height: 24,
          marginLeft: 12,
          marginRight: 16,
          borderRadius: 2,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {FlagSvg ? (
          <FlagSvg width={32} height={24} />
        ) : (
          <View
            style={{ width: 32, height: 24, backgroundColor: theme.bgQuaternary, borderRadius: 2 }}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text
            style={{
              fontSize: 12,
              color: theme.textMuted,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {item.code}
          </Text>
          <View
            style={{
              backgroundColor: groupColor,
              marginLeft: 6,
              paddingHorizontal: 5,
              paddingVertical: 2,
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{item.group}</Text>
          </View>
        </View>
        <Text
          style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary }}
          numberOfLines={1}
        >
          {item.team_name}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              color: collectedCount > 0 ? '#3b82f6' : theme.textDisabled,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            {collectedCount}
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>/{item.count}</Text>
        </View>
        {repeatedCount > 0 && (
          <Text style={{ color: '#E8742A', fontSize: 11, fontWeight: '600' }}>{repeatedCount}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}
