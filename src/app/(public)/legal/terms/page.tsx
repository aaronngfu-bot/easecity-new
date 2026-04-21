import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'easecity Terms of Service — the agreement governing your use of our stream control infrastructure platform.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'April 10, 2026'
const CONTACT_EMAIL = 'hello@easecity.com'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="container-max max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-signal transition-colors font-mono mb-8"
          >
            ← easecity.com
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-bg-surface text-xs text-text-muted font-mono mb-6">
            Legal
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
            Terms of Service
          </h1>
          <p className="text-text-muted text-sm">Last updated: {LAST_UPDATED}</p>
          <div className="mt-6 p-4 rounded-xl border border-border bg-bg-surface text-sm text-text-secondary leading-relaxed">
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the
            easecity platform. By creating an account or using our services, you agree to be bound
            by these Terms. If you do not agree, do not access or use our services.
          </div>
        </div>

        {/* Body */}
        <div className="space-y-10 text-sm leading-relaxed">

          <Section title="1. Acceptance of Terms">
            <p>
              These Terms constitute a legally binding agreement between you (or the entity you
              represent, &ldquo;Customer&rdquo;) and easecity (&ldquo;easecity&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;) governing access to and use of the easecity stream
              control infrastructure platform, related APIs, dashboards, and any associated services
              (collectively, the &ldquo;Services&rdquo;).
            </p>
            <p className="mt-3">
              If you are accepting these Terms on behalf of a company or other legal entity, you
              represent that you have the authority to bind that entity to these Terms.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 18 years old to use our Services. By using the Services, you represent and warrant that:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-text-secondary">
              <li>You are at least 18 years of age.</li>
              <li>You have the legal capacity to enter into a binding agreement.</li>
              <li>Your use of the Services does not violate any applicable laws or regulations.</li>
            </ul>
          </Section>

          <Section title="3. Accounts">
            <p>
              To access most features of the Services, you must register for an account. You agree to:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-text-secondary">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security of your password and accept responsibility for all activity that occurs under your account.</li>
              <li>Notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-signal hover:underline">{CONTACT_EMAIL}</a> of any unauthorised use of your account.</li>
              <li>Not share your account credentials with any third party.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that we reasonably believe are
              being used fraudulently, abusively, or in violation of these Terms.
            </p>
          </Section>

          <Section title="4. Subscription Plans & Billing">
            <SubSection title="4.1 Plans">
              <p className="mt-2 text-text-secondary">
                We offer several subscription tiers (Starter, Pro, Business, Enterprise) as described
                on our <Link href="/pricing" className="text-signal hover:underline">Pricing page</Link>. Features,
                device limits, and SLA commitments vary by plan.
              </p>
            </SubSection>
            <SubSection title="4.2 Free Trial">
              <p className="mt-2 text-text-secondary">
                We may offer a free trial period. No payment is required during the trial. At the
                end of the trial, your subscription will automatically convert to the paid plan you
                selected unless you cancel before the trial ends. Cancellation during the trial
                period results in immediate deactivation.
              </p>
            </SubSection>
            <SubSection title="4.3 Billing Cycle & Payment">
              <p className="mt-2 text-text-secondary">
                Subscriptions are billed on a monthly or annual basis, as selected at checkout.
                Payment is processed by <strong className="text-text-primary">Stripe</strong>. By
                subscribing, you authorise us to charge your payment method on a recurring basis
                until you cancel. All fees are in the currency displayed at checkout and are
                exclusive of applicable taxes.
              </p>
            </SubSection>
            <SubSection title="4.4 Cancellation">
              <p className="mt-2 text-text-secondary">
                You may cancel your subscription at any time through your account&apos;s billing
                settings. Cancellation takes effect at the end of the current billing period — you
                will retain full access until that date. We do not provide prorated refunds for
                the remaining unused portion of a billing period, except where required by law.
              </p>
            </SubSection>
            <SubSection title="4.5 Price Changes">
              <p className="mt-2 text-text-secondary">
                We reserve the right to modify pricing at any time. We will provide at least 30
                days&apos; advance notice of any price increase via email. Continued use of the
                Services after the effective date constitutes acceptance of the new pricing.
              </p>
            </SubSection>
            <SubSection title="4.6 Overdue Payments">
              <p className="mt-2 text-text-secondary">
                If payment fails, we may suspend your access to the Services. We will notify you
                by email and provide a reasonable cure period before any suspension.
              </p>
            </SubSection>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to use the Services to:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-text-secondary">
              <li>Violate any applicable local, national, or international law or regulation.</li>
              <li>Transmit any unlawful, harmful, defamatory, infringing, or objectionable content.</li>
              <li>Attempt to gain unauthorised access to any part of the Services or related systems.</li>
              <li>Reverse engineer, decompile, or disassemble any portion of the Services.</li>
              <li>Use automated scripts or bots to access the Services in a way that adversely affects performance for other users.</li>
              <li>Resell or sublicense the Services without our prior written consent.</li>
              <li>Use the Services to build a competing product or service.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to investigate suspected violations and may suspend or terminate
              your account without notice if we determine a serious violation has occurred.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              The Services, including all software, designs, trademarks, logos, documentation, and
              content provided by easecity, are owned by or licensed to easecity and are protected
              by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-3">
              We grant you a limited, non-exclusive, non-transferable, revocable licence to access
              and use the Services solely in accordance with these Terms. Nothing in these Terms
              transfers any ownership of our intellectual property to you.
            </p>
            <p className="mt-3">
              You retain ownership of any data or content you upload to the Services
              (&ldquo;Customer Data&rdquo;). By using the Services, you grant us a limited licence
              to process and store Customer Data solely to provide the Services to you.
            </p>
          </Section>

          <Section title="7. Service Availability & SLA">
            <p>
              We strive to maintain the uptime commitments stated in your subscription plan. Planned
              maintenance windows will be communicated in advance where possible. SLA credits, where
              applicable to Business or Enterprise plans, are the Customer&apos;s sole remedy for
              downtime events.
            </p>
            <p className="mt-3">
              We do not guarantee that the Services will be available without interruption or error.
              Scheduled maintenance, force majeure events, or third-party infrastructure failures
              may cause temporary unavailability.
            </p>
          </Section>

          <Section title="8. Confidentiality">
            <p>
              Each party may have access to confidential information of the other party. Both
              parties agree to keep such information confidential, use it only for the purposes of
              the agreement, and protect it with at least the same degree of care used for their
              own confidential information (but no less than reasonable care).
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
              WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              WE DO NOT WARRANT THAT THE SERVICES WILL MEET YOUR REQUIREMENTS, BE UNINTERRUPTED,
              TIMELY, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL EASECITY BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
              OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, BUSINESS, OR GOODWILL, ARISING OUT OF
              OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE SERVICES.
            </p>
            <p className="mt-3">
              OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO
              THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO EASECITY IN THE TWELVE (12)
              MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </p>
            <p className="mt-3">
              Some jurisdictions do not allow the exclusion of certain warranties or limitation of
              liability, so some of the above limitations may not apply to you.
            </p>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless easecity and its officers,
              directors, employees, and agents from and against any claims, liabilities, damages,
              losses, and expenses (including reasonable legal fees) arising out of or in any way
              connected with: (a) your access to or use of the Services; (b) your violation of
              these Terms; or (c) your infringement of any third-party right.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              Either party may terminate these Terms: (a) upon 30 days&apos; written notice for any
              reason; or (b) immediately if the other party materially breaches these Terms and
              fails to cure the breach within 14 days of written notice.
            </p>
            <p className="mt-3">
              Upon termination, your right to access the Services will cease. We will retain your
              data for a period of 30 days after termination, after which it may be permanently
              deleted. Sections that by their nature should survive termination (including Sections
              6, 9, 10, 11, and 13) shall survive.
            </p>
          </Section>

          <Section title="13. Governing Law & Dispute Resolution">
            <p>
              These Terms are governed by and construed in accordance with the laws of the{' '}
              <strong className="text-text-primary">Hong Kong Special Administrative Region</strong>
              , without regard to its conflict of law provisions.
            </p>
            <p className="mt-3">
              Any dispute arising out of or relating to these Terms shall first be attempted to be
              resolved through good-faith negotiation. If unresolved within 30 days, the dispute
              shall be submitted to the exclusive jurisdiction of the courts of Hong Kong.
            </p>
          </Section>

          <Section title="14. Modifications to Terms">
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material
              changes by updating the &ldquo;Last updated&rdquo; date and, where warranted, by email.
              Your continued use of the Services after the effective date of revised Terms constitutes
              acceptance. If you do not agree to the revised Terms, you must stop using the Services.
            </p>
          </Section>

          <Section title="15. General Provisions">
            <ul className="space-y-2">
              <li>
                <strong className="text-text-primary">Entire Agreement.</strong>{' '}
                <span className="text-text-secondary">
                  These Terms (together with our Privacy Policy and any order forms) constitute the
                  entire agreement between you and easecity regarding the Services and supersede all
                  prior agreements.
                </span>
              </li>
              <li>
                <strong className="text-text-primary">Severability.</strong>{' '}
                <span className="text-text-secondary">
                  If any provision of these Terms is held invalid or unenforceable, the remaining
                  provisions shall continue in full force and effect.
                </span>
              </li>
              <li>
                <strong className="text-text-primary">Waiver.</strong>{' '}
                <span className="text-text-secondary">
                  Our failure to enforce any right or provision of these Terms will not constitute a
                  waiver of that right or provision.
                </span>
              </li>
              <li>
                <strong className="text-text-primary">Assignment.</strong>{' '}
                <span className="text-text-secondary">
                  You may not assign or transfer your rights under these Terms without our prior
                  written consent. We may assign our rights and obligations without restriction.
                </span>
              </li>
              <li>
                <strong className="text-text-primary">Language.</strong>{' '}
                <span className="text-text-secondary">
                  These Terms are provided in English. Any translated version is provided for
                  convenience only; the English version shall prevail in the event of any conflict.
                </span>
              </li>
            </ul>
          </Section>

          <Section title="16. Contact Us">
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="mt-4 p-5 rounded-xl border border-border bg-bg-surface space-y-1.5">
              <p className="text-text-primary font-semibold">easecity</p>
              <p className="text-text-secondary">Hong Kong Special Administrative Region</p>
              <p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-signal hover:underline">
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
              <Link href="/legal/privacy" className="text-text-muted hover:text-signal transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-text-muted hover:text-signal transition-colors">
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
