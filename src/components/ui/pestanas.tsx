'use client';

import { useState, type ReactNode } from 'react';

// --- Definición de una pestaña individual ---
export interface Pestana {
  /** Identificador único de la pestaña */
  id: string;
  /** Etiqueta visible de la pestaña */
  etiqueta: string;
  /** Icono opcional a la izquierda */
  icono?: ReactNode;
  /** Si la pestaña está deshabilitada */
  deshabilitada?: boolean;
}

// --- Tipos de propiedades del componente de pestañas ---
export interface PestanasProps {
  /** Lista de pestañas disponibles */
  pestanas: Pestana[];
  /** Pestaña activa actual (controlado externamente) */
  activa?: string;
  /** Callback cuando cambia la pestaña activa */
  alCambiar?: (id: string) => void;
  /** Contenido a renderizar según la pestaña activa */
  children?: ReactNode;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Variante visual */
  variante?: 'default' | 'pills';
}

/**
 * Componente de Pestañas con barra indicadora activa.
 * Soporta navegación por teclado y variantes visuales.
 */
export function Pestanas({
  pestanas,
  activa: activaExterna,
  alCambiar,
  children,
  className = '',
  variante = 'default',
}: PestanasProps) {
  // Estado interno para uso no controlado
  const [activaInterna, setActivaInterna] = useState(pestanas[0]?.id ?? '');
  const activa = activaExterna ?? activaInterna;

  const manejarCambio = (id: string) => {
    if (!activaExterna) {
      setActivaInterna(id);
    }
    alCambiar?.(id);
  };

  // --- Navegación con teclado ---
  const manejarTeclado = (evento: React.KeyboardEvent, indice: number) => {
    const pestanasHabilitadas = pestanas.filter((p) => !p.deshabilitada);
    const indiceActual = pestanasHabilitadas.findIndex(
      (p) => p.id === pestanas[indice].id,
    );

    let nuevoIndice = indiceActual;

    if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') {
      evento.preventDefault();
      nuevoIndice = (indiceActual + 1) % pestanasHabilitadas.length;
    } else if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      nuevoIndice =
        (indiceActual - 1 + pestanasHabilitadas.length) %
        pestanasHabilitadas.length;
    }

    if (nuevoIndice !== indiceActual) {
      const nuevaPestana = pestanasHabilitadas[nuevoIndice];
      manejarCambio(nuevaPestana.id);
    }
  };

  // --- Estilos según variante ---
  const estiloDefault = (esActiva: boolean, esDeshabilitada: boolean) =>
    [
      'relative min-h-[44px] px-4 py-2 text-sm font-medium',
      'transition-colors duration-150 cursor-pointer',
      'inline-flex items-center gap-2',
      esDeshabilitada
        ? 'text-[#6B7280]/40 cursor-not-allowed'
        : esActiva
          ? 'text-[#2980B9]'
          : 'text-[#6B7280] hover:text-[#1A1A2E]',
    ].join(' ');

  const estiloPills = (esActiva: boolean, esDeshabilitada: boolean) =>
    [
      'min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg',
      'transition-colors duration-150 cursor-pointer',
      'inline-flex items-center gap-2',
      esDeshabilitada
        ? 'text-[#6B7280]/40 cursor-not-allowed'
        : esActiva
          ? 'bg-[#1B2A4A] text-white'
          : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E]',
    ].join(' ');

  return (
    <div className={className}>
      {/* Barra de pestañas */}
      <div
        className={[
          'flex',
          variante === 'default' ? 'border-b border-gray-200' : 'gap-1 p-1 bg-gray-100 rounded-lg',
        ].join(' ')}
        role="tablist"
        aria-orientation="horizontal"
      >
        {pestanas.map((pestana, indice) => {
          const esActiva = activa === pestana.id;
          const obtenerEstilo =
            variante === 'pills' ? estiloPills : estiloDefault;

          return (
            <button
              key={pestana.id}
              type="button"
              role="tab"
              aria-selected={esActiva}
              aria-disabled={pestana.deshabilitada}
              tabIndex={esActiva ? 0 : -1}
              onClick={
                pestana.deshabilitada
                  ? undefined
                  : () => manejarCambio(pestana.id)
              }
              onKeyDown={(e) => manejarTeclado(e, indice)}
              className={obtenerEstilo(esActiva, !!pestana.deshabilitada)}
            >
              {pestana.icono && <span className="shrink-0">{pestana.icono}</span>}
              {pestana.etiqueta}

              {/* Barra indicadora activa (variante default) */}
              {variante === 'default' && esActiva && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2980B9] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido de la pestaña activa */}
      {children && (
        <div role="tabpanel" className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default Pestanas;
