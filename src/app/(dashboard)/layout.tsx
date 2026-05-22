'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Bell, User, Trophy, Home, Users, Shield,
  FileText, AlertTriangle, Monitor, ClipboardCheck,
  Settings, LogOut, ChevronDown, Menu, X,
  BarChart3, Calendar, Landmark
} from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

// Definición de enlaces de navegación principal
const enlacesNav = [
  { href: '/', etiqueta: 'Inicio', icono: Home },
  { href: '/competiciones', etiqueta: 'Competiciones', icono: Trophy },
  { href: '/clubes', etiqueta: 'Clubes', icono: Shield },
  { href: '/jugadores', etiqueta: 'Jugadores', icono: Users },
  { href: '/informes', etiqueta: 'Informes', icono: BarChart3 },
  { href: '/administracion', etiqueta: 'Administración', icono: Settings },
];

// Definición de enlaces de la barra lateral
const enlacesSidebar = [
  {
    seccion: 'Gestión de Campeonato',
    items: [
      { href: '/competiciones', etiqueta: 'Tablas del Campeonato', icono: BarChart3 },
      { href: '/competiciones/fixture', etiqueta: 'Fixtures del Campeonato', icono: Calendar },
      { href: '/competiciones/desempate', etiqueta: 'Desempates', icono: Trophy },
    ]
  },
  {
    seccion: 'Operaciones',
    items: [
      { href: '/planillas', etiqueta: 'Planillas de Juego', icono: FileText },
      { href: '/jugadores', etiqueta: 'Habilitación Jugadores', icono: Users },
      { href: '/disciplinario', etiqueta: 'Control Disciplinario', icono: AlertTriangle },
      { href: '/arbitraje', etiqueta: 'Asignación Arbitral', icono: Users },
    ]
  },
  {
    seccion: 'Infraestructura',
    items: [
      { href: '/infraestructura', etiqueta: 'Checklist Estadios', icono: ClipboardCheck },
      { href: '/infraestructura/var', etiqueta: 'Certificación VAR', icono: Monitor },
      { href: '/estadios', etiqueta: 'Estadios', icono: Landmark },
    ]
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [sidebarAbierta, setSidebarAbierta] = useState(true);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [usuario, setUsuario] = useState<{ email?: string; nombre?: string; role?: string } | null>(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const supabase = crearClienteNavegador();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: perfil } = await supabase.from('perfiles').select('rol').eq('user_id', user.id).single();
        let rolReal = perfil?.rol?.toLowerCase() || 'usuario';
        
        if (user.email === 'admin@ligapro.ec') {
          rolReal = 'admin';
        }
        
        setUsuario({
          email: user.email,
          nombre: user.user_metadata?.nombre_completo || user.email?.split('@')[0] || 'Usuario',
          role: rolReal
        });
      }
    };
    obtenerUsuario();
  }, []);

  async function cerrarSesion(e?: React.MouseEvent<HTMLButtonElement>) {
    // Evitamos comportamiento por defecto si existe el evento
    e?.preventDefault?.();

    try {
      // 1. Limpiamos estados visuales
      setUsuario(null);
      setMenuUsuarioAbierto(false);

      // 2. Ejecutamos el cierre en Supabase (solo sesión local)
      const supabase = crearClienteNavegador();
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) console.warn('Supabase signOut error:', error.message);

      // 3. Destruimos data local
      document.cookie = "mock_session_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "mock_session_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      try { localStorage.clear(); } catch {};
      try { sessionStorage.clear(); } catch {};

      // 4. Redirección SPA usando router (más fiable en app router)
      router.replace('/login');

    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // En caso extremo, forzamos navegación completa
      window.location.href = '/login';
    }
  }
  return (
    <div className="flex flex-col min-h-screen">
      {/* ============ HEADER PRINCIPAL ============ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-6"
        style={{
          background: 'linear-gradient(135deg, #1B2A4A 0%, #243558 100%)',
          height: 'var(--altura-header)',
        }}
      >
        {/* Logo y búsqueda */}
        <div className="flex items-center gap-4">
          {/* Botón hamburguesa para móvil */}
          <button
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Menú"
          >
            {menuMovilAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo LIGAPRO EC */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #27AE60, #2ECC71)',
                boxShadow: '0 2px 8px rgba(39, 174, 96, 0.4)',
              }}
            >
              <Trophy size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide hidden sm:block">
              LIGAPRO <span className="text-[#D4A843] font-extrabold">EC</span>
            </span>
          </Link>

          {/* Barra de búsqueda */}
          <div className="hidden md:flex items-center relative">
            <Search size={16} className="absolute left-3 text-white/50" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-white/50 border-none outline-none focus:ring-2 focus:ring-[#D4A843]/50"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                width: '240px',
                transition: 'var(--transicion-rapida)',
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.width = '320px';
                (e.target as HTMLInputElement).style.background = 'rgba(255, 255, 255, 0.18)';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.width = '240px';
                (e.target as HTMLInputElement).style.background = 'rgba(255, 255, 255, 0.12)';
              }}
            />
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="hidden lg:flex items-center gap-1">
          {enlacesNav.filter((enlace) => {
             if (usuario?.role === 'usuario') return ['/', '/competiciones', '/clubes', '/jugadores'].includes(enlace.href);
             if (usuario?.role === 'arbitro') return ['/', '/competiciones', '/clubes'].includes(enlace.href);
             if (usuario?.role === 'club') return ['/', '/competiciones', '/clubes', '/jugadores'].includes(enlace.href);
             return true;
          }).map((enlace) => {
            const esActivo = pathname === enlace.href ||
              (enlace.href !== '/' && pathname.startsWith(enlace.href));
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                className="relative px-3 py-2 rounded-lg text-sm font-medium transition-all no-underline"
                style={{
                  color: esActivo ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                  background: esActivo ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!esActivo) {
                    (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!esActivo) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.75)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                {enlace.etiqueta}
                {esActivo && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: '20px',
                      height: '3px',
                      background: '#D4A843',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Acciones de usuario */}
        <div className="flex items-center gap-3">
          {/* Notificaciones */}
          <button
            className="relative p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Notificaciones"
          >
            <Bell size={20} />
            <span
              className="absolute top-1 right-1 rounded-full"
              style={{
                width: '8px',
                height: '8px',
                background: '#E74C3C',
                border: '2px solid #1B2A4A',
              }}
            />
          </button>

          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div
                className="flex items-center justify-center rounded-full text-white font-semibold text-sm"
                style={{
                  width: '34px',
                  height: '34px',
                  background: 'linear-gradient(135deg, #D4A843, #B8922F)',
                }}
              >
                {usuario?.nombre?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown size={14} className="text-white/60 hidden sm:block" />
            </button>

            {/* Dropdown del usuario */}
            {menuUsuarioAbierto && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuUsuarioAbierto(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50 animate-scale-in"
                  style={{
                    background: 'var(--fondo-tarjeta)',
                    boxShadow: 'var(--sombra-elevada)',
                    border: '1px solid var(--borde-suave)',
                  }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--borde-suave)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
                      {usuario?.nombre || 'Usuario'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                      {usuario?.email || ''}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors"
                      style={{ color: 'var(--texto-primario)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--fondo-principal)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <User size={16} style={{ color: 'var(--texto-secundario)' }} />
                      Mi Perfil
                    </Link>
                    <Link
                      href="/administracion/configuracion"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors"
                      style={{ color: 'var(--texto-primario)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--fondo-principal)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Settings size={16} style={{ color: 'var(--texto-secundario)' }} />
                      Configuración
                    </Link>
                  </div>
                  <div className="border-t py-1" style={{ borderColor: 'var(--borde-suave)' }}>
  <button
    type="button"
    onClick={cerrarSesion}
    className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors cursor-pointer border-none bg-transparent"
    style={{ color: 'var(--ligapro-red)' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <LogOut size={16} />
    Cerrar Sesión
  </button>
</div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <div className="flex flex-1" style={{ paddingTop: 'var(--altura-header)' }}>
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[var(--altura-header)] z-30
            h-[calc(100vh-var(--altura-header))] overflow-y-auto
            transition-transform duration-300 ease-in-out
            ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarAbierta ? 'w-64' : 'w-0 lg:w-16'}
          `}
          style={{
            background: 'var(--fondo-tarjeta)',
            borderRight: '1px solid var(--borde-suave)',
          }}
        >
          {/* Botón colapsar sidebar (desktop) */}
          <div className="hidden lg:flex items-center justify-end px-3 py-2">
            <button
              onClick={() => setSidebarAbierta(!sidebarAbierta)}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--texto-secundario)' }}
              aria-label={sidebarAbierta ? 'Colapsar menú' : 'Expandir menú'}
            >
              <Menu size={18} />
            </button>
          </div>

          {sidebarAbierta && (
            <nav className="px-3 pb-6">
              {enlacesSidebar.filter(seccion => {
                if (usuario?.role === 'usuario') return seccion.seccion === 'Gestión de Campeonato';
                if (usuario?.role === 'arbitro') return seccion.seccion === 'Operaciones' || seccion.seccion === 'Gestión de Campeonato';
                if (usuario?.role === 'club') return seccion.seccion === 'Gestión de Campeonato' || seccion.seccion === 'Operaciones';
                return true;
              }).map((seccion) => (
                <div key={seccion.seccion} className="mb-5">
                  <h3
                    className="text-[11px] font-bold uppercase tracking-wider px-3 mb-2"
                    style={{ color: 'var(--texto-terciario)' }}
                  >
                    {seccion.seccion}
                  </h3>
                  <ul className="space-y-0.5 list-none p-0 m-0">
                    {seccion.items.filter(item => {
                       if (usuario?.role === 'usuario') return ['/competiciones', '/competiciones/fixture'].includes(item.href);
                       if (usuario?.role === 'arbitro') return ['/competiciones', '/competiciones/fixture', '/planillas', '/disciplinario'].includes(item.href);
                       if (usuario?.role === 'club') return ['/competiciones', '/competiciones/fixture', '/jugadores'].includes(item.href);
                       return true;
                    }).map((item) => {
                      const Icono = item.icono;
                      const esActivo = pathname === item.href ||
                        pathname.startsWith(item.href + '/');
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all"
                            style={{
                              color: esActivo ? 'var(--ligapro-blue)' : 'var(--texto-secundario)',
                              background: esActivo ? '#EBF5FF' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (!esActivo) {
                                (e.currentTarget as HTMLElement).style.background = 'var(--fondo-principal)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--texto-primario)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!esActivo) {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = 'var(--texto-secundario)';
                              }
                            }}
                          >
                            <Icono size={18} />
                            {item.etiqueta}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </aside>

        {/* Overlay móvil para sidebar */}
        {menuMovilAbierto && (
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            style={{ top: 'var(--altura-header)' }}
            onClick={() => setMenuMovilAbierto(false)}
          />
        )}

        {/* Contenido de la página */}
        <main
          className="flex-1 min-h-[calc(100vh-var(--altura-header))] p-4 lg:p-6 overflow-x-hidden"
          style={{ background: 'var(--fondo-principal)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
