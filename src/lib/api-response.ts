import { NextResponse } from 'next/server'

interface ApiResponseMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  timestamp: number
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true as const,
      data,
      meta: { timestamp: Date.now() } satisfies ApiResponseMeta,
    },
    { status }
  )
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json(
    {
      success: false as const,
      error: { code, message },
      meta: { timestamp: Date.now() },
    },
    { status }
  )
}

export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true as const,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      timestamp: Date.now(),
    } satisfies ApiResponseMeta,
  })
}
