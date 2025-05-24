export interface LoginRequest {
  mail: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  token?: string
  usuario?: {
    id: number
    nombre: string
    apellido: string
    mail: string
    rol: string
  }
}

export interface CambiarPasswordRequest {
  passwordActual: string
  passwordNueva: string
  confirmarPasswordNueva: string
}

export interface RecuperarPasswordRequest {
  email: string
}

export interface ResetearPasswordRequest {
  token: string
  password: string
  confirmarPassword: string
}

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Función para decodificar JWT (simplificada)
const decodeJWT = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload
  } catch (error) {
    console.error("Error al decodificar JWT:", error)
    return null
  }
}

// Servicio para la autenticación
export const authService = {
  // Iniciar sesión
  login: async (datos: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log("Intentando login con:", { mail: datos.mail })

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datos),
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log("Datos recibidos:", data)

        if (data.token) {
          // Guardar el token en localStorage
          localStorage.setItem("auth_token", data.token)

          // Decodificar el token para obtener información del usuario
          const payload = decodeJWT(data.token)
          console.log("Payload del token:", payload)

          if (payload) {
            // Extraer información del usuario del token
            const usuario = {
              id: payload.sub || 0,
              nombre: payload.nombre || "",
              apellido: payload.apellido || "",
              mail: payload.sub || datos.mail,
              rol: payload.roles && payload.roles.length > 0 ? payload.roles[0] : "OPERADOR",
            }

            console.log("Usuario autenticado:", usuario)

            return {
              success: true,
              message: "Inicio de sesión exitoso",
              token: data.token,
              usuario,
            }
          }
        }

        return {
          success: true,
          message: "Inicio de sesión exitoso",
          token: data.token,
        }
      } else {
        // Manejar errores del servidor
        let errorMessage = "Error al iniciar sesión"

        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // Si no se puede parsear como JSON, usar el texto de respuesta
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        }

        console.error("Error del servidor:", errorMessage)

        return {
          success: false,
          message: errorMessage,
        }
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor. Verifique su conexión.",
      }
    }
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    try {
      // Opcional: notificar al servidor sobre el cierre de sesión
      const token = localStorage.getItem("auth_token")
      if (token) {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        } catch (error) {
          console.log("Error al notificar logout al servidor:", error)
        }
      }

      // Eliminar el token del localStorage
      localStorage.removeItem("auth_token")
      console.log("Sesión cerrada exitosamente")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("auth_token")
    if (!token) return false

    // Verificar si el token no ha expirado
    try {
      const payload = decodeJWT(token)
      if (payload && payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000)
        return payload.exp > currentTime
      }
    } catch (error) {
      console.error("Error al verificar token:", error)
      return false
    }

    return !!token
  },

  // Obtener el rol del usuario actual
  getUserRole: (): string | null => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return null

      const payload = decodeJWT(token)
      if (payload && payload.roles && payload.roles.length > 0) {
        return payload.roles[0]
      }

      return null
    } catch (error) {
      console.error("Error al obtener el rol del usuario:", error)
      return null
    }
  },

  // Obtener información del usuario actual
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return null

      const payload = decodeJWT(token)
      if (payload) {
        return {
          id: payload.sub || 0,
          nombre: payload.nombre || "",
          apellido: payload.apellido || "",
          mail: payload.sub || "",
          rol: payload.roles && payload.roles.length > 0 ? payload.roles[0] : "OPERADOR",
        }
      }

      return null
    } catch (error) {
      console.error("Error al obtener información del usuario:", error)
      return null
    }
  },

  // Obtener el token actual
  getToken: (): string | null => {
    return localStorage.getItem("auth_token")
  },

  // Cambiar contraseña del usuario actual
  cambiarPassword: async (datos: CambiarPasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return {
          success: false,
          message: "No hay sesión activa",
        }
      }

      const response = await fetch(`${API_URL}/auth/cambiar-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Contraseña cambiada exitosamente",
        }
      } else {
        return {
          success: false,
          message: data.message || "Error al cambiar contraseña",
        }
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  },

  // Solicitar recuperación de contraseña
  recuperarPassword: async (datos: RecuperarPasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/recuperar-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Se ha enviado un correo con instrucciones",
        }
      } else {
        return {
          success: false,
          message: data.message || "Error al solicitar recuperación",
        }
      }
    } catch (error) {
      console.error("Error al solicitar recuperación de contraseña:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  },

  // Resetear contraseña con token
  resetearPassword: async (datos: ResetearPasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/resetear-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Contraseña restablecida exitosamente",
        }
      } else {
        return {
          success: false,
          message: data.message || "Error al restablecer contraseña",
        }
      }
    } catch (error) {
      console.error("Error al resetear contraseña:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  },

  // Verificar token de reseteo de contraseña
  verificarTokenReseteo: async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/verificar-token-reseteo/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Token válido",
        }
      } else {
        return {
          success: false,
          message: data.message || "Token inválido o expirado",
        }
      }
    } catch (error) {
      console.error("Error al verificar token de reseteo:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  },
}
