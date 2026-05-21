'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy, Plus, Calendar, Users, ChevronRight,
  Search, Filter, Shield, Clock, CheckCircle2,
  AlertCircle, Star
} from 'lucide-react';

// ============================================
// DATOS DE EJEMPLO - Competiciones
// ============================================
interface Competicion {
  id: string;
  nombre: string;
  temporada: string;
  fase: string;
  estado: 'ACTIVA' | 'FINALIZADA' | 'PROGRAMADA' | 'SUSPENDIDA';
  serie: 'A' | 'B';
  equipos: number;
  fechaInicio: string;
  fechaFin: string;
  jornadaActual: number;
  totalJornadas: number;
  descripcion: string;
}

const competicionesData: Competicion[] = [
  {
    id: 'serie-a-2026',
    nombre: 'Serie A - LigaPro',
    temporada: '2026',
    fase: 'FASE_UNO',
    estado: 'ACTIVA',
    serie: 'A',
    equipos: 16,
    fechaInicio: '2026-02-14',
    fechaFin: '2026-12-08',
    jornadaActual: 15,
    totalJornadas: 30,
    descripcion: 'Primera división del fútbol profesional ecuatoriano',
  },
  {
    id: 'serie-b-2026',
    nombre: 'Serie B - LigaPro',
    temporada: '2026',
    fase: 'CLASIFICACION',
    estado: 'ACTIVA',
    serie: 'B',
    equipos: 10,
    fechaInicio: '2026-03-01',
    fechaFin: '2026-11-22',
    jornadaActual: 12,
    totalJornadas: 36,
    descripcion: 'Segunda división del fútbol profesional ecuatoriano',
  },
  {
    id: 'serie-a-2025',
    nombre: 'Serie A - LigaPro',
    temporada: '2025',
    fase: 'FASE_DOS',
    estado: 'FINALIZADA',
    serie: 'A',
    equipos: 16,
    fechaInicio: '2025-02-15',
    fechaFin: '2025-12-07',
    jornadaActual: 30,
    totalJornadas: 30,
    descripcion: 'Campeonato finalizado - Campeón: Independiente del Valle',
  },
  {
    id: 'serie-b-2025',
    nombre: 'Serie B - LigaPro',
    temporada: '2025',
    fase: 'CLASIFICACION',
    estado: 'FINALIZADA',
    serie: 'B',
    equipos: 10,
    fechaInicio: '2025-03-01',
    fechaFin: '2025-11-20',
    jornadaActual: 36,
    totalJornadas: 36,
    descripcion: 'Campeonato finalizado - Ascendidos: 2 equipos',
  },
];

// Mapa de etiquetas de fase
const etiquetasFase: Record<string, string> = {
  FASE_UNO: 'Fase Uno',
  FASE_DOS: 'Fase Dos',
  CLASIFICACION: 'Clasificación',
  PLAYOFF: 'Playoff',
  FINAL: 'Final',
};

// Colores de estado
const coloresEstado: Record<string, { bg: string; text: string; icono: typeof CheckCircle2 }> = {
  EN_CURSO: { bg: '#DEF7EC', text: '#03543F', icono: CheckCircle2 },
  FINALIZADA: { bg: '#E5E7EB', text: '#374151', icono: Clock },
  PLANIFICADA: { bg: '#DBEAFE', text: '#1E40AF', icono: Calendar },
  SUSPENDIDA: { bg: '#FEE2E2', text: '#991B1B', icono: AlertCircle },
};

type TabFiltro = 'TODAS' | 'A' | 'B';

export default function PaginaCompeticiones() {
  const [tabActiva, setTabActiva] = useState<TabFiltro>('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [animado, setAnimado] = useState(false);
  const [competiciones, setCompeticiones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setAnimado(true);
    async function fetchCompeticiones() {
      const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
      const { data, error } = await supabase
        .from('competiciones')
        .select('*')
        .order('temporada', { ascending: false });

      if (data) {
        setCompeticiones(data);
      }
      setCargando(false);
    }
    fetchCompeticiones();
  }, []);

  const competicionesFiltradas = competiciones.filter((c) => {
    const coincideSerie = tabActiva === 'TODAS' || c.serie === tabActiva;
    const coincideBusqueda =
      busqueda === '' ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.temporada.toString().includes(busqueda);
    return coincideSerie && coincideBusqueda;
  });

  const tabs: { valor: TabFiltro; etiqueta: string }[] = [
    { valor: 'TODAS', etiqueta: 'Todas' },
    { valor: 'A', etiqueta: 'Serie A' },
    { valor: 'B', etiqueta: 'Serie B' },
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Cabecera */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--texto-primario)' }}>
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: '42px', height: '42px', background: '#FEF3C7' }}
            >
              <Trophy size={22} style={{ color: '#D4A843' }} />
            </div>
            Competiciones
          </h1>
          <p className="text-sm mt-1 ml-[54px]" style={{ color: 'var(--texto-secundario)' }}>
            Gestión de campeonatos y torneos de LigaPro Ecuador
          </p>
        </div>
        <Link
          href="/competiciones/nueva"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 no-underline"
          style={{ background: 'linear-gradient(135deg, #D4A843, #B8922F)' }}
        >
          <Plus size={18} />
          Nueva Competición
        </Link>
      </div>

      {/* Barra de filtros y tabs */}
      <div
        className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
          animationDelay: '100ms',
          animationFillMode: 'both',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--fondo-principal)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.valor}
                onClick={() => setTabActiva(tab.valor)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tabActiva === tab.valor ? 'var(--fondo-tarjeta)' : 'transparent',
                  color: tabActiva === tab.valor ? 'var(--texto-primario)' : 'var(--texto-secundario)',
                  boxShadow: tabActiva === tab.valor ? 'var(--sombra-tarjeta)' : 'none',
                }}
              >
                {tab.etiqueta}
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
              <input
                type="text"
                placeholder="Buscar competición..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#D4A843]/30"
                style={{
                  background: 'var(--fondo-principal)',
                  borderColor: 'var(--borde-suave)',
                  color: 'var(--texto-primario)',
                  width: '220px',
                }}
              />
            </div>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                border: '1px solid var(--borde-suave)',
                color: 'var(--texto-secundario)',
                background: 'var(--fondo-principal)',
              }}
            >
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { titulo: 'Competiciones Activas', valor: '2', color: '#27AE60', bg: '#DEF7EC', icono: CheckCircle2 },
          { titulo: 'Partidos Jugados', valor: '128', color: '#2980B9', bg: '#DBEAFE', icono: Calendar },
          { titulo: 'Equipos Participantes', valor: '26', color: '#D4A843', bg: '#FEF3C7', icono: Shield },
        ].map((kpi, i) => {
          const Icono = kpi.icono;
          return (
            <div
              key={kpi.titulo}
              className={`flex items-center gap-4 p-5 rounded-xl transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
                animationDelay: `${200 + i * 80}ms`,
                animationFillMode: 'both',
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: '48px', height: '48px', background: kpi.bg }}
              >
                <Icono size={22} style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--texto-secundario)' }}>{kpi.titulo}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--texto-primario)' }}>{kpi.valor}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de competiciones */}
      <div className="space-y-4">
        {competicionesFiltradas.map((comp, i) => {
          const estadoConfig = coloresEstado[comp.estado];
          const IconoEstado = estadoConfig.icono;
          const progreso = Math.round((comp.jornadaActual / comp.totalJornadas) * 100);

          return (
            <Link
              key={comp.id}
              href={`/competiciones/${comp.id}`}
              className="block no-underline group"
            >
              <div
                className={`rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
                style={{
                  background: 'var(--fondo-tarjeta)',
                  boxShadow: 'var(--sombra-tarjeta)',
                  border: '1px solid var(--borde-suave)',
                  animationDelay: `${400 + i * 100}ms`,
                  animationFillMode: 'both',
                }}
              >
                {/* Header de la tarjeta */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{
                    background: comp.serie === 'A'
                      ? 'linear-gradient(135deg, #D4A843, #B8922F)'
                      : 'linear-gradient(135deg, #2980B9, #1F6691)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Trophy size={20} className="text-white" />
                    <div>
                      <h3 className="text-white font-semibold text-sm">{comp.nombre}</h3>
                      <p className="text-white/70 text-xs">Temporada {comp.temporada}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                    >
                      <Star size={12} />
                      Serie {comp.serie}
                    </span>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Info principal */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Estado */}
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: estadoConfig?.bg || '#E5E7EB', color: estadoConfig?.text || '#374151' }}
                      >
                        {IconoEstado && <IconoEstado size={14} />}
                        {comp.estado === 'EN_CURSO' ? 'En Curso' : comp.estado === 'FINALIZADA' ? 'Finalizada' : comp.estado === 'PLANIFICADA' ? 'Planificada' : 'Suspendida'}
                      </span>

                      {/* Fase */}
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: '#F3F4F6', color: 'var(--texto-primario)' }}
                      >
                        {etiquetasFase[comp.fase] || comp.fase}
                      </span>

                      {/* Equipos */}
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--texto-secundario)' }}>
                        <Users size={14} />
                        {comp.equipos} equipos
                      </span>

                      {/* Fechas */}
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--texto-secundario)' }}>
                        <Calendar size={14} />
                        {new Date(comp.fechaInicio).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} — {new Date(comp.fechaFin).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <ChevronRight size={20} style={{ color: 'var(--texto-terciario)' }} className="hidden sm:block" />
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>
                        Jornada {comp.jornadaActual} de {comp.totalJornadas}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--texto-primario)' }}>
                        {progreso}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: 'var(--fondo-principal)' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${progreso}%`,
                          background: comp.serie === 'A'
                            ? 'linear-gradient(90deg, #D4A843, #B8922F)'
                            : 'linear-gradient(90deg, #2980B9, #1F6691)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-xs mt-3" style={{ color: 'var(--texto-terciario)' }}>
                    {comp.descripcion}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mensaje vacío */}
      {competicionesFiltradas.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
          }}
        >
          <Trophy size={48} style={{ color: 'var(--texto-terciario)' }} />
          <p className="text-sm font-medium mt-4" style={{ color: 'var(--texto-secundario)' }}>
            No se encontraron competiciones
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--texto-terciario)' }}>
            Intenta cambiar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
