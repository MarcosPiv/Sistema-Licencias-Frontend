"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Upload, Camera, X, Search } from "lucide-react"
import Image from "next/image"
import { jsPDF } from "jspdf"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import type { licenciasEmitidas } from "@/data/licencia-data" // Importar desde el archivo compartido
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import gsap from "gsap"
// Importar el nuevo hook al principio del archivo
import { useDeviceSize } from "@/hooks/use-device-size"
import { licenciaService } from "@/services/licencia-service"

// Añadir esta función helper al inicio del componente, después de las importaciones
const formatearFecha = (fechaString: string) => {
  // Crear la fecha agregando la zona horaria local para evitar problemas de UTC
  const fecha = new Date(fechaString + "T00:00:00")
  return fecha.toLocaleDateString("es-AR")
}

interface ImprimirLicenciaFormProps {
  role: string
}

export default function ImprimirLicenciaForm({ role }: ImprimirLicenciaFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  // Añadir esta línea justo después de la línea donde se declara el hook isMobile
  const deviceSize = useDeviceSize()
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [activeTab, setActiveTab] = useState("licencia")
  const [fotoTitular, setFotoTitular] = useState<string | null>(null)
  const [tomarFoto, setTomarFoto] = useState(false)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [errorCamara, setErrorCamara] = useState<string | null>(null)

  // Estados para el buscador
  const [tipoDocumento, setTipoDocumento] = useState<string>("")
  const [numeroDocumento, setNumeroDocumento] = useState<string>("")
  const [licenciaSeleccionada, setLicenciaSeleccionada] = useState<(typeof licenciasEmitidas)[0] | null>(null)
  const [resultadosBusqueda, setResultadosBusqueda] = useState<typeof licenciasEmitidas>([])
  const [errorBusqueda, setErrorBusqueda] = useState<string>("")
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)
  // Primero, añadir los estados necesarios para manejar la carga
  // Añadir después de la declaración de los otros estados:
  const [isLoading, setIsLoading] = useState(false)

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

  const licenciaRef = useRef<HTMLDivElement>(null)
  const comprobanteRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formContainerRef = useRef<HTMLDivElement>(null)
  const searchFormRef = useRef<HTMLDivElement>(null)
  const licenciaPreviewRef = useRef<HTMLDivElement>(null)
  const fotoSectionRef = useRef<HTMLDivElement>(null)
  const licenciaFrenteRef = useRef<HTMLDivElement>(null)
  const licenciaDorsoRef = useRef<HTMLDivElement>(null)
  const comprobanteSearchFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animación inicial del formulario
    if (formContainerRef.current) {
      gsap.fromTo(
        formContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      )
    }
  }, [])

  // Reemplazar el useEffect actual para cargar parámetros de la URL con esta versión mejorada:

  // Modificar el useEffect para ejecutar la búsqueda de forma más confiable
  useEffect(() => {
    const tipoDoc = searchParams.get("tipoDocumento")
    const numDoc = searchParams.get("numeroDocumento")
    const autoSearch = searchParams.get("autoSearch")

    console.log("Parámetros de URL detectados:", { tipoDoc, numDoc, autoSearch })

    if (tipoDoc && numDoc) {
      console.log("Autocompletando campos con:", tipoDoc, numDoc)
      setTipoDocumento(tipoDoc)
      setNumeroDocumento(numDoc)

      // Si autoSearch es true, realizar la búsqueda automáticamente
      if (autoSearch === "true") {
        console.log("Ejecutando búsqueda automática...")

        // Usar un timeout más largo para asegurar que los estados se actualicen
        const timer = setTimeout(() => {
          console.log("Estados actualizados, ejecutando búsqueda...")
          // Llamar directamente a la función de búsqueda con los valores de los parámetros
          // en lugar de depender de los estados que podrían no estar actualizados
          buscarLicenciaConParametros(tipoDoc, numDoc)
        }, 1000)

        // Limpiar el timeout si el componente se desmonta
        return () => clearTimeout(timer)
      }
    }
  }, [searchParams]) // Dependencia en searchParams para que se ejecute cuando cambien

  // Añadir esta nueva función que usa directamente los parámetros en lugar de los estados
  const buscarLicenciaConParametros = async (tipoDocParam: string, numDocParam: string) => {
    console.log("Iniciando búsqueda con parámetros directos:", { tipoDocParam, numDocParam })

    setErrorBusqueda("")
    setResultadosBusqueda([])
    setLicenciaSeleccionada(null)
    setBusquedaRealizada(true)
    setIsLoading(true)

    // Simular tiempo de carga para mostrar el spinner
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Determinar qué referencia usar según la pestaña activa
    const currentFormRef = activeTab === "licencia" ? searchFormRef : comprobanteSearchFormRef

    if (!tipoDocParam || !numDocParam) {
      console.log("Faltan datos en los parámetros:", { tipoDocParam, numDocParam })
      setErrorBusqueda("Debe completar tipo y número de documento")
      setIsLoading(false)
      return
    }

    try {
      console.log("Realizando petición al servicio con parámetros directos...")

      // Añadir animación de carga al botón
      if (currentFormRef.current) {
        const searchButton = currentFormRef.current.querySelector("button[disabled]")
        if (searchButton) {
          gsap.to(searchButton, {
            backgroundColor: "rgba(100, 116, 139, 0.1)",
            repeat: -1,
            yoyo: true,
            duration: 0.8,
          })
        }
      }

      // Usar el servicio en lugar de fetch directo
      const resultado = await licenciaService.buscarLicenciasPorTitular(tipoDocParam, numDocParam)

      console.log("Respuesta del servicio:", resultado)

      if (!resultado.success) {
        setErrorBusqueda(resultado.message)
        setIsLoading(false)
        return
      }

      // Animación de éxito en la búsqueda
      if (currentFormRef.current) {
        gsap.to(currentFormRef.current.querySelectorAll("input, select, button"), {
          scale: 1.03,
          duration: 0.2,
          stagger: 0.05,
          yoyo: true,
          repeat: 1,
        })
      }

      setResultadosBusqueda(resultado.licencias || [])

      // Si solo hay un resultado, seleccionarlo automáticamente
      if (resultado.licencias && resultado.licencias.length === 1) {
        console.log("Seleccionando automáticamente la única licencia encontrada")
        setTimeout(() => {
          seleccionarLicencia(resultado.licencias![0])
        }, 500)
      }
    } catch (error) {
      console.error("Error al buscar licencias con parámetros directos:", error)
      setErrorBusqueda("Error al conectar con el servidor. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cambio en el tipo de documento
  const handleTipoDocumentoChange = (value: string) => {
    setTipoDocumento(value)
    setNumeroDocumento("") // Limpiar el campo al cambiar el tipo
  }

  // Manejar cambio en el número de documento
  const handleNumeroDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (tipoDocumento === "DNI") {
      // Para DNI, solo permitir números
      const onlyNumbers = value.replace(/[^0-9]/g, "")
      setNumeroDocumento(onlyNumbers)
    } else if (tipoDocumento === "Pasaporte") {
      // Para Pasaporte, permitir letras, números y algunos caracteres especiales
      // Convertir a mayúsculas y permitir caracteres alfanuméricos y guiones
      const validPassportChars = value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
      setNumeroDocumento(validPassportChars)
    } else {
      // Si no hay tipo seleccionado, permitir cualquier entrada
      setNumeroDocumento(value)
    }
  }

  // También necesitamos modificar la función buscarLicencia para que use los valores actuales del estado:

  // Actualizar la función buscarLicencia para usar los valores del estado correctamente
  const buscarLicencia = async () => {
    console.log("Iniciando búsqueda con:", { tipoDocumento, numeroDocumento })

    setErrorBusqueda("")
    setResultadosBusqueda([])
    setLicenciaSeleccionada(null)
    setBusquedaRealizada(true)
    setIsLoading(true)

    // Simular tiempo de carga para mostrar el spinner
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Determinar qué referencia usar según la pestaña activa
    const currentFormRef = activeTab === "licencia" ? searchFormRef : comprobanteSearchFormRef

    if (!tipoDocumento || !numeroDocumento) {
      console.log("Faltan datos:", { tipoDocumento, numeroDocumento })
      setErrorBusqueda("Debe completar tipo y número de documento")
      setIsLoading(false)
      // Animación de error mejorada
      if (currentFormRef.current) {
        gsap.fromTo(
          currentFormRef.current,
          { x: -8 },
          { x: 8, duration: 0.1, repeat: 5, yoyo: true, ease: "power2.inOut" },
        )

        // Resaltar los campos con error
        const inputField = currentFormRef.current.querySelector("input")
        const selectField = currentFormRef.current.querySelector("[data-value]")

        if (!tipoDocumento && selectField) {
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

        if (!numeroDocumento && inputField) {
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
      console.log("Realizando petición al servicio...")

      // Añadir animación de carga al botón
      if (currentFormRef.current) {
        const searchButton = currentFormRef.current.querySelector("button[disabled]")
        if (searchButton) {
          gsap.to(searchButton, {
            backgroundColor: "rgba(100, 116, 139, 0.1)",
            repeat: -1,
            yoyo: true,
            duration: 0.8,
          })
        }
      }

      // Usar el servicio en lugar de fetch directo
      const resultado = await licenciaService.buscarLicenciasPorTitular(tipoDocumento, numeroDocumento)

      console.log("Respuesta del servicio:", resultado)

      if (!resultado.success) {
        setErrorBusqueda(resultado.message)
        setIsLoading(false)

        // Animación de error mejorada
        if (currentFormRef.current) {
          gsap.fromTo(
            currentFormRef.current,
            { x: -8 },
            { x: 8, duration: 0.1, repeat: 5, yoyo: true, ease: "power2.inOut" },
          )

          // Animar el mensaje de error para que sea más visible
          setTimeout(() => {
            const errorAlert = currentFormRef.current?.querySelector('[role="alert"]')
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

      // Animación de éxito en la búsqueda
      if (currentFormRef.current) {
        gsap.to(currentFormRef.current.querySelectorAll("input, select, button"), {
          scale: 1.03,
          duration: 0.2,
          stagger: 0.05,
          yoyo: true,
          repeat: 1,
        })
      }

      setResultadosBusqueda(resultado.licencias || [])
    } catch (error) {
      console.error("Error al buscar licencias:", error)
      setErrorBusqueda("Error al conectar con el servidor. Intente nuevamente.")

      // Animación de error
      if (currentFormRef.current) {
        gsap.fromTo(
          currentFormRef.current,
          { x: -8 },
          { x: 8, duration: 0.1, repeat: 3, yoyo: true, ease: "power2.inOut" },
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Función para seleccionar una licencia
  const seleccionarLicencia = (licencia: (typeof licenciasEmitidas)[0]) => {
    // Animación de transición
    const currentFormRef = activeTab === "licencia" ? searchFormRef : comprobanteSearchFormRef

    if (currentFormRef.current) {
      gsap.to(currentFormRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          setLicenciaSeleccionada(licencia)
          setFotoTitular(null) // Resetear la foto al cambiar de licencia

          // Animar la aparición de la previsualización
          setTimeout(() => {
            if (licenciaPreviewRef.current && activeTab === "licencia") {
              gsap.fromTo(
                licenciaPreviewRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
              )
            }

            if (fotoSectionRef.current && activeTab === "licencia") {
              gsap.fromTo(
                fotoSectionRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "back.out(1.2)" },
              )
            }

            if (comprobanteRef.current && activeTab === "comprobante") {
              gsap.fromTo(
                comprobanteRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
              )
            }
          }, 100)
        },
      })
    } else {
      setLicenciaSeleccionada(licencia)
      setFotoTitular(null) // Resetear la foto al cambiar de licencia
    }
  }

  // Iniciar/detener la cámara
  useEffect(() => {
    let stream: MediaStream | null = null

    const iniciarCamara = async () => {
      try {
        if (tomarFoto && !camaraActiva) {
          setErrorCamara(null)

          // Configuración optimizada para móviles y escritorio
          const constraints = {
            video: {
              facingMode: "user", // Siempre usar cámara frontal (selfie)
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: false,
          }

          stream = await navigator.mediaDevices.getUserMedia(constraints)

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current
                  .play()
                  .then(() => {
                    setCamaraActiva(true)
                  })
                  .catch((err) => {
                    console.error("Error al reproducir el video:", err)
                    setErrorCamara("No se pudo iniciar la reproducción de video")
                  })
              }
            }
          }
        }
      } catch (error) {
        console.error("Error al acceder a la cámara:", error)
        setErrorCamara("No se pudo acceder a la cámara. Verifique los permisos o intente cargar una imagen.")
        setTomarFoto(false)
      }
    }

    if (tomarFoto) {
      iniciarCamara()
    } else {
      // Detener la cámara si estaba activa
      if (videoRef.current?.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream
        videoStream.getTracks().forEach((track) => track.stop())
      }
      setCamaraActiva(false)
    }

    // Limpiar al desmontar
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setCamaraActiva(false)
      }
    }
  }, [tomarFoto, isMobile])

  const capturarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Configurar el canvas con las dimensiones del video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Dibujar el frame actual del video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convertir el canvas a una URL de datos
        const dataUrl = canvas.toDataURL("image/png")
        setFotoTitular(dataUrl)

        // Detener la cámara
        const stream = video.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        setTomarFoto(false)
        setCamaraActiva(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Verificar el tipo de archivo
      if (!file.type.startsWith("image/")) {
        console.error("El archivo seleccionado no es una imagen")
        return
      }

      // Verificar el tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error("La imagen es demasiado grande (máximo 5MB)")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            setFotoTitular(event.target.result as string)
          } catch (error) {
            console.error("Error al procesar la imagen:", error)
          }
        }
      }
      reader.onerror = (error) => {
        console.error("Error al leer el archivo:", error)
      }

      try {
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Error al leer el archivo como URL de datos:", error)
      }
    }
  }

  // Añadir esta función después de la función handleFileChange
  // Esta función ajusta el tamaño del texto según el dispositivo
  const getTextSizeClass = (baseSize: string) => {
    switch (deviceSize) {
      case "mobile":
        return baseSize
      case "tablet":
        return "text-base" // Forzar un tamaño más grande para tablets
      case "desktop":
        return "text-lg"
      case "large":
        return "text-xl"
      default:
        return baseSize
    }
  }

  const eliminarFoto = () => {
    setFotoTitular(null)
  }

  const abrirSelectorArchivos = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Función para generar un PDF directamente sin usar html2canvas
  const generarPDFDirecto = async () => {
    if (!licenciaSeleccionada) {
      alert("Debe seleccionar una licencia primero")
      return
    }

    setGenerandoPDF(true)

    try {
      // Importar html2canvas dinámicamente solo para la licencia
      const html2canvas = (await import("html2canvas")).default

      // Crear un nuevo documento PDF
      const pdf = new jsPDF({
        orientation: "portrait", // Siempre usar orientación vertical
        unit: "mm",
        format: "a4",
      })

      if (activeTab === "licencia") {
        // Capturar el anverso de la licencia
        if (licenciaFrenteRef.current) {
          const canvasFrente = await html2canvas(licenciaFrenteRef.current, {
            scale: 3, // Aumentar la escala para mejor calidad
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff", // Fondo blanco explícito
            logging: true, // Activar logs para depuración
          })

          const imgDataFrente = canvasFrente.toDataURL("image/png")

          // Capturar el reverso de la licencia
          if (licenciaDorsoRef.current) {
            const canvasDorso = await html2canvas(licenciaDorsoRef.current, {
              scale: 3, // Aumentar la escala para mejor calidad
              useCORS: true,
              allowTaint: true,
              backgroundColor: "#ffffff", // Fondo blanco explícito
              logging: true, // Activar logs para depuración
            })

            const imgDataDorso = canvasDorso.toDataURL("image/png")

            // Añadir ambas imágenes a una sola página
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            // Calcular dimensiones para cada imagen (ajustadas al ancho de la página)
            const imgWidth = canvasFrente.width
            const imgHeight = canvasFrente.height
            const ratio = Math.min((pdfWidth / imgWidth) * 0.9, (pdfHeight / 2 - 20) / imgHeight)

            // Posicionar el anverso en la parte superior
            const imgX = (pdfWidth - imgWidth * ratio) / 2
            const imgY1 = 15 // Margen superior

            pdf.addImage(imgDataFrente, "PNG", imgX, imgY1, imgWidth * ratio, imgHeight * ratio)

            // Posicionar el reverso en la parte inferior
            const imgY2 = imgY1 + imgHeight * ratio + 20 // 20px de separación

            pdf.addImage(imgDataDorso, "PNG", imgX, imgY2, imgWidth * ratio, imgHeight * ratio)
          }

          // Descargar el PDF
          const fileName = `Licencia_${licenciaSeleccionada.numeroLicencia}.pdf`
          pdf.save(fileName)
        }
      } else if (activeTab === "comprobante") {
        // Generar un comprobante tipo factura directamente con jsPDF

        // Configuración de la página
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const margin = 20
        const contentWidth = pageWidth - 2 * margin

        // Añadir encabezado
        pdf.setFillColor(240, 240, 240)
        pdf.rect(margin, margin, contentWidth, 25, "F")

        // Logo eliminado por solicitud del usuario
        // Añadir logo (simulado con un rectángulo)
        // pdf.setFillColor(200, 200, 200)
        // pdf.rect(margin + 5, margin + 5, 15, 15, "F")

        // Título del comprobante
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(16)
        pdf.setTextColor(0, 0, 0)
        pdf.text("MUNICIPALIDAD", margin + 25, margin + 10)

        pdf.setFontSize(12)
        pdf.text("COMPROBANTE DE PAGO", margin + 25, margin + 18)

        // Número de recibo y fecha
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text(`RECIBO N° R-${licenciaSeleccionada.numeroLicencia}`, pageWidth - margin - 60, margin + 10)
        pdf.text(`FECHA: ${formatearFecha(licenciaSeleccionada.fechaEmision)}`, pageWidth - margin - 60, margin + 18)

        // Línea separadora
        pdf.setDrawColor(200, 200, 200)
        pdf.line(margin, margin + 30, pageWidth - margin, margin + 30)

        // Datos del titular
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(12)
        pdf.text("DATOS DEL TITULAR", margin, margin + 40)

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text("APELLIDO Y NOMBRE:", margin, margin + 50)
        pdf.text(licenciaSeleccionada.titular.nombreApellido, margin + 50, margin + 50)

        pdf.text("DOCUMENTO:", margin, margin + 60)
        pdf.text(
          `${licenciaSeleccionada.titular.tipoDocumento} ${licenciaSeleccionada.titular.numeroDocumento}`,
          margin + 50,
          margin + 60,
        )

        // Línea separadora
        pdf.line(margin, margin + 70, pageWidth - margin, margin + 70)

        // Detalle de pago
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(12)
        pdf.text("DETALLE DE PAGO", margin, margin + 80)

        // Tabla de conceptos
        pdf.setFillColor(240, 240, 240)
        pdf.rect(margin, margin + 90, contentWidth, 10, "F")

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(10)
        pdf.text("Concepto", margin + 5, margin + 97)
        pdf.text("Importe", pageWidth - margin - 20, margin + 97)

        // Contenido de la tabla
        pdf.setFont("helvetica", "normal")
        pdf.text(`Emisión de Licencia Clase ${licenciaSeleccionada.claseLicencia}`, margin + 5, margin + 110)
        pdf.text(`Vigencia: ${licenciaSeleccionada.vigencia} años`, margin + 5, margin + 118)
        pdf.text(`$${licenciaSeleccionada.costo}`, pageWidth - margin - 20, margin + 110)

        // Línea separadora
        pdf.line(margin, margin + 125, pageWidth - margin, margin + 125)

        // Total
        pdf.setFillColor(240, 240, 240)
        pdf.rect(margin, margin + 130, contentWidth, 10, "F")

        pdf.setFont("helvetica", "bold")
        pdf.text("TOTAL", margin + 5, margin + 137)
        pdf.text(`$${licenciaSeleccionada.costo}`, pageWidth - margin - 20, margin + 137)

        // Pie de página
        pdf.line(margin, pageHeight - margin - 30, pageWidth - margin, pageHeight - margin - 30)

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text("OPERADOR:", margin, pageHeight - margin - 20)
        pdf.text("Admin Sistema", margin + 30, pageHeight - margin - 20)

        pdf.text("FECHA Y HORA:", pageWidth - margin - 80, pageHeight - margin - 20)
        pdf.text(new Date().toLocaleString("es-ES"), pageWidth - margin - 30, pageHeight - margin - 20)

        // Nota legal
        pdf.setFontSize(8)
        pdf.text(
          "Este documento es un comprobante oficial de pago. Conserve este documento para futuros trámites.",
          margin,
          pageHeight - margin - 10,
        )

        // Descargar el PDF
        const fileName = `Comprobante_${licenciaSeleccionada.numeroLicencia}.pdf`
        pdf.save(fileName)
      }
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      alert("Hubo un error al generar el PDF. Por favor, intente nuevamente.")
    } finally {
      setGenerandoPDF(false)
    }
  }

  return (
    <Card className="w-full dark:border-slate-700">
      <CardContent className="pt-6" ref={formContainerRef}>
        <Tabs defaultValue="licencia" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="licencia" className="transition-all duration-300">
              Licencia de Conducir
            </TabsTrigger>
            <TabsTrigger value="comprobante" className="transition-all duration-300">
              Comprobante de Pago
            </TabsTrigger>
          </TabsList>

          <TabsContent value="licencia" className="mt-6">
            <div className="space-y-6">
              {/* Buscador de licencias */}
              {!licenciaSeleccionada ? (
                <div
                  className="border rounded-lg p-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  ref={searchFormRef}
                >
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Buscar Licencia</h3>

                  {errorBusqueda && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{errorBusqueda}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Select value={tipoDocumento} onValueChange={handleTipoDocumentoChange} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de Documento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Input
                        placeholder="Número de Documento"
                        value={numeroDocumento}
                        onChange={(e) => {
                          handleNumeroDocumentoChange(e)

                          // Validación en tiempo real
                          if (tipoDocumento === "DNI" && !/^\d+$/.test(e.target.value) && e.target.value.length > 0) {
                            animateErrorField(e.target)
                          } else if (
                            tipoDocumento === "Pasaporte" &&
                            !/^[A-Z0-9-]+$/.test(e.target.value.toUpperCase()) &&
                            e.target.value.length > 0
                          ) {
                            animateErrorField(e.target)
                          }
                        }}
                        maxLength={tipoDocumento === "DNI" ? 8 : 9}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-end">
                      {/* Modificar los botones de búsqueda para mostrar el estado de carga */}
                      {/* Buscar el botón de búsqueda en la pestaña de licencia y reemplazarlo con: */}
                      <Button onClick={buscarLicencia} className="w-full relative" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300 rounded-full animate-spin"></div>
                            </div>
                            <span className="opacity-0">Buscar</span>
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {busquedaRealizada && resultadosBusqueda.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2 dark:text-white">Licencias disponibles para imprimir</h4>
                      <div className="space-y-2">
                        {resultadosBusqueda.map((licencia) => {
                          // Determinar si la licencia está vencida
                          const fechaVencimiento = new Date(licencia.fechaVencimiento)
                          const hoy = new Date()
                          const diasParaVencer = Math.floor(
                            (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
                          )

                          // Determinar el estado y color de la licencia
                          let estadoLicencia = ""
                          let colorEstado = ""

                          if (diasParaVencer < 0) {
                            estadoLicencia = "Vencida"
                            colorEstado = "text-red-500"
                          } else if (diasParaVencer < 30) {
                            estadoLicencia = "Próxima a vencer"
                            colorEstado = "text-amber-500"
                          } else {
                            estadoLicencia = "Vigente"
                            colorEstado = "text-green-500"
                          }

                          return (
                            <div
                              key={licencia.numeroLicencia}
                              className="p-3 border rounded-md dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                              onClick={() => seleccionarLicencia(licencia)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium dark:text-white">{licencia.titular.nombreApellido}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Clase {licencia.claseLicencia}
                                    </p>
                                    <span className={`text-xs font-medium ${colorEstado}`}>• {estadoLicencia}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm dark:text-white">N° {licencia.numeroLicencia}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Vence: {new Date(licencia.fechaVencimiento).toLocaleDateString("es-ES")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Sección para cargar/tomar foto */}
                  {!tomarFoto ? (
                    <div
                      className="border rounded-lg p-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      ref={fotoSectionRef}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium dark:text-white">Foto del Titular</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLicenciaSeleccionada(null)
                            setFotoTitular(null)
                            setBusquedaRealizada(false)
                          }}
                        >
                          Cambiar Licencia
                        </Button>
                      </div>

                      <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium dark:text-white">{licenciaSeleccionada.titular.nombreApellido}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {licenciaSeleccionada.titular.tipoDocumento}{" "}
                              {licenciaSeleccionada.titular.numeroDocumento}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm dark:text-white">Licencia N° {licenciaSeleccionada.numeroLicencia}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Clase {licenciaSeleccionada.claseLicencia}
                            </p>
                          </div>
                        </div>
                      </div>

                      {fotoTitular ? (
                        <div className="flex flex-col items-center">
                          <div className="relative w-32 h-40 mb-4">
                            <div className="w-full h-full overflow-hidden rounded-md">
                              <Image
                                src={fotoTitular || "/placeholder.svg"}
                                alt="Foto del titular"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-md"
                              onClick={eliminarFoto}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Foto cargada correctamente</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-32 h-40 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center mb-4">
                            <Image
                              src="/placeholder.svg?height=160&width=120"
                              alt="Foto del titular"
                              width={120}
                              height={160}
                              className="rounded-md"
                            />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                            Cargue una foto o tome una con la cámara
                          </p>
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              onClick={abrirSelectorArchivos}
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Cargar foto</span>
                            </Button>
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <>
                        <h3 className="text-lg font-medium mb-4 dark:text-white">Tomar Foto</h3>
                        <div className="flex flex-col items-center">
                          {errorCamara ? (
                            <div className="text-center mb-4">
                              <p className="text-red-500 mb-2">{errorCamara}</p>
                              <Button variant="outline" onClick={() => setTomarFoto(false)}>
                                Volver
                              </Button>
                            </div>
                          ) : camaraActiva ? (
                            <>
                              <div className="relative w-full max-w-md mb-4 rounded-md overflow-hidden">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md" />
                              </div>
                              <canvas ref={canvasRef} className="hidden" />
                              <div className="flex gap-4">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    if (videoRef.current?.srcObject) {
                                      const stream = videoRef.current.srcObject as MediaStream
                                      stream.getTracks().forEach((track) => track.stop())
                                    }
                                    setTomarFoto(false)
                                    setCamaraActiva(false)
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button onClick={capturarFoto}>Capturar Foto</Button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center">
                              <p className="text-slate-600 dark:text-slate-300 mb-4">
                                Si la cámara no se inicia automáticamente, intente usar este método alternativo:
                              </p>
                              <div className="flex justify-center">
                                <Button
                                  variant="default"
                                  onClick={abrirSelectorArchivos}
                                  className="flex items-center gap-2"
                                >
                                  <Camera className="h-4 w-4" />
                                  <span>Tomar foto con cámara</span>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    </div>
                  )}

                  {/* Previsualización de la licencia */}
                  <div className="space-y-6" ref={licenciaPreviewRef}>
                    <div className="border rounded-lg overflow-hidden dark:border-slate-700">
                      <h3 className="text-lg font-medium p-4 bg-slate-100 dark:bg-slate-800 dark:text-white border-b dark:border-slate-700">
                        Vista previa de la licencia
                      </h3>

                      {/* Anverso de la licencia */}
                      <div ref={licenciaRef} className="relative">
                        <div className="relative w-full" ref={licenciaFrenteRef}>
                          <Image
                            src="/images/licencia-frente.png"
                            alt="Anverso de la licencia"
                            width={800}
                            height={500}
                            className="w-full h-auto"
                            priority
                            onError={(e) => {
                              console.error("Error al cargar la imagen del anverso de la licencia")
                              e.currentTarget.src = "/placeholder.svg?height=500&width=800"
                            }}
                          />

                          {/* Foto del titular superpuesta en el rectángulo blanco */}
                          <div className="absolute top-[25%] left-[5%] w-[25%] h-[38%] flex items-center justify-center bg-transparent overflow-hidden">
                            {fotoTitular && (
                              <div className="relative w-full h-full">
                                <Image
                                  src={fotoTitular || "/placeholder.svg"}
                                  alt="Foto del titular"
                                  fill
                                  className="object-cover"
                                  onError={() => {
                                    console.error("Error al cargar la foto del titular")
                                    setFotoTitular(null)
                                  }}
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>

                          {/* Datos superpuestos al lado de la foto */}
                          <div className="absolute top-[22%] left-[35%] text-black">
                            <p className={`mb-1 ${getTextSizeClass("text-sm")}`}>
                              <span className="font-semibold">N° Licencia:</span> {licenciaSeleccionada?.numeroLicencia}
                            </p>
                            <p className={`mb-1 ${getTextSizeClass("text-sm")}`}>
                              <span className="font-semibold">Apellido:</span>{" "}
                              {licenciaSeleccionada?.titular.nombreApellido.split(" ")[0]}
                            </p>
                            <p className={`mb-1 ${getTextSizeClass("text-sm")}`}>
                              <span className="font-semibold">Nombre:</span>{" "}
                              {licenciaSeleccionada?.titular.nombreApellido.split(" ").slice(1).join(" ")}
                            </p>
                            <p className={`mb-1 ${getTextSizeClass("text-sm")}`}>
                              <span className="font-semibold">Domicilio:</span>{" "}
                              {licenciaSeleccionada?.titular.direccion}
                            </p>
                            <p className={`mb-1 ${getTextSizeClass("text-sm")}`}>
                              <span className="font-semibold">Fecha de nacimiento:</span>{" "}
                              {formatearFecha(licenciaSeleccionada?.titular.fechaNacimiento || "")}
                            </p>
                            <p className={`mb-1 ${getTextSizeClass("text-sm")}`}>
                              <span className="font-semibold">Emisión:</span>{" "}
                              {formatearFecha(licenciaSeleccionada?.fechaEmision || "")}
                            </p>
                            <p className={`mb-1 ${getTextSizeClass("text-sm")}`}>
                              <span className="font-semibold">Vencimiento:</span>{" "}
                              {formatearFecha(licenciaSeleccionada?.fechaVencimiento || "")}
                            </p>
                          </div>

                          {/* Clase en la misma altura que N° Licencia */}
                          <div className="absolute top-[22%] right-[5%] text-right">
                            <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-black">
                              CLASE {licenciaSeleccionada?.claseLicencia}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reverso de la licencia */}
                      <div className="relative w-full mt-4" ref={licenciaDorsoRef}>
                        <Image
                          src="/images/licencia-reverso-color.png"
                          alt="Reverso de la licencia"
                          width={800}
                          height={500}
                          className="w-full h-auto"
                          priority
                          onError={(e) => {
                            console.error("Error al cargar la imagen del reverso de la licencia")
                            e.currentTarget.src = "/placeholder.svg?height=500&width=800"
                          }}
                        />

                        {/* Datos superpuestos en el reverso */}
                        <div className="absolute top-[40%] left-[10%] right-[10%] text-black">
                          <div className="flex justify-between">
                            <div className={`text-sm md:text-base lg:text-xl xl:text-2xl`}>
                              <span className="font-semibold">{licenciaSeleccionada?.titular.tipoDocumento}:</span>{" "}
                              {licenciaSeleccionada?.titular.numeroDocumento}
                            </div>
                            <div className={`text-sm md:text-base lg:text-xl xl:text-2xl`}>
                              <span className="font-semibold">Clase:</span> {licenciaSeleccionada?.claseLicencia}
                            </div>
                          </div>
                          <div className="flex justify-between mt-2">
                            <div className={`text-sm md:text-base lg:text-xl xl:text-2xl`}>
                              <span className="font-semibold">Tipo de sangre:</span>{" "}
                              {licenciaSeleccionada?.titular.grupoSanguineo}{" "}
                              {licenciaSeleccionada?.titular.factorRh === "POSITIVO"
                                ? "Positivo"
                                : licenciaSeleccionada?.titular.factorRh === "NEGATIVO"
                                  ? "Negativo"
                                  : licenciaSeleccionada?.titular.factorRh}
                            </div>
                            <div className={`text-sm md:text-base lg:text-xl xl:text-2xl`}>
                              <span className="font-semibold">Donante:</span>{" "}
                              {licenciaSeleccionada?.titular.donanteOrganos}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard?role=${role}`)}
                  className="transition-transform duration-300 hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                {licenciaSeleccionada && (
                  <Button
                    onClick={generarPDFDirecto}
                    disabled={generandoPDF}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generandoPDF ? "Generando PDF..." : "Descargar PDF"}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comprobante" className="mt-6">
            <div className="space-y-6">
              {/* Buscador para el comprobante - similar al de licencia */}
              {!licenciaSeleccionada ? (
                <div
                  className="border rounded-lg p-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  ref={comprobanteSearchFormRef}
                >
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Buscar Comprobante</h3>

                  {errorBusqueda && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{errorBusqueda}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Select value={tipoDocumento} onValueChange={handleTipoDocumentoChange} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de Documento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Input
                        placeholder="Número de Documento"
                        value={numeroDocumento}
                        onChange={(e) => {
                          handleNumeroDocumentoChange(e)

                          // Validación en tiempo real para DNI
                          if (tipoDocumento === "DNI" && !/^\d+$/.test(e.target.value) && e.target.value.length > 0) {
                            animateErrorField(e.target)
                          }
                        }}
                        maxLength={tipoDocumento === "DNI" ? 8 : 9}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-end">
                      {/* Modificar los botones de búsqueda para mostrar el estado de carga */}
                      {/* Buscar el botón de búsqueda en la pestaña de comprobante y reemplazarlo con: */}
                      <Button onClick={buscarLicencia} className="w-full relative" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300 rounded-full animate-spin"></div>
                            </div>
                            <span className="opacity-0">Buscar</span>
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {busquedaRealizada && resultadosBusqueda.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2 dark:text-white">Resultados de la búsqueda</h4>
                      <div className="space-y-2">
                        {resultadosBusqueda.map((licencia) => (
                          <div
                            key={licencia.numeroLicencia}
                            className="p-3 border rounded-md dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                            onClick={() => seleccionarLicencia(licencia)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium dark:text-white">{licencia.titular.nombreApellido}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {licencia.titular.tipoDocumento} {licencia.titular.numeroDocumento} - Clase{" "}
                                  {licencia.claseLicencia}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm dark:text-white">Recibo N° R-{licencia.numeroLicencia}</p>
                                <p className="text-xs dark:text-slate-500 dark:text-slate-400">
                                  Emitido: {formatearFecha(licencia.fechaEmision)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div ref={comprobanteRef} className="border rounded-lg overflow-hidden dark:border-slate-700">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                          <Image
                            src="/images/logo-licencias-nuevo.png"
                            alt="Logo Sistema de Licencias"
                            width={40}
                            height={40}
                            className="rounded-full object-contain p-0.5"
                            onError={(e) => {
                              console.error("Error al cargar el logo")
                              e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold dark:text-white">MUNICIPALIDAD</h3>
                          <p className="text-xs dark:text-slate-300">COMPROBANTE DE PAGO</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm dark:text-white">RECIBO N° R-{licenciaSeleccionada.numeroLicencia}</p>
                        <p className="text-xs dark:text-slate-300">
                          FECHA: {formatearFecha(licenciaSeleccionada.fechaEmision)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 dark:bg-slate-800">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold dark:text-white">DATOS DEL TITULAR</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLicenciaSeleccionada(null)
                            setBusquedaRealizada(true) // Mantener los resultados de búsqueda visibles
                          }}
                        >
                          Cambiar Comprobante
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">APELLIDO Y NOMBRE</p>
                          <p className="dark:text-white">{licenciaSeleccionada.titular.nombreApellido}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">DOCUMENTO</p>
                          <p className="dark:text-white">
                            {licenciaSeleccionada.titular.tipoDocumento} {licenciaSeleccionada.titular.numeroDocumento}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 dark:text-white">DETALLE DE PAGO</h3>
                        <div className="border rounded-md overflow-hidden dark:border-slate-700">
                          <table className="w-full">
                            <thead className="bg-slate-100 dark:bg-slate-700">
                              <tr>
                                <th className="text-left p-2 dark:text-white">Concepto</th>
                                <th className="text-right p-2 dark:text-white">Importe</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-t dark:border-slate-700">
                                <td className="p-2 dark:text-white">
                                  <p>Emisión de Licencia Clase {licenciaSeleccionada.claseLicencia}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Vigencia: {licenciaSeleccionada.vigencia} años
                                  </p>
                                </td>
                                <td className="p-2 text-right dark:text-white">${licenciaSeleccionada.costo}</td>
                              </tr>
                              <tr className="border-t bg-slate-50 dark:bg-slate-700 dark:border-slate-600">
                                <td className="p-2 font-semibold dark:text-white">TOTAL</td>
                                <td className="p-2 text-right font-semibold dark:text-white">
                                  ${licenciaSeleccionada.costo}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="border-t pt-4 flex justify-between dark:border-slate-700">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">OPERADOR</p>
                          <p className="dark:text-white">Admin Sistema</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400">FECHA Y HORA</p>
                          <p className="dark:text-white">{new Date().toLocaleString("es-ES")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard?role=${role}`)}
                  className="transition-transform duration-300 hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                {licenciaSeleccionada && (
                  <Button
                    onClick={generarPDFDirecto}
                    disabled={generandoPDF}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generandoPDF ? "Generando PDF..." : "Descargar PDF"}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
