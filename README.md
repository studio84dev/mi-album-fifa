![Mi Álbum FIFA Banner](./public/og-image.png)

# ⚽ Mi Álbum FIFA — World Cup 2026

> **Find your sticker page in seconds. Track your collection. Never lose a swap again.**

Live at → **https://mialbumfifa.com**

Also available as a **React Native mobile app** (Expo).

---

## ✨ What is this?

Mi Álbum FIFA is a fast, mobile-first application for collectors of the **FIFA World Cup 2026 Panini sticker album**.

Search any country instantly, track your collection digitally, manage repeated stickers and quickly check what you already own while swapping with friends or family.

Originally built as a side project during the World Cup sticker season, the app has evolved into a full open-source collector companion available as both a **web app** and **mobile app**, focused on speed, simplicity and real-world usability.

---

## 🚀 Features

### 🔍 Smart Search

- Search by:
  - country code (`GER`)
  - country name (`Germany`)
  - album page number

- Real-time filtering with instant results
- Fast UX optimized for live trading sessions

### 🗂️ Digital Album _(requires login)_

- Google login via Supabase Auth
- Track collected stickers
- Mark repeated stickers
- Per-country progress tracking
- Cloud sync across devices

### 🌍 Country Cards

- 48 countries across groups A–L
- Flags, codes, page numbers and progress indicators
- Mobile-friendly layout
- Group-based visual styling

### 💡 Curiosity Carousel

- Fun facts and curiosities for each country
- Localized content (`EN` / `ES`)

### 📱 Mobile-first Experience

- Responsive UI optimized for trading sessions
- **Native mobile app** with Expo (iOS & Android)
- Theme support (light/dark mode)
- Welcome onboarding modal
- Persistent promo banners
- Share menu with native share sheet
- Scroll-to-top shortcuts
- Long-press gestures for quick actions
- Haptic feedback support

### 🌐 Internationalization

- English and Spanish support
- Lightweight custom i18n implementation

---

## ❤️ Open Source

This project started as a small side project for football collectors and families during the FIFA World Cup 2026 sticker season.

Contributions, ideas, bug reports and UX improvements are always welcome 🙌

If you enjoy the project:

- ⭐ Star the repository
- 🐛 Open an issue
- 💡 Suggest new ideas
- 🚀 Share it with fellow collectors

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution guidelines.

---

## 🛠️ Tech Stack

### Web App

| Layer         | Tech                                                          |
| ------------- | ------------------------------------------------------------- |
| Frontend      | React 18 + TypeScript (strict) + Vite 5                       |
| Styling       | Vanilla CSS + CSS variables                                   |
| Auth          | Supabase Auth (Google OAuth)                                  |
| Database      | Supabase PostgreSQL + RLS                                     |
| Backend Logic | Supabase Edge Functions (Deno / TypeScript)                   |
| Hosting       | Vercel                                                        |
| Icons / Flags | [`flag-icons`](https://github.com/lipis/flag-icons) by @lipis |

### Mobile App

| Layer         | Tech                                      |
| ------------- | ----------------------------------------- |
| Framework     | Expo SDK 56 + React Native 0.85           |
| Router        | expo-router (file-based routing)          |
| Styling       | Inline StyleSheet objects (no CSS)        |
| Storage       | @react-native-async-storage/async-storage |
| Icons / Flags | react-native-svg                          |
| Safe Area     | react-native-safe-area-context            |

---

## 🧱 Project Structure (Monorepo)

This is an npm workspaces monorepo with web, mobile, and shared packages:

```text
mi-album-fifa/
├── apps/
│   ├── web/                 # React 18 + Vite SPA
│   │   ├── src/
│   │   │   ├── components/  # UI components (.tsx)
│   │   │   ├── hooks/       # Custom hooks (.ts)
│   │   │   ├── data/        # Static album data
│   │   │   ├── styles/      # Modular CSS
│   │   │   ├── i18n/        # Translations
│   │   │   └── lib/         # Supabase client
│   │   └── ...
│   │
│   └── mobile/              # Expo SDK 56 + React Native
│       ├── app/             # File-based routing (expo-router)
│       ├── src/
│       │   ├── components/  # RN components (.tsx)
│       │   ├── hooks/       # Custom hooks (.ts)
│       │   ├── data/        # Static files
│       │   └── lib/         # Supabase client
│       └── ...
│
├── packages/
│   └── shared/              # @mi-album-fifa/shared
│       └── src/
│           ├── data/        # stickers, flags, curiosities
│           ├── hooks/       # Factory hooks
│           ├── i18n/        # Translation JSONs
│           └── lib/         # Supabase helpers
│
└── supabase/
    └── functions/           # Edge Functions
```

---

## 🎨 Design Philosophy

Mi Álbum FIFA is designed to feel:

- fast
- minimal
- mobile-first
- clean
- accessible
- easy to use during real sticker trading sessions

The UI intentionally avoids excessive visual noise and prioritizes usability and clarity.

---

## ⚙️ Local Development

### Prerequisites

- Node.js 18+ (see `.nvmrc` for exact version)
- A Supabase project with Google OAuth enabled
- For mobile: Expo Go app on your device or simulator

### Setup

```bash
git clone https://github.com/studio84dev/mi-album-fifa.git

cd mi-album-fifa

nvm use && npm install
```

Create environment files:

**Root `.env` (for web):**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**`apps/mobile/.env` (for mobile):**

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running the Apps

**Web app:**

```bash
nvm use && npm run dev:web
```

**Mobile app:**

```bash
nvm use && npm run dev:mobile
```

The mobile app will start an Expo development server. Scan the QR code with the Expo Go app on your device, or press `i` for iOS simulator / `a` for Android emulator.

---

## 📦 Available Scripts

```bash
# Development
npm run dev:web      # Start web development server
npm run dev:mobile   # Start Expo development server

# Building
npm run build:web    # Production build for web
npm run build:mobile # Build mobile app for production

# Code quality
npm run lint         # ESLint + TypeScript checks
npm run format       # Prettier formatting
```

---

## 🚢 Deployment

Hosted on Vercel.

- `master` → production
- `staging` → preview deployments

Every push automatically triggers a deployment.

---

## 🔒 Security Notes

- Supabase Row-Level Security (RLS) enabled
- Users can only access their own sticker data
- Service role key never exposed to the client
- Authenticated writes validated server-side

---

## 🙌 Credits

- [`flag-icons`](https://github.com/lipis/flag-icons) by @lipis
- [SVG Repo](https://www.svgrepo.com/) — open-licensed SVG icons
- FIFA World Cup sticker collecting community
- Everyone sharing and contributing ideas

---

Developed with ❤️ by Studio84
