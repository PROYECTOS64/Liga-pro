'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

// --- Propiedades del enlace de navegación ---
export interface EnlaceNavProps {
  /** Ruta de destino */
  ruta: string;
  /** Texto del enlace */
  children: ReactNode;
  /** Icono a la izquierda */
  icono?: ReactNode;
  /** Coincidencia exacta de ruta (true) o parcial (false) */
  coincidenciaExacta?: boolean;
  /** Clases adicionales */
  className?: string;
  /** Variante visual */
  variante?: 'sidebar' | 'header' | 'minimal';
  /** Callback al hacer clic */
  alClick?: () => void;
}

// --- Estilos por variante ---
const estilosPorVariante = {
  sidebar: {
    base: 'flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm transition-colors duration-150',
    activo: 'bg-[#2980B9]/10 text-[#2980B9] font-medium',
    inactivo: 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-gray-50',
  },
  header: {
    base: 'px-3 py-2 text-sm font-medium rounded-lg min-h-[44px] inline-flex items-center transition-colors duration-150',
    activo: 'text-white bg-white/15',
    inactivo: 'text-white/70 hover:text-white hover:bg-white/10',
  },
  minimal: {
    base: 'inline-flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors duration-150',
    activo: 'text-[#2980B9] font-medium',
    inactivo: 'text-[#6B7280] hover:text-[#1A1A2E]',
  },
};

/**
 * Componente Enlace de Navegación con detección de ruta activa.
 * Resalta automáticamente el enlace cuando coincide con la ruta actual.
 */
export function EnlaceNav({
  ruta,
  children,
  icono,
  coincidenciaExacta = false,
  className = '',
  variante = 'sidebar',
  alClick,
}: EnlaceNavProps) {
  const rutaActual = usePathname();

  // --- Determinar si el enlace está activo ---
  const estaActivo = coincidenciaExacta
    ? rutaActual === ruta
    : ruta === '/'
      ? rutaActual === '/'
      : rutaActual.startsWith(ruta);

  const estilos = estilosPorVariante[variante];

  return (
    <Link
      href={ruta}
      onClick={alClick}
      className={[
        estilos.base,
        estaActivo ? estilos.activo : estilos.inactivo,
        className,
      ].join(' ')}
      aria-current={estaActivo ? 'page' : undefined}
    >
      {/* Icono */}
      {icono && <span className="shrink-0">{icono}</span>}

      {/* Texto del enlace */}
      <span>{children}</span>
    </Link>
  );
}

export default EnlaceNav;
