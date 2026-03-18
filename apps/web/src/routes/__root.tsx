import { createRootRoute, Outlet } from '@tanstack/react-router'

function RootLayout(): React.JSX.Element {
  return <Outlet />
}

export const Route = createRootRoute({
  component: RootLayout
})
