#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const APP_JSON_PATH = resolve(ROOT, 'apps/mobile/app.json')

function log(message) {
  console.log(`\n${message}`)
}

function run(command, description, capture = false) {
  log(`▶ ${description}`)
  try {
    return execSync(command, {
      cwd: ROOT,
      encoding: capture ? 'utf-8' : undefined,
      stdio: capture ? 'pipe' : 'inherit',
    })
  } catch {
    log(`❌ ${description} failed. Aborting.`)
    process.exit(1)
  }
}

function getVersion() {
  const appJson = JSON.parse(readFileSync(APP_JSON_PATH, 'utf-8'))
  return appJson.expo.version
}

function main() {
  log('Starting Android release preparation...')

  const status = run('git status --porcelain', 'Checking working tree...', true).trim()
  if (status) {
    log('❌ The working tree must be clean before preparing a release.')
    console.log(status)
    process.exit(1)
  }

  const previousVersion = getVersion()
  log(`Current version: ${previousVersion}`)

  run('npm run export --workspace=apps/mobile', 'Validating Android export...')
  run('npm run bump-version --workspace=apps/mobile', 'Bumping version...')

  const newVersion = getVersion()
  run(
    `git add apps/mobile/app.json && git commit -m "Bump version to ${newVersion}"`,
    `Committing version ${newVersion}...`
  )
  run('git push', 'Pushing version commit...')

  log(`✅ Release ${newVersion} prepared and pushed.`)
  log('Next: npm run release:build')
}

main()
