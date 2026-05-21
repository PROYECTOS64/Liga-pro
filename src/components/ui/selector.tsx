'use client';

import { type SelectHTMLAttributes, forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

// --- Opción individual del selector ---
export interface OpcionSelector {
  valor: string;
  etiqueta: string;
  deshabilitada?: boolean;
}

// --- Tipos de propiedades del selector ---
export interface SelectorProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Etiqueta del campo */
  etiqueta?: string;
  /** Opciones del selector */
  opciones: OpcionSelector[];
  /** Texto del placeholder (primera opción deshabilitada) */
  placeholder?: string;
  /** Mensaje de error */
  error?: string;
  /** Texto de ayuda */
  textoAyuda?: string;
  /** Campo obligatorio */
  obligatorio?: boolean;
  /** Clases adicionales */
  className?: string;
}

/**
 * Componente Selector (dropdown) con etiqueta y validación.
 * Estilo consistente con el sistema de diseño LIGAPRO.
 */
export const Selector = forwardRef<HTMLSelectElement, SelectorProps>(
  function Selector(
    {
      etiqueta,
      opciones,
      placeholder,
      error,
      textoAyuda,
      obligatorio = false,
      className = '',
      id: idProp,
      ...rest
    },
    ref,
  ) {
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

        {/* Contenedor del selector con flecha personalizada */}
        <div className="relative">
          <select
            ref={ref}
            id={idCampo}
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
              'w-full appearance-none rounded-lg border bg-white',
              'pl-3.5 pr-10 py-2.5 text-sm text-[#1A1A2E]',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'min-h-[44px] cursor-pointer',
              error
                ? 'border-[#C0392B] focus:ring-[#C0392B]/30 focus:border-[#C0392B]'
                : 'border-gray-300 focus:ring-[#2980B9]/30 focus:border-[#2980B9]',
              'disabled:bg-gray-50 disabled:text-[#6B7280] disabled:cursor-not-allowed',
            ].join(' ')}
            {...rest}
          >
            {/* Opción placeholder */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Opciones del selector */}
            {opciones.map((opcion) => (
              <option
                key={opcion.valor}
                value={opcion.valor}
                disabled={opcion.deshabilitada}
              >
                {opcion.etiqueta}
              </option>
            ))}
          </select>

          {/* Icono de flecha personalizado */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#6B7280]">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p
            id={`${idCampo}-error`}
            className="text-xs text-[#C0392B]"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Texto de ayuda */}
        {!error && textoAyuda && (
          <p id={`${idCampo}-ayuda`} className="text-xs text-[#6B7280]">
            {textoAyuda}
          </p>
        )}
      </div>
    );
  },
);

export default Selector;
