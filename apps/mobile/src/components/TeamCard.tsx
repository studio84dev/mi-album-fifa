import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg'
import type { CardType } from '@mi-album-fifa/shared'
import flags from '../data/flags'
import { useTheme, colors } from '../hooks/useTheme'

const FWC_ICON = (
  <Svg width={26} height={26} viewBox="0 0 512 512">
    <Path
      fill="#FFD700"
      d="M384,449.963v-12.629c0-17.643-14.357-32-32-32h-15.104c-19.989-34.176-27.52-93.973-27.563-127.659c3.349-6.059,6.549-11.712,9.237-16.341c17.557-30.379,44.096-99.072,44.096-133.333v-4.821c0-5.845-0.043-10.368-0.192-14.336c0.085-0.619,0.192-1.707,0.192-2.176C362.667,47.851,314.816,0,256,0S149.333,47.851,149.333,106.667c0,13.141,2.645,25.835,7.211,37.717c0.043,0.213-0.021,0.427,0.021,0.64l46.763,185.728c-9.493,31.317-23.019,62.037-28.779,74.581H160c-17.643,0-32,14.357-32,32v12.629c-12.395,4.416-21.333,16.149-21.333,30.037v21.333c0,5.888,4.779,10.667,10.667,10.667h277.333c5.888,0,10.667-4.779,10.667-10.667V480C405.333,466.112,396.395,454.379,384,449.963z M256,21.333c40.107,0,73.579,27.883,82.709,64.747c-9.323,1.856-12.672,12.373-16.704,27.072c-1.792,6.528-3.691,12.843-5.76,18.859c-6.677-14.912-21.568-25.344-38.912-25.344c-18.667,0-34.389,12.117-40.171,28.843c-2.453-5.333-4.843-10.965-7.232-17.003c-7.04-17.792-13.12-33.173-27.285-33.173c-4.117,0-7.851,1.771-10.496,4.992c-7.296,8.875-5.269,28.096,3.819,76.352c-15.936-15.744-25.301-37.141-25.301-60.011C170.667,59.605,208.939,21.333,256,21.333z M298.667,149.333c0,11.755-9.557,21.333-21.333,21.333S256,161.088,256,149.333c0-11.755,9.557-21.333,21.333-21.333S298.667,137.579,298.667,149.333z M189.76,189.483c3.84,3.051,7.893,5.845,12.203,8.384c5.717,29.824,11.371,61.099,11.371,79.467c0,1.536-0.149,3.221-0.235,4.821L189.76,189.483z M234.667,277.333c0-22.933-7.168-59.904-14.101-95.659c-3.243-16.789-7.189-37.035-9.536-53.035c9.472,23.893,23.829,56.832,56.939,62.251c3.029,0.683,6.144,1.109,9.365,1.109c3.392,0,6.656-0.491,9.835-1.259c34.816-6.123,47.445-43.371,54.165-67.435V128c0,27.157-23.061,91.2-42.219,124.373C285.12,276.565,256,326.912,256,373.333c0,5.888,4.779,10.667,10.667,10.667s10.667-4.779,10.667-10.667c0-18.496,5.717-38.229,13.184-56.619c3.136,28.309,9.664,62.016,22.08,88.619H197.952C210.347,377.365,234.667,317.333,234.667,277.333z M149.333,437.333c0-5.888,4.8-10.667,10.667-10.667h192c5.867,0,10.667,4.779,10.667,10.667V448H149.333V437.333z M384,490.667H128V480c0-5.888,4.8-10.667,10.667-10.667h234.667C379.2,469.333,384,474.112,384,480V490.667z"
    />
  </Svg>
)

const CC_ICON = (
  <Svg width={26} height={26} viewBox="0 0 28 28">
    <Circle cx="14" cy="14" r="13" fill="#E8000E" />
    <SvgText
      x="14"
      y="14"
      textAnchor="middle"
      alignmentBaseline="central"
      fill="white"
      fontSize="11"
      fontWeight="800"
    >
      CC
    </SvgText>
  </Svg>
)

const PANINI_ICON = (
  <Svg width={24} height={24} viewBox="-6.5 0 32 32" fill="#6366F1">
    <Path d="M2.531 4.781h13.563c1.406 0 2.531 1.156 2.531 2.531v14.844c0 1.344-1.094 2.469-2.438 2.531v-1.688c0.406-0.063 0.75-0.438 0.75-0.844v-14.844c0-0.438-0.406-0.813-0.844-0.813h-13.563c-0.438 0-0.844 0.375-0.844 0.813 0.156-0.031 0.375-0.063 0.563-0.063 0.156 0 0.281 0 0.438 0.031l10.156 1.531c1.375 0.25 2.375 1.5 2.375 2.875v13.219c0 1.313-0.938 2.281-2.219 2.281-0.125 0-0.313 0-0.469-0.031l-10.125-1.531c-1.344-0.25-2.406-1.5-2.406-2.844v-15.469c0-1.375 1.156-2.531 2.531-2.531zM3.031 12.75l8.906 1.313 0.219-1.531-8.906-1.313zM4.906 14.094l-0.125 0.938 4.938 0.75 0.125-0.938z" />
  </Svg>
)

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

function TeamCard({ item, collectedCount = 0, repeatedCount = 0, onPress }: TeamCardProps) {
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
    backgroundColor: isComplete ? `${colors.accentOrange}14` : theme.cardBg,
    borderWidth: 1,
    borderColor: isComplete ? `${colors.accentOrange}73` : theme.borderColor,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
  }

  const isSpecial =
    item.card_type === 'fwc_special' || item.card_type === 'cc' || item.card_type === 'panini_logo'

  if (isSpecial) {
    const icon =
      item.card_type === 'fwc_special' ? FWC_ICON : item.card_type === 'cc' ? CC_ICON : PANINI_ICON
    const label =
      item.card_type === 'fwc_special' ? 'FWC' : item.card_type === 'cc' ? 'CC' : '00 PANINI'
    const codeColor =
      item.card_type === 'fwc_special'
        ? colors.accentBlue
        : item.card_type === 'cc'
          ? colors.ccRed
          : undefined

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
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 4,
              color: codeColor ?? theme.textMuted,
            }}
          >
            {item.code}
          </Text>
          <Text
            style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary }}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                color: collectedCount > 0 ? colors.accentBlue : theme.textDisabled,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              {collectedCount}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>/{item.count}</Text>
          </View>
          {repeatedCount > 0 && (
            <Text style={{ color: colors.accentOrange, fontSize: 11, fontWeight: '600' }}>
              {repeatedCount}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    )
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
            <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: '700' }}>{item.group}</Text>
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
              color: collectedCount > 0 ? colors.accentBlue : theme.textDisabled,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            {collectedCount}
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>/{item.count}</Text>
        </View>
        {repeatedCount > 0 && (
          <Text style={{ color: colors.accentOrange, fontSize: 11, fontWeight: '600' }}>
            {repeatedCount}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(TeamCard)
