// src/router/index.tsx
import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './root'
import { FacturaRoute, imeiCheckRoute, indexRoute, InventarioRoute, loginRoute, protectedLayoutRoute, registroRoute } from './route-definitions'

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedLayoutRoute.addChildren([indexRoute, imeiCheckRoute, FacturaRoute, InventarioRoute, registroRoute]),
])

export const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
