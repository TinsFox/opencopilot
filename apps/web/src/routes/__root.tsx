import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

function RootLayout(): React.JSX.Element {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-zinc-900">
            OpenCopilot
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Home
            </Link>
            <Link
              to="/components"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Components
            </Link>
            <Link to="/about" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              About
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout
})
