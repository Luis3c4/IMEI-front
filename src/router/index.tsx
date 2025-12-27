// src/router/index.tsx
import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './root'
import { indexRoute, loginRoute } from './routes'

const routeTree = rootRoute.addChildren([loginRoute, indexRoute])

export const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
