"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, CheckCircle2, AlertCircle, Edit, Calendar, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import gsap from "gsap"

// Importar las funciones y datos de clases de licencias
import { calcularVigencia, calcularCosto, calcularFechaVencimiento } from "@/data/clases-licencia"
import { useStats } from "@/contexts/stats-context"
import {
  licenciaService,
  type RenovarLicenciaVencidaRequest,
  type RenovarLicenciaCambioDatosRequest,
} from "@/services/licencia-service"

// Interfaz para la licencia del backend
interface LicenciaBackend {
  id: number
  titular: {
    id: number
    nombre: string
    apellido: string
    fechaNacimiento: string
    tipoDocumento: string
    numeroDocumento: string
    grupoSanguineo: string
    factorRh: string
    direccion: string
    donanteOrganos: boolean
  }
  clase: string
  vigenciaAnios: number
  fechaEmision: string
  fechaVencimiento: string
  costo: number
  numeroCopia?: number
  motivoCopia?: string
  vigente: boolean
  emisorId: number
}

// Interfaz para la licencia formateada para el frontend
interface LicenciaFormateada {
  id: number
  numeroLicencia: string
  titular: {
    id: number
    tipoDocumento: string
    numeroDocumento: string
    nombreApellido: string
    nombre: string
    apellido: string
    fechaNacimiento: string
    direccion: string
    grupoSanguineo: string
    factorRh: string
    donanteOrganos: string
    edad: number
  }
  claseLicencia: string
  fechaEmision: string
  fechaVencimiento: string
  vigencia: number
  costo: number
  vigente: boolean
}

// Actualizar la interfaz de props para incluir los nuevos parámetros
interface RenovarLicenciaFormProps {
  role: string
  initialTipoDocumento?: string
  initialNumeroDocumento?: string
  autoSearch?: boolean
}

// Actualizar el componente para usar los nuevos parámetros
export default function RenovarLicenciaForm({
  role,
  initialTipoDocumento = "",
  initialNumeroDocumento = "",
  autoSearch = false,
}: RenovarLicenciaFormProps) {
  const router = useRouter()
  const [tipoDocumento, setTipoDocumento] = useState<string>(initialTipoDocumento)
  const [numeroDocumento, setNumeroDocumento] = useState<string>(initialNumeroDocumento)
  const [licenciasEncontradas, setLicenciasEncontradas] = useState<LicenciaFormateada[]>([])
  const [licenciaSeleccionada, setLicenciaSeleccionada] = useState<LicenciaFormateada | null>(null)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [nuevaVigencia, setNuevaVigencia] = useState<number>(0)
  const [nuevoCosto, setNuevoCosto] = useState<number>(0)
  const [autoSearchExecuted, setAutoSearchExecuted] = useState<boolean>(false)
  const [animationExecuted, setAnimationExecuted] = useState<boolean>(false)

  // Nuevos estados para edición de datos
  const [motivoRenovacion, setMotivoRenovacion] = useState<"VENCIDA" | "CAMBIO_DATOS">("VENCIDA")
  const [nuevoNombre, setNuevoNombre] = useState<string>("")
  const [nuevoApellido, setNuevoApellido] = useState<string>("")
  const [nuevaDireccion, setNuevaDireccion] = useState<string>("")
  const [editarDatos, setEditarDatos] = useState<boolean>(false)

  const formRef = useRef<HTMLDivElement>(null)
  const busquedaRef = useRef<HTMLDivElement>(null)
  const datosRef = useRef<HTMLDivElement>(null)
  const renovacionRef = useRef<HTMLDivElement>(null)
  const buscarBtnRef = useRef<HTMLButtonElement>(null)
  const licenciasListRef = useRef<HTMLDivElement>(null)

  // Obtener la función para incrementar licencias emitidas
  const { incrementLicenciasEmitidas } = useStats()

  // Añadir un useEffect para realizar la búsqueda automática
  useEffect(() => {
    if (autoSearch && initialTipoDocumento && initialNumeroDocumento && !autoSearchExecuted) {
      setAutoSearchExecuted(true)
      buscarLicencia()
    }
  }, [autoSearch, initialTipoDocumento, initialNumeroDocumento, autoSearchExecuted])

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
    setLicenciasEncontradas([]) // Limpiar licencias encontradas
    setLicenciaSeleccionada(null) // Limpiar licencia seleccionada
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

    // Limpiar licencias encontradas y seleccionada al cambiar el número
    setLicenciasEncontradas([])
    setLicenciaSeleccionada(null)
  }

  // Función para buscar licencias
  const buscarLicencia = async () => {
    setError("")
    setLicenciasEncontradas([])
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

    try {
      // Llamar al servicio para buscar licencias por titular
      const resultado = await licenciaService.buscarLicenciasPorTitular(tipoDocumento, numeroDocumento)

      if (!resultado.success) {
        setError(resultado.message)
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

      // Filtrar solo licencias vigentes
      const licenciasVigentes = resultado.licencias.filter((licencia) => licencia.estado === "VIGENTE")

      if (licenciasVigentes.length === 0) {
        setError("No se encontraron licencias vigentes para este titular")
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

      // Transformar las licencias al formato esperado por el componente
      const licenciasFormateadas: LicenciaFormateada[] = licenciasVigentes.map((licencia) => ({
        id: licencia.id,
        numeroLicencia: licencia.numeroLicencia,
        titular: {
          id: resultado.titular.id,
          tipoDocumento: resultado.titular.tipoDocumento,
          numeroDocumento: resultado.titular.numeroDocumento,
          nombreApellido: `${resultado.titular.apellido}, ${resultado.titular.nombre}`,
          nombre: resultado.titular.nombre,
          apellido: resultado.titular.apellido,
          fechaNacimiento: resultado.titular.fechaNacimiento,
          direccion: resultado.titular.direccion,
          grupoSanguineo: resultado.titular.grupoSanguineo,
          factorRh: resultado.titular.factorRh,
          donanteOrganos: resultado.titular.donanteOrganos ? "SÍ" : "NO",
          edad: calcularEdad(resultado.titular.fechaNacimiento),
        },
        claseLicencia: licencia.claseLicencia,
        fechaEmision: licencia.fechaEmision,
        fechaVencimiento: licencia.fechaVencimiento,
        vigencia: licencia.vigencia,
        costo: licencia.costo,
        vigente: true,
      }))

      // Animación al encontrar licencias
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
                setLicenciasEncontradas(licenciasFormateadas)
                setIsLoading(false)

                // Animar la aparición de la lista de licencias
                setTimeout(() => {
                  if (licenciasListRef.current) {
                    gsap.fromTo(
                      licenciasListRef.current,
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
        setLicenciasEncontradas(licenciasFormateadas)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error al buscar licencias:", error)
      setError("Ocurrió un error al buscar licencias. Por favor, intente nuevamente.")
      setIsLoading(false)
    }
  }

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date()
    const fechaNac = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - fechaNac.getFullYear()
    const mes = hoy.getMonth() - fechaNac.getMonth()

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--
    }

    return edad
  }

  // Función para seleccionar una licencia
  const seleccionarLicencia = (licencia: LicenciaFormateada) => {
    setLicenciaSeleccionada(licencia)

    // Inicializar los campos de edición con los valores actuales
    if (licencia.titular.nombre && licencia.titular.apellido) {
      setNuevoNombre(licencia.titular.nombre)
      setNuevoApellido(licencia.titular.apellido)
      setNuevaDireccion(licencia.titular.direccion)
    }

    // Verificar si la licencia está vencida o próxima a vencer
    const fechaVencimiento = new Date(licencia.fechaVencimiento)
    const hoy = new Date()

    // Preseleccionar el motivo de renovación según el estado de la licencia
    if (fechaVencimiento < hoy) {
      // Si está vencida, preseleccionar "VENCIDA"
      setMotivoRenovacion("VENCIDA")
      setEditarDatos(false)
    } else {
      // Si está vigente, preseleccionar "CAMBIO_DATOS"
      setMotivoRenovacion("CAMBIO_DATOS")
      setEditarDatos(true)
    }

    // Permitir renovación si está vencida o a menos de 6 meses de vencer
    const seisMesesDespues = new Date(hoy)
    seisMesesDespues.setMonth(hoy.getMonth() + 6)

    if (fechaVencimiento > seisMesesDespues && motivoRenovacion === "VENCIDA") {
      setError(
        "Esta licencia no puede renovarse por vencimiento aún. Solo se pueden renovar licencias vencidas o a menos de 6 meses de vencer. Puede renovarla por cambio de datos.",
      )
      setMotivoRenovacion("CAMBIO_DATOS")
      setEditarDatos(true)
    }

    // Calcular nueva vigencia y costo
    calcularVigenciaYCosto(licencia)

    // Animar la aparición de los datos de la licencia
    setTimeout(() => {
      if (datosRef.current) {
        gsap.fromTo(datosRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" })
      }
    }, 100)

    // Activar automáticamente el modo de edición
    setTimeout(() => {
      setEditMode(true)
    }, 500)
  }

  // Calcular nueva vigencia y costo
  const calcularVigenciaYCosto = (licencia: LicenciaFormateada) => {
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
  const renovarLicencia = async () => {
    try {
      setIsLoading(true)
      setError("")

      if (!licenciaSeleccionada) {
        setError("No hay licencia seleccionada para renovar")
        setIsLoading(false)
        return
      }

      // Validar campos si es por cambio de datos
      if (motivoRenovacion === "CAMBIO_DATOS") {
        if (!nuevoNombre.trim() || !nuevoApellido.trim() || !nuevaDireccion.trim()) {
          setError("Debe completar todos los campos para renovar por cambio de datos")
          setIsLoading(false)
          return
        }
      }

      // Preparar los datos según el motivo de renovación
      let datosRenovacion: RenovarLicenciaVencidaRequest | RenovarLicenciaCambioDatosRequest

      if (motivoRenovacion === "CAMBIO_DATOS") {
        datosRenovacion = {
          licenciaId: licenciaSeleccionada.id,
          motivoRenovacion: "CAMBIO_DATOS",
          nuevoNombre: nuevoNombre,
          nuevoApellido: nuevoApellido,
          nuevaDireccion: nuevaDireccion,
          numeroCopia: 1,
          motivoCopia: "Renovación por cambio de datos",
          licenciaOriginalId: licenciaSeleccionada.id,
        }
      } else {
        datosRenovacion = {
          licenciaId: licenciaSeleccionada.id,
          motivoRenovacion: "VENCIDA",
          numeroCopia: 1,
          motivoCopia: "Renovación por licencia vencida o próxima a vencer",
          licenciaOriginalId: licenciaSeleccionada.id,
        }
      }

      // Llamar al servicio para renovar la licencia
      const resultado = await licenciaService.renovarLicencia(datosRenovacion)

      if (!resultado.success) {
        setError(resultado.message)
        setIsLoading(false)
        return
      }

      // Incrementar el contador de licencias emitidas
      incrementLicenciasEmitidas()

      // Mostrar mensaje de éxito
      setSuccess(true)
      setIsLoading(false)

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        router.push(`/dashboard/licencias/imprimir?role=${role}`)
      }, 2000)
    } catch (error) {
      console.error("Error al renovar licencia:", error)
      setError("Ocurrió un error al renovar la licencia. Por favor, intente nuevamente.")
      setIsLoading(false)
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      timeZone: 'UTC',
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Verificar si la licencia está vencida
  const isLicenciaVencida = (fechaVencimiento: string) => {
    const vencimiento = new Date(fechaVencimiento)
    const hoy = new Date()
    return vencimiento < hoy
  }

  // Obtener el estado de la licencia para mostrar el badge
  const getLicenciaEstado = (fechaVencimiento: string) => {
    const vencimiento = new Date(fechaVencimiento)
    const hoy = new Date()

    // Si está vencida
    if (vencimiento < hoy) {
      return { text: "Vencida", variant: "destructive" as const }
    }

    // Si vence en menos de 30 días
    const treintaDias = new Date(hoy)
    treintaDias.setDate(hoy.getDate() + 30)
    if (vencimiento < treintaDias) {
      return { text: "Próxima a vencer", variant: "warning" as const }
    }

    // Si vence en menos de 6 meses
    const seisMeses = new Date(hoy)
    seisMeses.setMonth(hoy.getMonth() + 6)
    if (vencimiento < seisMeses) {
      return { text: "Renovable", variant: "outline" as const }
    }

    // Si no está próxima a vencer
    return { text: "Vigente", variant: "secondary" as const }
  }

  // Volver a la lista de licencias
  const volverALista = () => {
    setLicenciaSeleccionada(null)
    setEditMode(false)
    setEditarDatos(false)

    // Animar la aparición de la lista de licencias
    setTimeout(() => {
      if (licenciasListRef.current) {
        gsap.fromTo(
          licenciasListRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
        )
      }
    }, 100)
  }

  // Cambiar el motivo de renovación
  const cambiarMotivoRenovacion = (motivo: "VENCIDA" | "CAMBIO_DATOS") => {
    setMotivoRenovacion(motivo)
    setEditarDatos(motivo === "CAMBIO_DATOS")
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
              <h2 className="text-xl font-semibold dark:text-white">Buscar Licencias por Documento</h2>

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

            {licenciasEncontradas.length > 0 && !licenciaSeleccionada && (
              <>
                <Separator className="dark:bg-slate-700" />

                <div className="space-y-4" ref={licenciasListRef}>
                  <h2 className="text-xl font-semibold dark:text-white">
                    Licencias Vigentes Encontradas ({licenciasEncontradas.length})
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    {licenciasEncontradas.map((licencia) => {
                      const estado = getLicenciaEstado(licencia.fechaVencimiento)
                      return (
                        <div
                          key={licencia.numeroLicencia}
                          className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          onClick={() => seleccionarLicencia(licencia)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">
                                Licencia Clase {licencia.claseLicencia}
                                <Badge variant={estado.variant} className="ml-2">
                                  {estado.text}
                                </Badge>
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {licencia.titular.nombreApellido} - {licencia.titular.tipoDocumento}{" "}
                                {licencia.titular.numeroDocumento}
                              </p>
                              <div className="mt-2 flex items-center gap-4">
                                <div className="flex items-center text-sm">
                                  <FileText className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                  N°: {licencia.numeroLicencia}
                                </div>
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                  Vence: {formatDate(licencia.fechaVencimiento)}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isLicenciaVencida(licencia.fechaVencimiento) ? "destructive" : "outline"}
                              className="ml-2"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              {isLicenciaVencida(licencia.fechaVencimiento) ? "Renovar" : "Modificar"}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {licenciaSeleccionada && (
              <>
                <Separator className="dark:bg-slate-700" />

                <div className="space-y-4" ref={datosRef}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold dark:text-white">
                      {isLicenciaVencida(licenciaSeleccionada.fechaVencimiento)
                        ? "Datos de la Licencia a Renovar"
                        : "Datos de la Licencia a Modificar"}
                    </h2>
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

                  <div className="flex justify-between">
                    <Button
                      onClick={volverALista}
                      variant="outline"
                      className="transition-transform duration-300 hover:scale-105"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver a la lista
                    </Button>

                    <Button
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      className="transition-transform duration-300 hover:scale-105"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isLicenciaVencida(licenciaSeleccionada.fechaVencimiento)
                        ? "Renovar Licencia"
                        : "Modificar Datos"}
                    </Button>
                  </div>
                </div>

                {editMode && (
                  <>
                    <Separator className="dark:bg-slate-700" />

                    <div className="space-y-4" ref={renovacionRef}>
                      <h2 className="text-xl font-semibold dark:text-white">
                        {motivoRenovacion === "VENCIDA" ? "Renovación de Licencia" : "Modificación de Datos"}
                      </h2>

                      <div className="mb-4">
                        <Label>Motivo de Renovación</Label>
                        <Select
                          value={motivoRenovacion}
                          onValueChange={(value) => cambiarMotivoRenovacion(value as "VENCIDA" | "CAMBIO_DATOS")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="VENCIDA"
                              disabled={
                                !isLicenciaVencida(licenciaSeleccionada.fechaVencimiento) &&
                                new Date(licenciaSeleccionada.fechaVencimiento) >
                                  new Date(new Date().setMonth(new Date().getMonth() + 6))
                              }
                            >
                              Por vencimiento
                            </SelectItem>
                            <SelectItem
                              value="CAMBIO_DATOS"
                              disabled={isLicenciaVencida(licenciaSeleccionada.fechaVencimiento)}
                            >
                              Por cambio de datos
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {editarDatos && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800 mb-4">
                          <div>
                            <Label htmlFor="nuevoNombre">Nuevo Nombre</Label>
                            <Input
                              id="nuevoNombre"
                              value={nuevoNombre}
                              onChange={(e) => setNuevoNombre(e.target.value)}
                              placeholder="Ingrese nuevo nombre"
                            />
                          </div>

                          <div>
                            <Label htmlFor="nuevoApellido">Nuevo Apellido</Label>
                            <Input
                              id="nuevoApellido"
                              value={nuevoApellido}
                              onChange={(e) => setNuevoApellido(e.target.value)}
                              placeholder="Ingrese nuevo apellido"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="nuevaDireccion">Nueva Dirección</Label>
                            <Input
                              id="nuevaDireccion"
                              value={nuevaDireccion}
                              onChange={(e) => setNuevaDireccion(e.target.value)}
                              placeholder="Ingrese nueva dirección"
                            />
                          </div>
                        </div>
                      )}

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
                        <Button
                          onClick={renovarLicencia}
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
                              Procesando...
                            </span>
                          ) : motivoRenovacion === "VENCIDA" ? (
                            "Confirmar Renovación"
                          ) : (
                            "Confirmar Modificación"
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex justify-end mt-6">
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
        )}
      </CardContent>
    </Card>
  )
}
