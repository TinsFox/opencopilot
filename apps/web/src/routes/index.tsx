import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Chip, Surface, TextArea } from '@heroui/react'
import { ArrowUp, MessageSquarePlus, PanelLeft, Paperclip, Sparkles } from 'lucide-react'

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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full gap-3 p-3">
        <aside className="hidden w-72 shrink-0 lg:block">
          <Surface
            variant="default"
            className="flex h-full min-h-[calc(100vh-1.5rem)] flex-col rounded-3xl p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <Button className="flex-1 justify-start" onPress={() => setPrompt('')}>
                <MessageSquarePlus size={18} />
                New chat
              </Button>
              <Button isIconOnly variant="tertiary" aria-label="Collapse sidebar">
                <PanelLeft size={18} />
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

            <div className="mt-auto px-2 pb-1">
              <p className="text-sm font-medium text-muted">OpenCopilot</p>
            </div>
          </Surface>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <Surface
            variant="default"
            className="flex min-h-[calc(100vh-1.5rem)] flex-col rounded-3xl px-4 py-3 sm:px-6 sm:py-4"
          >
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="tertiary"
                  className="lg:hidden"
                  aria-label="Open sidebar"
                >
                  <PanelLeft size={18} />
                </Button>
                <Chip variant="soft">
                  <Chip.Label>OpenCopilot</Chip.Label>
                </Chip>
              </div>

              <nav className="flex items-center gap-1">
                <Link
                  to="/components"
                  className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  Components
                </Link>
                <Link
                  to="/about"
                  className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  About
                </Link>
              </nav>
            </header>

            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center pb-8 pt-10 sm:pb-10">
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
                            Smart start
                          </span>
                        </Chip.Label>
                      </Chip>
                    </div>

                    <Button isIconOnly aria-label="Send message">
                      <ArrowUp size={16} />
                    </Button>
                  </div>
                </Surface>
              </div>

              <p className="mt-4 text-center text-xs text-muted">
                OpenCopilot can make mistakes. Check important information.
              </p>
            </div>
          </Surface>
        </section>
      </div>
    </main>
  )
}
