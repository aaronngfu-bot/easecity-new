#!/usr/bin/env node

import dotenv from 'dotenv'

dotenv.config({ path: '.env', quiet: true })
dotenv.config({ path: '.env.local', override: true, quiet: true })

const options = parseArgs(process.argv.slice(2))

if (options.help) {
  printHelp()
  process.exit(0)
}

const checks = [
  section('Database', required('DATABASE_URL'), required('DIRECT_URL')),
  section('NextAuth', required('NEXTAUTH_SECRET'), required('NEXTAUTH_URL')),
  section(
    'EC-Share License JWT',
    required('LICENSE_JWT_PRIVATE_KEY_PEM'),
    required('LICENSE_JWT_KEY_ID'),
    required('LICENSE_JWT_ISSUER'),
    required('LICENSE_JWT_AUDIENCE')
  ),
  section(
    'Email',
    recommended('RESEND_API_KEY'),
    recommended('AUTH_EMAIL_FROM'),
    optional('CONTACT_EMAIL_TO')
  ),
  section(
    'Rate limiting',
    recommended('UPSTASH_REDIS_REST_URL'),
    recommended('UPSTASH_REDIS_REST_TOKEN')
  ),
  section(
    'Stripe',
    required('STRIPE_SECRET_KEY'),
    required('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    required('STRIPE_WEBHOOK_SECRET'),
    required('NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID'),
    required('NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID'),
    required('NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID'),
    required('NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID'),
    recommended('NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID')
  ),
  section(
    'Bot protection',
    recommended('NEXT_PUBLIC_TURNSTILE_SITE_KEY'),
    recommended('TURNSTILE_SECRET_KEY')
  ),
  section('Optional services', optional('OPENROUTER_API_KEY')),
]

const missingRequired = []
const missingRecommended = []

console.log('EC-Share staging environment check')
console.log('Values are redacted; only presence is checked.\n')

for (const group of checks) {
  console.log(`[${group.name}]`)
  for (const item of group.items) {
    const present = hasValue(process.env[item.name])
    const marker = present ? 'ok' : item.level
    console.log(`  ${marker.padEnd(11)} ${item.name}`)

    if (!present && item.level === 'required') {
      missingRequired.push(item.name)
    }

    if (!present && item.level === 'recommended') {
      missingRecommended.push(item.name)
    }
  }
  console.log('')
}

if (missingRecommended.length > 0) {
  console.log(`Recommended values missing: ${missingRecommended.join(', ')}`)
}

if (missingRequired.length > 0) {
  console.log(`Required values missing: ${missingRequired.join(', ')}`)

  if (!options.allowMissing) {
    process.exit(1)
  }

  console.log('Continuing because --allow-missing was provided.')
}

if (missingRequired.length === 0) {
  console.log('All required staging environment variables are present.')
}

function section(name, ...items) {
  return { name, items }
}

function required(name) {
  return { name, level: 'required' }
}

function recommended(name) {
  return { name, level: 'recommended' }
}

function optional(name) {
  return { name, level: 'optional' }
}

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function parseArgs(args) {
  const parsed = {
    allowMissing: false,
    help: false,
  }

  for (const arg of args) {
    switch (arg) {
      case '--allow-missing':
        parsed.allowMissing = true
        break
      case '--strict':
        parsed.allowMissing = false
        break
      case '--help':
      case '-h':
        parsed.help = true
        break
      default:
        throw new Error(`Unknown option: ${arg}`)
    }
  }

  return parsed
}

function printHelp() {
  console.log(`Usage:
  npm run ecshare:env-check
  npm run ecshare:env-check -- --allow-missing

Options:
  --strict          Fail when required env vars are missing (default)
  --allow-missing  Report missing env vars but exit successfully
  --help           Show this help`)
}
