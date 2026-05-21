import { type ReactNode } from 'react';

// --- Tipos de propiedades de la tarjeta ---
export interface TarjetaProps {
  /** Título de la tarjeta (aparece en el encabezado) */
  titulo?: string;
  /** Color de la barra superior del encabezado */
  colorEncabezado?: 'gold' | 'blue' | 'red' | 'green' | 'navy';
  /** Acción opcional en el encabezado (p.ej. un botón) */
  accion?: ReactNode;
  /** Contenido de la tarjeta */
  children: ReactNode;
  /** Clases adicionales para personalización */
  className?: string;
  /** Desactivar el padding interno */
  sinPadding?: boolean;
}

// --- Mapa de colores para la barra superior ---
const coloresEncabezado: Record<string, string> = {
  gold: 'bg-[#D4A843]',
  blue: 'bg-[#2980B9]',
  red: 'bg-[#C0392B]',
  green: 'bg-[#27AE60]',
  navy: 'bg-[#1B2A4A]',
};

// --- Color de texto del encabezado ---
const coloresTextoEncabezado: Record<string, string> = {
  gold: 'text-white',
  blue: 'text-white',
  red: 'text-white',
  green: 'text-white',
  navy: 'text-white',
};

/**
 * Componente Tarjeta con encabezado coloreado.
 * Diseño empresarial limpio para LIGAPRO.
 */
export function Tarjeta({
  titulo,
  colorEncabezado,
  accion,
  children,
  className = '',
  sinPadding = false,
}: TarjetaProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Encabezado con barra coloreada */}
      {(titulo || colorEncabezado) && (
        <div
          className={[
            'px-5 py-3.5 flex items-center justify-between',
            colorEncabezado
              ? coloresEncabezado[colorEncabezado]
              : 'bg-white border-b border-gray-100',
            colorEncabezado
              ? coloresTextoEncabezado[colorEncabezado]
              : 'text-[#1A1A2E]',
          ].join(' ')}
        >
          {titulo && (
            <h3 className="font-semibold text-sm tracking-wide uppercase">
              {titulo}
            </h3>
          )}
          {accion && <div className="ml-auto">{accion}</div>}
        </div>
      )}

      {/* Cuerpo de la tarjeta */}
      <div className={sinPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

export default Tarjeta;
