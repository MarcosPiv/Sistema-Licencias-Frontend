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
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sistema-licencias.gob.ar';

// Función para obtener los headers de autenticación
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('auth_token');
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`
//   };
// };

// Servicio para la gestión de titulares
export const titularService = {
  // Listar todos los titulares
  listarTitulares: async (filtros?: any): Promise<TitularesResponse> => {
    // En producción, sería algo como:
    // try {
    //   const queryParams = new URLSearchParams();
    //   if (filtros) {
    //     Object.entries(filtros).forEach(([key, value]) => {
    //       if (value) queryParams.append(key, value as string);
    //     });
    //   }
    //
    //   const response = await fetch(`${API_URL}/titulares?${queryParams.toString()}`, {
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
    //   console.error('Error al listar titulares:', error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
      titulares: [],
      total: 0,
    }
  },

  // Obtener un titular por ID
  obtenerTitular: async (id: number): Promise<TitularResponse> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/titulares/${id}`, {
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
    //   console.error(`Error al obtener titular con ID ${id}:`, error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
      titular: {} as Titular,
    }
  },

// Obtener un titular por tipo y número de documento
obtenerTitularPorDocumento: async (tipoDocumento: string, numeroDocumento: string): Promise<TitularResponse> => {
  try {
    // Convertir el tipo de documento a mayúsculas para la API
    const tipoDocumentoAPI = tipoDocumento.toUpperCase();
    
    console.log(`Buscando titular: ${tipoDocumentoAPI} ${numeroDocumento}`);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/titulares?tipoDocumento=${tipoDocumentoAPI}&numeroDocumento=${numeroDocumento}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

    // Capturar el texto de la respuesta primero para poder mostrarlo en caso de error
    const responseText = await response.text();
    console.log("Respuesta del servidor:", responseText);

    if (!response.ok) {
      // Intentar parsear el error como JSON si es posible
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        if (responseText) {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        }
      } catch (parseError) {
        console.error("No se pudo parsear el error como JSON:", parseError);
      }

      throw new Error(errorMessage);
    }

    // Parsear la respuesta JSON solo si hay contenido
    let titularData;
    try {
      if (responseText) {
        titularData = JSON.parse(responseText);
      } else {
        throw new Error("La respuesta del servidor está vacía");
      }
    } catch (parseError) {
      console.error("Error al parsear la respuesta JSON:", parseError);
      throw new Error("La respuesta del servidor no es un JSON válido");
    }

    // Verificar si los datos del titular están presentes
    if (!titularData || !titularData.id) {
      throw new Error("No se encontró el titular con los datos proporcionados");
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
    };

    return {
      success: true,
      message: "Titular encontrado",
      titular: titular,
    };
  } catch (error) {
    console.error(`Error al obtener titular con documento ${tipoDocumento} ${numeroDocumento}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al buscar titular",
      titular: {} as Titular,
    };
  }
},

// Crear un nuevo titular
  crearTitular: async (datos: Omit<Titular, "id" | "fechaAlta">): Promise<TitularResponse> => {
  try {
    // Transformar los datos para adaptarlos al formato esperado por el backend
    const [nombre, apellido] = datos.nombreApellido.split(" ", 2)
    const apellidoCompleto = datos.nombreApellido.substring(nombre.length + 1)
    
    // Procesar el factor Rh para siempre enviar el formato correcto al backend
    const factorRhMayus = datos.factorRh.toUpperCase();
    const factorRhValido = 
      factorRhMayus === "POSITIVO" || 
      factorRhMayus === "+" || 
      datos.factorRh === "+" ? 
      "POSITIVO" : "NEGATIVO";
    
    // Procesar donante de órganos para siempre enviar booleano
    const esDonanteOrganos = 
      datos.donanteOrganos === "SI" || 
      datos.donanteOrganos === "si" || 
      datos.donanteOrganos === "Sí" || 
      datos.donanteOrganos === "SÍ";
    
    // Log para depuración
    console.log("Datos originales:", { 
      factorRh: datos.factorRh, 
      donanteOrganos: datos.donanteOrganos 
    });
    console.log("Datos transformados:", { 
      factorRh: factorRhValido, 
      donanteOrganos: esDonanteOrganos 
    });

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
    
    console.log("Enviando al backend:", JSON.stringify(datosParaEnviar));

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/titulares`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosParaEnviar),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error del servidor:", errorText);
      throw new Error(`Error ${response.status}: ${response.statusText || errorText}`);
    }

    const responseData = await response.json()
    console.log("Respuesta del backend:", responseData);

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
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/titulares/${id}`, {
    //     method: 'PUT',
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
    //   console.error(`Error al actualizar titular con ID ${id}:`, error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
      titular: {} as Titular,
    }
  },

  // Actualizar un titular por tipo y número de documento
  actualizarTitularPorDocumento: async (
    tipoDocumento: string,
    numeroDocumento: string,
    datos: Partial<Omit<Titular, "id" | "tipoDocumento" | "numeroDocumento" | "fechaAlta">>,
  ): Promise<TitularResponse> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(
    //     `${API_URL}/titulares/documento?tipo=${tipoDocumento}&numero=${numeroDocumento}`,
    //     {
    //       method: 'PUT',
    //       headers: getAuthHeaders(),
    //       body: JSON.stringify(datos)
    //     }
    //   );
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al actualizar titular con documento ${tipoDocumento} ${numeroDocumento}:`, error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
      titular: {} as Titular,
    }
  },

  // Eliminar un titular
  eliminarTitular: async (id: number): Promise<{ success: boolean; message: string }> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/titulares/${id}`, {
    //     method: 'DELETE',
    //     headers: getAuthHeaders(),
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al eliminar titular con ID ${id}:`, error);
    //   throw error;
    // }

    return {
      success: false,
      message: "Servicio no implementado",
    }
  },

  // Obtener estadísticas de titulares
  obtenerEstadisticas: async (): Promise<TitularStats> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/titulares/estadisticas`, {
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
    //   console.error('Error al obtener estadísticas de titulares:', error);
    //   throw error;
    // }

    return {
      total: 0,
      porGrupoSanguineo: {
        "0": 0,
        A: 0,
        B: 0,
        AB: 0,
      },
      porFactorRh: {
        positivo: 0,
        negativo: 0,
      },
      porDonanteOrganos: {
        si: 0,
        no: 0,
      },
      nuevosUltimos30Dias: 0,
    }
  },
}
