#!/usr/bin/env node
/**
 * bump-version.mjs
 *
 * Increments app.json version (patch) and android.versionCode,
 * then uploads the new version.json to the Supabase Storage bucket.
 *
 * Usage:
 *   node scripts/bump-version.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in apps/mobile/.env.local
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// --- Load .env.local ---
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
  console.error(
    '❌  SUPABASE_SERVICE_ROLE_KEY not found.\n' +
      '    Add it to apps/mobile/.env.local:\n' +
      '    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key'
  )
  process.exit(1)
}

// --- Read app.json ---
const appJsonPath = resolve(ROOT, 'app.json')
const appJson = JSON.parse(readFileSync(appJsonPath, 'utf-8'))

const oldVersion = appJson.expo.version
const oldVersionCode = appJson.expo.android.versionCode

// Bump patch version: "1.0.1" → "1.0.2"
const versionParts = oldVersion.split('.').map(Number)
versionParts[2] += 1
const newVersion = versionParts.join('.')

// Bump versionCode
const newVersionCode = oldVersionCode + 1

appJson.expo.version = newVersion
appJson.expo.android.versionCode = newVersionCode

// --- Write app.json ---
writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf-8')
console.log(`✅  app.json updated:`)
console.log(`    version:     ${oldVersion} → ${newVersion}`)
console.log(`    versionCode: ${oldVersionCode} → ${newVersionCode}`)

// --- Upload version.json to Supabase Storage ---
const supabaseUrl = 'https://jmgiooeiimjyyltpgrna.supabase.co'
const bucket = 'app-updates'
const filePath = 'version.json'
const body = JSON.stringify({ androidVersionCode: newVersionCode }, null, 2) + '\n'

const url = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`

const response = await fetch(url, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    'x-upsert': 'true',
  },
  body,
})

if (!response.ok) {
  const text = await response.text()
  console.error(`❌  Supabase upload failed (${response.status}): ${text}`)
  process.exit(1)
}

console.log(`✅  Supabase bucket updated:`)
console.log(`    ${bucket}/${filePath} → androidVersionCode: ${newVersionCode}`)
console.log(`\n🚀  Ready to build: eas build --platform android`)
