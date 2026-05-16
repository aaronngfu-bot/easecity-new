/**
 * Shared rate-limit windows for OTP verification flows (login + change-email).
 * Keys are still composed per route (e.g. `otp-verify:ip:` vs `change-email-verify:ip:`).
 */
export const OTP_VERIFY_IP_LIMIT = 60
export const OTP_VERIFY_IP_WINDOW_MS = 60 * 60_000

export const OTP_VERIFY_EMAIL_LIMIT = 30
export const OTP_VERIFY_EMAIL_WINDOW_MS = 60 * 60_000

export const PASSWORD_AUTH_IP_LIMIT = 30
export const PASSWORD_AUTH_IP_WINDOW_MS = 60 * 60_000

export const PASSWORD_AUTH_EMAIL_LIMIT = 10
export const PASSWORD_AUTH_EMAIL_WINDOW_MS = 60 * 60_000

export const LICENSE_LIFECYCLE_IP_LIMIT = 120
export const LICENSE_LIFECYCLE_IP_WINDOW_MS = 60 * 60_000

export const LICENSE_LIFECYCLE_DEVICE_LIMIT = 120
export const LICENSE_LIFECYCLE_DEVICE_WINDOW_MS = 60 * 60_000

export const AUTH_LOGOUT_IP_LIMIT = 120
export const AUTH_LOGOUT_IP_WINDOW_MS = 60 * 60_000
