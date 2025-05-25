"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, RefreshCw, LogIn, Eye, EyeOff, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import gsap from "gsap"
import { authService } from "@/services/auth-service"
import { useToast } from "@/hooks/use-toast"

interface SessionExpiredFormProps {
  lastEmail?: string
  onSuccess?: () => void
}

export default function SessionExpiredForm({ lastEmail = "", onSuccess }: SessionExpiredFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState(lastEmail)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(15)

  const formRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const inputsRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const passwordToggleRef = useRef<HTMLButtonElement>(null)

  // Animaciones de entrada
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Animación del contenedor principal
    tl.fromTo(formRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })

    // Animación del ícono con efecto de pulso
    tl.fromTo(iconRef.current, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.5 }, "-=0.3")

    // Animación del título
    tl.fromTo(titleRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.2")

    // Animación de la alerta
    tl.fromTo(alertRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, "-=0.1")

    // Animación de los inputs
    tl.fromTo(inputsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.1")

    // Animación de los botones
    tl.fromTo(buttonsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.1")

    // Efecto de pulso en el ícono
    gsap.to(iconRef.current, {
      scale: 1.1,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    })

    return () => {
      gsap.killTweensOf("*")
    }
  }, [])

  // Countdown para redirección automática
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleGoToLogin()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Configurar eventos para mostrar/ocultar contraseña
  useEffect(() => {
    const toggleButton = passwordToggleRef.current
    if (!toggleButton) return

    const showPasswordHandler = () => {
      setShowPassword(true)
      gsap.to(toggleButton, { scale: 0.9, duration: 0.1 })
    }

    const hidePasswordHandler = () => {
      setShowPassword(false)
      gsap.to(toggleButton, { scale: 1, duration: 0.1 })
    }

    toggleButton.addEventListener("mousedown", showPasswordHandler)
    toggleButton.addEventListener("mouseup", hidePasswordHandler)
    toggleButton.addEventListener("mouseleave", hidePasswordHandler)
    toggleButton.addEventListener("touchstart", showPasswordHandler)
    toggleButton.addEventListener("touchend", hidePasswordHandler)
    toggleButton.addEventListener("touchcancel", hidePasswordHandler)

    return () => {
      toggleButton.removeEventListener("mousedown", showPasswordHandler)
      toggleButton.removeEventListener("mouseup", hidePasswordHandler)
      toggleButton.removeEventListener("mouseleave", hidePasswordHandler)
      toggleButton.removeEventListener("touchstart", showPasswordHandler)
      toggleButton.removeEventListener("touchend", hidePasswordHandler)
      toggleButton.removeEventListener("touchcancel", hidePasswordHandler)
    }
  }, [])

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Animación del botón
    gsap.to(buttonsRef.current?.querySelector("[data-quick-login]"), {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    })

    try {
      const response = await authService.login({
        mail: email,
        password: password,
      })

      if (response.success && response.token) {
        // Animación de éxito
        gsap.to(formRef.current, {
          scale: 1.05,
          boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)",
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            toast({
              title: "Sesión restaurada",
              description: "Has vuelto a iniciar sesión exitosamente",
              variant: "default",
            })

            if (onSuccess) {
              onSuccess()
            } else {
              // Obtener el rol y navegar al dashboard
              const userRole = authService.getUserRole()
              const frontendRole = userRole === "SUPER_USER" ? "ADMIN" : "OPERADOR"
              router.push(`/dashboard?role=${frontendRole}`)
            }
          },
        })
      } else {
        toast({
          title: "Error de autenticación",
          description: response.message || "Credenciales incorrectas",
          variant: "destructive",
        })

        // Animación de error
        gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true })
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })

      gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true })
    } finally {
      setLoading(false)
    }
  }

  const handleGoToLogin = () => {
    // Animación de salida
    gsap.to(formRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        router.push("/")
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0" ref={formRef}>
        <CardHeader className="text-center pb-4">
          <div ref={iconRef} className="mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full w-fit">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle ref={titleRef} className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Sesión Expirada
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div ref={alertRef}>
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Tu sesión ha expirado por seguridad. Inicia sesión nuevamente para continuar.
              </AlertDescription>
            </Alert>
          </div>

          <form onSubmit={handleQuickLogin} className="space-y-4" ref={inputsRef}>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-slate-500" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@municipio.gob"
                required
                className="transition-all focus:shadow-md focus:shadow-blue-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-slate-500" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  className="transition-all focus:shadow-md focus:shadow-blue-200 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  ref={passwordToggleRef}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none transition-colors"
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mantén presionado el ícono para ver la contraseña
              </p>
            </div>

            <div ref={buttonsRef} className="space-y-3 pt-2">
              <Button
                type="submit"
                data-quick-login
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all relative overflow-hidden group"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Restaurar Sesión
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoToLogin}
                className="w-full border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-all"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Ir al Login Principal
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400 border-t pt-4">
            <p>Redirección automática en {countdown} segundos</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-2">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((15 - countdown) / 15) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
