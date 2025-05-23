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

// URL base de la API
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sistema-licencias.gob.ar';

// Función para obtener los headers de autenticación
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('auth_token');
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`
//   };
// };

// Servicio para la gestión de licencias
export const licenciaService = {
  // Listar todas las licencias
  listarLicencias: async (filtros?: any): Promise<LicenciasResponse> => {
    // En producción, sería algo como:
    // try {
    //   const queryParams = new URLSearchParams();
    //   if (filtros) {
    //     Object.entries(filtros).forEach(([key, value]) => {
    //       if (value) queryParams.append(key, value as string);
    //     });
    //   }
    //
    //   const response = await fetch(`${API_URL}/licencias?${queryParams.toString()}`, {
    //     method: 'GET',
    //     headers: getAuthHeaders(),
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error('Error al listar licencias:', error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
      licencias: [],
      total: 0,
    }
  },

  // Obtener una licencia por ID
  obtenerLicencia: async (id: number): Promise<LicenciaResponse> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/licencias/${id}`, {
    //     method: 'GET',
    //     headers: getAuthHeaders(),
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al obtener licencia con ID ${id}:`, error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
    }
  },

  // Emitir una nueva licencia
  emitirLicencia: async (datos: EmitirLicenciaRequest): Promise<LicenciaResponse> => {
    try {
      // Preparar los datos para el backend
      const datosParaEnviar = {
        titularId: Number.parseInt(datos.titularId.toString()),
        clase: datos.clase,
        numeroCopia: datos.numeroCopia || null,
        motivoCopia: datos.motivoCopia || null,
        emisor: datos.emisor || "admin",
      }

      console.log("Datos a enviar al backend:", datosParaEnviar)

      const response = await fetch("http://localhost:8080/api/licencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(datosParaEnviar),
      })

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
  renovarLicencia: async (licenciaId: number, datos: Partial<EmitirLicenciaRequest>): Promise<LicenciaResponse> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/licencias/${licenciaId}/renovar`, {
    //     method: 'POST',
    //     headers: getAuthHeaders(),
    //     body: JSON.stringify(datos)
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al renovar licencia con ID ${licenciaId}:`, error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
    }
  },

  // Emitir copia de una licencia
  emitirCopia: async (licenciaId: number, motivo: string): Promise<LicenciaResponse> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/licencias/${licenciaId}/copia`, {
    //     method: 'POST',
    //     headers: getAuthHeaders(),
    //     body: JSON.stringify({ motivo })
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al emitir copia de licencia con ID ${licenciaId}:`, error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
    }
  },

  // Anular una licencia
  anularLicencia: async (id: number, motivo: string): Promise<{ success: boolean; message: string }> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/licencias/${id}/anular`, {
    //     method: 'POST',
    //     headers: getAuthHeaders(),
    //     body: JSON.stringify({ motivo })
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al anular licencia con ID ${id}:`, error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
    }
  },

  // Obtener licencias vencidas
  obtenerLicenciasVencidas: async (): Promise<LicenciasResponse> => {
    try {
      const response = await fetch("http://localhost:8080/api/licencias/vencidas", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })

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
}
