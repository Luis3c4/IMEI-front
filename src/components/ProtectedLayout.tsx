import { Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppSidebar } from '@/components/navbar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { PageHeader } from '@/components/navbar/page-header'

export const ProtectedLayout = () => {

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <PageHeader />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
