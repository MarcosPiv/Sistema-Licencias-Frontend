// Interfaces para los tipos de datos
export interface Licencia {
  id: number
  numeroLicencia: string
  titular: {
    id: number
    tipoDocumento: string
    numeroDocumento: string
    nombreApellido: string
    fechaNacimiento: string
    direccion: string
    grupoSanguineo: string
    factorRh: string
    donanteOrganos: string
  }
  claseLicencia: string
  fechaEmision: string
  fechaVencimiento: string
  vigencia: number
  costo: number
  estado: string
  observaciones?: string
}

export interface LicenciaResponse {
  success: boolean
  message: string
  licencia?: Licencia
}

export interface LicenciasResponse {
  success: boolean
  message: string
  licencias: Licencia[]
  total: number
}

export interface EmitirLicenciaRequest {
  titularId: number
  clase: string
  numeroCopia?: number | null
  motivoCopia?: string | null
  emisor?: string
}

// Nuevas interfaces para renovación de licencias
export interface RenovarLicenciaVencidaRequest {
  licenciaId: number
  motivoRenovacion: "VENCIDA"
  numeroCopia?: number
  motivoCopia?: string
  licenciaOriginalId: number
}

export interface RenovarLicenciaCambioDatosRequest {
  licenciaId: number
  motivoRenovacion: "CAMBIO_DATOS"
  nuevoNombre?: string
  nuevoApellido?: string
  nuevaDireccion?: string
  numeroCopia?: number
  motivoCopia?: string
  licenciaOriginalId: number
}

export type RenovarLicenciaRequest = RenovarLicenciaVencidaRequest | RenovarLicenciaCambioDatosRequest

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Función para obtener los headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token")
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  } as Record<string, string>

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

// Función para manejar errores de autenticación
const handleAuthError = (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    // Token expirado o no válido
    localStorage.removeItem("auth_token")
    window.location.href = "/login"
    return true
  }
  return false
}

// Función para obtener el usuario actual del token
const getCurrentUserFromToken = () => {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) return null

    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      mail: payload.sub || "",
      rol: payload.roles && payload.roles.length > 0 ? payload.roles[0] : "OPERADOR",
    }
  } catch (error) {
    console.error("Error al obtener usuario del token:", error)
    return null
  }
}

// Servicio para la gestión de licencias
export const licenciaService = {
  // Listar todas las licencias
  listarLicencias: async (filtros?: any): Promise<LicenciasResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) queryParams.append(key, value as string)
        })
      }

      const response = await fetch(`${API_URL}/licencias?${queryParams.toString()}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response)) {
        return {
          success: false,
          message: "Sesión expirada. Redirigiendo al login...",
          licencias: [],
          total: 0,
        }
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error al listar licencias:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al listar licencias",
        licencias: [],
        total: 0,
      }
    }
  },

  // Obtener una licencia por ID
  obtenerLicencia: async (id: number): Promise<LicenciaResponse> => {
    try {
      const response = await fetch(`${API_URL}/licencias/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response)) {
        return {
          success: false,
          message: "Sesión expirada. Redirigiendo al login...",
        }
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al obtener licencia con ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al obtener licencia",
      }
    }
  },

  // Emitir una nueva licencia
  emitirLicencia: async (datos: EmitirLicenciaRequest): Promise<LicenciaResponse> => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return {
          success: false,
          message: "Debe iniciar sesión para emitir licencias",
        }
      }

      // Obtener el usuario actual del token
      const usuarioActual = getCurrentUserFromToken()
      if (!usuarioActual) {
        return {
          success: false,
          message: "No se pudo obtener información del usuario. Inicie sesión nuevamente.",
        }
      }

      // Preparar los datos para el backend usando el email del usuario autenticado
      const datosParaEnviar = {
        titularId: Number.parseInt(datos.titularId.toString()),
        clase: datos.clase,
        numeroCopia: datos.numeroCopia || null,
        motivoCopia: datos.motivoCopia || null,
        emisor: usuarioActual.mail, // Usar el email del usuario autenticado
      }

      console.log("Usuario autenticado:", usuarioActual)
      console.log("Datos a enviar al backend:", datosParaEnviar)

      const response = await fetch(`${API_URL}/licencias`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(datosParaEnviar),
      })

      // Manejar errores de autenticación
      if (handleAuthError(response)) {
        return {
          success: false,
          message: "Sesión expirada. Redirigiendo al login...",
        }
      }

      // Intentar obtener el texto de la respuesta
      const responseText = await response.text()
      console.log("Respuesta del servidor:", responseText)

      if (!response.ok) {
        // Intentar parsear el error como JSON
        let errorMessage = `Error ${response.status}: ${response.statusText}`

        try {
          const errorData = JSON.parse(responseText)
          // Buscar el mensaje de error en diferentes campos posibles
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage
        } catch (parseError) {
          // Si no se puede parsear como JSON, usar el texto directo si no está vacío
          if (responseText.trim()) {
            errorMessage = responseText
          }
        }

        return {
          success: false,
          message: errorMessage,
        }
      }

      // Intentar parsear la respuesta exitosa
      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        console.error("Error al parsear respuesta exitosa:", parseError)
        return {
          success: false,
          message: "Error al procesar la respuesta del servidor",
        }
      }

      // Transformar la respuesta del backend al formato esperado por el frontend
      const licenciaEmitida: Licencia = {
        id: responseData.id,
        numeroLicencia: responseData.id.toString(),
        titular: {
          id: responseData.titular.id,
          tipoDocumento: responseData.titular.tipoDocumento,
          numeroDocumento: responseData.titular.numeroDocumento,
          nombreApellido: `${responseData.titular.apellido}, ${responseData.titular.nombre}`,
          fechaNacimiento: responseData.titular.fechaNacimiento,
          direccion: responseData.titular.direccion,
          grupoSanguineo: responseData.titular.grupoSanguineo,
          factorRh: responseData.titular.factorRh === "POSITIVO" ? "+" : "-",
          donanteOrganos: responseData.titular.donanteOrganos ? "SÍ" : "NO",
        },
        claseLicencia: responseData.clase,
        fechaEmision: responseData.fechaEmision,
        fechaVencimiento: responseData.fechaVencimiento,
        vigencia: responseData.vigenciaAnios,
        costo: responseData.costo,
        estado: responseData.vigente ? "VIGENTE" : "VENCIDA",
        observaciones: "",
      }

      return {
        success: true,
        message: "Licencia emitida correctamente",
        licencia: licenciaEmitida,
      }
    } catch (error) {
      console.error("Error al emitir licencia:", error)

      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: "Error de conexión. Verifique su conexión a internet e intente nuevamente.",
        }
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al emitir la licencia",
      }
    }
  },

  // Renovar una licencia existente
  renovarLicencia: async (datos: RenovarLicenciaRequest): Promise<LicenciaResponse> => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return {
          success: false,
          message: "Debe iniciar sesión para renovar licencias",
        }
      }

      // Obtener el usuario actual del token
      const usuarioActual = getCurrentUserFromToken()
      if (!usuarioActual) {
        return {
          success: false,
          message: "No se pudo obtener información del usuario. Inicie sesión nuevamente.",
        }
      }

      // Preparar los datos para el backend
      const datosParaEnviar = {
        ...datos,
        emisor: usuarioActual.mail, // Agregar el email del usuario autenticado
      }

      console.log("Datos a enviar para renovación:", datosParaEnviar)

      const response = await fetch(`${API_URL}/licencias/renovar`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(datosParaEnviar),
      })

      // Manejar errores de autenticación
      if (handleAuthError(response)) {
        return {
          success: false,
          message: "Sesión expirada. Redirigiendo al login...",
        }
      }

      // Intentar obtener el texto de la respuesta
      const responseText = await response.text()
      console.log("Respuesta del servidor:", responseText)

      if (!response.ok) {
        // Intentar parsear el error como JSON
        let errorMessage = `Error ${response.status}: ${response.statusText}`

        try {
          const errorData = JSON.parse(responseText)
          // Buscar el mensaje de error en diferentes campos posibles
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage
        } catch (parseError) {
          // Si no se puede parsear como JSON, usar el texto directo si no está vacío
          if (responseText.trim()) {
            errorMessage = responseText
          }
        }

        return {
          success: false,
          message: errorMessage,
        }
      }

      // Intentar parsear la respuesta exitosa
      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        console.error("Error al parsear respuesta exitosa:", parseError)
        return {
          success: false,
          message: "Error al procesar la respuesta del servidor",
        }
      }

      // Transformar la respuesta del backend al formato esperado por el frontend
      const licenciaRenovada: Licencia = {
        id: responseData.id,
        numeroLicencia: responseData.id.toString(),
        titular: {
          id: responseData.titular.id,
          tipoDocumento: responseData.titular.tipoDocumento,
          numeroDocumento: responseData.titular.numeroDocumento,
          nombreApellido: `${responseData.titular.apellido}, ${responseData.titular.nombre}`,
          fechaNacimiento: responseData.titular.fechaNacimiento,
          direccion: responseData.titular.direccion,
          grupoSanguineo: responseData.titular.grupoSanguineo,
          factorRh: responseData.titular.factorRh === "POSITIVO" ? "+" : "-",
          donanteOrganos: responseData.titular.donanteOrganos ? "SÍ" : "NO",
        },
        claseLicencia: responseData.clase,
        fechaEmision: responseData.fechaEmision,
        fechaVencimiento: responseData.fechaVencimiento,
        vigencia: responseData.vigenciaAnios,
        costo: responseData.costo,
        estado: responseData.vigente ? "VIGENTE" : "VENCIDA",
        observaciones: responseData.motivoCopia || "",
      }

      return {
        success: true,
        message: "Licencia renovada correctamente",
        licencia: licenciaRenovada,
      }
    } catch (error) {
      console.error("Error al renovar licencia:", error)

      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: "Error de conexión. Verifique su conexión a internet e intente nuevamente.",
        }
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al renovar la licencia",
      }
    }
  },

  // Emitir copia de una licencia
  emitirCopia: async (licenciaId: number, motivo: string): Promise<LicenciaResponse> => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return {
          success: false,
          message: "Debe iniciar sesión para emitir copias",
        }
      }

      // Obtener el usuario actual del token
      const usuarioActual = getCurrentUserFromToken()
      if (!usuarioActual) {
        return {
          success: false,
          message: "No se pudo obtener información del usuario. Inicie sesión nuevamente.",
        }
      }

      const datosConEmisor = {
        motivo,
        emisor: usuarioActual.mail,
      }

      const response = await fetch(`${API_URL}/licencias/${licenciaId}/copia`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(datosConEmisor),
      })

      if (handleAuthError(response)) {
        return {
          success: false,
          message: "Sesión expirada. Redirigiendo al login...",
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Error ${response.status}: ${response.statusText}`

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          if (errorText.trim()) {
            errorMessage = errorText
          }
        }

        return {
          success: false,
          message: errorMessage,
        }
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al emitir copia de licencia con ID ${licenciaId}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al emitir copia",
      }
    }
  },

  // Anular una licencia
  anularLicencia: async (id: number, motivo: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return {
          success: false,
          message: "Debe iniciar sesión para anular licencias",
        }
      }

      // Obtener el usuario actual del token
      const usuarioActual = getCurrentUserFromToken()
      if (!usuarioActual) {
        return {
          success: false,
          message: "No se pudo obtener información del usuario. Inicie sesión nuevamente.",
        }
      }

      const datosConEmisor = {
        motivo,
        emisor: usuarioActual.mail,
      }

      const response = await fetch(`${API_URL}/licencias/${id}/anular`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(datosConEmisor),
      })

      if (handleAuthError(response)) {
        return {
          success: false,
          message: "Sesión expirada. Redirigiendo al login...",
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Error ${response.status}: ${response.statusText}`

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          if (errorText.trim()) {
            errorMessage = errorText
          }
        }

        return {
          success: false,
          message: errorMessage,
        }
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al anular licencia con ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al anular licencia",
      }
    }
  },

  // Obtener licencias vencidas
  obtenerLicenciasVencidas: async (): Promise<LicenciasResponse> => {
    try {
      const response = await fetch(`${API_URL}/licencias/vencidas`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response)) {
        return {
          success: false,
          message: "Sesión expirada. Redirigiendo al login...",
          licencias: [],
          total: 0,
        }
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const licenciasBackend = await response.json()

      // Transformar los datos del backend al formato esperado por el frontend
      const licenciasTransformadas: Licencia[] = licenciasBackend.map((licencia: any) => ({
        id: licencia.id,
        numeroLicencia: licencia.id.toString(),
        titular: {
          id: licencia.titular.id,
          tipoDocumento: licencia.titular.tipoDocumento,
          numeroDocumento: licencia.titular.numeroDocumento,
          nombreApellido: `${licencia.titular.apellido}, ${licencia.titular.nombre}`,
          fechaNacimiento: licencia.titular.fechaNacimiento,
          direccion: licencia.titular.direccion,
          grupoSanguineo: licencia.titular.grupoSanguineo,
          factorRh: licencia.titular.factorRh === "POSITIVO" ? "+" : "-",
          donanteOrganos: licencia.titular.donanteOrganos ? "SÍ" : "NO",
        },
        claseLicencia: licencia.clase,
        fechaEmision: licencia.fechaEmision,
        fechaVencimiento: licencia.fechaVencimiento,
        vigencia: licencia.vigenciaAnios,
        costo: licencia.costo,
        estado: licencia.vigente ? "VIGENTE" : "VENCIDA",
        observaciones: "",
      }))

      return {
        success: true,
        message: "Licencias vencidas obtenidas correctamente",
        licencias: licenciasTransformadas,
        total: licenciasTransformadas.length,
      }
    } catch (error) {
      console.error("Error al obtener licencias vencidas:", error)

      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: "Error de conexión. Verifique su conexión a internet e intente nuevamente.",
          licencias: [],
          total: 0,
        }
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al obtener licencias vencidas",
        licencias: [],
        total: 0,
      }
    }
  },

  // Buscar licencias por titular (para imprimir)
  buscarLicenciasPorTitular: async (
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<{
    success: boolean
    message: string
    licencias?: Licencia[]
    titular?: any
  }> => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return {
          success: false,
          message: "Debe iniciar sesión para buscar licencias",
        }
      }

      // Convertir el tipo de documento a mayúsculas para la API
      const tipoDocumentoAPI = tipoDocumento.toUpperCase()

      const response = await fetch(
        `${API_URL}/licencias/titular?tipoDocumento=${tipoDocumentoAPI}&numeroDocumento=${numeroDocumento}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      )

      if (handleAuthError(response)) {
        return {
          success: false,
          message: "Sesión expirada. Redirigiendo al login...",
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            message: "No se encontraron licencias con ese documento",
          }
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Verificar si hay licencias
      if (!data.licencias || data.licencias.length === 0) {
        return {
          success: false,
          message: "No se encontraron licencias con ese documento",
        }
      }

      // Mapear los datos recibidos al formato que espera el componente
      const licenciasFormateadas: Licencia[] = data.licencias.map((licencia: any) => ({
        id: licencia.id,
        numeroLicencia: licencia.id.toString(),
        titular: {
          id: data.titular.id,
          tipoDocumento: data.titular.tipoDocumento,
          numeroDocumento: data.titular.numeroDocumento,
          nombreApellido: `${data.titular.apellido}, ${data.titular.nombre}`,
          fechaNacimiento: data.titular.fechaNacimiento,
          direccion: data.titular.direccion,
          grupoSanguineo: data.titular.grupoSanguineo,
          factorRh: data.titular.factorRh,
          donanteOrganos: data.titular.donanteOrganos ? "SÍ" : "NO",
        },
        claseLicencia: licencia.clase,
        fechaEmision: licencia.fechaEmision,
        fechaVencimiento: licencia.fechaVencimiento,
        vigencia: licencia.vigenciaAnios,
        costo: licencia.costo,
        estado: licencia.vigente ? "VIGENTE" : "VENCIDA",
      }))

      return {
        success: true,
        message: "Licencias encontradas correctamente",
        licencias: licenciasFormateadas,
        titular: data.titular,
      }
    } catch (error) {
      console.error("Error al buscar licencias por titular:", error)

      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: "Error de conexión. Verifique su conexión a internet e intente nuevamente.",
        }
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al buscar licencias",
      }
    }
  },
}
