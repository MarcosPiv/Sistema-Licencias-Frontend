"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ArrowLeft } from "lucide-react"
import OperadoresGrid from "@/components/operadores-grid"
import AltaOperadorForm from "@/components/alta-operador-form"
import EditarOperadorForm from "@/components/editar-operador-form"

export default function OperadoresPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("listar")
  const [operadorSeleccionado, setOperadorSeleccionado] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Asegurarse de que el código solo se ejecute en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const userRole = searchParams.get("role")
    if (!userRole) {
      router.push("/")
      return
    }

    // Solo permitir acceso a administradores
    if (userRole !== "ADMIN") {
      router.push(`/dashboard?role=${userRole}`)
      return
    }

    setRole(userRole)
  }, [searchParams, router, isClient])

  const volverAlDashboard = () => {
    if (role) {
      router.push(`/dashboard?role=${role}`)
    }
  }

  const handleEditarOperador = (operadorId: number) => {
    setOperadorSeleccionado(operadorId)
    setActiveTab("editar")
  }

  const handleCancelarEdicion = () => {
    setActiveTab("listar")
    setOperadorSeleccionado(null)
  }

  if (!isClient || !role) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation role={role} />

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 md:mb-0">Gestión de Operadores</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={volverAlDashboard}
              className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            {activeTab !== "editar" && (
              <Button
                onClick={() => setActiveTab("crear")}
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Operador</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="border dark:border-slate-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 pb-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="listar"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                >
                  Operadores Registrados
                </TabsTrigger>
                <TabsTrigger
                  value="crear"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                  disabled={activeTab === "editar"}
                >
                  Alta de Operador
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="listar" className="m-0">
                <OperadoresGrid role={role} onEdit={handleEditarOperador} />
              </TabsContent>
              <TabsContent value="crear" className="m-0">
                <AltaOperadorForm role={role} onSuccess={() => setActiveTab("listar")} />
              </TabsContent>
              <TabsContent value="editar" className="m-0">
                {operadorSeleccionado && (
                  <EditarOperadorForm
                    operadorId={operadorSeleccionado}
                    role={role}
                    onSuccess={() => {
                      setActiveTab("listar")
                      setOperadorSeleccionado(null)
                    }}
                    onCancel={handleCancelarEdicion}
                  />
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </main>
    </div>
  )
}
