"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Definir la interfaz para las estadísticas
interface Stats {
  licenciasEmitidas: number
  licenciasVencidas: number
  titularesRegistrados: number
}

// Definir la interfaz para el contexto
interface StatsContextType {
  stats: Stats
  isLoading: boolean
  incrementLicenciasEmitidas: () => void
  incrementTitularesRegistrados: () => void
  refreshStats: () => Promise<void>
}

// Crear el contexto
const StatsContext = createContext<StatsContextType | undefined>(undefined)

// Hook personalizado para usar el contexto
export const useStats = () => {
  const context = useContext(StatsContext)
  if (context === undefined) {
    throw new Error("useStats debe ser usado dentro de un StatsProvider")
  }
  return context
}

// URL base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Props para el proveedor
interface StatsProviderProps {
  children: ReactNode
}

// Componente proveedor
export const StatsProvider = ({ children }: StatsProviderProps) => {
  const [stats, setStats] = useState<Stats>({
    licenciasEmitidas: 0,
    licenciasVencidas: 0,
    titularesRegistrados: 0,
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isClient, setIsClient] = useState<boolean>(false)
  const [lastToken, setLastToken] = useState<string | null>(null)

  // Verificar si estamos en el cliente (no en SSR)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Función para obtener el rol del usuario actual
  const getCurrentUserRole = () => {
    if (typeof window === "undefined") return null

    const token = localStorage.getItem("auth_token")
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.roles && payload.roles.length > 0 ? payload.roles[0] : "OPERADOR"
    } catch (error) {
      console.error("❌ Error al obtener rol del usuario:", error)
      return null
    }
  }

  // Función para manejar errores de autenticación (solo 401, no 403)
  const handleAuthError = (status: number) => {
    if (status === 401) {
      console.log(`❌ Error de autenticación detectado: ${status} - Token inválido o expirado`)
      // Solo redirigir en caso de 401 (token inválido/expirado)
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        window.location.href = "/"
      }
      return true
    }
    return false
  }

  // Función para verificar si el usuario está autenticado
  const isUserAuthenticated = () => {
    if (typeof window === "undefined") return false

    const token = localStorage.getItem("auth_token")
    if (!token) {
      console.log("⚠️ No hay token de autenticación disponible")
      return false
    }

    try {
      // Verificar si el token no ha expirado
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000
      const isValid = payload.exp > currentTime

      if (!isValid) {
        console.log("⏰ Token expirado")
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }

      return isValid
    } catch (error) {
      console.error("❌ Error al verificar token:", error)
      localStorage.removeItem("auth_token")
      return false
    }
  }

  // Función para cargar las estadísticas desde la API
  const loadStatsFromAPI = async () => {
    try {
      setIsLoading(true)
      console.log("🔄 Iniciando carga de estadísticas desde la API...")

      // Verificar que estamos en el cliente
      if (!isClient || typeof window === "undefined") {
        console.log("⏳ Esperando a estar en el cliente...")
        setIsLoading(false)
        return
      }

      // Verificar autenticación antes de hacer peticiones
      if (!isUserAuthenticated()) {
        console.log("🔒 Usuario no autenticado, manteniendo contadores en 0")
        setStats({
          licenciasEmitidas: 0,
          licenciasVencidas: 0,
          titularesRegistrados: 0,
        })
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem("auth_token")
      const userRole = getCurrentUserRole()
      console.log("🔑 Token encontrado, rol del usuario:", userRole)

      // Configurar headers para las peticiones
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      console.log("📡 Enviando peticiones paralelas a la API...")

      // Realizar peticiones en paralelo para mejorar el rendimiento
      const [licenciasResponse, vencidasResponse, titularesResponse] = await Promise.all([
        // Endpoint para obtener total de licencias emitidas
        fetch(`${API_BASE_URL}/licencias/emitidas/count`, { headers }),

        // Endpoint para obtener total de licencias vencidas
        fetch(`${API_BASE_URL}/licencias/vencidas/count`, { headers }),

        // Endpoint para obtener total de titulares registrados
        fetch(`${API_BASE_URL}/titulares/count`, { headers }),
      ])

      console.log("📊 Respuestas recibidas:", {
        licencias: licenciasResponse.status,
        vencidas: vencidasResponse.status,
        titulares: titularesResponse.status,
      })

      // Verificar errores de autenticación (solo 401)
      if (
        handleAuthError(licenciasResponse.status) ||
        handleAuthError(vencidasResponse.status) ||
        handleAuthError(titularesResponse.status)
      ) {
        console.log("🚫 Error de autenticación detectado, redirigiendo al login...")
        return
      }

      // Manejar errores 403 (sin permisos) sin redirigir
      const hasPermissionError =
        licenciasResponse.status === 403 || vencidasResponse.status === 403 || titularesResponse.status === 403

      if (hasPermissionError) {
        console.log("⚠️ Error 403: Usuario sin permisos para ver estadísticas completas")
        console.log("👤 Rol del usuario:", userRole)

        // Para OPERADOR, mostrar estadísticas básicas o usar valores por defecto
        if (userRole === "OPERADOR") {
          console.log("📊 Configurando estadísticas básicas para OPERADOR...")
          setStats({
            licenciasEmitidas: 0, // O un valor calculado localmente
            licenciasVencidas: 0,
            titularesRegistrados: 0,
          })
        } else {
          // Para otros roles, mantener en 0
          setStats({
            licenciasEmitidas: 0,
            licenciasVencidas: 0,
            titularesRegistrados: 0,
          })
        }
        setIsLoading(false)
        return
      }

      // Verificar si alguna petición falló por otros motivos
      if (!licenciasResponse.ok) {
        console.error(`❌ Error en la petición de licencias emitidas: ${licenciasResponse.status}`)
        throw new Error(`Error al obtener licencias emitidas: ${licenciasResponse.statusText}`)
      }
      if (!vencidasResponse.ok) {
        console.error(`❌ Error en la petición de licencias vencidas: ${vencidasResponse.status}`)
        throw new Error(`Error al obtener licencias vencidas: ${vencidasResponse.statusText}`)
      }
      if (!titularesResponse.ok) {
        console.error(`❌ Error en la petición de titulares: ${titularesResponse.status}`)
        throw new Error(`Error al obtener titulares: ${titularesResponse.statusText}`)
      }

      // Obtener el texto de las respuestas
      const licenciasText = await licenciasResponse.text()
      const vencidasText = await vencidasResponse.text()
      const titularesText = await titularesResponse.text()

      console.log("📄 Respuestas de texto:", {
        licenciasText,
        vencidasText,
        titularesText,
      })

      // Convertir los textos a números
      const licenciasEmitidas = Number.parseInt(licenciasText, 10) || 0
      const licenciasVencidas = Number.parseInt(vencidasText, 10) || 0
      const titularesRegistrados = Number.parseInt(titularesText, 10) || 0

      // Actualizar el estado con los datos de la API
      setStats({
        licenciasEmitidas,
        licenciasVencidas,
        titularesRegistrados,
      })

      console.log("✅ Estadísticas cargadas desde la API:", {
        licenciasEmitidas,
        licenciasVencidas,
        titularesRegistrados,
      })
    } catch (error) {
      console.error("❌ Error al cargar estadísticas desde la API:", error)

      // En caso de error, mantener contadores en 0
      setStats({
        licenciasEmitidas: 0,
        licenciasVencidas: 0,
        titularesRegistrados: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar estadísticas iniciales cuando el cliente esté listo
  useEffect(() => {
    if (isClient) {
      console.log("🚀 Cliente listo, iniciando carga de estadísticas...")
      // Pequeño delay para asegurar que el localStorage esté disponible
      const timer = setTimeout(() => {
        loadStatsFromAPI()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isClient])

  // Efecto para detectar cambios en el token (polling cada 2 segundos)
  useEffect(() => {
    if (!isClient) return

    const checkTokenChanges = () => {
      const currentToken = localStorage.getItem("auth_token")

      // Si el token cambió (de null a algo, o de algo a null, o cambió de valor)
      if (currentToken !== lastToken) {
        console.log("🔄 Cambio de token detectado:", {
          anterior: lastToken ? "existe" : "null",
          actual: currentToken ? "existe" : "null",
        })

        setLastToken(currentToken)

        // Si hay un nuevo token, cargar estadísticas
        if (currentToken) {
          console.log("🔑 Nuevo token detectado, cargando estadísticas...")
          setTimeout(() => {
            loadStatsFromAPI()
          }, 500)
        } else {
          // Si no hay token, resetear estadísticas
          console.log("🔒 Token removido, reseteando estadísticas...")
          setStats({
            licenciasEmitidas: 0,
            licenciasVencidas: 0,
            titularesRegistrados: 0,
          })
          setIsLoading(false)
        }
      }
    }

    // Verificar inmediatamente
    checkTokenChanges()

    // Verificar cada 2 segundos
    const interval = setInterval(checkTokenChanges, 2000)

    return () => clearInterval(interval)
  }, [isClient, lastToken])

  // Escuchar cambios en el localStorage (cuando el usuario se loguea)
  useEffect(() => {
    if (!isClient) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        console.log("🔄 Storage event: Token de autenticación cambió")
        setTimeout(() => {
          loadStatsFromAPI()
        }, 500)
      }
    }

    // Escuchar cambios en localStorage
    window.addEventListener("storage", handleStorageChange)

    // También escuchar eventos personalizados para cambios en la misma pestaña
    const handleAuthChange = () => {
      console.log("🔄 Custom event: Evento de autenticación detectado")
      setTimeout(() => {
        loadStatsFromAPI()
      }, 500)
    }

    window.addEventListener("auth-changed", handleAuthChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-changed", handleAuthChange)
    }
  }, [isClient])

  // Función para incrementar licencias emitidas (solo actualiza el estado local)
  const incrementLicenciasEmitidas = () => {
    // Incrementar localmente para UI inmediata
    setStats((prevStats) => ({
      ...prevStats,
      licenciasEmitidas: prevStats.licenciasEmitidas + 1,
    }))

    console.log("➕ Contador de licencias emitidas incrementado localmente")
  }

  // Función para incrementar titulares registrados (solo actualiza el estado local)
  const incrementTitularesRegistrados = () => {
    // Incrementar localmente para UI inmediata
    setStats((prevStats) => ({
      ...prevStats,
      titularesRegistrados: prevStats.titularesRegistrados + 1,
    }))

    console.log("➕ Contador de titulares registrados incrementado localmente")
  }

  // Función para refrescar todas las estadísticas
  const refreshStats = async () => {
    console.log("🔄 Refrescando estadísticas manualmente...")
    await loadStatsFromAPI()
  }

  // Valor del contexto
  const value = {
    stats,
    isLoading,
    incrementLicenciasEmitidas,
    incrementTitularesRegistrados,
    refreshStats,
  }

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}
