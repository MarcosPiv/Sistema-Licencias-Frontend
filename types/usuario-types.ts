export interface Usuario {
  id?: number
  nombre: string
  apellido: string
  mail: string // Cambiar de email a mail
  password?: string // Opcional en respuestas
  roles: string[] // Cambiar de rol: Rol a roles: string[]
  activo?: boolean
}

// Actualizar la interfaz para crear usuario
export interface CrearUsuarioRequest {
  nombre: string
  apellido: string
  mail: string // Cambiar de email a mail
  password: string
  roles: string[] // Cambiar de rol: Rol a roles: string[]
}

// Actualizar la respuesta de creación
export interface CrearUsuarioResponse {
  success: boolean
  message: string
  usuario?: Usuario
}

// Mantener la respuesta de listar usuarios
export interface ListarUsuariosResponse {
  success: boolean
  usuarios: Usuario[]
}
