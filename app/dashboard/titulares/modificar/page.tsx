"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import ModificarTitularForm from "@/components/modificar-titular-form"
import { useEffect } from "react"

export default function ModificarTitularPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get("role")

  useEffect(() => {
    // Verificar si el usuario tiene permisos para acceder a esta página
    if (role !== "ADMIN" && role !== "SUPER_USER") {
      console.log("Acceso no autorizado a Modificar Titular. Redirigiendo...")
      router.push(`/dashboard?role=${role}`)
    }
  }, [role, router])

  if (!role) {
    router.push("/")
    return null
  }

  // Si el rol no es ADMIN o SUPER_USER, no renderizar el contenido
  if (role !== "ADMIN" && role !== "SUPER_USER") {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation role={role} />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Modificar Titular</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Busque un titular por su documento y actualice sus datos
          </p>
        </div>

        <ModificarTitularForm role={role} />
      </div>
    </div>
  )
}
