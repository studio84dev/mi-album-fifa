# AGENTS.md — mi-album-fifa

Monorepo npm workspaces. Tracker del álbum FIFA World Cup 2026.

## Arquitectura

- **`apps/web`** — React 18 + Vite 5 + Tailwind v4. SPA sin router (`App.tsx` compone todo). Alias `@/*` → `src/*`
- **`apps/mobile`** — Expo SDK 56 + RN 0.85 + expo-router. Alias `@/*` → raíz de `apps/mobile`. Compatible con Expo Go
- **`packages/shared`** — `@mi-album-fifa/shared`. Sin build step: `main` → `src/index.ts`. Metro `watchFolders` + `paths` en tsconfig
- **`supabase/`** — `schema.sql` + Edge Functions Deno (`upsert-user`, `import-collection`)

## Datos e i18n

Todo vive en `packages/shared/src/`: stickers, flags, curiosities, `i18n/es.json` y `i18n/en.json`. NO existen en `apps/web/src/`. Web hooks envuelven factory hooks del shared.

## Variables de entorno

- **Web**: `apps/web/.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Mobile**: `apps/mobile/.env` → `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Sin esto la app crashea (createClient a nivel módulo). Builds EAS no leen `.env`: deben ser EAS secrets. `SUPABASE_SERVICE_ROLE_KEY` solo para `bump-version`

## Gotchas

- **NO tocar** `unstable_enablePackageExports: false` en `metro.config.js`. Sin eso Hermes falla compilando `@supabase/supabase-js`
- El `vite.config.js` de la raíz es un leftover sin uso; el real es `apps/web/vite.config.js`
- Mobile usa **inline StyleSheet** + `ThemeContext` (objetos `light`/`dark`). NativeWind instalado pero casi no se usa
- Web: `@tailwindcss/vite`, tokens/tema en `src/index.css` via `@theme inline` → CSS vars
- Leer docs versionadas de Expo: https://docs.expo.dev/versions/v56.0.0/
- Antes de EAS Build: `npx expo export --platform android` (debe terminar con `Exported: dist`)

## Convenciones

- Español neutro sin voseo. Nunca hardcodear texto visible — usar `t()` + claves en ambos `es.json` y `en.json`
- TypeScript strict. `any` prohibido (ESLint error). Props como `*Props` interfaces
- Lógica/queries a Supabase en hooks, no en componentes
- Códigos `FWC`, `CC`, `00` no son selecciones — excluir de conteos de equipos

## Formato QR interno

994 stickers, 50 cards (FWC 0-19, 48 teams 1-20, CC 1-14). Bitmap LSB + gzip + Base64. Mismo formato que QR externo Panini (`decodeExternalQR` en shared). Tests: `packages/shared/src/lib/externalQR.test.ts` + `apps/mobile/src/lib/qrCodec.test.ts`
