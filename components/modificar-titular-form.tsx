"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2, Search, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import gsap from "gsap"
import type { Titular } from "@/services/titular-service"
import { useToast } from "@/hooks/use-toast"

// Esquema para el formulario de búsqueda
const busquedaSchema = z.object({
  tipoDocumento: z.string().min(1, "Seleccione un tipo de documento"),
  numeroDocumento: z.string().min(1, "Ingrese un número de documento"),
})

// Esquema para el formulario de modificación
const formSchema = z.object({
  tipoDocumento: z.string().min(1, "Seleccione un tipo de documento"),
  numeroDocumento: z.string().min(1, "Ingrese un número de documento"),
  nombreApellido: z.string().min(3, "Ingrese nombre y apellido completos"),
  fechaNacimiento: z
    .string()
    .min(1, "Seleccione una fecha de nacimiento")
    .refine(
      (value) => {
        const fechaNacimiento = new Date(value)
        const hoy = new Date()

        // Calcular edad
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
        const m = hoy.getMonth() - fechaNacimiento.getMonth()

        // Ajustar edad si aún no ha cumplido años en este año
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
          edad--
        }

        return edad >= 17 // Cambiado de 18 a 17 años
      },
      {
        message: "El titular debe tener al menos 17 años",
      },
    ),
  direccion: z.string().min(5, "Ingrese una dirección válida"),
  grupoSanguineo: z.string().min(1, "Seleccione un grupo sanguíneo"),
  factorRh: z.string().min(1, "Seleccione un factor RH"),
  donanteOrganos: z.string().min(1, "Seleccione si es donante de órganos"),
})

interface ModificarTitularFormProps {
  role: string
}

export default function ModificarTitularForm({ role }: ModificarTitularFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [success, setSuccess] = useState(false)
  const [titularEncontrado, setTitularEncontrado] = useState<Titular | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const formFieldsRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  // Formulario de búsqueda
  const busquedaForm = useForm<z.infer<typeof busquedaSchema>>({
    resolver: zodResolver(busquedaSchema),
    defaultValues: {
      tipoDocumento: "",
      numeroDocumento: "",
    },
  })

  // Formulario de modificación
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoDocumento: "",
      numeroDocumento: "",
      nombreApellido: "",
      fechaNacimiento: "",
      direccion: "",
      grupoSanguineo: "",
      factorRh: "",
      donanteOrganos: "",
    },
  })

  // Manejar la validación del número de documento basado en el tipo seleccionado
  const validateNumeroDocumento = (value: string) => {
    if (tipoDocumento === "DNI" && !/^\d+$/.test(value)) {
      form.setError("numeroDocumento", {
        type: "manual",
        message: "Para DNI solo se permiten números",
      })
      return false
    }
    return true
  }

  useEffect(() => {
    const subscription = busquedaForm.watch((value, { name }) => {
      if (name === "tipoDocumento") {
        setTipoDocumento(value.tipoDocumento || "")
        // Limpiar el campo de número de documento al cambiar el tipo
        busquedaForm.setValue("numeroDocumento", "")
        busquedaForm.clearErrors("numeroDocumento")
      }
    })

    return () => subscription.unsubscribe()
  }, [busquedaForm])

  useEffect(() => {
    // Animación de los campos del formulario
    if (titularEncontrado && formFieldsRef.current) {
      gsap.fromTo(
        formFieldsRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        },
      )
    }

    // Animación de los botones
    if (titularEncontrado && buttonsRef.current) {
      gsap.fromTo(
        buttonsRef.current.children,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          delay: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
        },
      )
    }
  }, [titularEncontrado])

  const buscarTitular = async (values: z.infer<typeof busquedaSchema>) => {
    console.log("Iniciando búsqueda de titular:", values)
    setBuscando(true)
    setError(null)

    try {
      // Validar el número de documento según el tipo
      if (values.tipoDocumento === "DNI" && !/^\d+$/.test(values.numeroDocumento)) {
        throw new Error("Para DNI solo se permiten números")
      }

      // Simulación de datos para demostración
      // En un entorno real, esto sería reemplazado por la llamada al servicio real
      const titularSimulado: Titular = {
        id: 1,
        tipoDocumento: values.tipoDocumento,
        numeroDocumento: values.numeroDocumento,
        nombreApellido: values.tipoDocumento === "DNI" ? "Juan Pérez" : "María González",
        fechaNacimiento: "1985-06-15",
        direccion: "Av. Siempre Viva 742",
        grupoSanguineo: "A",
        factorRh: "+",
        donanteOrganos: "Si",
        fechaAlta: "2022-01-15",
      }

      // Simular un pequeño retraso para mostrar el estado de carga
      await new Promise((resolve) => setTimeout(resolve, 800))

      console.log("Titular encontrado:", titularSimulado)
      setTitularEncontrado(titularSimulado)

      // Cargar los datos en el formulario de modificación
      form.reset({
        tipoDocumento: titularSimulado.tipoDocumento,
        numeroDocumento: titularSimulado.numeroDocumento,
        nombreApellido: titularSimulado.nombreApellido,
        fechaNacimiento: titularSimulado.fechaNacimiento,
        direccion: titularSimulado.direccion,
        grupoSanguineo: titularSimulado.grupoSanguineo,
        factorRh: titularSimulado.factorRh,
        donanteOrganos: titularSimulado.donanteOrganos,
      })

      setTipoDocumento(titularSimulado.tipoDocumento)

      toast({
        title: "Titular encontrado",
        description: "Se han cargado los datos del titular",
      })
    } catch (error) {
      console.error("Error al buscar titular:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al buscar el titular")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al buscar el titular",
        variant: "destructive",
      })
      setTitularEncontrado(null)
    } finally {
      setBuscando(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validar manualmente el número de documento
    if (!validateNumeroDocumento(values.numeroDocumento)) {
      return
    }

    setGuardando(true)
    try {
      // Simular actualización del titular
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulación de éxito
      setSuccess(true)
      toast({
        title: "Éxito",
        description: "Titular actualizado correctamente",
      })

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        router.push(`/dashboard?role=${role}`)
      }, 2000)
    } catch (error) {
      console.error("Error al actualizar titular:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el titular",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  const volverAlDashboard = () => {
    router.push(`/dashboard?role=${role}`)
  }

  return (
    <div className="space-y-6">
      {/* Formulario de búsqueda */}
      {!titularEncontrado && !success && (
        <Card className="shadow-md border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Buscar Titular</CardTitle>
            <CardDescription>Ingrese el tipo y número de documento del titular que desea modificar</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...busquedaForm}>
              <form onSubmit={busquedaForm.handleSubmit(buscarTitular)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={busquedaForm.control}
                    name="tipoDocumento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DNI">DNI</SelectItem>
                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={busquedaForm.control}
                    name="numeroDocumento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Documento *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              busquedaForm.getValues("tipoDocumento") === "DNI"
                                ? "Ingrese solo números"
                                : "Ingrese números y letras"
                            }
                            maxLength={busquedaForm.getValues("tipoDocumento") === "DNI" ? 8 : 9}
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value

                              // Si es DNI, filtrar caracteres no numéricos
                              if (busquedaForm.getValues("tipoDocumento") === "DNI") {
                                value = value.replace(/\D/g, "")
                              }

                              // Si es pasaporte, convertir a mayúsculas
                              if (busquedaForm.getValues("tipoDocumento") === "Pasaporte") {
                                value = value.toUpperCase()
                              }

                              // Actualizar el campo con el valor procesado
                              e.target.value = value
                              field.onChange(e)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {error && (
                  <Alert className="bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 mt-4">
                    <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={volverAlDashboard}
                    className="transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                  <Button type="submit" disabled={buscando} className="transition-all duration-200 hover:bg-primary/90">
                    {buscando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        Buscar Titular
                        <Search className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Formulario de modificación */}
      {titularEncontrado && !success && (
        <Card className="shadow-md border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Modificar Datos del Titular</CardTitle>
            <CardDescription>Actualice la información del titular seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div ref={formFieldsRef} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tipoDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Documento *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DNI">DNI</SelectItem>
                              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numeroDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Documento *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                tipoDocumento === "DNI" ? "Ingrese solo números" : "Ingrese números y letras"
                              }
                              maxLength={tipoDocumento === "DNI" ? 8 : 9}
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="nombreApellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre y Apellido *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre y apellido completos" maxLength={50} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fechaNacimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Nacimiento *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dirección completa" maxLength={100} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="grupoSanguineo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo Sanguíneo *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="AB">AB</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="factorRh"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Factor RH *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="+" id="rh-positivo" />
                                <Label htmlFor="rh-positivo">Positivo (+)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="-" id="rh-negativo" />
                                <Label htmlFor="rh-negativo">Negativo (-)</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="donanteOrganos"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Donante de Órganos *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Si" id="donante-si" />
                                <Label htmlFor="donante-si">Sí</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id="donante-no" />
                                <Label htmlFor="donante-no">No</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div ref={buttonsRef} className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTitularEncontrado(null)}
                    className="transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la búsqueda
                  </Button>
                  <Button
                    type="submit"
                    disabled={guardando}
                    className="transition-all duration-200 hover:bg-primary/90"
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <Card className="shadow-md border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Operación Exitosa</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Titular actualizado correctamente. Redirigiendo...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
