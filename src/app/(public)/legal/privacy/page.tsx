import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'easecity Privacy Policy — how we collect, use, and protect your personal data.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'April 10, 2026'
const CONTACT_EMAIL = 'hello@easecity.com'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-24">
      {/* Header */}
      <div className="container-max max-w-3xl">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-cyan transition-colors font-mono mb-8"
          >
            ← easecity.com
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-bg-surface text-xs text-text-muted font-mono mb-6">
            Legal
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="text-text-muted text-sm">
            Last updated: {LAST_UPDATED}
          </p>
          <div className="mt-6 p-4 rounded-xl border border-border bg-bg-surface text-sm text-text-secondary leading-relaxed">
            This Privacy Policy explains how easecity (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, stores,
            and protects your personal data when you use our website and stream control infrastructure
            services. By accessing or using our services, you agree to the practices described in
            this policy.
          </div>
        </div>

        {/* Body */}
        <div className="space-y-10 text-sm leading-relaxed">

          <Section title="1. Who We Are">
            <p>
              easecity is a technology company incorporated in the Hong Kong Special Administrative
              Region. We operate the stream control infrastructure platform available at{' '}
              <span className="text-accent-cyan font-mono">easecity.com</span> and its associated
              subdomains.
            </p>
            <p className="mt-3">
              For any privacy-related enquiries, you can reach our team at:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-cyan hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p>We collect the following categories of personal data:</p>
            <SubSection title="Account & Identity Data">
              <ul className="list-disc list-inside space-y-1 text-text-secondary mt-2">
                <li>Full name</li>
                <li>Email address</li>
                <li>Password (stored as a one-way bcrypt hash — we cannot read it)</li>
                <li>Account role and subscription status</li>
              </ul>
            </SubSection>
            <SubSection title="Contact & Business Data">
              <ul className="list-disc list-inside space-y-1 text-text-secondary mt-2">
                <li>Company or organisation name (if provided in the contact form)</li>
                <li>Subject and message content submitted via our contact form</li>
              </ul>
            </SubSection>
            <SubSection title="Billing & Payment Data">
              <ul className="list-disc list-inside space-y-1 text-text-secondary mt-2">
                <li>Subscription plan and billing status</li>
                <li>Stripe Customer ID (a reference token, not raw card data)</li>
                <li>
                  Payment card details are handled entirely by{' '}
                  <strong className="text-text-primary">Stripe</strong> — we never receive, store,
                  or process raw card numbers on our servers
                </li>
              </ul>
            </SubSection>
            <SubSection title="Usage & Technical Data">
              <ul className="list-disc list-inside space-y-1 text-text-secondary mt-2">
                <li>Session tokens (stored as secure JWT, invalidated on sign-out)</li>
                <li>Audit logs of significant account actions (e.g. role changes)</li>
                <li>AI chatbot conversation history (only if you use the chat feature)</li>
                <li>
                  Standard web server logs (IP address, browser user-agent, request timestamps) —
                  managed by our hosting provider Vercel
                </li>
              </ul>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Data">
            <DataUseTable
              rows={[
                ['Providing the service', 'Account creation, authentication, dashboard access, subscription management'],
                ['Billing & payments', 'Processing subscriptions via Stripe, sending payment confirmations, handling refunds'],
                ['Communications', 'Responding to contact form submissions; sending transactional emails (e.g. password reset, payment receipt) via Resend'],
                ['Security & compliance', 'Fraud prevention, maintaining audit logs, enforcing our Terms of Service'],
                ['Product improvement', 'Analysing anonymised usage patterns to improve platform features'],
                ['Legal obligations', 'Complying with applicable laws in the Hong Kong SAR and any other jurisdictions as required'],
              ]}
            />
            <p className="mt-4 text-text-muted">
              We do <strong className="text-text-primary">not</strong> sell, rent, or trade your
              personal data to third parties for marketing purposes.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>
              We engage the following sub-processors who may handle your personal data on our behalf.
              Each operates under its own privacy policy and data processing agreements:
            </p>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Stripe', role: 'Payment processing & subscription billing', link: 'https://stripe.com/privacy' },
                { name: 'Neon (via AWS Singapore)', role: 'Database hosting — stores account, subscription and order records', link: 'https://neon.tech/privacy' },
                { name: 'Vercel', role: 'Web hosting, edge functions, and server-side request logs', link: 'https://vercel.com/legal/privacy-policy' },
                { name: 'Resend', role: 'Transactional email delivery', link: 'https://resend.com/privacy' },
                { name: 'OpenRouter', role: 'AI inference for the in-app chat assistant', link: 'https://openrouter.ai/privacy' },
              ].map(({ name, role, link }) => (
                <div key={name} className="flex gap-4 p-4 rounded-lg border border-border bg-bg-surface">
                  <div className="shrink-0 w-28 font-semibold text-text-primary">{name}</div>
                  <div className="flex-1 text-text-secondary">{role}</div>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-text-muted hover:text-accent-cyan transition-colors"
                  >
                    Privacy ↗
                  </a>
                </div>
              ))}
            </div>
          </Section>

          <Section title="5. Data Storage & Transfers">
            <p>
              Our primary database is hosted on Neon (powered by AWS in the{' '}
              <strong className="text-text-primary">ap-southeast-1 (Singapore)</strong> region. Web
              traffic and serverless functions are served via Vercel&apos;s global edge network.
            </p>
            <p className="mt-3">
              If you access our services from the European Economic Area (EEA) or the United Kingdom,
              your data may be transferred to countries outside those regions. Where such transfers
              occur, we rely on Standard Contractual Clauses (SCCs) or other lawful transfer mechanisms
              as required by applicable data protection law.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <DataUseTable
              rows={[
                ['Account data', 'Retained for the lifetime of your account. Deleted within 30 days of account deletion request.'],
                ['Subscription & billing records', 'Retained for 7 years to comply with Hong Kong accounting and tax requirements.'],
                ['Contact form submissions', 'Retained for 2 years from date of submission.'],
                ['AI chat conversations', 'Retained for 90 days, then automatically deleted.'],
                ['Audit logs', 'Retained for 2 years.'],
              ]}
            />
          </Section>

          <Section title="7. Your Rights">
            <p>
              Depending on your jurisdiction, you may have some or all of the following rights
              regarding your personal data:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                ['Access', 'Request a copy of the personal data we hold about you.'],
                ['Rectification', 'Ask us to correct inaccurate or incomplete data.'],
                ['Erasure', 'Request deletion of your data, subject to legal retention obligations.'],
                ['Portability', 'Receive your data in a structured, machine-readable format.'],
                ['Objection / Restriction', 'Object to or restrict certain processing activities.'],
                ['Withdraw consent', 'Where processing is based on consent, withdraw it at any time without affecting prior processing.'],
              ].map(([right, desc]) => (
                <li key={right as string} className="flex gap-3 p-3 rounded-lg border border-border/60 bg-bg-surface/60">
                  <span className="shrink-0 font-semibold text-accent-cyan w-36">{right}</span>
                  <span className="text-text-secondary">{desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-cyan hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days. Hong Kong residents may also refer to the{' '}
              <a
                href="https://www.pcpd.org.hk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-cyan hover:underline"
              >
                Office of the Privacy Commissioner for Personal Data (PCPD)
              </a>
              .
            </p>
          </Section>

          <Section title="8. Cookies & Local Storage">
            <p>
              We use a minimal set of technically necessary cookies and browser storage:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1 text-text-secondary">
              <li>
                <strong className="text-text-primary">Session cookie</strong> — a secure, HTTP-only
                JWT issued by NextAuth to keep you signed in. Expires on sign-out or after 30 days
                of inactivity.
              </li>
              <li>
                <strong className="text-text-primary">Language preference</strong> — stored in
                localStorage to remember your zh/en preference.
              </li>
            </ul>
            <p className="mt-3">
              We do not use third-party advertising cookies or cross-site tracking pixels.
            </p>
          </Section>

          <Section title="9. Security">
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-text-secondary">
              <li>TLS encryption in transit for all connections</li>
              <li>bcrypt password hashing with a work factor of 12</li>
              <li>HTTP security headers (CSP, HSTS, X-Frame-Options)</li>
              <li>Database connections over encrypted channels with SSL</li>
              <li>Role-based access control (RBAC) for administrative functions</li>
            </ul>
            <p className="mt-3">
              No method of electronic transmission is 100% secure. If you discover a security
              vulnerability, please report it responsibly to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-cyan hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              Our services are intended for business users aged 18 or older. We do not knowingly
              collect personal data from children under the age of 18. If you believe a child has
              provided us with personal data, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we
              will update the &ldquo;Last updated&rdquo; date at the top of this page and, where
              appropriate, notify you by email. Continued use of our services after such changes
              constitutes your acceptance of the revised policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              For any questions, requests, or complaints regarding this Privacy Policy or our data
              practices:
            </p>
            <div className="mt-4 p-5 rounded-xl border border-border bg-bg-surface space-y-1.5">
              <p className="text-text-primary font-semibold">easecity</p>
              <p className="text-text-secondary">Hong Kong Special Administrative Region</p>
              <p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-cyan hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </Section>

          {/* Footer nav */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} easecity. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs">
              <Link href="/legal/terms" className="text-text-muted hover:text-accent-cyan transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-text-muted hover:text-accent-cyan transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="text-text-secondary space-y-2">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      {children}
    </div>
  )
}

function DataUseTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border divide-y divide-border">
      {rows.map(([purpose, details]) => (
        <div key={purpose} className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-4 px-5 py-3.5 bg-bg-surface">
          <span className="font-medium text-text-primary text-sm">{purpose}</span>
          <span className="text-text-secondary text-sm">{details}</span>
        </div>
      ))}
    </div>
  )
}
