"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  UserCircle,
  BadgeIcon as IdCard,
  Printer,
  AlertTriangle,
  Users,
  ArrowRight,
  Copy,
  RefreshCw,
  Filter,
  UserCog,
  UserCheck,
} from "lucide-react"
import Navigation from "@/components/navigation"
import gsap from "gsap"
import { useStats } from "@/contexts/stats-context"

export default function Dashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Usar el contexto de estadísticas
  const { stats, isLoading } = useStats()
  const { licenciasEmitidas, licenciasVencidas, titularesRegistrados } = stats

  // Referencias para animaciones GSAP
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const counterRefs = useRef<(HTMLParagraphElement | null)[]>([])

  // Asegurarse de que el código solo se ejecute en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const userRole = searchParams.get("role")
    if (!userRole) {
      router.push("/")
      return
    }
    setRole(userRole)

    // Animaciones con GSAP - Versión rápida y directa
    try {
      // Crear un timeline con animaciones rápidas
      const timeline = gsap.timeline({
        defaults: {
          ease: "power2.out",
          duration: 0.2, // Duración más corta para todas las animaciones
        },
      })

      // Animar el título
      if (titleRef.current) {
        timeline.fromTo(titleRef.current, { y: -5, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.2 })
      }

      // Animar las tarjetas de estadísticas - rápido con stagger mínimo
      if (statsRef.current) {
        timeline.fromTo(
          statsRef.current.children,
          { y: 5, opacity: 0.5 },
          { y: 0, opacity: 1, duration: 0.2, stagger: 0.03 },
          "-=0.1",
        )
      }

      // Animar los contadores - no anda
      counterRefs.current.forEach((counter, index) => {
        if (counter) {
          const target = Number.parseInt(counter.getAttribute("data-target") || "0")

          // Establecer el valor final inmediatamente para asegurar que se muestre
          counter.innerText = target.toString()

          // Animación visual simple (sin animar el número)
          timeline.fromTo(
            counter,
            { scale: 0.95, opacity: 0.7 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.2,
              delay: 0.02 * index,
            },
            "-=0.1",
          )
        }
      })

      // Animar las tarjetas principales - rápido con stagger mínimo
      if (cardsRef.current) {
        timeline.fromTo(
          cardsRef.current.children,
          { y: 10, opacity: 0.5 },
          { y: 0, opacity: 1, duration: 0.25, stagger: 0.04 },
          "-=0.1",
        )
      }

      // Respaldo: asegurar que todo sea visible después de un tiempo corto
      const timeout = setTimeout(() => {
        if (titleRef.current) titleRef.current.style.opacity = "1"
        if (statsRef.current) {
          Array.from(statsRef.current.children).forEach((el) => {
            const element = el as HTMLElement
            element.style.opacity = "1"
            element.style.transform = "translateY(0)"
          })
        }
        counterRefs.current.forEach((counter) => {
          if (counter) {
            const target = counter.getAttribute("data-target") || "0"
            counter.innerText = target
            counter.style.opacity = "1"
            counter.style.transform = "scale(1)"
          }
        })
        if (cardsRef.current) {
          Array.from(cardsRef.current.children).forEach((el) => {
            const element = el as HTMLElement
            element.style.opacity = "1"
            element.style.transform = "translateY(0)"
          })
        }
      }, 800) // Tiempo más corto para el respaldo

      return () => {
        clearTimeout(timeout)
        // Limpiar todas las animaciones GSAP al desmontar
        gsap.killTweensOf("*")
      }
    } catch (error) {
      console.error("Error en animaciones GSAP:", error)
      // Si hay error, mostrar todo sin animaciones
      if (titleRef.current) titleRef.current.style.opacity = "1"
      if (statsRef.current) {
        Array.from(statsRef.current.children).forEach((el) => {
          const element = el as HTMLElement
          element.style.opacity = "1"
        })
      }
      counterRefs.current.forEach((counter) => {
        if (counter) {
          const target = counter.getAttribute("data-target") || "0"
          counter.innerText = target
        }
      })
      if (cardsRef.current) {
        Array.from(cardsRef.current.children).forEach((el) => {
          const element = el as HTMLElement
          element.style.opacity = "1"
        })
      }
    }
  }, [searchParams, router, isClient])

  // Efecto para animar los contadores cuando cambian las estadísticas
  useEffect(() => {
    if (isLoading || !isClient) return

    // Animar los contadores cuando cambian las estadísticas
    counterRefs.current.forEach((counter, index) => {
      if (counter) {
        let value: number
        switch (index) {
          case 0:
            value = licenciasEmitidas
            break
          case 1:
            value = titularesRegistrados
            break
          case 2:
            value = licenciasVencidas
            break
          default:
            value = 0
        }

        // Actualizar el atributo data-target
        counter.setAttribute("data-target", value.toString())

        // Animar el contador con GSAP
        gsap.to(counter, {
          innerText: value,
          duration: 0.5,
          snap: { innerText: 1 }, // Redondear a números enteros
          ease: "power2.out",
        })
      }
    })
  }, [licenciasVencidas, licenciasEmitidas, titularesRegistrados, isLoading, isClient])

  const navigateTo = (path: string) => {
    if (role) {
      router.push(`${path}?role=${role}`)
    }
  }

  if (!isClient || !role) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300">Cargando...</p>
        </div>
      </div>
    )
  }

  // Función para manejar la navegación a la página de operadores
  const handleGestionOperadores = () => {
    console.log("Navegando a operadores con rol:", role)
    router.push(`/dashboard/operadores?role=${role}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation role={role} />

      <main className="container mx-auto py-8 px-4">
        <h1 ref={titleRef} className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">
          Panel de Control
        </h1>

        {/* Contadores */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-l-4 border-blue-500 hover:shadow-md hover:scale-105 transition-all duration-300">
            <CardContent className="p-3 min-h-[80px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Licencias Emitidas</p>
                  <p
                    ref={(el) => (counterRefs.current[0] = el)}
                    className="text-2xl font-bold"
                    data-target={licenciasEmitidas}
                  >
                    {isLoading ? "..." : licenciasEmitidas}
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <IdCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-1 text-xs text-right text-transparent">
                <span>&nbsp;</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-l-4 border-green-500 hover:shadow-md hover:scale-105 transition-all duration-300">
            <CardContent className="p-3 min-h-[80px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Titulares Registrados</p>
                  <p
                    ref={(el) => (counterRefs.current[1] = el)}
                    className="text-2xl font-bold"
                    data-target={titularesRegistrados}
                  >
                    {isLoading ? "..." : titularesRegistrados}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-1 text-xs text-right text-transparent">
                <span>&nbsp;</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white dark:bg-slate-800 border-l-4 border-red-500 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => navigateTo("/dashboard/licencias/vencidas")}
          >
            <CardContent className="p-3 min-h-[80px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Licencias Vencidas</p>
                  <p
                    ref={(el) => (counterRefs.current[2] = el)}
                    className="text-2xl font-bold"
                    data-target={licenciasVencidas}
                  >
                    {isLoading ? "..." : licenciasVencidas}
                  </p>
                </div>
                <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-1 text-xs text-right text-red-500 dark:text-red-400 flex items-center justify-end gap-1">
                <span>Ver detalle</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tarjetas principales */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md dark:border-slate-700 hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Gestión de Titulares</CardTitle>
              <CardDescription>Registro y administración de titulares</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Button
                className="w-full flex items-center justify-center gap-2 h-12 hover:scale-105 transition-transform duration-200"
                onClick={() => navigateTo("/dashboard/titulares")}
              >
                <UserCircle className="h-5 w-5" />
                <span>Alta de Titular</span>
              </Button>
              <Button
                className="w-full flex items-center justify-center gap-2 h-12 hover:scale-105 transition-transform duration-200"
                variant="outline"
                onClick={() => navigateTo("/dashboard/titulares/modificar")}
              >
                <UserCheck className="h-5 w-5" />
                <span>Modificar Titular</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md dark:border-slate-700 hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Emisión de Licencias</CardTitle>
              <CardDescription>Emitir nuevas licencias de conducir</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Button
                className="w-full flex items-center justify-center gap-2 h-12 hover:scale-105 transition-transform duration-200"
                onClick={() => navigateTo("/dashboard/licencias/emitir")}
              >
                <IdCard className="h-5 w-5" />
                <span>Emitir Licencia</span>
              </Button>
              <Button
                className="w-full flex items-center justify-center gap-2 h-12 hover:scale-105 transition-transform duration-200"
                variant="outline"
                onClick={() => navigateTo("/dashboard/licencias/renovar")}
              >
                <RefreshCw className="h-5 w-5" />
                <span>Renovar Licencia</span>
              </Button>
              <Button
                className="w-full flex items-center justify-center gap-2 h-12 hover:scale-105 transition-transform duration-200"
                variant="outline"
                onClick={() => navigateTo("/dashboard/licencias/copia")}
              >
                <Copy className="h-5 w-5" />
                <span>Emitir Copia</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md dark:border-slate-700 hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Consultas y Reportes</CardTitle>
              <CardDescription>Consultas y filtros avanzados</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Button
                className="w-full flex items-center justify-center gap-2 h-12 hover:scale-105 transition-transform duration-200"
                onClick={() => navigateTo("/dashboard/licencias/imprimir")}
              >
                <Printer className="h-5 w-5" />
                <span>Imprimir Licencia</span>
              </Button>
              <Button
                className="w-full flex items-center justify-center gap-2 h-12 hover:scale-105 transition-transform duration-200"
                variant="outline"
                onClick={() => navigateTo("/dashboard/licencias/filtros")}
              >
                <Filter className="h-5 w-5" />
                <span>Filtros Avanzados</span>
              </Button>
            </CardContent>
          </Card>

          {/* Tarjeta de Gestión de Operadores (solo visible para administradores) */}
          {role === "ADMIN" && (
            <Card className="hover:shadow-md dark:border-slate-700 hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Gestión de Operadores</CardTitle>
                <CardDescription>Administración de usuarios del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full flex items-center justify-center gap-2 h-12 hover:scale-105 transition-transform duration-200"
                  onClick={handleGestionOperadores}
                >
                  <UserCog className="h-5 w-5" />
                  <span>Gestionar Operadores</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
