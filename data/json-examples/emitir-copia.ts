// Ejemplos de JSON para la API de emisión de copias de licencias

// 1. Solicitud para buscar licencia por documento
export const buscarLicenciaPorDocumentoRequest = {
  tipoDocumento: "DNI",
  numeroDocumento: "30123456",
}

// 2. Solicitud para buscar licencia por número de licencia
export const buscarLicenciaPorNumeroRequest = {
  numeroLicencia: "LC-2023-00123",
}

// Respuesta de búsqueda de licencia (igual para ambos métodos)
export const buscarLicenciaResponse = {
  success: true,
  data: {
    id: 1234,
    numeroLicencia: "LC-2023-00123",
    claseLicencia: "B",
    fechaEmision: "2021-05-15T10:30:00",
    fechaVencimiento: "2026-05-15T10:30:00",
    observaciones: "",
    estado: "VIGENTE",
    esCopia: false,
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

// 3. Solicitud para emitir copia de licencia
export const emitirCopiaRequest = {
  licenciaOriginalId: 1234,
  motivoCopia: "perdida", // Opciones: "perdida", "robo", "deterioro"
  costo: 50,
  fechaEmision: "2023-11-15T14:30:00",
}

// 3. Respuesta de emisión de copia
export const emitirCopiaResponse = {
  success: true,
  data: {
    id: 1235,
    numeroLicencia: "LC-2023-00123-D1", // D1 indica que es el primer duplicado
    licenciaOriginalId: 1234,
    claseLicencia: "B",
    fechaEmision: "2023-11-15T14:30:00",
    fechaVencimiento: "2026-05-15T10:30:00", // Mantiene la fecha de vencimiento original
    observaciones: "Copia por pérdida",
    estado: "VIGENTE",
    esCopia: true,
    numeroCopia: 1,
    costo: 50,
    comprobantePago: {
      id: 790,
      numeroComprobante: "CP-2023-00790",
      monto: 50,
      fechaEmision: "2023-11-15T14:30:00",
      metodoPago: "EFECTIVO",
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
  message: "Copia de licencia emitida correctamente",
}
