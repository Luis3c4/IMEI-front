// src/router/route-definitions.ts
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import App from '../App'
import IMEICheck from '@/pages/IMEICheck'
import LoginPage from '@/pages/LoginPage'
import Factura from '@/pages/Recibo'
import Inventario from '@/pages/Inventario'
import Registro from '@/pages/Registro'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import Clientes from '@/pages/Clientes'
import { KanbanBoard } from '@/pages/Board'
import Historial from '@/pages/Historial'

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

export const InventarioRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'inventario',
  component: Inventario,
})

// Ruta protegida: IMEI Check (predeterminada después de login)
export const imeiCheckRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'imei-check',
  component: IMEICheck,
})

export const registroRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'registro',
  component: Registro,
})

export const clientesRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'clientes',
  component: Clientes,
})

export const boardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'board',
  component: KanbanBoard,
})

export const historialRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'historial',
  component: Historial,
})

// Ruta protegida: home (fallback)
export const indexRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/',
  component: App,
})
