import { createFileRoute } from '@tanstack/react-router'

import { ChatHomePage } from '../features/chat-home'

export const Route = createFileRoute('/')({
  component: ChatHomePage,
})
