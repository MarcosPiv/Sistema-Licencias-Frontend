// Importamos los tipos necesarios
import type { CrearUsuarioRequest, CrearUsuarioResponse, ListarUsuariosResponse } from "@/types/usuario-types"
import { crearUsuarioResponse, listarUsuariosResponse } from "@/data/json-examples/usuarios"
import { simulateDelay } from "@/utils/simulate-delay" // Declare the simulateDelay variable

// URL base de la API
// export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sistema-licencias.gob.ar';

// Función para obtener los headers de autenticación
// export const getAuthHeaders = () => {
//   const token = localStorage.getItem('auth_token');
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`
//   };
// };

// Función genérica para realizar peticiones HTTP
// export const fetchApi = async <T>(
//   endpoint: string,
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
//   body?: any,
//   customHeaders?: Record<string, string>
// ): Promise<T> => {
//   try {
//     const headers = {
//       ...getAuthHeaders(),
//       ...customHeaders
//     };
//
//     const config: RequestInit = {
//       method,
//       headers,
//       credentials: 'include',
//     };
//
//     if (body) {
//       config.body = JSON.stringify(body);
//     }
//
//     const response = await fetch(`${API_URL}${endpoint}`, config);
//
//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         errorData.message || `Error ${response.status}: ${response.statusText}`
//       );
//     }
//
//     return await response.json();
//   } catch (error) {
//     console.error(`Error en petición a ${endpoint}:`, error);
//     throw error;
//   }
// };

// Función para simular un retraso en las respuestas (solo para desarrollo)
// export const simulateDelay = (ms: number = 500): Promise<void> => {
//   return new Promise(resolve => setTimeout(resolve, ms));
// };

// Servicios de Usuarios
export const usuarioService = {
  // Listar todos los usuarios
  listarUsuarios: async (): Promise<ListarUsuariosResponse> => {
    // Simulación de llamada a API
    await simulateDelay()

    // En desarrollo, devolvemos datos de ejemplo
    return listarUsuariosResponse

    // En producción, sería algo como:
    // return await fetchApi<ListarUsuariosResponse>('/usuarios');
  },

  // Crear un nuevo usuario (operador)
  crearUsuario: async (datos: CrearUsuarioRequest): Promise<CrearUsuarioResponse> => {
    // Simulación de llamada a API
    await simulateDelay()

    // En desarrollo, devolvemos datos de ejemplo
    return {
      ...crearUsuarioResponse,
      usuario: {
        ...crearUsuarioResponse.usuario,
        nombre: datos.nombre,
        apellido: datos.apellido,
        fechaNacimiento: datos.fechaNacimiento,
        username: datos.username,
        rol: datos.rol,
      },
    }

    // En producción, sería algo como:
    // return await fetchApi<CrearUsuarioResponse>('/usuarios', 'POST', datos);
  },

  // Cambiar estado de un usuario (activar/desactivar)
  cambiarEstadoUsuario: async (id: number, activo: boolean): Promise<{ success: boolean; message: string }> => {
    // Simulación de llamada a API
    await simulateDelay()

    // En desarrollo, devolvemos respuesta simulada
    return {
      success: true,
      message: `Usuario ${activo ? "activado" : "desactivado"} correctamente`,
    }

    // En producción, sería algo como:
    // return await fetchApi<{ success: boolean; message: string }>(`/usuarios/${id}/estado`, 'PUT', { activo });
  },
}
