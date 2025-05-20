"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Search, Filter, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { titularesDB } from "@/data/titular-data"
import { licenciasEmitidas } from "@/data/licencia-data"
import gsap from "gsap"

interface FiltrosAvanzadosFormProps {
  role: string
}

export default function FiltrosAvanzadosForm({ role }: FiltrosAvanzadosFormProps) {
  const router = useRouter()
  const [gruposSanguineos, setGruposSanguineos] = useState<string[]>([])
  const [factorRh, setFactorRh] = useState<string>("")
  const [soloDonanteOrganos, setSoloDonanteOrganos] = useState<boolean>(false)
  const [resultados, setResultados] = useState<any[]>([])
  const [busquedaRealizada, setBusquedaRealizada] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const formRef = useRef<HTMLDivElement>(null)
  const filtrosRef = useRef<HTMLDivElement>(null)
  const resultadosRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animación inicial del formulario
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
    }
  }, [])

  // Manejar cambio en los grupos sanguíneos seleccionados
  const handleGrupoSanguineoChange = (grupo: string) => {
    setGruposSanguineos((prev) => {
      if (prev.includes(grupo)) {
        return prev.filter((g) => g !== grupo)
      } else {
        return [...prev, grupo]
      }
    })
  }

  // Buscar titulares según los filtros
  const buscarTitulares = () => {
    setIsLoading(true)
    setBusquedaRealizada(true)

    // Simular una pequeña demora para mostrar el estado de carga
    setTimeout(() => {
      // Filtrar titulares según los criterios seleccionados
      let titularesFiltrados = [...titularesDB]

      // Filtrar por grupo sanguíneo si hay alguno seleccionado
      if (gruposSanguineos.length > 0) {
        titularesFiltrados = titularesFiltrados.filter((titular) => gruposSanguineos.includes(titular.grupoSanguineo))
      }

      // Filtrar por factor RH si está seleccionado
      if (factorRh) {
        titularesFiltrados = titularesFiltrados.filter((titular) => titular.factorRh === factorRh)
      }

      // Filtrar solo donantes si está marcado
      if (soloDonanteOrganos) {
        titularesFiltrados = titularesFiltrados.filter((titular) => titular.donanteOrganos === "Si")
      }

      // Obtener licencias vigentes para cada titular
      const resultadosConLicencia = titularesFiltrados.map((titular) => {
        // Buscar licencia vigente para este titular
        const licencia = licenciasEmitidas.find(
          (lic) =>
            lic.titular.tipoDocumento === titular.tipoDocumento &&
            lic.titular.numeroDocumento === titular.numeroDocumento &&
            new Date(lic.fechaVencimiento) > new Date(), // Solo licencias vigentes
        )

        return {
          ...titular,
          licencia: licencia || null,
        }
      })

      setResultados(resultadosConLicencia)
      setIsLoading(false)

      // Animar la aparición de los resultados
      if (resultadosRef.current) {
        gsap.fromTo(
          resultadosRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
        )
      }
    }, 500)
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setGruposSanguineos([])
    setFactorRh("")
    setSoloDonanteOrganos(false)
    setBusquedaRealizada(false)
    setResultados([])

    // Animar el reset de los filtros
    if (filtrosRef.current) {
      gsap.fromTo(filtrosRef.current, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: "back.out(1.7)" })
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card className="w-full dark:border-slate-700">
      <CardContent className="pt-6" ref={formRef}>
        <div className="space-y-6">
          <div className="space-y-4" ref={filtrosRef}>
            <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-base">Grupo Sanguíneo</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="grupo-0"
                      checked={gruposSanguineos.includes("0")}
                      onCheckedChange={() => handleGrupoSanguineoChange("0")}
                    />
                    <Label htmlFor="grupo-0">Grupo 0</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="grupo-a"
                      checked={gruposSanguineos.includes("A")}
                      onCheckedChange={() => handleGrupoSanguineoChange("A")}
                    />
                    <Label htmlFor="grupo-a">Grupo A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="grupo-b"
                      checked={gruposSanguineos.includes("B")}
                      onCheckedChange={() => handleGrupoSanguineoChange("B")}
                    />
                    <Label htmlFor="grupo-b">Grupo B</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="grupo-ab"
                      checked={gruposSanguineos.includes("AB")}
                      onCheckedChange={() => handleGrupoSanguineoChange("AB")}
                    />
                    <Label htmlFor="grupo-ab">Grupo AB</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Factor RH</Label>
                <RadioGroup value={factorRh} onValueChange={setFactorRh}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="+" id="rh-positivo" />
                    <Label htmlFor="rh-positivo">Positivo (+)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="-" id="rh-negativo" />
                    <Label htmlFor="rh-negativo">Negativo (-)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Donante de Órganos</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="solo-donantes"
                    checked={soloDonanteOrganos}
                    onCheckedChange={(checked) => setSoloDonanteOrganos(checked === true)}
                  />
                  <Label htmlFor="solo-donantes">Solo mostrar donantes</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={limpiarFiltros}
                className="transition-transform duration-300 hover:scale-105"
              >
                Limpiar Filtros
              </Button>
              <Button
                onClick={buscarTitulares}
                className="transition-transform duration-300 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Buscando...
                  </span>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </div>

          {busquedaRealizada && (
            <>
              <Separator className="dark:bg-slate-700" />

              <div className="space-y-4" ref={resultadosRef}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Resultados
                  </h2>
                  <Badge variant="outline">
                    {resultados.length} {resultados.length === 1 ? "titular encontrado" : "titulares encontrados"}
                  </Badge>
                </div>

                {resultados.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titular</TableHead>
                          <TableHead>Documento</TableHead>
                          <TableHead>Grupo Sanguíneo</TableHead>
                          <TableHead>Donante</TableHead>
                          <TableHead>Licencia</TableHead>
                          <TableHead>Vencimiento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultados.map((resultado) => (
                          <TableRow key={`${resultado.tipoDocumento}-${resultado.numeroDocumento}`}>
                            <TableCell className="font-medium">{resultado.nombreApellido}</TableCell>
                            <TableCell>
                              {resultado.tipoDocumento} {resultado.numeroDocumento}
                            </TableCell>
                            <TableCell>
                              {resultado.grupoSanguineo}
                              {resultado.factorRh}
                            </TableCell>
                            <TableCell>
                              <Badge variant={resultado.donanteOrganos === "Si" ? "success" : "secondary"}>
                                {resultado.donanteOrganos}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {resultado.licencia ? (
                                <Badge variant="outline">Clase {resultado.licencia.claseLicencia}</Badge>
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400 text-sm">Sin licencia</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {resultado.licencia ? (
                                formatDate(resultado.licencia.fechaVencimiento)
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400 text-sm">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert variant="default" className="bg-slate-100 dark:bg-slate-800">
                    <AlertDescription>
                      No se encontraron titulares que coincidan con los filtros seleccionados.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard?role=${role}`)}
              className="transition-transform duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
