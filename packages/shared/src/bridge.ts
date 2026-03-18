export type RuntimeVersions = Readonly<Record<string, string | undefined>> & {
  chrome: string
  electron: string
  node: string
}

export interface RendererElectronApi {
  process: {
    versions: RuntimeVersions
  }
}
