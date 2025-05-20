"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface NavigationProps {
  role: string
}

export default function Navigation({ role }: NavigationProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Necesario para evitar problemas de hidratación con next-themes
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    router.push("/")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="bg-gray-600 dark:bg-gray-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href={`/dashboard?role=${role}`}
              className="text-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo-licencias-nuevo.png"
                  alt="Logo Sistema de Licencias"
                  width={32}
                  height={32}
                  className="rounded-full object-contain p-0.5"
                />
              </div>
              <span>Sistema de Licencias</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-white hover:bg-gray-500 transition-transform duration-300 hover:scale-105"
                title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            <Button
              variant="ghost"
              className="text-gray-200 hover:bg-gray-500 hover:text-white transition-colors duration-300"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
