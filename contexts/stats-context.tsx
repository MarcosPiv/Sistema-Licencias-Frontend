"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { licenciaService } from "@/services/licencia-service"
import { titularService } from "@/services/titular-service"

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

  // Función para cargar las estadísticas
  const loadStats = async () => {
    try {
      setIsLoading(true)

      // Obtener licencias
      const licenciasResponse = await licenciaService.listarLicencias()
      const licenciasEmitidas = licenciasResponse.success ? licenciasResponse.total : 0

      // Obtener licencias vencidas
      const vencidasResponse = await licenciaService.obtenerLicenciasVencidas()
      const licenciasVencidas = vencidasResponse.success ? vencidasResponse.total : 0

      // Obtener estadísticas de titulares
      const titularesStats = await titularService.obtenerEstadisticas()
      const titularesRegistrados = titularesStats.total || 0

      setStats({
        licenciasEmitidas,
        licenciasVencidas,
        titularesRegistrados,
      })
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar estadísticas iniciales
  useEffect(() => {
    loadStats()
  }, [])

  // Función para incrementar licencias emitidas
  const incrementLicenciasEmitidas = () => {
    setStats((prevStats) => ({
      ...prevStats,
      licenciasEmitidas: prevStats.licenciasEmitidas + 1,
    }))
  }

  // Función para incrementar titulares registrados
  const incrementTitularesRegistrados = () => {
    setStats((prevStats) => ({
      ...prevStats,
      titularesRegistrados: prevStats.titularesRegistrados + 1,
    }))
  }

  // Función para refrescar todas las estadísticas
  const refreshStats = async () => {
    await loadStats()
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
