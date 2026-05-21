'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// --- Tipos de propiedades del botón ---
export interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual del botón */
  variante?: 'primary' | 'secondary' | 'danger' | 'success' | 'gold';
  /** Tamaño del botón */
  tamano?: 'sm' | 'md' | 'lg';
  /** Icono a mostrar antes del texto */
  icono?: ReactNode;
  /** Icono a mostrar después del texto */
  iconoDerecho?: ReactNode;
  /** Estado de carga */
  cargando?: boolean;
  /** Botón de ancho completo */
  anchoCompleto?: boolean;
  /** Contenido del botón */
  children: ReactNode;
}

// --- Estilos por variante ---
const estilosVariante: Record<string, string> = {
  primary:
    'bg-[#1B2A4A] text-white hover:bg-[#243659] focus-visible:ring-[#2980B9] shadow-sm',
  secondary:
    'border-2 border-[#1B2A4A] text-[#1B2A4A] bg-white hover:bg-[#F0F2F5] focus-visible:ring-[#1B2A4A]',
  danger:
    'bg-[#C0392B] text-white hover:bg-[#A93226] focus-visible:ring-[#C0392B] shadow-sm',
  success:
    'bg-[#27AE60] text-white hover:bg-[#219A52] focus-visible:ring-[#27AE60] shadow-sm',
  gold:
    'bg-[#D4A843] text-white hover:bg-[#C49B38] focus-visible:ring-[#D4A843] shadow-sm',
};

// --- Estilos por tamaño (respetando 44px mínimo de touch target) ---
const estilosTamano: Record<string, string> = {
  sm: 'min-h-[44px] px-3 py-2 text-sm gap-1.5',
  md: 'min-h-[44px] px-5 py-2.5 text-sm gap-2',
  lg: 'min-h-[48px] px-6 py-3 text-base gap-2.5',
};

/**
 * Componente Botón reutilizable con variantes y estados.
 * Cumple con el diseño empresarial de LIGAPRO.
 */
export function Boton({
  variante = 'primary',
  tamano = 'md',
  icono,
  iconoDerecho,
  cargando = false,
  anchoCompleto = false,
  disabled,
  className = '',
  children,
  ...rest
}: BotonProps) {
  const deshabilitado = disabled || cargando;

  return (
    <button
      disabled={deshabilitado}
      className={[
        // Base
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-colors duration-150 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'cursor-pointer select-none',
        // Variante y tamaño
        estilosVariante[variante],
        estilosTamano[tamano],
        // Ancho completo
        anchoCompleto ? 'w-full' : '',
        // Deshabilitado
        deshabilitado ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* Indicador de carga */}
      {cargando && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}

      {/* Icono izquierdo */}
      {!cargando && icono && <span className="shrink-0">{icono}</span>}

      {/* Texto del botón */}
      <span>{children}</span>

      {/* Icono derecho */}
      {iconoDerecho && <span className="shrink-0">{iconoDerecho}</span>}
    </button>
  );
}

export default Boton;
