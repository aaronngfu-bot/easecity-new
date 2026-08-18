'use client'

import Image from 'next/image'

/**
 * EaseCity brand mark — the interlocking "E + C" wordmark.
 * Two transparent-raster variants swap via the `.dark` class that
 * next-themes applies to <html>: light (teal E + navy C) and dark
 * (bright teal E + near-white C). Transparent background — safe on
 * any surface.
 */
export function BrandMark({
  className = '',
  size = 36,
}: {
  className?: string
  size?: number
}) {
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/easecity-logo-light-128.png"
        alt="easecity"
        width={size}
        height={size}
        className="h-full w-full object-contain dark:hidden"
        priority
      />
      <Image
        src="/images/easecity-logo-dark-128.png"
        alt="easecity"
        width={size}
        height={size}
        className="hidden h-full w-full object-contain dark:block"
        priority
      />
    </span>
  )
}