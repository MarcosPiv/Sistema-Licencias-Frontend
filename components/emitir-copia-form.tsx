"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, CheckCircle2, AlertCircle, Calendar, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { licenciasEmitidas } from "@/data/licencia-data"
import gsap from "gsap"
import { useStats } from "@/contexts/stats-context"

// Costo fijo para emitir una copia
const COSTO_COPIA = 50

interface EmitirCopiaFormProps {
  role: string
}

export default function EmitirCopiaForm({ role }: EmitirCopiaFormProps) {
  const router = useRouter()
  const [tipoDocumento, setTipoDocumento] = useState<string>("")
  const [numeroDocumento, setNumeroDocumento] = useState<string>("")
  const [numeroLicencia, setNumeroLicencia] = useState<string>("")
  const [tipoBusqueda, setTipoBusqueda] = useState<"documento" | "licencia">("documento")
  const [licenciaSeleccionada, setLicenciaSeleccionada] = useState<(typeof licenciasEmitidas)[0] | null>(null)
  const [motivoCopia, setMotivoCopia] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const formRef = useRef<HTMLDivElement>(null)
  const busquedaRef = useRef<HTMLDivElement>(null)
  const datosRef = useRef<HTMLDivElement>(null)
  const copiaRef = useRef<HTMLDivElement>(null)

  // Obtener la función para incrementar licencias emitidas
  const { incrementLicenciasEmitidas } = useStats()

  useEffect(() => {
    // Animación inicial del formulario
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
    }
  }, [])

  // Manejar cambio en el tipo de documento
  const handleTipoDocumentoChange = (value: string) => {
    setTipoDocumento(value)
    setNumeroDocumento("") // Limpiar el campo al cambiar el tipo
  }

  // Manejar cambio en el número de documento
  const handleNumeroDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (tipoDocumento === "DNI") {
      // Para DNI, solo permitir números
      const onlyNumbers = value.replace(/[^0-9]/g, "")
      setNumeroDocumento(onlyNumbers)
    } else if (tipoDocumento === "Pasaporte") {
      // Para Pasaporte, convertir a mayúsculas
      setNumeroDocumento(value.toUpperCase())
    } else {
      // Si no hay tipo seleccionado, permitir cualquier entrada
      setNumeroDocumento(value)
    }
  }

  // Función para buscar licencias
  const buscarLicencia = () => {
    setError("")
    setLicenciaSeleccionada(null)
    setIsLoading(true)

    if (tipoBusqueda === "documento" && (!tipoDocumento || !numeroDocumento)) {
      setError("Debe completar tipo y número de documento")
      setIsLoading(false)
      // Animación de error mejorada
      if (busquedaRef.current) {
        gsap.fromTo(
          busquedaRef.current,
          { x: -8 },
          { x: 8, duration: 0.1, repeat: 5, yoyo: true, ease: "power2.inOut" },
        )
      }
      return
    }

    if (tipoBusqueda === "licencia" && !numeroLicencia) {
      setError("Debe ingresar un número de licencia")
      setIsLoading(false)
      // Animación de error mejorada
      if (busquedaRef.current) {
        gsap.fromTo(
          busquedaRef.current,
          { x: -8 },
          { x: 8, duration: 0.1, repeat: 5, yoyo: true, ease: "power2.inOut" },
        )
      }
      return
    }

    // Simular una pequeña demora para mostrar el estado de carga
    setTimeout(() => {
      // Buscar en la base de datos simulada
      let licenciaEncontrada = null

      if (tipoBusqueda === "documento") {
        licenciaEncontrada = licenciasEmitidas.find(
          (licencia) =>
            licencia.titular.tipoDocumento === tipoDocumento && licencia.titular.numeroDocumento === numeroDocumento,
        )
      } else {
        licenciaEncontrada = licenciasEmitidas.find((licencia) => licencia.numeroLicencia === numeroLicencia)
      }

      if (!licenciaEncontrada) {
        setError("No se encontró ninguna licencia con los datos ingresados")
        setIsLoading(false)
        // Animación de error mejorada
        if (busquedaRef.current) {
          gsap.fromTo(
            busquedaRef.current,
            { x: -8 },
            { x: 8, duration: 0.1, repeat: 5, yoyo: true, ease: "power2.inOut" },
          )
        }
        return
      }

      // Verificar si la licencia está vencida
      const fechaVencimiento = new Date(licenciaEncontrada.fechaVencimiento)
      const hoy = new Date()

      if (fechaVencimiento < hoy) {
        setError("No se puede emitir copia de una licencia vencida. Debe renovarla.")
        setIsLoading(false)
        return
      }

      // Animación al encontrar licencia
      if (busquedaRef.current) {
        gsap.to(busquedaRef.current.querySelectorAll("input, select, button"), {
          scale: 1.03,
          duration: 0.2,
          stagger: 0.05,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            gsap.to(busquedaRef.current, {
              y: -10,
              opacity: 0.8,
              duration: 0.3,
              onComplete: () => {
                setLicenciaSeleccionada(licenciaEncontrada)
                setIsLoading(false)

                // Animar la aparición de los datos de la licencia
                setTimeout(() => {
                  if (datosRef.current) {
                    gsap.fromTo(
                      datosRef.current,
                      { opacity: 0, y: 20 },
                      { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
                    )
                  }
                }, 100)
              },
            })
          },
        })
      } else {
        setLicenciaSeleccionada(licenciaEncontrada)
        setIsLoading(false)
      }
    }, 500)
  }

  // Confirmar emisión de copia
  const confirmarEmisionCopia = () => {
    if (!motivoCopia) {
      setError("Debe seleccionar un motivo para la emisión de la copia")
      // Animar el campo de motivo
      if (copiaRef.current) {
        const selectField = copiaRef.current.querySelector("[data-value]")
        if (selectField) {
          gsap.fromTo(
            selectField,
            { boxShadow: "0 0 0 1px rgba(239, 68, 68, 0.2)" },
            {
              boxShadow: "0 0 0 2px rgba(239, 68, 68, 1)",
              duration: 0.3,
              repeat: 1,
              yoyo: true,
            },
          )
        }
      }
      return
    }

    try {
      // En producción, aquí se enviarían los datos al backend
      console.log({
        licenciaOriginal: licenciaSeleccionada,
        motivoCopia,
        costo: COSTO_COPIA,
        fechaEmisionCopia: new Date().toISOString(),
      })

      // Incrementar el contador de licencias emitidas
      incrementLicenciasEmitidas()

      // Mostrar mensaje de éxito
      setSuccess(true)

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        router.push(`/dashboard/licencias/imprimir?role=${role}`)
      }, 2000)
    } catch (error) {
      console.error("Error al emitir copia:", error)
      setError("Ocurrió un error al emitir la copia. Por favor, intente nuevamente.")
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
        {success ? (
          <Alert className="bg-green-50 border-green-200 mb-4 dark:bg-green-900 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Copia de licencia emitida correctamente. Redirigiendo a impresión...
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4" ref={busquedaRef}>
              <h2 className="text-xl font-semibold dark:text-white">Buscar Licencia</h2>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4 mb-4">
                <Button
                  variant={tipoBusqueda === "documento" ? "default" : "outline"}
                  onClick={() => setTipoBusqueda("documento")}
                  className="flex-1"
                >
                  Buscar por Documento
                </Button>
                <Button
                  variant={tipoBusqueda === "licencia" ? "default" : "outline"}
                  onClick={() => setTipoBusqueda("licencia")}
                  className="flex-1"
                >
                  Buscar por Número de Licencia
                </Button>
              </div>

              {tipoBusqueda === "documento" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                    <Select value={tipoDocumento} onValueChange={handleTipoDocumentoChange}>
                      <SelectTrigger id="tipoDocumento">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="numeroDocumento">Número de Documento</Label>
                    <Input
                      id="numeroDocumento"
                      value={numeroDocumento}
                      onChange={handleNumeroDocumentoChange}
                      placeholder="Ingrese número"
                      maxLength={tipoDocumento === "DNI" ? 8 : 9}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={buscarLicencia}
                      className="w-full transition-transform duration-300 hover:scale-105"
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numeroLicencia">Número de Licencia</Label>
                    <Input
                      id="numeroLicencia"
                      value={numeroLicencia}
                      onChange={(e) => setNumeroLicencia(e.target.value)}
                      placeholder="Ingrese número de licencia"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={buscarLicencia}
                      className="w-full transition-transform duration-300 hover:scale-105"
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
              )}
            </div>

            {licenciaSeleccionada && (
              <>
                <Separator className="dark:bg-slate-700" />

                <div className="space-y-4" ref={datosRef}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold dark:text-white">Datos de la Licencia Original</h2>
                    <Badge variant="outline" className="ml-2">
                      Vigente hasta {formatDate(licenciaSeleccionada.fechaVencimiento)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Titular</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {licenciaSeleccionada.titular.nombreApellido}
                      </div>
                    </div>

                    <div>
                      <Label>Documento</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {licenciaSeleccionada.titular.tipoDocumento} {licenciaSeleccionada.titular.numeroDocumento}
                      </div>
                    </div>

                    <div>
                      <Label>Clase de Licencia</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                        Clase {licenciaSeleccionada.claseLicencia}
                      </div>
                    </div>

                    <div>
                      <Label>Número de Licencia</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {licenciaSeleccionada.numeroLicencia}
                      </div>
                    </div>

                    <div>
                      <Label>Fecha de Emisión</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(licenciaSeleccionada.fechaEmision)}
                      </div>
                    </div>

                    <div>
                      <Label>Fecha de Vencimiento</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(licenciaSeleccionada.fechaVencimiento)}
                      </div>
                    </div>
                  </div>

                  <Separator className="dark:bg-slate-700" />

                  <div className="space-y-4" ref={copiaRef}>
                    <h2 className="text-xl font-semibold dark:text-white">Emisión de Copia</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="motivoCopia">Motivo de la Copia</Label>
                        <Select value={motivoCopia} onValueChange={setMotivoCopia}>
                          <SelectTrigger id="motivoCopia">
                            <SelectValue placeholder="Seleccionar motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="perdida">Pérdida</SelectItem>
                            <SelectItem value="robo">Robo</SelectItem>
                            <SelectItem value="deterioro">Deterioro</SelectItem>
                            <SelectItem value="duplicado">Duplicado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Costo de la Copia</Label>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">${COSTO_COPIA}</div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/dashboard?role=${role}`)}
                        className="transition-transform duration-300 hover:scale-105"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                      </Button>
                      <Button
                        onClick={confirmarEmisionCopia}
                        className="transition-transform duration-300 hover:scale-105"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Emitir Copia
                      </Button>
                    </div>
                  </div>
                </>
              )
            }

            {!licenciaSeleccionada && (
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard?role=${role}`)}
                  className="transition-transform duration-300 hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )\
}
