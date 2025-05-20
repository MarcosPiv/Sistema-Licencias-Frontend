// Definición de las clases de licencias
export const clasesLicencia = [
  {
    id: "A",
    nombre: "Clase A",
    edadMinima: 17,
    esProfesional: false,
  },
  {
    id: "B",
    nombre: "Clase B",
    edadMinima: 17,
    esProfesional: false,
  },
  {
    id: "C",
    nombre: "Clase C",
    edadMinima: 21,
    esProfesional: true,
  },
  {
    id: "D",
    nombre: "Clase D",
    edadMinima: 21,
    esProfesional: true,
  },
  {
    id: "E",
    nombre: "Clase E",
    edadMinima: 21,
    esProfesional: true,
  },
  {
    id: "F",
    nombre: "Clase F",
    edadMinima: 17,
    esProfesional: false,
  },
  {
    id: "G",
    nombre: "Clase G",
    edadMinima: 17,
    esProfesional: false,
  },
]

// Tabla de costos por clase y vigencia
const costosPorClaseYVigencia = {
  A: { 5: 40, 4: 30, 3: 25, 1: 20 },
  B: { 5: 40, 4: 30, 3: 25, 1: 20 },
  C: { 5: 47, 4: 35, 3: 30, 1: 23 },
  D: { 5: 47, 4: 35, 3: 30, 1: 23 }, // Asumimos que D tiene los mismos costos que C
  E: { 5: 59, 4: 44, 3: 39, 1: 29 },
  F: { 5: 40, 4: 30, 3: 25, 1: 20 }, // Asumimos que F tiene los mismos costos que A/B/G
  G: { 5: 40, 4: 30, 3: 25, 1: 20 },
}

// Costo administrativo fijo
const COSTO_ADMINISTRATIVO = 8

// Función para calcular la vigencia según la edad y si es primera vez
export function calcularVigencia(edad: number, esPrimeraVez: boolean): number {
  if (edad < 21) {
    return esPrimeraVez ? 1 : 3
  } else if (edad <= 46) {
    return 5
  } else if (edad <= 60) {
    return 4
  } else if (edad <= 70) {
    return 3
  } else {
    return 1
  }
}

// Función para calcular el costo según la clase y la vigencia
export function calcularCosto(clase: string, vigencia: number, esRenovacion = false): number {
  // Obtener el costo base según la clase y vigencia
  const costosClase = costosPorClaseYVigencia[clase] || costosPorClaseYVigencia["A"]
  const costoBase = costosClase[vigencia] || costosClase[1] // Si no existe la vigencia, usar el costo de 1 año

  // Agregar el costo administrativo
  const costoTotal = costoBase + COSTO_ADMINISTRATIVO

  // Si es renovación, aplicar descuento del 10%
  if (esRenovacion) {
    return Math.round(costoTotal * 0.9)
  }

  return costoTotal
}

// Función para calcular la fecha de vencimiento
export function calcularFechaVencimiento(fechaNacimiento: string, vigencia: number): string {
  const fechaNac = new Date(fechaNacimiento)
  const hoy = new Date()

  // Crear fecha de vencimiento con el mismo día y mes que la fecha de nacimiento
  const fechaVencimiento = new Date(hoy)
  fechaVencimiento.setFullYear(hoy.getFullYear() + vigencia)
  fechaVencimiento.setMonth(fechaNac.getMonth())
  fechaVencimiento.setDate(fechaNac.getDate())

  return fechaVencimiento.toISOString()
}

// Función para verificar si puede obtener licencia profesional
export function puedeObtenerLicenciaProfesional(
  edad: number,
  licenciasAnteriores: any[],
): { puede: boolean; motivo: string } {
  // Verificar si es mayor de 65 años y es primera licencia profesional
  if (edad > 65) {
    const tieneLicenciaProfesional = licenciasAnteriores.some((lic) => ["C", "D", "E"].includes(lic.claseLicencia))

    if (!tieneLicenciaProfesional) {
      return {
        puede: false,
        motivo: "No se puede otorgar licencia profesional por primera vez a personas mayores de 65 años",
      }
    }
  }

  // Verificar si tiene licencia clase B por al menos un año
  const licenciaB = licenciasAnteriores.find((lic) => lic.claseLicencia === "B")

  if (!licenciaB) {
    return {
      puede: false,
      motivo: "Debe tener licencia clase B para obtener una licencia profesional",
    }
  }

  const fechaEmisionB = new Date(licenciaB.fechaEmision)
  const unAñoDespues = new Date(fechaEmisionB)
  unAñoDespues.setFullYear(fechaEmisionB.getFullYear() + 1)

  if (new Date() < unAñoDespues) {
    return {
      puede: false,
      motivo: "Debe tener licencia clase B por al menos un año para obtener una licencia profesional",
    }
  }

  return { puede: true, motivo: "" }
}
