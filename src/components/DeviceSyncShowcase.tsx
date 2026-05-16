'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { T } from '@/i18n/translations'

type DeviceId = 'A' | 'B' | 'C'
type DeviceView = 'camera' | 'dashboard' | 'messages' | 'snake' | 'animation'
type DeviceStatus = 'online' | 'syncing' | 'updated'
type DeviceSyncCopy = T['deviceSync']
type DesktopOperationId = 'drag-circle' | 'snake-game' | 'animation-demo'

interface ControlPoint {
  x: number
  y: number
}

interface DeviceInteractionState {
  point: ControlPoint
  snakeStep: number
}

interface DeviceState {
  id: DeviceId
  view: DeviceView
}

const viewCycle: DeviceView[] = ['camera', 'dashboard', 'snake', 'animation']
const desktopOperations: { id: DesktopOperationId; view: DeviceView; commandKey: keyof DeviceSyncCopy['operations'] }[] = [
  { id: 'drag-circle', view: 'camera', commandKey: 'dragCircle' },
  { id: 'snake-game', view: 'snake', commandKey: 'snakeGame' },
  { id: 'animation-demo', view: 'animation', commandKey: 'animationDemo' },
]

const initialDevices: DeviceState[] = [
  { id: 'A', view: 'camera' },
  { id: 'B', view: 'dashboard' },
  { id: 'C', view: 'animation' },
]

const initialInteractions: Record<DeviceId, DeviceInteractionState> = {
  A: { point: { x: 50, y: 52 }, snakeStep: 0 },
  B: { point: { x: 38, y: 44 }, snakeStep: 1 },
  C: { point: { x: 62, y: 58 }, snakeStep: 2 },
}

function getViewLabel(copy: DeviceSyncCopy, view: DeviceView) {
  return copy.views[view]
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

export function DeviceSyncShowcase() {
  const { t } = useLanguage()
  const copy = t.deviceSync
  const sectionRef = useRef<HTMLElement>(null)
  const [devices, setDevices] = useState<DeviceState[]>(initialDevices)
  const [selectedDevice, setSelectedDevice] = useState<DeviceId>('A')
  const [statusByDevice, setStatusByDevice] = useState<Record<DeviceId, DeviceStatus>>({
    A: 'online',
    B: 'online',
    C: 'online',
  })
  const [activeOperation, setActiveOperation] = useState<DesktopOperationId>('drag-circle')
  const [interactions, setInteractions] = useState<Record<DeviceId, DeviceInteractionState>>(initialInteractions)
  const [isVisible, setIsVisible] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  const selected = useMemo(
    () => devices.find((device) => device.id === selectedDevice) ?? devices[0],
    [devices, selectedDevice]
  )

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const pulseDeviceStatus = (deviceId: DeviceId) => {
    setStatusByDevice((current) => ({ ...current, [deviceId]: 'syncing' }))
    window.setTimeout(() => {
      setStatusByDevice((current) => ({ ...current, [deviceId]: 'updated' }))
    }, reducedMotion ? 150 : 650)
    window.setTimeout(() => {
      setStatusByDevice((current) => ({ ...current, [deviceId]: 'online' }))
    }, reducedMotion ? 500 : 1400)
  }

  const updateDeviceView = (deviceId: DeviceId, nextView?: DeviceView) => {
    setSelectedDevice(deviceId)
    setDevices((currentDevices) =>
      currentDevices.map((device) => {
        if (device.id !== deviceId) return device
        const currentIndex = viewCycle.indexOf(device.view)
        return {
          ...device,
          view: nextView ?? viewCycle[(currentIndex + 1) % viewCycle.length],
        }
      })
    )
    pulseDeviceStatus(deviceId)
  }

  const runDesktopOperation = (operation: (typeof desktopOperations)[number]) => {
    setActiveOperation(operation.id)
    updateDeviceView(selectedDevice, operation.view)
  }

  const updateControlPoint = (deviceId: DeviceId, point: ControlPoint) => {
    setSelectedDevice(deviceId)
    setActiveOperation('drag-circle')
    setDevices((currentDevices) =>
      currentDevices.map((device) => (device.id === deviceId ? { ...device, view: 'camera' } : device))
    )
    setInteractions((current) => ({
      ...current,
      [deviceId]: { ...current[deviceId], point },
    }))
  }

  const commitControlPoint = (deviceId: DeviceId) => {
    pulseDeviceStatus(deviceId)
  }

  const advanceSnake = (deviceId: DeviceId) => {
    setSelectedDevice(deviceId)
    setActiveOperation('snake-game')
    setDevices((currentDevices) =>
      currentDevices.map((device) => (device.id === deviceId ? { ...device, view: 'snake' } : device))
    )
    setInteractions((current) => ({
      ...current,
      [deviceId]: {
        ...current[deviceId],
        snakeStep: current[deviceId].snakeStep + 1,
      },
    }))
    pulseDeviceStatus(deviceId)
  }


  return (
    <section
      id="device-sync-showcase"
      ref={sectionRef}
      className={`section-padding relative overflow-hidden border-t border-border bg-bg-base transition-all duration-300 ${
        isVisible || reducedMotion ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-signal/5 to-bg-base pointer-events-none" />
      <div className="absolute inset-0 bg-rule-grid opacity-[0.12] pointer-events-none" />
      <div className="absolute left-[-12rem] top-20 h-80 w-80 rounded-full bg-signal/10 blur-[120px] pointer-events-none" />
      <div className="absolute right-[-12rem] bottom-20 h-96 w-96 rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <div className="container-max relative z-10">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="label-mono mb-4 text-signal/80">{copy.eyebrow}</p>
          <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-text-primary md:text-5xl">
            {copy.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-text-secondary md:text-lg">
            {copy.desc}
          </p>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="relative mx-auto max-w-5xl perspective-[1200px]">
            <DesktopConsole
              copy={copy}
              devices={devices}
              selectedDevice={selectedDevice}
              activeOperation={activeOperation}
              interactions={interactions}
              statusByDevice={statusByDevice}
              onSelectDevice={setSelectedDevice}
              onRunOperation={runDesktopOperation}
              onControlPointChange={updateControlPoint}
              onControlPointCommit={commitControlPoint}
              onAdvanceSnake={advanceSnake}
              reducedMotion={reducedMotion}
            />
          </div>

          <div className="relative z-20 mt-8 flex gap-4 overflow-x-auto pb-4 md:-mt-10 md:justify-center md:overflow-visible md:pb-0">
            {devices.map((device, index) => (
              <PhysicalPhone
                key={device.id}
                copy={copy}
                device={device}
                index={index}
                selected={selectedDevice === device.id}
                status={statusByDevice[device.id]}
                interaction={interactions[device.id]}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>

          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-border bg-bg-base/70 p-4 text-center backdrop-blur-xl">
            <p className="text-sm text-text-secondary">
              {copy.selectedStream}{' '}
              <span className="font-semibold text-signal">{copy.devices[selected.id].name}</span>
              <span className="text-text-muted"> · </span>
              {copy.selectedHelp}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function DesktopConsole({
  copy,
  devices,
  selectedDevice,
  activeOperation,
  interactions,
  statusByDevice,
  onSelectDevice,
  onRunOperation,
  onControlPointChange,
  onControlPointCommit,
  onAdvanceSnake,
  reducedMotion,
}: {
  copy: DeviceSyncCopy
  devices: DeviceState[]
  selectedDevice: DeviceId
  activeOperation: DesktopOperationId
  interactions: Record<DeviceId, DeviceInteractionState>
  statusByDevice: Record<DeviceId, DeviceStatus>
  onSelectDevice: (deviceId: DeviceId) => void
  onRunOperation: (operation: (typeof desktopOperations)[number]) => void
  onControlPointChange: (deviceId: DeviceId, point: ControlPoint) => void
  onControlPointCommit: (deviceId: DeviceId) => void
  onAdvanceSnake: (deviceId: DeviceId) => void
  reducedMotion: boolean
}) {
  return (
    <div className="relative origin-center transition-all duration-300 lg:[transform:rotateX(3deg)]">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-signal/18 via-purple-500/10 to-transparent blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#171c21] via-[#07090a] to-black p-3 shadow-[0_38px_100px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.18)]">
        <div className="pointer-events-none absolute inset-x-10 top-2 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

        <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#070a0d] p-4 shadow-[inset_0_0_70px_rgba(0,229,204,0.07)] md:p-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(0,229,204,0.18),transparent_42%),radial-gradient(ellipse_at_88%_12%,rgba(99,102,241,0.16),transparent_44%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_28%)] pointer-events-none" />
          <div className="absolute inset-0 bg-rule-grid opacity-[0.11] pointer-events-none" />

          <div className="relative z-10 mb-5 flex flex-col gap-4 border-b border-border/70 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="label-mono mb-1">{copy.consoleLabel}</p>
              <h3 className="text-xl font-semibold text-text-primary">{copy.consoleTitle}</h3>
            </div>
            <div className="rounded-md border border-signal/25 bg-signal/10 px-3 py-2 text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">{copy.targetLabel}</p>
              <p className="text-sm font-semibold text-signal">{copy.devices[selectedDevice].name}</p>
            </div>
          </div>

          <DesktopOperationDock
            copy={copy}
            activeOperation={activeOperation}
            selectedDevice={selectedDevice}
            onRunOperation={onRunOperation}
          />

          <div className="relative z-10 grid gap-4 lg:grid-cols-3">
            {devices.map((device, index) => (
              <DesktopPhoneStream
                key={device.id}
                copy={copy}
                device={device}
                selected={selectedDevice === device.id}
                status={statusByDevice[device.id]}
                interaction={interactions[device.id]}
                index={index}
                onSelect={() => onSelectDevice(device.id)}
                onControlPointChange={onControlPointChange}
                onControlPointCommit={onControlPointCommit}
                onAdvanceSnake={onAdvanceSnake}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-3 h-3 w-36 rounded-b-2xl bg-gradient-to-b from-[#171d22] to-[#07090a] shadow-[0_12px_28px_rgba(0,0,0,0.55)]" />
      </div>
      <div className="mx-auto h-10 w-32 bg-gradient-to-b from-[#15191d] to-[#090b0e] shadow-[0_20px_45px_rgba(0,0,0,0.48)]" />
      <div className="mx-auto h-3 w-72 rounded-full bg-gradient-to-r from-transparent via-[#1b2227] to-transparent shadow-[0_18px_38px_rgba(0,0,0,0.48)]" />
    </div>
  )
}

function DesktopPhoneStream({
  copy,
  device,
  selected,
  status,
  interaction,
  index,
  onSelect,
  onControlPointChange,
  onControlPointCommit,
  onAdvanceSnake,
  reducedMotion,
}: {
  copy: DeviceSyncCopy
  device: DeviceState
  selected: boolean
  status: DeviceStatus
  interaction: DeviceInteractionState
  index: number
  onSelect: () => void
  onControlPointChange: (deviceId: DeviceId, point: ControlPoint) => void
  onControlPointCommit: (deviceId: DeviceId) => void
  onAdvanceSnake: (deviceId: DeviceId) => void
  reducedMotion: boolean
}) {
  const isSyncing = status === 'syncing'

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className={`relative overflow-hidden rounded-xl border bg-bg-surface/90 p-3 transition-all duration-300 ${
        selected ? 'border-signal/45 shadow-glow-signal-sm' : 'border-border'
      } ${isSyncing ? 'shadow-[0_0_34px_rgba(0,229,204,0.24)]' : ''}`}
      style={{
        transitionDelay: reducedMotion ? '0ms' : `${index * 45}ms`,
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div
          className={`rounded-md px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
            selected ? 'bg-signal text-[#03100f]' : 'bg-bg-void text-text-secondary'
          }`}
        >
          {copy.select} {device.id}
        </div>
        <DeviceStatusBadge copy={copy} status={status} />
      </div>

      <SoftwareStreamPanel
        copy={copy}
        device={device}
        selected={selected}
        status={status}
        interaction={interaction}
        editable={selected}
        onControlPointChange={(point) => onControlPointChange(device.id, point)}
        onControlPointCommit={() => onControlPointCommit(device.id)}
        onAdvanceSnake={() => onAdvanceSnake(device.id)}
      />
    </article>
  )
}

function DesktopOperationDock({
  copy,
  activeOperation,
  selectedDevice,
  onRunOperation,
}: {
  copy: DeviceSyncCopy
  activeOperation: DesktopOperationId
  selectedDevice: DeviceId
  onRunOperation: (operation: (typeof desktopOperations)[number]) => void
}) {
  return (
    <div className="relative z-10 mb-5 rounded-xl border border-border bg-bg-void/70 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">{copy.operationPanelLabel}</p>
          <p className="text-xs text-text-muted">
            {copy.operationPanelHelp.replace('{device}', copy.devices[selectedDevice].name)}
          </p>
        </div>
        <span className="rounded-sm border border-border bg-bg-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
          {copy.targetLabel} {selectedDevice}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {desktopOperations.map((operation) => (
          <button
            key={operation.id}
            type="button"
            onClick={() => onRunOperation(operation)}
            className={`group rounded-lg border p-3 text-left transition-all duration-200 ${
              activeOperation === operation.id
                ? 'border-signal/45 bg-signal/12 text-text-primary'
                : 'border-border bg-bg-surface/80 text-text-secondary hover:border-signal/25 hover:text-text-primary'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                {getViewLabel(copy, operation.view)}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-signal opacity-70 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-2 text-xs leading-snug text-text-muted">{copy.operations[operation.commandKey]}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function SoftwareStreamPanel({
  copy,
  device,
  selected,
  status,
  interaction,
  editable,
  onControlPointChange,
  onControlPointCommit,
  onAdvanceSnake,
}: {
  copy: DeviceSyncCopy
  device: DeviceState
  selected: boolean
  status: DeviceStatus
  interaction: DeviceInteractionState
  editable: boolean
  onControlPointChange: (point: ControlPoint) => void
  onControlPointCommit: () => void
  onAdvanceSnake: () => void
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border bg-bg-void shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
        selected ? 'border-signal/35' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border bg-bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${selected ? 'bg-signal' : 'bg-text-faint'}`} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-primary">
              Stream {device.id}
            </p>
            <p className="text-[10px] text-text-muted">{copy.devices[device.id].location}</p>
          </div>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
          {status === 'syncing' ? copy.applyingLabel : selected ? copy.controlTargetLabel : copy.monitorLabel}
        </span>
      </div>

      <div className="relative min-h-[260px] p-3">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,229,204,0.12),transparent_46%)]" />
        <div className="relative z-10 mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-primary">
              {copy.remoteScreenLabel} · {getViewLabel(copy, device.view)}
            </p>
            <p className="text-[10px] text-text-muted">
              {device.view === 'camera' && editable ? copy.dragHint : copy.devices[device.id].name}
            </p>
          </div>
          {device.view === 'snake' && editable && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onAdvanceSnake?.()
              }}
              className="rounded-md border border-signal/30 bg-signal/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-signal hover:bg-signal/15"
            >
              {copy.snakeMove}
            </button>
          )}
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[160px]">
          <PhoneScreen
            copy={copy}
            device={device}
            interaction={interaction}
            compact
            editable={editable}
            onPointChange={onControlPointChange}
            onPointCommit={onControlPointCommit}
            onAdvanceSnake={onAdvanceSnake}
          />
        </div>
        {device.view === 'animation' && (
          <div className="relative z-10 mt-2 flex items-center justify-between rounded-md border border-border bg-bg-void/70 px-2.5 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-signal">
              {copy.animationMirrorLabel}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
              {copy.animationAuto}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function PhysicalPhone({
  copy,
  device,
  index,
  selected,
  status,
  interaction,
  reducedMotion,
}: {
  copy: DeviceSyncCopy
  device: DeviceState
  index: number
  selected: boolean
  status: DeviceStatus
  interaction: DeviceInteractionState
  reducedMotion: boolean
}) {
  const yOffset = reducedMotion ? 0 : index % 2 === 0 ? 0 : 18
  const rotate = reducedMotion ? 0 : index === 0 ? -4 : index === 2 ? 4 : 0
  const isSyncing = status === 'syncing'

  return (
    <div
      className={`relative w-44 shrink-0 rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#1b1f24] via-[#050708] to-black p-2 shadow-[0_30px_80px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 ${
        selected ? 'ring-1 ring-signal/45' : ''
      } ${isSyncing ? 'shadow-[0_0_42px_rgba(99,102,241,0.55),0_0_80px_rgba(0,229,204,0.34)]' : ''}`}
      style={{
        transform: `translateY(${yOffset}px) rotate(${rotate}deg)`,
        transitionDelay: reducedMotion ? '0ms' : `${index * 100}ms`,
      }}
    >
      <div className="pointer-events-none absolute inset-x-6 top-2 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="absolute left-1/2 top-3 z-20 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black/90 shadow-inner" />
      <PhoneScreen copy={copy} device={device} interaction={interaction} compact />
    </div>
  )
}

function PhoneScreen({
  copy,
  device,
  interaction,
  compact = false,
  editable = false,
  onPointChange,
  onPointCommit,
  onAdvanceSnake,
}: {
  copy: DeviceSyncCopy
  device: DeviceState
  interaction: DeviceInteractionState
  compact?: boolean
  editable?: boolean
  onPointChange?: (point: ControlPoint) => void
  onPointCommit?: () => void
  onAdvanceSnake?: () => void
}) {
  return (
    <div
      key={`${device.id}-${device.view}`}
      className={`relative aspect-[9/16] overflow-hidden rounded-[1.45rem] border border-border bg-[#070a0d] shadow-[inset_0_0_36px_rgba(0,229,204,0.06)] transition-all duration-300 ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,229,204,0.14),transparent_48%),radial-gradient(ellipse_at_90%_20%,rgba(99,102,241,0.16),transparent_42%)] pointer-events-none" />
      <div className="relative z-10">
        {device.view === 'camera' && (
          <CameraView
            copy={copy}
            compact={compact}
            point={interaction.point}
            editable={editable}
            onPointChange={onPointChange}
            onPointCommit={onPointCommit}
            showCaption={false}
          />
        )}
        {device.view === 'dashboard' && <DashboardView copy={copy} compact={compact} />}
        {device.view === 'messages' && <MessagesView copy={copy} compact={compact} />}
        {device.view === 'snake' && (
          <SnakeView
            copy={copy}
            step={interaction.snakeStep}
            compact={compact}
            editable={editable}
            onAdvance={onAdvanceSnake}
            showHeader={false}
          />
        )}
        {device.view === 'animation' && <AnimationView copy={copy} compact={compact} showHeader={false} />}
      </div>
    </div>
  )
}

function CameraView({
  copy,
  compact,
  point = { x: 50, y: 52 },
  editable = false,
  onPointChange,
  onPointCommit,
  showCaption = true,
}: {
  copy: DeviceSyncCopy
  compact: boolean
  point?: ControlPoint
  editable?: boolean
  onPointChange?: (point: ControlPoint) => void
  onPointCommit?: () => void
  showCaption?: boolean
}) {
  const padRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const latestPointRef = useRef<ControlPoint | null>(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const schedulePointChange = (nextPoint: ControlPoint) => {
    if (!onPointChange) return
    latestPointRef.current = nextPoint
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      if (latestPointRef.current) onPointChange(latestPointRef.current)
    })
  }

  const updatePointFromEvent = (event: PointerEvent<HTMLDivElement>) => {
    if (!editable || !onPointChange) return
    const rect = padRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.min(92, Math.max(8, ((event.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(88, Math.max(12, ((event.clientY - rect.top) / rect.height) * 100))
    schedulePointChange({ x, y })
  }

  return (
    <div className="rounded-2xl border border-signal/20 bg-bg-base/75 p-3">
      <div
        ref={padRef}
        onPointerDown={(event) => {
          event.stopPropagation()
          draggingRef.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          updatePointFromEvent(event)
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) return
          event.stopPropagation()
          updatePointFromEvent(event)
        }}
        onPointerUp={(event) => {
          event.stopPropagation()
          if (!draggingRef.current) return
          draggingRef.current = false
          onPointCommit?.()
        }}
        onLostPointerCapture={() => {
          if (!draggingRef.current) return
          draggingRef.current = false
          onPointCommit?.()
        }}
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-signal/20 via-bg-elevated to-black ${
          compact ? 'h-40' : 'h-44'
        } ${editable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <div className="absolute inset-0 bg-rule-grid opacity-[0.12]" />
        <div className="absolute left-4 top-4 h-10 w-16 rounded-lg border border-signal/30 bg-black/30" />
        <div
          className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/50 bg-signal/10 shadow-glow-signal-sm transition-[left,top] duration-75"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
        >
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal" />
        </div>
      </div>
      {showCaption && (
        <p className="mt-3 text-[10px] text-text-secondary">
          {editable ? copy.dragHint : copy.camera.caption}
        </p>
      )}
    </div>
  )
}

function DashboardView({ copy, compact }: { copy: DeviceSyncCopy; compact: boolean }) {
  return (
    <div className="rounded-2xl border border-signal/20 bg-signal/8 p-3">
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-bg-base/70 p-2">
          <p className="text-lg font-bold text-signal">92%</p>
          <p className="text-[9px] text-text-muted">{copy.dashboard.sync}</p>
        </div>
        <div className="rounded-xl border border-border bg-bg-base/70 p-2">
          <p className="text-lg font-bold text-text-primary">0.8</p>
          <p className="text-[9px] text-text-muted">{copy.dashboard.latency}</p>
        </div>
      </div>
      <div className={`flex items-end gap-1.5 ${compact ? 'h-28' : 'h-32'}`}>
        {[52, 76, 64, 88, 72, 94].map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t bg-signal/75 transition-all duration-300"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function MessagesView({ copy, compact }: { copy: DeviceSyncCopy; compact: boolean }) {
  const messages = compact
    ? [copy.messages.compact1, copy.messages.compact2, copy.messages.compact3]
    : [copy.messages.full1, copy.messages.full2, copy.messages.full3]

  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div key={message} className="rounded-xl border border-border bg-bg-base/75 p-3 transition-all duration-300">
          <div className="mb-1 flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-signal' : 'bg-text-muted'}`} />
            <p className="text-[10px] font-mono text-text-muted">MSG.{index + 1}</p>
          </div>
          <p className="text-[10px] leading-snug text-text-secondary">{message}</p>
        </div>
      ))}
    </div>
  )
}

function SnakeView({
  copy,
  step,
  compact,
  editable = false,
  onAdvance,
  showHeader = true,
}: {
  copy: DeviceSyncCopy
  step: number
  compact: boolean
  editable?: boolean
  onAdvance?: () => void
  showHeader?: boolean
}) {
  const path = [
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [5, 4],
    [5, 5],
    [4, 5],
    [3, 5],
    [2, 5],
    [2, 4],
  ]
  const headIndex = step % path.length
  const snake = [0, 1, 2, 3].map((offset) => path[(headIndex - offset + path.length) % path.length])
  const food = path[(headIndex + 3) % path.length]

  return (
    <div className="rounded-2xl border border-signal/20 bg-bg-base/75 p-3">
      {showHeader && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal">{copy.snakeTitle}</p>
            <p className="text-[10px] text-text-muted">{copy.snakeDesc}</p>
          </div>
          {editable && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onAdvance?.()
              }}
              className="rounded-md border border-signal/30 bg-signal/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-signal hover:bg-signal/15"
            >
              {copy.snakeMove}
            </button>
          )}
        </div>
      )}

      <div
        className={`grid grid-cols-8 gap-1 rounded-xl border border-border bg-bg-void p-2 ${
          compact ? 'h-40' : 'h-44'
        }`}
      >
        {Array.from({ length: 64 }, (_, index) => {
          const x = index % 8
          const y = Math.floor(index / 8)
          const snakeIndex = snake.findIndex(([sx, sy]) => sx === x && sy === y)
          const isFood = food[0] === x && food[1] === y

          return (
            <div
              key={index}
              className={`rounded-[3px] border ${
                snakeIndex === 0
                  ? 'border-signal bg-signal shadow-glow-signal-sm'
                  : snakeIndex > 0
                    ? 'border-signal/30 bg-signal/45'
                    : isFood
                      ? 'border-status-warning/50 bg-status-warning/70'
                      : 'border-white/5 bg-white/[0.03]'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}

function AnimationView({
  copy,
  compact,
  showHeader = true,
}: {
  copy: DeviceSyncCopy
  compact: boolean
  showHeader?: boolean
}) {
  return (
    <div className="rounded-2xl border border-signal/20 bg-bg-base/75 p-3">
      {showHeader && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal">{copy.animationTitle}</p>
            <p className="text-[10px] text-text-muted">{copy.animationDesc}</p>
          </div>
          <span className="rounded-sm border border-signal/25 bg-signal/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-signal">
            {copy.animationAuto}
          </span>
        </div>
      )}

      <div className={`relative overflow-hidden rounded-xl border border-border bg-bg-void ${compact ? 'h-40' : 'h-44'}`}>
        <div className="absolute inset-0 bg-rule-grid opacity-[0.10]" />
        {showHeader && (
          <>
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-sm border border-signal/25 bg-bg-void/80 px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" style={{ animation: 'breathe 1.4s ease-in-out infinite' }} />
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-signal">
                {copy.animationMirrorLabel}
              </span>
            </div>
            <div className="absolute right-3 top-3 z-10 rounded-sm border border-border bg-bg-void/80 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-text-muted">
              FRAME 1-1
            </div>
          </>
        )}
        <div className="absolute inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-signal/60 to-transparent" />
        <div
          className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/15"
          style={{ animation: 'breathe 2.2s ease-in-out infinite' }}
        />
        <div
          className="absolute left-[12%] top-[18%] h-[64%] w-[76%] rounded-full border border-signal/20"
          style={{ animation: 'orbitSpin 7s linear infinite' }}
        />
        {[
          { x: 18, y: 24, size: 18, duration: '3.2s', delay: '0s' },
          { x: 76, y: 28, size: 12, duration: '3.8s', delay: '-0.8s' },
          { x: 34, y: 74, size: 14, duration: '4.4s', delay: '-1.4s' },
          { x: 68, y: 70, size: 20, duration: '3.6s', delay: '-2s' },
        ].map((particle, index) => (
          <div
            key={index}
            className="absolute rounded-full border border-signal/35 bg-signal/20 shadow-glow-signal-sm"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: 'translate(-50%, -50%)',
              animation: `driftFloat ${particle.duration} ease-in-out infinite`,
              animationDelay: particle.delay,
            }}
          />
        ))}
        <div
          className="absolute left-[50%] top-[50%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-glow-signal"
          style={{ animation: 'breathe 1.4s ease-in-out infinite' }}
        />
        <div className="absolute bottom-7 left-4 right-4 h-px overflow-hidden bg-white/10">
          <div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-signal to-transparent"
            style={{ animation: 'timelinePacket 2.4s linear infinite' }}
          />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1">
          {[0, 1, 2, 3].map((bar) => (
            <div
              key={bar}
              className="h-1 flex-1 rounded-full bg-signal/25"
              style={{
                animation: 'breathe 1.8s ease-in-out infinite',
                animationDelay: `${bar * 0.22}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DeviceStatusBadge({ copy, status }: { copy: DeviceSyncCopy; status: DeviceStatus }) {
  const className =
    status === 'syncing'
      ? 'border-indigo-300/35 bg-indigo-400/15 text-indigo-200'
      : status === 'updated'
        ? 'border-signal/35 bg-signal/15 text-signal'
        : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider transition-all duration-300 ${className}`}>
      {copy.status[status]}
    </span>
  )
}
