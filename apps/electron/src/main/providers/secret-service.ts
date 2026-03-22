import { safeStorage } from 'electron'

function assertEncryptionAvailable(): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('当前系统不支持安全加密存储。')
  }
}

export function encryptSecret(secret: string): string {
  assertEncryptionAvailable()

  return safeStorage.encryptString(secret).toString('base64')
}

export function decryptSecret(encryptedSecret: string): string {
  assertEncryptionAvailable()

  return safeStorage.decryptString(Buffer.from(encryptedSecret, 'base64'))
}
