// Interfaces para los tipos de datos
export interface Titular {
  id: number
  tipoDocumento: string
  numeroDocumento: string
  nombreApellido: string
  fechaNacimiento: string
  direccion: string
  grupoSanguineo: string
  factorRh: string
  donanteOrganos: string
  fechaAlta: string
}

export interface TitularesResponse {
  success: boolean
  message: string
  titulares: Titular[]
  total: number
}

export interface TitularResponse {
  success: boolean
  message: string
  titular: Titular
}

export interface TitularStats {
  total: number
  porGrupoSanguineo: {
    [key: string]: number
  }
  porFactorRh: {
    positivo: number
    negativo: number
  }
  porDonanteOrganos: {
    si: number
    no: number
  }
  nuevosUltimos30Dias: number
}

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sistema-licencias.gob.ar"

// Función para obtener los headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

// Función para manejar errores de autenticación
const handleAuthError = (status: number) => {
  if (status === 401 || status === 403) {
    // Token expirado o no válido
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    // Redirigir al login
    window.location.href = "/"
    return true
  }
  return false
}

// Servicio para la gestión de titulares
export const titularService = {
  // Listar todos los titulares
  listarTitulares: async (filtros?: any): Promise<TitularesResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) queryParams.append(key, value as string)
        })
      }

      const response = await fetch(`${API_URL}/titulares?${queryParams.toString()}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titulares: [],
          total: 0,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al listar titulares:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al listar titulares",
        titulares: [],
        total: 0,
      }
    }
  },

  // Obtener un titular por ID
  obtenerTitular: async (id: number): Promise<TitularResponse> => {
    try {
      const response = await fetch(`${API_URL}/titulares/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al obtener titular con ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al obtener titular",
        titular: {} as Titular,
      }
    }
  },

  // Obtener un titular por tipo y número de documento
  obtenerTitularPorDocumento: async (tipoDocumento: string, numeroDocumento: string): Promise<TitularResponse> => {
    try {
      // Convertir el tipo de documento a mayúsculas para la API
      const tipoDocumentoAPI = tipoDocumento.toUpperCase()

      console.log(`Buscando titular: ${tipoDocumentoAPI} ${numeroDocumento}`)

      const response = await fetch(
        `${API_URL}/titulares?tipoDocumento=${tipoDocumentoAPI}&numeroDocumento=${numeroDocumento}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      )

      // Manejar errores de autenticación
      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titular: {} as Titular,
        }
      }

      // Capturar el texto de la respuesta primero para poder mostrarlo en caso de error
      const responseText = await response.text()
      console.log("Respuesta del servidor:", responseText)

      // Si es 404, significa que el titular no existe (esto es normal al verificar antes de crear)
      if (response.status === 404) {
        return {
          success: false,
          message: "Titular no encontrado",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        // Intentar parsear el error como JSON si es posible
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        try {
          if (responseText) {
            const errorJson = JSON.parse(responseText)
            errorMessage = errorJson.message || errorJson.error || errorMessage
          }
        } catch (parseError) {
          console.error("No se pudo parsear el error como JSON:", parseError)
        }

        throw new Error(errorMessage)
      }

      // Parsear la respuesta JSON solo si hay contenido
      let titularData
      try {
        if (responseText) {
          titularData = JSON.parse(responseText)
        } else {
          throw new Error("La respuesta del servidor está vacía")
        }
      } catch (parseError) {
        console.error("Error al parsear la respuesta JSON:", parseError)
        throw new Error("La respuesta del servidor no es un JSON válido")
      }

      // Verificar si los datos del titular están presentes
      if (!titularData || !titularData.id) {
        return {
          success: false,
          message: "No se encontró el titular con los datos proporcionados",
          titular: {} as Titular,
        }
      }

      // Transformar la respuesta del backend al formato esperado por el frontend
      const titular: Titular = {
        id: titularData.id,
        tipoDocumento: titularData.tipoDocumento,
        numeroDocumento: titularData.numeroDocumento,
        nombreApellido: `${titularData.nombre} ${titularData.apellido}`,
        fechaNacimiento: titularData.fechaNacimiento,
        direccion: titularData.direccion,
        grupoSanguineo: titularData.grupoSanguineo,
        factorRh: titularData.factorRh === "POSITIVO" ? "+" : "-",
        donanteOrganos: titularData.donanteOrganos ? "Si" : "No",
        fechaAlta: titularData.fechaAlta || new Date().toISOString().split("T")[0],
      }

      return {
        success: true,
        message: "Titular encontrado",
        titular: titular,
      }
    } catch (error) {
      console.error(`Error al obtener titular con documento ${tipoDocumento} ${numeroDocumento}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al buscar titular",
        titular: {} as Titular,
      }
    }
  },

  // Crear un nuevo titular
  crearTitular: async (datos: Omit<Titular, "id" | "fechaAlta">): Promise<TitularResponse> => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      return {
        success: false,
        message: "Debe iniciar sesión para crear un titular",
        titular: {} as Titular,
      }
    }

    try {
      // Transformar los datos para adaptarlos al formato esperado por el backend
      const [nombre, apellido] = datos.nombreApellido.split(" ", 2)
      const apellidoCompleto = datos.nombreApellido.substring(nombre.length + 1)

      // Procesar el factor Rh para siempre enviar el formato correcto al backend
      const factorRhMayus = datos.factorRh.toUpperCase()
      const factorRhValido =
        factorRhMayus === "POSITIVO" || factorRhMayus === "+" || datos.factorRh === "+" ? "POSITIVO" : "NEGATIVO"

      // Procesar donante de órganos - CORREGIDO
      const esDonanteOrganos =
        datos.donanteOrganos === "Si" ||
        datos.donanteOrganos === "SI" ||
        datos.donanteOrganos === "si" ||
        datos.donanteOrganos === "Sí" ||
        datos.donanteOrganos === "SÍ" ||
        datos.donanteOrganos === "sí"

      // Log para depuración
      console.log("Datos originales:", {
        factorRh: datos.factorRh,
        donanteOrganos: datos.donanteOrganos,
      })
      console.log("Datos transformados:", {
        factorRh: factorRhValido,
        donanteOrganos: esDonanteOrganos,
      })

      const datosParaEnviar = {
        nombre: nombre,
        apellido: apellidoCompleto || apellido,
        fechaNacimiento: datos.fechaNacimiento,
        tipoDocumento: datos.tipoDocumento,
        numeroDocumento: datos.numeroDocumento,
        grupoSanguineo: datos.grupoSanguineo,
        factorRh: factorRhValido,
        direccion: datos.direccion,
        donanteOrganos: esDonanteOrganos,
      }

      console.log("Enviando al backend:", JSON.stringify(datosParaEnviar))
      console.log("Headers de autenticación:", getAuthHeaders())

      const response = await fetch(`${API_URL}/titulares`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(datosParaEnviar),
      })

      // NUEVO: Logging detallado para debug
      console.log("=== DEBUG CREAR TITULAR ===")
      console.log("Status de respuesta:", response.status)
      console.log("Status text:", response.statusText)
      console.log("Headers de respuesta:", Object.fromEntries(response.headers.entries()))

      // Verificar el token antes de procesar la respuesta
      console.log("Token presente:", !!token)
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          console.log("Rol del usuario:", payload.roles)
          console.log("Token expira en:", new Date(payload.exp * 1000))
          console.log("Tiempo actual:", new Date())
        } catch (e) {
          console.error("Error al decodificar token:", e)
        }
      }

      // Si es error de autorización, NO redirigir inmediatamente, solo loggear
      if (response.status === 401 || response.status === 403) {
        console.error("=== ERROR DE AUTORIZACIÓN ===")
        console.error("Status:", response.status)
        console.error("Esto indica que el backend no permite que OPERADOR cree titulares")

        // Capturar el mensaje de error del backend antes de redirigir
        const errorText = await response.text()
        console.error("Mensaje del backend:", errorText)

        // TEMPORALMENTE comentar la redirección para ver el error exacto
        // handleAuthError(response.status)

        return {
          success: false,
          message: `Error de autorización (${response.status}): ${errorText || "El rol OPERADOR no tiene permisos para crear titulares"}`,
          titular: {} as Titular,
        }
      }

      // Manejar errores de autenticación para otros casos
      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada. Por favor, inicie sesión nuevamente.",
          titular: {} as Titular,
        }
      }

      // Capturar la respuesta como texto primero
      const responseText = await response.text()
      console.log("Respuesta del backend:", responseText)

      if (!response.ok) {
        // Intentar parsear el error del backend
        let errorMessage = `Error ${response.status}: ${response.statusText}`

        try {
          if (responseText) {
            const errorJson = JSON.parse(responseText)
            // Usar directamente el mensaje del backend
            errorMessage = errorJson.message || errorJson.error || errorMessage
          }
        } catch (parseError) {
          console.error("No se pudo parsear el error como JSON:", parseError)
          // Si no se puede parsear, usar el texto de respuesta directamente
          errorMessage = responseText || errorMessage
        }

        console.error("Error del backend:", errorMessage)

        return {
          success: false,
          message: errorMessage, // Retornar directamente el mensaje del backend
          titular: {} as Titular,
        }
      }

      // Parsear la respuesta exitosa
      let responseData
      try {
        if (responseText) {
          responseData = JSON.parse(responseText)
        } else {
          throw new Error("La respuesta del servidor está vacía")
        }
      } catch (parseError) {
        console.error("Error al parsear la respuesta JSON:", parseError)
        return {
          success: false,
          message: "Error al procesar la respuesta del servidor",
          titular: {} as Titular,
        }
      }

      console.log("Titular creado exitosamente:", responseData)

      // Transformar la respuesta del backend al formato esperado por el frontend
      const titularCreado: Titular = {
        id: responseData.id,
        tipoDocumento: responseData.tipoDocumento,
        numeroDocumento: responseData.numeroDocumento,
        nombreApellido: `${responseData.nombre} ${responseData.apellido}`,
        fechaNacimiento: responseData.fechaNacimiento,
        direccion: responseData.direccion,
        grupoSanguineo: responseData.grupoSanguineo,
        factorRh: responseData.factorRh === "POSITIVO" ? "positivo" : "negativo",
        donanteOrganos: responseData.donanteOrganos ? "si" : "no",
        fechaAlta: new Date().toISOString().split("T")[0],
      }

      return {
        success: true,
        message: "Titular creado correctamente",
        titular: titularCreado,
      }
    } catch (error) {
      console.error("Error al crear titular:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al crear titular",
        titular: {} as Titular,
      }
    }
  },

  // Actualizar un titular existente
  actualizarTitular: async (
    id: number,
    datos: Partial<Omit<Titular, "id" | "fechaAlta">>,
  ): Promise<TitularResponse> => {
    try {
      const response = await fetch(`${API_URL}/titulares/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(datos),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al actualizar titular con ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al actualizar titular",
        titular: {} as Titular,
      }
    }
  },

  // Actualizar un titular por tipo y número de documento
  actualizarTitularPorDocumento: async (
    tipoDocumento: string,
    numeroDocumento: string,
    datos: Partial<Omit<Titular, "id" | "tipoDocumento" | "numeroDocumento" | "fechaAlta">>,
  ): Promise<TitularResponse> => {
    try {
      const response = await fetch(`${API_URL}/titulares/documento?tipo=${tipoDocumento}&numero=${numeroDocumento}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(datos),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al actualizar titular con documento ${tipoDocumento} ${numeroDocumento}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al actualizar titular",
        titular: {} as Titular,
      }
    }
  },

  // Eliminar un titular
  eliminarTitular: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/titulares/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al eliminar titular con ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al eliminar titular",
      }
    }
  },

  // Obtener estadísticas de titulares
  obtenerEstadisticas: async (): Promise<TitularStats> => {
    try {
      const response = await fetch(`${API_URL}/titulares/estadisticas`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response.status)) {
        return {
          total: 0,
          porGrupoSanguineo: { "0": 0, A: 0, B: 0, AB: 0 },
          porFactorRh: { positivo: 0, negativo: 0 },
          porDonanteOrganos: { si: 0, no: 0 },
          nuevosUltimos30Dias: 0,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al obtener estadísticas de titulares:", error)
      return {
        total: 0,
        porGrupoSanguineo: { "0": 0, A: 0, B: 0, AB: 0 },
        porFactorRh: { positivo: 0, negativo: 0 },
        porDonanteOrganos: { si: 0, no: 0 },
        nuevosUltimos30Dias: 0,
      }
    }
  },
}
