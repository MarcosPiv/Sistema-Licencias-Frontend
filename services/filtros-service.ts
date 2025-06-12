// Interfaz para los resultados de la API
export interface TitularConLicencia {
  nombre: string
  apellido: string
  tipoDocumento: string
  numeroDocumento: string
  grupoSanguineo: string
  factorRh: string
  donanteOrganos: boolean
  claseLicencia: string
  fechaVencimiento: string
}

// Interfaz para los parámetros de filtrado
export interface FiltrosAvanzados {
  nombreApellido?: string
  gruposSanguineos?: string[]
  factorRh?: string
  soloDonanteOrganos?: boolean
}

class FiltrosService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sistema-licencias.gob.ar"

  // Función para obtener los headers de autenticación
  private getAuthHeaders(): Record<string, string> {
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

  // Buscar titulares con licencias vigentes según filtros
  async buscarTitularesConLicenciasVigentes(filtros: FiltrosAvanzados): Promise<TitularConLicencia[]> {
    // Construir los parámetros de la consulta
    const params = new URLSearchParams()

    if (filtros.nombreApellido?.trim()) {
      params.append("nombreApellido", filtros.nombreApellido.trim())
    }

    // Agregar cada grupo sanguíneo como un parámetro separado
    if (filtros.gruposSanguineos && filtros.gruposSanguineos.length > 0) {
      filtros.gruposSanguineos.forEach((grupo) => {
        params.append("grupoSanguineo", grupo)
      })
    }

    // Convertir el factor RH al formato esperado por la API
    if (filtros.factorRh) {
      params.append("factorRh", filtros.factorRh === "+" ? "POSITIVO" : "NEGATIVO")
    }

    // Agregar el parámetro de donantes si está marcado
    if (filtros.soloDonanteOrganos) {
      params.append("soloDonantes", "true")
    }

    // Realizar la petición a la API
    const response = await fetch(`${this.API_URL}/titulares/licencias-vigentes?${params.toString()}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Manejar errores específicos
      if (response.status === 401) {
        throw new Error("SESSION_EXPIRED")
      }

      const errorData = await response.text()
      let errorMessage = "Error al buscar titulares"

      try {
        const errorJson = JSON.parse(errorData)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch (e) {
        errorMessage = errorData || `Error ${response.status}: ${response.statusText}`
      }

      throw new Error(errorMessage)
    }

    // Procesar la respuesta exitosa
    return await response.json()
  }

  // Método para generar un PDF a partir de los resultados
  async generarPDF(
    resultados: TitularConLicencia[],
    filtrosAplicados: FiltrosAvanzados,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Aquí podríamos implementar una llamada a la API para generar el PDF en el servidor
      // O podríamos mantener la lógica de generación en el cliente

      // Por ahora, simplemente devolvemos éxito
      return { success: true }
    } catch (error) {
      console.error("Error al generar PDF:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al generar PDF",
      }
    }
  }
}

export const filtrosService = new FiltrosService()
