#!/usr/bin/env node

import { existsSync, readFileSync, appendFileSync } from 'node:fs'
import { generateKeyPairSync } from 'node:crypto'
import { resolve } from 'node:path'

const args = new Set(process.argv.slice(2))
const envPath = resolve(process.cwd(), '.env.local')

if (args.has('--help') || args.has('-h')) {
  printHelp()
  process.exit(0)
}

const { privateKey, publicKey } = generateKeyPairSync('ed25519')
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' })
const publicPem = publicKey.export({ type: 'spki', format: 'pem' })
const escapedPrivatePem = privatePem.replace(/\r?\n/g, '\\n')

if (args.has('--write-env')) {
  writeEnv({
    force: args.has('--force'),
    keyId: readArgValue('--kid') ?? '2026a',
    escapedPrivatePem,
  })
}

console.log('Generated EC-Share Ed25519 license keypair.')
console.log('')
console.log('Public key to embed in the desktop client:')
console.log(publicPem.trim())
console.log('')

if (args.has('--print-private')) {
  console.log('Escaped private key for LICENSE_JWT_PRIVATE_KEY_PEM:')
  console.log(escapedPrivatePem)
  console.log('')
} else {
  console.log('Private key was not printed. Use --print-private only if you need to copy it manually.')
}

if (!args.has('--write-env')) {
  console.log('To append the private key to .env.local, run:')
  console.log('  npm run ecshare:key -- --write-env')
}

function writeEnv({ force, keyId, escapedPrivatePem }) {
  const existing = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''

  if (existing.includes('LICENSE_JWT_PRIVATE_KEY_PEM=') && !force) {
    console.log('.env.local already has LICENSE_JWT_PRIVATE_KEY_PEM. Skipping write.')
    console.log('Use --force to append a new key anyway.')
    console.log('')
    return
  }

  appendFileSync(
    envPath,
    [
      '',
      '# EC-Share License JWT (local dev)',
      `LICENSE_JWT_PRIVATE_KEY_PEM="${escapedPrivatePem}"`,
      `LICENSE_JWT_KEY_ID=${keyId}`,
      'LICENSE_JWT_ISSUER=https://api.easecity.hk',
      'LICENSE_JWT_AUDIENCE=ec-share-desktop',
      '',
    ].join('\n'),
    'utf8'
  )

  console.log('Appended license JWT settings to .env.local.')
  console.log('')
}

function readArgValue(name) {
  const argsList = process.argv.slice(2)
  const index = argsList.indexOf(name)
  return index >= 0 ? argsList[index + 1] : null
}

function printHelp() {
  console.log(`Usage: npm run ecshare:key -- [options]

Options:
  --write-env       Append LICENSE_JWT_* values to .env.local
  --force           Allow appending another key even if one already exists
  --kid <value>     Key ID to write with --write-env (default: 2026a)
  --print-private   Print escaped private key to stdout
  --help            Show this help

Default behavior prints only the public key and next-step instructions.`)
}
