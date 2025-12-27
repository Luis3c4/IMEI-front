import { createContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (name: string, email: string, password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica si hay usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Permitir login de demo con admin/admin
      if (email === 'admin@gmail.com' && password === 'admin') {
        const userData = { id: '1', email: 'admin', name: 'Administrador' }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', 'demo-token-admin')
        return
      }

      // Llamada real a tu API/Supabase
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Credenciales inválidas')

      const data = await response.json()
      const userData = { id: data.id, email: data.email, name: data.name }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', data.token) // Guarda el token para requests
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: Reemplazar con llamada real a tu API/Supabase
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) throw new Error('Error al registrarse')

      const data = await response.json()
      const userData = { id: data.id, email: data.email, name: data.name }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', data.token)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider
      value={{ 
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
