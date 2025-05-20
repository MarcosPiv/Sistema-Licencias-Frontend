/**
 * Ejemplos de JSON para las llamadas al backend relacionadas con la autenticación
 */

// REQUEST: Iniciar sesión
export const loginRequest = {
  email: "admin@municipio.gob",
  password: "admin",
}

// RESPONSE: Respuesta exitosa al iniciar sesión
export const loginSuccessResponse = {
  success: true,
  message: "Inicio de sesión exitoso",
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT token
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Refresh token
    usuario: {
      id: 456,
      nombre: "Administrador",
      email: "admin@municipio.gob",
      rol: "ADMIN",
      permisos: [
        "CREAR_TITULAR",
        "EDITAR_TITULAR",
        "EMITIR_LICENCIA",
        "RENOVAR_LICENCIA",
        "EMITIR_COPIA",
        "IMPRIMIR_LICENCIA",
        "VER_ESTADISTICAS",
        "ADMINISTRAR_USUARIOS",
      ],
      ultimoAcceso: "2023-11-14T16:45:22",
    },
    expiracion: 3600, // Tiempo de expiración del token en segundos
  },
}

// RESPONSE: Respuesta para operador con permisos limitados
export const loginOperadorResponse = {
  success: true,
  message: "Inicio de sesión exitoso",
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    usuario: {
      id: 457,
      nombre: "Operador",
      email: "operador@municipio.gob",
      rol: "OPERADOR",
      permisos: ["CREAR_TITULAR", "EMITIR_LICENCIA", "IMPRIMIR_LICENCIA"],
      ultimoAcceso: "2023-11-15T09:30:15",
    },
    expiracion: 3600,
  },
}

// RESPONSE: Respuesta de error al iniciar sesión
export const loginErrorResponse = {
  success: false,
  message: "Credenciales inválidas. Por favor, intente nuevamente.",
  data: null,
}

// REQUEST: Renovar token
export const refreshTokenRequest = {
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
}

// RESPONSE: Respuesta al renovar token
export const refreshTokenResponse = {
  success: true,
  message: "Token renovado correctamente",
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Nuevo JWT token
    expiracion: 3600, // Tiempo de expiración del nuevo token en segundos
  },
}

// REQUEST: Cerrar sesión
export const logoutRequest = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
}

// RESPONSE: Respuesta al cerrar sesión
export const logoutResponse = {
  success: true,
  message: "Sesión cerrada correctamente",
  data: null,
}
