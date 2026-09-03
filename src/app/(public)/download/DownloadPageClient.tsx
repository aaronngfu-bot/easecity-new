'use client'

import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { useLanguage } from '@/context/LanguageContext'

interface DownloadPageClientProps {
  defaultManifestUrl: string
  windowsInstallerUrl?: string
}

export function DownloadPageClient({
  defaultManifestUrl,
  windowsInstallerUrl,
}: DownloadPageClientProps) {
  const { t } = useLanguage()
  const copy = t.downloadPage
  const hasInstaller = Boolean(windowsInstallerUrl)

  return (
    <>
      <PageHero
        serial="02"
        sectionCode="DOWNLOAD"
        heading={copy.heroHeading}
        headingHighlight={copy.heroHighlight}
        description={copy.heroDesc}
        meta={[
          { label: copy.metaPlatformLabel, value: copy.metaPlatformValue },
          {
            label: copy.metaChannelLabel,
            value: hasInstaller ? copy.metaChannelReady : copy.metaChannelPending,
          },
          {
            label: copy.metaSigningLabel,
            value: hasInstaller ? copy.metaSigningReady : copy.metaSigningPending,
          },
        ]}
      />

      <section className="pt-4 pb-14 md:pb-16">
        <div className="container-max">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="glass-prominent min-w-0 overflow-hidden p-6 md:p-8">
              <div className="mb-8 flex flex-col gap-4 border-b border-border  pb-8 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="label-mono mb-4">{copy.primaryInstallerLabel}</p>
                  <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
                    {copy.primaryInstallerTitle}
                  </h2>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-signal/25 bg-signal/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal animate-signal-pulse" />
                  {hasInstaller ? copy.statusReady : copy.statusPending}
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
                {/* min-w-0: grid/flex children default to min-width:auto, so a
                    single unbreakable token (the env var name below) would
                    otherwise blow this column past the viewport on phones. */}
                <div className="min-w-0 rounded-2xl border border-border  bg-bg-base/50 p-5">
                  <p className="label-mono mb-3">{copy.releaseCardLabel}</p>
                  <p className="mb-2 font-display text-2xl font-bold text-text-primary">
                    {copy.releaseCardTitle}
                  </p>
                  <p className="mb-5 text-sm leading-relaxed text-text-muted">
                    {copy.releaseCardDesc}
                  </p>
                  <div className="space-y-2 font-mono text-xs text-text-secondary">
                    <div className="flex justify-between gap-4">
                      <span>{copy.releasePlatformLabel}</span>
                      <span className="text-text-primary">{copy.releasePlatformValue}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>{copy.releaseChannelLabel}</span>
                      <span className="text-text-primary">{copy.releaseChannelValue}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>{copy.releaseVersionLabel}</span>
                      <span className="text-text-primary">
                        {hasInstaller ? copy.releaseVersionLatest : copy.releaseVersionPending}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <p className="text-text-secondary leading-relaxed">{copy.primaryDesc}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      {windowsInstallerUrl ? (
                        <a
                          href={windowsInstallerUrl}
                          className="glass-cta inline-flex items-center justify-center"
                        >
                          {copy.downloadCta}
                        </a>
                      ) : (
                        <Link href="/signup" className="glass-cta inline-flex items-center justify-center">
                          {copy.earlyAccessCta}
                        </Link>
                      )}
                      <Link href="/docs" className="glass-ghost inline-flex items-center justify-center">
                        {copy.docsCta}
                      </Link>
                    </div>
                  </div>

                  {!hasInstaller && (
                    <p className="mt-5 rounded-xl border border-status-warning/25 bg-status-warning/10 px-4 py-3 text-sm leading-relaxed text-status-warning [&_wbr]:hidden">
                      {/* break-all: the copy embeds a 42-char env-var token that
                          cannot wrap on its own and would overflow the card. */}
                      <span className="break-all">{copy.pendingNotice}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 md:p-8">
              <p className="label-mono mb-4">{copy.requirementsLabel}</p>
              <ul className="space-y-3">
                {copy.requirements.map((item) => (
                  <li key={item} className="flex gap-3 text-text-secondary">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="glass-panel p-6 md:p-8">
              <p className="label-mono mb-4">{copy.includedLabel}</p>
              <ul className="space-y-4">
                {copy.includedItems.map((item) => (
                  <li key={item} className="flex gap-3 text-text-secondary">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-signal/30 bg-signal/10 font-mono text-[10px] text-signal">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 md:p-8">
              <p className="label-mono mb-4">{copy.platformsLabel}</p>
              <div className="space-y-4">
                {copy.platformInterest.map((item) => (
                  <div key={item.platform} className="rounded-xl border border-border  bg-bg-elevated/40 [0.02] p-4">
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <h3 className="font-display text-xl font-bold text-text-primary">
                        {item.platform}
                      </h3>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-text-secondary">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-border ">
        <div className="container-max grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel min-w-0 p-6 md:p-8">
            <p className="label-mono mb-4">{copy.verificationLabel}</p>
            <h2 className="font-display text-2xl font-bold text-text-primary mb-5">
              {copy.verificationTitle}
            </h2>
            <div className="space-y-5">
              {copy.verificationItems.map((item) => (
                <div key={item.label} className="border-l border-signal/30 pl-4">
                  <h3 className="mb-1 font-mono text-xs uppercase tracking-[0.16em] text-signal">
                    {item.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel min-w-0 p-6 md:p-8">
            <p className="label-mono mb-4">{copy.updateChannelLabel}</p>
            <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
              {copy.updateChannelTitle}
            </h2>
            <p className="min-w-0 text-text-secondary leading-relaxed [overflow-wrap:anywhere]">
              {copy.updateChannelBefore}{' '}
              <a
                href={defaultManifestUrl}
                className="text-signal underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {defaultManifestUrl}
              </a>
              . {copy.updateChannelAfter}{' '}
              <Link
                href="/api/v1/download/latest-manifest"
                className="text-signal underline-offset-4 hover:underline"
              >
                GET /api/v1/download/latest-manifest
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-border ">
        <div className="container-max">
          <div className="mb-8 max-w-2xl">
            <p className="label-mono mb-4">{copy.versionHistoryLabel}</p>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              {copy.versionHistoryTitle}
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              {copy.versionHistoryDesc}
            </p>
          </div>

          <div className="space-y-4">
            {copy.releaseHistory.map((release) => (
              <article key={release.version} className="glass-panel p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-text-primary">
                      {release.version}
                    </h3>
                    <p className="mt-2 text-text-secondary leading-relaxed">{release.note}</p>
                  </div>
                  <span className="w-fit rounded-full border border-border  bg-bg-elevated/40 [0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    {release.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent pricing — shown on the download page */}
      <section className="section-padding border-t border-border ">
        <div className="container-max">
          <div className="glass-panel p-6 md:p-10">
            <p className="label-mono mb-3 text-[var(--signal)]">
              {t.pricingPage.badge}
            </p>
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              {t.pricingPage.heading1}{' '}
              <span className="text-[var(--signal)]">{t.pricingPage.headingHighlight}</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--text-secondary)] leading-relaxed">
              {t.pricingPage.desc}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
              {[t.pricingPage.benefit1, t.pricingPage.benefit2, t.pricingPage.benefit3].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
                  <span className="font-mono text-[12px] tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
