"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Search, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { titularesDB } from "@/data/titular-data"
import gsap from "gsap"

// Importar las funciones y datos de clases de licencias
import {
  clasesLicencia,
  calcularVigencia,
  calcularCosto,
  calcularFechaVencimiento,
  puedeObtenerLicenciaProfesional,
} from "@/data/clases-licencia"

// Importar el hook de estadísticas
import { useStats } from "@/contexts/stats-context"

// Tipo para el titular
interface Titular {
  tipoDocumento: string
  numeroDocumento: string
  nombreApellido: string
  fechaNacimiento: string
  direccion: string
  grupoSanguineo: string
  factorRh: string
  donanteOrganos: string
  edad: number
  licenciasAnteriores?: any[] // Licencias anteriores del titular
}

interface EmitirLicenciaFormProps {
  role: string
}

// Función de utilidad para animar elementos con error
const animateErrorField = (element: HTMLElement | null) => {
  if (!element) return

  // Guardar el borde original
  const originalBorder = element.style.border

  // Animar el borde y el fondo
  gsap
    .timeline()
    .to(element, {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.5)",
      duration: 0.3,
    })
    .to(element, {
      backgroundColor: "",
      border: originalBorder,
      duration: 0.3,
      delay: 0.2,
    })

  // Animar el shake
  gsap.fromTo(element, { x: -5 }, { x: 5, duration: 0.1, repeat: 4, yoyo: true })
}

export default function EmitirLicenciaForm({ role }: EmitirLicenciaFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tipoDocumento, setTipoDocumento] = useState<string>("")
  const [numeroDocumento, setNumeroDocumento] = useState<string>("")
  const [claseLicencia, setClaseLicencia] = useState<string>("")
  const [titular, setTitular] = useState<Titular | null>(null)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [vigencia, setVigencia] = useState<number>(0)
  const [costo, setCosto] = useState<number>(0)
  const [errorEdad, setErrorEdad] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorProfesional, setErrorProfesional] = useState<string>("")
  const [esPrimeraVez, setEsPrimeraVez] = useState<boolean>(true)

  const formRef = useRef<HTMLDivElement>(null)
  const busquedaRef = useRef<HTMLDivElement>(null)
  const datosRef = useRef<HTMLDivElement>(null)
  const emitirRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const initialLoadRef = useRef<boolean>(true)

  // Obtener la función para incrementar licencias emitidas
  const { incrementLicenciasEmitidas } = useStats()

  // Efecto para cargar parámetros de la URL y realizar búsqueda automática
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false

      const tipoDoc = searchParams.get("tipoDocumento")
      const numDoc = searchParams.get("numeroDocumento")
      const autoSearch = searchParams.get("autoSearch")

      if (tipoDoc && numDoc) {
        setTipoDocumento(tipoDoc)
        setNumeroDocumento(numDoc)

        // Si autoSearch es true, realizar la búsqueda automáticamente
        if (autoSearch === "true") {
          // Pequeño retraso para asegurar que los estados se actualicen
          setTimeout(() => {
            buscarTitular(tipoDoc, numDoc)
          }, 100)
        }
      }
    }
  }, [searchParams])

  useEffect(() => {
    // Animación inicial del formulario
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
    }
  }, [])

  useEffect(() => {
    if (claseLicencia && titular) {
      calcularVigenciaYCosto()

      // Animar la sección de emisión
      if (emitirRef.current) {
        gsap.fromTo(
          emitirRef.current.querySelectorAll(".animate-item"),
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
        )
      }
    }
  }, [claseLicencia, titular])

  // Manejar cambio en el tipo de documento
  const handleTipoDocumentoChange = (value: string) => {
    setTipoDocumento(value)
    setNumeroDocumento("") // Limpiar el campo al cambiar el tipo
  }

  // Reemplazar el manejador actual de cambio de número de documento
  const handleNumeroDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (tipoDocumento === "DNI") {
      // Para DNI, solo permitir números
      const onlyNumbers = value.replace(/[^0-9]/g, "")
      setNumeroDocumento(onlyNumbers)

      // Validación en tiempo real para DNI
      if (!/^\d+$/.test(value) && value.length > 0) {
        animateErrorField(e.target)
      }
    } else if (tipoDocumento === "Pasaporte") {
      // Para Pasaporte, convertir a mayúsculas
      setNumeroDocumento(value.toUpperCase())
    } else {
      // Si no hay tipo seleccionado, permitir cualquier entrada
      setNumeroDocumento(value)
    }
  }

  // Función de búsqueda que puede recibir parámetros opcionales
  const buscarTitular = (tipoDoc?: string, numDoc?: string) => {
    setError("")
    setErrorEdad("")
    setErrorProfesional("")
    setTitular(null)
    setIsLoading(true)

    // Usar los parámetros proporcionados o los valores del estado
    const tipo = tipoDoc || tipoDocumento
    const numero = numDoc || numeroDocumento

    if (!tipo || !numero) {
      setError("Debe completar tipo y número de documento")
      setIsLoading(false)
      // Animación de error mejorada
      if (busquedaRef.current) {
        gsap.fromTo(
          busquedaRef.current,
          { x: -8 },
          { x: 8, duration: 0.1, repeat: 5, yoyo: true, ease: "power2.inOut" },
        )

        // Resaltar los campos con error
        const inputField = busquedaRef.current.querySelector("input")
        const selectField = busquedaRef.current.querySelector("[data-value]")

        if (!tipo && selectField) {
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

        if (!numero && inputField) {
          gsap.fromTo(
            inputField,
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
      // Simular una pequeña demora para mostrar el estado de carga
      setTimeout(() => {
        // Buscar en la base de datos de titulares importada
        const titularEncontrado = titularesDB.find((t) => t.tipoDocumento === tipo && t.numeroDocumento === numero)

        if (!titularEncontrado) {
          setError("No se encontró ningún titular con ese documento")
          setIsLoading(false)
          // Animación de error mejorada
          if (busquedaRef.current) {
            gsap.fromTo(
              busquedaRef.current,
              { x: -8 },
              { x: 8, duration: 0.1, repeat: 5, yoyo: true, ease: "power2.inOut" },
            )

            // Animar el mensaje de error para que sea más visible
            setTimeout(() => {
              const errorAlert = busquedaRef.current?.querySelector('[role="alert"]')
              if (errorAlert) {
                gsap.fromTo(
                  errorAlert,
                  { scale: 0.95, opacity: 0.8 },
                  {
                    scale: 1,
                    opacity: 1,
                    duration: 0.3,
                    ease: "back.out(1.7)",
                  },
                )
              }
            }, 100)
          }
          return
        }

        // Animación al encontrar titular (mejorada)
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
                  setTitular(titularEncontrado)
                  setIsLoading(false)
                  // Animar la aparición de los datos del titular
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
          setTitular(titularEncontrado)
          setIsLoading(false)
        }
      }, 500) // Pequeña demora para mostrar el estado de carga
    } catch (error) {
      console.error("Error al buscar titular:", error)
      setError("Ocurrió un error al buscar el titular. Por favor, intente nuevamente.")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      // Limpiar todas las animaciones GSAP al desmontar
      gsap.killTweensOf("*")
    }
  }, [])

  const calcularVigenciaYCosto = () => {
    if (!titular || !claseLicencia) return

    setErrorEdad("")
    setErrorProfesional("")

    // Obtener la clase de licencia seleccionada
    const claseSeleccionada = clasesLicencia.find((c) => c.id === claseLicencia)

    if (!claseSeleccionada) {
      setError("Clase de licencia no válida")
      return
    }

    // Verificar edad mínima según clase
    if (titular.edad < claseSeleccionada.edadMinima) {
      setErrorEdad(`La edad mínima para la clase ${claseLicencia} es de ${claseSeleccionada.edadMinima} años`)
      setVigencia(0)
      setCosto(0)
      return
    }

    // Verificar requisitos adicionales para licencias profesionales
    if (claseSeleccionada.esProfesional) {
      const verificacion = puedeObtenerLicenciaProfesional(titular.edad, titular.licenciasAnteriores || [])

      if (!verificacion.puede) {
        setErrorProfesional(verificacion.motivo)
        setVigencia(0)
        setCosto(0)
        return
      }
    }

    // Determinar si es primera vez para esta clase
    const tieneEstaClase = (titular.licenciasAnteriores || []).some((lic) => lic.claseLicencia === claseLicencia)
    setEsPrimeraVez(!tieneEstaClase)

    // Calcular vigencia según edad y si es primera vez
    const vigenciaCalculada = calcularVigencia(titular.edad, !tieneEstaClase)

    // Calcular costo según clase y vigencia
    const costoCalculado = calcularCosto(claseLicencia, vigenciaCalculada, false)

    setVigencia(vigenciaCalculada)
    setCosto(costoCalculado)
  }

  const emitirLicencia = () => {
    try {
      // Calcular fecha de vencimiento basada en la fecha de nacimiento
      const fechaVencimiento = calcularFechaVencimiento(titular.fechaNacimiento, vigencia)

      // En producción, aquí se enviarían los datos al backend
      console.log({
        titular,
        claseLicencia,
        vigencia,
        costo,
        fechaEmision: new Date().toISOString(),
        fechaVencimiento,
        esPrimeraVez,
        usuarioAdmin: role,
      })

      // Incrementar el contador de licencias emitidas
      incrementLicenciasEmitidas()

      // Mostrar mensaje de éxito inmediatamente
      setSuccess(true)

      // Redireccionar después de 2 segundos para dar tiempo a ver el mensaje
      setTimeout(() => {
        router.push(`/dashboard/licencias/imprimir?role=${role}`)
      }, 2000)
    } catch (error) {
      console.error("Error al emitir licencia:", error)
      setError("Ocurrió un error al emitir la licencia. Por favor, intente nuevamente.")
    }
  }

  return (
    <Card className="w-full dark:border-slate-700">
      <CardContent className="pt-6" ref={formRef}>
        {success ? (
          <Alert className="bg-green-50 border-green-200 mb-4 dark:bg-green-900 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Licencia emitida correctamente. Redirigiendo a impresión...
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4" ref={busquedaRef}>
              <h2 className="text-xl font-semibold dark:text-white">Buscar Titular</h2>

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
                    onClick={() => buscarTitular()}
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

            {titular && (
              <>
                <Separator className="dark:bg-slate-700" />

                <div className="space-y-4" ref={datosRef}>
                  <h2 className="text-xl font-semibold dark:text-white">Datos del Titular</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre y Apellido</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">{titular.nombreApellido}</div>
                    </div>

                    <div>
                      <Label>Fecha de Nacimiento</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {new Date(titular.fechaNacimiento).toLocaleDateString("es-ES")} ({titular.edad} años)
                      </div>
                    </div>

                    <div>
                      <Label>Dirección</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">{titular.direccion}</div>
                    </div>

                    <div>
                      <Label>Grupo Sanguíneo y Factor RH</Label>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {titular.grupoSanguineo} {titular.factorRh}
                      </div>
                    </div>
                  </div>

                  <Separator className="dark:bg-slate-700" />

                  <div className="space-y-4" ref={emitirRef}>
                    <h2 className="text-xl font-semibold dark:text-white">Emitir Licencia</h2>

                    {errorEdad && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorEdad}</AlertDescription>
                      </Alert>
                    )}

                    {errorProfesional && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorProfesional}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="animate-item">
                        <Label htmlFor="claseLicencia">Clase de Licencia</Label>
                        <Select
                          value={claseLicencia}
                          onValueChange={(value) => {
                            setClaseLicencia(value)
                          }}
                        >
                          <SelectTrigger id="claseLicencia">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {clasesLicencia.map((clase) => (
                              <SelectItem key={clase.id} value={clase.id}>
                                {clase.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {claseLicencia && !errorEdad && !errorProfesional && (
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                          <div className="animate-item">
                            <Label>Vigencia</Label>
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">{vigencia} años</div>
                          </div>

                          <div className="animate-item">
                            <Label>Costo</Label>
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">${costo}</div>
                          </div>
                        </div>
                      )}
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

                      {claseLicencia && !errorEdad && !errorProfesional && vigencia > 0 && (
                        <Button onClick={emitirLicencia} className="transition-transform duration-300 hover:scale-105">
                          Emitir Licencia
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!titular && (
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
  )
}
