import { useEffect, useMemo, useState } from 'react'
import { APP_ENTRY_URL } from '@opencopilot/shared/protocol'
import type { AppUpdaterStatus } from '@opencopilot/shared/updater'
import { createFileRoute } from '@tanstack/react-router'
import electronLogo from '@/assets/electron.svg'

export const Route = createFileRoute('/')({
  component: HomePage
})

const initialStatus: AppUpdaterStatus = {
  state: 'idle',
  message: 'Ready to check for updates.'
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

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Electron Monorepo Starter</p>
          <h1>OpenCopilot now runs on a custom Electron and Vite toolchain.</h1>
          <p className="lede">
            Main and preload are bundled with tsdown. The renderer is a dedicated Vite app with
            TanStack Router and Browser history served from a custom <code>{APP_ENTRY_URL}</code>{' '}
            protocol.
          </p>
          <div className="hero-actions">
            <button
              className="primary-action"
              disabled={!canCheck}
              onClick={() => void window.appUpdater.checkForUpdates()}
            >
              {status.state === 'checking' ? 'Checking...' : 'Check for Updates'}
            </button>
            <button
              className="secondary-action"
              disabled={!canInstall}
              onClick={() => void window.appUpdater.quitAndInstall()}
            >
              Restart to Install
            </button>
          </div>
        </div>
        <div className="hero-badge">
          <img alt="Electron logo" src={electronLogo} />
          <span>{APP_ENTRY_URL}</span>
        </div>
      </section>

      <section className="status-grid">
        <article className="status-card accent-card">
          <header>
            <p className="card-label">Updater State</p>
            <span className={`status-pill status-${status.state}`}>{status.state}</span>
          </header>
          <p className="status-message">{status.message}</p>
          <dl className="status-meta">
            <div>
              <dt>Version</dt>
              <dd>{status.version ?? 'Current release'}</dd>
            </div>
            <div>
              <dt>Progress</dt>
              <dd>{status.progress == null ? 'Waiting' : `${Math.round(status.progress)}%`}</dd>
            </div>
          </dl>
        </article>

        <article className="status-card">
          <header>
            <p className="card-label">Runtime</p>
            <span className="mono-chip">Desktop</span>
          </header>
          <ul className="version-list">
            <li>
              <span>Electron</span>
              <strong>{versions.electron}</strong>
            </li>
            <li>
              <span>Chromium</span>
              <strong>{versions.chrome}</strong>
            </li>
            <li>
              <span>Node</span>
              <strong>{versions.node}</strong>
            </li>
          </ul>
        </article>

        <article className="status-card">
          <header>
            <p className="card-label">Monorepo Layout</p>
            <span className="mono-chip">pnpm workspace</span>
          </header>
          <ul className="check-list">
            <li>`apps/electron` owns main, preload, packaging and updates</li>
            <li>`apps/web` owns Vite, routes and renderer UI</li>
            <li>Dev boot is managed by a custom Node orchestration script</li>
          </ul>
        </article>
      </section>
    </main>
  )
}
