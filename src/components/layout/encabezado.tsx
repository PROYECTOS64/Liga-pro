'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  User,
  Trophy,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
} from 'lucide-react';

// --- Enlace de navegación ---
interface EnlaceNavegacion {
  etiqueta: string;
  ruta: string;
}

// --- Enlaces principales de navegación ---
const enlacesNavegacion: EnlaceNavegacion[] = [
  { etiqueta: 'Inicio', ruta: '/' },
  { etiqueta: 'Competiciones', ruta: '/competiciones' },
  { etiqueta: 'Clubes', ruta: '/clubes' },
  { etiqueta: 'Jugadores', ruta: '/jugadores' },
  { etiqueta: 'Informes', ruta: '/informes' },
  { etiqueta: 'Administración', ruta: '/administracion' },
];

// --- Propiedades del encabezado ---
export interface EncabezadoProps {
  /** Nombre del usuario actual */
  nombreUsuario?: string;
  /** Número de notificaciones pendientes */
  notificaciones?: number;
  /** Callback al buscar */
  alBuscar?: (termino: string) => void;
  /** Callback al cerrar sesión */
  alCerrarSesion?: () => void;
}

/**
 * Componente Encabezado principal de LIGAPRO EC.
 * Barra de navegación fija superior con logo, búsqueda, nav y usuario.
 */
export function Encabezado({
  nombreUsuario = 'Admin',
  notificaciones = 0,
  alBuscar,
  alCerrarSesion,
}: EncabezadoProps) {
  const rutaActual = usePathname();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const menuUsuarioRef = useRef<HTMLDivElement>(null);

  // --- Cerrar menú de usuario al hacer clic fuera ---
  useEffect(() => {
    const manejarClicFuera = (evento: MouseEvent) => {
      if (
        menuUsuarioRef.current &&
        !menuUsuarioRef.current.contains(evento.target as Node)
      ) {
        setMenuUsuarioAbierto(false);
      }
    };

    document.addEventListener('mousedown', manejarClicFuera);
    return () => document.removeEventListener('mousedown', manejarClicFuera);
  }, []);

  // --- Verificar si un enlace está activo ---
  const estaActivo = (ruta: string) => {
    if (ruta === '/') return rutaActual === '/';
    return rutaActual.startsWith(ruta);
  };

  // --- Manejar búsqueda ---
  const manejarBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    alBuscar?.(terminoBusqueda);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#1B2A4A] shadow-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* === Lado izquierdo: Logo === */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Logo con ícono de trofeo */}
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[#27AE60]">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide hidden sm:block">
              LIGAPRO EC
            </span>
          </div>

          {/* === Centro: Barra de búsqueda (oculta en móvil) === */}
          <form
            onSubmit={manejarBusqueda}
            className="hidden md:flex items-center mx-6 flex-1 max-w-md"
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-white/50" />
              </div>
              <input
                type="search"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Buscar..."
                className={[
                  'w-full bg-white/10 text-white placeholder:text-white/50',
                  'rounded-full pl-10 pr-4 py-2 text-sm',
                  'border border-white/10 focus:border-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-white/20',
                  'transition-colors duration-150',
                ].join(' ')}
              />
            </div>
          </form>

          {/* === Navegación principal (oculta en móvil) === */}
          <nav className="hidden lg:flex items-center gap-1">
            {enlacesNavegacion.map((enlace) => (
              <Link
                key={enlace.ruta}
                href={enlace.ruta}
                className={[
                  'px-3 py-2 text-sm font-medium rounded-lg',
                  'transition-colors duration-150',
                  'min-h-[44px] inline-flex items-center',
                  estaActivo(enlace.ruta)
                    ? 'text-white bg-white/15'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
                ].join(' ')}
              >
                {enlace.etiqueta}
              </Link>
            ))}
          </nav>

          {/* === Lado derecho: Notificaciones y usuario === */}
          <div className="flex items-center gap-2 ml-4">
            {/* Botón de notificaciones */}
            <button
              type="button"
              className={[
                'relative min-h-[44px] min-w-[44px]',
                'inline-flex items-center justify-center',
                'rounded-lg text-white/70 hover:text-white hover:bg-white/10',
                'transition-colors duration-150 cursor-pointer',
              ].join(' ')}
              aria-label={`Notificaciones${notificaciones > 0 ? ` (${notificaciones} nuevas)` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {notificaciones > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-[#C0392B] text-white text-[10px] font-bold">
                  {notificaciones > 99 ? '99+' : notificaciones}
                </span>
              )}
            </button>

            {/* Menú de usuario */}
            <div className="relative" ref={menuUsuarioRef}>
              <button
                type="button"
                onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                className={[
                  'min-h-[44px] inline-flex items-center gap-2 px-2 py-1.5',
                  'rounded-lg text-white/70 hover:text-white hover:bg-white/10',
                  'transition-colors duration-150 cursor-pointer',
                ].join(' ')}
                aria-expanded={menuUsuarioAbierto}
                aria-haspopup="true"
              >
                <div className="h-8 w-8 rounded-full bg-[#D4A843] flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {nombreUsuario}
                </span>
                <ChevronDown className="h-3.5 w-3.5 hidden sm:block" />
              </button>

              {/* Dropdown del usuario */}
              {menuUsuarioAbierto && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1A2E] hover:bg-[#F0F2F5] transition-colors"
                    onClick={() => setMenuUsuarioAbierto(false)}
                  >
                    <User className="h-4 w-4 text-[#6B7280]" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/configuracion"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1A2E] hover:bg-[#F0F2F5] transition-colors"
                    onClick={() => setMenuUsuarioAbierto(false)}
                  >
                    <Settings className="h-4 w-4 text-[#6B7280]" />
                    Configuración
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuUsuarioAbierto(false);
                      alCerrarSesion?.();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#C0392B] hover:bg-red-50 transition-colors w-full cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Botón menú móvil */}
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className={[
                'lg:hidden min-h-[44px] min-w-[44px]',
                'inline-flex items-center justify-center',
                'rounded-lg text-white/70 hover:text-white hover:bg-white/10',
                'transition-colors duration-150 cursor-pointer',
              ].join(' ')}
              aria-label="Abrir menú de navegación"
              aria-expanded={menuMovilAbierto}
            >
              {menuMovilAbierto ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* === Menú móvil desplegable === */}
      {menuMovilAbierto && (
        <nav className="lg:hidden border-t border-white/10 px-4 pb-4 pt-2">
          {/* Búsqueda en móvil */}
          <form onSubmit={manejarBusqueda} className="mb-3 md:hidden">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-white/50" />
              </div>
              <input
                type="search"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Buscar..."
                className={[
                  'w-full bg-white/10 text-white placeholder:text-white/50',
                  'rounded-full pl-10 pr-4 py-2.5 text-sm',
                  'border border-white/10 focus:border-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-white/20',
                ].join(' ')}
              />
            </div>
          </form>

          {/* Enlaces de navegación en móvil */}
          <div className="flex flex-col gap-1">
            {enlacesNavegacion.map((enlace) => (
              <Link
                key={enlace.ruta}
                href={enlace.ruta}
                onClick={() => setMenuMovilAbierto(false)}
                className={[
                  'px-3 py-2.5 text-sm font-medium rounded-lg',
                  'min-h-[44px] flex items-center',
                  estaActivo(enlace.ruta)
                    ? 'text-white bg-white/15'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
                ].join(' ')}
              >
                {enlace.etiqueta}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Encabezado;
