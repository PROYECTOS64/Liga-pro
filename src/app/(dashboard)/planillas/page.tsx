'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Search, Filter, Plus, Calendar, Clock, ChevronLeft, ChevronRight,
  Eye, Lock, AlertTriangle, X, Timer
} from 'lucide-react';

// ============================================
// DATOS DE EJEMPLO
// ============================================
const planillasData = [
  {
    id: '1', local: 'Barcelona SC', visitante: 'Emelec', fecha: '25/05/2026', hora: '15:30',
    jornada: 16, estado: 'BORRADOR', estadio: 'Monumental', countdown: null,
  },
  {
    id: '2', local: 'LDU Quito', visitante: 'El Nacional', fecha: '25/05/2026', hora: '18:00',
    jornada: 16, estado: 'ENVIADA', estadio: 'Casa Blanca', countdown: null,
  },
  {
    id: '3', local: 'Independiente del Valle', visitante: 'Aucas', fecha: '26/05/2026', hora: '12:00',
    jornada: 16, estado: 'BORRADOR', estadio: 'Rumiñahui', countdown: '45:30',
  },
  {
    id: '4', local: 'Deportivo Cuenca', visitante: 'Mushuc Runa', fecha: '26/05/2026', hora: '15:30',
    jornada: 16, estado: 'ENVIADA', estadio: 'Alejandro Serrano Aguilar', countdown: null,
  },
  {
    id: '5', local: 'Emelec', visitante: 'LDU Quito', fecha: '18/05/2026', hora: '16:00',
    jornada: 15, estado: 'BLOQUEADA', estadio: 'George Capwell', countdown: null,
  },
  {
    id: '6', local: 'El Nacional', visitante: 'Barcelona SC', fecha: '18/05/2026', hora: '19:00',
    jornada: 15, estado: 'BLOQUEADA', estadio: 'Olímpico Atahualpa', countdown: null,
  },
  {
    id: '7', local: 'Aucas', visitante: 'Deportivo Cuenca', fecha: '17/05/2026', hora: '15:00',
    jornada: 15, estado: 'BLOQUEADA', estadio: 'Gonzalo Pozo Ripalda', countdown: null,
  },
  {
    id: '8', local: 'Mushuc Runa', visitante: 'Independiente del Valle', fecha: '17/05/2026', hora: '12:00',
    jornada: 15, estado: 'BLOQUEADA', estadio: 'Echaleche', countdown: null,
  },
];

const jornadas = ['Todas', '15', '16'];
const estadosFiltro = ['Todos', 'BORRADOR', 'ENVIADA', 'BLOQUEADA'];

function InsigniaPlanilla({ estado }: { estado: string }) {
  const estilos: Record<string, { bg: string; text: string; icono: React.ReactNode }> = {
    BORRADOR: { bg: '#FEF3C7', text: '#92400E', icono: <FileText size={12} /> },
    ENVIADA: { bg: '#DEF7EC', text: '#03543F', icono: <Clock size={12} /> },
    BLOQUEADA: { bg: '#E5E7EB', text: '#374151', icono: <Lock size={12} /> },
  };
  const estilo = estilos[estado] || estilos.BORRADOR;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: estilo.bg, color: estilo.text }}
    >
      {estilo.icono}
      {estado}
    </span>
  );
}

export default function PaginaPlanillas() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroJornada, setFiltroJornada] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [partidosPlanillas, setPartidosPlanillas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [now, setNow] = useState(new Date());

  const elementosPorPagina = 6;

  useEffect(() => {
    // Actualizar reloj cada minuto para el T-70
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchPlanillas() {
      const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
      
      const { data: partidos, error } = await supabase
        .from('partidos')
        .select(`
          id,
          jornada,
          fecha_hora,
          estado,
          estadio:estadios(nombre),
          local:clubes!partidos_club_local_id_fkey(nombre),
          visitante:clubes!partidos_club_visitante_id_fkey(nombre),
          planillas (
            id,
            estado
          )
        `)
        .order('fecha_hora', { ascending: false });

      if (partidos) {
        // Formatear datos para la tabla
        const formateados = partidos.map(p => {
          // Asumiremos que si hay una planilla, tomamos su estado
          const estadoPlanilla = p.planillas && p.planillas.length > 0 ? p.planillas[0].estado : 'BORRADOR';
          const fechaObj = new Date(p.fecha_hora);
          
          // Lógica T-70
          const diffMs = fechaObj.getTime() - now.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          
          let estadoFinal = estadoPlanilla;
          let countdown = null;
          
          if (diffMins <= 70 && diffMins > 0) {
            estadoFinal = 'BLOQUEADA';
          } else if (diffMins > 70 && diffMins <= 120) {
            const minsTo70 = diffMins - 70;
            countdown = `${Math.floor(minsTo70 / 60)}h ${minsTo70 % 60}m`;
          }

          return {
            id: p.id,
            local: p.local?.nombre || 'Desconocido',
            visitante: p.visitante?.nombre || 'Desconocido',
            fecha: fechaObj.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            hora: fechaObj.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
            jornada: p.jornada,
            estado: estadoFinal,
            estadio: p.estadio?.nombre || 'Sin estadio',
            countdown,
            planillaId: p.planillas && p.planillas.length > 0 ? p.planillas[0].id : null,
          };
        });
        setPartidosPlanillas(formateados);
      }
      setCargando(false);
    }
    fetchPlanillas();
  }, []);

  const planillasFiltradas = useMemo(() => {
    return partidosPlanillas.filter((p) => {
      const coincideBusqueda =
        p.local.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.visitante.toLowerCase().includes(busqueda.toLowerCase());
      const coincideJornada = filtroJornada === 'Todas' || p.jornada.toString() === filtroJornada;
      const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
      return coincideBusqueda && coincideJornada && coincideEstado;
    });
  }, [busqueda, filtroJornada, filtroEstado, partidosPlanillas]);

  const totalPaginas = Math.ceil(planillasFiltradas.length / elementosPorPagina);
  const planillasPagina = planillasFiltradas.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  const filtrosActivos = filtroJornada !== 'Todas' || filtroEstado !== 'Todos';

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroJornada('Todas');
    setFiltroEstado('Todos');
    setPaginaActual(1);
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
            Planillas de Juego
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
            Gestión y control de planillas de partido
          </p>
        </div>
        <Link
          href="/planillas/nueva"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white no-underline transition-all"
          style={{ background: 'linear-gradient(135deg, #C0392B, #96281B)' }}
        >
          <Plus size={16} />
          Nueva Planilla
        </Link>
      </div>

      {/* KPI resumen rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { titulo: 'Borradores', valor: partidosPlanillas.filter((p) => p.estado === 'BORRADOR').length, color: '#D4A843', fondo: '#FEF3C7' },
          { titulo: 'Enviadas', valor: partidosPlanillas.filter((p) => p.estado === 'ENVIADA').length, color: '#27AE60', fondo: '#DEF7EC' },
          { titulo: 'Bloqueadas', valor: partidosPlanillas.filter((p) => p.estado === 'BLOQUEADA').length, color: '#6B7280', fondo: '#F3F4F6' },
        ].map((kpi) => (
          <div
            key={kpi.titulo}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: 'var(--fondo-tarjeta)',
              boxShadow: 'var(--sombra-tarjeta)',
              border: '1px solid var(--borde-suave)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: '44px', height: '44px', background: kpi.fondo }}
            >
              <FileText size={20} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--texto-primario)' }}>{kpi.valor}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>{kpi.titulo}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Panel principal */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3.5"
          style={{ background: 'linear-gradient(135deg, #C0392B, #96281B)' }}
        >
          <FileText size={20} className="text-white" />
          <h2 className="text-white font-semibold text-sm">Listado de Planillas</h2>
        </div>

        {/* Filtros */}
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
              <input
                type="text"
                placeholder="Buscar por equipo..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--fondo-principal)',
                  border: '1px solid var(--borde-suave)',
                  color: 'var(--texto-primario)',
                }}
              />
            </div>
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
            </button>
            {filtrosActivos && (
              <button onClick={limpiarFiltros} className="flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: '#C0392B' }}>
                <X size={14} /> Limpiar
              </button>
            )}
          </div>

          {mostrarFiltros && (
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg animate-slide-up"
              style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }}
            >
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--texto-secundario)' }}>Jornada</label>
                <select
                  value={filtroJornada}
                  onChange={(e) => { setFiltroJornada(e.target.value); setPaginaActual(1); }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}
                >
                  {jornadas.map((j) => <option key={j} value={j}>{j === 'Todas' ? 'Todas las jornadas' : `Jornada ${j}`}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--texto-secundario)' }}>Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}
                >
                  {estadosFiltro.map((e) => <option key={e} value={e}>{e === 'Todos' ? 'Todos los estados' : e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--texto-secundario)' }}>Rango de Fechas</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="tabla-responsive">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Partido</th>
                <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Jornada</th>
                <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Fecha</th>
                <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Hora</th>
                <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Estado</th>
                <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>T-70</th>
                <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planillasPagina.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors"
                  style={{ borderTop: '1px solid var(--borde-suave)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--fondo-principal)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>{p.local}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--ligapro-navy)', color: 'white' }}>vs</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>{p.visitante}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--texto-terciario)' }}>{p.estadio}</p>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>
                    J{p.jornada}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: 'var(--texto-secundario)' }}>
                      <Calendar size={14} />
                      {p.fecha}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: 'var(--texto-secundario)' }}>
                      <Clock size={14} />
                      {p.hora}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <InsigniaPlanilla estado={p.estado} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.countdown ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Timer size={14} style={{ color: '#C0392B' }} className="animate-pulso" />
                        <span className="text-xs font-bold" style={{ color: '#C0392B' }}>{p.countdown}</span>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={p.planillaId ? `/planillas/${p.planillaId}` : `/planillas/nueva?partidoId=${p.id}`}
                        className="p-2 rounded-lg transition-colors inline-flex"
                        style={{ color: 'var(--ligapro-blue)' }}
                        title={p.planillaId ? "Ver planilla" : "Crear planilla"}
                      >
                        {p.planillaId ? <Eye size={16} /> : <Plus size={16} />}
                      </Link>
                      {p.estado === 'BORRADOR' && (
                        <Link
                          href={p.planillaId ? `/planillas/${p.planillaId}` : `/planillas/nueva?partidoId=${p.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all text-white"
                          style={{ background: 'linear-gradient(135deg, #C0392B, #96281B)' }}
                        >
                          {p.planillaId ? 'Editar' : 'Completar'}
                        </Link>
                      )}
                      {p.estado === 'BLOQUEADA' && (
                        <Lock size={14} style={{ color: 'var(--texto-terciario)' }} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {planillasPagina.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--texto-terciario)' }}>
                    No se encontraron planillas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--borde-suave)' }}>
            <p className="text-sm" style={{ color: 'var(--texto-secundario)' }}>
              Mostrando {((paginaActual - 1) * elementosPorPagina) + 1} a {Math.min(paginaActual * elementosPorPagina, planillasFiltradas.length)} de {planillasFiltradas.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-40"
                style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-secundario)' }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPaginaActual(p)}
                  className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    background: paginaActual === p ? '#C0392B' : 'var(--fondo-principal)',
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
                style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-secundario)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Aviso T-70 */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}
      >
        <AlertTriangle size={20} style={{ color: '#D97706' }} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#92400E' }}>Regla T-70</p>
          <p className="text-xs mt-0.5" style={{ color: '#B45309' }}>
            Las planillas se bloquean automáticamente 70 minutos antes del inicio del partido. Asegúrese de enviar la planilla antes de este límite.
          </p>
        </div>
      </div>
    </div>
  );
}
