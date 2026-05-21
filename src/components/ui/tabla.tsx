'use client';

import { useState, type ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

// --- Definición de columna ---
export interface ColumnaTabla<T> {
  /** Clave del dato en el objeto */
  clave: keyof T & string;
  /** Título de la columna */
  titulo: string;
  /** Si la columna es ordenable */
  ordenable?: boolean;
  /** Ancho personalizado (p.ej. 'w-40') */
  ancho?: string;
  /** Alineación del contenido */
  alineacion?: 'left' | 'center' | 'right';
  /** Renderizado personalizado de la celda */
  renderizar?: (valor: T[keyof T], fila: T, indice: number) => ReactNode;
}

// --- Dirección de ordenamiento ---
type DireccionOrden = 'asc' | 'desc' | null;

// --- Tipos de propiedades de la tabla ---
export interface TablaProps<T> {
  /** Definiciones de columnas */
  columnas: ColumnaTabla<T>[];
  /** Datos a mostrar */
  datos: T[];
  /** Clave única para cada fila */
  claveUnica: keyof T & string;
  /** Mensaje cuando no hay datos */
  mensajeVacio?: string;
  /** Mostrar filas alternadas (zebra) */
  filasAlternadas?: boolean;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Callback al hacer clic en una fila */
  alClickFila?: (fila: T) => void;
  /** Mostrar efecto hover en filas */
  hoverFila?: boolean;
}

/**
 * Componente Tabla genérico, responsivo, con ordenamiento y filas estilizadas.
 */
export function Tabla<T extends Record<string, unknown>>({
  columnas,
  datos,
  claveUnica,
  mensajeVacio = 'No se encontraron registros',
  filasAlternadas = true,
  className = '',
  alClickFila,
  hoverFila = true,
}: TablaProps<T>) {
  // --- Estado de ordenamiento ---
  const [columnaOrden, setColumnaOrden] = useState<string | null>(null);
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>(null);

  // --- Manejar clic en encabezado ordenable ---
  const manejarOrden = (clave: string) => {
    if (columnaOrden === clave) {
      // Ciclo: asc → desc → sin orden
      if (direccionOrden === 'asc') {
        setDireccionOrden('desc');
      } else if (direccionOrden === 'desc') {
        setColumnaOrden(null);
        setDireccionOrden(null);
      }
    } else {
      setColumnaOrden(clave);
      setDireccionOrden('asc');
    }
  };

  // --- Ordenar datos ---
  const datosOrdenados = [...datos];
  if (columnaOrden && direccionOrden) {
    datosOrdenados.sort((a, b) => {
      const valA = a[columnaOrden];
      const valB = b[columnaOrden];

      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      let comparacion = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparacion = valA.localeCompare(valB, 'es');
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparacion = valA - valB;
      } else {
        comparacion = String(valA).localeCompare(String(valB), 'es');
      }

      return direccionOrden === 'desc' ? -comparacion : comparacion;
    });
  }

  // --- Icono de ordenamiento ---
  const iconoOrden = (clave: string) => {
    if (columnaOrden !== clave || !direccionOrden) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-[#6B7280]/50" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-[#2980B9]" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-[#2980B9]" />
    );
  };

  // --- Alineación de texto ---
  const claseAlineacion = (alineacion?: string) => {
    switch (alineacion) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div
      className={[
        'overflow-x-auto rounded-lg border border-gray-200',
        className,
      ].join(' ')}
    >
      <table className="w-full text-sm">
        {/* Encabezados */}
        <thead>
          <tr className="bg-[#F0F2F5] border-b border-gray-200">
            {columnas.map((col) => (
              <th
                key={col.clave}
                className={[
                  'px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[#6B7280]',
                  col.ancho ?? '',
                  claseAlineacion(col.alineacion),
                  col.ordenable
                    ? 'cursor-pointer select-none hover:text-[#1A1A2E] transition-colors'
                    : '',
                ].join(' ')}
                onClick={col.ordenable ? () => manejarOrden(col.clave) : undefined}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.titulo}
                  {col.ordenable && iconoOrden(col.clave)}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Cuerpo */}
        <tbody className="divide-y divide-gray-100">
          {datosOrdenados.length === 0 ? (
            <tr>
              <td
                colSpan={columnas.length}
                className="px-4 py-10 text-center text-[#6B7280]"
              >
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            datosOrdenados.map((fila, indice) => (
              <tr
                key={String(fila[claveUnica])}
                onClick={alClickFila ? () => alClickFila(fila) : undefined}
                className={[
                  'transition-colors duration-100',
                  filasAlternadas && indice % 2 === 1
                    ? 'bg-[#F0F2F5]/50'
                    : 'bg-white',
                  hoverFila ? 'hover:bg-blue-50/50' : '',
                  alClickFila ? 'cursor-pointer' : '',
                ].join(' ')}
              >
                {columnas.map((col) => (
                  <td
                    key={col.clave}
                    className={[
                      'px-4 py-3 text-[#1A1A2E]',
                      claseAlineacion(col.alineacion),
                    ].join(' ')}
                  >
                    {col.renderizar
                      ? col.renderizar(fila[col.clave], fila, indice)
                      : (String(fila[col.clave] ?? ''))}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Tabla;
