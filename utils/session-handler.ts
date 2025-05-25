"use client"

export function isTokenExpired(token: string): boolean {
  try {
    if (!token) return true

    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000

    return payload.exp <= currentTime
  } catch (error) {
    console.error("Error al verificar token:", error)
    return true
  }
}

export function handleSessionExpired() {
  if (typeof window === "undefined") return

  // Obtener el email del usuario antes de limpiar
  let userEmail = ""
  try {
    const token = localStorage.getItem("auth_token")
    if (token && !isTokenExpired(token)) {
      const payload = JSON.parse(atob(token.split(".")[1]))
      userEmail = payload.sub || ""
    }
  } catch (error) {
    console.log("No se pudo extraer email del token")
  }

  // Limpiar todos los datos de sesión
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_data")
  localStorage.removeItem("user_role")
  localStorage.removeItem("user_email")
  sessionStorage.clear()

  // Redirigir a session-expired con el email si está disponible
  const redirectUrl = userEmail ? `/session-expired?email=${encodeURIComponent(userEmail)}` : "/session-expired"

  console.log("🔒 Sesión expirada - Redirigiendo a:", redirectUrl)
  window.location.href = redirectUrl
}

export function isSessionExpiredError(error: any): boolean {
  // Verificar si es un error de sesión expirada
  return (
    error?.status === 401 ||
    error?.status === 403 ||
    error?.message?.includes("token") ||
    error?.message?.includes("unauthorized") ||
    error?.message?.includes("forbidden")
  )
}
