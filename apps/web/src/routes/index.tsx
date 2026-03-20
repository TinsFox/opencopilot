import { useEffect, useMemo, useState } from 'react'
import { APP_ENTRY_URL } from '@opencopilot/shared/protocol'
import type { AppUpdaterStatus } from '@opencopilot/shared/updater'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, Chip } from '@heroui/react'
import electronLogo from '@/assets/electron.svg'

export const Route = createFileRoute('/')({
  component: HomePage
})

const initialStatus: AppUpdaterStatus = {
  state: 'idle',
  message: 'Ready to check for updates.'
}

const statusTone: Record<
  AppUpdaterStatus['state'],
  { chipColor: 'default' | 'accent' | 'success' | 'warning' | 'danger'; label: string }
> = {
  idle: { chipColor: 'default', label: 'Idle' },
  checking: { chipColor: 'accent', label: 'Checking' },
  available: { chipColor: 'accent', label: 'Update found' },
  'not-available': { chipColor: 'default', label: 'Up to date' },
  downloading: { chipColor: 'warning', label: 'Downloading' },
  downloaded: { chipColor: 'success', label: 'Ready to install' },
  error: { chipColor: 'danger', label: 'Attention required' }
}

function HomePage(): React.JSX.Element {
  const [status, setStatus] = useState<AppUpdaterStatus>(initialStatus)
  const versions = useMemo(() => window.electron.process.versions, [])

  useEffect(() => {
    return window.appUpdater.onStatus((nextStatus) => {
      setStatus(nextStatus)
    })
  }, [])

  const canInstall = status.state === 'downloaded'
  const canCheck = status.state !== 'checking' && status.state !== 'downloading'
  const tone = statusTone[status.state]
  const progressValue = status.progress == null ? 8 : Math.max(8, Math.round(status.progress))

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(214,115,61,0.22),_transparent_28%),radial-gradient(circle_at_78%_18%,_rgba(84,114,168,0.2),_transparent_24%),linear-gradient(180deg,_oklch(0.985_0.01_75)_0%,_oklch(0.95_0.02_70)_45%,_oklch(0.91_0.03_50)_100%)] text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
        <section className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <Card className="relative overflow-hidden border-none bg-[linear-gradient(135deg,rgba(255,250,242,0.94),rgba(243,228,205,0.92))] shadow-[0_30px_80px_-35px_rgba(74,44,19,0.5)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(124,74,33,0.24),transparent_70%)]"
            />
            <Card.Content className="relative flex h-full flex-col gap-8 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <Chip variant="soft" color="accent" className="border border-black/5 bg-white/65">
                  <Chip.Label>OpenCopilot Desktop</Chip.Label>
                </Chip>
                <Chip variant="soft" className="border border-black/5 bg-white/55">
                  <Chip.Label>Electron + Vite + TanStack Router</Chip.Label>
                </Chip>
                <Link
                  to="/about"
                  className="ml-auto text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  About Us →
                </Link>
                <Link
                  to="/components"
                  className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  Components →
                </Link>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                      Local protocol renderer
                    </p>
                    <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-5xl lg:text-6xl">
                      Ship the desktop shell from a cleaner HeroUI control surface.
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
                      The renderer is served through{' '}
                      <code className="rounded bg-black/6 px-2 py-1 text-[0.95em] text-zinc-900">
                        {APP_ENTRY_URL}
                      </code>{' '}
                      while the updater, runtime metadata, and workspace structure stay visible from
                      the first screen.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      isPending={status.state === 'checking'}
                      isDisabled={!canCheck}
                      size="lg"
                      className="min-w-44 bg-zinc-950 text-amber-50 shadow-[0_18px_30px_-18px_rgba(24,24,27,0.9)]"
                      onPress={() => void window.appUpdater.checkForUpdates()}
                    >
                      {({ isPending }) =>
                        isPending ? 'Checking for updates...' : 'Check for updates'
                      }
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      isDisabled={!canInstall}
                      className="min-w-44 border border-black/8 bg-white/70"
                      onPress={() => void window.appUpdater.quitAndInstall()}
                    >
                      Restart to install
                    </Button>
                  </div>
                </div>

                <div className="flex items-start lg:justify-end">
                  <div className="flex w-full max-w-[220px] flex-col items-center gap-4 rounded-[2rem] border border-black/8 bg-white/72 px-6 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur">
                    <img
                      alt="Electron logo"
                      className="h-16 w-16 drop-shadow-[0_12px_18px_rgba(0,0,0,0.15)]"
                      src={electronLogo}
                    />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500">
                        Entry URL
                      </p>
                      <p className="break-all text-sm font-medium leading-6 text-zinc-900">
                        {APP_ENTRY_URL}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card
            variant="secondary"
            className="border-none bg-[linear-gradient(180deg,rgba(50,44,40,0.96),rgba(31,29,28,0.98))] text-stone-50 shadow-[0_30px_80px_-38px_rgba(24,24,27,0.8)]"
          >
            <Card.Header className="gap-4 p-6 pb-3 sm:p-7 sm:pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Card.Description className="text-stone-300">Updater channel</Card.Description>
                  <Card.Title className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-stone-50">
                    {tone.label}
                  </Card.Title>
                </div>
                <Chip color={tone.chipColor} variant="soft" className="self-start">
                  <Chip.Label>{status.state}</Chip.Label>
                </Chip>
              </div>
            </Card.Header>
            <Card.Content className="flex flex-1 flex-col gap-6 p-6 pt-0 sm:p-7 sm:pt-0">
              <p className="text-sm leading-7 text-stone-300">{status.message}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-stone-400">
                  <span>Download progress</span>
                  <span>
                    {status.progress == null ? 'Waiting' : `${Math.round(status.progress)}%`}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(247,198,120,0.96),rgba(230,145,78,0.96))] transition-[width] duration-500 ease-out"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Metric label="Version" value={status.version ?? 'Current release'} />
                <Metric
                  label="Install state"
                  value={canInstall ? 'Restart available' : 'No install queued'}
                />
              </dl>
            </Card.Content>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <Card className="border-none bg-white/72 shadow-[0_18px_50px_-30px_rgba(24,24,27,0.42)] backdrop-blur">
            <Card.Header className="p-6 pb-4 sm:p-7 sm:pb-5">
              <Card.Description className="text-zinc-500">Runtime matrix</Card.Description>
              <Card.Title className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
                Renderer and host versions
              </Card.Title>
            </Card.Header>
            <Card.Content className="p-6 pt-0 sm:p-7 sm:pt-0">
              <div className="grid gap-3 sm:grid-cols-3">
                <VersionTile label="Electron" value={versions.electron} />
                <VersionTile label="Chromium" value={versions.chrome} />
                <VersionTile label="Node" value={versions.node} />
              </div>
            </Card.Content>
          </Card>

          <Card className="border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(252,246,238,0.88))] shadow-[0_18px_50px_-30px_rgba(24,24,27,0.38)]">
            <Card.Header className="p-6 pb-4 sm:p-7 sm:pb-5">
              <Card.Description className="text-zinc-500">Workspace shape</Card.Description>
              <Card.Title className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
                Monorepo responsibilities
              </Card.Title>
            </Card.Header>
            <Card.Content className="p-6 pt-0 sm:p-7 sm:pt-0">
              <div className="space-y-3">
                <ChecklistRow
                  title="apps/electron"
                  description="Owns main, preload, packaging, and update orchestration."
                />
                <ChecklistRow
                  title="apps/web"
                  description="Owns the renderer app, route tree, and the HeroUI surface."
                />
                <ChecklistRow
                  title="Custom dev boot"
                  description="A Node-based orchestration layer coordinates local startup."
                />
              </div>
            </Card.Content>
          </Card>
        </section>
      </div>
    </main>
  )
}

function Metric(props: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4">
      <dt className="text-xs uppercase tracking-[0.24em] text-stone-400">{props.label}</dt>
      <dd className="mt-2 text-sm font-medium text-stone-100">{props.value}</dd>
    </div>
  )
}

function VersionTile(props: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-[1.75rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(244,236,226,0.78))] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {props.label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">{props.value}</p>
    </div>
  )
}

function ChecklistRow(props: { title: string; description: string }): React.JSX.Element {
  return (
    <div className="flex gap-4 rounded-[1.5rem] border border-black/6 bg-white/60 px-4 py-4">
      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[oklch(0.62_0.14_55)]" />
      <div>
        <p className="text-sm font-semibold text-zinc-950">{props.title}</p>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{props.description}</p>
      </div>
    </div>
  )
}
