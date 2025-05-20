export interface ConfiguracionSistema {
  nombreMunicipio: string
  direccionMunicipio: string
  telefonoContacto: string
  emailContacto: string
  logoUrl: string
  colorPrimario: string
  colorSecundario: string
  diasAnticipacionAvisoVencimiento: number
  costoBaseLicencia: number
  factorMultiplicadorClaseProfesional: number
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

// Servicio para la gestión de configuraciones
export const configuracionService = {
  // Obtener configuración actual
  obtenerConfiguracion: async (): Promise<ConfiguracionSistema> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/configuracion`, {
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
    //   console.error('Error al obtener configuración:', error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      nombreMunicipio: "Municipalidad",
      direccionMunicipio: "Dirección de la Municipalidad",
      telefonoContacto: "(123) 456-7890",
      emailContacto: "contacto@municipalidad.gob.ar",
      logoUrl: "/images/logo-licencias-nuevo.png",
      colorPrimario: "#3b82f6",
      colorSecundario: "#1e40af",
      diasAnticipacionAvisoVencimiento: 30,
      costoBaseLicencia: 1000,
      factorMultiplicadorClaseProfesional: 1.5,
    }
  },

  // Actualizar configuración
  actualizarConfiguracion: async (configuracion: Partial<ConfiguracionSistema>): Promise<ConfiguracionSistema> => {
    // En producción, sería algo como:
    // try {
    //   const response = await fetch(`${API_URL}/configuracion`, {
    //     method: 'PUT',
    //     headers: getAuthHeaders(),
    //     body: JSON.stringify(configuracion)
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   return await response.json();
    // } catch (error) {
    //   console.error('Error al actualizar configuración:', error);
    //   throw error;
    // }

    // Datos de ejemplo para desarrollo
    return {
      nombreMunicipio: configuracion.nombreMunicipio || "Municipalidad",
      direccionMunicipio: configuracion.direccionMunicipio || "Dirección de la Municipalidad",
      telefonoContacto: configuracion.telefonoContacto || "(123) 456-7890",
      emailContacto: configuracion.emailContacto || "contacto@municipalidad.gob.ar",
      logoUrl: configuracion.logoUrl || "/images/logo-licencias-nuevo.png",
      colorPrimario: configuracion.colorPrimario || "#3b82f6",
      colorSecundario: configuracion.colorSecundario || "#1e40af",
      diasAnticipacionAvisoVencimiento: configuracion.diasAnticipacionAvisoVencimiento || 30,
      costoBaseLicencia: configuracion.costoBaseLicencia || 1000,
      factorMultiplicadorClaseProfesional: configuracion.factorMultiplicadorClaseProfesional || 1.5,
    }
  },
}
