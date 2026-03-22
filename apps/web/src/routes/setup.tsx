import { createFileRoute } from '@tanstack/react-router'

import { ProviderSetupPage } from '../features/provider-setup-page'

export const Route = createFileRoute('/setup')({
  component: ProviderSetupPage,
})
