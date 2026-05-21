import { type ReactNode } from 'react';

// --- Tipos de propiedades de la tarjeta estadística ---
export interface TarjetaEstadisticaProps {
  /** Título del indicador (p.ej. "Competiciones Activas") */
  titulo: string;
  /** Valor numérico principal */
  valor: string | number;
  /** Icono del indicador */
  icono: ReactNode;
  /** Color de fondo del círculo del icono */
  colorIcono?: 'blue' | 'gold' | 'red' | 'green' | 'navy';
  /** Texto de cambio o subtítulo (p.ej. "+2 este mes") */
  subtitulo?: string;
  /** Tendencia: positiva, negativa o neutra */
  tendencia?: 'positiva' | 'negativa' | 'neutra';
  /** Clases adicionales */
  className?: string;
}

// --- Colores del fondo del icono ---
const coloresFondoIcono: Record<string, string> = {
  blue: 'bg-[#2980B9]/10 text-[#2980B9]',
  gold: 'bg-[#D4A843]/10 text-[#D4A843]',
  red: 'bg-[#C0392B]/10 text-[#C0392B]',
  green: 'bg-[#27AE60]/10 text-[#27AE60]',
  navy: 'bg-[#1B2A4A]/10 text-[#1B2A4A]',
};

// --- Colores de tendencia ---
const coloresTendencia: Record<string, string> = {
  positiva: 'text-[#27AE60]',
  negativa: 'text-[#C0392B]',
  neutra: 'text-[#6B7280]',
};

/**
 * Componente de Tarjeta Estadística / KPI.
 * Muestra un indicador clave con icono, valor y tendencia.
 * Usado para: Competiciones Activas, Habilitaciones Pendientes, etc.
 */
export function TarjetaEstadistica({
  titulo,
  valor,
  icono,
  colorIcono = 'blue',
  subtitulo,
  tendencia = 'neutra',
  className = '',
}: TarjetaEstadisticaProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl shadow-sm border border-gray-100 p-5',
        'flex items-start gap-4',
        className,
      ].join(' ')}
    >
      {/* Círculo con icono */}
      <div
        className={[
          'shrink-0 flex items-center justify-center',
          'h-12 w-12 rounded-full',
          coloresFondoIcono[colorIcono],
        ].join(' ')}
      >
        {icono}
      </div>

      {/* Contenido textual */}
      <div className="flex flex-col gap-0.5 min-w-0">
        {/* Título del indicador */}
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide truncate">
          {titulo}
        </span>

        {/* Valor principal */}
        <span className="text-2xl font-bold text-[#1A1A2E] leading-tight">
          {valor}
        </span>

        {/* Subtítulo / tendencia */}
        {subtitulo && (
          <span
            className={[
              'text-xs font-medium mt-0.5',
              coloresTendencia[tendencia],
            ].join(' ')}
          >
            {subtitulo}
          </span>
        )}
      </div>
    </div>
  );
}

export default TarjetaEstadistica;
