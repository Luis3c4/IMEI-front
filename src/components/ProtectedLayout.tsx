import { Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppSidebar } from '@/components/navbar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { useHeaderInfo } from '@/hooks/useHeaderInfo'

export const ProtectedLayout = () => {
  const { user, logout } = useAuth()
  const headerInfo = useHeaderInfo()

  const handleLoginClick = () => {
    // Redirect to login or open login modal
    window.location.href = '/login'
  }

  const handleUserClick = () => {
    logout()
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header 
            user={user ? { name: user.name } : null}
            onLoginClick={handleLoginClick}
            onUserClick={handleUserClick}
            title={headerInfo.title}
            description={headerInfo.description}
          />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
