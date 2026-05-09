import { z } from 'zod'

const deviceFingerprintSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/i, 'Device fingerprint must be a SHA-256 hex string')
  .transform((value) => value.toLowerCase())

const nativeClientContextSchema = z.object({
  device_fingerprint: deviceFingerprintSchema,
  app_version: z.string().trim().min(1).max(64),
  platform: z.enum(['windows']),
})

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const requestOtpSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  device_fingerprint: deviceFingerprintSchema,
  app_version: z.string().trim().min(1).max(64),
  platform: z.enum(['windows']),
})

export const verifyOtpSchema = z.object({
  challenge_id: z.string().trim().min(1).max(128),
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

export const nativeRegisterSchema = nativeClientContextSchema.extend({
  email: z.string().email().max(255).trim().toLowerCase(),
  password: passwordSchema,
  name: z.string().trim().min(2).max(100).optional(),
})

export const nativeLoginSchema = nativeClientContextSchema.extend({
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z.string().min(1).max(100),
})

export const changeEmailRequestSchema = z.object({
  new_email: z.string().email().max(255).trim().toLowerCase(),
})

export const changeEmailConfirmSchema = z.object({
  new_email: z.string().email().max(255).trim().toLowerCase(),
  challenge_id: z.string().trim().min(1).max(128),
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

export const licenseRefreshSchema = z.object({
  product: z.literal('ec_share'),
  device_fingerprint: deviceFingerprintSchema,
  app_version: z.string().trim().min(1).max(64),
})

export const licenseLifecycleSchema = nativeClientContextSchema.extend({
  product: z.literal('ec_share'),
})

export const renameDeviceSchema = z.object({
  fingerprint: deviceFingerprintSchema,
  nickname: z.string().trim().min(1).max(80),
})

export const deviceFingerprintParamSchema = z.object({
  fingerprint: deviceFingerprintSchema,
})
