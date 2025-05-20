// Ejemplos de JSON para la API de filtros avanzados

// 1. Solicitud para buscar titulares con filtros avanzados
export const buscarTitularesFiltrosRequest = {
  gruposSanguineos: ["A", "AB"], // Array vacío si no se selecciona ninguno
  factorRh: "+", // Vacío si no se selecciona ninguno
  soloDonanteOrganos: true,
  incluirLicenciasVigentes: true, // Para incluir información de licencias vigentes
}

// 1. Respuesta de búsqueda de titulares con filtros avanzados
export const buscarTitularesFiltrosResponse = {
  success: true,
  data: [
    {
      titular: {
        id: 456,
        tipoDocumento: "DNI",
        numeroDocumento: "30123456",
        nombreApellido: "Juan Pérez",
        fechaNacimiento: "1985-08-22T00:00:00",
        edad: 38,
        direccion: "Av. Rivadavia 1234, CABA",
        telefono: "1155667788",
        email: "juan.perez@email.com",
        grupoSanguineo: "A",
        factorRh: "+",
        donanteOrganos: "Si",
      },
      licenciaVigente: {
        id: 1234,
        numeroLicencia: "LC-2023-00123",
        claseLicencia: "B",
        fechaEmision: "2021-05-15T10:30:00",
        fechaVencimiento: "2026-05-15T10:30:00",
        estado: "VIGENTE",
      },
    },
    {
      titular: {
        id: 457,
        tipoDocumento: "DNI",
        numeroDocumento: "28456789",
        nombreApellido: "María González",
        fechaNacimiento: "1980-03-15T00:00:00",
        edad: 43,
        direccion: "Calle Corrientes 567, CABA",
        telefono: "1145678901",
        email: "maria.gonzalez@email.com",
        grupoSanguineo: "AB",
        factorRh: "+",
        donanteOrganos: "Si",
      },
      licenciaVigente: null, // Este titular no tiene licencia vigente
    },
  ],
  totalResults: 2,
  message: "Búsqueda realizada correctamente",
}
