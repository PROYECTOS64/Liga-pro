// =============================================================================
// DESEMPATE - Algoritmo de clasificación según reglamento LigaPro
// =============================================================================
//
// Criterios de desempate en orden de prioridad:
// 1. Puntos (orden primario, ya aplicado antes de llegar aquí)
// 2. Saldo de goles (diferencia de goles)
// 3. Goles marcados (mayor cantidad de goles a favor)
// 4. Goles de visitante (solo en tabla acumulada / fases eliminatorias)
// 5. Rendimiento directo (enfrentamiento entre los equipos empatados)
// 6. Sorteo (se marca para resolución manual)
// =============================================================================

import type { TablaPosiciones } from '@/lib/types/database';

/**
 * Datos opcionales de enfrentamiento directo entre equipos empatados.
 * Se utiliza como criterio de desempate cuando los criterios numéricos no resuelven.
 */
export interface RendimientoDirecto {
  /** ID del club */
  club_id: string;
  /** Puntos obtenidos en enfrentamientos directos contra los otros equipos empatados */
  puntos_directos: number;
  /** Saldo de goles en enfrentamientos directos */
  saldo_goles_directos: number;
}

/**
 * Resultado del proceso de desempate con metadatos para trazabilidad.
 */
export interface ResultadoDesempate {
  /** Equipos ordenados según criterios de desempate */
  equipos: TablaPosiciones[];
  /** Criterio que resolvió el empate para cada grupo */
  criterio_aplicado: string;
  /** Indica si se requiere sorteo manual (empate total irresoluble) */
  requiere_sorteo: boolean;
}

/**
 * Fases donde los goles de visitante se consideran como criterio de desempate.
 */
const FASES_CON_GOLES_VISITANTE = [
  'FASE_FINAL',
  'CLASIFICACION',
];

/**
 * Ordena un array de equipos (con los mismos puntos) aplicando los criterios
 * de desempate del reglamento de LigaPro en cascada.
 *
 * @param equipos - Equipos a ordenar (deben tener los mismos puntos)
 * @param fase - Fase actual de la competición para determinar criterios aplicables
 * @param rendimientoDirecto - Datos opcionales de enfrentamiento directo
 * @returns Los equipos ordenados de mejor a peor según criterios de desempate
 */
export function ordenarPorDesempate(
  equipos: TablaPosiciones[],
  fase: string,
  rendimientoDirecto?: RendimientoDirecto[]
): ResultadoDesempate {
  // Si hay 0 o 1 equipos, no hay desempate que resolver
  if (equipos.length <= 1) {
    return {
      equipos,
      criterio_aplicado: 'sin_empate',
      requiere_sorteo: false,
    };
  }

  // Clonar el array para no mutar el original
  let ordenados = [...equipos];

  // --- Criterio 1: Saldo de goles (diferencia de goles) ---
  ordenados.sort((a, b) => b.saldo_goles - a.saldo_goles);
  if (estaResuelto(ordenados, (e) => e.saldo_goles)) {
    return {
      equipos: ordenados,
      criterio_aplicado: 'saldo_goles',
      requiere_sorteo: false,
    };
  }

  // --- Criterio 2: Goles marcados (goles a favor) ---
  ordenados.sort((a, b) => b.goles_favor - a.goles_favor);
  if (estaResuelto(ordenados, (e) => e.goles_favor)) {
    return {
      equipos: ordenados,
      criterio_aplicado: 'goles_marcados',
      requiere_sorteo: false,
    };
  }

  // --- Criterio 3: Goles de visitante (solo en ciertas fases) ---
  const usarGolesVisitante = FASES_CON_GOLES_VISITANTE.includes(fase);
  if (usarGolesVisitante) {
    ordenados.sort((a, b) => b.goles_visitante - a.goles_visitante);
    if (estaResuelto(ordenados, (e) => e.goles_visitante)) {
      return {
        equipos: ordenados,
        criterio_aplicado: 'goles_visitante',
        requiere_sorteo: false,
      };
    }
  }

  // --- Criterio 4: Rendimiento directo (enfrentamiento entre empatados) ---
  if (rendimientoDirecto && rendimientoDirecto.length > 0) {
    const mapaDirecto = new Map(
      rendimientoDirecto.map((r) => [r.club_id, r])
    );

    ordenados.sort((a, b) => {
      const rdA = mapaDirecto.get(a.club_id);
      const rdB = mapaDirecto.get(b.club_id);

      if (!rdA || !rdB) return 0;

      // Primero por puntos directos
      if (rdB.puntos_directos !== rdA.puntos_directos) {
        return rdB.puntos_directos - rdA.puntos_directos;
      }

      // Luego por saldo de goles directos
      return rdB.saldo_goles_directos - rdA.saldo_goles_directos;
    });

    // Verificar si el rendimiento directo resolvió el empate
    const todosConDirecto = ordenados.every((e) => mapaDirecto.has(e.club_id));
    if (todosConDirecto) {
      const valoresUnicos = new Set(
        ordenados.map((e) => {
          const rd = mapaDirecto.get(e.club_id)!;
          return `${rd.puntos_directos}-${rd.saldo_goles_directos}`;
        })
      );

      if (valoresUnicos.size === ordenados.length) {
        return {
          equipos: ordenados,
          criterio_aplicado: 'rendimiento_directo',
          requiere_sorteo: false,
        };
      }
    }
  }

  // --- Criterio 5: Sorteo (empate irresoluble por criterios deportivos) ---
  return {
    equipos: ordenados,
    criterio_aplicado: 'sorteo',
    requiere_sorteo: true,
  };
}

/**
 * Ordena la tabla de posiciones completa, agrupando equipos con los mismos puntos
 * y aplicando desempate dentro de cada grupo.
 *
 * @param tabla - Tabla de posiciones completa sin ordenar
 * @param fase - Fase actual de la competición
 * @param rendimientosDirectos - Mapa de rendimiento directo por grupo de empate
 * @returns Tabla ordenada con posiciones actualizadas
 */
export function ordenarTablaPosiciones(
  tabla: TablaPosiciones[],
  fase: string,
  rendimientosDirectos?: Map<number, RendimientoDirecto[]>
): TablaPosiciones[] {
  // Agrupar equipos por puntos
  const gruposPorPuntos = new Map<number, TablaPosiciones[]>();

  for (const equipo of tabla) {
    const grupo = gruposPorPuntos.get(equipo.puntos) ?? [];
    grupo.push(equipo);
    gruposPorPuntos.set(equipo.puntos, grupo);
  }

  // Ordenar los grupos de mayor a menor puntos
  const puntosOrdenados = Array.from(gruposPorPuntos.keys()).sort(
    (a, b) => b - a
  );

  // Aplicar desempate dentro de cada grupo y construir la tabla final
  const tablaFinal: TablaPosiciones[] = [];
  let posicionActual = 1;

  for (const puntos of puntosOrdenados) {
    const grupo = gruposPorPuntos.get(puntos)!;

    const rendimientoGrupo = rendimientosDirectos?.get(puntos);
    const resultado = ordenarPorDesempate(grupo, fase, rendimientoGrupo);

    for (const equipo of resultado.equipos) {
      tablaFinal.push({
        ...equipo,
        posicion: posicionActual,
      });
      posicionActual++;
    }
  }

  return tablaFinal;
}

// -----------------------------------------------------------------------------
// Funciones auxiliares internas
// -----------------------------------------------------------------------------

/**
 * Verifica si un criterio resolvió completamente el empate:
 * todos los valores del extractor deben ser distintos.
 */
function estaResuelto(
  equipos: TablaPosiciones[],
  extractor: (equipo: TablaPosiciones) => number
): boolean {
  const valores = equipos.map(extractor);
  const unicos = new Set(valores);
  return unicos.size === equipos.length;
}
