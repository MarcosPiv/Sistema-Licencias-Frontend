"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import FiltrosAvanzadosForm from "@/components/filtros-avanzados-form"

export default function FiltrosAvanzados() {
  const searchParams = useSearchParams()
  const [role, setRole] = useState<string>("ADMIN")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const userRole = searchParams.get("role") || "ADMIN"
      setRole(userRole)
    } catch (err) {
      console.error("Error al obtener el rol:", err)
      setError("Error al cargar la página. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation role={role} />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">Filtros Avanzados</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Busque titulares por grupo sanguíneo, factor RH y condición de donante
          </p>

          <FiltrosAvanzadosForm role={role} />
        </div>
      </main>
    </div>
  )
}
