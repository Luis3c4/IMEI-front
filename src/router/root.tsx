// src/router/root.tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const rootRoute = createRootRoute({
  component: () => (
    <>
      {/* Navbar, Toast global, etc */}
      <Outlet />
    </>
  ),
})
