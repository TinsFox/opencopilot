import type {
  ChatMessage,
  ChatTarget,
  ProviderSummary,
} from '@opencopilot/shared/bridge'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowUp,
  ChevronDown,
  CreditCardIcon,
  FileTextIcon,
  FolderOpen,
  HardDrive,
  HelpCircleIcon,
  KeyboardIcon,
  LanguagesIcon,
  LogOutIcon,
  Mic,
  Minus,
  PanelLeft,
  Plus,
  Search,
  Settings,
  SettingsIcon,
  ShieldIcon,
  Sparkles,
  UserIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

import { getTemplate } from './provider-config'

const SETUP_DISMISSED_KEY = 'opencopilot.setup.dismissed'

type ThreadItem = {
  title: string
  age: string
  added?: string
  removed?: string
}

type ThreadGroup = {
  name: string
  items: ThreadItem[]
  showMore?: boolean
}

const threadGroups: ThreadGroup[] = [
  {
    name: 'BetterCapture',
    items: [{ title: 'Build native macOS capture...', age: '2w' }],
  },
  {
    name: 'lobehub',
    items: [{ title: 'There is a bun run dev:d...', age: '3w' }],
  },
  {
    name: 'ai-review',
    items: [
      { title: 'Check whether the repo leaks...', age: '20h' },
      { title: 'Confirm messages with ai_gen...', age: '1w' },
      { title: 'Fetch merge request list', age: '2w' },
      { title: 'Polish Reviews login page...', age: '2w' },
      { title: 'Audit with impeccable skill', age: '2w' },
      { title: 'Redesign the landing page...', age: '2w' },
      { title: 'Fix executor cleanup logic...', age: '2w' },
      { title: 'Track current diff changes...', age: '2w' },
      { title: 'Use BullMQ for Redis queue...', age: '2w' },
      { title: 'Update Claude runtime prompt...', age: '2w' },
    ],
    showMore: true,
  },
  {
    name: 'opencopilot',
    items: [
      {
        title: 'Redesign the two main pages...',
        added: '+943',
        removed: '-504',
        age: '5h',
      },
      {
        title: 'Redo all pages with shadcn...',
        added: '+624',
        removed: '-502',
        age: '5h',
      },
      { title: 'Fix tooltip import issue...', age: '6h' },
      {
        title: 'Move the model switcher into...',
        added: '+1',
        removed: '-11',
        age: '6h',
      },
      {
        title: 'Replace setup page with HeroUI...',
        added: '+26',
        removed: '-33',
        age: '6h',
      },
      {
        title: 'Add management panel doc...',
        added: '+159',
        removed: '-153',
        age: '6h',
      },
      {
        title: 'Add LLM provider creation...',
        added: '+146',
        removed: '-28',
        age: '18h',
      },
      {
        title: 'Add Electron debug support...',
        added: '+47',
        removed: '-16',
        age: '7h',
      },
    ],
  },
]

function buildTargetOptions(providers: ProviderSummary[]): Array<{
  provider: ProviderSummary
  modelId: string
  modelName: string
}> {
  return providers.flatMap((provider) => {
    if (!provider.enabled) {
      return []
    }

    return provider.models
      .filter((model) => model.enabled)
      .map((model) => ({
        provider,
        modelId: model.id,
        modelName: model.name,
      }))
  })
}

function getDefaultTarget(providers: ProviderSummary[]): ChatTarget | null {
  const option = buildTargetOptions(providers)[0]

  if (!option) {
    return null
  }

  return {
    providerId: option.provider.id,
    modelId: option.modelId,
  }
}

export function ChatHomePage(): React.JSX.Element {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [providers, setProviders] = useState<ProviderSummary[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [hasProviders, setHasProviders] = useState(false)
  const [hasEnabledModels, setHasEnabledModels] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<ChatTarget | null>(null)

  const targetOptions = useMemo(
    () => buildTargetOptions(providers),
    [providers],
  )

  const refreshConfiguration = async (): Promise<void> => {
    setIsLoadingConfig(true)

    try {
      const [bootstrapState, nextProviders] = await Promise.all([
        window.opencopilot.providers.getBootstrapState(),
        window.opencopilot.providers.listProviders(),
      ])

      setHasProviders(bootstrapState.hasProviders)
      setHasEnabledModels(bootstrapState.hasEnabledModels)
      setProviders(nextProviders)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load model configuration.',
      )
    } finally {
      setIsLoadingConfig(false)
    }
  }

  useEffect(() => {
    void refreshConfiguration()
  }, [])

  useEffect(() => {
    if (isLoadingConfig) {
      return
    }

    const isSetupDismissed =
      window.localStorage.getItem(SETUP_DISMISSED_KEY) === '1'

    if (!hasProviders && !isSetupDismissed) {
      void navigate({ to: '/setup' })
    }
  }, [hasProviders, isLoadingConfig, navigate])

  useEffect(() => {
    if (!selectedTarget) {
      setSelectedTarget(getDefaultTarget(providers))
      return
    }

    const selectionStillExists = targetOptions.some(
      (option) =>
        option.provider.id === selectedTarget.providerId &&
        option.modelId === selectedTarget.modelId,
    )

    if (!selectionStillExists) {
      setSelectedTarget(getDefaultTarget(providers))
    }
  }, [providers, selectedTarget, targetOptions])

  const targetPickerOptions = useMemo(
    () =>
      targetOptions.map((option) => ({
        providerId: option.provider.id,
        modelId: option.modelId,
        providerName: option.provider.name,
        modelName: option.modelName,
        vendorLabel: getTemplate(option.provider.vendor).label,
      })),
    [targetOptions],
  )

  const setStreamingAssistantMessage = (content: string): void => {
    setMessages((currentMessages) => {
      const nextMessages = [...currentMessages]
      const lastMessage = nextMessages.at(-1)

      if (lastMessage?.role === 'assistant') {
        nextMessages[nextMessages.length - 1] = {
          ...lastMessage,
          content,
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
          content: `${lastMessage.content}${textDelta}`,
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

    if (!selectedTarget) {
      setErrorMessage(
        'There is no active model yet. Finish setup or enable a saved model first.',
      )
      return
    }

    const nextMessages: ChatMessage[] = [
      ...previousMessages,
      { role: 'user', content },
    ]

    setPrompt('')
    setErrorMessage('')
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setIsSending(true)

    try {
      await window.opencopilot.chat.streamMessage(
        {
          messages: nextMessages,
          target: selectedTarget,
        },
        {
          onDelta: (event) => {
            appendStreamingAssistantDelta(event.textDelta)
          },
          onDone: (event) => {
            setStreamingAssistantMessage(event.text)
            setIsSending(false)
          },
          onError: (event) => {
            setMessages(previousMessages)
            setErrorMessage(event.error)
            setIsSending(false)
          },
        },
      )
    } catch (error) {
      setMessages(previousMessages)
      setErrorMessage(
        error instanceof Error ? error.message : 'Request failed.',
      )
      setIsSending(false)
    }
  }

  const clearConversation = (): void => {
    setPrompt('')
    setMessages([])
    setErrorMessage('')
  }

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 py-4 text-[#3b3a39]">
      {/* <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 invisible">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full text-[#9a9895]"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full text-[#c4c1bd]"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div> */}

      <div className="space-y-1">
        <Button
          variant="ghost"
          className="h-9 w-full justify-start rounded-xl px-3 text-[#42413f]"
          onClick={() => {
            clearConversation()
            setSidebarOpen(false)
          }}
        >
          <Plus data-icon="inline-start" />
          New thread
        </Button>
        <Button
          variant="ghost"
          className="h-9 w-full justify-start rounded-xl px-3 text-[#6b6965]"
        >
          <Search data-icon="inline-start" />
          Automations
        </Button>
        <Button
          variant="ghost"
          className="h-9 w-full justify-start rounded-xl px-3 text-[#6b6965]"
        >
          <Sparkles data-icon="inline-start" />
          Skills
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-between px-2 text-xs font-medium tracking-[0.12em] text-[#9a9895] uppercase">
        <span>Threads</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full text-[#8e8b87]"
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full text-[#8e8b87]"
          >
            <Minus className="size-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="mt-3 min-h-0 flex-1 space-y-5 ">
        {threadGroups.map((group) => (
          <section key={group.name} className="space-y-2">
            <div className="flex items-center gap-2 px-2 text-sm text-[#4e4c49]">
              <FolderOpen className="size-4 text-[#6b6965]" />
              <span className="font-medium">{group.name}</span>
            </div>

            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={`${group.name}-${item.title}`}
                  type="button"
                  className="flex w-full items-start justify-between gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-white/55"
                  onClick={() => {
                    setPrompt(item.title)
                    setSidebarOpen(false)
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm leading-6 text-[#2f2d2b]">
                      {item.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {group.showMore ? (
              <Button
                variant="ghost"
                className="h-8 justify-start rounded-xl px-2 text-[#8d8a85]"
              >
                Show more
              </Button>
            ) : null}
          </section>
        ))}
      </ScrollArea>

      <div className="mt-4 pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 w-full justify-start px-3 text-[#6b6965]"
              onClick={() => {
                void navigate({ to: '/setup' })
                setSidebarOpen(false)
              }}
            >
              <Settings data-icon="inline-start" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserIcon />
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SettingsIcon />
                  Settings
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <KeyboardIcon />
                        Keyboard Shortcuts
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LanguagesIcon />
                        Language
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <ShieldIcon />
                        Privacy & Security
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HelpCircleIcon />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileTextIcon />
                Documentation
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <LogOutIcon />
                Sign Out
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <main className="h-dvh overflow-hidden text-foreground">
      <div className="grid h-full w-full overflow-hidden shadow-[0_40px_120px_-52px_rgba(0,0,0,0.7)] lg:grid-cols-[304px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 overflow-hidden lg:block">
          {sidebarContent}
        </aside>

        <section className="relative flex min-h-0 flex-col overflow-hidden border rounded-md">
          <header className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <PanelLeft className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-sm  p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Workspace navigation</SheetTitle>
                    <SheetDescription>
                      Open threads, settings, automations, and skills.
                    </SheetDescription>
                  </SheetHeader>
                  {sidebarContent}
                </SheetContent>
              </Sheet>

              <div className="truncate text-sm font-medium text-[#252321]">
                {messages.length > 0 ? 'Conversation' : 'New thread'}
              </div>
            </div>
          </header>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center px-6 pb-52">
                <div className="flex max-w-xl flex-col items-center text-center">
                  <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-[#2c2925]/15 bg-white/88 shadow-[0_14px_36px_-24px_rgba(0,0,0,0.28)]">
                    <Sparkles className="size-7 text-[#1d1b18]" />
                  </div>

                  <h1 className="text-[clamp(2rem,4vw,3.15rem)] font-semibold tracking-[-0.05em] text-[#1e1b18]">
                    Let&apos;s chat
                  </h1>
                </div>
              </div>
            ) : (
              <Conversation className="h-full">
                <ConversationContent className="mx-auto flex w-full max-w-3xl gap-6 px-4 pb-72 pt-8 sm:px-8">
                  {messages.map((message, index) => (
                    <Message
                      key={`${message.role}-${index}`}
                      from={message.role}
                      className="max-w-none gap-3"
                    >
                      <MessageContent
                        className={cn(
                          'max-w-[min(48rem,100%)] text-[15px] leading-7 ',
                          message.role === 'assistant'
                            ? 'rounded-[22px] border border-[#e7e4df] bg-white/92 px-5 py-4 text-[#2a2825]'
                            : 'group-[.is-user]:rounded-[22px] group-[.is-user]:bg-[#1f1d1b] group-[.is-user]:px-5 group-[.is-user]:py-4 group-[.is-user]:text-[#f8f7f4]',
                        )}
                      >
                        <MessageResponse>
                          {message.content || (isSending ? 'Thinking...' : '')}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
                <ConversationScrollButton className="bottom-64" />
              </Conversation>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 " />

            <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-8 sm:pb-5">
              <div className="mx-auto w-full max-w-3xl">
                {errorMessage ? (
                  <Alert
                    variant="destructive"
                    className="mb-3 rounded-[20px] border-destructive/25 bg-white/95"
                  >
                    <AlertTitle>Request failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                ) : null}

                {!hasEnabledModels ? (
                  <div className="mb-3 rounded-[18px] border px-4 py-3 text-sm text-[#8a4d22]">
                    Model setup is required before you can send a message.
                    <button
                      type="button"
                      className="ml-2 font-medium underline underline-offset-4"
                      onClick={() => {
                        void navigate({ to: '/setup' })
                      }}
                    >
                      Open settings
                    </button>
                  </div>
                ) : null}

                <div className="rounded-[24px] border ">
                  <InputGroup className="min-h-32.5 rounded-[24px] border-0 bg-transparent shadow-none">
                    <InputGroupTextarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Ask OpenCopilot anything, @ to add files, / for commands, $ for skills"
                      rows={4}
                      disabled={!hasEnabledModels}
                      className="min-h-23 px-4 pt-4 pb-2 text-[15px] leading-7 text-[#2f2d2b] placeholder:text-[#b6b2ac]"
                      onKeyDown={(event) => {
                        if (
                          (event.metaKey || event.ctrlKey) &&
                          event.key === 'Enter'
                        ) {
                          event.preventDefault()
                          handleSend()
                        }
                      }}
                    />

                    <InputGroupAddon
                      align="block-end"
                      className="border-t px-4"
                    >
                      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-full border border-[#ece9e4] bg-[#faf8f5] text-[#77736d] hover:bg-[#f3f0eb]"
                          >
                            <Plus className="size-4" />
                          </Button>

                          <Select
                            value={
                              selectedTarget
                                ? `${selectedTarget.providerId}:${selectedTarget.modelId}`
                                : undefined
                            }
                            onValueChange={(value) => {
                              const [providerId, modelId] = value.split(':')
                              if (!providerId || !modelId) {
                                return
                              }
                              setSelectedTarget({ providerId, modelId })
                            }}
                            disabled={!hasEnabledModels}
                          >
                            <SelectTrigger className="h-10 rounded-full px-4 border-none">
                              <SelectValue placeholder="Choose model" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectGroup>
                                {targetPickerOptions.map((option) => (
                                  <SelectItem
                                    key={`${option.providerId}:${option.modelId}`}
                                    value={`${option.providerId}:${option.modelId}`}
                                  >
                                    {option.providerName} · {option.modelName}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            className="h-10 rounded-full border px-4 text-[#66635e] hover:bg-[#f3f0eb]"
                          >
                            High
                            <ChevronDown className="size-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-full text-[#908d88]"
                          >
                            <Mic className="size-4" />
                          </Button>
                          <Button
                            size="icon-lg"
                            className="rounded-full bg-[#8e8a84] text-white hover:bg-[#7b7771] disabled:bg-[#d5d1cb] disabled:text-white"
                            onClick={handleSend}
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#8e8b86]">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <HardDrive className="size-3.5" />
                      Local
                      <ChevronDown className="size-3.5" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#f97316]">
                      <Sparkles className="size-3.5" />
                      Full access
                      <ChevronDown className="size-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
