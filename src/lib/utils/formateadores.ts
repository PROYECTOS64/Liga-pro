// =============================================================================
// FORMATEADORES - Funciones utilitarias de formato y presentación
// =============================================================================

/**
 * Formatea un monto numérico como moneda USD.
 * @example formatearMoneda(1500.5) → "$1,500.50"
 */
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
}

/**
 * Formatea una fecha ISO en formato legible en español.
 * @example formatearFecha("2026-05-20") → "20 de mayo de 2026"
 */
export function formatearFecha(fecha: string): string {
  const dateObj = new Date(fecha);
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Guayaquil',
  }).format(dateObj);
}

/**
 * Formatea una fecha y hora ISO en formato legible en español.
 * @example formatearFechaHora("2026-05-20T19:30:00Z") → "20 de mayo de 2026, 14:30"
 */
export function formatearFechaHora(fecha: string): string {
  const dateObj = new Date(fecha);
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Guayaquil',
  }).format(dateObj);
}

/**
 * Calcula la edad en años a partir de una fecha de nacimiento.
 * @example calcularEdad("2000-03-15") → 26 (si la fecha actual es 2026-05-20)
 */
export function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesDiff = hoy.getMonth() - nacimiento.getMonth();

  // Si aún no ha cumplido años en el año actual, restar uno
  if (
    mesDiff < 0 ||
    (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
}

/**
 * Calcula el saldo (diferencia) de goles.
 * @example calcularSaldoGoles(25, 18) → 7
 */
export function calcularSaldoGoles(favor: number, contra: number): number {
  return favor - contra;
}

/**
 * Retorna la clase de color de Tailwind correspondiente a un estado del sistema.
 * Útil para badges, indicadores y textos de estado en la interfaz.
 *
 * @example obtenerColorEstado("ACTIVO")     → "text-green-600 bg-green-50 border-green-200"
 * @example obtenerColorEstado("SUSPENDIDO") → "text-red-600 bg-red-50 border-red-200"
 */
export function obtenerColorEstado(estado: string): string {
  const mapaColores: Record<string, string> = {
    // Estados de jugador
    ACTIVO: 'text-green-600 bg-green-50 border-green-200',
    SUSPENDIDO: 'text-red-600 bg-red-50 border-red-200',
    LESIONADO: 'text-amber-600 bg-amber-50 border-amber-200',

    // Estados de partido
    PROGRAMADO: 'text-blue-600 bg-blue-50 border-blue-200',
    EN_CURSO: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    FINALIZADO: 'text-gray-600 bg-gray-50 border-gray-200',
    NO_PRESENTACION: 'text-red-600 bg-red-50 border-red-200',

    // Estados de planilla
    BORRADOR: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    ENVIADA: 'text-blue-600 bg-blue-50 border-blue-200',
    BLOQUEADA: 'text-gray-600 bg-gray-50 border-gray-200',

    // Estados de control económico
    APROBADO: 'text-green-600 bg-green-50 border-green-200',
    PENDIENTE: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    OBSERVADO: 'text-orange-600 bg-orange-50 border-orange-200',
    RECHAZADO: 'text-red-600 bg-red-50 border-red-200',

    // Estados de competición
    PLANIFICADA: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    CANCELADA: 'text-red-600 bg-red-50 border-red-200',

    // Estados de certificación VAR
    APROBADA: 'text-green-600 bg-green-50 border-green-200',
    EN_REVISION: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    RECHAZADA: 'text-red-600 bg-red-50 border-red-200',

    // Estados de pago de multa
    PAGADA: 'text-green-600 bg-green-50 border-green-200',
    ANULADA: 'text-gray-600 bg-gray-50 border-gray-200',
  };

  return mapaColores[estado] ?? 'text-gray-600 bg-gray-50 border-gray-200';
}

/**
 * Formatea un número de jornada para mostrar.
 * @example formatearJornada(1) → "Jornada 1"
 */
export function formatearJornada(jornada: number): string {
  return `Jornada ${jornada}`;
}

/**
 * Formatea un resultado de partido.
 * @example formatearResultado(2, 1) → "2 - 1"
 */
export function formatearResultado(
  golesLocal: number | null,
  golesVisitante: number | null
): string {
  if (golesLocal === null || golesVisitante === null) {
    return 'vs';
  }
  return `${golesLocal} - ${golesVisitante}`;
}

/**
 * Formatea un minuto de partido con el símbolo estándar.
 * @example formatearMinuto(45) → "45'"
 * @example formatearMinuto(90, 3) → "90+3'"
 */
export function formatearMinuto(minuto: number, adicional?: number): string {
  if (adicional && adicional > 0) {
    return `${minuto}+${adicional}'`;
  }
  return `${minuto}'`;
}
