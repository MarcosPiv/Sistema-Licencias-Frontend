export interface EstadisticasGenerales {
  licenciasEmitidas: number
  licenciasVencidas: number
  licenciasProximasAVencer: number
  titularesRegistrados: number
  operadoresActivos: number
}

export interface EstadisticasPorPeriodo {
  periodo: string
  licenciasEmitidas: number
  licenciasRenovadas: number
  licenciasVencidas: number
}

export interface EstadisticasPorClase {
  clase: string
  cantidad: number
  porcentaje: number
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

// Servicio para estadísticas
export const estadisticasService = {
  // Obtener estadísticas generales
  obtenerEstadisticasGenerales: async (): Promise<EstadisticasGenerales> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/estadisticas/generales`, {
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
    //   console.error('Error al obtener estadísticas generales:', error);
    //   throw error;
    // }

    return {
      licenciasEmitidas: 0,
      licenciasVencidas: 0,
      licenciasProximasAVencer: 0,
      titularesRegistrados: 0,
      operadoresActivos: 0,
    }
  },

  // Obtener estadísticas por período
  obtenerEstadisticasPorPeriodo: async (
    tipoPeriodo: "diario" | "semanal" | "mensual" | "anual",
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<EstadisticasPorPeriodo[]> => {
    // En producción, sería algo como:
    // try {
    //   const queryParams = new URLSearchParams();
    //   queryParams.append('tipoPeriodo', tipoPeriodo);
    //   if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
    //   if (fechaFin) queryParams.append('fechaFin', fechaFin);
    //
    //   const response = await fetch(`${API_URL}/estadisticas/periodo?${queryParams.toString()}`, {
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
    //   console.error('Error al obtener estadísticas por período:', error);
    //   throw error;
    // }

    return []
  },

  // Obtener estadísticas por clase de licencia
  obtenerEstadisticasPorClase: async (): Promise<EstadisticasPorClase[]> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/estadisticas/clase`, {
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
    //   console.error('Error al obtener estadísticas por clase:', error);
    //   throw error;
    // }

    return []
  },
}
