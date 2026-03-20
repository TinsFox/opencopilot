import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button, Card, Chip, Input, Switch, Checkbox } from '@heroui/react'

export const Route = createFileRoute('/components')({
  component: ComponentsShowcasePage
})

function ComponentsShowcasePage(): React.JSX.Element {
  const [inputValue, setInputValue] = useState('')

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-zinc-600 hover:text-zinc-900">
              Home
            </Link>
            <span className="text-zinc-400">/</span>
            <span className="text-zinc-900">Components</span>
          </nav>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900">
            HeroUI Components Showcase
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Explore the components available in HeroUI v3.
          </p>
        </header>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Buttons</h2>
          <Card>
            <Card.Content className="space-y-6 p-6">
              <div className="flex flex-wrap gap-4">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button isDisabled>Disabled</Button>
              </div>
            </Card.Content>
          </Card>
        </section>

        {/* Input Components */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Inputs & Forms</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <Card.Header className="p-6 pb-3">
                <Card.Title>Text Inputs</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4 p-6 pt-0">
                <Input
                  placeholder="Standard input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input disabled placeholder="Disabled input" />
                <Input type="password" placeholder="Password input" />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header className="p-6 pb-3">
                <Card.Title>Form Controls</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-6 p-6 pt-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Checkboxes</label>
                  <div className="space-y-2">
                    <Checkbox>Option 1</Checkbox>
                    <Checkbox>Option 2</Checkbox>
                    <Checkbox isDisabled>Disabled option</Checkbox>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Switches</label>
                  <div className="flex gap-4">
                    <Switch defaultSelected>Notifications On</Switch>
                    <Switch isDisabled>Disabled</Switch>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </section>

        {/* Display Components */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Display Components</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <Card.Header className="p-6 pb-3">
                <Card.Title>Chips</Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-wrap gap-2 p-6 pt-0">
                <Chip>Default</Chip>
                <Chip>Primary</Chip>
                <Chip>Secondary</Chip>
                <Chip>Success</Chip>
                <Chip>Warning</Chip>
                <Chip>Danger</Chip>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header className="p-6 pb-3">
                <Card.Title>Simple Card</Card.Title>
              </Card.Header>
              <Card.Content className="p-6 pt-0">
                <p className="text-zinc-600">
                  This is a simple card with some content. Cards are great for grouping related
                  information together.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">Action</Button>
                  <Button size="sm" variant="ghost">
                    Cancel
                  </Button>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header className="p-6 pb-3">
                <Card.Title>Card with Header</Card.Title>
              </Card.Header>
              <Card.Content className="p-6 pt-0">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-zinc-200 flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">User Name</p>
                    <p className="text-sm text-zinc-500">user@example.com</p>
                    <p className="mt-2 text-sm text-zinc-600">
                      This card demonstrates a common pattern with an avatar and user information.
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-200 pt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">Built with HeroUI v3</p>
            <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              ← Back to home
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
