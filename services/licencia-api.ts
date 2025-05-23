// Interfaces para los tipos de datos de la API
export interface TitularAPI {
  id: number
  nombre: string
  apellido: string
  fechaNacimiento: string
  tipoDocumento: string
  numeroDocumento: string
  grupoSanguineo: string
  factorRh: string
  direccion: string
  donanteOrganos: boolean
}

export interface LicenciaAPI {
  id: number
  titularId: number
  clase: string
  vigenciaAnios: number
  fechaEmision: string
  fechaVencimiento: string
  costo: number
  emisor: string
  vigente: boolean
}

export interface LicenciasTitularResponse {
  titular: TitularAPI
  licencias: LicenciaAPI[]
}

// Función para buscar licencias por titular
export async function buscarLicenciasPorTitular(
  tipoDocumento: string,
  numeroDocumento: string,
): Promise<LicenciasTitularResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/licencias/titular?tipoDocumento=${tipoDocumento}&numeroDocumento=${numeroDocumento}`,
    )

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al buscar licencias por titular:", error)
    throw error
  }
}

// Función para mapear los datos de la API al formato que espera el componente
export function mapearLicenciasParaComponente(data: LicenciasTitularResponse) {
  return data.licencias.map((licencia) => ({
    id: licencia.id,
    numeroLicencia: licencia.id.toString(),
    titular: {
      id: data.titular.id,
      tipoDocumento: data.titular.tipoDocumento,
      numeroDocumento: data.titular.numeroDocumento,
      nombreApellido: `${data.titular.apellido}, ${data.titular.nombre}`,
      fechaNacimiento: data.titular.fechaNacimiento,
      direccion: data.titular.direccion,
      grupoSanguineo: data.titular.grupoSanguineo,
      factorRh: data.titular.factorRh,
      donanteOrganos: data.titular.donanteOrganos ? "SÍ" : "NO",
    },
    claseLicencia: licencia.clase,
    fechaEmision: licencia.fechaEmision,
    fechaVencimiento: licencia.fechaVencimiento,
    vigencia: licencia.vigenciaAnios,
    costo: licencia.costo,
    estado: licencia.vigente ? "VIGENTE" : "VENCIDA",
  }))
}
