"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { handleSessionExpired, isTokenExpired } from "@/utils/session-handler"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthGuard({ children, requireAuth = true, redirectTo = "/" }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificar inmediatamente si el token está expirado
    if (requireAuth && typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")

      // Si no hay token, redirigir a session-expired
      if (!token) {
        console.log("🚫 No hay token - Redirigiendo a session-expired")
        handleSessionExpired()
        return
      }

      // Si hay token, verificar si está expirado
      if (isTokenExpired(token)) {
        console.log("⏰ Token expirado - Redirigiendo a session-expired")
        handleSessionExpired()
        return
      }
    }

    // No hacer nada más mientras está cargando
    if (isLoading) return

    console.log("🛡️ AuthGuard - Estado:", {
      isAuthenticated,
      requireAuth,
      pathname,
      user: user?.mail,
    })

    // Si requiere autenticación pero no está autenticado
    if (requireAuth && !isAuthenticated) {
      console.log("🚫 Acceso denegado - Redirigiendo a sesión expirada")
      handleSessionExpired()
      return
    }

    // Si no requiere autenticación pero está autenticado (ej: página de login)
    if (!requireAuth && isAuthenticated) {
      console.log("✅ Usuario ya autenticado - Redirigiendo al dashboard")
      const userRole = user?.rol === "SUPER_USER" ? "ADMIN" : "OPERADOR"
      router.push(`/dashboard?role=${userRole}`)
      return
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname, user])

  // Mostrar loader mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si requiere autenticación pero no está autenticado, no mostrar nada (se está redirigiendo)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600" />
          <p className="text-slate-600 dark:text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si no requiere autenticación pero está autenticado, no mostrar nada (se está redirigiendo)
  if (!requireAuth && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-slate-600 dark:text-slate-400">Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  // Mostrar el contenido si todo está bien
  return <>{children}</>
}
