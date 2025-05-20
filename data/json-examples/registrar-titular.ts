/**
 * Ejemplos de JSON para las llamadas al backend relacionadas con el registro de titulares
 */

// REQUEST: Registrar un nuevo titular
export const registrarTitularRequest = {
  tipoDocumento: "DNI",
  numeroDocumento: "30456789",
  nombreApellido: "Juan Pérez",
  fechaNacimiento: "1985-06-15",
  direccion: "Av. Rivadavia 1234, Buenos Aires",
  claseSolicitada: "B", // Clase que solicita inicialmente
  grupoSanguineo: "A",
  factorRh: "+",
  donanteOrganos: "Si",
  // Campos adicionales que podrían ser necesarios
  telefono: "1123456789",
  email: "juan.perez@ejemplo.com",
  nacionalidad: "Argentina",
}

// RESPONSE: Respuesta al registrar un nuevo titular
export const registrarTitularResponse = {
  success: true,
  message: "Titular registrado correctamente",
  data: {
    id: 1234,
    tipoDocumento: "DNI",
    numeroDocumento: "30456789",
    nombreApellido: "Juan Pérez",
    fechaNacimiento: "1985-06-15",
    direccion: "Av. Rivadavia 1234, Buenos Aires",
    claseSolicitada: "B",
    grupoSanguineo: "A",
    factorRh: "+",
    donanteOrganos: "Si",
    telefono: "1123456789",
    email: "juan.perez@ejemplo.com",
    nacionalidad: "Argentina",
    fechaRegistro: "2023-11-10T14:30:45",
    edad: 38,
    estado: "ACTIVO",
  },
}

// REQUEST: Actualizar datos de un titular existente
export const actualizarTitularRequest = {
  id: 1234,
  tipoDocumento: "DNI",
  numeroDocumento: "30456789",
  nombreApellido: "Juan Alberto Pérez",
  fechaNacimiento: "1985-06-15",
  direccion: "Av. Corrientes 5678, Buenos Aires",
  grupoSanguineo: "A",
  factorRh: "+",
  donanteOrganos: "Si",
  telefono: "1123456789",
  email: "juan.perez@ejemplo.com",
  nacionalidad: "Argentina",
}

// RESPONSE: Respuesta al actualizar un titular
export const actualizarTitularResponse = {
  success: true,
  message: "Titular actualizado correctamente",
  data: {
    id: 1234,
    tipoDocumento: "DNI",
    numeroDocumento: "30456789",
    nombreApellido: "Juan Alberto Pérez",
    fechaNacimiento: "1985-06-15",
    direccion: "Av. Corrientes 5678, Buenos Aires",
    claseSolicitada: "B",
    grupoSanguineo: "A",
    factorRh: "+",
    donanteOrganos: "Si",
    telefono: "1123456789",
    email: "juan.perez@ejemplo.com",
    nacionalidad: "Argentina",
    fechaRegistro: "2023-11-10T14:30:45",
    fechaActualizacion: "2023-11-15T09:22:18",
    edad: 38,
    estado: "ACTIVO",
  },
}

// REQUEST: Buscar titular por documento
export const buscarTitularPorDocumentoRequest = {
  tipoDocumento: "DNI",
  numeroDocumento: "30456789",
}

// RESPONSE: Respuesta al buscar un titular por documento
export const buscarTitularPorDocumentoResponse = {
  success: true,
  data: {
    id: 1234,
    tipoDocumento: "DNI",
    numeroDocumento: "30456789",
    nombreApellido: "Juan Alberto Pérez",
    fechaNacimiento: "1985-06-15",
    direccion: "Av. Corrientes 5678, Buenos Aires",
    claseSolicitada: "B",
    grupoSanguineo: "A",
    factorRh: "+",
    donanteOrganos: "Si",
    telefono: "1123456789",
    email: "juan.perez@ejemplo.com",
    nacionalidad: "Argentina",
    fechaRegistro: "2023-11-10T14:30:45",
    fechaActualizacion: "2023-11-15T09:22:18",
    edad: 38,
    estado: "ACTIVO",
    licenciasActivas: [
      {
        id: 5678,
        numeroLicencia: "LC-2023-5678",
        claseLicencia: "B",
        fechaEmision: "2023-11-10T15:00:00",
        fechaVencimiento: "2028-11-10T15:00:00",
        estado: "ACTIVA",
      },
    ],
  },
}

// RESPONSE: Respuesta cuando no se encuentra el titular
export const buscarTitularNoEncontradoResponse = {
  success: false,
  message: "No se encontró ningún titular con ese documento",
  data: null,
}
