import { spawn } from 'node:child_process'
import { existsSync, watch } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const scriptsDir = path.dirname(__filename)
const electronDir = path.resolve(scriptsDir, '..')
const workspaceDir = path.resolve(electronDir, '../..')
const webDir = path.resolve(workspaceDir, 'apps/web')
const rendererUrl = 'http://127.0.0.1:5173'
const devDistRoot = path.resolve(electronDir, 'dist-dev')
const distMainEntry = path.resolve(devDistRoot, 'main/index.cjs')
const distPreloadEntry = path.resolve(devDistRoot, 'preload/index.cjs')

let electronProcess = null
let shuttingDown = false
let restartTimer = null
let pendingElectronRestart = false
const childProcesses = new Set()
const watchers = []

function spawnChild(name, args, options = {}) {
  const child = spawn('pnpm', args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  child.on('exit', (code, signal) => {
    childProcesses.delete(child)

    if (shuttingDown) {
      return
    }

    if (child === electronProcess) {
      electronProcess = null

      if (pendingElectronRestart) {
        pendingElectronRestart = false
        launchElectron()
        return
      }

      return
    }

    console.error(
      `[dev] ${name} exited with code ${code ?? 'null'} signal ${signal ?? 'null'}`,
    )
    shutdown(code ?? 1)
  })

  childProcesses.add(child)
  return child
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer(url) {
  for (;;) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Ignore connection failures while the dev server is booting.
    }

    await wait(250)
  }
}

async function waitForFile(filePath) {
  while (!existsSync(filePath)) {
    await wait(250)
  }
}

function stopElectron() {
  if (!electronProcess) {
    return
  }

  electronProcess.kill('SIGTERM')
}

function launchElectron() {
  electronProcess = spawnChild(
    'electron',
    ['exec', 'electron', distMainEntry],
    {
      cwd: electronDir,
      env: {
        ...process.env,
        OPENCOPILOT_RENDERER_URL: rendererUrl,
      },
    },
  )
}

function scheduleElectronRestart() {
  if (shuttingDown || !electronProcess) {
    return
  }

  if (restartTimer) {
    clearTimeout(restartTimer)
  }

  restartTimer = setTimeout(() => {
    restartTimer = null
    pendingElectronRestart = true
    stopElectron()
  }, 150)
}

function watchDirectory(directoryPath) {
  const watcher = watch(directoryPath, () => {
    scheduleElectronRestart()
  })

  watchers.push(watcher)
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const watcher of watchers) {
    watcher.close()
  }

  if (restartTimer) {
    clearTimeout(restartTimer)
  }

  stopElectron()

  for (const child of childProcesses) {
    child.kill('SIGTERM')
  }

  await wait(100)
  process.exitCode = exitCode
}

process.on('SIGINT', () => {
  void shutdown(0)
})
process.on('SIGTERM', () => {
  void shutdown(0)
})

async function main() {
  spawnChild(
    'web',
    [
      '--dir',
      webDir,
      'dev',
      '--host',
      '127.0.0.1',
      '--port',
      '5173',
      '--strictPort',
    ],
    {
      cwd: workspaceDir,
    },
  )

  spawnChild('tsdown', ['exec', 'tsdown', '--watch'], {
    cwd: electronDir,
    env: {
      ...process.env,
      OPENCOPILOT_ELECTRON_DIST_ROOT: './dist-dev',
    },
  })

  await Promise.all([
    waitForServer(rendererUrl),
    waitForFile(distMainEntry),
    waitForFile(distPreloadEntry),
  ])

  launchElectron()
  watchDirectory(path.dirname(distMainEntry))
  watchDirectory(path.dirname(distPreloadEntry))
}

main().catch((error) => {
  console.error(error)
  void shutdown(1)
})
