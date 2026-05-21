'use client';

import { type InputHTMLAttributes, forwardRef, useId } from 'react';

// --- Tipos de propiedades de la entrada ---
export interface EntradaProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Etiqueta del campo */
  etiqueta?: string;
  /** Mensaje de error */
  error?: string;
  /** Texto de ayuda debajo del campo */
  textoAyuda?: string;
  /** Tipo de campo */
  tipo?: 'text' | 'number' | 'date' | 'email' | 'password' | 'search' | 'tel';
  /** Campo obligatorio (muestra asterisco) */
  obligatorio?: boolean;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Icono a mostrar a la izquierda del campo */
  iconoIzquierdo?: React.ReactNode;
}

/**
 * Componente Entrada de texto con etiqueta, error y texto de ayuda.
 * Estilo empresarial limpio con anillo de enfoque azul.
 */
export const Entrada = forwardRef<HTMLInputElement, EntradaProps>(
  function Entrada(
    {
      etiqueta,
      error,
      textoAyuda,
      tipo = 'text',
      obligatorio = false,
      className = '',
      iconoIzquierdo,
      id: idProp,
      ...rest
    },
    ref,
  ) {
    // Generar ID único si no se proporciona
    const idGenerado = useId();
    const idCampo = idProp ?? idGenerado;

    return (
      <div className={['flex flex-col gap-1.5', className].join(' ')}>
        {/* Etiqueta */}
        {etiqueta && (
          <label
            htmlFor={idCampo}
            className="text-sm font-medium text-[#1A1A2E]"
          >
            {etiqueta}
            {obligatorio && (
              <span className="text-[#C0392B] ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Contenedor del campo */}
        <div className="relative">
          {/* Icono izquierdo */}
          {iconoIzquierdo && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#6B7280]">
              {iconoIzquierdo}
            </div>
          )}

          {/* Campo de entrada */}
          <input
            ref={ref}
            id={idCampo}
            type={tipo}
            required={obligatorio}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${idCampo}-error`
                : textoAyuda
                  ? `${idCampo}-ayuda`
                  : undefined
            }
            className={[
              'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#1A1A2E]',
              'placeholder:text-[#6B7280]/60',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'min-h-[44px]',
              // Estado de error o normal
              error
                ? 'border-[#C0392B] focus:ring-[#C0392B]/30 focus:border-[#C0392B]'
                : 'border-gray-300 focus:ring-[#2980B9]/30 focus:border-[#2980B9]',
              // Padding izquierdo con icono
              iconoIzquierdo ? 'pl-10' : '',
              // Deshabilitado
              'disabled:bg-gray-50 disabled:text-[#6B7280] disabled:cursor-not-allowed',
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <p
            id={`${idCampo}-error`}
            className="text-xs text-[#C0392B] flex items-center gap-1"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Texto de ayuda */}
        {!error && textoAyuda && (
          <p
            id={`${idCampo}-ayuda`}
            className="text-xs text-[#6B7280]"
          >
            {textoAyuda}
          </p>
        )}
      </div>
    );
  },
);

export default Entrada;
