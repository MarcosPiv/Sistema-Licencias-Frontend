export interface Notificacion {
  id: number
  tipo: "INFO" | "WARNING" | "ERROR" | "SUCCESS"
  titulo: string
  mensaje: string
  fechaCreacion: string
  leida: boolean
  usuarioId: number
}

export interface NotificacionesResponse {
  success: boolean
  message: string
  notificaciones: Notificacion[]
  total: number
  noLeidas: number
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

// Servicio para la gestión de notificaciones
export const notificacionService = {
  // Obtener notificaciones del usuario actual
  obtenerNotificaciones: async (soloNoLeidas = false): Promise<NotificacionesResponse> => {
    // En producción, sería algo como:
    // try {
    //   const queryParams = new URLSearchParams();
    //   queryParams.append('soloNoLeidas', soloNoLeidas.toString());
    //
    //   const response = await fetch(`${API_URL}/notificaciones?${queryParams.toString()}`, {
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
    //   console.error('Error al obtener notificaciones:', error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      success: true,
      message: "Notificaciones obtenidas correctamente",
      notificaciones: [],
      total: 0,
      noLeidas: 0,
    }
  },

  // Marcar notificación como leída
  marcarComoLeida: async (id: number): Promise<{ success: boolean; message: string }> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/notificaciones/${id}/leer`, {
    //     method: 'PATCH',
    //     headers: getAuthHeaders(),
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al marcar notificación ${id} como leída:`, error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      success: true,
      message: "Notificación marcada como leída correctamente",
    }
  },

  // Marcar todas las notificaciones como leídas
  marcarTodasComoLeidas: async (): Promise<{ success: boolean; message: string }> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/notificaciones/leer-todas`, {
    //     method: 'PATCH',
    //     headers: getAuthHeaders(),
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error('Error al marcar todas las notificaciones como leídas:', error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      success: true,
      message: "Todas las notificaciones marcadas como leídas correctamente",
    }
  },

  // Eliminar notificación
  eliminarNotificacion: async (id: number): Promise<{ success: boolean; message: string }> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/notificaciones/${id}`, {
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
    //   console.error(`Error al eliminar notificación ${id}:`, error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      success: true,
      message: "Notificación eliminada correctamente",
    }
  },
}
