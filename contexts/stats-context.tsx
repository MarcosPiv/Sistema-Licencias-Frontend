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
      console.log("Cargando estadísticas desde la API...")

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
        fetch(`${API_BASE_URL}/licencias/emitidas/count`, { headers }),

        // Endpoint para obtener total de licencias vencidas
        fetch(`${API_BASE_URL}/licencias/vencidas/count`, { headers }),

        // Endpoint para obtener total de titulares registrados
        fetch(`${API_BASE_URL}/titulares/count`, { headers }),
      ])

      // Verificar si alguna petición falló
      if (!licenciasResponse.ok) {
        console.error(`Error en la petición de licencias emitidas: ${licenciasResponse.status}`)
        throw new Error(`Error al obtener licencias emitidas: ${licenciasResponse.statusText}`)
      }
      if (!vencidasResponse.ok) {
        console.error(`Error en la petición de licencias vencidas: ${vencidasResponse.status}`)
        throw new Error(`Error al obtener licencias vencidas: ${vencidasResponse.statusText}`)
      }
      if (!titularesResponse.ok) {
        console.error(`Error en la petición de titulares: ${titularesResponse.status}`)
        throw new Error(`Error al obtener titulares: ${titularesResponse.statusText}`)
      }

      // Obtener el texto de las respuestas
      const licenciasText = await licenciasResponse.text()
      const vencidasText = await vencidasResponse.text()
      const titularesText = await titularesResponse.text()

      console.log("Respuesta de licencias emitidas (texto):", licenciasText)
      console.log("Respuesta de licencias vencidas (texto):", vencidasText)
      console.log("Respuesta de titulares (texto):", titularesText)

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

      console.log("Estadísticas cargadas desde la API:", {
        licenciasEmitidas,
        licenciasVencidas,
        titularesRegistrados,
      })
    } catch (error) {
      console.error("Error al cargar estadísticas desde la API:", error)

    } finally {
      setIsLoading(false)
    }
  }


  // Cargar estadísticas iniciales
  useEffect(() => {
    loadStatsFromAPI()
  }, [])

  // Función para incrementar licencias emitidas (solo actualiza el estado local)
  const incrementLicenciasEmitidas = () => {
    // Incrementar localmente para UI inmediata
    setStats((prevStats) => ({
      ...prevStats,
      licenciasEmitidas: prevStats.licenciasEmitidas + 1,
    }))

    console.log("Contador de licencias emitidas incrementado localmente")
  }

  // Función para incrementar titulares registrados (solo actualiza el estado local)
  const incrementTitularesRegistrados = () => {
    // Incrementar localmente para UI inmediata
    setStats((prevStats) => ({
      ...prevStats,
      titularesRegistrados: prevStats.titularesRegistrados + 1,
    }))

    console.log("Contador de titulares registrados incrementado localmente")
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
