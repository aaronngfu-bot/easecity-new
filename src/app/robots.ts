import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://easecity.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/', '/login', '/register'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
