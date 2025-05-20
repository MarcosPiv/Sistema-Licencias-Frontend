"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, CheckCircle2, AlertCircle, Edit, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { licenciasEmitidas } from "@/data/licencia-data"
import gsap from "gsap"

// Importar las funciones y datos de clases de licencias
import { calcularVigencia, calcularCosto, calcularFechaVencimiento } from "@/data/clases-licencia"
import { useStats } from "@/contexts/stats-context"

interface RenovarLicenciaFormProps {
  role: string
}

export default function RenovarLicenciaForm({ role }: RenovarLicenciaFormProps) {
  const router = useRouter()
  const [tipoDocumento, setTipoDocumento] = useState<string>("")
  const [numeroDocumento, setNumeroDocumento] = useState<string>("")
  const [licenciaSeleccionada, setLicenciaSeleccionada] = useState<(typeof licenciasEmitidas)[0] | null>(null)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [nuevaVigencia, setNuevaVigencia] = useState<number>(0)
  const [nuevoCosto, setNuevoCosto] = useState<number>(0)
  const [autoSearchExecuted, setAutoSearchExecuted] = useState<boolean>(false)
  const [animationExecuted, setAnimationExecuted] = useState<boolean>(false)

  const formRef = useRef<HTMLDivElement>(null)
  const busquedaRef = useRef<HTMLDivElement>(null)
  const datosRef = useRef<HTMLDivElement>(null)
  const renovacionRef = useRef<HTMLDivElement>(null)
  const buscarBtnRef = useRef<HTMLButtonElement>(null)

  // Obtener la función para incrementar licencias emitidas
  const { incrementLicenciasEmitidas } = useStats()

  useEffect(() => {
    // Animación inicial del formulario - solo ejecutar una vez
    if (formRef.current && !animationExecuted) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
      setAnimationExecuted(true)
    }
  }, [animationExecuted])

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

    if (!tipoDocumento || !numeroDocumento) {
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

    // Simular una pequeña demora para mostrar el estado de carga
    setTimeout(() => {
      // Buscar en la base de datos simulada
      const licenciaEncontrada = licenciasEmitidas.find(
        (licencia) =>
          licencia.titular.tipoDocumento === tipoDocumento && licencia.titular.numeroDocumento === numeroDocumento,
      )

      if (!licenciaEncontrada) {
        setError("No se encontró ninguna licencia con ese documento")
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

      // Permitir renovación si está vencida o a menos de 6 meses de vencer
      const seisMesesDespues = new Date(hoy)
      seisMesesDespues.setMonth(hoy.getMonth() + 6)

      if (fechaVencimiento > seisMesesDespues) {
        setError(
          "Esta licencia no puede renovarse aún. Solo se pueden renovar licencias vencidas o a menos de 6 meses de vencer.",
        )
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

                // Calcular nueva vigencia y costo
                calcularVigenciaYCosto(licenciaEncontrada)

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

                // Activar automáticamente el modo de edición
                setTimeout(() => {
                  setEditMode(true)
                }, 500)
              },
            })
          },
        })
      } else {
        setLicenciaSeleccionada(licenciaEncontrada)
        setIsLoading(false)

        // Calcular nueva vigencia y costo
        calcularVigenciaYCosto(licenciaEncontrada)

        // Activar automáticamente el modo de edición
        setTimeout(() => {
          setEditMode(true)
        }, 500)
      }
    }, 500)
  }

  // Calcular nueva vigencia y costo
  const calcularVigenciaYCosto = (licencia: (typeof licenciasEmitidas)[0]) => {
    // Determinar si es primera vez (para renovación siempre es false)
    const esPrimeraVez = false

    // Calcular vigencia según edad
    const vigenciaCalculada = calcularVigencia(licencia.titular.edad, esPrimeraVez)

    // Calcular costo según clase y vigencia (sin aplicar descuento por renovación)
    const costoCalculado = calcularCosto(licencia.claseLicencia, vigenciaCalculada, false)

    setNuevaVigencia(vigenciaCalculada)
    setNuevoCosto(costoCalculado)
  }

  // Confirmar renovación
  const renovarLicencia = () => {
    try {
      // Calcular fecha de vencimiento basada en la fecha de nacimiento
      const fechaVencimiento = calcularFechaVencimiento(licenciaSeleccionada.titular.fechaNacimiento, nuevaVigencia)

      // En producción, aquí se enviarían los datos al backend
      console.log({
        licenciaOriginal: licenciaSeleccionada,
        nuevaClase: licenciaSeleccionada.claseLicencia,
        nuevaDireccion: licenciaSeleccionada.titular.direccion,
        nuevoDonanteOrganos: licenciaSeleccionada.titular.donanteOrganos,
        vigencia: nuevaVigencia,
        costo: nuevoCosto,
        fechaRenovacion: new Date().toISOString(),
        fechaVencimiento,
        usuarioAdmin: role,
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
      console.error("Error al renovar licencia:", error)
      setError("Ocurrió un error al renovar la licencia. Por favor, intente nuevamente.")
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

  // Verificar si la licencia está vencida
  const isLicenciaVencida = (fechaVencimiento: string) => {
    const vencimiento = new Date(fechaVencimiento)
    const hoy = new Date()
    return vencimiento < hoy
  }

  return (
    <Card className="w-full dark:border-slate-700">
      <CardContent className="pt-6" ref={formRef}>
        {success ? (
          <Alert className="bg-green-50 border-green-200 mb-4 dark:bg-green-900 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Licencia renovada correctamente. Redirigiendo a impresión...
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
                    ref={buscarBtnRef}
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
            </div>

            {licenciaSeleccionada && (
              <>
                <Separator className="dark:bg-slate-700" />

                <div className="space-y-4" ref={datosRef}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold dark:text-white">Datos de la Licencia Actual</h2>
                    <Badge
                      variant={isLicenciaVencida(licenciaSeleccionada.fechaVencimiento) ? "destructive" : "outline"}
                      className="ml-2"
                    >
                      {isLicenciaVencida(licenciaSeleccionada.fechaVencimiento) ? "Vencida" : "Vigente"}
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

                    <div>
                      <Label>Dirección</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {licenciaSeleccionada.titular.direccion}
                      </div>
                    </div>

                    <div>
                      <Label>Donante de Órganos</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {licenciaSeleccionada.titular.donanteOrganos}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      className="transition-transform duration-300 hover:scale-105"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Renovar Licencia
                    </Button>
                  </div>
                </div>

                {editMode && (
                  <>
                    <Separator className="dark:bg-slate-700" />

                    <div className="space-y-4" ref={renovacionRef}>
                      <h2 className="text-xl font-semibold dark:text-white">Renovación de Licencia</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nueva Vigencia</Label>
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">{nuevaVigencia} años</div>
                        </div>

                        <div>
                          <Label>Costo de Renovación</Label>
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                            ${nuevoCosto} (incluye gastos administrativos)
                          </div>
                        </div>

                        <div>
                          <Label>Nueva Fecha de Vencimiento</Label>
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(
                              calcularFechaVencimiento(licenciaSeleccionada.titular.fechaNacimiento, nuevaVigencia),
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditMode(false)}
                          className="transition-transform duration-300 hover:scale-105"
                        >
                          Cancelar
                        </Button>
                        <Button onClick={renovarLicencia} className="transition-transform duration-300 hover:scale-105">
                          Confirmar Renovación
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* INICIO DEL REEMPLAZO */}
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
            {/* FIN DEL REEMPLAZO */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
