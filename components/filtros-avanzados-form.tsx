"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Search, Filter, User, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { filtrosService, type TitularConLicencia } from "@/services/filtros-service"
import gsap from "gsap"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface FiltrosAvanzadosFormProps {
  role: string
}

export default function FiltrosAvanzadosForm({ role }: FiltrosAvanzadosFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [gruposSanguineos, setGruposSanguineos] = useState<string[]>([])
  const [factorRh, setFactorRh] = useState<string>("")
  const [soloDonanteOrganos, setSoloDonanteOrganos] = useState<boolean>(false)
  const [nombreApellido, setNombreApellido] = useState<string>("")
  const [resultados, setResultados] = useState<TitularConLicencia[]>([])
  const [busquedaRealizada, setBusquedaRealizada] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

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
  const buscarTitulares = async () => {
    setIsLoading(true)
    setBusquedaRealizada(true)
    setError(null)

    try {
      // Preparar los filtros para el servicio
      const filtros = {
        nombreApellido,
        gruposSanguineos: gruposSanguineos,
        factorRh,
        soloDonanteOrganos,
      }

      // Llamar al servicio para buscar titulares
      const data = await filtrosService.buscarTitularesConLicenciasVigentes(filtros)
      setResultados(data)

      // Animar la aparición de los resultados
      if (resultadosRef.current) {
        gsap.fromTo(
          resultadosRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
        )
      }
    } catch (error) {
      console.error("Error al buscar titulares:", error)

      // Manejar error de sesión expirada
      if (error instanceof Error && error.message === "SESSION_EXPIRED") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        router.push("/session-expired")
        return
      }

      setError(error instanceof Error ? error.message : "Error desconocido al buscar titulares")
      setResultados([])
    } finally {
      setIsLoading(false)
    }
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setGruposSanguineos([])
    setFactorRh("")
    setSoloDonanteOrganos(false)
    setNombreApellido("")
    setBusquedaRealizada(false)
    setResultados([])
    setError(null)

    // Animar el reset de los filtros
    if (filtrosRef.current) {
      gsap.fromTo(filtrosRef.current, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: "back.out(1.7)" })
    }

    // Mostrar toast de confirmación
    toast({
      title: "Filtros limpiados",
      description: "Se han restablecido todos los filtros de búsqueda",
      variant: "default",
    })
  }

  // Exportar resultados a PDF
  const exportarAPDF = async () => {
    try {
      setIsExporting(true)

      // Crear un nuevo documento PDF
      const doc = new jsPDF()

      // Agregar título al PDF
      doc.setFontSize(18)
      doc.text("Reporte de Titulares con Licencias Vigentes", 14, 22)

      // Agregar fecha de generación
      doc.setFontSize(11)
      doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 30)

      // Agregar filtros aplicados
      const filtrosTexto = "Filtros aplicados: "
      const filtrosAplicados = []

      if (nombreApellido) filtrosAplicados.push(`Nombre/Apellido: ${nombreApellido}`)
      if (gruposSanguineos.length > 0) filtrosAplicados.push(`Grupos sanguíneos: ${gruposSanguineos.join(", ")}`)
      if (factorRh) filtrosAplicados.push(`Factor RH: ${factorRh}`)
      if (soloDonanteOrganos) filtrosAplicados.push("Solo donantes")

      doc.text(
        filtrosAplicados.length > 0 ? filtrosTexto + filtrosAplicados.join("; ") : "Sin filtros aplicados",
        14,
        38,
      )

      // Preparar datos para la tabla
      const tableData = resultados.map((resultado) => [
        `${resultado.nombre} ${resultado.apellido}`,
        `${resultado.tipoDocumento} ${resultado.numeroDocumento}`,
        `${resultado.grupoSanguineo}${resultado.factorRh === "POSITIVO" ? "+" : "-"}`,
        resultado.donanteOrganos ? "Si" : "No",
        `Clase ${resultado.claseLicencia}`,
        formatDate(resultado.fechaVencimiento),
      ])

      // Generar tabla en el PDF
      autoTable(doc, {
        head: [["Titular", "Documento", "Grupo Sang.", "Donante", "Licencia", "Vencimiento"]],
        body: tableData,
        startY: 45,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [70, 70, 70] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      })

      // Agregar pie de página
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10)
      }

      // Guardar el PDF
      doc.save(`titulares-licencias-vigentes-${new Date().toISOString().split("T")[0]}.pdf`)

      toast({
        title: "Exportación completada",
        description: "El reporte PDF se ha generado correctamente",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al exportar a PDF:", error)
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo PDF. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
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
                <Label className="text-base">Nombre o Apellido</Label>
                <Input
                  type="text"
                  placeholder="Buscar por nombre o apellido"
                  value={nombreApellido}
                  onChange={(e) => setNombreApellido(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base">Grupo Sanguíneo</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="grupo-o"
                      checked={gruposSanguineos.includes("O")} 
                      onCheckedChange={() => handleGrupoSanguineoChange("O")} 
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
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {resultados.length} {resultados.length === 1 ? "titular encontrado" : "titulares encontrados"}
                    </Badge>
                    {resultados.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportarAPDF}
                        disabled={isExporting}
                        className="flex items-center gap-1"
                      >
                        {isExporting ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-1 h-4 w-4"
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
                            Exportando...
                          </span>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" />
                            Exportar a PDF
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : resultados.length > 0 ? (
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
                            <TableCell className="font-medium">{`${resultado.nombre} ${resultado.apellido}`}</TableCell>
                            <TableCell>
                              {resultado.tipoDocumento} {resultado.numeroDocumento}
                            </TableCell>
                            <TableCell>
                              {resultado.grupoSanguineo}
                              {resultado.factorRh === "POSITIVO" ? "+" : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={resultado.donanteOrganos ? "success" : "secondary"}>
                                {resultado.donanteOrganos ? "Si" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Clase {resultado.claseLicencia}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(resultado.fechaVencimiento)}</TableCell>
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
