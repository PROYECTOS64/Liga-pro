'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';

// --- Tipos de propiedades del modal ---
export interface ModalProps {
  /** Si el modal está abierto */
  abierto: boolean;
  /** Callback al cerrar el modal */
  alCerrar: () => void;
  /** Título del modal */
  titulo?: string;
  /** Contenido del modal */
  children: ReactNode;
  /** Tamaño del modal */
  tamano?: 'sm' | 'md' | 'lg' | 'xl';
  /** Cerrar al hacer clic en el fondo */
  cerrarConFondo?: boolean;
  /** Mostrar botón de cerrar */
  mostrarCerrar?: boolean;
  /** Clases adicionales */
  className?: string;
  /** Pie del modal (p.ej. botones de acción) */
  pie?: ReactNode;
}

// --- Estilos de tamaño del modal ---
const estilosTamano: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Componente Modal con animación y accesibilidad.
 * Se superpone al contenido con fondo difuminado.
 */
export function Modal({
  abierto,
  alCerrar,
  titulo,
  children,
  tamano = 'md',
  cerrarConFondo = true,
  mostrarCerrar = true,
  className = '',
  pie,
}: ModalProps) {
  // --- Cerrar con tecla Escape ---
  const manejarEscape = useCallback(
    (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        alCerrar();
      }
    },
    [alCerrar],
  );

  useEffect(() => {
    if (abierto) {
      document.addEventListener('keydown', manejarEscape);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', manejarEscape);
      document.body.style.overflow = '';
    };
  }, [abierto, manejarEscape]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titulo ? 'modal-titulo' : undefined}
    >
      {/* Fondo oscuro con difuminado */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
        onClick={cerrarConFondo ? alCerrar : undefined}
        aria-hidden="true"
      />

      {/* Contenido del modal */}
      <div
        className={[
          'relative w-full bg-white rounded-xl shadow-2xl',
          'animate-[scaleIn_200ms_ease-out]',
          'max-h-[90vh] flex flex-col',
          estilosTamano[tamano],
          className,
        ].join(' ')}
      >
        {/* Encabezado */}
        {(titulo || mostrarCerrar) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {titulo && (
              <h2
                id="modal-titulo"
                className="text-lg font-semibold text-[#1A1A2E]"
              >
                {titulo}
              </h2>
            )}
            {mostrarCerrar && (
              <button
                type="button"
                onClick={alCerrar}
                className={[
                  'min-h-[44px] min-w-[44px] inline-flex items-center justify-center',
                  'rounded-lg text-[#6B7280] hover:text-[#1A1A2E] hover:bg-gray-100',
                  'transition-colors duration-150 cursor-pointer',
                  !titulo ? 'ml-auto' : '',
                ].join(' ')}
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Cuerpo del modal */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Pie del modal */}
        {pie && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            {pie}
          </div>
        )}
      </div>

      {/* Estilos de animación en línea */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Modal;
