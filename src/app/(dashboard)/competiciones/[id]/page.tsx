'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy, ArrowLeft, TrendingUp, Calendar, BarChart3,
  ChevronLeft, ChevronRight, Star, Target, Users,
  Shield, Award
} from 'lucide-react';

// ============================================
// DATOS DE EJEMPLO - Tabla de Posiciones
// ============================================
interface EquipoPosicion {
  pos: number;
  club: string;
  abreviatura: string;
  color: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

const tablaPosiciones: EquipoPosicion[] = [
  { pos: 1, club: 'Independiente del Valle', abreviatura: 'IDV', color: '#C41E3A', pj: 15, g: 11, e: 2, p: 2, gf: 32, gc: 12, dg: 20, pts: 35 },
  { pos: 2, club: 'Barcelona SC', abreviatura: 'BSC', color: '#FFD700', pj: 15, g: 10, e: 3, p: 2, gf: 28, gc: 14, dg: 14, pts: 33 },
  { pos: 3, club: 'LDU Quito', abreviatura: 'LDU', color: '#FFFFFF', pj: 15, g: 9, e: 4, p: 2, gf: 25, gc: 11, dg: 14, pts: 31 },
  { pos: 4, club: 'Emelec', abreviatura: 'EME', color: '#005BAA', pj: 15, g: 9, e: 2, p: 4, gf: 24, gc: 16, dg: 8, pts: 29 },
  { pos: 5, club: 'Deportivo Cuenca', abreviatura: 'DCU', color: '#C41E3A', pj: 15, g: 8, e: 3, p: 4, gf: 22, gc: 15, dg: 7, pts: 27 },
  { pos: 6, club: 'Aucas', abreviatura: 'AUC', color: '#FF8C00', pj: 15, g: 7, e: 4, p: 4, gf: 20, gc: 17, dg: 3, pts: 25 },
  { pos: 7, club: 'El Nacional', abreviatura: 'NAC', color: '#FF0000', pj: 15, g: 7, e: 3, p: 5, gf: 19, gc: 16, dg: 3, pts: 24 },
  { pos: 8, club: 'Mushuc Runa', abreviatura: 'MUS', color: '#008000', pj: 15, g: 6, e: 5, p: 4, gf: 18, gc: 14, dg: 4, pts: 23 },
  { pos: 9, club: 'Delfín', abreviatura: 'DEL', color: '#4169E1', pj: 15, g: 6, e: 4, p: 5, gf: 17, gc: 16, dg: 1, pts: 22 },
  { pos: 10, club: 'Técnico Universitario', abreviatura: 'TUN', color: '#800020', pj: 15, g: 6, e: 3, p: 6, gf: 16, gc: 18, dg: -2, pts: 21 },
  { pos: 11, club: 'Orense', abreviatura: 'ORE', color: '#008B8B', pj: 15, g: 5, e: 4, p: 6, gf: 15, gc: 19, dg: -4, pts: 19 },
  { pos: 12, club: 'Guayaquil City', abreviatura: 'GCY', color: '#6A0DAD', pj: 15, g: 5, e: 3, p: 7, gf: 14, gc: 20, dg: -6, pts: 18 },
  { pos: 13, club: 'Cumbayá', abreviatura: 'CUM', color: '#2E8B57', pj: 15, g: 4, e: 4, p: 7, gf: 13, gc: 21, dg: -8, pts: 16 },
  { pos: 14, club: 'Universidad Católica', abreviatura: 'UCE', color: '#0000CD', pj: 15, g: 4, e: 3, p: 8, gf: 12, gc: 22, dg: -10, pts: 15 },
  { pos: 15, club: 'Libertad', abreviatura: 'LIB', color: '#228B22', pj: 15, g: 3, e: 2, p: 10, gf: 10, gc: 26, dg: -16, pts: 11 },
  { pos: 16, club: 'Macará', abreviatura: 'MAC', color: '#4682B4', pj: 15, g: 2, e: 3, p: 10, gf: 9, gc: 27, dg: -18, pts: 9 },
];

// Datos de fixture por jornada
interface Partido {
  id: string;
  local: string;
  visitante: string;
  golLocal: number | null;
  golVisitante: number | null;
  fecha: string;
  hora: string;
  estadio: string;
  estado: 'FINALIZADO' | 'EN_CURSO' | 'PROGRAMADO';
}

const fixtureJornadas: Record<number, Partido[]> = {
  15: [
    { id: '1', local: 'Barcelona SC', visitante: 'Emelec', golLocal: 2, golVisitante: 1, fecha: '2026-05-17', hora: '15:30', estadio: 'Monumental', estado: 'FINALIZADO' },
    { id: '2', local: 'LDU Quito', visitante: 'El Nacional', golLocal: 1, golVisitante: 0, fecha: '2026-05-17', hora: '18:00', estadio: 'Rodrigo Paz Delgado', estado: 'FINALIZADO' },
    { id: '3', local: 'Independiente del Valle', visitante: 'Aucas', golLocal: 3, golVisitante: 1, fecha: '2026-05-18', hora: '12:00', estadio: 'Rumiñahui', estado: 'FINALIZADO' },
    { id: '4', local: 'Deportivo Cuenca', visitante: 'Mushuc Runa', golLocal: 0, golVisitante: 0, fecha: '2026-05-18', hora: '15:00', estadio: 'Alejandro Serrano Aguilar', estado: 'FINALIZADO' },
    { id: '5', local: 'Delfín', visitante: 'Técnico Universitario', golLocal: 2, golVisitante: 2, fecha: '2026-05-18', hora: '17:30', estadio: 'Jocay', estado: 'FINALIZADO' },
    { id: '6', local: 'Orense', visitante: 'Guayaquil City', golLocal: 1, golVisitante: 0, fecha: '2026-05-19', hora: '12:00', estadio: '9 de Mayo', estado: 'FINALIZADO' },
    { id: '7', local: 'Cumbayá', visitante: 'Universidad Católica', golLocal: null, golVisitante: null, fecha: '2026-05-21', hora: '15:30', estadio: 'Olímpico de Cumbayá', estado: 'PROGRAMADO' },
    { id: '8', local: 'Libertad', visitante: 'Macará', golLocal: null, golVisitante: null, fecha: '2026-05-21', hora: '18:00', estadio: 'Reales Tamarindos', estado: 'PROGRAMADO' },
  ],
  14: [
    { id: '9', local: 'Emelec', visitante: 'LDU Quito', golLocal: 1, golVisitante: 1, fecha: '2026-05-10', hora: '15:30', estadio: 'George Capwell', estado: 'FINALIZADO' },
    { id: '10', local: 'El Nacional', visitante: 'Independiente del Valle', golLocal: 0, golVisitante: 2, fecha: '2026-05-10', hora: '18:00', estadio: 'Olímpico Atahualpa', estado: 'FINALIZADO' },
    { id: '11', local: 'Aucas', visitante: 'Barcelona SC', golLocal: 1, golVisitante: 3, fecha: '2026-05-11', hora: '12:00', estadio: 'Gonzalo Pozo Ripalda', estado: 'FINALIZADO' },
    { id: '12', local: 'Mushuc Runa', visitante: 'Delfín', golLocal: 2, golVisitante: 0, fecha: '2026-05-11', hora: '15:00', estadio: 'La Cocha', estado: 'FINALIZADO' },
  ],
};

// Goleadores
interface Goleador {
  nombre: string;
  club: string;
  goles: number;
  asistencias: number;
}

const goleadores: Goleador[] = [
  { nombre: 'Junior Sornoza', club: 'Independiente del Valle', goles: 12, asistencias: 5 },
  { nombre: 'Damián Díaz', club: 'Barcelona SC', goles: 10, asistencias: 7 },
  { nombre: 'Facundo Martínez', club: 'LDU Quito', goles: 9, asistencias: 3 },
  { nombre: 'Jhoanner Chávez', club: 'Emelec', goles: 8, asistencias: 4 },
  { nombre: 'Bryan Caicedo', club: 'Deportivo Cuenca', goles: 7, asistencias: 2 },
  { nombre: 'Álex Arce', club: 'El Nacional', goles: 7, asistencias: 1 },
  { nombre: 'Steven Tapiero', club: 'Aucas', goles: 6, asistencias: 3 },
  { nombre: 'Jonathan Betancourt', club: 'Mushuc Runa', goles: 6, asistencias: 6 },
  { nombre: 'Luis Amarilla', club: 'Delfín', goles: 5, asistencias: 2 },
  { nombre: 'Fernando Gaibor', club: 'Técnico Universitario', goles: 5, asistencias: 4 },
];

// Asistidores top
interface Asistidor {
  nombre: string;
  club: string;
  asistencias: number;
}

const asistidores: Asistidor[] = [
  { nombre: 'Damián Díaz', club: 'Barcelona SC', asistencias: 7 },
  { nombre: 'Jonathan Betancourt', club: 'Mushuc Runa', asistencias: 6 },
  { nombre: 'Junior Sornoza', club: 'Independiente del Valle', asistencias: 5 },
  { nombre: 'Lorenzo Faravelli', club: 'LDU Quito', asistencias: 5 },
  { nombre: 'Fernando Gaibor', club: 'Técnico Universitario', asistencias: 4 },
  { nombre: 'Jhoanner Chávez', club: 'Emelec', asistencias: 4 },
  { nombre: 'Dixon Arroyo', club: 'Deportivo Cuenca', asistencias: 3 },
  { nombre: 'Steven Tapiero', club: 'Aucas', asistencias: 3 },
];

type TabDetalle = 'posiciones' | 'fixture' | 'estadisticas';

export default function PaginaDetalleCompeticion() {
  const [tabActiva, setTabActiva] = useState<TabDetalle>('posiciones');
  const [jornadaActual, setJornadaActual] = useState(15);
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    setAnimado(true);
  }, []);

  const partidosJornada = fixtureJornadas[jornadaActual] || [];

  const tabs: { valor: TabDetalle; etiqueta: string; icono: typeof TrendingUp }[] = [
    { valor: 'posiciones', etiqueta: 'Tabla de Posiciones', icono: TrendingUp },
    { valor: 'fixture', etiqueta: 'Fixture', icono: Calendar },
    { valor: 'estadisticas', etiqueta: 'Estadísticas', icono: BarChart3 },
  ];

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

        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
          }}
        >
          <div
            className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ background: 'linear-gradient(135deg, #D4A843, #B8922F)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)' }}
              >
                <Trophy size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Serie A - LigaPro 2026</h1>
                <p className="text-white/70 text-sm mt-0.5">Primera División • Fase Uno • Jornada 15 de 30</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <Users size={14} />
                16 equipos
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: '#DEF7EC', color: '#03543F' }}
              >
                Activa
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 pb-0 overflow-x-auto">
            {tabs.map((tab) => {
              const Icono = tab.icono;
              return (
                <button
                  key={tab.valor}
                  onClick={() => setTabActiva(tab.valor)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg border-b-2"
                  style={{
                    color: tabActiva === tab.valor ? '#D4A843' : 'var(--texto-secundario)',
                    borderBottomColor: tabActiva === tab.valor ? '#D4A843' : 'transparent',
                    background: tabActiva === tab.valor ? '#FEF3C7' : 'transparent',
                  }}
                >
                  <Icono size={16} />
                  {tab.etiqueta}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ TAB: TABLA DE POSICIONES ============ */}
      {tabActiva === 'posiciones' && (
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3.5"
            style={{ background: 'linear-gradient(135deg, #1B2A4A, #111D35)' }}
          >
            <TrendingUp size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Tabla de Posiciones - Fase Uno</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--fondo-principal)', borderBottom: '1px solid var(--borde-suave)' }}>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Pos</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Club</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>PJ</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>G</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>E</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>P</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>GF</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>GC</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>DG</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {tablaPosiciones.map((equipo) => {
                  const esZonaClasificacion = equipo.pos === 1;
                  const esZonaDescenso = equipo.pos >= 15;

                  let fondoFila = 'transparent';
                  let bordeIzquierdo = 'none';
                  if (esZonaClasificacion) {
                    fondoFila = 'rgba(212, 168, 67, 0.08)';
                    bordeIzquierdo = '4px solid #D4A843';
                  } else if (esZonaDescenso) {
                    fondoFila = 'rgba(192, 57, 43, 0.06)';
                    bordeIzquierdo = '4px solid #C0392B';
                  }

                  return (
                    <tr
                      key={equipo.pos}
                      className="transition-colors hover:bg-gray-50"
                      style={{
                        background: fondoFila,
                        borderBottom: '1px solid var(--borde-suave)',
                        borderLeft: bordeIzquierdo,
                      }}
                    >
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: esZonaClasificacion ? '#D4A843' : esZonaDescenso ? '#C0392B' : 'var(--fondo-principal)',
                            color: esZonaClasificacion || esZonaDescenso ? 'white' : 'var(--texto-primario)',
                          }}
                        >
                          {equipo.pos}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                            style={{
                              width: '32px',
                              height: '32px',
                              background: equipo.color,
                              border: equipo.color === '#FFFFFF' ? '2px solid #E5E7EB' : 'none',
                              color: equipo.color === '#FFFFFF' || equipo.color === '#FFD700' ? '#1A1A2E' : 'white',
                            }}
                          >
                            {equipo.abreviatura}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--texto-primario)' }}>
                            {equipo.club}
                          </span>
                          {esZonaClasificacion && <Star size={14} style={{ color: '#D4A843' }} />}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center" style={{ color: 'var(--texto-secundario)' }}>{equipo.pj}</td>
                      <td className="px-3 py-3 text-center font-medium" style={{ color: '#27AE60' }}>{equipo.g}</td>
                      <td className="px-3 py-3 text-center" style={{ color: 'var(--texto-secundario)' }}>{equipo.e}</td>
                      <td className="px-3 py-3 text-center" style={{ color: '#C0392B' }}>{equipo.p}</td>
                      <td className="px-3 py-3 text-center" style={{ color: 'var(--texto-secundario)' }}>{equipo.gf}</td>
                      <td className="px-3 py-3 text-center" style={{ color: 'var(--texto-secundario)' }}>{equipo.gc}</td>
                      <td className="px-3 py-3 text-center font-medium" style={{ color: equipo.dg > 0 ? '#27AE60' : equipo.dg < 0 ? '#C0392B' : 'var(--texto-secundario)' }}>
                        {equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center text-sm font-bold" style={{ color: 'var(--texto-primario)' }}>
                          {equipo.pts}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div className="px-5 py-3 flex items-center gap-6" style={{ borderTop: '1px solid var(--borde-suave)', background: 'var(--fondo-principal)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#D4A843' }} />
              <span className="text-xs" style={{ color: 'var(--texto-secundario)' }}>Zona de clasificación (Libertadores)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#C0392B' }} />
              <span className="text-xs" style={{ color: 'var(--texto-secundario)' }}>Zona de descenso</span>
            </div>
          </div>
        </div>
      )}

      {/* ============ TAB: FIXTURE ============ */}
      {tabActiva === 'fixture' && (
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ background: 'linear-gradient(135deg, #2980B9, #1F6691)' }}
          >
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-white" />
              <h2 className="text-white font-semibold text-sm">Fixture - Jornada {jornadaActual}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setJornadaActual(Math.max(1, jornadaActual - 1))}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                disabled={jornadaActual <= 1}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-white text-sm font-medium px-3">
                Jornada {jornadaActual}
              </span>
              <button
                onClick={() => setJornadaActual(Math.min(30, jornadaActual + 1))}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                disabled={jornadaActual >= 30}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {partidosJornada.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar size={40} style={{ color: 'var(--texto-terciario)' }} />
                <p className="text-sm font-medium mt-3" style={{ color: 'var(--texto-secundario)' }}>
                  No hay partidos para esta jornada
                </p>
              </div>
            ) : (
              partidosJornada.map((partido) => (
                <div
                  key={partido.id}
                  className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-gray-50"
                  style={{
                    border: '1px solid var(--borde-suave)',
                    background: partido.estado === 'EN_CURSO' ? 'rgba(39, 174, 96, 0.04)' : 'transparent',
                  }}
                >
                  {/* Fecha y hora */}
                  <div className="text-center min-w-[80px]">
                    <p className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>
                      {new Date(partido.fecha).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--texto-terciario)' }}>{partido.hora}</p>
                  </div>

                  {/* Equipos y marcador */}
                  <div className="flex items-center gap-4 flex-1 justify-center">
                    <span className="text-sm font-semibold text-right flex-1" style={{ color: 'var(--texto-primario)' }}>
                      {partido.local}
                    </span>
                    <div
                      className="flex items-center justify-center rounded-lg px-3 py-1.5 min-w-[60px]"
                      style={{
                        background: partido.estado === 'FINALIZADO' ? 'var(--ligapro-navy)' : 'var(--fondo-principal)',
                        color: partido.estado === 'FINALIZADO' ? 'white' : 'var(--texto-secundario)',
                      }}
                    >
                      <span className="text-sm font-bold">
                        {partido.golLocal !== null ? `${partido.golLocal} - ${partido.golVisitante}` : 'vs'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-left flex-1" style={{ color: 'var(--texto-primario)' }}>
                      {partido.visitante}
                    </span>
                  </div>

                  {/* Estado y estadio */}
                  <div className="text-right min-w-[120px]">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: partido.estado === 'FINALIZADO' ? '#E5E7EB' : partido.estado === 'EN_CURSO' ? '#DEF7EC' : '#DBEAFE',
                        color: partido.estado === 'FINALIZADO' ? '#374151' : partido.estado === 'EN_CURSO' ? '#03543F' : '#1E40AF',
                      }}
                    >
                      {partido.estado === 'FINALIZADO' ? 'Finalizado' : partido.estado === 'EN_CURSO' ? 'En curso' : 'Programado'}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--texto-terciario)' }}>{partido.estadio}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============ TAB: ESTADÍSTICAS ============ */}
      {tabActiva === 'estadisticas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Goleadores */}
          <div
            className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
            style={{
              background: 'var(--fondo-tarjeta)',
              boxShadow: 'var(--sombra-tarjeta)',
              border: '1px solid var(--borde-suave)',
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3.5"
              style={{ background: 'linear-gradient(135deg, #D4A843, #B8922F)' }}
            >
              <Target size={18} className="text-white" />
              <h2 className="text-white font-semibold text-sm">Goleadores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--fondo-principal)', borderBottom: '1px solid var(--borde-suave)' }}>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Jugador</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Club</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Goles</th>
                  </tr>
                </thead>
                <tbody>
                  {goleadores.map((g, i) => (
                    <tr key={i} className="transition-colors hover:bg-gray-50" style={{ borderBottom: '1px solid var(--borde-suave)' }}>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            width: '24px',
                            height: '24px',
                            background: i === 0 ? '#D4A843' : i === 1 ? '#A0AEC0' : i === 2 ? '#CD7F32' : 'var(--fondo-principal)',
                            color: i < 3 ? 'white' : 'var(--texto-secundario)',
                          }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--texto-primario)' }}>
                        {g.nombre}
                        {i === 0 && <Award size={14} className="inline ml-1.5" style={{ color: '#D4A843' }} />}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{g.club}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#FEF3C7', color: '#92400E' }}>
                          {g.goles}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asistidores */}
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
            <div
              className="flex items-center gap-3 px-5 py-3.5"
              style={{ background: 'linear-gradient(135deg, #2980B9, #1F6691)' }}
            >
              <Shield size={18} className="text-white" />
              <h2 className="text-white font-semibold text-sm">Asistencias</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--fondo-principal)', borderBottom: '1px solid var(--borde-suave)' }}>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Jugador</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Club</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Asist.</th>
                  </tr>
                </thead>
                <tbody>
                  {asistidores.map((a, i) => (
                    <tr key={i} className="transition-colors hover:bg-gray-50" style={{ borderBottom: '1px solid var(--borde-suave)' }}>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            width: '24px',
                            height: '24px',
                            background: i === 0 ? '#2980B9' : i === 1 ? '#A0AEC0' : i === 2 ? '#CD7F32' : 'var(--fondo-principal)',
                            color: i < 3 ? 'white' : 'var(--texto-secundario)',
                          }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--texto-primario)' }}>
                        {a.nombre}
                        {i === 0 && <Award size={14} className="inline ml-1.5" style={{ color: '#2980B9' }} />}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{a.club}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                          {a.asistencias}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
