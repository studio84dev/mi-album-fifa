import { forwardRef } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import type { TextInput as TextInputType } from 'react-native'
import { useTheme } from '@/src/hooks/useTheme'
import { useI18n } from '@/src/hooks/useI18n'

interface SearchBarProps {
  value: string
  onChangeText: (_text: string) => void
  onClear: () => void
  placeholder?: string
}

const SearchBar = forwardRef<TextInputType, SearchBarProps>(function SearchBar(
  { value, onChangeText, onClear, placeholder },
  ref
) {
  const { theme } = useTheme()
  const { t } = useI18n()

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.bgPrimary }}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.bgTertiary,
          borderWidth: 1,
          borderColor: theme.borderColor,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: theme.textMuted, marginRight: 8 }}>🔍</Text>
        <TextInput
          ref={ref}
          style={{ flex: 1, color: theme.textPrimary, fontSize: 14, paddingVertical: 0 }}
          placeholder={placeholder ?? t('searchPlaceholder')}
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          multiline={false}
        />
        {value.length > 0 && (
          <Pressable onPress={onClear} hitSlop={8}>
            <Text
              style={{
                color: theme.textSecondary,
                marginLeft: 8,
                fontSize: 16,
                fontWeight: '700',
                lineHeight: 20,
              }}
            >
              ✕
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
})

export default SearchBar
