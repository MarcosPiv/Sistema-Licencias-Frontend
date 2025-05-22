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

  // Función para cargar las estadísticas desde la API
  const loadStatsFromAPI = async () => {
    try {
      setIsLoading(true)

      // Obtener token de autenticación (si es necesario)
      const token = localStorage.getItem("authToken")

      // Configurar headers para las peticiones
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      }

      // Realizar peticiones en paralelo para mejorar el rendimiento
      const [licenciasResponse, vencidasResponse, titularesResponse] = await Promise.all([
        // Endpoint para obtener total de licencias emitidas
        fetch(`${API_BASE_URL}/estadisticas/licencias/total`, { headers }),

        // Endpoint para obtener total de licencias vencidas
        fetch(`${API_BASE_URL}/estadisticas/licencias/vencidas`, { headers }),

        // Endpoint para obtener total de titulares registrados
        fetch(`${API_BASE_URL}/estadisticas/titulares/total`, { headers }),
      ])

      // Verificar si alguna petición falló
      if (!licenciasResponse.ok || !vencidasResponse.ok || !titularesResponse.ok) {
        throw new Error("Error al obtener estadísticas de la API")
      }

      // Convertir respuestas a JSON
      const licenciasData = await licenciasResponse.json()
      const vencidasData = await vencidasResponse.json()
      const titularesData = await titularesResponse.json()

      // Actualizar el estado con los datos de la API
      setStats({
        licenciasEmitidas: licenciasData.total || 0,
        licenciasVencidas: vencidasData.total || 0,
        titularesRegistrados: titularesData.total || 0,
      })

      console.log("Estadísticas cargadas desde la API:", {
        licenciasEmitidas: licenciasData.total,
        licenciasVencidas: vencidasData.total,
        titularesRegistrados: titularesData.total,
      })
    } catch (error) {
      console.error("Error al cargar estadísticas desde la API:", error)

      // En caso de error, mantener los valores actuales
      // Opcionalmente, podrías cargar datos locales como fallback
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar estadísticas iniciales
  useEffect(() => {
    loadStatsFromAPI()
  }, [])

  // Función para incrementar licencias emitidas
  const incrementLicenciasEmitidas = async () => {
    // Incrementar localmente para UI inmediata
    setStats((prevStats) => ({
      ...prevStats,
      licenciasEmitidas: prevStats.licenciasEmitidas + 1,
    }))

    // Opcionalmente, notificar al backend sobre el incremento
    try {
      const token = localStorage.getItem("authToken")
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      }

      // Esta petición dependerá de cómo esté diseñada tu API
      await fetch(`${API_BASE_URL}/estadisticas/licencias/incrementar`, {
        method: "POST",
        headers,
      })
    } catch (error) {
      console.error("Error al notificar incremento de licencias:", error)
      // No revertimos el incremento local para evitar confusión al usuario
    }
  }

  // Función para incrementar titulares registrados
  const incrementTitularesRegistrados = async () => {
    // Incrementar localmente para UI inmediata
    setStats((prevStats) => ({
      ...prevStats,
      titularesRegistrados: prevStats.titularesRegistrados + 1,
    }))

    // Opcionalmente, notificar al backend sobre el incremento
    try {
      const token = localStorage.getItem("authToken")
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      }

      // Esta petición dependerá de cómo esté diseñada tu API
      await fetch(`${API_BASE_URL}/estadisticas/titulares/incrementar`, {
        method: "POST",
        headers,
      })
    } catch (error) {
      console.error("Error al notificar incremento de titulares:", error)
      // No revertimos el incremento local para evitar confusión al usuario
    }
  }

  // Función para refrescar todas las estadísticas
  const refreshStats = async () => {
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
