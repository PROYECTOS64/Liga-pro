'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, ChevronLeft, ChevronRight, MapPin, Clock,
  Trophy, Filter, Search, ArrowLeft, CheckCircle2,
  AlertCircle, PlayCircle, Eye
} from 'lucide-react';

// ============================================
// DATOS DE EJEMPLO - Fixture completo
// ============================================
interface Partido {
  id: string;
  jornada: number;
  local: string;
  abrevLocal: string;
  colorLocal: string;
  visitante: string;
  abrevVisitante: string;
  colorVisitante: string;
  golLocal: number | null;
  golVisitante: number | null;
  fecha: string;
  hora: string;
  estadio: string;
  ciudad: string;
  estado: 'FINALIZADO' | 'EN_CURSO' | 'PROGRAMADO' | 'SUSPENDIDO';
  arbitro: string;
}

const partidosData: Partido[] = [
  // Jornada 15
  {
    id: 'p-001', jornada: 15, local: 'Barcelona SC', abrevLocal: 'BSC', colorLocal: '#FFD700',
    visitante: 'Emelec', abrevVisitante: 'EME', colorVisitante: '#005BAA',
    golLocal: 2, golVisitante: 1, fecha: '2026-05-17', hora: '15:30',
    estadio: 'Estadio Monumental Banco Pichincha', ciudad: 'Guayaquil',
    estado: 'FINALIZADO', arbitro: 'Roberto Sánchez',
  },
  {
    id: 'p-002', jornada: 15, local: 'LDU Quito', abrevLocal: 'LDU', colorLocal: '#FFFFFF',
    visitante: 'El Nacional', abrevVisitante: 'NAC', colorVisitante: '#FF0000',
    golLocal: 1, golVisitante: 0, fecha: '2026-05-17', hora: '18:00',
    estadio: 'Estadio Rodrigo Paz Delgado', ciudad: 'Quito',
    estado: 'FINALIZADO', arbitro: 'Carlos Orbe',
  },
  {
    id: 'p-003', jornada: 15, local: 'Independiente del Valle', abrevLocal: 'IDV', colorLocal: '#C41E3A',
    visitante: 'Aucas', abrevVisitante: 'AUC', colorVisitante: '#FF8C00',
    golLocal: 3, golVisitante: 1, fecha: '2026-05-18', hora: '12:00',
    estadio: 'Estadio Rumiñahui', ciudad: 'Sangolquí',
    estado: 'FINALIZADO', arbitro: 'Guillermo Guerrero',
  },
  {
    id: 'p-004', jornada: 15, local: 'Deportivo Cuenca', abrevLocal: 'DCU', colorLocal: '#C41E3A',
    visitante: 'Mushuc Runa', abrevVisitante: 'MUS', colorVisitante: '#008000',
    golLocal: 0, golVisitante: 0, fecha: '2026-05-18', hora: '15:00',
    estadio: 'Estadio Alejandro Serrano Aguilar', ciudad: 'Cuenca',
    estado: 'FINALIZADO', arbitro: 'Álex Cajas',
  },
  {
    id: 'p-005', jornada: 15, local: 'Delfín', abrevLocal: 'DEL', colorLocal: '#4169E1',
    visitante: 'Técnico Universitario', abrevVisitante: 'TUN', colorVisitante: '#800020',
    golLocal: 2, golVisitante: 2, fecha: '2026-05-18', hora: '17:30',
    estadio: 'Estadio Jocay', ciudad: 'Manta',
    estado: 'FINALIZADO', arbitro: 'Luis Quiroz',
  },
  {
    id: 'p-006', jornada: 15, local: 'Orense', abrevLocal: 'ORE', colorLocal: '#008B8B',
    visitante: 'Guayaquil City', abrevVisitante: 'GCY', colorVisitante: '#6A0DAD',
    golLocal: 1, golVisitante: 0, fecha: '2026-05-19', hora: '12:00',
    estadio: 'Estadio 9 de Mayo', ciudad: 'Machala',
    estado: 'FINALIZADO', arbitro: 'Diego Lara',
  },
  {
    id: 'p-007', jornada: 15, local: 'Cumbayá', abrevLocal: 'CUM', colorLocal: '#2E8B57',
    visitante: 'Universidad Católica', abrevVisitante: 'UCE', colorVisitante: '#0000CD',
    golLocal: null, golVisitante: null, fecha: '2026-05-21', hora: '15:30',
    estadio: 'Estadio Olímpico de Cumbayá', ciudad: 'Cumbayá',
    estado: 'PROGRAMADO', arbitro: 'Por definir',
  },
  {
    id: 'p-008', jornada: 15, local: 'Libertad', abrevLocal: 'LIB', colorLocal: '#228B22',
    visitante: 'Macará', abrevVisitante: 'MAC', colorVisitante: '#4682B4',
    golLocal: null, golVisitante: null, fecha: '2026-05-21', hora: '18:00',
    estadio: 'Estadio Reales Tamarindos', ciudad: 'Loja',
    estado: 'PROGRAMADO', arbitro: 'Por definir',
  },
  // Jornada 14
  {
    id: 'p-009', jornada: 14, local: 'Emelec', abrevLocal: 'EME', colorLocal: '#005BAA',
    visitante: 'LDU Quito', abrevVisitante: 'LDU', colorVisitante: '#FFFFFF',
    golLocal: 1, golVisitante: 1, fecha: '2026-05-10', hora: '15:30',
    estadio: 'Estadio George Capwell', ciudad: 'Guayaquil',
    estado: 'FINALIZADO', arbitro: 'Roberto Sánchez',
  },
  {
    id: 'p-010', jornada: 14, local: 'El Nacional', abrevLocal: 'NAC', colorLocal: '#FF0000',
    visitante: 'Independiente del Valle', abrevVisitante: 'IDV', colorVisitante: '#C41E3A',
    golLocal: 0, golVisitante: 2, fecha: '2026-05-10', hora: '18:00',
    estadio: 'Estadio Olímpico Atahualpa', ciudad: 'Quito',
    estado: 'FINALIZADO', arbitro: 'Carlos Orbe',
  },
  // Jornada 16 (futuros)
  {
    id: 'p-011', jornada: 16, local: 'Emelec', abrevLocal: 'EME', colorLocal: '#005BAA',
    visitante: 'Barcelona SC', abrevVisitante: 'BSC', colorVisitante: '#FFD700',
    golLocal: null, golVisitante: null, fecha: '2026-05-24', hora: '15:30',
    estadio: 'Estadio George Capwell', ciudad: 'Guayaquil',
    estado: 'PROGRAMADO', arbitro: 'Por definir',
  },
  {
    id: 'p-012', jornada: 16, local: 'El Nacional', abrevLocal: 'NAC', colorLocal: '#FF0000',
    visitante: 'LDU Quito', abrevVisitante: 'LDU', colorVisitante: '#FFFFFF',
    golLocal: null, golVisitante: null, fecha: '2026-05-24', hora: '18:00',
    estadio: 'Estadio Olímpico Atahualpa', ciudad: 'Quito',
    estado: 'PROGRAMADO', arbitro: 'Por definir',
  },
];

// Colores de estado
const estadoConfig: Record<string, { bg: string; text: string; label: string; icono: typeof CheckCircle2 }> = {
  FINALIZADO: { bg: '#E5E7EB', text: '#374151', label: 'Finalizado', icono: CheckCircle2 },
  EN_CURSO: { bg: '#DEF7EC', text: '#03543F', label: 'En Curso', icono: PlayCircle },
  PROGRAMADO: { bg: '#DBEAFE', text: '#1E40AF', label: 'Programado', icono: Clock },
  SUSPENDIDO: { bg: '#FEE2E2', text: '#991B1B', label: 'Suspendido', icono: AlertCircle },
};

export default function PaginaFixture() {
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState(15);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    setAnimado(true);
  }, []);

  const jornadasDisponibles = [...new Set(partidosData.map(p => p.jornada))].sort((a, b) => a - b);

  const partidosFiltrados = partidosData.filter((p) => {
    const coincideJornada = p.jornada === jornadaSeleccionada;
    const coincideEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
    const coincideBusqueda =
      busqueda === '' ||
      p.local.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.visitante.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.estadio.toLowerCase().includes(busqueda.toLowerCase());
    return coincideJornada && coincideEstado && coincideBusqueda;
  });

  // Agrupar por fecha
  const partidosPorFecha = partidosFiltrados.reduce<Record<string, Partido[]>>((acc, partido) => {
    if (!acc[partido.fecha]) acc[partido.fecha] = [];
    acc[partido.fecha].push(partido);
    return acc;
  }, {});

  // Resumen de la jornada
  const partidosJornada = partidosData.filter(p => p.jornada === jornadaSeleccionada);
  const finalizados = partidosJornada.filter(p => p.estado === 'FINALIZADO').length;
  const programados = partidosJornada.filter(p => p.estado === 'PROGRAMADO').length;
  const totalGoles = partidosJornada
    .filter(p => p.golLocal !== null)
    .reduce((s, p) => s + (p.golLocal || 0) + (p.golVisitante || 0), 0);

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
              Serie A - LigaPro 2026 • Calendario de partidos
            </p>
          </div>
        </div>
      </div>

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
          style={{ background: 'linear-gradient(135deg, #2980B9, #1F6691)' }}
        >
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Jornada {jornadaSeleccionada}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setJornadaSeleccionada(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <select
              value={jornadaSeleccionada}
              onChange={(e) => setJornadaSeleccionada(Number(e.target.value))}
              className="px-3 py-1 rounded-lg text-sm font-medium border-none outline-none"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                <option key={j} value={j} style={{ color: '#1A1A2E' }}>Jornada {j}</option>
              ))}
            </select>
            <button
              onClick={() => setJornadaSeleccionada(prev => Math.min(30, prev + 1))}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
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
                    {new Date(fecha).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-3">
                  {partidos.map((partido) => {
                    const config = estadoConfig[partido.estado];
                    const IconoEstado = config.icono;

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
                            <span className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>{partido.hora}</span>
                          </div>

                          {/* Equipos */}
                          <div className="flex items-center gap-3 flex-1">
                            {/* Local */}
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="text-sm font-semibold text-right" style={{ color: 'var(--texto-primario)' }}>
                                {partido.local}
                              </span>
                              <div
                                className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                                style={{
                                  width: '32px', height: '32px',
                                  background: partido.colorLocal,
                                  color: partido.colorLocal === '#FFFFFF' || partido.colorLocal === '#FFD700' ? '#1A1A2E' : 'white',
                                  border: partido.colorLocal === '#FFFFFF' ? '2px solid #E5E7EB' : 'none',
                                }}
                              >
                                {partido.abrevLocal}
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
                                {partido.golLocal !== null ? `${partido.golLocal} - ${partido.golVisitante}` : 'vs'}
                              </span>
                            </div>

                            {/* Visitante */}
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                                style={{
                                  width: '32px', height: '32px',
                                  background: partido.colorVisitante,
                                  color: partido.colorVisitante === '#FFFFFF' || partido.colorVisitante === '#FFD700' ? '#1A1A2E' : 'white',
                                  border: partido.colorVisitante === '#FFFFFF' ? '2px solid #E5E7EB' : 'none',
                                }}
                              >
                                {partido.abrevVisitante}
                              </div>
                              <span className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
                                {partido.visitante}
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
                            <button
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              style={{ color: 'var(--ligapro-blue)' }}
                              title="Ver detalle"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Info de estadio */}
                        <div className="flex items-center gap-4 mt-3 ml-[96px]">
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--texto-terciario)' }}>
                            <MapPin size={12} />
                            {partido.estadio}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                            {partido.ciudad}
                          </span>
                          {partido.arbitro !== 'Por definir' && (
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
    </div>
  );
}
