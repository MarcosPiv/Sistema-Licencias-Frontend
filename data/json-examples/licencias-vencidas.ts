// Ejemplos de JSON para la API de licencias vencidas

// 1. Solicitud para obtener licencias vencidas con filtros
export const obtenerLicenciasVencidasRequest = {
  fechaDesde: "2023-01-01T00:00:00", // Opcional, filtro por fecha de vencimiento desde
  fechaHasta: "2023-11-15T23:59:59", // Opcional, filtro por fecha de vencimiento hasta
  nombreTitular: "Juan", // Opcional, filtro por nombre del titular
  page: 0, // Para paginación
  size: 10, // Cantidad de resultados por página
  sort: "fechaVencimiento,desc", // Ordenamiento
}

// 1. Respuesta de obtención de licencias vencidas
export const obtenerLicenciasVencidasResponse = {
  success: true,
  data: {
    content: [
      {
        id: 1230,
        numeroLicencia: "LC-2022-00987",
        claseLicencia: "A",
        fechaEmision: "2018-03-10T09:15:00",
        fechaVencimiento: "2023-03-10T09:15:00",
        observaciones: "",
        estado: "VENCIDA",
        diasVencida: 250, // Días transcurridos desde el vencimiento
        titular: {
          id: 450,
          tipoDocumento: "DNI",
          numeroDocumento: "25789456",
          nombreApellido: "Juan Gómez",
          fechaNacimiento: "1975-11-05T00:00:00",
          edad: 48,
          direccion: "Av. Santa Fe 2345, CABA",
          telefono: "1156789012",
          email: "juan.gomez@email.com",
          grupoSanguineo: "0",
          factorRh: "+",
          donanteOrganos: "No",
        },
      },
      {
        id: 1231,
        numeroLicencia: "LC-2022-00988",
        claseLicencia: "B",
        fechaEmision: "2018-05-20T11:30:00",
        fechaVencimiento: "2023-05-20T11:30:00",
        observaciones: "",
        estado: "VENCIDA",
        diasVencida: 179, // Días transcurridos desde el vencimiento
        titular: {
          id: 451,
          tipoDocumento: "DNI",
          numeroDocumento: "26123789",
          nombreApellido: "Ana Martínez",
          fechaNacimiento: "1978-07-15T00:00:00",
          edad: 45,
          direccion: "Calle Callao 456, CABA",
          telefono: "1157890123",
          email: "ana.martinez@email.com",
          grupoSanguineo: "B",
          factorRh: "-",
          donanteOrganos: "Si",
        },
      },
    ],
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false,
      },
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      paged: true,
      unpaged: false,
    },
    totalElements: 45,
    totalPages: 5,
    last: false,
    first: true,
    sort: {
      sorted: true,
      unsorted: false,
      empty: false,
    },
    number: 0,
    numberOfElements: 10,
    size: 10,
    empty: false,
  },
  message: "Licencias vencidas obtenidas correctamente",
}
