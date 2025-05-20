/**
 * Ejemplos de JSON para las llamadas al backend relacionadas con el dashboard
 */

// REQUEST: Obtener estadísticas para el dashboard
export const obtenerEstadisticasRequest = {
  fechaInicio: "2023-01-01",
  fechaFin: "2023-11-15",
  operadorId: 456, // Opcional, para filtrar por operador
}

// RESPONSE: Respuesta con estadísticas para el dashboard
export const obtenerEstadisticasResponse = {
  success: true,
  data: {
    licencias: {
      totalEmitidas: 1250,
      emisionesPorMes: [
        { mes: "Enero", cantidad: 95 },
        { mes: "Febrero", cantidad: 110 },
        { mes: "Marzo", cantidad: 105 },
        { mes: "Abril", cantidad: 98 },
        { mes: "Mayo", cantidad: 115 },
        { mes: "Junio", cantidad: 120 },
        { mes: "Julio", cantidad: 125 },
        { mes: "Agosto", cantidad: 118 },
        { mes: "Septiembre", cantidad: 112 },
        { mes: "Octubre", cantidad: 130 },
        { mes: "Noviembre", cantidad: 122 },
      ],
      porClase: [
        { clase: "A", cantidad: 450 },
        { clase: "B", cantidad: 800 },
      ],
      vencidas: 85,
      porVencer: 120, // Licencias que vencen en los próximos 30 días
    },
    titulares: {
      total: 1150,
      nuevosUltimoMes: 75,
      porGrupoSanguineo: [
        { grupo: "0+", cantidad: 380 },
        { grupo: "0-", cantidad: 120 },
        { grupo: "A+", cantidad: 290 },
        { grupo: "A-", cantidad: 85 },
        { grupo: "B+", cantidad: 150 },
        { grupo: "B-", cantidad: 45 },
        { grupo: "AB+", cantidad: 60 },
        { grupo: "AB-", cantidad: 20 },
      ],
      donantes: 620,
    },
    recaudacion: {
      totalAnual: 12500000,
      porMes: [
        { mes: "Enero", monto: 950000 },
        { mes: "Febrero", monto: 1100000 },
        { mes: "Marzo", monto: 1050000 },
        { mes: "Abril", monto: 980000 },
        { mes: "Mayo", monto: 1150000 },
        { mes: "Junio", monto: 1200000 },
        { mes: "Julio", monto: 1250000 },
        { mes: "Agosto", monto: 1180000 },
        { mes: "Septiembre", monto: 1120000 },
        { mes: "Octubre", monto: 1300000 },
        { mes: "Noviembre", monto: 1220000 },
      ],
      porTipoOperacion: [
        { tipo: "Emisión", monto: 8750000 },
        { tipo: "Renovación", monto: 3250000 },
        { tipo: "Copia", monto: 500000 },
      ],
    },
    operaciones: {
      ultimasSemanas: [
        { semana: "6-12 Nov", emisiones: 28, renovaciones: 15, copias: 8 },
        { semana: "30 Oct-5 Nov", emisiones: 32, renovaciones: 18, copias: 5 },
        { semana: "23-29 Oct", emisiones: 30, renovaciones: 12, copias: 7 },
        { semana: "16-22 Oct", emisiones: 35, renovaciones: 20, copias: 6 },
      ],
    },
  },
}
