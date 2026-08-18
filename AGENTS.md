# AGENTS.md — mi-album-fifa

Tracker del álbum de figuritas FIFA World Cup 2026. Monorepo npm workspaces:

- `apps/web` — React 18 + Vite 5 + Tailwind CSS v4 (SPA sin router; `App.tsx` compone todo)
- `apps/mobile` — Expo SDK 56 + RN 0.85 + expo-router (rutas en `app/`)
- `packages/shared` — `@mi-album-fifa/shared`. **Sin build step**: `main` apunta a `src/index.ts`; ambas apps consumen el TS directo (metro `watchFolders` + `paths` en tsconfig)
- `supabase` — `schema.sql` (ejecutar a mano en SQL Editor) + Edge Functions Deno (`upsert-user`, `import-collection`; deploy: `supabase functions deploy <name>`)

## Comandos (siempre con `nvm use &&`; `.nvmrc` = v22.7.0)

```bash
nvm use && npm install          # en la raíz, instala todos los workspaces
npm run dev:web                 # Vite dev server
npm run dev:mobile              # Expo dev server → QR para Expo Go
npm run lint                    # ESLint de web Y mobile (cada app tiene su propia config)
npm run typecheck               # tsc raíz (web+shared) && tsc mobile
npm run format                  # Prettier: sin punto y coma, comillas simples, 100 cols
npm run build:web               # build producción web
```

**No hay tests ni CI** (`.github` solo tiene templates). Verificación = `lint` + `typecheck` + `build:web` / `npx expo export --platform android`.

## Variables de entorno

- `apps/web/.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Vite las lee desde `apps/web`, no desde la raíz)
- `apps/mobile/.env` → `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. **Sin esto la app crashea al arrancar** (`createClient` a nivel módulo en `src/lib/supabaseClient.ts`)
- Builds EAS en la nube no leen `.env`: las `EXPO_PUBLIC_*` deben ser EAS secrets
- `npm run bump-version` requiere `SUPABASE_SERVICE_ROLE_KEY` en `apps/mobile/.env`

## Web: lo que NO es obvio

- Estilos = **Tailwind v4** (`@tailwindcss/vite`). Todos los tokens/tema viven en `src/index.css`: `@theme inline` mapea utilities a CSS vars; light/dark vía `:root` y `[data-theme='dark']`. Ya no existe `src/styles/` — no recrear archivos CSS modulares
- i18n y datos (stickers, flags, curiosities) están **solo en `packages/shared/src/`** — no existen `apps/web/src/i18n` ni `apps/web/src/data`. Hooks de `src/hooks/` envuelven los factory hooks del shared (`createI18nHook`, `createUseAuth`, etc.)
- Imports locales con extensión `.ts`/`.tsx` (`allowImportingTsExtensions`)
- Alias `@/*` → `apps/web/src/*`
- El `vite.config.js` de la **raíz** es un leftover sin uso; el real es `apps/web/vite.config.js`

## Mobile: lo que NO es obvio

- Estilos = **inline style objects** + `ThemeContext` (`src/context/ThemeContext.tsx`, objetos `light`/`dark` + `colors`). NativeWind está instalado y configurado en metro/babel pero casi no se usa (1 archivo) — seguir el patrón inline
- Alias `@/*` → raíz de `apps/mobile` (distinto al de web)
- Compatible con **Expo Go**: `expo-dev-client` es dependencia pero nunca se importa; todos los módulos nativos están en Expo Go
- **NO eliminar `unstable_enablePackageExports: false` de `metro.config.js`**. Sin eso Hermes falla compilando el `.mjs` de `@supabase/supabase-js` (`import(OTEL_PKG)`): `hermesc finished with non-zero exit value 2`
- Antes de un EAS Build, verificar localmente: `npx expo export --platform android` (debe terminar con `Exported: dist`)
- `apps/mobile/AGENTS.md`: leer docs versionadas de Expo en https://docs.expo.dev/versions/v56.0.0/ antes de escribir código

## Release Android

`eas.json` usa `appVersionSource: remote`. Flujo:

1. `npm run bump-version` — lee el versionCode remoto de EAS, setea `app.json` version = `1.0.<code>` y sube `version.json` (con `published: false`) al bucket Supabase `app-updates`
2. `npm run build:mobile:android` (EAS, auto-incrementa versionCode)
3. El banner de actualización in-app (`useUpdateAvailability`) solo aparece cuando `published: true` en ese `version.json`

`vercel.json` tiene `ignoreCommand`: pushes que solo tocan `apps/mobile/` no redeployan web.

## Convenciones del proyecto

- **Español neutro sin voseo** en todos los textos visibles ("puedes", no "podés")
- **Nunca hardcodear texto visible** en JSX: usar `t()` de `useI18n` y agregar la clave en AMBOS `packages/shared/src/i18n/es.json` y `en.json` (única fuente de traducciones)
- TypeScript strict; `any` prohibido (ESLint error en ambas apps); props como interfaces `*Props`
- Lógica y queries a Supabase en hooks, no en componentes; Edge Functions vía `invokeFunction`
- Los códigos especiales `FWC`, `CC` y `00` no son selecciones: se excluyen de conteos de equipos (ver `SPECIAL_CODES` en `packages/shared/src/hooks/useGlobalCollection.ts`)
