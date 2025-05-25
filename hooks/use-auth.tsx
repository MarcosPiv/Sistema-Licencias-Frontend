"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth-service"
import { isTokenExpired } from "@/utils/session-handler"

interface User {
  id: number
  nombre: string
  apellido: string
  mail: string
  rol: string
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Función para verificar autenticación
  const checkAuth = useCallback((): boolean => {
    try {
      if (typeof window === "undefined") return false

      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.log("🔒 No hay token disponible")
        setUser(null)
        setIsAuthenticated(false)
        return false
      }

      // Verificar si el token está expirado
      if (isTokenExpired(token)) {
        console.log("⏰ Token expirado")
        setUser(null)
        setIsAuthenticated(false)
        // No limpiar aquí, dejar que AuthGuard maneje la redirección
        return false
      }

      // Token válido, extraer información del usuario
      const payload = JSON.parse(atob(token.split(".")[1]))
      const userData = {
        id: payload.sub || 0,
        nombre: payload.nombre || "",
        apellido: payload.apellido || "",
        mail: payload.sub || "",
        rol: payload.roles && payload.roles.length > 0 ? payload.roles[0] : "OPERADOR",
      }

      setUser(userData)
      setIsAuthenticated(true)
      console.log("✅ Usuario autenticado:", userData)
      return true
    } catch (error) {
      console.error("❌ Error al verificar autenticación:", error)
      setUser(null)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  // Función de login
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await authService.login({ mail: email, password })

        if (response.success && response.token) {
          // Verificar autenticación después del login
          const isValid = checkAuth()
          if (isValid) {
            // Disparar evento personalizado para notificar cambios
            window.dispatchEvent(new CustomEvent("auth-changed"))
            return true
          }
        }
        return false
      } catch (error) {
        console.error("❌ Error en login:", error)
        return false
      }
    },
    [checkAuth],
  )

  // Función de logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)

      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent("auth-changed"))

      // Redirigir directamente al login para cambiar de cuenta
      router.push("/")
    } catch (error) {
      console.error("❌ Error en logout:", error)
      // En caso de error, también redirigir al login
      router.push("/")
    }
  }, [router])

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const initAuth = () => {
      console.log("🔄 Inicializando verificación de autenticación...")
      checkAuth()
      setIsLoading(false)
    }

    // Pequeño delay para asegurar que localStorage esté disponible
    const timer = setTimeout(initAuth, 100)
    return () => clearTimeout(timer)
  }, [checkAuth])

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        console.log("🔄 Token cambió en localStorage")
        checkAuth()
      }
    }

    const handleAuthChange = () => {
      console.log("🔄 Evento de autenticación personalizado")
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth-changed", handleAuthChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-changed", handleAuthChange)
    }
  }, [checkAuth])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }
}
