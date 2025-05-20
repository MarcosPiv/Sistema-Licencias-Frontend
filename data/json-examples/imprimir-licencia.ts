/**
 * Ejemplos de JSON para las llamadas al backend relacionadas con la impresión de licencias
 */

// REQUEST: Buscar licencia para imprimir por documento
export const buscarLicenciaParaImprimirPorDocumentoRequest = {
  tipoDocumento: "DNI",
  numeroDocumento: "30456789",
}

// REQUEST: Buscar licencia para imprimir por número de licencia
export const buscarLicenciaParaImprimirPorNumeroRequest = {
  numeroLicencia: "LC-2023-5679",
}

// RESPONSE: Respuesta al buscar licencias para imprimir
export const buscarLicenciasParaImprimirResponse = {
  success: true,
  data: [
    {
      id: 5679,
      numeroLicencia: "LC-2023-5679",
      titular: {
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
      },
      claseLicencia: "B",
      fechaEmision: "2023-11-15T10:30:45",
      fechaVencimiento: "2028-11-15T10:30:45",
      vigencia: 5,
      costo: 10000,
      estado: "EMITIDA",
      observaciones: "Primera licencia clase B",
      esCopia: false,
    },
  ],
}

// REQUEST: Obtener datos completos para impresión de licencia
export const obtenerDatosImpresionRequest = {
  licenciaId: 5679,
}

// RESPONSE: Respuesta con todos los datos necesarios para la impresión
export const obtenerDatosImpresionResponse = {
  success: true,
  data: {
    licencia: {
      id: 5679,
      numeroLicencia: "LC-2023-5679",
      titular: {
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
      },
      claseLicencia: "B",
      fechaEmision: "2023-11-15T10:30:45",
      fechaVencimiento: "2028-11-15T10:30:45",
      vigencia: 5,
      costo: 10000,
      estado: "EMITIDA",
      observaciones: "Primera licencia clase B",
      esCopia: false,
    },
    recursos: {
      logoMunicipalidad: "base64-encoded-image-data",
      logoLicencia: "base64-encoded-image-data",
      firmaDirector: "base64-encoded-image-data",
      marcaAgua: "base64-encoded-image-data",
      qrCode: "base64-encoded-qr-code", // Código QR con datos de la licencia para verificación
      codigoBarras: "base64-encoded-barcode", // Código de barras con el número de licencia
    },
    plantilla: {
      frenteHtml: "<html>...</html>", // Plantilla HTML para el frente de la licencia
      dorsoHtml: "<html>...</html>", // Plantilla HTML para el dorso de la licencia
    },
  },
}

// REQUEST: Registrar impresión de licencia
export const registrarImpresionRequest = {
  licenciaId: 5679,
  operadorId: 456,
  fechaImpresion: "2023-11-15T11:45:30",
  tipoImpresion: "ORIGINAL", // ORIGINAL, DUPLICADO, REIMPRESION
}

// RESPONSE: Respuesta al registrar la impresión
export const registrarImpresionResponse = {
  success: true,
  message: "Impresión registrada correctamente",
  data: {
    id: 9876,
    licenciaId: 5679,
    operadorId: 456,
    operador: "Admin Sistema",
    fechaImpresion: "2023-11-15T11:45:30",
    tipoImpresion: "ORIGINAL",
  },
}
