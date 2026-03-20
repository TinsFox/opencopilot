import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Avatar, Button, Card, Chip } from '@heroui/react'

export const Route = createFileRoute('/about')({
  component: AboutPage
})

const principles = [
  {
    eyebrow: 'Operate locally',
    title: 'Keep the interface close to the machine.',
    description:
      'OpenCopilot is shaped for people who want the speed of a native shell with a calmer, more legible workspace around it.'
  },
  {
    eyebrow: 'Cut ceremony',
    title: 'Focus on action instead of setup.',
    description:
      'The product trims away unnecessary screens and routes attention toward the exact state of the desktop runtime, updates, and project context.'
  },
  {
    eyebrow: 'Design for trust',
    title: 'Make system status readable at a glance.',
    description:
      'We use strong hierarchy, restrained components, and transparent status language so the renderer feels dependable instead of ornamental.'
  }
] as const

const timeline = [
  { year: 'Foundation', detail: 'Electron shell, preload bridge, and renderer routes live in one monorepo with shared protocol contracts.' },
  { year: 'Interface', detail: 'HeroUI components provide the structural vocabulary while Tailwind v4 handles the atmosphere and rhythm.' },
  { year: 'Today', detail: 'The desktop surface is evolving into a clearer command center for local work, updates, and app-level system feedback.' }
] as const

const team = [
  {
    name: 'Product Surface',
    role: 'Renderer experience',
    initials: 'PS',
    description: 'Composes the route structure, typography, and interaction layers that give the desktop client its voice.'
  },
  {
    name: 'Bridge Layer',
    role: 'Desktop wiring',
    initials: 'BL',
    description: 'Owns the preload contract and the boundaries between the renderer, host process, and local protocol entry points.'
  },
  {
    name: 'Release Loop',
    role: 'Update orchestration',
    initials: 'RL',
    description: 'Keeps update status, download feedback, and restart moments visible so release mechanics feel controlled.'
  }
] as const

function AboutPage(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(158,90,34,0.16),_transparent_24%),radial-gradient(circle_at_82%_18%,_rgba(98,122,148,0.18),_transparent_22%),linear-gradient(180deg,_oklch(0.985_0.012_80)_0%,_oklch(0.955_0.018_75)_48%,_oklch(0.92_0.025_55)_100%)] text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-600 transition-colors hover:text-zinc-950">
            OpenCopilot
          </Link>
          <Link to="/" className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950">
            Back to workspace →
          </Link>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,rgba(255,250,242,0.94),rgba(243,229,208,0.9))] shadow-[0_32px_90px_-40px_rgba(74,44,19,0.5)]">
            <Card.Content className="relative flex h-full flex-col gap-8 p-6 sm:p-8 lg:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(124,74,33,0.22),transparent_72%)]"
              />

              <div className="relative flex flex-wrap items-center gap-3">
                <Chip variant="soft" color="accent" className="border border-black/5 bg-white/65">
                  <Chip.Label>About</Chip.Label>
                </Chip>
                <Chip variant="soft" className="border border-black/5 bg-white/55">
                  <Chip.Label>HeroUI editorial layout</Chip.Label>
                </Chip>
              </div>

              <div className="relative max-w-4xl space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">Who we are</p>
                <h1
                  className="text-4xl leading-none font-semibold tracking-[-0.05em] text-zinc-950 sm:text-5xl lg:text-7xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  A desktop copilot should feel warm, explicit, and close to the work.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-zinc-700 sm:text-lg">
                  OpenCopilot brings local runtime status, update mechanics, and route-driven UI into one composed desktop surface. The goal is not spectacle. It is calm control with enough character to feel human.
                </p>
              </div>

              <div className="relative grid gap-4 sm:grid-cols-3">
                <StatBlock value="Local-first" label="Desktop posture" />
                <StatBlock value="HeroUI v3" label="Component system" />
                <StatBlock value="Monorepo" label="Operating model" />
              </div>
            </Card.Content>
          </Card>

          <Card className="border-none bg-[linear-gradient(180deg,rgba(42,30,20,0.95),rgba(68,46,30,0.92))] text-stone-50 shadow-[0_24px_80px_-40px_rgba(38,24,16,0.8)]">
            <Card.Header className="flex-col items-start gap-3 p-6 sm:p-7">
              <Card.Description className="text-stone-300">What guides the product</Card.Description>
              <Card.Title
                className="text-3xl font-semibold tracking-[-0.04em] text-stone-50"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Three design promises.
              </Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4 p-6 pt-0 sm:p-7 sm:pt-0">
              {principles.map((item) => (
                <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">{item.eyebrow}</p>
                  <p className="mt-3 text-lg font-semibold text-stone-50">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-300">{item.description}</p>
                </div>
              ))}
            </Card.Content>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card className="border-none bg-white/74 shadow-[0_18px_50px_-32px_rgba(24,24,27,0.38)] backdrop-blur">
            <Card.Header className="p-6 pb-4 sm:p-7 sm:pb-5">
              <Card.Description className="text-zinc-500">Timeline</Card.Description>
              <Card.Title
                className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Built as a compact operating system for product clarity.
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4 p-6 pt-0 sm:p-7 sm:pt-0">
              {timeline.map((item) => (
                <div key={item.year} className="grid gap-2 rounded-[1.6rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,252,247,0.92),rgba(245,238,229,0.78))] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">{item.year}</p>
                  <p className="text-sm leading-7 text-zinc-700">{item.detail}</p>
                </div>
              ))}
            </Card.Content>
          </Card>

          <Card className="overflow-hidden border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(252,245,236,0.88))] shadow-[0_18px_50px_-32px_rgba(24,24,27,0.38)]">
            <Card.Header className="flex-col items-start gap-3 p-6 pb-4 sm:p-7 sm:pb-5">
              <Card.Description className="text-zinc-500">Team shape</Card.Description>
              <Card.Title
                className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Three layers, one surface.
              </Card.Title>
            </Card.Header>
            <Card.Content className="grid gap-4 p-6 pt-0 sm:p-7 sm:pt-0">
              {team.map((member) => (
                <div key={member.name} className="grid gap-4 rounded-[1.8rem] border border-black/6 bg-white/72 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <Avatar className="h-14 w-14 bg-[oklch(0.74_0.07_65)] text-base font-bold text-zinc-900">
                    <Avatar.Fallback>{member.initials}</Avatar.Fallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold text-zinc-950">{member.name}</p>
                    <p className="text-sm font-medium text-zinc-500">{member.role}</p>
                    <p className="mt-2 text-sm leading-7 text-zinc-700">{member.description}</p>
                  </div>
                  <Chip variant="soft" className="justify-self-start border border-black/5 bg-[rgba(214,115,61,0.12)] text-zinc-700 sm:justify-self-end">
                    <Chip.Label>Active</Chip.Label>
                  </Chip>
                </div>
              ))}
            </Card.Content>
          </Card>
        </section>

        <section>
          <Card className="border-none bg-[linear-gradient(90deg,rgba(48,32,20,0.94),rgba(96,63,39,0.92))] text-stone-50 shadow-[0_24px_80px_-45px_rgba(38,24,16,0.8)]">
            <Card.Content className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone-300">Next chapter</p>
                <h2
                  className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-50 sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Building a desktop interface that explains itself before you ask.
                </h2>
                <p className="mt-4 text-sm leading-7 text-stone-300 sm:text-base">
                  The About page is a small signal of that direction: structured information, strong rhythm, and components that support the story instead of flattening it.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onPress={() => navigate({ to: '/' })}
                  className="bg-[oklch(0.78_0.08_68)] px-6 font-semibold text-zinc-950"
                >
                  Return home
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onPress={() => navigate({ to: '/' })}
                  className="border border-white/15 bg-white/6 px-6 font-semibold text-stone-50"
                >
                  Explore desktop shell
                </Button>
              </div>
            </Card.Content>
          </Card>
        </section>
      </div>
    </main>
  )
}

function StatBlock(props: { value: string; label: string }): React.JSX.Element {
  return (
    <div className="rounded-[1.8rem] border border-black/6 bg-white/58 px-5 py-5 backdrop-blur">
      <p className="text-xl font-semibold tracking-[-0.03em] text-zinc-950">{props.value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{props.label}</p>
    </div>
  )
}
