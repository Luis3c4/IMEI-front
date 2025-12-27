// src/router/routes.tsx
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import App from '../App'
import { LoginPage } from '@/pages/LoginPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Ruta pública: login
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// Ruta protegida: home{}
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <App />
    </ProtectedRoute>
  ),
})
