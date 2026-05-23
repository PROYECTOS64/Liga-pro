'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, Search, Filter, Plus, Download, ChevronLeft, ChevronRight,
  UserCircle, Shield, MoreHorizontal, X, Stethoscope, ClipboardList
} from 'lucide-react';

import { crearClienteNavegador } from '@/lib/supabase/cliente';

const estados = ['Todos', 'ACTIVO', 'PENDIENTE', 'SUSPENDIDO'];
const posiciones = ['Todas', 'Portero', 'Defensa', 'Mediocampista', 'Extremo', 'Delantero'];

const pestanas = [
  { id: 'jugadores', etiqueta: 'Jugadores', icono: Users },
  { id: 'tecnico', etiqueta: 'Cuerpo Técnico', icono: ClipboardList },
  { id: 'medico', etiqueta: 'Staff Médico', icono: Stethoscope },
];

function Insignia({ estado }: { estado: string }) {
  const estilos: Record<string, { bg: string; text: string }> = {
    ACTIVO: { bg: '#DEF7EC', text: '#03543F' },
    PENDIENTE: { bg: '#FEF3C7', text: '#92400E' },
    SUSPENDIDO: { bg: '#FFEDD5', text: '#9A3412' },
  };
  const estilo = estilos[estado] || estilos.ACTIVO;
  const etiquetas: Record<string, string> = {
    ACTIVO: 'Activo',
    PENDIENTE: 'Pendiente',
    SUSPENDIDO: 'Suspendido',
  };

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: estilo.bg, color: estilo.text }}
    >
      {etiquetas[estado] || estado}
    </span>
  );
}

export default function PaginaJugadores() {
  const [jugadoresData, setJugadoresData] = useState<any[]>([]);
  const [clubesList, setClubesList] = useState<string[]>(['Todos']);
  const [cargando, setCargando] = useState(true);
  const supabase = crearClienteNavegador();

  const [pestanaActiva, setPestanaActiva] = useState('jugadores');
  const [busqueda, setBusqueda] = useState('');
  const [filtroClub, setFiltroClub] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroPosicion, setFiltroPosicion] = useState('Todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const elementosPorPagina = 8;
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.email === 'admin@ligapro.ec') {
           setUserRole('admin');
        } else {
           const { data: perfil } = await supabase.from('perfiles').select('rol').eq('user_id', user.id).single();
           setUserRole(perfil?.rol?.toLowerCase() || 'usuario');
        }
      }
    };
    fetchUserRole();
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    setCargando(true);
    const { data: clubesData } = await supabase.from('clubes').select('nombre');
    if (clubesData) {
      setClubesList(['Todos', ...clubesData.map(c => c.nombre)]);
    }

    const { data: jugData } = await supabase.from('jugadores').select(`
      *,
      clubes ( nombre )
    `);
    if (jugData) {
      const formatted = jugData.map(j => ({
        id: j.id,
        nombre: j.nombre_completo,
        club: j.clubes?.nombre || 'Sin Club',
        posicion: j.posicion,
        dorsal: j.dorsal,
        estado: j.estado,
        foto: j.foto_url
      }));
      setJugadoresData(formatted);
    }

    const { data: staffData } = await supabase.from('staff').select(`
      *,
      clubes ( nombre )
    `);
    if (staffData) {
      const tecnicosData = staffData.filter(s => s.tipo_staff === 'CUERPO_TECNICO' || s.is_director_tecnico);
      const medicosData = staffData.filter(s => s.tipo_staff === 'CUERPO_MEDICO' || s.is_medico);
      
      setTecnicos(tecnicosData.map(t => ({ id: t.id, nombre: t.nombre_completo, cargo: t.tipo_staff })));
      setMedicos(medicosData.map(m => ({ id: m.id, nombre: m.nombre_completo, cargo: m.tipo_staff })));
    }
    setCargando(false);
  };

  const agregarTecnico = () => {
    router.push('/jugadores/nuevo?tipo=tecnico');
  };

  const eliminarTecnico = async (id: string) => {
    if (confirm('¿Desea eliminar este miembro del cuerpo técnico?')) {
      await supabase.from('staff').delete().eq('id', id);
      fetchDatos();
    }
  };

  const agregarMedico = () => {
    router.push('/jugadores/nuevo?tipo=medico');
  };

  const eliminarMedico = async (id: string) => {
    if (confirm('¿Desea eliminar este miembro del staff médico?')) {
      await supabase.from('staff').delete().eq('id', id);
      fetchDatos();
    }
  };

  const eliminarJugador = async (id: string) => {
    if (confirm('¿Desea eliminar este jugador? Esta acción no se puede deshacer.')) {
      await supabase.from('jugadores').delete().eq('id', id);
      fetchDatos();
    }
  };

  const jugadoresFiltrados = useMemo(() => {
    return jugadoresData.filter((j) => {
      const coincideBusqueda = j.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.club.toLowerCase().includes(busqueda.toLowerCase());
      const coincideClub = filtroClub === 'Todos' || j.club === filtroClub;
      const coincideEstado = filtroEstado === 'Todos' || j.estado === filtroEstado;
      const coincidePosicion = filtroPosicion === 'Todas' || j.posicion === filtroPosicion;
      return coincideBusqueda && coincideClub && coincideEstado && coincidePosicion;
    });
  }, [busqueda, filtroClub, filtroEstado, filtroPosicion]);

  const totalPaginas = Math.ceil(jugadoresFiltrados.length / elementosPorPagina);
  const jugadoresPagina = jugadoresFiltrados.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroClub('Todos');
    setFiltroEstado('Todos');
    setFiltroPosicion('Todas');
    setPaginaActual(1);
  };

  const exportarAPDF = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Por favor, permite las ventanas emergentes para exportar el PDF.");
        return;
      }
      
      const tableRowsHTML = jugadoresFiltrados.map(j => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${j.nombre}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${j.club}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${j.posicion}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${j.dorsal}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${j.estado}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <html>
          <head>
            <title>Jugadores_LigaPro</title>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              h1 { color: #1B2A4A; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #f3f4f6; padding: 10px 8px; text-align: left; border-bottom: 2px solid #ddd; }
              th.center { text-align: center; }
            </style>
          </head>
          <body>
            <h1>Listado Oficial de Jugadores - LigaPro EC</h1>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Club</th>
                  <th>Posición</th>
                  <th class="center">Dorsal</th>
                  <th class="center">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHTML}
              </tbody>
            </table>
            <script>
              window.onload = () => {
                window.print();
                setTimeout(() => window.close(), 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar la vista de impresión.");
    }
  };

  const filtrosActivos = filtroClub !== 'Todos' || filtroEstado !== 'Todos' || filtroPosicion !== 'Todas';

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
            Gestión de Jugadores y Staff
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
            Administración de jugadores, cuerpo técnico y staff médico
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportarAPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'var(--fondo-tarjeta)',
              border: '1px solid var(--borde-suave)',
              color: 'var(--texto-primario)',
            }}
          >
            <Download size={16} />
            Exportar PDF
          </button>
          {(userRole === 'admin' || userRole === 'club') && (
            <button
              onClick={() => router.push('/jugadores/nuevo')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white no-underline transition-all"
              style={{
                background: 'linear-gradient(135deg, #2980B9, #1F6691)',
              }}
            >
              <Plus size={16} />
              Registrar Jugador
            </button>
          )}
        </div>
      </div>

      {/* Pestañas */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
        }}
      >
        <div
          className="flex items-center gap-1 px-4 py-2"
          style={{ borderBottom: '1px solid var(--borde-suave)' }}
        >
          {pestanas.map((p) => {
            const Icono = p.icono;
            const esActiva = pestanaActiva === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPestanaActiva(p.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: esActiva ? '#EBF5FF' : 'transparent',
                  color: esActiva ? '#2980B9' : 'var(--texto-secundario)',
                  borderBottom: esActiva ? '2px solid #2980B9' : '2px solid transparent',
                }}
              >
                <Icono size={16} />
                {p.etiqueta}
              </button>
            );
          })}
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre o club..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--fondo-principal)',
                  border: '1px solid var(--borde-suave)',
                  color: 'var(--texto-primario)',
                }}
              />
            </div>
            {/* Botón filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mostrarFiltros ? '#EBF5FF' : 'var(--fondo-principal)',
                border: '1px solid var(--borde-suave)',
                color: mostrarFiltros ? '#2980B9' : 'var(--texto-secundario)',
              }}
            >
              <Filter size={16} />
              Filtros
              {filtrosActivos && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs text-white font-bold" style={{ background: '#C0392B' }}>
                  !
                </span>
              )}
            </button>
            {filtrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ color: '#C0392B' }}
              >
                <X size={14} />
                Limpiar
              </button>
            )}
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg animate-slide-up"
              style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }}
            >
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--texto-secundario)' }}>
                  Club
                </label>
                <select
                  value={filtroClub}
                  onChange={(e) => { setFiltroClub(e.target.value); setPaginaActual(1); }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--fondo-tarjeta)',
                    border: '1px solid var(--borde-suave)',
                    color: 'var(--texto-primario)',
                  }}
                >
                  {clubesList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--texto-secundario)' }}>
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--fondo-tarjeta)',
                    border: '1px solid var(--borde-suave)',
                    color: 'var(--texto-primario)',
                  }}
                >
                  {estados.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--texto-secundario)' }}>
                  Posición
                </label>
                <select
                  value={filtroPosicion}
                  onChange={(e) => { setFiltroPosicion(e.target.value); setPaginaActual(1); }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--fondo-tarjeta)',
                    border: '1px solid var(--borde-suave)',
                    color: 'var(--texto-primario)',
                  }}
                >
                  {posiciones.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de jugadores */}
        {pestanaActiva === 'jugadores' && (
          <div className="tabla-responsive">
            <table className="w-full">
              <thead>
                <tr style={{ borderTop: '1px solid var(--borde-suave)' }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Foto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Club</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Posición</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Dorsal</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {jugadoresPagina.map((j) => (
                  <tr
                    key={j.id}
                    className="transition-colors"
                    style={{ borderTop: '1px solid var(--borde-suave)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--fondo-principal)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-3">
                      <div
                        className="flex items-center justify-center rounded-full text-white text-sm font-bold"
                        style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #1B2A4A, #243558)',
                        }}
                      >
                        {j.nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/jugadores/${j.id}`}
                        className="text-sm font-semibold no-underline hover:underline"
                        style={{ color: 'var(--ligapro-blue)' }}
                      >
                        {j.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Shield size={14} style={{ color: 'var(--texto-terciario)' }} />
                        <span className="text-sm" style={{ color: 'var(--texto-secundario)' }}>{j.club}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>
                      {j.posicion}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
                        style={{ background: 'var(--fondo-principal)', color: 'var(--texto-primario)', border: '1px solid var(--borde-suave)' }}
                      >
                        {j.dorsal}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Insignia estado={j.estado} />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/jugadores/${j.id}`}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                          style={{ color: 'var(--texto-secundario)' }}
                        >
                          <MoreHorizontal size={18} />
                        </Link>
                        {(userRole === 'admin' || userRole === 'club') && (
                          <button
                            onClick={() => eliminarJugador(j.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {jugadoresPagina.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--texto-terciario)' }}>
                      No se encontraron jugadores con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Contenido para Cuerpo Técnico */}
        {pestanaActiva === 'tecnico' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>Cuerpo Técnico</h3>
              {(userRole === 'admin' || userRole === 'club') && (
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: '#2980B9' }} onClick={agregarTecnico}>
                  <Plus size={16} /> Agregar Miembro
                </button>
              )}
            </div>
            <div className="tabla-responsive">
              <table className="w-full">
                <thead>
                  <tr style={{ borderTop: '1px solid var(--borde-suave)' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Cargo</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tecnicos.map((t) => (
                    <tr key={t.id} style={{ borderTop: '1px solid var(--borde-suave)' }}>
                      <td className="px-6 py-3 text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>{t.nombre}</td>
                      <td className="px-6 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{t.cargo}</td>
                      <td className="px-6 py-3 text-center">
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" onClick={() => eliminarTecnico(t.id)}><X size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {tecnicos.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--texto-terciario)' }}>No hay miembros registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contenido para Staff Médico */}
        {pestanaActiva === 'medico' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>Staff Médico</h3>
              {(userRole === 'admin' || userRole === 'club') && (
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: '#27AE60' }} onClick={agregarMedico}>
                  <Plus size={16} /> Agregar Miembro
                </button>
              )}
            </div>
            <div className="tabla-responsive">
              <table className="w-full">
                <thead>
                  <tr style={{ borderTop: '1px solid var(--borde-suave)' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Cargo</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicos.map((m) => (
                    <tr key={m.id} style={{ borderTop: '1px solid var(--borde-suave)' }}>
                      <td className="px-6 py-3 text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>{m.nombre}</td>
                      <td className="px-6 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{m.cargo}</td>
                      <td className="px-6 py-3 text-center">
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" onClick={() => eliminarMedico(m.id)}><X size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {medicos.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--texto-terciario)' }}>No hay miembros registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginación */}
        {pestanaActiva === 'jugadores' && totalPaginas > 1 && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: '1px solid var(--borde-suave)' }}
          >
            <p className="text-sm" style={{ color: 'var(--texto-secundario)' }}>
              Mostrando {((paginaActual - 1) * elementosPorPagina) + 1} a {Math.min(paginaActual * elementosPorPagina, jugadoresFiltrados.length)} de {jugadoresFiltrados.length} jugadores
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-40"
                style={{
                  background: 'var(--fondo-principal)',
                  border: '1px solid var(--borde-suave)',
                  color: 'var(--texto-secundario)',
                }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPaginaActual(p)}
                  className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    background: paginaActual === p ? '#2980B9' : 'var(--fondo-principal)',
                    color: paginaActual === p ? 'white' : 'var(--texto-secundario)',
                    border: paginaActual === p ? 'none' : '1px solid var(--borde-suave)',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-2 rounded-lg transition-colors disabled:opacity-40"
                style={{
                  background: 'var(--fondo-principal)',
                  border: '1px solid var(--borde-suave)',
                  color: 'var(--texto-secundario)',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
