/**
 * Ejemplos de JSON para las llamadas al backend relacionadas con la emisión de licencias
 */

// REQUEST: Buscar titular para emitir licencia
export const buscarTitularParaLicenciaRequest = {
  tipoDocumento: "DNI",
  numeroDocumento: "30456789",
}

// RESPONSE: Respuesta al buscar un titular para emitir licencia
export const buscarTitularParaLicenciaResponse = {
  success: true,
  data: {
    id: 1234,
    tipoDocumento: "DNI",
    numeroDocumento: "30456789",
    nombreApellido: "Juan Alberto Pérez",
    fechaNacimiento: "1985-06-15",
    direccion: "Av. Corrientes 5678, Buenos Aires",
    grupoSanguineo: "A",
    factorRh: "+",
    donanteOrganos: "Si",
    edad: 38,
    licenciasActivas: [
      {
        id: 5678,
        numeroLicencia: "LC-2023-5678",
        claseLicencia: "A",
        fechaEmision: "2023-05-10T15:00:00",
        fechaVencimiento: "2028-05-10T15:00:00",
        estado: "ACTIVA",
      },
    ],
  },
}

// REQUEST: Calcular vigencia y costo de licencia
export const calcularVigenciaCostoRequest = {
  titularId: 1234,
  claseLicencia: "B",
  edad: 38,
}

// RESPONSE: Respuesta con la vigencia y costo calculados
export const calcularVigenciaCostoResponse = {
  success: true,
  data: {
    vigencia: 5, // años
    costo: 10000, // pesos
    edadMinima: 18, // edad mínima requerida para esta clase
    cumpleRequisitos: true, // indica si el titular cumple con los requisitos para esta clase
  },
}

// RESPONSE: Respuesta cuando no cumple requisitos de edad
export const calcularVigenciaCostoErrorResponse = {
  success: false,
  message: "La edad mínima para la clase B es de 21 años",
  data: {
    vigencia: 0,
    costo: 0,
    edadMinima: 21,
    cumpleRequisitos: false,
  },
}

// REQUEST: Emitir nueva licencia
export const emitirLicenciaRequest = {
  titularId: 1234,
  claseLicencia: "B",
  vigencia: 5,
  costo: 10000,
  operadorId: 456, // ID del operador que emite la licencia
  observaciones: "Primera licencia clase B",
}

// RESPONSE: Respuesta al emitir una nueva licencia
export const emitirLicenciaResponse = {
  success: true,
  message: "Licencia emitida correctamente",
  data: {
    licencia: {
      id: 5679,
      numeroLicencia: "LC-2023-5679",
      titularId: 1234,
      titular: {
        nombreApellido: "Juan Alberto Pérez",
        tipoDocumento: "DNI",
        numeroDocumento: "30456789",
      },
      claseLicencia: "B",
      fechaEmision: "2023-11-15T10:30:45",
      fechaVencimiento: "2028-11-15T10:30:45",
      vigencia: 5,
      costo: 10000,
      estado: "EMITIDA",
      observaciones: "Primera licencia clase B",
      operadorId: 456,
      operador: "Admin Sistema",
    },
    comprobantePago: {
      id: 7890,
      numeroComprobante: "CP-2023-7890",
      licenciaId: 5679,
      monto: 10000,
      fechaEmision: "2023-11-15T10:30:45",
      metodoPago: "EFECTIVO",
      estado: "PAGADO",
    },
  },
}
