"use client"

import { useSearchParams } from "next/navigation"
import Navigation from "@/components/navigation"
import TitularForm from "@/components/titular-form"

export default function AltaTitular() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "ADMIN"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation role={role} />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">Alta de Titular</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Complete el formulario para registrar un nuevo titular de licencia
          </p>

          <TitularForm role={role} />
        </div>
      </main>
    </div>
  )
}
