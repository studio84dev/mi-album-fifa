#!/usr/bin/env node
/**
 * bump-version.mjs
 *
 * 1. Queries EAS for the current remote androidVersionCode
 * 2. Computes nextVersionCode = current + 1
 * 3. Bumps app.json version (patch: 1.0.1 → 1.0.2)
 * 4. Uploads { androidVersionCode: nextVersionCode } to Supabase Storage
 *
 * Usage:
 *   node scripts/bump-version.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in apps/mobile/.env or .env.local
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

console.log('')
console.log('🚀 Mi Álbum FIFA - Release Android')
console.log('=====================================')
console.log('')

// --- Load env files ---
console.log('📝 Step 1/3: Loading environment variables...')
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
for (const envFile of ['.env.local', '.env']) {
  if (serviceRoleKey) break
  try {
    const content = readFileSync(resolve(ROOT, envFile), 'utf-8')
    for (const line of content.split('\n')) {
      const [key, ...rest] = line.split('=')
      if (key?.trim() === 'SUPABASE_SERVICE_ROLE_KEY') {
        serviceRoleKey = rest.join('=').trim()
        break
      }
    }
  } catch {
    // file doesn't exist, try next
  }
}

if (!serviceRoleKey) {
  console.error('')
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found!')
  console.error('')
  console.error('To fix this:')
  console.error('1. Go to Supabase Dashboard → Settings → API')
  console.error('2. Copy the "service_role" key (secret)')
  console.error('3. Add it to apps/mobile/.env:')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-key-here')
  console.error('')
  console.error('This key is only needed for releases, never exposed to users.')
  process.exit(1)
}
console.log('    ✓ Environment variables loaded')
console.log('')

// --- Get current versionCode from EAS or Supabase ---
console.log('🔍 Step 2/3: Fetching current versionCode...')
let currentVersionCode
try {
  const output = execSync(
    'npx eas build:version:get --platform android --profile production --non-interactive 2>&1',
    { cwd: ROOT, encoding: 'utf-8' }
  )
  const match = output.match(/Android versionCode\s*-\s*(\d+)/)
  if (!match) throw new Error(`Could not parse versionCode from output:\n${output}`)
  currentVersionCode = parseInt(match[1], 10)
  console.log(`    ✓ Current versionCode from EAS: ${currentVersionCode}`)
} catch (err) {
  console.log('    ⚠️  EAS has no build history. Checking Supabase...')
  try {
    const supabaseUrl = 'https://jmgiooeiimjyyltpgrna.supabase.co'
    const res = await fetch(`${supabaseUrl}/storage/v1/object/public/app-updates/version.json`)
    if (res.ok) {
      const data = await res.json()
      currentVersionCode = data.androidVersionCode ?? 0
      console.log(`    ✓ Current versionCode from Supabase: ${currentVersionCode}`)
    } else {
      throw new Error('Supabase version.json not found')
    }
  } catch {
    console.log('    ⚠️  No version found in Supabase either. Initializing with versionCode 1')
    currentVersionCode = 0
  }
}

const nextVersionCode = currentVersionCode + 1
console.log(`    ✓ Next versionCode will be: ${nextVersionCode}`)
console.log('')

// --- Update app.json version to match nextVersionCode (format: 1.0.<versionCode>) ---
const appJsonPath = resolve(ROOT, 'app.json')
const appJson = JSON.parse(readFileSync(appJsonPath, 'utf-8'))

const oldVersion = appJson.expo.version
const newVersion = `1.0.${nextVersionCode}`

appJson.expo.version = newVersion
writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf-8')
console.log(`📦 Step 3/3: Uploading version.json to Supabase...`)
console.log(`    ✓ app.json: ${oldVersion} → ${newVersion}`)

// --- Upload version.json to Supabase Storage ---
const supabaseUrl = 'https://jmgiooeiimjyyltpgrna.supabase.co'
const bucket = 'app-updates'
const filePath = 'version.json'
const body =
  JSON.stringify({ androidVersionCode: nextVersionCode, published: false }, null, 2) + '\n'

const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    'x-upsert': 'true',
  },
  body,
})

if (!uploadResponse.ok) {
  const text = await uploadResponse.text()
  console.error('')
  console.error(`❌ Supabase upload failed (${uploadResponse.status})`)
  console.error(`   ${text}`)
  console.error('')
  console.error('Check that the "app-updates" bucket exists in Supabase Storage.')
  process.exit(1)
}

console.log('    ✓ version.json uploaded to Supabase')
console.log('')
console.log('=====================================')
console.log('✅ Version bump complete!')
console.log(`   Version: ${newVersion}`)
console.log(`   versionCode: ${nextVersionCode}`)
console.log('')
console.log('👉 Next: Building APK on EAS...')
console.log('')
