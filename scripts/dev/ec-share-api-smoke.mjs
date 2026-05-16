#!/usr/bin/env node

import { randomBytes } from 'node:crypto'

const options = parseArgs(process.argv.slice(2))

if (options.help) {
  printHelp()
  process.exit(0)
}

const baseUrl = (options.baseUrl || 'http://localhost:3000').replace(/\/$/, '')
const email = options.email
const fingerprint = options.fingerprint || randomBytes(32).toString('hex')

if (!email && !options.licenseJwt) {
  console.error('Missing --email. Use --help for usage.')
  process.exit(1)
}

try {
  if (options.registerPassword) {
    await registerThenSmoke()
  } else if (options.loginPassword) {
    await loginThenSmoke()
  } else if (options.licenseJwt) {
    await smokeWithLicense(options.licenseJwt)
  } else if (options.challengeId && options.otp) {
    await verifyThenSmoke()
  } else {
    await requestOtp()
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

async function registerThenSmoke() {
  const response = await postJson('/api/v1/auth/register', {
    email,
    password: options.registerPassword,
    name: options.name || 'Smoke Test',
    device_fingerprint: fingerprint,
    app_version: options.appVersion || 'dev-smoke',
    platform: 'windows',
  })
  const licenseJwt = response.data.license_jwt
  const payload = decodeJwtPayload(licenseJwt)

  console.log('Native registration succeeded and license issued.')
  console.log(`user_id: ${response.data.user_id}`)
  console.log(`tier: ${payload.tier}`)
  console.log(`fingerprint: ${fingerprint}`)
  console.log(`license_jwt: ${maskToken(licenseJwt)}`)
  console.log('')

  await smokeWithLicense(licenseJwt)
}

async function loginThenSmoke() {
  const response = await postJson('/api/v1/auth/login', {
    email,
    password: options.loginPassword,
    device_fingerprint: fingerprint,
    app_version: options.appVersion || 'dev-smoke',
    platform: 'windows',
  })
  const licenseJwt = response.data.license_jwt
  const payload = decodeJwtPayload(licenseJwt)

  console.log('Native login succeeded and license issued.')
  console.log(`user_id: ${response.data.user_id}`)
  console.log(`tier: ${payload.tier}`)
  console.log(`fingerprint: ${fingerprint}`)
  console.log(`license_jwt: ${maskToken(licenseJwt)}`)
  console.log('')

  await smokeWithLicense(licenseJwt)
}

async function requestOtp() {
  const response = await postJson('/api/v1/auth/email/request-otp', {
    email,
    device_fingerprint: fingerprint,
    app_version: options.appVersion || 'dev-smoke',
    platform: 'windows',
  })

  console.log('OTP challenge created.')
  console.log(`challenge_id: ${response.data.challenge_id}`)
  console.log(`fingerprint: ${fingerprint}`)
  console.log('')

  if (response.data.dev_otp) {
    console.log('Dev OTP returned by local API; continuing automatically.')
    options.challengeId = response.data.challenge_id
    options.otp = response.data.dev_otp
    await verifyThenSmoke()
    return
  }

  console.log('After receiving the email code, run:')
  console.log(
    `  npm run ecshare:smoke -- --email ${email} --fingerprint ${fingerprint} --challenge-id ${response.data.challenge_id} --otp <6-digit-code>`
  )
}

async function verifyThenSmoke() {
  const response = await postJson('/api/v1/auth/email/verify-otp', {
    challenge_id: options.challengeId,
    otp: options.otp,
  })
  const licenseJwt = response.data.license_jwt
  const payload = decodeJwtPayload(licenseJwt)

  console.log('OTP verified and license issued.')
  console.log(`user_id: ${response.data.user_id}`)
  console.log(`tier: ${payload.tier}`)
  console.log(`license_jwt: ${maskToken(licenseJwt)}`)
  console.log('')

  await smokeWithLicense(licenseJwt)
}

async function smokeWithLicense(licenseJwt) {
  const payload = decodeJwtPayload(licenseJwt)

  const refresh = await postJson(
    '/api/v1/license/refresh',
    {
      product: 'ec_share',
      device_fingerprint: payload.device_fingerprint,
      app_version: options.appVersion || 'dev-smoke',
    },
    licenseJwt
  )

  console.log('License refresh succeeded.')
  console.log(`refreshed_jwt: ${maskToken(refresh.data.license_jwt)}`)
  console.log(`next_refresh_at: ${refresh.data.next_refresh_at}`)

  const account = await getJson('/api/v1/account/me', refresh.data.license_jwt)
  console.log('')
  console.log('Account lookup succeeded.')
  console.log(`email: ${account.data.email}`)
  console.log(`tier: ${account.data.tier}`)
  console.log(`devices: ${account.data.devices.length}`)

  if (options.testLicenseLifecycle) {
    await smokeLicenseLifecycle(refresh.data.license_jwt, payload.device_fingerprint)
  }

  if (options.testLogout) {
    await smokeLogout(refresh.data.license_jwt, payload.device_fingerprint)
  }

  if (options.testDeviceManagement) {
    await smokeDeviceManagement(refresh.data.license_jwt, payload.device_fingerprint)
  }

  if (options.testChangeEmail) {
    await smokeChangeEmail(refresh.data.license_jwt)
  }
}

async function smokeLogout(licenseJwt, fingerprint) {
  await postLogout(licenseJwt)
  console.log('')
  console.log('Logout returned 204.')

  const response = await fetch(`${baseUrl}/api/v1/license/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${licenseJwt}`,
    },
    body: JSON.stringify({
      product: 'ec_share',
      device_fingerprint: fingerprint,
      app_version: options.appVersion || 'dev-smoke',
    }),
  })

  const json = await response.json().catch(() => null)
  const hasRedis = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  )

  if (hasRedis) {
    if (response.ok && json?.success) {
      throw new Error(
        'Expected license refresh to fail after logout when Upstash Redis deny-list is configured.'
      )
    }
    console.log('Revocation check: refresh rejected after logout (Redis deny-list).')
    return
  }

  console.log(
    'Note: UPSTASH_REDIS_* unset — logout returned 204 but JWT revocation is not enforced server-side.'
  )
  if (!response.ok || json?.success === false) {
    console.log('Refresh after logout failed anyway (token may be expired or invalid).')
  }
}

async function postLogout(bearerToken) {
  const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })

  if (response.status === 204) {
    return
  }

  const json = await response.json().catch(() => null)
  throw new Error(`/api/v1/auth/logout failed (${response.status}): ${JSON.stringify(json ?? {})}`)
}

async function smokeLicenseLifecycle(licenseJwt, fingerprint) {
  const lifecycleBody = {
    product: 'ec_share',
    device_fingerprint: fingerprint,
    app_version: options.appVersion || 'dev-smoke',
    platform: 'windows',
  }

  const activate = await postJson('/api/v1/license/activate', lifecycleBody, licenseJwt)
  const activatedJwt = activate.data.license_jwt
  console.log('')
  console.log('License activate succeeded.')
  console.log(`activated_jwt: ${maskToken(activatedJwt)}`)

  const heartbeat = await postJson('/api/v1/license/heartbeat', lifecycleBody, activatedJwt)
  console.log('License heartbeat succeeded.')
  console.log(`last_seen_at: ${heartbeat.data.last_seen_at}`)

  if (options.testDeactivate) {
    const deactivate = await postJson('/api/v1/license/deactivate', lifecycleBody, activatedJwt)
    console.log('License deactivate succeeded.')
    console.log(`deactivated: ${deactivate.data.deactivated}`)
    console.log(`token_revoked: ${deactivate.data.token_revoked}`)
    return
  }

  const account = await getJson('/api/v1/account/me', activatedJwt)
  const device = account.data.devices.find((item) => item.fingerprint === fingerprint)

  if (!device) {
    throw new Error('Activated device is missing from account response')
  }

  console.log('License lifecycle smoke test succeeded.')
}

async function smokeDeviceManagement(licenseJwt, fingerprint) {
  const nickname = options.nickname || `Smoke device ${Date.now()}`

  const rename = await postJson(
    '/api/v1/account/devices/rename',
    {
      fingerprint,
      nickname,
    },
    licenseJwt
  )

  console.log('')
  console.log('Device rename succeeded.')
  console.log(`nickname: ${rename.data.nickname}`)

  const renamedAccount = await getJson('/api/v1/account/me', licenseJwt)
  const renamedDevice = renamedAccount.data.devices.find(
    (device) => device.fingerprint === fingerprint
  )

  if (renamedDevice?.nickname !== nickname) {
    throw new Error('Device rename did not persist in account response')
  }

  await deleteJson(`/api/v1/account/devices/${fingerprint}`, licenseJwt)
  console.log('Device delete succeeded.')

  const deletedAccount = await getJson('/api/v1/account/me', licenseJwt)
  const deletedDevice = deletedAccount.data.devices.find(
    (device) => device.fingerprint === fingerprint
  )

  if (deletedDevice) {
    throw new Error('Device still appears in account response after delete')
  }

  console.log('Device management smoke test succeeded.')
}

async function smokeChangeEmail(licenseJwt) {
  const payload = decodeJwtPayload(licenseJwt)
  const newEmail = options.newEmail || buildSmokeEmail(payload.email)

  const request = await postJson(
    '/api/v1/account/change-email/request-otp',
    {
      new_email: newEmail,
    },
    licenseJwt
  )

  console.log('')
  console.log('Change-email OTP challenge created.')
  console.log(`new_email: ${newEmail}`)
  console.log(`challenge_id: ${request.data.challenge_id}`)

  if (!request.data.dev_otp && !options.changeEmailOtp) {
    console.log('')
    console.log('After receiving the change-email code, run:')
    console.log(
      `  npm run ecshare:smoke -- --license-jwt <current-jwt> --test-change-email --new-email ${newEmail} --change-email-challenge-id ${request.data.challenge_id} --change-email-otp <6-digit-code>`
    )
    return
  }

  const challengeId = options.changeEmailChallengeId || request.data.challenge_id
  const otp = options.changeEmailOtp || request.data.dev_otp

  const confirm = await postJson(
    '/api/v1/account/change-email',
    {
      new_email: newEmail,
      challenge_id: challengeId,
      otp,
    },
    licenseJwt
  )

  const newLicenseJwt = confirm.data.license_jwt
  const account = await getJson('/api/v1/account/me', newLicenseJwt)

  if (account.data.email !== newEmail) {
    throw new Error('Change-email did not persist in account response')
  }

  console.log('Change-email confirmed.')
  console.log(`email: ${account.data.email}`)
  console.log(`new_license_jwt: ${maskToken(newLicenseJwt)}`)
}

async function postJson(path, body, bearerToken) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: JSON.stringify(body),
  })

  return readApiResponse(response, path)
}

async function getJson(path, bearerToken) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })

  return readApiResponse(response, path)
}

async function deleteJson(path, bearerToken) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })

  return readApiResponse(response, path)
}

async function readApiResponse(response, path) {
  const json = await response.json().catch(() => null)

  if (!response.ok || json?.success === false) {
    throw new Error(
      `${path} failed (${response.status}): ${JSON.stringify(json ?? {})}`
    )
  }

  return json
}

function decodeJwtPayload(token) {
  const [, payload] = token.split('.')

  if (!payload) {
    throw new Error('Invalid JWT shape')
  }

  return JSON.parse(Buffer.from(base64UrlToBase64(payload), 'base64').toString('utf8'))
}

function base64UrlToBase64(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '='
  )
}

function maskToken(token) {
  return `${token.slice(0, 16)}...${token.slice(-8)}`
}

function parseArgs(args) {
  const parsed = { help: false }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    switch (arg) {
      case '--help':
      case '-h':
        parsed.help = true
        break
      case '--base-url':
        parsed.baseUrl = args[++index]
        break
      case '--email':
        parsed.email = args[++index]
        break
      case '--fingerprint':
        parsed.fingerprint = args[++index]
        break
      case '--challenge-id':
        parsed.challengeId = args[++index]
        break
      case '--otp':
        parsed.otp = args[++index]
        break
      case '--register-password':
        parsed.registerPassword = args[++index]
        break
      case '--login-password':
        parsed.loginPassword = args[++index]
        break
      case '--name':
        parsed.name = args[++index]
        break
      case '--license-jwt':
        parsed.licenseJwt = args[++index]
        break
      case '--app-version':
        parsed.appVersion = args[++index]
        break
      case '--test-device-management':
        parsed.testDeviceManagement = true
        break
      case '--test-license-lifecycle':
        parsed.testLicenseLifecycle = true
        break
      case '--test-deactivate':
        parsed.testDeactivate = true
        parsed.testLicenseLifecycle = true
        break
      case '--nickname':
        parsed.nickname = args[++index]
        break
      case '--test-logout':
        parsed.testLogout = true
        break
      case '--new-email':
        parsed.newEmail = args[++index]
        break
      case '--change-email-challenge-id':
        parsed.changeEmailChallengeId = args[++index]
        break
      case '--change-email-otp':
        parsed.changeEmailOtp = args[++index]
        break
      default:
        throw new Error(`Unknown option: ${arg}`)
    }
  }

  return parsed
}

function printHelp() {
  console.log(`Usage:
  npm run ecshare:smoke -- --email user@example.com
  npm run ecshare:smoke -- --email user@example.com --register-password Password1!
  npm run ecshare:smoke -- --email user@example.com --login-password Password1! --fingerprint <sha256>
  npm run ecshare:smoke -- --email user@example.com --fingerprint <sha256> --challenge-id <id> --otp <code>
  npm run ecshare:smoke -- --license-jwt <jwt>

Options:
  --base-url <url>       API base URL (default: http://localhost:3000)
  --email <email>        Email for OTP request/verify
  --fingerprint <hex>    64-char SHA-256 device fingerprint; generated if omitted
  --challenge-id <id>    OTP challenge ID returned by request step
  --otp <code>           6-digit OTP from email
  --register-password <password>
                         Use native /api/v1/auth/register flow and issue a license
  --login-password <password>
                         Use native /api/v1/auth/login flow and issue a license
  --name <name>          Name to use with --register-password
  --license-jwt <jwt>    Existing license JWT to test refresh/account routes
  --app-version <value>  App version sent to API (default: dev-smoke)
  --test-license-lifecycle
                         Also test license activate/heartbeat APIs
  --test-deactivate      Also test license deactivate API (removes device row)
  --test-device-management
                         Also test device rename/delete APIs
  --nickname <value>     Nickname to use for device rename smoke test
  --test-logout            Also POST /api/v1/auth/logout and verify refresh denied when Redis is configured
  --new-email <email>    New email for change-email smoke test
  --change-email-challenge-id <id>
                         Existing change-email challenge ID
  --change-email-otp <code>
                         Existing change-email OTP
  --help                 Show this help`)
}

function buildSmokeEmail(email) {
  const [localPart, domain = 'example.com'] = email.split('@')
  const sanitizedLocalPart = localPart || 'smoke'
  return `${sanitizedLocalPart}+change-${Date.now()}@${domain}`
}
