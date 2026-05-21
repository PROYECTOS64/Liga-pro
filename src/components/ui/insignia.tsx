import { type ReactNode } from 'react';

// --- Tipos de propiedades de la insignia ---
export interface InsigniaProps {
  /** Variante de estado de la insignia */
  variante: 'activo' | 'pendiente' | 'rechazado' | 'info' | 'suspendido';
  /** Texto o contenido de la insignia */
  children: ReactNode;
  /** Clases adicionales */
  className?: string;
  /** Tamaño de la insignia */
  tamano?: 'sm' | 'md';
  /** Mostrar punto indicador a la izquierda */
  conPunto?: boolean;
}

// --- Estilos por variante ---
const estilosVariante: Record<string, { contenedor: string; punto: string }> = {
  activo: {
    contenedor: 'bg-green-50 text-[#27AE60] border-green-200',
    punto: 'bg-[#27AE60]',
  },
  pendiente: {
    contenedor: 'bg-amber-50 text-amber-700 border-amber-200',
    punto: 'bg-amber-500',
  },
  rechazado: {
    contenedor: 'bg-red-50 text-[#C0392B] border-red-200',
    punto: 'bg-[#C0392B]',
  },
  info: {
    contenedor: 'bg-blue-50 text-[#2980B9] border-blue-200',
    punto: 'bg-[#2980B9]',
  },
  suspendido: {
    contenedor: 'bg-orange-50 text-orange-700 border-orange-200',
    punto: 'bg-orange-500',
  },
};

// --- Estilos por tamaño ---
const estilosTamano: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

/**
 * Componente Insignia para estados.
 * Muestra visualmente el estado de un elemento (activo, pendiente, etc.).
 */
export function Insignia({
  variante,
  children,
  className = '',
  tamano = 'md',
  conPunto = true,
}: InsigniaProps) {
  const estilos = estilosVariante[variante];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        estilos.contenedor,
        estilosTamano[tamano],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Punto indicador de color */}
      {conPunto && (
        <span
          className={['inline-block h-1.5 w-1.5 rounded-full', estilos.punto].join(
            ' ',
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Insignia;
