// src/router/root.tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { AppSidebar } from '@/components/navbar/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export const rootRoute = createRootRoute({
  component: () => (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  ),
})
