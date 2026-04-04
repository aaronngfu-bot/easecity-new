interface OrganizationJsonLdProps {
  name?: string
  url?: string
  description?: string
}

export function OrganizationJsonLd({
  name = 'easecity',
  url = 'https://easecity.com',
  description = 'Enterprise-grade stream control infrastructure — enabling a single device to manage, monitor, and orchestrate unlimited remote endpoints.',
}: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    description,
    logo: `${url}/logo.png`,
    sameAs: [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hong Kong',
      addressCountry: 'HK',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${url}/contact`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface WebSiteJsonLdProps {
  name?: string
  url?: string
}

export function WebSiteJsonLd({
  name = 'easecity',
  url = 'https://easecity.com',
}: WebSiteJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
