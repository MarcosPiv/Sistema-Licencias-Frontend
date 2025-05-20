// Ejemplos de JSON para la API de renovación de licencias

// 1. Solicitud para buscar licencia por documento
export const buscarLicenciaPorDocumentoRequest = {
  tipoDocumento: "DNI",
  numeroDocumento: "30123456",
}

// 1. Respuesta de búsqueda de licencia por documento
export const buscarLicenciaPorDocumentoResponse = {
  success: true,
  data: {
    id: 1234,
    numeroLicencia: "LC-2023-00123",
    claseLicencia: "B",
    fechaEmision: "2021-05-15T10:30:00",
    fechaVencimiento: "2026-05-15T10:30:00",
    observaciones: "",
    estado: "VIGENTE",
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
  },
  message: "Licencia encontrada correctamente",
}

// 2. Solicitud para renovar licencia
export const renovarLicenciaRequest = {
  licenciaId: 1234,
  titularId: 456,
  claseLicencia: "B",
  direccion: "Av. Rivadavia 1234, CABA",
  donanteOrganos: "Si",
  vigenciaAnios: 5,
  costo: 9000,
  fechaRenovacion: "2023-11-15T14:30:00",
}

// 2. Respuesta de renovación de licencia
export const renovarLicenciaResponse = {
  success: true,
  data: {
    id: 1235,
    numeroLicencia: "LC-2023-00456",
    licenciaAnteriorId: 1234,
    claseLicencia: "B",
    fechaEmision: "2023-11-15T14:30:00",
    fechaVencimiento: "2028-11-15T14:30:00",
    observaciones: "Renovación de licencia LC-2023-00123",
    estado: "VIGENTE",
    costo: 9000,
    comprobantePago: {
      id: 789,
      numeroComprobante: "CP-2023-00789",
      monto: 9000,
      fechaEmision: "2023-11-15T14:30:00",
      metodoPago: "TARJETA_CREDITO",
    },
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
  },
  message: "Licencia renovada correctamente",
}
