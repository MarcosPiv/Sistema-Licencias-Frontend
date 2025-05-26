"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Eye, EyeOff, Info, CheckCircle, Lock, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import gsap from "gsap"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"
import { authService } from "@/services/auth-service"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false)

  const formRef = useRef(null)
  const titleRef = useRef(null)
  const inputsRef = useRef([])
  const buttonRef = useRef(null)
  const teamSectionRef = useRef(null)
  const tooltipRefs = useRef<(HTMLDivElement | null)[]>([])
  const passwordToggleRef = useRef<HTMLButtonElement>(null)
  const recoveryInfoRef = useRef<HTMLDivElement>(null)
  const errorMessageRef = useRef<HTMLDivElement>(null)

  // Información del equipo de desarrollo con nombres completos
  const teamMembers = [
    {
      username: "MarcosPiv",
      fullName: "Marcos Pividori",
      github: "https://github.com/MarcosPiv",
      avatar: "https://github.com/MarcosPiv.png",
    },
    {
      username: "marcospoet",
      fullName: "Marcos Poet",
      github: "https://github.com/marcospoet",
      avatar: "https://github.com/marcospoet.png",
    },
    {
      username: "Cammisi",
      fullName: "Jose Cammisi",
      github: "https://github.com/Cammisi",
      avatar: "https://github.com/Cammisi.png",
    },
    {
      username: "MateoBlanche",
      fullName: "Mateo Blanche",
      github: "https://github.com/MateoBlanche",
      avatar: "https://github.com/MateoBlanche.png",
    },
    {
      username: "Seba02-sr",
      fullName: "Sebastian Ramella",
      github: "https://github.com/Seba02-sr",
      avatar: "https://github.com/Seba02-sr.png",
    },
    {
      username: "bautylazza",
      fullName: "Bautista Lazzarini",
      github: "https://github.com/bautylazza",
      avatar: "https://github.com/bautylazza.png",
    },
  ]

  const isMobile = useIsMobile()

  // Validar email en tiempo real
  useEffect(() => {
    if (email.length === 0) {
      setEmailValid(null)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setEmailValid(emailRegex.test(email))
  }, [email])

  useEffect(() => {
    // Animación de entrada con GSAP
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Animación de la tarjeta
    tl.fromTo(formRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })

    // Animación del título
    tl.fromTo(titleRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4")

    // Animación de los inputs
    inputsRef.current.forEach((input, index) => {
      tl.fromTo(input, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, "-=0.2")
    })

    // Animación del botón
    tl.fromTo(buttonRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, "-=0.2")

    // Efecto de brillo en el botón
    gsap.to(buttonRef.current, {
      boxShadow: "0 0 15px rgba(59, 130, 246, 0.6)",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
    })

    // Animación de la sección del equipo
    if (teamSectionRef.current) {
      tl.fromTo(teamSectionRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.3 })
    }

    // Inicializar tooltips como ocultos
    tooltipRefs.current.forEach((tooltip) => {
      if (tooltip) {
        gsap.set(tooltip, { opacity: 0, y: 10, scale: 0.8 })
      }
    })

    // Limpiar animaciones al desmontar
    return () => {
      gsap.killTweensOf("*")
    }
  }, [])

  // Efecto para animar el tooltip activo
  useEffect(() => {
    tooltipRefs.current.forEach((tooltip, index) => {
      if (!tooltip) return

      if (index === activeTooltip) {
        gsap.killTweensOf(tooltip) // Detener animaciones anteriores
        gsap.to(tooltip, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)",
        })
      } else {
        gsap.killTweensOf(tooltip) // Detener animaciones anteriores
        gsap.to(tooltip, {
          opacity: 0,
          y: 10,
          scale: 0.8,
          duration: 0.2,
          ease: "power2.inOut",
        })
      }
    })
  }, [activeTooltip])

  // Configurar los eventos para mostrar/ocultar contraseña al mantener pulsado
  useEffect(() => {
    const toggleButton = passwordToggleRef.current
    if (!toggleButton) return

    // Función para mostrar la contraseña
    const showPasswordHandler = () => {
      setShowPassword(true)
      // Animar el botón al presionar
      gsap.to(toggleButton, {
        scale: 0.9,
        duration: 0.1,
      })

      // Vibración táctil en dispositivos que lo soportan
      if (isMobile && "vibrate" in navigator) {
        try {
          navigator.vibrate(10) // Vibración sutil de 10ms
        } catch (e) {
          console.log("Vibración no soportada")
        }
      }
    }

    // Función para ocultar la contraseña
    const hidePasswordHandler = () => {
      setShowPassword(false)
      // Animar el botón al soltar
      gsap.to(toggleButton, {
        scale: 1,
        duration: 0.1,
      })
    }

    // Agregar eventos para mouse (escritorio)
    toggleButton.addEventListener("mousedown", showPasswordHandler)
    toggleButton.addEventListener("mouseup", hidePasswordHandler)
    toggleButton.addEventListener("mouseleave", hidePasswordHandler)

    // Agregar eventos para touch (móvil)
    toggleButton.addEventListener("touchstart", showPasswordHandler)
    toggleButton.addEventListener("touchend", hidePasswordHandler)
    toggleButton.addEventListener("touchcancel", hidePasswordHandler)

    // Limpiar eventos al desmontar
    return () => {
      toggleButton.removeEventListener("mousedown", showPasswordHandler)
      toggleButton.removeEventListener("mouseup", hidePasswordHandler)
      toggleButton.removeEventListener("mouseleave", hidePasswordHandler)
      toggleButton.removeEventListener("touchstart", showPasswordHandler)
      toggleButton.removeEventListener("touchend", hidePasswordHandler)
      toggleButton.removeEventListener("touchcancel", hidePasswordHandler)
    }
  }, [isMobile])

  // Efecto para animar la información de recuperación
  useEffect(() => {
    if (!recoveryInfoRef.current) return

    if (showRecoveryInfo) {
      gsap.fromTo(
        recoveryInfoRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      )
    } else {
      gsap.to(recoveryInfoRef.current, {
        height: 0,
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: "power2.in",
      })
    }
  }, [showRecoveryInfo])

  const handleRecoveryClick = (e: React.MouseEvent) => {
    e.preventDefault()

    // Animar la salida del mensaje de error
    if (errorMessageRef.current) {
      gsap.to(errorMessageRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          // Limpiar el error y mostrar la información de recuperación
          setError("")
          setShowRecoveryInfo(true)
        },
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Animación al hacer clic en el botón
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      onComplete: () => {
        gsap.to(buttonRef.current, {
          scale: 1,
          duration: 0.1,
        })
      },
    })

    try {
      console.log("Intentando login con:", { email, password: "***" })

      // Llamar al servicio de autenticación real
      const response = await authService.login({
        mail: email,
        password: password,
      })

      console.log("Respuesta del login:", response)

      if (response.success && response.token) {
        // Obtener el rol del usuario
        const userRole = authService.getUserRole()
        console.log("Rol del usuario:", userRole)

        // Mapear roles del backend a roles del frontend
        let frontendRole = "OPERADOR"
        if (userRole === "SUPER_USER") {
          frontendRole = "ADMIN"
        } else if (userRole === "OPERADOR") {
          frontendRole = "OPERADOR"
        }

        // Animación de éxito
        gsap.to(formRef.current, {
          boxShadow: "0 0 15px rgba(34, 197, 94, 0.6)",
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // Animación de salida antes de navegar
            gsap.to(formRef.current, {
              y: -30,
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                // Mostrar toast de éxito
                toast({
                  title: "Inicio de sesión exitoso",
                  description: `Bienvenido al sistema`,
                  variant: "default",
                })

                // Navegar al dashboard con el rol correcto
                router.push(`/dashboard?role=${frontendRole}`)
              },
            })
          },
        })
      } else {
        // Incrementar contador de intentos fallidos
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)

        // Usar el mensaje de error del backend
        const errorMessage = response.message || "Credenciales inválidas. Por favor, intente nuevamente."

        // Mensaje de error personalizado según el número de intentos
        if (newAttempts >= 3) {
          setError("Múltiples intentos fallidos. ¿Olvidaste tu contraseña?")
        } else {
          setError(errorMessage)
        }

        // Ocultar información de recuperación si estaba visible
        setShowRecoveryInfo(false)

        // Animación de error
        gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true })

        // Vibración en dispositivos móviles para error
        if (isMobile && "vibrate" in navigator) {
          try {
            navigator.vibrate([30, 50, 30]) // Patrón de vibración para error
          } catch (e) {
            console.log("Vibración no soportada")
          }
        }

        // Toast de error
        toast({
          title: "Error de autenticación",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error durante el login:", err)
      setError("Error al conectar con el servidor. Por favor, intente nuevamente.")

      // Toast de error de conexión
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })

      // Animación de error
      gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true })
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cerrar tooltips en móviles al tocar fuera
  useEffect(() => {
    if (!isMobile) return

    const handleTouchOutside = (e: TouchEvent) => {
      // Verificar si el toque fue fuera de los avatares
      const avatarsContainer = document.querySelector(".flex.-space-x-3")
      if (avatarsContainer && !avatarsContainer.contains(e.target as Node)) {
        setActiveTooltip(null)
      }
    }

    document.addEventListener("touchstart", handleTouchOutside)

    return () => {
      document.removeEventListener("touchstart", handleTouchOutside)
    }
  }, [isMobile])

  return (
    <Card className="w-full" ref={formRef}>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              ref={errorMessageRef}
              className="bg-slate-900 dark:bg-slate-950 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-500 text-sm font-medium">{error}</p>
                {loginAttempts >= 3 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs text-red-400 underline mt-1 hover:text-red-300 transition-colors"
                    onClick={handleRecoveryClick}
                  >
                    Recuperar acceso
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Información de recuperación de contraseña */}
          <div ref={recoveryInfoRef} className="overflow-hidden h-0 opacity-0">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                Para recuperar tu contraseña, contacta al administrador del sistema al correo soporte@municipio.gob
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-2" ref={titleRef}>
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-slate-500" />
              Correo Electrónico
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="correo@municipio.gob"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                ref={(el) => (inputsRef.current[0] = el)}
                className={`transition-all focus:shadow-md pr-10 ${
                  emailValid === true
                    ? "border-green-500 focus:border-green-500 focus:shadow-green-200"
                    : emailValid === false
                      ? "border-red-500 focus:border-red-500 focus:shadow-red-200"
                      : "focus:shadow-blue-200"
                }`}
                aria-invalid={emailValid === false}
                aria-describedby={emailValid === false ? "email-error" : undefined}
              />
              {emailValid !== null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {emailValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {emailValid === false && (
              <p id="email-error" className="text-xs text-red-500 mt-1">
                Por favor, ingrese un correo electrónico válido
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-slate-500" />
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                ref={(el) => (inputsRef.current[1] = el)}
                className="transition-all focus:shadow-md focus:shadow-blue-200 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                ref={passwordToggleRef}
                className="password-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none transition-colors touch-manipulation select-none"
                aria-label="Mantener presionado para mostrar contraseña"
                // Prevenir el comportamiento predeterminado para evitar problemas en móviles
                onContextMenu={(e) => e.preventDefault()}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mantén presionado el ícono para ver la contraseña
            </p>
          </div>

          <Button
            type="submit"
            className="w-full transition-all relative overflow-hidden group"
            disabled={loading}
            ref={buttonRef}
          >
            <span className="relative z-10">{loading ? "Iniciando sesión..." : "Iniciar Sesión"}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>

          <div className="mt-8 pt-4 border-t dark:border-slate-700" ref={teamSectionRef}>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-3">Equipo de Desarrollo</p>
            <div className="flex justify-center">
              <div className="flex -space-x-3 relative" onMouseLeave={() => !isMobile && setActiveTooltip(null)}>
                {teamMembers.map((member, index) => (
                  <div key={member.username} className="relative">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform hover:scale-110 hover:z-10"
                      style={{ zIndex: activeTooltip === index ? 10 : teamMembers.length - index }}
                      onMouseEnter={() => !isMobile && setActiveTooltip(index)}
                      onClick={(e) => {
                        if (isMobile) {
                          // En móviles, prevenir la navegación al primer clic para mostrar el tooltip
                          if (activeTooltip !== index) {
                            e.preventDefault()
                            setActiveTooltip(index)
                          }
                          // Si ya está activo, permite la navegación normal
                        }
                      }}
                      onTouchStart={(e) => {
                        if (isMobile) {
                          // Si el tooltip ya está activo, permite la navegación
                          if (activeTooltip === index) return

                          // De lo contrario, previene la acción predeterminada y muestra el tooltip
                          e.preventDefault()
                          setActiveTooltip(index)
                        }
                      }}
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white dark:border-slate-800">
                        <Image
                          src={member.avatar || "/placeholder.svg"}
                          alt={`${member.fullName} - GitHub Profile`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </a>

                    {/* Tooltip animado - Ajustado para móviles */}
                    <div
                      ref={(el) => (tooltipRefs.current[index] = el)}
                      className="absolute left-1/2 -translate-x-1/2 -bottom-12 bg-black/80 text-white px-3 py-1 rounded-md text-xs whitespace-nowrap pointer-events-none"
                    >
                      {member.fullName}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
