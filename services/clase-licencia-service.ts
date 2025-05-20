export interface ClaseLicencia {
  id: string
  nombre: string
  descripcion: string
  edadMinima: number
  esProfesional: boolean
  requiereExperiencia: boolean
  aniosExperienciaRequeridos?: number
  vigenciaMaxima: number
  costo: number
  activo: boolean
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

// Servicio para la gestión de clases de licencias
export const claseLicenciaService = {
  // Listar todas las clases de licencias
  listarClasesLicencia: async (incluirInactivas = false): Promise<ClaseLicencia[]> => {
    // En producción, sería algo como:
    // try {
    //   const queryParams = new URLSearchParams();
    //   queryParams.append('incluirInactivas', incluirInactivas.toString());
    //
    //   const response = await fetch(`${API_URL}/clases-licencia?${queryParams.toString()}`, {
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
    //   console.error('Error al listar clases de licencia:', error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return []
  },

  // Obtener una clase de licencia por ID
  obtenerClaseLicencia: async (id: string): Promise<ClaseLicencia | null> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/clases-licencia/${id}`, {
    //     method: 'GET',
    //     headers: getAuthHeaders(),
    //   });
    //
    //   if (response.status === 404) {
    //     return null;
    //   }
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al obtener clase de licencia con ID ${id}:`, error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return null
  },

  // Crear una nueva clase de licencia
  crearClaseLicencia: async (datos: Omit<ClaseLicencia, "id">): Promise<ClaseLicencia> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/clases-licencia`, {
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
    //   console.error('Error al crear clase de licencia:', error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      id: "nueva-clase",
      ...datos,
    }
  },

  // Actualizar una clase de licencia existente
  actualizarClaseLicencia: async (id: string, datos: Partial<Omit<ClaseLicencia, "id">>): Promise<ClaseLicencia> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/clases-licencia/${id}`, {
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
    //   console.error(`Error al actualizar clase de licencia con ID ${id}:`, error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      id,
      nombre: "Clase Actualizada",
      descripcion: "Descripción actualizada",
      edadMinima: 18,
      esProfesional: false,
      requiereExperiencia: false,
      vigenciaMaxima: 5,
      costo: 1000,
      activo: true,
      ...datos,
    }
  },

  // Cambiar estado de una clase de licencia (activar/desactivar)
  cambiarEstadoClaseLicencia: async (id: string, activo: boolean): Promise<ClaseLicencia> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/clases-licencia/${id}/estado`, {
    //     method: 'PATCH',
    //     headers: getAuthHeaders(),
    //     body: JSON.stringify({ activo })
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error al cambiar estado de clase de licencia con ID ${id}:`, error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      id,
      nombre: "Clase",
      descripcion: "Descripción",
      edadMinima: 18,
      esProfesional: false,
      requiereExperiencia: false,
      vigenciaMaxima: 5,
      costo: 1000,
      activo,
    }
  },
}
