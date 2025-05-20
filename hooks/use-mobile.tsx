"use client"

import { useState, useEffect } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Función para verificar si es un dispositivo móvil
    const checkMobile = () => {
      // Verificar por ancho de pantalla
      const isMobileByWidth = window.innerWidth < 768

      // Verificar por user agent (más completo)
      const isMobileByAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      // Verificar por características táctiles
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0

      setIsMobile(isMobileByWidth || isMobileByAgent || isTouchDevice)
    }

    // Verificar al cargar
    checkMobile()

    // Verificar al cambiar el tamaño de la ventana
    window.addEventListener("resize", checkMobile)

    // Limpiar
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
