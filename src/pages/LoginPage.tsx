import { useState } from 'react'
import { Navigate } from '@tanstack/react-router'
import { Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, signup, isAuthenticated } = useAuth()

  // Si ya está autenticado, redirige a home
  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setError('Por favor completa todos los campos')
          setIsLoading(false)
          return
        }
        await signup(name, email, password)
      } else {
        if (!email.trim() || !password.trim()) {
          setError('Por favor ingresa tu email y contraseña')
          setIsLoading(false)
          return
        }
        await login(email, password)
      }

      // El redirect sucede automáticamente después del login exitoso
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
          {/* Contenedor principal */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <img src="/falcon.png" alt="Falcon Logo" className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h1>
              <p className="text-slate-400 text-sm">
                {isSignUp
                  ? 'Únete a nuestra comunidad hoy'
                  : 'Bienvenido de vuelta'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-950 border border-red-900 text-red-300 rounded-lg flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Nombre
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="pl-12 h-12 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-600 focus:ring-blue-600/20 rounded-lg transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-12 h-12 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-600 focus:ring-blue-600/20 rounded-lg transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-12 h-12 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-600 focus:ring-blue-600/20 rounded-lg transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Procesando...
                  </span>
                ) : isSignUp ? (
                  'Crear Cuenta'
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-center text-slate-400 text-sm mb-4">
                {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="w-full px-4 py-3 text-blue-400 hover:text-blue-300 font-semibold rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
              >
                {isSignUp ? 'Inicia sesión aquí' : 'Regístrate aquí'}
              </button>
              <p className="text-center text-slate-500 text-xs mt-4">
                Demo: email: <span className="text-slate-300">admin</span>, contraseña: <span className="text-slate-300">admin</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
