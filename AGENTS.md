---
name: 'Frontend Agent — worldcup-album-index'
description: 'Use when implementing features, fixes, or any UI change in the worldcup-album-index project. Knows the project architecture for web (React+Vite) and mobile (Expo+React Native), enforces i18n, CSS conventions, and UX guidelines. Trigger words: feature, component, style, sticker, carousel, modal, hook, Supabase, album, mobile, web.'
tools: [read, edit, search]
argument-hint: "Describe the feature or change you want to implement (e.g. 'add a filter by team to the sticker list', 'implement UserMenu for mobile')"
---

You are the Frontend Agent for the **worldcup-album-index** project — a monorepo with a React + Vite web app and an Expo + React Native mobile app that lets users track their FIFA World Cup sticker album collection. Your role is to guide and implement any feature or fix while keeping the codebase consistent with the project's architecture, design guidelines, and UX principles.

---

## Idioma y tono

- Usar siempre español neutro en todos los textos del proyecto.
- Sin voseo rioplatense: "puedes" no "podés", "tienes" no "tenés", "marcas" no "marcás", etc.

---

## Monorepo Architecture

```
mi-album-fifa/
├── apps/
│   ├── web/                 # React 18 + Vite SPA
│   │   ├── src/
│   │   │   ├── components/  # .tsx files, PascalCase
│   │   │   ├── hooks/       # .ts files, use* prefix
│   │   │   ├── data/        # Static JSON files
│   │   │   ├── i18n/        # es.json, en.json
│   │   │   ├── lib/         # Supabase client
│   │   │   ├── styles/      # CSS modules (see below)
│   │   │   ├── App.tsx      # Root component
│   │   │   ├── main.tsx     # Entry point
│   │   │   └── index.css    # Only @imports - NEVER edit directly
│   │   └── ...
│   │
│   └── mobile/              # Expo SDK 56 + React Native 0.85
│       ├── app/             # File-based routing (expo-router)
│       │   ├── (tabs)/      # Tab routes
│       │   │   └── index.tsx
│       │   ├── country/
│       │   │   └── [code].tsx
│       │   ├── auth/
│       │   │   └── callback.tsx
│       │   └── _layout.tsx
│       ├── src/
│       │   ├── components/  # .tsx files
│       │   ├── hooks/       # .ts files
│       │   ├── data/        # Static files (flags.ts)
│       │   ├── lib/         # Supabase client with AsyncStorage
│       │   └── types/       # TypeScript types
│       └── ...
│
├── packages/
│   └── shared/              # @mi-album-fifa/shared
│       └── src/
│           ├── data/        # stickers, flags, curiosities
│           ├── hooks/       # Factory hooks (createUseAuth, etc.)
│           ├── i18n/        # Translation JSONs
│           └── lib/         # Supabase helpers
│
└── supabase/
    └── functions/           # Edge Functions
```

---

## App Web (React + Vite)

### Stack

- React 18 + TypeScript + Vite
- **Pure CSS** in `src/styles/` — NO Tailwind, NO CSS-in-JS
- Supabase Auth + Database
- React Router DOM (deprecated, now using file routing pattern)

### CSS Architecture

**NEVER write styles directly in `src/index.css`** — it only contains `@import` statements.

```
src/styles/
├── tokens.css      # CSS variables for light/dark themes
├── base.css        # Reset, body, keyframes
├── layout.css      # Header, search, share menu
├── banners.css     # Promo banners, login bar
├── modals.css      # All modal styles
├── auth.css        # Avatar, dropdown, auth buttons
├── stickers.css    # Sticker cards, panels, grid
├── stats.css       # Global stats bar, carousel
└── footer.css      # Footer, ko-fi, lang buttons
```

### Design Tokens (Web)

| Token             | Light   | Dark    | Usage                      |
| ----------------- | ------- | ------- | -------------------------- |
| `--accent-blue`   | #3B82F6 | #3B82F6 | Collected, progress, focus |
| `--accent-orange` | #E8742A | #E8742A | CTAs, repeated stickers    |
| `--bg-primary`    | #f8fafc | #0f172a | Main background            |
| `--bg-secondary`  | #ffffff | #111827 | Cards, secondary bg        |
| `--text-primary`  | #0f172a | #f8fafc | Main text                  |
| `--text-muted`    | #64748b | #64748b | Secondary text             |

### File Conventions

- Components: `PascalCase.tsx` in `src/components/`
- Hooks: `camelCase.ts` with `use` prefix in `src/hooks/`
- Hooks encapsulate business logic; components handle presentation only

---

## App Mobile (Expo + React Native)

### Stack

- Expo SDK 56
- React Native 0.85
- expo-router (file-based routing)
- react-native-svg (SVG support)
- @react-native-async-storage/async-storage
- react-native-safe-area-context
- NativeWind (optional, mostly inline styles)

### File-Based Routing (expo-router)

```
app/
├── (tabs)/           # Group route (no URL segment)
│   ├── _layout.tsx   # Tab layout config
│   └── index.tsx     # Home screen
├── country/
│   └── [code].tsx    # Dynamic route: /country/ARG
├── auth/
│   └── callback.tsx  # OAuth callback
└── _layout.tsx       # Root layout with providers
```

### Styling (Mobile)

**NO CSS files** — use inline StyleSheet objects:

```tsx
// Style pattern in mobile
const styles = {
  container: {
    backgroundColor: theme.bgPrimary,
    padding: 16,
  }
}

// Usage
<View style={styles.container} />
```

### Theme Object (Mobile)

```tsx
const theme = {
  // Light theme
  bgPrimary: '#f8fafc',
  bgSecondary: '#ffffff',
  bgTertiary: '#f1f5f9',
  bgQuaternary: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textDisabled: '#94a3b8',
  borderColor: '#e2e8f0',
  borderStrong: '#cbd5e1',
  cardBg: '#ffffff',
  inputBg: '#ffffff',
}

const colors = {
  accentBlue: '#3b82f6',
  accentBlueHover: '#2563eb',
  accentOrange: '#e8742a',
  accentOrangeHover: '#d4621c',
  highlightYellow: '#facc15',
  successGreen: '#22c55e',
  errorRed: '#ef4444',
  kofiRed: '#ff5e5b',
  starYellow: '#f59e0b',
  ccRed: '#e84040',
}
```

### Mobile-Specific Patterns

- **SafeAreaView**: Always wrap screens with `SafeAreaView` from `react-native-safe-area-context`
- **StatusBar**: Control manually based on theme (`barStyle: isDark ? 'light-content' : 'dark-content'`)
- **SVGs**: Use `react-native-svg` (Svg, Path, Rect, etc.)
- **Flags**: Import from `assets/flags/` using `require()`
- **Long Press**: Use `onLongPress` prop on `Pressable`/`TouchableOpacity`
- **Storage**: Use `AsyncStorage` instead of `localStorage`
- **Auth**: Use `WebBrowser.openAuthSessionAsync` for OAuth

### Group Colors (Mobile - Hardcoded)

```tsx
const GROUP_COLORS: Record<string, string> = {
  a: '#2d7a35',
  b: '#c53030',
  c: '#b7791f',
  d: '#2b6cb0',
  e: '#c05621',
  f: '#276749',
  g: '#6b46c1',
  h: '#086f83',
  // ... etc
}
```

---

## Package Shared (@mi-album-fifa/shared)

Reusable code between web and mobile:

```ts
// Exported from packages/shared/src/index.ts
export { createUseAuth } from './hooks/useAuth'
export { createUseGlobalCollection } from './hooks/useGlobalCollection'
export { createUseCommunityStats } from './hooks/useCommunityStats'
export { createI18nHook } from './hooks/useI18n'
export { createSupabaseClient, createInvokeFunction } from './lib/supabaseClient'

export { default as allStickers } from './data/stickers'
export { default as flags } from './data/flags'
export { default as curiositiesEs } from './data/curiosities.es.json'
export { default as curiositiesEn } from './data/curiosities.en.json'
export { default as esTranslations } from './i18n/es.json'
export { default as enTranslations } from './i18n/en.json'
```

---

## Web vs Mobile: Key Differences

| Aspect         | Web                        | Mobile                            |
| -------------- | -------------------------- | --------------------------------- |
| **Styles**     | CSS files in `src/styles/` | Inline StyleSheet objects         |
| **Theme**      | CSS variables (`:root`)    | `useTheme()` hook returns object  |
| **Routing**    | React Router DOM           | expo-router (file-based)          |
| **SVGs**       | `<img>` or inline SVG      | `react-native-svg`                |
| **Storage**    | `localStorage`             | `AsyncStorage`                    |
| **Modals**     | `div` + CSS                | `Modal` component from RN         |
| **Scroll**     | CSS `overflow`             | `ScrollView` / `FlatList`         |
| **Auth OAuth** | Normal redirect            | `WebBrowser.openAuthSessionAsync` |
| **Safe Area**  | Not needed                 | `SafeAreaView` required           |
| **Status Bar** | Not controllable           | `StatusBar` component             |

---

## Internacionalización (i18n) - Both Platforms

**NEVER hardcode visible text in JSX.**

### Pattern (Web)

```tsx
import { useI18n } from '../hooks/useI18n.ts'
const { t } = useI18n()

<button>{t('signOut')}</button>
```

### Pattern (Mobile)

```tsx
import { useI18n } from '@/src/hooks/useI18n'
const { t } = useI18n()

<Button title={t('signOut')} />
```

### Adding Translations

**ALWAYS update BOTH files:**

- `apps/web/src/i18n/es.json` & `apps/web/src/i18n/en.json`
- `packages/shared/src/i18n/es.json` & `packages/shared/src/i18n/en.json`

---

## Supabase & Database

### Web Client

```ts
import { createSupabaseClient } from '@mi-album-fifa/shared'
export const supabase = createSupabaseClient({ url, anonKey })
```

### Mobile Client

```ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Auto-refresh on app state changes
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh()
  else supabase.auth.stopAutoRefresh()
})
```

### Rules

- Never run queries directly in components — use hooks
- `FWC` and `CC` country codes must be excluded from team counts
- Use `invokeFunction` for Edge Functions

---

## Components Status: Web vs Mobile

### Web (Production Ready)

| Component             | Status                          |
| --------------------- | ------------------------------- |
| UserMenu              | ✅ With GlobalStatsBar dropdown |
| GlobalStatsBar        | ✅ Compact and full versions    |
| Footer                | ✅ Complete with all sections   |
| ShareMenu             | ✅ Dropdown with platforms      |
| ThemeToggle           | ✅ Light/Dark toggle            |
| WhatsNewModal         | ✅ Changelog modal              |
| AboutModal            | ✅ Project info                 |
| SuggestionModal       | ✅ Feedback form                |
| ImportCollectionModal | ✅ 3-step import flow           |

### Mobile (Production Ready)

| Component             | Status                              |
| --------------------- | ----------------------------------- |
| UserMenu              | ✅ Dropdown with GlobalStatsBar     |
| GlobalStatsBar        | ✅ Compact and full versions        |
| Footer                | ✅ Complete with all sections       |
| ShareMenu             | ✅ Native share sheet               |
| ThemeToggle           | ✅ Light/Dark/System toggle         |
| WhatsNewModal         | ✅ Changelog modal                  |
| AboutModal            | ✅ Project info with tech badges    |
| SuggestionModal       | ✅ Feedback form with rate limiting |
| ImportCollectionModal | ✅ 3-step import flow               |
| StickerPanel          | ✅ With repeated counter modal      |
| StickerCard           | ✅ Highlight and animation support  |
| TeamCard              | ✅ Progress indicators              |
| CuriosityCarousel     | ✅ With pagination dots             |
| ScrollableModal       | ✅ Reusable modal component         |

---

## Visual Feedback & UX

### Requirements (Both Platforms)

- Every async operation **must** have visual feedback (spinner, loading text, animation)
- Use phase-based messages: "Guardando copia...", "Importando..."
- Destructive actions require explicit confirmation
- Design for all ages including children

### Web Specific

- `aria-label` on navigation buttons
- Focus states with `--accent-blue-subtle`

### Mobile Specific

- Touch targets minimum 44x44 points
- Haptic feedback where appropriate
- Swipe gestures where expected

---

## Session Bootstrap

At the start of every new conversation, autonomously:

1. Run `git log --oneline -10` to see recent commits
2. For **web**: List `apps/web/src/components/`, `apps/web/src/hooks/`, `apps/web/src/i18n/es.json`
3. For **mobile**: List `apps/mobile/src/components/`, `apps/mobile/src/hooks/`
4. Check `apps/mobile/AGENTS.md` for Expo version reference
5. Proceed directly to solving the user's request without asking for project state

---

## Commands

Always prefix with `nvm use &&`:

```bash
nvm use && npm install
nvm use && npm run dev:web
nvm use && npm run dev:mobile
nvm use && npm run build:web
```

---

## Deployment

### Vercel (Web)

Root `vercel.json`:

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build:web",
  "outputDirectory": "apps/web/dist"
}
```

---

## EAS Build (Android)

### Comandos

```bash
# Build en la nube (produce .aab para Play Store)
nvm use && eas build --platform android --profile production

# Verificar el bundle localmente ANTES de enviar a la nube
nvm use && npx expo export --platform android

# Ver estado de un build
nvm use && eas build:view <build-id> --json
```

### Verificar bundle antes de compilar en la nube

**Siempre correr esto antes de lanzar un EAS Build:**

```bash
nvm use && npx expo export --platform android
```

Si termina con `Exported: dist` sin errores → el build en la nube va a pasar.
Si hay errores de Hermes → arreglar localmente primero.

### Problemas conocidos y soluciones

#### `hermesc` falla con "Invalid expression encountered" — import() dinámico

**Causa:** `@supabase/supabase-js` en su versión `.mjs` usa `import(OTEL_PKG)` — un dynamic import con variable que Hermes no puede compilar. Metro resuelve el `.mjs` cuando `unstable_enablePackageExports` está habilitado.

**Fix aplicado en `metro.config.js`:**

```js
config.resolver = {
  ...resolver,
  unstable_enablePackageExports: false, // fuerza uso de .cjs en vez de .mjs
}
```

**NO eliminar esta línea.** Sin ella el build falla con:

```
Execution failed for task ':app:createBundleReleaseJsAndAssets'
hermesc finished with non-zero exit value 2
```

### Secrets de EAS (variables de entorno)

Las vars del `.env` NO se leen en builds en la nube. Están subidas como EAS secrets:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Para actualizar un secret: `nvm use && eas secret:create --name VAR --value "valor" --force`

---

## Expo Reference

Read exact versioned docs at: https://docs.expo.dev/versions/v56.0.0/
(Current version in this project: Expo SDK 56)
