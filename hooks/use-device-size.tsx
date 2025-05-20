"use client"

import { useState, useEffect } from "react"

type DeviceSize = "mobile" | "tablet" | "desktop" | "large"

export function useDeviceSize(): DeviceSize {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop")

  useEffect(() => {
    // Función para determinar el tamaño del dispositivo
    const updateDeviceSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setDeviceSize("mobile")
      } else if (width >= 640 && width < 1024) {
        setDeviceSize("tablet")
      } else if (width >= 1024 && width < 1536) {
        setDeviceSize("desktop")
      } else {
        setDeviceSize("large")
      }
    }

    // Actualizar el tamaño del dispositivo inicialmente
    updateDeviceSize()

    // Actualizar el tamaño del dispositivo cuando cambie el tamaño de la ventana
    window.addEventListener("resize", updateDeviceSize)

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", updateDeviceSize)
    }
  }, [])

  return deviceSize
}
