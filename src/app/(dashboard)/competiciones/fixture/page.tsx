'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, ChevronLeft, ChevronRight, MapPin, Clock,
  Trophy, Filter, Search, ArrowLeft, CheckCircle2,
  AlertCircle, PlayCircle, Eye, Loader2
} from 'lucide-react';

interface ClubData {
  nombre: string;
  abreviatura: string;
  color_principal: string;
  color_secundario: string;
  estadio?: {
    nombre: string;
    ciudad: string;
  };
}

interface Partido {
  id: string;
  jornada: number;
  fecha_hora: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: 'FINALIZADO' | 'EN_CURSO' | 'PROGRAMADO' | 'SUSPENDIDO';
  arbitro: string;
  local: ClubData;
  visitante: ClubData;
}

// Colores de estado
const estadoConfig: Record<string, { bg: string; text: string; label: string; icono: typeof CheckCircle2 }> = {
  FINALIZADO: { bg: '#E5E7EB', text: '#374151', label: 'Finalizado', icono: CheckCircle2 },
  EN_CURSO: { bg: '#DEF7EC', text: '#03543F', label: 'En Curso', icono: PlayCircle },
  PROGRAMADO: { bg: '#DBEAFE', text: '#1E40AF', label: 'Programado', icono: Clock },
  SUSPENDIDO: { bg: '#FEE2E2', text: '#991B1B', label: 'Suspendido', icono: AlertCircle },
};

export default function PaginaFixture() {
  const [competiciones, setCompeticiones] = useState<any[]>([]);
  const [competicionSeleccionada, setCompeticionSeleccionada] = useState<string>('');
  const [partidosData, setPartidosData] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);

  const [jornadaSeleccionada, setJornadaSeleccionada] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    setAnimado(true);
    async function fetchCompeticiones() {
      try {
        const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
        const { data, error } = await supabase
          .from('competiciones')
          .select('*')
          .order('temporada', { ascending: false });

        if (data && data.length > 0) {
          setCompeticiones(data);
          setCompeticionSeleccionada(data[0].id); // Primera competición por defecto
        } else {
          setCargando(false);
        }
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setCargando(false);
      }
    }
    fetchCompeticiones();
  }, []);

  useEffect(() => {
    if (!competicionSeleccionada) return;

    async function fetchPartidos() {
      setCargando(true);
      try {
        const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
        const { data, error } = await supabase
          .from('partidos')
          .select(`
            *,
            arbitro:arbitro_principal,
            local:club_local_id (
              nombre,
              abreviatura,
              color_principal,
              color_secundario,
              estadio:estadio_id ( nombre, ciudad )
            ),
            visitante:club_visitante_id (
              nombre,
              abreviatura,
              color_principal,
              color_secundario
            )
          `)
          .eq('competicion_id', competicionSeleccionada)
          .order('jornada', { ascending: true })
          .order('fecha_hora', { ascending: true });

        if (data) {
          setPartidosData(data as unknown as Partido[]);
          
          // Buscar primera jornada no finalizada
          const primerNoFin = data.find((p: any) => p.estado !== 'FINALIZADO');
          if (primerNoFin) {
            setJornadaSeleccionada(primerNoFin.jornada);
          } else if (data.length > 0) {
            setJornadaSeleccionada(Math.max(...data.map((p: any) => p.jornada)));
          } else {
            setJornadaSeleccionada(1);
          }
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setCargando(false);
      }
    }
    fetchPartidos();
  }, [competicionSeleccionada]);

  const competicionInfo = competiciones.find(c => c.id === competicionSeleccionada);
  const maxJornadas = competicionInfo?.serie === 'A' ? 30 : 36;
  const jornadasDisponibles = [...new Set(partidosData.map(p => p.jornada))].sort((a, b) => a - b);

  const partidosFiltrados = partidosData.filter((p) => {
    const coincideJornada = p.jornada === jornadaSeleccionada;
    const coincideEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
    const coincideBusqueda =
      busqueda === '' ||
      p.local.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.visitante.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.local.estadio?.nombre || '').toLowerCase().includes(busqueda.toLowerCase());
    return coincideJornada && coincideEstado && coincideBusqueda;
  });

  // Agrupar por fecha limpia (YYYY-MM-DD)
  const partidosPorFecha = partidosFiltrados.reduce<Record<string, Partido[]>>((acc, partido) => {
    const fechaLimpia = partido.fecha_hora.split('T')[0];
    if (!acc[fechaLimpia]) acc[fechaLimpia] = [];
    acc[fechaLimpia].push(partido);
    return acc;
  }, {});

  // Resumen de la jornada
  const partidosJornada = partidosData.filter(p => p.jornada === jornadaSeleccionada);
  const finalizados = partidosJornada.filter(p => p.estado === 'FINALIZADO').length;
  const programados = partidosJornada.filter(p => p.estado === 'PROGRAMADO').length;
  const totalGoles = partidosJornada
    .filter(p => p.goles_local !== null)
    .reduce((s, p) => s + (p.goles_local || 0) + (p.goles_visitante || 0), 0);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Cabecera */}
      <div className={`transition-all duration-500 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <Link
          href="/competiciones"
          className="inline-flex items-center gap-2 text-sm font-medium no-underline mb-4 transition-colors"
          style={{ color: 'var(--texto-secundario)' }}
        >
          <ArrowLeft size={16} />
          Volver a Competiciones
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--texto-primario)' }}>
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: '42px', height: '42px', background: '#DBEAFE' }}
              >
                <Calendar size={22} style={{ color: '#2980B9' }} />
              </div>
              Fixture del Campeonato
            </h1>
            <p className="text-sm mt-1 ml-[54px]" style={{ color: 'var(--texto-secundario)' }}>
              {competicionInfo ? `${competicionInfo.nombre} • Calendario de partidos` : 'Calendario de partidos'}
            </p>
          </div>

          {/* Selector de competición */}
          <div className="flex items-center gap-2">
            <Trophy size={16} style={{ color: '#D4A843' }} />
            <select
              value={competicionSeleccionada}
              onChange={(e) => setCompeticionSeleccionada(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm font-semibold border focus:ring-2 focus:ring-[#2980B9]/30 outline-none"
              style={{
                background: 'var(--fondo-tarjeta)',
                borderColor: 'var(--borde-suave)',
                color: 'var(--texto-primario)'
              }}
            >
              {competiciones.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.temporada})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
          <Loader2 className="animate-spin text-[#2980B9]" size={36} />
          <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Cargando fixture...</p>
        </div>
      ) : (
        <>
          {/* KPIs de jornada */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { titulo: 'Total Partidos', valor: partidosJornada.length.toString(), color: '#2980B9', bg: '#DBEAFE' },
              { titulo: 'Finalizados', valor: finalizados.toString(), color: '#27AE60', bg: '#DEF7EC' },
              { titulo: 'Programados', valor: programados.toString(), color: '#D4A843', bg: '#FEF3C7' },
              { titulo: 'Goles Totales', valor: totalGoles.toString(), color: '#C0392B', bg: '#FEE2E2' },
            ].map((kpi, i) => (
              <div
                key={kpi.titulo}
                className={`p-4 rounded-xl transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
                style={{
                  background: 'var(--fondo-tarjeta)',
                  boxShadow: 'var(--sombra-tarjeta)',
                  border: '1px solid var(--borde-suave)',
                  animationDelay: `${100 + i * 80}ms`,
                  animationFillMode: 'both',
                }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>{kpi.titulo}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: kpi.color }}>{kpi.valor}</p>
              </div>
            ))}
          </div>

          {/* Selector de jornada y filtros */}
          <div
            className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
            style={{
              background: 'var(--fondo-tarjeta)',
              boxShadow: 'var(--sombra-tarjeta)',
              border: '1px solid var(--borde-suave)',
              animationDelay: '300ms',
              animationFillMode: 'both',
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                background: competicionInfo?.serie === 'A' 
                  ? 'linear-gradient(135deg, #D4A843, #B8922F)' 
                  : 'linear-gradient(135deg, #2980B9, #1F6691)'
              }}
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-white" />
                <h2 className="text-white font-semibold text-sm">Jornada {jornadaSeleccionada}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setJornadaSeleccionada(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  disabled={jornadaSeleccionada <= 1}
                >
                  <ChevronLeft size={18} />
                </button>
                <select
                  value={jornadaSeleccionada}
                  onChange={(e) => setJornadaSeleccionada(Number(e.target.value))}
                  className="px-3 py-1 rounded-lg text-sm font-medium border-none outline-none"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  {Array.from({ length: maxJornadas }, (_, i) => i + 1).map(j => (
                    <option key={j} value={j} style={{ color: '#1A1A2E' }}>Jornada {j}</option>
                  ))}
                </select>
                <button
                  onClick={() => setJornadaSeleccionada(prev => Math.min(maxJornadas, prev + 1))}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  disabled={jornadaSeleccionada >= maxJornadas}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--borde-suave)' }}>
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
                <input
                  type="text"
                  placeholder="Buscar equipo o estadio..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#2980B9]/30"
                  style={{ background: 'var(--fondo-principal)', borderColor: 'var(--borde-suave)', color: 'var(--texto-primario)' }}
                />
              </div>

              {/* Filtro de estado */}
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: 'var(--texto-secundario)' }} />
                {['TODOS', 'FINALIZADO', 'PROGRAMADO'].map(estado => (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: filtroEstado === estado ? '#2980B9' : 'var(--fondo-principal)',
                      color: filtroEstado === estado ? 'white' : 'var(--texto-secundario)',
                      border: `1px solid ${filtroEstado === estado ? '#2980B9' : 'var(--borde-suave)'}`,
                    }}
                  >
                    {estado === 'TODOS' ? 'Todos' : estado === 'FINALIZADO' ? 'Finalizados' : 'Programados'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de partidos agrupados por fecha */}
            <div className="p-4 space-y-6">
              {Object.keys(partidosPorFecha).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Calendar size={48} style={{ color: 'var(--texto-terciario)' }} />
                  <p className="text-sm font-medium mt-4" style={{ color: 'var(--texto-secundario)' }}>
                    No hay partidos para esta jornada
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--texto-terciario)' }}>
                    Selecciona otra jornada o ajusta los filtros
                  </p>
                </div>
              ) : (
                Object.entries(partidosPorFecha).sort().map(([fecha, partidos]) => (
                  <div key={fecha}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={14} style={{ color: 'var(--texto-terciario)' }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>
                        {new Date(fecha + 'T12:00:00').toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {partidos.map((partido) => {
                        const config = estadoConfig[partido.estado] || { bg: '#E5E7EB', text: '#374151', label: partido.estado, icono: CheckCircle2 };
                        const IconoEstado = config.icono;
                        const localColor = partido.local.color_principal || '#A0AEC0';
                        const visitanteColor = partido.visitante.color_principal || '#A0AEC0';

                        return (
                          <div
                            key={partido.id}
                            className="rounded-xl p-4 transition-all hover:shadow-md group"
                            style={{
                              border: '1px solid var(--borde-suave)',
                              background: partido.estado === 'EN_CURSO' ? 'rgba(39, 174, 96, 0.03)' : 'var(--fondo-tarjeta)',
                            }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              {/* Hora */}
                              <div className="flex items-center gap-2 min-w-[80px]">
                                <Clock size={14} style={{ color: 'var(--texto-terciario)' }} />
                                <span className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>
                                  {new Date(partido.fecha_hora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                              </div>

                              {/* Equipos */}
                              <div className="flex items-center gap-3 flex-1">
                                {/* Local */}
                                <div className="flex items-center gap-2 flex-1 justify-end">
                                  <span className="text-sm font-semibold text-right" style={{ color: 'var(--texto-primario)' }}>
                                    {partido.local.nombre}
                                  </span>
                                  <div
                                    className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                                    style={{
                                      width: '32px', height: '32px',
                                      background: localColor,
                                      color: localColor === '#FFFFFF' || localColor === '#FFD700' || localColor === '#F1C40F' ? '#1A1A2E' : 'white',
                                      border: localColor === '#FFFFFF' ? '2px solid #E5E7EB' : 'none',
                                    }}
                                  >
                                    {partido.local.abreviatura}
                                  </div>
                                </div>

                                {/* Marcador */}
                                <div
                                  className="flex items-center justify-center rounded-lg px-4 py-2 min-w-[70px]"
                                  style={{
                                    background: partido.estado === 'FINALIZADO' ? 'var(--ligapro-navy)' : 'var(--fondo-principal)',
                                    color: partido.estado === 'FINALIZADO' ? 'white' : 'var(--texto-secundario)',
                                  }}
                                >
                                  <span className="text-sm font-bold">
                                    {partido.goles_local !== null ? `${partido.goles_local} - ${partido.goles_visitante}` : 'vs'}
                                  </span>
                                </div>

                                {/* Visitante */}
                                <div className="flex items-center gap-2 flex-1">
                                  <div
                                    className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                                    style={{
                                      width: '32px', height: '32px',
                                      background: visitanteColor,
                                      color: visitanteColor === '#FFFFFF' || visitanteColor === '#FFD700' || visitanteColor === '#F1C40F' ? '#1A1A2E' : 'white',
                                      border: visitanteColor === '#FFFFFF' ? '2px solid #E5E7EB' : 'none',
                                    }}
                                  >
                                    {partido.visitante.abreviatura}
                                  </div>
                                  <span className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
                                    {partido.visitante.nombre}
                                  </span>
                                </div>
                              </div>

                              {/* Info adicional */}
                              <div className="flex items-center gap-3 min-w-[200px] justify-end">
                                <span
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                  style={{ background: config.bg, color: config.text }}
                                >
                                  <IconoEstado size={12} />
                                  {config.label}
                                </span>
                              </div>
                            </div>

                            {/* Info de estadio */}
                            <div className="flex items-center gap-4 mt-3 ml-[96px]">
                              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--texto-terciario)' }}>
                                <MapPin size={12} />
                                {partido.local.estadio?.nombre || 'Por definir'}
                              </span>
                              <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                                {partido.local.estadio?.ciudad || ''}
                              </span>
                              {partido.arbitro && partido.arbitro !== 'Por definir' && (
                                <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                                  Árbitro: {partido.arbitro}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Navegación rápida de jornadas */}
          {jornadasDisponibles.length > 0 && (
            <div
              className="rounded-xl p-4"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>
                Navegación Rápida
              </p>
              <div className="flex flex-wrap gap-2">
                {jornadasDisponibles.map(j => (
                  <button
                    key={j}
                    onClick={() => setJornadaSeleccionada(j)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: jornadaSeleccionada === j ? '#2980B9' : 'var(--fondo-principal)',
                      color: jornadaSeleccionada === j ? 'white' : 'var(--texto-secundario)',
                      border: `1px solid ${jornadaSeleccionada === j ? '#2980B9' : 'var(--borde-suave)'}`,
                    }}
                  >
                    J{j}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
