// src/router/index.tsx
import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './root'
import { boardRoute, clientesRoute, FacturaRoute, imeiCheckRoute, indexRoute, InventarioRoute, loginRoute, protectedLayoutRoute, historialRoute, registroRoute } from './route-definitions'

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedLayoutRoute.addChildren([indexRoute, imeiCheckRoute, FacturaRoute, InventarioRoute, registroRoute, clientesRoute, boardRoute, historialRoute]),
])

export const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
