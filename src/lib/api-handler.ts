import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { apiError } from './api-response'

type RouteContext = { params: Promise<Record<string, string>> }

type HandlerFn = (
  req: Request,
  context: RouteContext
) => Promise<NextResponse>

export class AuthError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export function withErrorHandler(handler: HandlerFn): HandlerFn {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(', ')
        return apiError('VALIDATION_ERROR', message, 400)
      }

      if (error instanceof AuthError) {
        return apiError('UNAUTHORIZED', error.message, 401)
      }

      if (error instanceof ForbiddenError) {
        return apiError('FORBIDDEN', error.message, 403)
      }

      if (error instanceof NotFoundError) {
        return apiError('NOT_FOUND', error.message, 404)
      }

      console.error('[API Error]', error)
      return apiError(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        500
      )
    }
  }
}
