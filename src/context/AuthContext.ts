import { createContext } from 'react'

export interface User {
  id: string
  email: string
  name: string
}

export interface SignupResponse {
  success: boolean
  message: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (name: string, email: string, password: string) => Promise<SignupResponse>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
