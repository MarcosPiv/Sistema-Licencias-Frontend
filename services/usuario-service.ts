import type { Usuario } from "@/types/usuario-types"

export interface UsuariosResponse {
  success: boolean
  message: string
  usuarios: Usuario[]
  total: number
}

export interface UsuarioResponse {
  success: boolean
  message: string
  usuario: Usuario
}

export interface CrearUsuarioRequest {
  nombre: string
  apellido: string
  mail: string // Cambiar de email a mail
  password: string
  roles: string[] // Cambiar de rol a roles array
}

export interface ActualizarUsuarioRequest {
  nombre?: string
  apellido?: string
  mail?: string // Cambiar de email a mail
  password?: string
  roles?: string[] // Cambiar de rol a roles array
  activo?: boolean
}

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Función para obtener los headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

// Servicio para la gestión de usuarios
export const usuarioService = {
  // Listar todos los usuarios
  listarUsuarios: async (): Promise<UsuariosResponse> => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const usuarios = await response.json()
      return {
        success: true,
        message: "Usuarios obtenidos correctamente",
        usuarios: usuarios,
        total: usuarios.length,
      }
    } catch (error) {
      console.error("Error al listar usuarios:", error)
      return {
        success: false,
        message: "Error al obtener usuarios",
        usuarios: [],
        total: 0,
      }
    }
  },

  // Obtener un usuario por ID
  obtenerUsuario: async (id: number): Promise<UsuarioResponse> => {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const usuario = await response.json()
      return {
        success: true,
        message: "Usuario obtenido correctamente",
        usuario: usuario,
      }
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error)
      return {
        success: false,
        message: "Error al obtener usuario",
        usuario: {} as Usuario,
      }
    }
  },

  // Crear un nuevo usuario
  crearUsuario: async (datos: CrearUsuarioRequest): Promise<UsuarioResponse> => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(datos),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const usuario = await response.json()
      return {
        success: true,
        message: "Usuario creado correctamente",
        usuario: usuario,
      }
    } catch (error) {
      console.error("Error al crear usuario:", error)
      return {
        success: false,
        message: "Error al crear usuario",
        usuario: {} as Usuario,
      }
    }
  },

  // Actualizar un usuario existente
  actualizarUsuario: async (id: number, datos: ActualizarUsuarioRequest): Promise<UsuarioResponse> => {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(datos),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const usuario = await response.json()
      return {
        success: true,
        message: "Usuario actualizado correctamente",
        usuario: usuario,
      }
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error)
      return {
        success: false,
        message: "Error al actualizar usuario",
        usuario: {} as Usuario,
      }
    }
  },

  // Eliminar un usuario (cambiar estado a inactivo)
  eliminarUsuario: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return {
        success: true,
        message: "Usuario desactivado correctamente",
      }
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error)
      return {
        success: false,
        message: "Error al desactivar usuario",
      }
    }
  },

  // Cambiar estado de un usuario (activar/desactivar)
  cambiarEstadoUsuario: async (id: number, activo: boolean): Promise<UsuarioResponse> => {
    try {
      if (!activo) {
        // Para desactivar, usamos DELETE
        const result = await usuarioService.eliminarUsuario(id)
        return {
          success: result.success,
          message: result.message,
          usuario: {} as Usuario,
        }
      } else {
        // Para activar, usamos el nuevo endpoint PATCH
        const response = await fetch(`${API_URL}/usuarios/${id}/activar`, {
          method: "PATCH",
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const usuario = await response.json()
        return {
          success: true,
          message: "Usuario activado correctamente",
          usuario: usuario,
        }
      }
    } catch (error) {
      console.error(`Error al cambiar estado del usuario con ID ${id}:`, error)
      return {
        success: false,
        message: "Error al cambiar estado del usuario",
        usuario: {} as Usuario,
      }
    }
  },
}
