import { existsSync } from 'node:fs'
import path, { extname, isAbsolute, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, net, protocol } from 'electron'
import {
  APP_ASSET_PATH_PREFIX,
  APP_ENTRY_URL,
  APP_HOST,
  APP_SCHEME
} from '@opencopilot/shared/protocol'

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true
    }
  }
])

function getRendererDistPath(): string {
  return resolve(app.getAppPath(), 'dist/renderer')
}

function resolveRequestPath(pathname: string): string {
  if (pathname === '/' || pathname.length === 0) {
    return '/index.html'
  }

  if (pathname.startsWith(APP_ASSET_PATH_PREFIX) || extname(pathname)) {
    return pathname
  }

  return '/index.html'
}

export function getAppEntryUrl(): string {
  return APP_ENTRY_URL
}

export function registerAppProtocol(): void {
  protocol.handle(APP_SCHEME, (request) => {
    const url = new URL(request.url)

    if (url.host !== APP_HOST) {
      return new Response('Not Found', { status: 404 })
    }

    const rendererDistPath = getRendererDistPath()
    const requestedPath = resolveRequestPath(decodeURIComponent(url.pathname))
    const filePath = resolve(rendererDistPath, `.${requestedPath}`)
    const relativePath = relative(rendererDistPath, filePath)
    const isSafePath =
      relativePath.length > 0 && !relativePath.startsWith('..') && !isAbsolute(relativePath)

    if (!isSafePath) {
      return new Response('Bad Request', { status: 400 })
    }

    const fallbackPath = resolve(rendererDistPath, 'index.html')
    const pathToServe = existsSync(filePath) ? filePath : fallbackPath

    if (!existsSync(pathToServe)) {
      return new Response('Renderer bundle not found', { status: 404 })
    }

    return net.fetch(pathToFileURL(path.normalize(pathToServe)).toString())
  })
}
