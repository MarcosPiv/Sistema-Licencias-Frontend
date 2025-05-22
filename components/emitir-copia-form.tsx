"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Copy,
  ChevronRight,
  Clock,
  AlertTriangle,
} from "lucide-react"
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
  const [tipoDocumento, setTipoDocumento] = useState("")
  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [licenciasEncontradas, setLicenciasEncontradas] = useState<typeof licenciasEmitidas>([])
  const [licenciaSeleccionada, setLicenciaSeleccionada] = useState<(typeof licenciasEmitidas)[0] | null>(null)
  const [motivoCopia, setMotivoCopia] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mostrarListaLicencias, setMostrarListaLicencias] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)
  const busquedaRef = useRef<HTMLDivElement>(null)
  const datosRef = useRef<HTMLDivElement>(null)
  const copiaRef = useRef<HTMLDivElement>(null)
  const listaLicenciasRef = useRef<HTMLDivElement>(null)

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
    setLicenciasEncontradas([]) // Limpiar licencias encontradas
    setLicenciaSeleccionada(null) // Limpiar licencia seleccionada
    setMostrarListaLicencias(false) // Ocultar lista de licencias
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
    setMostrarListaLicencias(false)
  }

  // Función para buscar licencias
  const buscarLicencia = () => {
    setError("")
    setLicenciasEncontradas([])
    setLicenciaSeleccionada(null)
    setMostrarListaLicencias(false)
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
      // Buscar todas las licencias asociadas al documento
      const licenciasDelTitular = licenciasEmitidas.filter(
        (licencia) =>
          licencia.titular.tipoDocumento === tipoDocumento && licencia.titular.numeroDocumento === numeroDocumento,
      )

      if (licenciasDelTitular.length === 0) {
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
                setLicenciasEncontradas(licenciasDelTitular)
                setMostrarListaLicencias(true)
                setIsLoading(false)

                // Animar la aparición de la lista de licencias
                setTimeout(() => {
                  if (listaLicenciasRef.current) {
                    gsap.fromTo(
                      listaLicenciasRef.current,
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
        setLicenciasEncontradas(licenciasDelTitular)
        setMostrarListaLicencias(true)
        setIsLoading(false)
      }
    }, 500)
  }

  // Función para seleccionar una licencia específica
  const seleccionarLicencia = (licencia: (typeof licenciasEmitidas)[0]) => {
    // Verificar si la licencia está vencida
    const fechaVencimiento = new Date(licencia.fechaVencimiento)
    const hoy = new Date()

    if (fechaVencimiento < hoy) {
      setError("No se puede emitir copia de una licencia vencida. Debe renovarla.")
      return
    }

    setLicenciaSeleccionada(licencia)
    setMostrarListaLicencias(false)
    setError("") // Limpiar cualquier error previo

    // Animar la aparición de los datos de la licencia
    setTimeout(() => {
      if (datosRef.current) {
        gsap.fromTo(datosRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" })
      }
    }, 100)
  }

  // Función para volver a la lista de licencias
  const volverALista = () => {
    // Animar la desaparición de los datos de la licencia
    if (datosRef.current) {
      gsap.to(datosRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
          setLicenciaSeleccionada(null)
          setMostrarListaLicencias(true)
          setMotivoCopia("") // Limpiar el motivo de copia

          // Animar la aparición de la lista de licencias
          setTimeout(() => {
            if (listaLicenciasRef.current) {
              gsap.fromTo(
                listaLicenciasRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
              )
            }
          }, 100)
        },
      })
    } else {
      setLicenciaSeleccionada(null)
      setMostrarListaLicencias(true)
      setMotivoCopia("") // Limpiar el motivo de copia
    }
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

  // Determinar el estado de la licencia (vencida, próxima a vencer, vigente)
  const getLicenciaEstado = (fechaVencimiento: string) => {
    const fechaVenc = new Date(fechaVencimiento)
    const hoy = new Date()

    // Calcular la diferencia en días
    const diferenciaDias = Math.floor((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    if (fechaVenc < hoy) {
      return {
        label: "Vencida",
        color: "destructive",
        icon: <AlertCircle className="h-4 w-4 mr-1" />,
        canCopy: false,
        message: "No se puede emitir copia (vencida)",
      }
    } else if (diferenciaDias <= 60) {
      return {
        label: "Próxima a vencer",
        color: "warning",
        icon: <AlertTriangle className="h-4 w-4 mr-1" />,
        canCopy: true,
        message: "Puede emitir copia",
      }
    } else {
      return {
        label: "Vigente",
        color: "default",
        icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
        canCopy: true,
        message: "Puede emitir copia",
      }
    }
  }

  // Renderizar el formulario de búsqueda
  const renderBusquedaForm = () => (
    <div className="space-y-4" ref={busquedaRef}>
      <h2 className="text-xl font-semibold dark:text-white">Buscar Licencia por Documento</h2>

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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
  )

  // Renderizar la lista de licencias encontradas
  const renderListaLicencias = () => {
    if (!mostrarListaLicencias || licenciasEncontradas.length === 0) return null

    return (
      <>
        <Separator className="dark:bg-slate-700" />
        <div className="space-y-4" ref={listaLicenciasRef}>
          <h2 className="text-xl font-semibold dark:text-white">
            Licencias de {licenciasEncontradas[0].titular.nombreApellido}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Seleccione la licencia para la cual desea emitir una copia:
          </p>

          <div className="space-y-3">
            {licenciasEncontradas.map((licencia) => {
              const estado = getLicenciaEstado(licencia.fechaVencimiento)

              return (
                <div
                  key={licencia.numeroLicencia}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    estado.canCopy
                      ? "hover:border-blue-400 hover:shadow-md cursor-pointer"
                      : "opacity-70 cursor-not-allowed"
                  }`}
                  onClick={() => estado.canCopy && seleccionarLicencia(licencia)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium flex items-center">
                        Clase {licencia.claseLicencia}
                        <Badge variant={estado.color as any} className="ml-2 flex items-center">
                          {estado.icon}
                          {estado.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Licencia N° {licencia.numeroLicencia}
                      </div>
                      <div className="text-sm flex items-center mt-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400 mr-1" />
                        Vence: {formatDate(licencia.fechaVencimiento)}
                      </div>
                    </div>
                    <div>
                      {estado.canCopy ? (
                        <Button size="sm" variant="ghost" className="flex items-center">
                          <Copy className="h-4 w-4 mr-1" />
                          Emitir copia
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      ) : (
                        <span className="text-xs text-red-500">{estado.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  // Renderizar los datos de la licencia
  const renderDatosLicencia = () => {
    if (!licenciaSeleccionada) return null

    return (
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
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">{licenciaSeleccionada.numeroLicencia}</div>
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
        </div>
      </>
    )
  }

  // Renderizar el formulario de emisión de copia
  const renderEmisionCopiaForm = () => {
    if (!licenciaSeleccionada) return null

    return (
      <>
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
        </div>
      </>
    )
  }

  // Renderizar los botones de acción
  const renderActionButtons = () => (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          if (licenciaSeleccionada) {
            volverALista()
          } else {
            router.push(`/dashboard?role=${role}`)
          }
        }}
        className="transition-transform duration-300 hover:scale-105"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {licenciaSeleccionada ? "Volver a la lista" : "Volver"}
      </Button>

      {licenciaSeleccionada && (
        <Button onClick={confirmarEmisionCopia} className="transition-transform duration-300 hover:scale-105">
          <Copy className="h-4 w-4 mr-2" />
          Emitir Copia
        </Button>
      )}
    </div>
  )

  // Renderizar mensaje de éxito
  const renderSuccessMessage = () => (
    <Alert className="bg-green-50 border-green-200 mb-4 dark:bg-green-900 dark:border-green-800">
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="text-green-600 dark:text-green-400">
        Copia de licencia emitida correctamente. Redirigiendo a impresión...
      </AlertDescription>
    </Alert>
  )

  return (
    <Card className="w-full dark:border-slate-700">
      <div className="p-6" ref={formRef}>
        {success ? (
          renderSuccessMessage()
        ) : (
          <div className="space-y-6">
            {renderBusquedaForm()}
            {renderListaLicencias()}
            {licenciaSeleccionada && renderDatosLicencia()}
            {licenciaSeleccionada && renderEmisionCopiaForm()}
            {renderActionButtons()}
          </div>
        )}
      </div>
    </Card>
  )
}
