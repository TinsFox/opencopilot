import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button, Chip, Surface, TextArea, Tooltip } from '@heroui/react'
import {
  ArrowUp,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Sparkles
} from 'lucide-react'
import type { ChatMessage } from '@opencopilot/shared/bridge'

export const Route = createFileRoute('/')({
  component: HomePage
})

const starterPrompts = [
  'Help me plan my next project',
  'Summarize a long document',
  'Write and refine content',
  'Debug a technical problem'
] as const

const recentChats = [
  'Launch strategy notes',
  'Refactor review',
  'Marketing copy draft',
  'Desktop onboarding'
] as const

function HomePage(): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const setStreamingAssistantMessage = (content: string): void => {
    setMessages((currentMessages) => {
      const nextMessages = [...currentMessages]
      const lastMessage = nextMessages.at(-1)

      if (lastMessage?.role === 'assistant') {
        nextMessages[nextMessages.length - 1] = {
          ...lastMessage,
          content
        }
        return nextMessages
      }

      return [...nextMessages, { role: 'assistant', content }]
    })
  }

  const appendStreamingAssistantDelta = (textDelta: string): void => {
    setMessages((currentMessages) => {
      const nextMessages = [...currentMessages]
      const lastMessage = nextMessages.at(-1)

      if (lastMessage?.role === 'assistant') {
        nextMessages[nextMessages.length - 1] = {
          ...lastMessage,
          content: `${lastMessage.content}${textDelta}`
        }
        return nextMessages
      }

      return [...nextMessages, { role: 'assistant', content: textDelta }]
    })
  }

  const handleSend = async (): Promise<void> => {
    const previousMessages = messages
    const content = prompt.trim()

    if (!content || isSending) {
      return
    }

    const nextMessages: ChatMessage[] = [...previousMessages, { role: 'user', content }]
    setPrompt('')
    setErrorMessage('')
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setIsSending(true)
    console.info('[chat] renderer sending message', {
      messageCount: nextMessages.length,
      contentLength: content.length
    })

    try {
      await window.opencopilot.chat.streamMessage(
        {
          messages: nextMessages
        },
        {
          onDelta: (event) => {
            appendStreamingAssistantDelta(event.textDelta)
          },
          onDone: (event) => {
            console.info('[chat] renderer stream completed', {
              outputLength: event.text.length
            })
            setStreamingAssistantMessage(event.text)
            setIsSending(false)
          },
          onError: (event) => {
            console.error('[chat] renderer stream failed', event.error)
            setMessages(previousMessages)
            setErrorMessage(event.error)
            setIsSending(false)
          }
        }
      )
    } catch (error) {
      console.error('[chat] renderer request failed', error)
      setMessages(previousMessages)
      setErrorMessage(error instanceof Error ? error.message : 'Request failed.')
      setIsSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full gap-3">
        {isSidebarCollapsed ? null : (
          <aside className="hidden w-72 shrink-0 lg:block">
            <Surface
              variant="default"
              className="flex h-full min-h-[calc(100vh-1.5rem)] flex-col rounded-md p-3 bg-transparent"
            >
              <div className="flex items-center justify-between gap-2">
                <Button
                  className="flex-1 justify-start"
                  onPress={() => {
                    setPrompt('')
                    setMessages([])
                    setErrorMessage('')
                  }}
                >
                  <MessageSquarePlus size={18} />
                  New chat
                </Button>
              </div>

              <div className="mt-5 space-y-1">
                {recentChats.map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className="w-full justify-start"
                    onPress={() => setPrompt(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </Surface>
          </aside>
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <Surface
            variant="default"
            className="flex min-h-[calc(100vh-0rem)] flex-col rounded-md px-4 py-3 sm:px-6 sm:py-4"
          >
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tooltip delay={0}>
                  <Tooltip.Trigger
                    aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    <Button
                      isIconOnly
                      variant="tertiary"
                      aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                      onPress={() => setSidebarCollapsed((current) => !current)}
                    >
                      {isSidebarCollapsed ? (
                        <PanelLeftOpen size={18} />
                      ) : (
                        <PanelLeftClose size={18} />
                      )}
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    <p>{isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
                  </Tooltip.Content>
                </Tooltip>
              </div>
            </header>

            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center pb-8 pt-10 sm:pb-10">
              {messages.length === 0 ? (
                <>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted">How can I help?</p>
                    <h1
                      className="mt-4 text-[clamp(2.5rem,7vw,4.75rem)] font-semibold tracking-tight"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Start a conversation.
                    </h1>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {starterPrompts.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPrompt(item)}
                        className="rounded-2xl border border-divider bg-content1 px-4 py-4 text-left text-sm text-foreground transition hover:bg-content2"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mb-6 space-y-4">
                  {messages.map((message, index) => (
                    <Surface
                      key={`${message.role}-${index}`}
                      variant="default"
                      className={`rounded-3xl border border-divider px-5 py-4 ${
                        message.role === 'user' ? 'ml-auto max-w-3xl bg-content2' : 'max-w-3xl'
                      }`}
                    >
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                        {message.role}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                        {message.content}
                      </p>
                    </Surface>
                  ))}

                  {errorMessage ? (
                    <p className="text-sm text-danger-600">{errorMessage}</p>
                  ) : null}
                </div>
              )}

              <div className="mt-8">
                <Surface variant="default" className="rounded-[2rem] border border-divider p-3">
                  <TextArea
                    aria-label="Message OpenCopilot"
                    variant="secondary"
                    rows={4}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Message OpenCopilot..."
                    fullWidth
                    className="w-full"
                    onKeyDown={(event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                        event.preventDefault()
                        void handleSend()
                      }
                    }}
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="tertiary" size="sm">
                        <Paperclip size={16} />
                        Attach
                      </Button>
                      <Chip variant="soft">
                        <Chip.Label>
                          <span className="inline-flex items-center gap-1">
                            <Sparkles size={14} />
                            AI SDK + Doubao
                          </span>
                        </Chip.Label>
                      </Chip>
                    </div>

                    <Button
                      isIconOnly
                      aria-label="Send message"
                      onPress={() => void handleSend()}
                      isDisabled={!prompt.trim() || isSending}
                    >
                      <ArrowUp size={16} />
                    </Button>
                  </div>
                </Surface>
              </div>

              <p className="mt-4 text-center text-xs text-muted">
                OpenCopilot can make mistakes. Check important information. Press Ctrl or Cmd + Enter
                to send.
              </p>
            </div>
          </Surface>
        </section>
      </div>
    </main>
  )
}
