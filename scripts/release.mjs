#!/usr/bin/env node
/**
 * release.mjs
 *
 * Automated release script that handles rollback on failure.
 *
 * Flow:
 * 1. Export (validate compilation)
 * 2. Bump version (app.json + Supabase)
 * 3. EAS Build
 * 4. Commit & push
 *
 * If step 3 fails, automatically rollbacks step 2.
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const APP_JSON_PATH = resolve(ROOT, 'apps/mobile/app.json')

function log(msg) {
  console.log(`\n${msg}`)
}

function run(cmd, description) {
  log(`▶ ${description}`)
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
    return true
  } catch (err) {
    return false
  }
}

function getVersion() {
  const appJson = JSON.parse(readFileSync(APP_JSON_PATH, 'utf-8'))
  return appJson.expo.version
}

function setVersion(version) {
  const appJson = JSON.parse(readFileSync(APP_JSON_PATH, 'utf-8'))
  appJson.expo.version = version
  writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2) + '\n', 'utf-8')
}

function rollbackSupabase(previousVersion) {
  log('⚠️  Rolling back Supabase version.json...')
  
  // Extract versionCode from version string (e.g., "1.0.27" -> 27)
  const versionCode = parseInt(previousVersion.split('.')[2], 10)
  
  // Read service role key
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    try {
      const envContent = readFileSync(resolve(ROOT, 'apps/mobile/.env'), 'utf-8')
      for (const line of envContent.split('\n')) {
        const [key, ...rest] = line.split('=')
        if (key?.trim() === 'SUPABASE_SERVICE_ROLE_KEY') {
          serviceRoleKey = rest.join('=').trim()
          break
        }
      }
    } catch {
      // file doesn't exist
    }
  }
  
  if (!serviceRoleKey) {
    log('❌ Cannot rollback: SUPABASE_SERVICE_ROLE_KEY not found')
    return false
  }
  
  const supabaseUrl = 'https://jmgiooeiimjyyltpgrna.supabase.co'
  const body = JSON.stringify({ androidVersionCode: versionCode, published: false }, null, 2) + '\n'
  
  return fetch(`${supabaseUrl}/storage/v1/object/app-updates/version.json`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body,
  }).then(res => res.ok)
    .catch(() => false)
}

// Main flow
async function main() {
  log('🚀 Starting release process...')
  
  const previousVersion = getVersion()
  log(`📌 Current version: ${previousVersion}`)
  
  // Step 1: Export
  if (!run('npm run export --workspace=apps/mobile', 'Validating export...')) {
    log('❌ Export failed. Aborting.')
    process.exit(1)
  }
  
  // Step 2: Bump version
  if (!run('npm run bump-version --workspace=apps/mobile', 'Bumping version...')) {
    log('❌ Bump version failed. Aborting.')
    process.exit(1)
  }
  
  const newVersion = getVersion()
  log(`✅ Version bumped: ${previousVersion} → ${newVersion}`)
  
  // Step 3: Build
  const buildSuccess = run('npm run build:mobile:android', 'Building APK on EAS...')
  
  if (!buildSuccess) {
    log('❌ Build failed! Rolling back version...')
    
    // Rollback app.json
    setVersion(previousVersion)
    log(`✅ Rolled back app.json to ${previousVersion}`)
    
    // Rollback Supabase
    const supabaseRolledBack = await rollbackSupabase(previousVersion)
    if (supabaseRolledBack) {
      log('✅ Rolled back Supabase version.json')
    } else {
      log('❌ Failed to rollback Supabase. Manual intervention required.')
    }
    
    process.exit(1)
  }
  
  // Step 4: Commit & push
  log('📦 Committing version bump...')
  const commitCmd = `git add apps/mobile/app.json && git commit -m "Bump version to ${newVersion}" && git push`
  if (!run(commitCmd, 'Committing and pushing...')) {
    log('⚠️  Commit failed, but build was successful. Please commit manually.')
  } else {
    log('✅ Version bump committed and pushed')
  }
  
  log('\n✅ Release complete!')
  log(`📱 Version ${newVersion} is building on EAS`)
  log('📝 Next: Upload the APK to Play Store, then run `npm run publish-update` when ready')
}

main().catch(err => {
  log(`❌ Unexpected error: ${err.message}`)
  process.exit(1)
})
