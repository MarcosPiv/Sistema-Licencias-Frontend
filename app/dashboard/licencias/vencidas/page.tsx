"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import LicenciasVencidasGrid from "@/components/licencias-vencidas-grid"

export default function LicenciasVencidasPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const userRole = searchParams.get("role")
    if (!userRole) {
      router.push("/")
      return
    }
    setRole(userRole)
  }, [searchParams, router])

  if (!role) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation role={role} />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Licencias Vencidas</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Gestión de licencias que requieren renovación</p>
        </div>

        <LicenciasVencidasGrid role={role} />
      </main>
    </div>
  )
}
