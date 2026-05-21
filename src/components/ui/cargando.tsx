// --- Componentes de carga: Spinner y Skeleton ---

export interface CargandoSpinnerProps {
  /** Tamaño del spinner */
  tamano?: 'sm' | 'md' | 'lg';
  /** Color del spinner */
  color?: 'primary' | 'white' | 'gold';
  /** Clases adicionales */
  className?: string;
  /** Texto accesible */
  textoAccesible?: string;
}

// --- Tamaños del spinner ---
const tamanosSpinner: Record<string, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

// --- Colores del spinner ---
const coloresSpinner: Record<string, string> = {
  primary: 'border-[#1B2A4A]/20 border-t-[#1B2A4A]',
  white: 'border-white/30 border-t-white',
  gold: 'border-[#D4A843]/20 border-t-[#D4A843]',
};

/**
 * Componente Spinner de carga circular animado.
 */
export function CargandoSpinner({
  tamano = 'md',
  color = 'primary',
  className = '',
  textoAccesible = 'Cargando...',
}: CargandoSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={textoAccesible}
      className={['inline-flex items-center justify-center', className].join(
        ' ',
      )}
    >
      <div
        className={[
          'rounded-full animate-spin',
          tamanosSpinner[tamano],
          coloresSpinner[color],
        ].join(' ')}
      />
      <span className="sr-only">{textoAccesible}</span>
    </div>
  );
}

// --- Tipos del Skeleton ---
export interface SkeletonProps {
  /** Ancho del skeleton (p.ej. 'w-full', 'w-40') */
  ancho?: string;
  /** Alto del skeleton (p.ej. 'h-4', 'h-10') */
  alto?: string;
  /** Forma del skeleton */
  forma?: 'rectangulo' | 'circulo' | 'texto';
  /** Cantidad de líneas (para forma "texto") */
  lineas?: number;
  /** Clases adicionales */
  className?: string;
}

/**
 * Componente Skeleton para estados de carga.
 * Muestra un placeholder animado mientras el contenido real se carga.
 */
export function Skeleton({
  ancho = 'w-full',
  alto = 'h-4',
  forma = 'rectangulo',
  lineas = 3,
  className = '',
}: SkeletonProps) {
  // Esqueleto de múltiples líneas de texto
  if (forma === 'texto') {
    return (
      <div
        className={['flex flex-col gap-2', className].join(' ')}
        role="status"
        aria-label="Cargando contenido"
      >
        {Array.from({ length: lineas }).map((_, i) => (
          <div
            key={i}
            className={[
              'bg-gray-200 rounded animate-pulse',
              alto,
              // Última línea más corta para efecto realista
              i === lineas - 1 ? 'w-3/4' : ancho,
            ].join(' ')}
          />
        ))}
        <span className="sr-only">Cargando contenido</span>
      </div>
    );
  }

  // Esqueleto circular (avatares, iconos)
  if (forma === 'circulo') {
    return (
      <div
        className={[
          'bg-gray-200 rounded-full animate-pulse',
          ancho,
          alto,
          className,
        ].join(' ')}
        role="status"
        aria-label="Cargando contenido"
      >
        <span className="sr-only">Cargando contenido</span>
      </div>
    );
  }

  // Esqueleto rectangular (por defecto)
  return (
    <div
      className={[
        'bg-gray-200 rounded-lg animate-pulse',
        ancho,
        alto,
        className,
      ].join(' ')}
      role="status"
      aria-label="Cargando contenido"
    >
      <span className="sr-only">Cargando contenido</span>
    </div>
  );
}

/**
 * Componente de carga a pantalla completa con spinner centrado.
 */
export function CargandoPantalla({
  mensaje = 'Cargando...',
}: {
  mensaje?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <CargandoSpinner tamano="lg" />
      <p className="text-sm text-[#6B7280] font-medium">{mensaje}</p>
    </div>
  );
}

export default CargandoSpinner;
