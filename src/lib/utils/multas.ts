// =============================================================================
// MULTAS - Cálculo de multas económicas según reglamento LigaPro
// =============================================================================
//
// Las multas se calculan según la serie (A o B) y consideran:
// - Acumulación de tarjetas amarillas
// - Tarjetas rojas directas
// - Reincidencia (incremento progresivo)
// =============================================================================

import type { Serie } from '@/lib/types/database';

// -----------------------------------------------------------------------------
// Constantes de multas por serie
// -----------------------------------------------------------------------------

/**
 * Montos base de multas por tarjetas en Serie A (en USD).
 */
const MULTAS_SERIE_A = {
  /** Multa por acumulación de 5 tarjetas amarillas */
  AMARILLA_ACUMULACION_5: 200,
  /** Multa por cada tarjeta amarilla adicional después de 5 */
  AMARILLA_ADICIONAL: 100,
  /** Multa por tarjeta roja directa */
  ROJA_DIRECTA: 500,
  /** Multa por doble amarilla (roja indirecta) */
  DOBLE_AMARILLA: 300,
} as const;

/**
 * Montos base de multas por tarjetas en Serie B (en USD).
 * Los montos son proporcionalmente menores a Serie A.
 */
const MULTAS_SERIE_B = {
  AMARILLA_ACUMULACION_5: 100,
  AMARILLA_ADICIONAL: 50,
  ROJA_DIRECTA: 250,
  DOBLE_AMARILLA: 150,
} as const;

/**
 * Porcentaje de incremento por cada reincidencia.
 * Cada reincidencia incrementa la multa base en este factor.
 */
const FACTOR_REINCIDENCIA = 0.5; // 50% adicional por reincidencia

/**
 * Tope máximo del multiplicador de reincidencia.
 * Previene que las multas crezcan indefinidamente.
 */
const TOPE_MULTIPLICADOR_REINCIDENCIA = 3.0; // Máximo 3x la multa base

// -----------------------------------------------------------------------------
// Funciones de cálculo de multas
// -----------------------------------------------------------------------------

/**
 * Calcula la multa económica por acumulación de tarjetas.
 *
 * Reglas:
 * - Al acumular 5 tarjetas amarillas: multa base por acumulación.
 * - Cada tarjeta amarilla adicional (6ª, 7ª, etc.): multa adicional.
 * - Cada tarjeta roja: multa por roja directa.
 *
 * @param amarillas - Cantidad total de tarjetas amarillas acumuladas
 * @param rojas - Cantidad total de tarjetas rojas
 * @param serie - Serie de la competición ('A' o 'B')
 * @returns Monto total de la multa en USD
 *
 * @example
 * // Jugador de Serie A con 5 amarillas y 0 rojas
 * calcularMultaTarjetas(5, 0, 'A') → 200
 *
 * @example
 * // Jugador de Serie A con 7 amarillas y 1 roja
 * calcularMultaTarjetas(7, 1, 'A') → 200 + 200 + 500 = 900
 */
export function calcularMultaTarjetas(
  amarillas: number,
  rojas: number,
  serie: Serie
): number {
  const montos = serie === 'A' ? MULTAS_SERIE_A : MULTAS_SERIE_B;
  let multaTotal = 0;

  // Multa por acumulación de amarillas
  if (amarillas >= 5) {
    // Multa base por llegar a 5 amarillas
    multaTotal += montos.AMARILLA_ACUMULACION_5;

    // Multa por cada amarilla adicional después de la 5ª
    const amarillasAdicionales = amarillas - 5;
    multaTotal += amarillasAdicionales * montos.AMARILLA_ADICIONAL;
  }

  // Multa por cada tarjeta roja
  multaTotal += rojas * montos.ROJA_DIRECTA;

  return multaTotal;
}

/**
 * Calcula la multa ajustada por reincidencia.
 *
 * El reglamento de LigaPro establece incrementos progresivos
 * cuando un club es reincidente en la misma falta. Cada reincidencia
 * aumenta la multa base en un 50%, con un tope de 3x.
 *
 * @param multaBase - Monto base de la multa en USD
 * @param contadorReincidencia - Número de veces que el club ha sido multado por el mismo concepto (0 = primera vez)
 * @param serie - Serie de la competición ('A' o 'B')
 * @returns Monto final de la multa en USD, ajustado por reincidencia
 *
 * @example
 * // Primera multa (sin reincidencia)
 * calcularMultaReincidencia(200, 0, 'A') → 200
 *
 * @example
 * // Segunda vez (1ª reincidencia): +50%
 * calcularMultaReincidencia(200, 1, 'A') → 300
 *
 * @example
 * // Tercera vez (2ª reincidencia): +100%
 * calcularMultaReincidencia(200, 2, 'A') → 400
 *
 * @example
 * // Muchas reincidencias: tope en 3x
 * calcularMultaReincidencia(200, 10, 'A') → 600
 */
export function calcularMultaReincidencia(
  multaBase: number,
  contadorReincidencia: number,
  _serie: Serie
): number {
  if (contadorReincidencia <= 0) {
    return multaBase;
  }

  // Calcular el multiplicador con incremento progresivo
  const multiplicador = Math.min(
    1 + contadorReincidencia * FACTOR_REINCIDENCIA,
    TOPE_MULTIPLICADOR_REINCIDENCIA
  );

  // Redondear a 2 decimales para evitar errores de punto flotante
  return Math.round(multaBase * multiplicador * 100) / 100;
}

/**
 * Calcula el monto total de la multa incluyendo tarjetas y reincidencia.
 * Función de conveniencia que combina ambos cálculos.
 *
 * @param amarillas - Cantidad total de tarjetas amarillas acumuladas
 * @param rojas - Cantidad total de tarjetas rojas
 * @param serie - Serie de la competición
 * @param contadorReincidencia - Número de reincidencias previas
 * @returns Monto final de la multa en USD
 */
export function calcularMultaTotal(
  amarillas: number,
  rojas: number,
  serie: Serie,
  contadorReincidencia: number = 0
): number {
  const multaBase = calcularMultaTarjetas(amarillas, rojas, serie);

  if (contadorReincidencia > 0) {
    return calcularMultaReincidencia(multaBase, contadorReincidencia, serie);
  }

  return multaBase;
}

/**
 * Determina si un jugador debe ser suspendido por acumulación de amarillas.
 * Según el reglamento, un jugador es suspendido al acumular 5 amarillas,
 * y cada 3 amarillas adicionales después de eso.
 *
 * @param amarillasAcumuladas - Total de amarillas acumuladas en la fase
 * @returns true si el jugador debe ser suspendido
 */
export function debeSuspenderPorAmarillas(
  amarillasAcumuladas: number
): boolean {
  if (amarillasAcumuladas < 5) return false;
  if (amarillasAcumuladas === 5) return true;

  // Después de 5, suspensión cada 3 amarillas adicionales (8, 11, 14...)
  return (amarillasAcumuladas - 5) % 3 === 0;
}

/**
 * Obtiene una descripción legible del concepto de multa.
 *
 * @param amarillas - Cantidad de amarillas que generaron la multa
 * @param rojas - Cantidad de rojas que generaron la multa
 * @returns Descripción del concepto
 */
export function obtenerConceptoMulta(
  amarillas: number,
  rojas: number
): string {
  const partes: string[] = [];

  if (amarillas >= 5) {
    partes.push(`Acumulación de ${amarillas} tarjetas amarillas`);
  }

  if (rojas > 0) {
    partes.push(
      `${rojas} tarjeta${rojas > 1 ? 's' : ''} roja${rojas > 1 ? 's' : ''}`
    );
  }

  return partes.join(' + ') || 'Sin concepto';
}
