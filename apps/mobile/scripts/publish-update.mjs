#!/usr/bin/env node
/**
 * publish-update.mjs
 *
 * Sets published: true in the version.json file in Supabase Storage.
 * This triggers the in-app update banner for users.
 *
 * Usage:
 *   node scripts/publish-update.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in apps/mobile/.env or .env.local
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

console.log('')
console.log('🚀 Mi Álbum FIFA - Publish Update')
console.log('====================================')
console.log('')

// --- Load env files ---
console.log('📝 Step 1/2: Loading environment variables...')
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
  process.exit(1)
}
console.log('    ✓ Environment variables loaded')
console.log('')

// --- Fetch current version.json and update published to true ---
console.log('📤 Step 2/2: Updating version.json in Supabase...')
const supabaseUrl = 'https://jmgiooeiimjyyltpgrna.supabase.co'
const bucket = 'app-updates'
const filePath = 'version.json'

try {
  // Fetch current version.json
  const currentRes = await fetch(`${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`)
  if (!currentRes.ok) {
    throw new Error(`Could not fetch current version.json (HTTP ${currentRes.status})`)
  }
  const currentData = await currentRes.json()
  console.log(`    Current version.json: ${JSON.stringify(currentData)}`)

  // Update published to true
  const updatedData = { ...currentData, published: true }
  console.log(`    New version.json: ${JSON.stringify(updatedData)}`)

  // Upload updated version.json
  const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body: JSON.stringify(updatedData, null, 2) + '\n',
  })

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text()
    throw new Error(`Upload failed (HTTP ${uploadResponse.status}): ${text}`)
  }

  console.log('    ✓ version.json updated successfully')
  console.log('')
  console.log('====================================')
  console.log('✅ Update published!')
  console.log(`   Users with versionCode < ${updatedData.androidVersionCode} will see the update banner`)
  console.log('')
} catch (err) {
  console.error('')
  console.error(`❌ Failed to publish update: ${err.message}`)
  console.error('')
  process.exit(1)
}
