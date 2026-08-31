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

### Proceso completo

El release tiene dos fases: **build** y **publicación**.

#### Fase 1 — Build y release automático

Ejecutar **un solo comando**:

```bash
npm run release
```

Este comando ejecuta en orden:

1. **`export`** — Valida que la app compila correctamente (`npx expo export --platform android`). Si falla, se detiene aquí.
2. **`bump-version`** — Lee el `versionCode` actual desde EAS (o Supabase como fallback), lo incrementa en 1, actualiza `app.json` (ej: `1.0.24` → `1.0.25`) y sube `version.json` al bucket `app-updates` de Supabase con `published: false`.
3. **`build:mobile:android`** — EAS Build genera el APK/AAB en la nube usando el `versionCode` recién seteado. Esto tarda varios minutos.
4. **`release:commit`** — Automáticamente commitea y pushea el cambio en `app.json` con el mensaje `Bump version to 1.0.XX`.

El resultado es:
- Un archivo `.aab` disponible en [Expo Dashboard](https://expo.dev/accounts/studio84dev/projects/mi-album-fifa/builds) para subir a Play Store
- `app.json` con la nueva versión commiteada y pusheada a `master`
- `version.json` en Supabase con `published: false`

#### Fase 2 — Subir a Play Store

1. Ir a [Google Play Console](https://play.google.com/console) → **Producción** → **Crear release nuevo**
2. Subir el `.aab` generado por EAS
3. Completar notas de release (si aplica)
4. Enviar para revisión

#### Fase 3 — Publicar actualización in-app

Una vez que la nueva versión está disponible en Play Store (o cuando quieras que los usuarios vean el banner de actualización):

```bash
npm run publish-update
```

Este comando cambia `published: false` → `published: true` en el `version.json` de Supabase. A partir de ese momento, cualquier usuario con una versión instalada menor a la publicada verá el banner de actualización.

### Sistema de versiones

| Archivo | Qué controla | Ejemplo |
|---------|-------------|---------|
| `app.json` → `version` | Versión visible (semver) | `1.0.25` |
| `app.json` → `android.versionCode` | Código numérico (auto por EAS) | `25` |
| Supabase `version.json` → `androidVersionCode` | Versión más reciente disponible | `25` |
| Supabase `version.json` → `published` | Si notificar a usuarios | `true` / `false` |

### Lógica del banner de actualización

La app muestra el banner cuando se cumplen **ambas** condiciones:
1. `published === true` en Supabase
2. La versión instalada (`versionCode` local) es menor a `androidVersionCode` en Supabase

Esto permite controlar cuándo notificar independientemente de cuándo se sube el APK.

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
