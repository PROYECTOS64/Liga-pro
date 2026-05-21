'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Elemento del menú lateral ---
export interface ElementoBarraLateral {
  /** Identificador único */
  id: string;
  /** Texto del enlace */
  etiqueta: string;
  /** Ruta de navegación */
  ruta: string;
  /** Icono del enlace */
  icono: ReactNode;
  /** Sub-elementos (menú anidado) */
  subElementos?: Omit<ElementoBarraLateral, 'subElementos' | 'icono'>[];
  /** Insignia/contador opcional */
  insignia?: string | number;
}

// --- Propiedades de la barra lateral ---
export interface BarraLateralProps {
  /** Elementos del menú */
  elementos: ElementoBarraLateral[];
  /** Título de la sección (p.ej. nombre del módulo) */
  titulo?: string;
  /** Clases adicionales */
  className?: string;
  /** Estado colapsado inicial */
  colapsadoInicial?: boolean;
}

/**
 * Componente Barra Lateral colapsable para navegación secundaria.
 * Diseño minimalista con iconos y texto, colapsable a solo iconos.
 */
export function BarraLateral({
  elementos,
  titulo,
  className = '',
  colapsadoInicial = false,
}: BarraLateralProps) {
  const rutaActual = usePathname();
  const [colapsado, setColapsado] = useState(colapsadoInicial);

  // --- Verificar si un enlace está activo ---
  const estaActivo = (ruta: string) => rutaActual === ruta;
  const estaActivoParcial = (ruta: string) =>
    rutaActual.startsWith(ruta) && ruta !== '/';

  return (
    <aside
      className={[
        'flex flex-col bg-white border-r border-gray-200',
        'transition-[width] duration-200 ease-in-out',
        'h-full shrink-0',
        colapsado ? 'w-16' : 'w-64',
        className,
      ].join(' ')}
    >
      {/* Encabezado de la barra lateral */}
      <div
        className={[
          'flex items-center h-14 border-b border-gray-100 px-3',
          colapsado ? 'justify-center' : 'justify-between',
        ].join(' ')}
      >
        {!colapsado && titulo && (
          <h2 className="text-sm font-semibold text-[#1A1A2E] truncate">
            {titulo}
          </h2>
        )}

        {/* Botón colapsar/expandir */}
        <button
          type="button"
          onClick={() => setColapsado(!colapsado)}
          className={[
            'min-h-[44px] min-w-[44px] inline-flex items-center justify-center',
            'rounded-lg text-[#6B7280] hover:text-[#1A1A2E] hover:bg-gray-100',
            'transition-colors duration-150 cursor-pointer shrink-0',
          ].join(' ')}
          aria-label={colapsado ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {colapsado ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Lista de navegación */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="flex flex-col gap-0.5">
          {elementos.map((elemento) => {
            const activo =
              estaActivo(elemento.ruta) || estaActivoParcial(elemento.ruta);

            return (
              <li key={elemento.id}>
                {/* Enlace principal */}
                <Link
                  href={elemento.ruta}
                  title={colapsado ? elemento.etiqueta : undefined}
                  className={[
                    'flex items-center gap-3 rounded-lg',
                    'min-h-[44px] transition-colors duration-150',
                    colapsado ? 'justify-center px-2' : 'px-3',
                    activo
                      ? 'bg-[#2980B9]/10 text-[#2980B9] font-medium'
                      : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-gray-50',
                  ].join(' ')}
                >
                  {/* Icono */}
                  <span className="shrink-0">{elemento.icono}</span>

                  {/* Etiqueta y badge (ocultos cuando colapsado) */}
                  {!colapsado && (
                    <>
                      <span className="text-sm truncate flex-1">
                        {elemento.etiqueta}
                      </span>
                      {elemento.insignia != null && (
                        <span className="shrink-0 text-xs font-medium bg-[#C0392B] text-white px-1.5 py-0.5 rounded-full">
                          {elemento.insignia}
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Sub-elementos */}
                {!colapsado &&
                  elemento.subElementos &&
                  elemento.subElementos.length > 0 &&
                  activo && (
                    <ul className="ml-9 mt-0.5 flex flex-col gap-0.5">
                      {elemento.subElementos.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={sub.ruta}
                            className={[
                              'flex items-center px-3 py-2 text-sm rounded-lg',
                              'min-h-[36px] transition-colors duration-150',
                              estaActivo(sub.ruta)
                                ? 'text-[#2980B9] font-medium bg-[#2980B9]/5'
                                : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-gray-50',
                            ].join(' ')}
                          >
                            {sub.etiqueta}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default BarraLateral;
