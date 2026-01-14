// src/router/route-definitions.ts
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import App from '../App'
import IMEICheck from '@/pages/IMEICheck'
import LoginPage from '@/pages/LoginPage'
import Factura from '@/pages/Factura'
import { ProtectedLayout } from '@/components/ProtectedLayout'

// Ruta layout protegida con shell (sidebar) compartida
export const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected-layout',
  component: ProtectedLayout,
})

// Ruta pública: login
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: LoginPage,
})

export const FacturaRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'factura',
  component: Factura,
})

// Ruta protegida: IMEI Check (predeterminada después de login)
export const imeiCheckRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'imei-check',
  component: IMEICheck,
})

// Ruta protegida: home (fallback)
export const indexRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/',
  component: App,
})
