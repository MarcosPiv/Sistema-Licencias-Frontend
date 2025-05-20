// Definición de roles de usuario
export enum Rol {
  SUPER_USER = "SUPER_USER",
  OPERADOR = "OPERADOR",
}

// Interfaz para el usuario
export interface Usuario {
  id?: number
  nombre: string
  apellido: string
  fechaNacimiento: string // Formato ISO: YYYY-MM-DD
  email: string
  password?: string // Opcional en respuestas
  rol: Rol
  activo?: boolean
}

// Interfaz para la creación de un usuario
export interface CrearUsuarioRequest {
  nombre: string
  apellido: string
  fechaNacimiento: string
  email: string
  password: string
  rol: Rol
}

// Interfaz para la respuesta de creación de usuario
export interface CrearUsuarioResponse {
  success: boolean
  message: string
  usuario?: Usuario
}

// Interfaz para listar usuarios
export interface ListarUsuariosResponse {
  success: boolean
  usuarios: Usuario[]
}
