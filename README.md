# Mi Álbum FIFA — World Cup 2026

Tracker digital del álbum de figuritas FIFA World Cup 2026. Web app + mobile app (Expo).

**Web:** https://mialbumfifa.com (Vercel)
**Mobile:** Android via EAS Build

---

## Stack

| | Web | Mobile |
|---|---|---|
| Framework | React 18 + Vite 5 + Tailwind v4 | Expo SDK 56 + RN 0.85 |
| Routing | SPA (App.tsx compone todo) | expo-router (file-based) |
| Styling | Tailwind v4 + CSS vars | Inline StyleSheet + ThemeContext |
| Auth/DB | Supabase (Google OAuth + RLS) | Supabase (Google OAuth + RLS) |
| Monorepo | npm workspaces | npm workspaces |

**Shared package** (`packages/shared`): datos, i18n, hooks factory, decodificadores QR. Sin build step — ambas apps consumen el TS directo.

---

## Setup

```bash
nvm use            # Node v22.7.0
npm install
```

### Variables de entorno

**Web** — crear `apps/web/.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Mobile** — crear `apps/mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # solo para bump-version
```

> ⚠️ Sin `EXPO_PUBLIC_*` la app crashea al arrancar. Los builds EAS no leen `.env` — las vars deben ser EAS secrets.

---

## Comandos

```bash
npm run dev:web            # Vite dev server
npm run dev:mobile         # Expo dev server → QR para Expo Go

npm run test               # Vitest (shared + mobile, 33 tests)
npm run test:shared        # Solo tests del shared package
npm run test:mobile        # Solo tests del mobile package

npm run lint               # ESLint (web + mobile)
npm run typecheck          # tsc (web+shared) && tsc mobile
npm run format             # Prettier

npm run build:web          # Build producción web
npm run build:mobile:android   # EAS Build Android
```

---

## Tests

Framework: **Vitest**. Archivos de test:
- `packages/shared/src/lib/externalQR.test.ts` — 13 tests (decoding QR externo Panini)
- `apps/mobile/src/lib/qrCodec.test.ts` — 20 tests (encoding/decoding interno, matching, trade QRs)

```bash
npm test                   # corre ambos suites
```

CI: `.github/workflows/ci.yml` corre tests + typecheck + lint + build web en cada push/PR a main.

---

## Release Android

`eas.json` usa `appVersionSource: remote`:

1. `npm run bump-version` — lee versionCode remoto, actualiza `app.json`, sube `version.json` al bucket Supabase `app-updates`
2. `npm run build:mobile:android` — EAS Build (auto-incrementa versionCode)
3. El banner de actualización in-app solo aparece cuando `published: true` en `version.json`

Antes de un EAS Build, verificar localmente:
```bash
npx expo export --platform android   # debe terminar con "Exported: dist"
```

---

## Convenciones

- **Español neutro sin voseo** en textos visibles ("puedes", no "podés")
- **Nunca hardcodear texto** en JSX — usar `t()` de `useI18n`, claves en `packages/shared/src/i18n/es.json` y `en.json`
- TypeScript strict, `any` prohibido
- Lógica y queries a Supabase en hooks, no en componentes
- Códigos `FWC`, `CC`, `00` no son selecciones — se excluyen de conteos de equipos

---

## Estructura

```
mi-album-fifa/
├── apps/
│   ├── web/                  # React 18 + Vite + Tailwind v4
│   └── mobile/               # Expo SDK 56 + React Native
│       └── app/              # Rutas (expo-router)
├── packages/
│   └── shared/               # @mi-album-fifa/shared
│       └── src/
│           ├── data/         # stickers, flags, curiosities
│           ├── hooks/        # factory hooks
│           ├── i18n/         # es.json, en.json
│           └── lib/          # externalQR.ts, shared utils
└── supabase/
    ├── schema.sql            # ejecutar en SQL Editor
    └── functions/            # Edge Functions Deno
```

---

Desarrollado con ❤️ por Studio84
