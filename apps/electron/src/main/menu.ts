import path from 'node:path'

import type { MenuItemConstructorOptions } from 'electron'
import { app, Menu, shell } from 'electron'

import { getDatabaseFilePath } from './db'
import { checkForUpdates } from './updater'

export function createAppMenu(): void {
  app.setAboutPanelOptions({
    applicationName: 'OpenCopilot',
  })

  const template: MenuItemConstructorOptions[] = [
    ...(process.platform === 'darwin'
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: 'About OpenCopilot',
                role: 'about',
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              {
                label: 'Check for Updates',
                click: () => {
                  void checkForUpdates()
                },
              },
              { type: 'separator' },
              { role: 'quit' },
            ],
          } satisfies MenuItemConstructorOptions,
        ]
      : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    {
      label: 'Debug',
      submenu: [
        {
          label: 'Open Database Folder',
          click: () => {
            shell.openPath(path.dirname(getDatabaseFilePath()))
          },
        },
      ],
    },
    { role: 'windowMenu' },
    ...(process.platform === 'darwin'
      ? [{ role: 'help' as const }]
      : [
          {
            role: 'help' as const,
            submenu: [
              {
                label: 'About OpenCopilot',
                role: 'about',
              },
              {
                label: 'Check for Updates',
                click: () => {
                  void checkForUpdates()
                },
              },
            ],
          } satisfies MenuItemConstructorOptions,
        ]),
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
