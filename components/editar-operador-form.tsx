"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import gsap from "gsap"
import { useToast } from "@/hooks/use-toast"

// Datos de ejemplo para operadores
const operadoresEjemplo = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    email: "jperez@municipio.gob",
    fechaNacimiento: "1985-06-15",
    activo: true,
    rol: "OPERADOR",
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    email: "mgonzalez@municipio.gob",
    fechaNacimiento: "1990-03-22",
    activo: true,
    rol: "OPERADOR",
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "crodriguez@municipio.gob",
    fechaNacimiento: "1988-11-10",
    activo: false,
    rol: "OPERADOR",
  },
]

// Esquema de validación para el formulario
const formSchema = z
  .object({
    nombre: z.string().min(2, "Ingrese un nombre válido"),
    apellido: z.string().min(2, "Ingrese un apellido válido"),
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

          return edad >= 18
        },
        {
          message: "El operador debe ser mayor de edad",
        },
      ),
    email: z.string().min(1, "El email es obligatorio").email("Ingrese un email válido"),
    cambiarPassword: z.boolean().default(false),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Solo validar las contraseñas si se ha marcado la opción de cambiar contraseña
      if (data.cambiarPassword) {
        if (!data.password) return false
        if (data.password.length < 6) return false
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(data.password)) return false
        return data.password === data.confirmPassword
      }
      return true
    },
    {
      message: "Las contraseñas no coinciden o no cumplen con los requisitos",
      path: ["confirmPassword"],
    },
  )

interface EditarOperadorFormProps {
  operadorId: number
  role: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EditarOperadorForm({ operadorId, role, onSuccess, onCancel }: EditarOperadorFormProps) {
  const [success, setSuccess] = useState(false)
  const [operador, setOperador] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cambiarPassword, setCambiarPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const formFieldsRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      email: "",
      cambiarPassword: false,
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    // Simulamos la carga de datos del operador
    const cargarOperador = async () => {
      setLoading(true)
      try {
        // En un entorno real, esto sería una llamada a la API
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Buscar el operador por ID en los datos de ejemplo
        const operadorEncontrado = operadoresEjemplo.find((op) => op.id === operadorId)

        if (operadorEncontrado) {
          setOperador(operadorEncontrado)

          // Establecer los valores por defecto en el formulario
          form.reset({
            nombre: operadorEncontrado.nombre,
            apellido: operadorEncontrado.apellido,
            fechaNacimiento: operadorEncontrado.fechaNacimiento,
            email: operadorEncontrado.email,
            cambiarPassword: false,
            password: "",
            confirmPassword: "",
          })
        } else {
          toast({
            title: "Error",
            description: "No se encontró el operador",
            variant: "destructive",
          })
          onCancel && onCancel()
        }
      } catch (error) {
        console.error("Error al cargar operador:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar los datos del operador",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    cargarOperador()
  }, [operadorId, form, toast, onCancel])

  useEffect(() => {
    // Animación de los campos del formulario
    if (!loading && formFieldsRef.current) {
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
    if (!loading && buttonsRef.current) {
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
  }, [loading])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Simulamos la llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(true)
      toast({
        title: "Éxito",
        description: "Operador actualizado correctamente",
      })

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (error) {
      console.error("Error al actualizar operador:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el operador",
        variant: "destructive",
      })
    }
  }

  // Manejar cambio en el checkbox de cambiar contraseña
  const handleCambiarPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCambiarPassword(e.target.checked)
    form.setValue("cambiarPassword", e.target.checked)
  }

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Alternar visibilidad de la confirmación de contraseña
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-slate-500 dark:text-slate-400">Cargando datos del operador...</p>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        {success ? (
          <Alert className="bg-green-50 border-green-200 mb-4 dark:bg-green-900 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Operador actualizado correctamente.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div ref={formFieldsRef} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del operador" maxLength={50} {...field} />
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
                          <Input placeholder="Apellido del operador" maxLength={50} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="cambiarPassword"
                      checked={cambiarPassword}
                      onChange={handleCambiarPasswordChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="cambiarPassword" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                      Cambiar contraseña
                    </label>
                  </div>

                  {cambiarPassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nueva Contraseña *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Nueva contraseña"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={togglePasswordVisibility}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-slate-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Nueva Contraseña *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirmar nueva contraseña"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={toggleConfirmPasswordVisibility}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-slate-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div ref={buttonsRef} className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="transition-transform duration-300 hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" className="transition-transform duration-300 hover:scale-105">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
