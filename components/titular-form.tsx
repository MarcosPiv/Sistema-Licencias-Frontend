"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import gsap from "gsap"
import { titularService } from "@/services/titular-service"
import { useToast } from "@/hooks/use-toast"
import { useStats } from "@/contexts/stats-context"

// Modificar el esquema base para eliminar claseSolicitada
const baseSchema = {
  tipoDocumento: z.string().min(1, "Seleccione un tipo de documento"),
  nombre: z.string().min(2, "Ingrese el nombre completo"),
  apellido: z.string().min(2, "Ingrese el apellido completo"),
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

        return edad >= 17
      },
      {
        message: "El titular debe tener al menos 17 años",
      },
    ),
  direccion: z.string().min(5, "Ingrese una dirección válida"),
  grupoSanguineo: z.string().min(1, "Seleccione un grupo sanguíneo"),
  factorRh: z.string().min(1, "Seleccione un factor RH"),
  donanteOrganos: z.string().min(1, "Seleccione si es donante de órganos"),
}

// Esquema completo que maneja la validación de numeroDocumento sin depender de ctx
const formSchema = z.object({
  ...baseSchema,
  // Validación simple para numeroDocumento sin depender de ctx
  numeroDocumento: z.string().min(1, "Ingrese un número de documento"),
})

interface TitularFormProps {
  role: string
}

export default function TitularForm({ role }: TitularFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { incrementTitularesRegistrados } = useStats()
  const [success, setSuccess] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorBackend, setErrorBackend] = useState<string | null>(null)
  const formFieldsRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const [tipoDocumento, setTipoDocumento] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoDocumento: "",
      numeroDocumento: "",
      nombre: "",
      apellido: "",
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
    const subscription = form.watch((value, { name }) => {
      if (name === "tipoDocumento") {
        setTipoDocumento(value.tipoDocumento || "")
        // Limpiar el campo de número de documento al cambiar el tipo
        form.setValue("numeroDocumento", "")
        form.clearErrors("numeroDocumento")
        // Limpiar mensaje de error del backend
        setErrorBackend(null)
      }
      if (name === "numeroDocumento") {
        // Limpiar mensaje de error del backend al cambiar el número
        setErrorBackend(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  useEffect(() => {
    // Animación de los campos del formulario
    if (formFieldsRef.current) {
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
    if (buttonsRef.current) {
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
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validar manualmente el número de documento
    if (!validateNumeroDocumento(values.numeroDocumento)) {
      return
    }

    // Limpiar mensajes previos
    setErrorBackend(null)
    setGuardando(true)

    try {
      // Verificar si ya existe un titular con ese documento
      const existeResponse = await titularService.obtenerTitularPorDocumento(
        values.tipoDocumento,
        values.numeroDocumento,
      )

      // Si success es true Y tiene un titular con ID, entonces ya existe
      if (existeResponse.success && existeResponse.titular && existeResponse.titular.id) {
        const mensajeDuplicado = `Ya existe un titular registrado con el documento ${values.tipoDocumento} N° ${values.numeroDocumento}`
        setErrorBackend(mensajeDuplicado)
        toast({
          title: "Documento duplicado",
          description: mensajeDuplicado,
          variant: "destructive",
        })
        setGuardando(false)
        return
      }

      // Si hubo un error de conexión real (no un 404), mostrar error
      if (
        !existeResponse.success &&
        existeResponse.message.includes("Error") &&
        !existeResponse.message.includes("no encontrado")
      ) {
        setErrorBackend("No se pudo verificar si el titular existe. Intente nuevamente.")
        toast({
          title: "Error de conexión",
          description: "No se pudo verificar si el titular existe. Intente nuevamente.",
          variant: "destructive",
        })
        setGuardando(false)
        return
      }

      // Si llegamos aquí, el titular no existe, proceder a crearlo
      console.log("Titular no existe, procediendo a crear...")

      // Preparar los datos en el formato que espera el backend
      const datosParaBackend = {
        nombre: values.nombre,
        apellido: values.apellido,
        fechaNacimiento: values.fechaNacimiento,
        tipoDocumento: values.tipoDocumento.toUpperCase(),
        numeroDocumento: values.numeroDocumento,
        grupoSanguineo: values.grupoSanguineo,
        factorRh: values.factorRh === "+" ? "POSITIVO" : "NEGATIVO",
        direccion: values.direccion,
        donanteOrganos: values.donanteOrganos === "Si" || values.donanteOrganos === "Sí",
      }

      const response = await titularService.crearTitular(datosParaBackend)

      if (response.success) {
        console.log("Titular creado exitosamente:", response.titular)

        // Incrementar el contador de titulares registrados
        incrementTitularesRegistrados()

        // Mostrar éxito
        setSuccess(true)
        toast({
          title: "Éxito",
          description: "Titular registrado correctamente",
        })

        // Redireccionar después de 2 segundos
        setTimeout(() => {
          router.push(`/dashboard?role=${role}`)
        }, 2000)
      } else {
        console.error("Error al crear titular:", response.message)

        // Mostrar el error exacto del backend
        setErrorBackend(response.message)

        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al registrar titular:", error)
      const errorMessage = "Ocurrió un error al registrar el titular"
      setErrorBackend(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Card className="w-full dark:border-slate-700">
      <CardContent className="pt-6">
        {success ? (
          <Alert className="bg-green-50 border-green-200 mb-4 dark:bg-green-900 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Titular registrado correctamente. Redirigiendo...
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {errorBackend && (
              <div className="mb-4 p-4 rounded-lg border-2 border-red-500 bg-slate-900 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-500 text-sm font-medium">{errorBackend}</span>
                </div>
              </div>
            )}

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
                              onChange={(e) => {
                                let value = e.target.value

                                // Si es DNI, filtrar caracteres no numéricos
                                if (tipoDocumento === "DNI") {
                                  value = value.replace(/\D/g, "")
                                }

                                // Si es pasaporte, convertir a mayúsculas
                                if (tipoDocumento === "Pasaporte") {
                                  value = value.toUpperCase()
                                }

                                // Actualizar el campo con el valor procesado
                                e.target.value = value
                                field.onChange(e)

                                // Validar después de cambiar
                                validateNumeroDocumento(value)
                              }}
                              onBlur={(e) => {
                                field.onBlur()
                                validateNumeroDocumento(e.target.value)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo" maxLength={30} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido *</FormLabel>
                          <FormControl>
                            <Input placeholder="Apellido completo" maxLength={30} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                              <SelectItem value="O">O</SelectItem>
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

                <div ref={buttonsRef} className="flex justify-end gap-4">
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
                    type="submit"
                    disabled={guardando}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    {guardando ? "Guardando..." : "Guardar Titular"}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
