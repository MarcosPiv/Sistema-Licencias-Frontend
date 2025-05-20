"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import ImprimirLicenciaForm from "@/components/imprimir-licencia-form"
import ImprimirLicenciaFormMobile from "@/components/imprimir-licencia-form-mobile"
import { useIsMobile } from "@/hooks/use-mobile"

export default function ImprimirLicencia() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "ADMIN"
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que la detección de dispositivo móvil ocurra después del montaje
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation role={role} />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">Imprimir Licencia</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">Imprima la licencia y el comprobante de pago</p>

          {mounted && isMobile ? <ImprimirLicenciaFormMobile role={role} /> : <ImprimirLicenciaForm role={role} />}
        </div>
      </main>
    </div>
  )
}
