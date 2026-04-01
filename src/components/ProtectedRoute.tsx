import {type ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'admin' | 'user'
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}
