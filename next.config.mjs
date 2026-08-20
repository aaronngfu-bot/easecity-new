/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // Image optimization domains (add as needed)
    images: {
      formats: ['image/avif', 'image/webp'],
      remotePatterns: [
        // Vercel Blob images (public store URLs: <id>.public.blob.vercel-storage.com)
        { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
        { protocol: 'https', hostname: '*.blob.vercel-storage.com' },
      ],
    },

  // Powered-by header removal
  poweredByHeader: false,

  // Compression
  compress: true,
}

export default nextConfig
